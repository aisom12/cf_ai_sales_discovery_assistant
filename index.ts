import { SalesWorkflow } from "./workflow";

export { SalesWorkflow };

interface Env {
  SALES_WORKFLOW: Workflow;
}

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
    const sessionId = 'test-session'; // Or generate dynamically
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

    // Serve API route
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const { sessionId, message } = await request.json<{
        sessionId: string;
        message: string;
      }>();

      if (!sessionId || !message) {
        return Response.json({ error: "Missing sessionId or message" }, { status: 400 });
      }

      const instance = await env.SALES_WORKFLOW.create({
        params: { sessionId, message },
      });

      // Poll until the workflow step completes
      let status = await instance.status();
      while (status.status !== "complete" && status.status !== "errored") {
        await new Promise((r) => setTimeout(r, 400));
        status = await instance.status();
      }

      if (status.status === "errored") {
        return Response.json({ error: "Workflow failed" }, { status: 500 });
      }

      return Response.json(status.output);
    }

    return new Response("Not Found", { status: 404 });
  },
};


