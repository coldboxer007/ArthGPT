<div align="center">

<img src="https://img.shields.io/badge/ChanakAI-India's%20AI%20Money%20Mentor-D4AF37?style=for-the-badge&labelColor=040A18" alt="ChanakAI" />

# ChanakAI

**Your Money. Finally Understood.**

*India's first multi-agent AI financial advisor — free, instant, and built for every Indian.*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-6%20Models-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Nano Banana 2](https://img.shields.io/badge/Nano%20Banana%202-Image%20Gen-D4AF37?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/gemini-api/docs/image-generation)
[![Agents](https://img.shields.io/badge/Agents-24-FF6B6B?style=flat-square)](docs/plans/features.md)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

<br/>

> **ET AI Hackathon 2026 — Track 9: AI Money Mentor**

</div>

---

## The Problem

**95% of Indians don't have a financial plan.**

Financial advisors charge ₹25,000+/year and serve only High Net-worth Individuals (HNIs). India has 14 crore demat account holders — roughly 9 crore have *never* consulted a financial advisor. The result: missed tax deductions, wrong mutual fund choices, no retirement plan, and chronic underinsurance.

## The Solution

ChanakAI does what a ₹25,000/year human financial advisor does — **for every Indian, in under 60 seconds, for free.**

Three deep-analysis pipelines — **Portfolio X-Ray**, **Tax Wizard**, and **FIRE Planner** — run autonomously through 24 specialised AI agents, producing specific, fund-level, slab-by-slab, month-by-month financial plans with full compliance guardrails and audit trails. A conversational AI mentor ties it all together, understanding your complete financial picture across all three pipelines.

No Python. No spreadsheets. No advisor fees. Just your data, 24 agents, and math you can verify.

---

## Demo Flow

```
Onboarding (5 steps, ~2 min) → Multi-Agent Pipelines (~30-60s each) → Dashboard (3 modules + AI Chat + Infographics)
```

| Module | What You Get | Agents |
|--------|-------------|--------|
| **Portfolio X-Ray** | True XIRR, stock overlap with confidence badges, expense drag, benchmark comparison, fund-level rebalancing | 8 agents, 4 stages |
| **Tax Wizard** | Old vs New FY 2025-26 regime comparison, slab-by-slab working, missed deductions, ranked optimisation suggestions | 7 agents, 4 stages |
| **FIRE Planner** | Monte Carlo fan chart (1,000 sims), SIP glidepath, insurance gap, macro snapshot, AI narrative roadmap | 9 agents, 5 stages |
| **AI Advisory Chat** | Conversational financial mentor with full cross-pipeline context — knows your tax regime, portfolio XIRR, FIRE probability | Root Orchestrator + Intent Classifier |
| **What-If Builder** | 4 interactive sliders with real-time Monte Carlo (~80ms per recalculation) | 500-iteration Monte Carlo engine |
| **Infographics** | One-click AI-generated visual summary cards for each pipeline | Nano Banana 2 |

---

## Multi-Agent Orchestration

ChanakAI's core differentiator is its **custom multi-agent framework** — not a wrapper around LangChain or AutoGen, but a purpose-built TypeScript orchestration system with 5 agent primitives and 3 composable pipeline patterns.

### The Agent Framework

```
src/server/agents/core/
├── Agent.ts           # Abstract base — execute(), timing, logging, event emission
├── SessionState.ts    # Typed mutable state container + SSE event emission
├── ParallelAgent.ts   # Fan-out via Promise.allSettled — all children run concurrently
├── SequentialAgent.ts # Chain agents on shared SessionState, output feeds next input
└── LoopAgent.ts       # Iterate until exit condition or max iterations (compliance review)
```

| Agent Type | Description | Example |
|---|---|---|
| **DeterministicAgent** | Pure computation — no LLM calls, predictable, verifiable output | MonteCarloAgent, XirrAgent, OldRegimeAgent, NewRegimeAgent |
| **LlmAgent** | Calls Gemini API for reasoning, extraction, or generation | MacroAgent, TaxOptimizerAgent, RoadmapBuilderAgent |
| **ParallelAgent** | Runs child agents concurrently via `Promise.allSettled` | Stage 2 of every pipeline (e.g. XIRR + Overlap + Expense + Benchmark) |
| **SequentialAgent** | Runs agents in order, passing shared state | Each pipeline's top-level orchestrator |
| **LoopAgent** | Iterates until exit condition — used for compliance review/fix cycles | ComplianceLoop (ComplianceChecker → DisclaimerInjector, max 2 iterations) |

### How Pipelines Compose

Every pipeline follows the same pattern: **Sequential stages, with parallel fan-out within stages, ending in a compliance loop.**

<div align="center">
<img src="diagrams/multiagent.png" alt="ChanakAI Multi-Agent Orchestration Architecture" width="900" />
<br/><br/>
<em>Multi-Agent Orchestration — 24 agents across 3 pipelines with cross-pipeline context sharing, compliance loops, and SSE streaming. Each pipeline runs sequential stages with parallel fan-out (Promise.allSettled), merging results into a unified AnalysisContext for the Root Orchestrator's advisory engine.</em>
</div>

### 24 Agents — Complete Inventory

**Core Framework (5 primitives):** Agent, DeterministicAgent, LlmAgent, ParallelAgent, SequentialAgent, LoopAgent, SessionState

**Portfolio Pipeline (8 agents):**

| Agent | Type | Model | Role |
|---|---|---|---|
| IngestionAgent | LLM | Gemini 2.5 Flash | Parses fund input, resolves via MFapi.in for real NAV/ISIN |
| XirrAgent | Deterministic | — | True XIRR via Newton-Raphson (max 100 iterations, tolerance 1e-7) |
| OverlapAgent | LLM | Gemini 2.5 Flash | Stock overlap across funds with 3-tier data confidence |
| ExpenseAgent | LLM | Gemini 2.5 Flash | Expense ratio drag, Regular→Direct switch recommendations |
| BenchmarkAgent | LLM | Gemini 2.5 Flash | Fund vs category benchmark; flags >2% underperformance |
| RebalancingStrategistAgent | LLM | Gemini 2.5 Pro | Fund-level buy/sell/hold with tax context |
| ComplianceCheckerAgent | LLM | Gemini 2.5 Flash | Scans for regulatory violations |
| DisclaimerInjectorAgent | LLM | Gemini 2.5 Flash | Rewrites flagged sections + SEBI disclaimer |

**Tax Pipeline (7 agents):**

| Agent | Type | Model | Role |
|---|---|---|---|
| InputCollectorAgent | LLM | Gemini 2.5 Flash | Extracts structured salary data from raw input |
| OldRegimeAgent | Deterministic | — | FY 2025-26 old regime: 0/5/20/30% at ₹2.5L/₹5L/₹10L |
| NewRegimeAgent | Deterministic | — | FY 2025-26 new regime: 0/5/10/15/20/25/30% at ₹4L/₹8L/₹12L/₹16L/₹20L/₹24L |
| TaxOptimizerAgent | LLM | Gemini 2.5 Pro | Compares regimes, identifies missed deductions (80C, 80CCD1B, 80D, HRA) |
| ComplianceCheckerAgent | LLM | Gemini 2.5 Flash | Regulatory compliance scan |
| DisclaimerInjectorAgent | LLM | Gemini 2.5 Flash | SEBI disclaimer injection |
| TaxPipeline | Orchestrator | — | Sequential: InputCollector → [Old ‖ New] → Optimizer → Loop×2 |

**FIRE Pipeline (9 agents):**

| Agent | Type | Model | Role |
|---|---|---|---|
| GoalProfilerAgent | Deterministic | — | Normalises inputs, sets life expectancy to 85 |
| MacroAgent | LLM | Gemini 2.5 Flash | Live inflation, Nifty returns, FD/bond rates via Gemini; hardcoded fallback |
| MonteCarloAgent | Deterministic | — | 1,000-iteration Monte Carlo with seeded PRNG |
| SipGlidepathAgent | Deterministic | — | Target corpus (draw ÷ 3% SWR), required SIP, equity→debt glidepath |
| InsuranceGapAgent | Deterministic | — | Life cover gap (12× income), recommends ₹20L health cover |
| AdjustedMonteCarloAgent | Deterministic | — | Re-runs Monte Carlo with required SIP if baseline success < 5% |
| RoadmapBuilderAgent | LLM | Gemini 3.1 Pro Preview | Scenario comparisons, narrative roadmap (falls back to 2.5 Pro → deterministic) |
| ComplianceCheckerAgent | LLM | Gemini 2.5 Flash | Compliance scan |
| DisclaimerInjectorAgent | LLM | Gemini 2.5 Flash | Disclaimer injection |

**Orchestrator (2 agents):**

| Agent | Model | Role |
|---|---|---|
| IntentClassifier | Gemini 2.5 Flash | Classifies NL queries into `portfolio`, `tax`, `fire`, `advisory`, `multi`, `unknown` |
| RootOrchestrator | Gemini 3 Flash | Routes to pipelines or generates context-aware advisory with full user profile + cross-pipeline data + documents + chat history |

### Smart Model Routing

ChanakAI uses **6 distinct Gemini model variants**, routing each task to the right model for cost and quality:

| Model | Usage | Rationale |
|---|---|---|
| **Gemini 2.5 Flash** | 10 agents — intent classification, extraction, compliance, PDF parsing, portfolio analysis, macro fetching | Fast, cheap — ideal for structured extraction and classification |
| **Gemini 2.5 Pro** | 3 agents — tax optimisation, portfolio rebalancing, FIRE roadmap fallback | Deep reasoning for multi-factor financial analysis |
| **Gemini 3 Flash** | 1 agent — advisory chat | Conversational quality with speed for interactive chat |
| **Gemini 3.1 Pro Preview** | 1 agent — FIRE roadmap narrative | Best narrative quality for long-form financial roadmaps |
| **Gemini 3.1 Flash Image Preview** | 1 endpoint — infographic generation | Nano Banana 2 for visual summary cards |
| **Deterministic engines** | 8 agents — tax slabs, Monte Carlo, XIRR, SIP solver, insurance gap | Never LLM-estimated — pure math, always verifiable |

This addresses the evaluation bonus: *"Teams that achieve comparable results with smaller models, or use smart routing between large and small models, will score higher."*

---

## Features

### Portfolio X-Ray

Upload your CAMS/KFintech consolidated account statement (or type in fund names) and get a complete portfolio health check in under 15 seconds.

- **True XIRR** per fund and portfolio-wide (Newton-Raphson, not estimated)
- **Stock overlap analysis** with confidence badges — HIGH (AMFI factsheets), MEDIUM (Exa MCP), LOW (Google Search estimated)
- **Expense ratio drag** — Regular vs Direct plan spread, annual drag in rupees, specific switch recommendations
- **Benchmark comparison** — each fund vs category benchmark, flags >2% underperformers over 3 years
- **Fund-level rebalancing plan** — specific buy/sell/hold recommendations with tax context (LTCG/STCG awareness)
- **Tax-aware returns** — pre-tax and post-tax portfolio return views
- **MFapi.in integration** — live NAV data, scheme metadata, ISIN resolution, fuzzy name matching (Jaccard > 0.4), in-memory cache (search: 5min, NAV: 1hr)
- **Nano Banana 2 infographic** — one-click AI-generated portfolio summary card
- **Agent execution trace** — every agent's start/complete/error with latency

### Tax Wizard — FY 2025-26

Input your salary structure (or upload Form 16) and get an exact, verifiable tax comparison with optimisation suggestions.

- **Deterministic tax engine** — tax slabs are never LLM-estimated, always pure math
- **Old vs New regime comparison** with visual bar chart
- **Complete step-by-step working** for both regimes — every slab, every deduction, fully expandable
- **HRA exemption** — three-way minimum calculation with all values visible
- **Slab-by-slab breakdown** — expandable accordion per regime
- **Missed deduction panel** — identifies 80C, 80CCD1B (NPS), 80D, HRA, home loan interest gaps with exact rupee savings at your marginal rate
- **Ranked instrument recommendations** — ELSS, PPF, NPS suggestions ordered by risk and liquidity
- **NPS What-If toggle** — instantly see how ₹50K NPS contribution affects both regimes
- **Fully editable inputs** — adjust any salary figure and results update instantly (client-side tax engine at 60fps)
- **Nano Banana 2 infographic** — AI-generated tax comparison card
- **Full pipeline available** — optional AI analysis via TaxPipeline for narrative insights

### FIRE Path Planner

Input your age, income, expenses, investments, and goals — get a complete financial independence roadmap with Monte Carlo probability.

- **Monte Carlo fan chart** — 1,000 simulations with P10/P50/P90 corpus bands (Recharts area chart)
- **Asset glidepath chart** — equity/debt allocation shifting from 90/10 → 60/40 at retirement → 40/60 post-retirement
- **Live macro parameters** — inflation, Nifty returns, FD rates, bond yields via Gemini Flash with Google Search grounding; hardcoded fallback
- **SIP solver** — binary search for required SIP with 5% annual step-up, median + safety margin
- **Adjusted Monte Carlo** — re-simulates with the *required SIP* when current plan yields low success
- **Insurance gap detection** — 12× income rule for life cover, ₹20L health cover recommendation
- **Scenario comparisons** — optimistic/median/pessimistic outcomes with specific corpus values
- **AI narrative roadmap** — Gemini 3.1 Pro Preview generates personalised strategy prose
- **Nano Banana 2 infographic** — AI-generated FIRE roadmap summary
- **Compliance loop** — auto-rewrites any non-probabilistic or certainty language

**Monte Carlo Engine Parameters:**

| Parameter | Value |
|---|---|
| Iterations | 1,000 (baseline), 500 (what-if) |
| SIP step-up | 5% annually |
| Safe withdrawal rate | 3% |
| PRNG | Seeded Mulberry32 (deterministic, reproducible) |
| Pre-retirement equity | 90% → 60% (linear glidepath) |
| Post-retirement | 40% equity / 60% debt |
| Equity return | 12% mean ± 18% std dev, clamped [-55%, +70%] |
| Debt return | max(FD 6.8%, Bond 7.1%) |
| Inflation | 6% ± 1.5% std dev, clamped [-1%, +15%] |
| Life expectancy | 85 years |

<div align="center">
<img src="diagrams/montecralo-screenshota.png" alt="ChanakAI Monte Carlo Simulation Approach" width="900" />
<br/><br/>
<em>Monte Carlo Simulation Architecture — 1,000 iterations with seeded Mulberry32 PRNG for reproducible results. Equity returns sampled from 12% ± 18% (clamped [-55%, +70%]), debt returns from FD/bond rates, inflation from 6% ± 1.5%. The fan chart renders P10/P50/P90 corpus bands, with an adjusted Monte Carlo re-run using the computed required SIP when baseline success probability is low.</em>
</div>

### What-If Builder — Dynamic Scenario Planning

Four interactive sliders for real-time "what if?" exploration — **no full re-run required**.

| Slider | Effect |
|---|---|
| Monthly SIP | See how increasing/decreasing SIP affects success probability |
| Retirement Age | Push retirement earlier or later and see corpus impact |
| Monthly Draw | Adjust post-retirement spending and see sustainability |
| Equity Allocation | Shift between equity-heavy and conservative portfolios |

Each slider change fires a request to `/api/v2/what-if/fire` — a fresh 500-iteration Monte Carlo runs in **~80ms** and returns updated probability, corpus projections (P10/P50/P90), and delta indicators from baseline.

This directly addresses the hackathon scenario requirement: *"The plan must update dynamically if the user changes one input. Static outputs requiring a full re-run will score lower."*

### AI Advisory Chat — Root Orchestrator

A conversational financial mentor that understands your *complete* financial picture.

1. **Intent Classification** (Gemini 2.5 Flash) — every message classified as `portfolio`, `tax`, `fire`, `advisory`, `multi`, or `unknown`
2. **Pipeline Routing** — pipeline-specific queries get a "Launch [Pipeline] →" navigation button
3. **Advisory Mode** — general financial questions receive personalised responses grounded in:
   - User profile (age, city, income, investments, goals, risk tolerance)
   - Cross-pipeline data (tax regime, XIRR, FIRE probability, required SIP, deductions, fund count, corpus)
   - Parsed document summaries (CAS holdings, Form 16 deductions)
   - Last 5 chat messages for conversational continuity
4. **Gemini 3 Flash** generates responses, with fallback to Gemini 2.5 Flash

### Cross-Pipeline Intelligence

The three pipelines don't operate in silos — they share data through a unified `AnalysisContext`:

| Source Pipeline | Data Shared | Used By |
|---|---|---|
| Tax Wizard | Optimal regime, marginal bracket, total deductions, taxable income | AI Advisory, FIRE Planner |
| Portfolio X-Ray | Portfolio XIRR, total corpus, fund count | AI Advisory, FIRE Planner |
| FIRE Planner | Success probability, required SIP, insurance gaps | AI Advisory, Portfolio X-Ray |

### Document Intelligence — Gemini Vision PDF Parsing

Upload a PDF and ChanakAI extracts structured financial data using Gemini 2.5 Flash's vision capabilities. No Python, no OCR libraries, no third-party parsers.

| Document Type | Extracted Fields |
|---|---|
| **CAS** (CAMS/KFintech) | Investor name, PAN, fund holdings (name, folio, units, NAV, value), transaction history |
| **Form 16** | Employer, PAN, assessment year, gross salary, deductions by section, tax deducted |
| **Payslip** | Employer, month, basic/HRA/allowances, gross salary, deductions, net salary |

Each extraction includes a **confidence score** (0–1) based on field completeness. Parsed data auto-fills onboarding and enriches pipeline context. Max file size: 10MB.

### Nano Banana 2 — AI Infographics

One-click visual summary cards for each pipeline result using `gemini-3.1-flash-image-preview`:

| Type | Key Metrics Shown |
|---|---|
| **FIRE Roadmap** | Success %, corpus target, required SIP, insurance status |
| **Portfolio X-Ray** | XIRR vs benchmark, annual drag, portfolio value, fund count |
| **Tax Comparison** | Side-by-side regime comparison, savings amount, recommendation |

Dark navy (#040A18) + gold (#D4AF37) theme, 3:2 aspect ratio, 1K resolution. Every infographic includes compliance text. Generated in <5 seconds.

### One-Click Preset Personas

Five realistic Indian financial profiles for instant onboarding and demo:

| Persona | Age | City | Income | Profile |
|---|---|---|---|---|
| Student / Intern | 22 | Bengaluru | ₹4.5L | Minimal investments, starting out |
| Young Professional | 28 | Mumbai | ₹18L | Growing portfolio, NPS, home goal |
| Mid-Career | 35 | Delhi | ₹32L | 8 asset types, child education, home loan |
| Senior Executive | 48 | Pune | ₹55L | Large corpus (₹1.5Cr+ real estate) |
| Near-Retirement | 58 | Chennai | ₹25L | Debt-heavy, 2 years to retirement |

Each persona fills all onboarding fields — age, city, income, 8 investment types, deductions, goals, retirement parameters — enabling a complete end-to-end demo in one click.

---

## Compliance & Enterprise Readiness

<div align="center">
<img src="diagrams/mathvmind.png" alt="ChanakAI Math vs Mind Architecture — SEBI Compliance Validation" width="900" />
<br/><br/>
<em>Math vs Mind Architecture — ChanakAI separates deterministic computation ("Math") from AI reasoning ("Mind") at every layer. DeterministicAgents handle tax slabs, XIRR, Monte Carlo, and SIP calculations with verifiable, reproducible outputs. LlmAgents handle narrative generation, optimization suggestions, and compliance review. The LoopAgent-based compliance cycle ensures all AI-generated content passes SEBI-compliant validation — no certainty claims, no return promises, no unlicensed advice — before reaching the user.</em>
</div>

| Layer | What It Does |
|---|---|
| **Input Validation** | Age 18-80, income ≥ ₹1L, no negative values — field-level error messages |
| **Calculation Guardrails** | `Math.max(0, ...)` on all financial inputs; NaN-proof throughout |
| **Compliance Loop** | `LoopAgent` runs ComplianceChecker + DisclaimerInjector up to 2 iterations until zero violations |
| **ComplianceChecker** | Gemini Flash scans for: unlicensed advice, certainty claims, promises of returns, incorrect rates, missing disclaimers |
| **DisclaimerInjector** | Rewrites violating sections into probabilistic, educational language |
| **SEBI Disclaimer** | Full mandatory disclaimer on every analysis screen |
| **Audit Trail** | Every agent's start/complete/error events, latency, model used — toggleable "Show Your Math" UI |
| **Graceful Degradation** | Model fallbacks (3.1 Pro → 2.5 Pro → Deterministic), MFapi fallback, MacroAgent fallback to hardcoded snapshot |
| **Error Boundary** | React error boundary per tab — one crash never blanks the others |
| **SSE Streaming** | Real-time pipeline progress — users see each agent activate, never a blank screen |

---

## Hackathon Scenario Coverage

### Scenario 1: FIRE Plan for a Mid-Career Professional

> *A 34-year-old software engineer earns ₹24L/year, has ₹18L in existing MF investments, ₹6L in PPF, and wants to retire at 50 with a monthly corpus draw of ₹1.5L (today's value, inflation-adjusted). The plan must update dynamically if the user changes one input.*

**ChanakAI's response:**
- GoalProfilerAgent normalises inputs → MacroAgent fetches live parameters
- MonteCarloAgent runs 1,000 iterations with realistic equity/debt return distributions
- SipGlidepathAgent computes required SIP with 90→60% equity glidepath and 5% annual step-up
- InsuranceGapAgent flags life cover gap (12× income rule) and recommends ₹20L health cover
- RoadmapBuilderAgent (Gemini 3.1 Pro Preview) generates personalised narrative strategy
- ComplianceLoop ensures all language is probabilistic and disclaimer-bearing
- **What-If Builder** lets the user drag retirement age from 50→55 and see probability update in ~80ms — no re-run

### Scenario 2: Tax Regime Optimisation — Edge Case

> *Base salary ₹18L, HRA ₹3.6L, 80C ₹1.5L, NPS ₹50K, home loan interest ₹40K. Must calculate exact liability under both regimes, identify optimal, flag missed deductions, suggest instruments ranked by liquidity and risk. Step-by-step working required.*

**ChanakAI's response:**
- InputCollectorAgent (Gemini 2.5 Flash) extracts structured salary with all deduction components
- OldRegimeAgent and NewRegimeAgent calculate exact slab-by-slab liability (deterministic — never LLM-estimated)
- TaxOptimizerAgent (Gemini 2.5 Pro) compares regimes, flags missed deductions (80CCD1B, 80D), suggests instruments
- Full step-by-step working visible in expandable slab accordion
- NPS What-If toggle for instant regime impact analysis
- AgentExecutionLog provides complete audit trail — every step traceable

### Scenario 3: MF Portfolio X-Ray — Overlap and Rebalancing

> *6 mutual funds across 4 AMCs. Three funds have significant large-cap overlap. Must calculate true XIRR, identify and quantify overlap, flag expense drag, and generate specific rebalancing recommendations with tax context.*

**ChanakAI's response:**
- IngestionAgent resolves all 6 funds via MFapi.in for real NAV data and ISIN codes
- XirrAgent calculates true portfolio XIRR (Newton-Raphson, not estimated)
- OverlapAgent identifies stock-level overlap with confidence badges (HIGH/MEDIUM/LOW)
- ExpenseAgent flags Regular→Direct switch opportunities with annual drag in rupees
- BenchmarkAgent compares each fund vs its category benchmark
- RebalancingStrategistAgent (Gemini 2.5 Pro) generates **specific, fund-level** buy/sell/hold recommendations with LTCG/STCG tax context — not vague suggestions

---

## API Endpoints

### V2 — Multi-Agent Pipelines (SSE Streaming)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/portfolio-pipeline` | 8-agent portfolio analysis with real-time SSE events |
| POST | `/api/v2/fire-pipeline` | 9-agent FIRE roadmap with Monte Carlo + compliance |
| POST | `/api/v2/tax-pipeline` | 7-agent tax comparison with AI optimisation |
| GET | `/api/v2/*/status` | Health check / stage metadata per pipeline |
| POST | `/api/v2/what-if/fire` | Synchronous Monte Carlo what-if (~80ms, 500 iterations) |
| POST | `/api/v2/orchestrate` | NL intent classification + advisory routing (profile + cross-pipeline + docs + chat history) |
| POST | `/api/v2/parse-document` | Gemini Vision PDF parsing (CAS, Form 16, Payslip). Max 10MB |
| POST | `/api/v2/generate-infographic` | Nano Banana 2 AI infographic (type: fire/portfolio/tax) |
| GET | `/api/v2/generate-infographic/status` | Infographic model health check |

### V1 — Legacy Direct Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze-portfolio` | Direct Gemini portfolio analysis (fallback to mock) |
| POST | `/api/fire-plan` | Deterministic FIRE engine |
| POST | `/api/tax-compare` | Deterministic tax engine |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI Models** | Google Gemini (6 model variants) | Intent classification, financial reasoning, narrative generation, image generation, PDF vision parsing |
| **AI SDK** | `@google/genai` v1.29+ | Unified Gemini API access (text, vision, structured JSON output, image generation) |
| **Runtime** | Node.js 18+ with native fetch | Zero Python dependencies |
| **Server** | Express 4 + TypeScript | 14 API endpoints, SSE streaming, multipart upload |
| **Frontend** | React 19 + Vite 6 | SPA with hot-module replacement |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Charts** | Recharts 3 | Monte Carlo fan charts, tax bars, glidepath area charts |
| **Animation** | Motion (Framer Motion) 12 | Smooth transitions and loading states |
| **Icons** | Lucide React | Consistent icon set |
| **Build** | Vite + TypeScript 5.8 | Fast builds, full type safety |
| **Data** | MFapi.in | Live mutual fund NAV, scheme metadata, fund search |
| **File Upload** | Multer 2 | PDF upload handling (10MB limit) |
| **Design** | Navy `#040A18` + Gold `#D4AF37` | JetBrains Mono for financial figures |

---

## Getting Started

**Prerequisites:** Node.js 18+ and a [Gemini API key](https://ai.google.dev/)

```bash
# 1. Clone
git clone https://github.com/coldboxer007/ChanakAI.git
cd ChanakAI

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the dev server
npm run dev

# -> http://localhost:3000
```

> `npm run dev` resolves to `node --env-file=.env.local --import tsx server.ts`.
> The `--env-file` flag loads `.env.local` natively into `process.env` before any module
> is imported, so `GEMINI_API_KEY` is available to all agent pipelines.

> The app works without a Gemini API key — Tax Wizard is fully client-side (deterministic engine), and the FIRE Monte Carlo engine runs pure math. AI narratives, live macro parameters, PDF parsing, advisory chat, and Nano Banana 2 infographics require the key.

---

## Project Structure

```
ChanakAI/
├── server.ts                          # Express + Vite dev + all V1/V2 endpoints
├── src/
│   ├── App.tsx                        # Root — UserProfile state, step routing
│   ├── main.tsx                       # Vite entry
│   ├── index.css                      # Tailwind v4 theme (navy/gold/teal/coral)
│   │
│   ├── components/
│   │   ├── Onboarding.tsx             # 5-step onboarding, preset personas, PDF upload
│   │   ├── Loading.tsx                # Real-time SSE agent progress tracking
│   │   ├── Dashboard.tsx              # 3-tab layout + AI chat + SEBI disclaimer
│   │   ├── ChatMentor.tsx             # NL chat → /api/v2/orchestrate with full context
│   │   ├── PortfolioXRay.tsx          # MF analysis + confidence badges + infographic
│   │   ├── FIRERoadmap.tsx            # Monte Carlo fan chart + what-if panel + infographic
│   │   ├── TaxWizard.tsx              # Tax engine + NPS toggle + bar chart + infographic
│   │   ├── WhatIfPanel.tsx            # 4 sliders + real-time Monte Carlo feedback
│   │   ├── InfographicCard.tsx        # Nano Banana 2 image display + download
│   │   ├── AgentExecutionLog.tsx      # "Show Your Math" audit trail
│   │   ├── ConfidenceBadge.tsx        # HIGH/MEDIUM/LOW data provenance indicator
│   │   └── ErrorBoundary.tsx          # Per-tab crash isolation with retry
│   │
│   ├── hooks/
│   │   ├── useSSE.ts                  # SSE consumers: usePortfolio/Fire/TaxPipeline
│   │   ├── useWhatIf.ts              # What-If slider hook → /api/v2/what-if/fire
│   │   └── useInfographic.ts          # Nano Banana 2 generation hook
│   │
│   ├── contexts/
│   │   └── AnalysisContext.tsx         # Cross-pipeline data merging + getCrossPipelineData()
│   │
│   └── server/
│       ├── taxEngine.ts               # FY 2025-26 slab engine (deterministic)
│       ├── fireEngine.ts              # FIRE corpus + SIP calculator
│       │
│       └── agents/
│           ├── core/                  # Agent framework (5 primitives)
│           ├── portfolio/             # 8 agents + MFapi integration
│           ├── fire/                  # 9 agents + Monte Carlo engine
│           ├── tax/                   # 7 agents + deterministic slabs
│           ├── orchestrator/          # IntentClassifier + RootOrchestrator
│           └── utils/
│               ├── fire.ts            # Monte Carlo engine (1000 sims, Mulberry32 PRNG)
│               ├── fireGemini.ts      # Live macro + roadmap generation
│               ├── gemini.ts          # Shared Gemini utilities
│               ├── mfapi.ts           # MFapi.in integration (search, NAV, XIRR)
│               ├── pdfParser.ts       # Gemini Vision PDF parsing (CAS/Form16/Payslip)
│               └── imageGen.ts        # Nano Banana 2 infographic generators
│
├── docs/plans/                        # Architecture plans and feature showcase
├── .env.local                         # GEMINI_API_KEY (not in git)
└── package.json
```

---

## Impact Model

### The Problem in Numbers
- 95% of Indians lack a financial plan
- Professional advisors charge ₹25,000+/year, serving only HNIs
- Average salaried Indian loses ₹15,000–₹40,000/year to suboptimal tax regime choice
- Mutual fund overlap and expense drag silently erode returns by 0.5–1.5% annually

### ChanakAI's Measurable Impact

| Metric | Before ChanakAI | After ChanakAI | Delta |
|---|---|---|---|
| Time to financial plan | 2–4 weeks (advisor meetings) | < 60 seconds | **99.9% faster** |
| Cost of advice | ₹25,000+/year | ₹0 | **100% cost reduction** |
| Tax optimisation | Manual spreadsheet guesswork | Exact slab-by-slab + missed deductions | **₹15K–₹40K/year saved** |
| Portfolio health check | Annual advisor review (if any) | Real-time with live NAV data | **Continuous monitoring** |
| FIRE planning | Static one-time calculation | Dynamic Monte Carlo with what-if | **Probabilistic, not deterministic** |
| Compliance | Dependent on advisor ethics | Automated 2-iteration compliance loop | **Built-in guardrails** |

### Aggregate Estimates

| Metric | Estimate | Basis |
|---|---|---|
| Addressable users | 4 crore | Literate smartphone users in ET's user base |
| Advisory cost displaced | ₹60,000 Cr/yr | 4Cr users × ₹15K/yr RIA fee |
| ET revenue potential | ₹800 Cr/yr | 2Cr MAU × ₹400/user (ads + affiliate) |
| Aggregate tax savings enabled | ₹9,000 Cr | 50L users × ₹30K avg missed deductions |
| Infrastructure cost | < $70 total | Well within $5,000 GCP credits |

### Assumptions
- Tax savings based on average salaried professional (₹12–₹30L CTC) missing 80CCD1B (₹50K) and 80D (₹25K–₹1L) deductions
- Portfolio drag reduction assumes switching 3 Regular-plan funds to Direct (0.5–1% TER spread)
- Time savings assume 3 advisor meetings × 2 hours each vs. 60-second ChanakAI pipeline

---

## Evaluation Alignment

| Dimension (Weight) | How ChanakAI Scores |
|---|---|
| **Autonomy Depth (30%)** | Full end-to-end: user inputs data → 24 agents run autonomously → compliance-checked output. Graceful degradation with model fallbacks (3.1 Pro → 2.5 Pro → Deterministic). No human-in-the-loop needed. |
| **Multi-Agent Design (20%)** | 24 agents across 4 domains with clear responsibility splits. 3 orchestration patterns (Parallel, Sequential, Loop). Cross-pipeline data sharing via AnalysisContext. Root Orchestrator for NL routing. |
| **Technical Creativity (20%)** | Smart model routing (6 Gemini variants by task complexity). Pure-math Monte Carlo with seeded PRNG. MFapi.in live data. Gemini Vision PDF parsing. What-If Builder with ~80ms Monte Carlo. Nano Banana 2 infographics. |
| **Enterprise Readiness (20%)** | 2-iteration compliance loop. SEBI disclaimer injection. Full audit trail. Error boundaries. SSE streaming. Input validation. Graceful degradation at every layer. |
| **Impact Quantification (10%)** | ₹15K–₹40K/year tax savings per user. ₹60,000Cr advisory cost displaced. 99.9% time reduction. All assumptions stated and verifiable. |

---

## License

MIT — Built for **ET AI Hackathon 2026, Track 9: AI Money Mentor**
