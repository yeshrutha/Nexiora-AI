# Nexiora AI — Client Conversation Intelligence Platform

**Nexiora AI** is a production-ready, full-stack client intelligence platform designed for healthcare, nutrition, and wellness practitioners. It automatically analyzes consultation transcripts, extracts grounded metrics (sleep, steps, diet, stress, water, symptoms), identifies safety risk levels, and structures actionable recommendations.

To prevent hallucinations, the platform indexes every single extracted metric to exact line-by-line evidence and quotes from the original dialogue transcript.

---

## 🌌 Key Highlights & Features

* **Interactive Audit Timeline**: Clicking any metric card (e.g. Sleep, steps) scrolls the dialogue transcript container automatically and highlights the exact supporting quotes in cyan.
* **Smart Domain Rejection**: Backend validation detects and rejects invalid files (such as programming scripts, error logs, or personal chats) with detailed troubleshooting instructions.
* **Fail-Safe Extraction Pipeline**: Combines strict Zod schemas to validate LLM payloads. If the LLM schema validation fails, the server automatically merges the output with the local heuristic engine.
* **Human-in-the-Loop Review**: Practitioners can override, edit, and lock clinical values, marking them as manually verified.
* **Report Exporter**: Download structured reports as printable PDFs, formatted Markdown (`.md`), or structured JSON.
* **SaaS Workspace**: Features collapsible navigation sidebar (responsive state saved in LocalStorage), historical reports registry (rename, duplicate, star, delete), and population analytics.

---

## 💻 Tech Stack

* **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide Icons.
* **Backend**: Node.js, Express 5, Zod (Schema Validation), Multer, PDF-Parse, Mammoth (Docx parser).
* **AI Engine**: Local heuristic extraction engine, with live cloud provider integrations (Google Gemini, OpenAI GPT-4o, Anthropic Claude, Groq Llama 3.3).

---

## 🛠️ Ingestion & Extraction Workflow

```
[Transcript File / Text]
         ↓
[conversationParser.ts] -> Extracts speaker tags, line numbers, days, and detects chronology gaps.
         ↓
[analyzeRouter.ts]      -> Rejects invalid files (code files, non-health chats) with HTTP 400.
         ↓
[llmService.ts]         -> Feeds structured prompt to the active provider (Gemini, Claude, OpenAI, etc.).
         ↓
[Zod Schema Guard]      -> Enforces zero-hallucination structure. Falls back to mock heuristics on validation failure.
         ↓
[chronologyValidator]   -> Resolves day contradictions (e.g. "Wrapping up Day 7" on a 5-day transcript).
         ↓
[Clinical Dashboard]    -> Renders cards, confidence metrics, evidence badges, and interactive audit timeline.
```

---

## 🚀 Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yeshrutha/Nexiora-AI.git
   cd Nexiora-AI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Dev Server
To run both the Express backend API (Port 5000) and Vite frontend (Port 3000) simultaneously:
```bash
npm run dev
```

### Compiling Production Build
To test the production build locally:
```bash
npm run build
npm start
```

---

## ⚙️ Deployment Settings

### Render (Full-Stack Deployment)
* **Root Directory**: *(Leave blank)*
* **Build Command**: `npm run build`
* **Start Command**: `npm start` (Runs `node dist/server/index.js`)

### Vercel (Frontend Deployment)
* **Framework Preset**: **Vite**
* **Build Command**: `vite build`
* **Output Directory**: `dist`
* **Environment Variable**: Set `VITE_API_BASE_URL` to your live Render backend endpoint.