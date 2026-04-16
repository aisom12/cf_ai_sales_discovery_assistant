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

export class SalesWorkflow extends WorkflowEntrypoint<Env, WorkflowInput> {
  async run(event: WorkflowEvent<WorkflowInput>, step: WorkflowStep) {
    const { sessionId, message } = event.payload;

    const memory = await step.do("load-memory", async () => {
      return loadMemory(this.env, sessionId);
    });

    memory.conversation.push({ role: "user", content: message });

    const reply = await step.do("call-llm", async () => {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...memory.conversation
      ];

      const response = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });

      console.log("Workflow AI raw:", response);

      return (
        (response as any).response ||
        (response as any).result?.response ||
        (response as any).result ||
        (response as any).output_text ||
        "I'm here and ready to help!"
      );
    });

    memory.conversation.push({ role: "assistant", content: reply });

    await step.do("save-memory", async () => {
      return saveMemory(this.env, sessionId, memory);
    });

    return { reply };
  }
}
