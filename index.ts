interface Env {
  SALES_WORKFLOW: Workflow;
}

interface WorkflowResponse {
  reply: string;
}

interface FetchRequest {
  sessionId: string;
  message: string;
}

interface Workflow {
  create(options: { input: FetchRequest }): Promise<WorkflowResponse>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { sessionId, message }: FetchRequest = await request.json();

    const result: WorkflowResponse = await env.SALES_WORKFLOW.create({
      input: { sessionId, message }
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

export { SalesWorkflow } from "./workflow";



