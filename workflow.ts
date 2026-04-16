import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { loadMemory, saveMemory } from "./memory";

const SYSTEM_PROMPT = `You are a B2B Sales Discovery Assistant helping a sales rep run an effective discovery call.

Your responsibilities:
- Ask targeted questions to uncover pain points, budget, timeline, and the decision-making process.
- After the prospect responds, summarize what you've learned in a structured way.
- Flag potential objections or risks you notice.
- Suggest a concrete next step the sales rep should take.
- Keep responses concise, consultative, and professional.
- Never fabricate information — rely only on what has been shared in the conversation.

Format: Respond naturally as the assistant. When you have enough information, end with a short "Suggested next step:" line.`;

interface Env {
  SALES_KV: KVNamespace;
  AI: Ai;
}

interface WorkflowInput {
  sessionId: string;
  message: string;
}

interface Memory {
  conversation: { role: "user" | "assistant"; content: string }[];
  prospect: Record<string, unknown>;
}

export class SalesWorkflow extends WorkflowEntrypoint<Env, WorkflowInput> {
  async run(event: WorkflowEvent<WorkflowInput>, step: WorkflowStep) {
    const { sessionId, message } = event.payload;

    // Step 1: Load conversation history from KV
    const memory = await step.do("load-memory", async () => {
      return loadMemory(this.env, sessionId);
    });

    // Step 2: Add user message to conversation
    memory.conversation.push({ role: "user", content: message });

    // Step 3: Call Workers AI (Llama 3.3 70B)
    const reply = await step.do("call-llm", async () => {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...memory.conversation
      ];
      const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages
      }) as { response: string };  // Added type assertion
      return response.response;
    });

    // Step 4: Add assistant reply to conversation
    memory.conversation.push({ role: "assistant", content: reply });

    // Step 5: Save updated conversation back to KV
    await step.do("save-memory", async () => {
      return saveMemory(this.env, sessionId, memory);
    });

    return { reply };
  }
}