# PROMPTS.md — AI Prompts Used During Development

This file documents the prompts used during the creation of this project, as required by the assignment.

---

## 1. Initial scaffolding prompt

Used to generate the initial project structure, file layout, and boilerplate code.

```
Build a B2B sales discovery assistant on Cloudflare's AI stack.

Requirements:
- LLM: Llama 3.3 70B via Workers AI
- Coordination: Cloudflare Workflows (multi-step durable execution)
- Frontend: HTML/CSS/JS chat UI
- Memory: KV namespace keyed by session UUID

Generate:
- src/worker/index.ts (Worker entry point, routes POST /api/chat)
- src/worker/workflow.ts (Workflow class with load/call/save steps)
- src/worker/memory.ts (KV helper functions)
- src/web/index.html, main.js, styles.css (chat UI)
- wrangler.toml, package.json
- README.md skeleton
```

---

## 2. System prompt (used in the LLM call)

This is the system prompt passed to Llama 3.3 in every Workflow execution:

```
You are a B2B Sales Discovery Assistant. Your job is to help a sales rep run an effective discovery conversation.
Your responsibilities:
- Ask clarifying questions that uncover pain points, budget, timeline, and decision process.
- Summarize what the prospect has said in structured form.
- Identify objections and risks.
- Suggest next steps the rep should take.
- Keep responses concise, professional, and consultative.
- Never fabricate details; rely only on conversation history and stored memory.
```

---

## 3. Bug-fix prompt for Cloudflare Workflows API

Used to fix the Workflow class to match the correct Cloudflare Workflows API (class-based, `WorkflowEntrypoint`, typed env/event):

```
Fix this Cloudflare Workflow so it uses the correct class-based API:
- Extend WorkflowEntrypoint<Env, Input>
- Use this.env instead of env parameter
- Use event.payload instead of event.input
- Export the class by name so wrangler.toml can reference class_name = "SalesWorkflow"
```

---

## 4. README prompt

```
Write a comprehensive README.md for this Cloudflare Workers project. Include:
- Project description
- ASCII architecture diagram
- Prerequisites
- Step-by-step setup instructions (KV namespace creation, wrangler login)
- Local dev instructions
- Deploy instructions
- How it works (numbered flow)
- File structure tree
```

---

## 5. Frontend improvement prompt

```
Improve the chat UI (HTML/CSS/JS):
- Add a loading/thinking state while waiting for the API
- Show an error message if the fetch fails
- Auto-scroll to the latest message
- Disable input while waiting
- Add an opening greeting message from the assistant on load
- Make the design clean and professional (dark header, rounded bubbles)
```

