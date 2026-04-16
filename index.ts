import { loadMemory, saveMemory } from "./memory";
import { SalesWorkflow } from "./workflow";

interface Env {
  SALES_KV: KVNamespace;
  AI: Ai;
  SALES_WORKFLOW: any;
}

const SYSTEM_PROMPT = `You are a B2B Sales Discovery Assistant helping a sales rep run an effective discovery call.

Your responsibilities:
- Ask targeted questions to uncover pain points, budget, timeline, and the decision-making process.
- After the prospect responds, summarize what you've learned in a structured way.
- Flag potential objections or risks you notice.
- Suggest a concrete next step the sales rep should take.
- Keep responses concise, consultative, and professional.
- Never fabricate information — rely only on what has been shared in the conversation.

Format: Respond naturally as the assistant. When you have enough information, end with a short "Suggested next step:" line.`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales Discovery Assistant</title>
</head>
<body>
  <h1>Sales Chat</h1>
  <div id="chat"></div>
  <input id="message" type="text" placeholder="Type your message">
  <button onclick="sendMessage()">Send</button>
  <script>
    const sessionId = 'test-session';
    async function sendMessage() {
      const message = document.getElementById('message').value;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message })
      });
      const data = await response.json();
      document.getElementById('chat').innerHTML += \`<p>You: \${message}</p><p>Assistant: \${data.reply}</p>\`;
    }
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const body = await request.json() as { sessionId: string; message: string };
        const { sessionId, message } = body;

        if (!sessionId || !message) {
          return Response.json({ error: "Missing sessionId or message" }, { status: 400 });
        }

        const memory = await loadMemory(env, sessionId);
        console.log("MEMORY LOADED:", JSON.stringify(memory, null, 2));
        memory.conversation.push({ role: "user", content: message });

        const messages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...memory.conversation
        ];

        // ⭐ ADDED LOGGING HERE
        console.log("MESSAGES SENT TO AI:", JSON.stringify(messages, null, 2));

        const ai = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });

        console.log("AI raw response:", ai);

        const reply =
          (ai as any).response ||
          (ai as any).result?.response ||
          (ai as any).result ||
          (ai as any).output_text ||
          "I'm here and ready to help!";

        memory.conversation.push({ role: "assistant", content: reply });
        await saveMemory(env, sessionId, memory);

        return Response.json({ reply });

      } catch (error) {
        console.error("ERROR:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

export { SalesWorkflow };
