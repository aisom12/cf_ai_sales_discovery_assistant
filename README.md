An AI-powered B2B sales discovery assistant built on Cloudflare's AI-native stack. It helps sales reps run structured discovery calls by asking probing questions, identifying objections, and suggesting next steps — all backed by persistent conversation memory.

## Architecture

```
Browser (Pages/Assets)
    │
    ▼
Worker (index.ts)           ← HTTP entry point, routes /api/chat
    │
    ▼
Cloudflare Workflow          ← Durable execution, retries, steps
(SalesWorkflow class)
    ├── Step 1: Load memory from KV
    ├── Step 2: Call Workers AI (Llama 3.3 70B)
    └── Step 3: Save updated memory to KV
```

**Components:**
- **LLM**: Llama 3.3 70B via [Workers AI](https://developers.cloudflare.com/workers-ai/)
- **Workflow / Coordination**: [Cloudflare Workflows](https://developers.cloudflare.com/workflows/) — durable multi-step execution
- **Memory / State**: [KV Namespace](https://developers.cloudflare.com/kv/) — persists conversation history per session UUID
- **Frontend**: Static HTML/CSS/JS served via [Workers Assets](https://developers.cloudflare.com/workers/static-assets/)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
- A Cloudflare account (free tier works)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cf_ai_sales_discovery_assistant.git
cd cf_ai_sales_discovery_assistant
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create a KV namespace

```bash
wrangler kv namespace create SALES_KV
```

Copy the `id` from the output and paste it into `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "SALES_KV", id = "PASTE_YOUR_ID_HERE" }
]
```

For local dev, also add a preview namespace:

```bash
wrangler kv namespace create SALES_KV --preview
```

And add the preview id:

```toml
kv_namespaces = [
  { binding = "SALES_KV", id = "YOUR_PROD_ID", preview_id = "YOUR_PREVIEW_ID" }
]
```

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:8787](http://localhost:8787) in your browser.

The assistant will greet you. Type a message about a prospect you're working with and press Enter.

---

## Deploy to Cloudflare

```bash
npm run deploy
```

Wrangler will output a `*.workers.dev` URL. Open it to use the live app.

---

## How It Works

1. The browser generates a random `sessionId` (UUID) on page load.
2. Each message POST to `/api/chat` carries `{ sessionId, message }`.
3. The Worker triggers a new Workflow instance with those inputs.
4. The Workflow:
   - Loads the full conversation history from KV (keyed by `sessionId`)
   - Calls Llama 3.3 70B with the system prompt + history + new message
   - Saves the updated history back to KV
   - Returns `{ reply: "..." }`
5. The Worker polls the Workflow until complete, then returns the reply to the browser.

---

## File Structure

```
cf_ai_sales_discovery_assistant/
├── src/
│   ├── worker/
│   │   ├── index.ts       # Worker entry point + fetch handler
│   │   ├── workflow.ts    # SalesWorkflow class (Cloudflare Workflows)
│   │   └── memory.ts      # KV load/save helpers
│   └── web/
│       ├── index.html     # Chat UI
│       ├── main.js        # Frontend logic
│       └── styles.css     # Styles
├── wrangler.toml          # Cloudflare config
├── tsconfig.json
├── package.json
├── README.md
└── PROMPTS.md             # AI prompts used during development
```

---

## Notes

- Conversation history is stored indefinitely in KV. To reset a session, refresh the page (new UUID is generated).
- The system prompt in `workflow.ts` can be customised to fit different sales methodologies (MEDDIC, SPIN, Challenger, etc.).
- Workflows add durability — if a step fails mid-flight (e.g. the AI call times out), it retries automatically.


