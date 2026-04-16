interface Memory {
  conversation: { role: "user" | "assistant"; content: string }[];
  prospect: Record<string, unknown>;
}

export async function loadMemory(env: any, sessionId: string): Promise<Memory> {
  const raw = await env.SALES_KV.get(sessionId);
  if (!raw) {
    return { conversation: [], prospect: {} };
  }
  return JSON.parse(raw);
}

export async function saveMemory(env: any, sessionId: string, memory: Memory) {
  await env.SALES_KV.put(sessionId, JSON.stringify(memory));
}
