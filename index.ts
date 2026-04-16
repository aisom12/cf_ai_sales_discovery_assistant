import { SalesWorkflow } from "./workflow";

export { SalesWorkflow };

interface Env {
  SALES_WORKFLOW: Workflow;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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


