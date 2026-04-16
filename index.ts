export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { sessionId, message } = await request.json();

    const result = await env.SALES_WORKFLOW.create({
      input: { sessionId, message }
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

export { SalesWorkflow } from "./workflow";



