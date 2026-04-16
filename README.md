# cf_ai_sales_discovery_assistant

An AI-powered B2B sales discovery assistant built entirely on Cloudflare's AI-native stack. It guides sales reps through structured discovery conversations — surfacing pain points, budget signals, objections, and next steps — with full conversation memory per session.

## Live demo

Deploy with `npm run deploy` and open the generated `*.workers.dev` URL.

## Architecture

```
Browser (HTML/CSS/JS)
       │  POST /api/chat
       ▼
Worker (index.ts)
       │  triggers
       ▼
Cloudflare Workflow (SalesWorkflow)
       ├── Step 1: Load history  → KV
       ├── Step 2: Call LLM      → Workers AI (Llama 3.3 70B)
       └── Step 3: Save history  → KV
```

| Component | Cloudflare product |
|---|---|
| LLM | Workers AI — `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Workflow / coordination | Cloudflare Workflows |
| Memory / state | KV Namespace (keyed by session UUID) |
| Frontend | Static assets via Workers Assets |

## Prerequisites

- Node.js 18+
- A free Cloudflare account

## Setup & running locally

```bash
# 1. Install dependencies
npm install

# 2. Log in to Cloudflare
npx wrangler login

# 3. Create KV namespaces
npx wrangler kv namespace create SALES_KV
npx wrangler kv namespace create SALES_KV --preview

# 4. Paste the IDs printed above into wrangler.toml
#    kv_namespaces = [{ binding = "SALES_KV", id = "...", preview_id = "..." }]

# 5. Run locally
npm run dev
# Open http://localhost:8787
```

## Deploy

```bash
npm run deploy
```

Wrangler prints a live `*.workers.dev` URL when done.

## Project structure

```
cf_ai_sales_discovery_assistant/
├── src/
│   ├── worker/
│   │   ├── index.ts       # Fetch handler, polls Workflow result
│   │   └── workflow.ts    # SalesWorkflow — load / call LLM / save
│   └── web/
│       ├── index.html     # Chat UI shell
│       ├── main.js        # Frontend logic (fetch, rendering)
│       └── styles.css     # UI styles
├── wrangler.toml          # Cloudflare bindings config
├── tsconfig.json
├── package.json
├── .gitignore
├── README.md
└── PROMPTS.md
```
