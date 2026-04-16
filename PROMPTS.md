# PROMPTS.md

AI prompts used during development of this project.

---

## 1. Project scaffolding

```
Build a B2B sales discovery assistant on Cloudflare's AI stack with these components:
- LLM: Llama 3.3 70B via Workers AI
- Workflow coordination: Cloudflare Workflows (class-based WorkflowEntrypoint)
- Memory: KV Namespace keyed by session UUID
- Frontend: HTML/CSS/JS chat UI served via Workers Assets

Generate all source files including wrangler.toml, tsconfig.json, package.json,
.gitignore, README.md, and PROMPTS.md.
```

---

## 2. LLM system prompt (used inside workflow.ts)

```
You are a B2B Sales Discovery Assistant helping a sales rep run an effective discovery call.

Your responsibilities:
- Ask targeted questions to uncover pain points, budget, timeline, and the decision-making process.
- After the prospect responds, summarize what you've learned in a structured way.
- Flag potential objections or risks you notice.
- Suggest a concrete next step the sales rep should take.
- Keep responses concise, consultative, and professional.
- Never fabricate information — rely only on what has been shared in the conversation.

Format: Respond naturally as the assistant. When you have enough information,
end with a short "Suggested next step:" line.
```

---

## 3. Workflow API fix

```
Fix the Cloudflare Workflow class to use the correct API:
- Extend WorkflowEntrypoint<Env, Input>
- Access bindings via this.env (not a function parameter)
- Use event.payload (not event.input)
- Export the class by name so wrangler.toml class_name binding works
```

---

## 4. Frontend improvements

```
Improve the chat UI:
- Auto-resizing textarea (grows with content, max ~140px)
- Animated typing indicator (three bouncing dots) while waiting for a response
- Disable input and send button while a request is in flight
- Error state bubble if the fetch fails
- Auto-scroll to latest message
- Show an opening greeting from the assistant on page load
- Use sessionStorage so the session ID survives accidental re-renders
  but resets on a fresh tab/refresh
```

---

## 5. README and setup instructions

```
Write a README.md that includes:
- One-line project description
- Architecture diagram (ASCII + table)
- Step-by-step local setup (wrangler login, KV namespace creation, dev server)
- Deploy instructions
- File structure tree
```
