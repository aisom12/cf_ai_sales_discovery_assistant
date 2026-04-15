# Sales Discovery Assistant (Cloudflare AI Assignment)

An AI-powered sales discovery assistant built on Cloudflare’s AI stack.  
It helps sales reps run better discovery conversations by asking clarifying questions, extracting pain points, summarizing notes, and suggesting next steps.

This project satisfies all Cloudflare assignment requirements:
- **LLM:** Workers AI (Llama 3.3)
- **Workflow / Coordination:** Cloudflare Workflows
- **User Input:** Chat UI hosted on Cloudflare Pages
- **Memory / State:** Durable Objects (or KV) storing conversation + prospect profile

---

## Features
- Conversational AI for sales discovery
- Persistent memory per session
- Structured extraction of:
  - Pain points  
  - Budget  
  - Timeline  
  - Objections  
  - Next steps  
- Clean chat interface
- Fully Cloudflare-native architecture

---

## Architecture Overview

