// global.d.ts
declare module "cloudflare:workers" {
  export type KVNamespace = import("@cloudflare/workers-types").KVNamespace;

  export interface Ai {
    run(model: string, options: any): Promise<any>;
  }

  export interface WorkflowEvent<Payload> {
    payload: Payload;
  }

  export interface WorkflowStep {
    do<T>(name: string, fn: () => Promise<T>): Promise<T>;
  }

  export abstract class WorkflowEntrypoint<Env, Input> {
    env: Env;
    abstract run(event: WorkflowEvent<Input>, step: WorkflowStep): Promise<any>;
  }
}