# CF AI Sales Discovery Assistant

An AI-powered B2B sales discovery assistant built on Cloudflare Workers, using Llama 3.3 for intelligent conversation and KV for session memory.

## Features
- Real-time chat interface for sales discovery calls
- AI-powered responses using Llama 3.3 70B model
- Persistent conversation memory via Workers KV
- Structured prospect data tracking

## Setup

### Prerequisites
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`

### Installation
```bash
git clone <your-repo>
cd cf_ai_sales_discovery_assistant
npm install
```

## Running Locally

### Step 1: Install Dependencies
npm install

### Step 2: Log in to Cloudflare
npx wrangler login

### Step 3: Create KV Namespaces
npx wrangler kv namespace create SALES_KV
npx wrangler kv namespace create SALES_KV --preview

### Step 4: Paste the IDs printed above into wrangler.toml
#    kv_namespaces = [{ binding = "SALES_KV", id = "...", preview_id = "..." }]

### Step 5: Run Locally
npm run dev
# Open http://localhost:8787

## Deploy

```bash
npm run deploy
```

Wrangler prints a live `*.workers.dev` URL when done.

## Project Structure

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
