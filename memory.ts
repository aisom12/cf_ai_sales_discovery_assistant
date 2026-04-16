declare type KVNamespace = import("@cloudflare/workers-types").KVNamespace;

interface Env {
  SALES_KV: KVNamespace;
}

interface Memory {
  conversation: { role: "user" | "assistant"; content: string }[];
  prospect: Record<string, unknown>;
}

export async function loadMemory(env: Env, sessionId: string): Promise<Memory> {
  return (await env.SALES_KV.get<Memory>(sessionId, "json")) ?? {
    conversation: [],
    prospect: {},
  };
}

export async function saveMemory(env: Env, sessionId: string, memory: Memory) {
  await env.SALES_KV.put(sessionId, JSON.stringify(memory));
}
