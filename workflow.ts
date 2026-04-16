import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";

const SYSTEM_PROMPT = `...`;

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
}

export class SalesWorkflow extends WorkflowEntrypoint<Env, WorkflowInput> {
  async run(event: WorkflowEvent<WorkflowInput>, step: WorkflowStep) {
    const { sessionId, message } = event.payload;

    const memory = await step.do("load-memory", async () => {
      const stored = await this.env.SALES_KV.get<Memory>(sessionId, "json");
      return stored ?? { conversation: [] };
    });

    const reply = await step.do("call-llm", async () => {
      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...memory.conversation,
            { role: "user", content: message },
          ],
        }
      );
      return (response as { response: string }).response;
    });

    await step.do("save-memory", async () => {
      const updated: Memory = {
        conversation: [
          ...memory.conversation,
          { role: "user", content: message },
          { role: "assistant", content: reply },
        ],
      };
      await this.env.SALES_KV.put(sessionId, JSON.stringify(updated));
    });

    return { reply };
  }
}
