# ChanakAI — Feature Showcase

> **Your Money. Finally Understood.**
>
> *ET AI Hackathon 2026 — Track 9: AI Money Mentor*

---

## What Is ChanakAI?

ChanakAI is a fully autonomous, multi-agent AI financial planning system that gives every Indian — not just HNIs — access to personalised, SEBI-compliant financial guidance. Three deep-analysis pipelines (Portfolio X-Ray, Tax Wizard, FIRE Planner) work together through a conversational AI mentor, turning raw financial data into specific, actionable plans in under 60 seconds.

No Python. No spreadsheets. No ₹25,000 advisor fees. Just you, your data, and 24 specialised AI agents that show their math.

---

## The Three Pipelines

### 1. Portfolio X-Ray

**What it does:** Upload a CAMS/KFintech consolidated account statement (or type in your funds manually) and get a complete portfolio health check — XIRR, stock overlap, expense drag, benchmark comparison, and fund-level rebalancing recommendations — in under 15 seconds.

**The Agents:**

| Agent | Role | Model |
|---|---|---|
| **IngestionAgent** | Parses raw fund input, resolves scheme codes via MFapi.in for real NAV/ISIN data, standardises into structured PortfolioData | Gemini 2.5 Flash |
| **XirrAgent** | Calculates true XIRR per fund and portfolio-wide using Newton-Raphson iteration (pure math, zero dependencies) | Deterministic |
| **OverlapAgent** | Identifies stock-level overlap across funds with 3-tier data confidence: RAG/AMFI factsheets → Exa MCP → Google Search | Gemini 2.5 Flash |
| **ExpenseAgent** | Calculates annual expense-ratio drag; compares Regular vs Direct plan spreads; recommends specific switches | Gemini 2.5 Flash |
| **BenchmarkAgent** | Compares each fund vs its category benchmark; flags underperformers (>2% below benchmark over 3 years) | Gemini 2.5 Flash |
| **RebalancingStrategistAgent** | Synthesises all Stage 2 outputs + user risk profile into fund-level buy/sell/hold recommendations with tax context | Gemini 2.5 Pro |
| **ComplianceCheckerAgent** | Scans narrative for regulatory violations (promises, unlicensed advice, incorrect rates) | Gemini 2.5 Flash |
| **DisclaimerInjectorAgent** | Rewrites flagged sections and injects SEBI disclaimer | Gemini 2.5 Flash |

**Pipeline Flow:** Sequential → Parallel → Sequential → Loop

```
Ingestion → [XIRR ‖ Overlap ‖ Expense ‖ Benchmark] → RebalancingStrategist → Compliance Loop (max 2 iterations)
```

**MFapi.in Integration:**
- Live fund search (`api.mfapi.in/mf/search?q=...`) — no auth, no rate limits
- Full NAV history per scheme (`api.mfapi.in/mf/{schemeCode}`)
- Fund metadata: fund house, scheme type, category, ISIN
- Fuzzy name matching (Jaccard similarity > 0.4, noise-word removal)
- In-memory cache: search results (5 min TTL), NAV history (1 hour TTL)
- Real XIRR calculation via Newton-Raphson (max 100 iterations, tolerance 1e-7)

**Data Confidence Badges:** Every data point in the overlap and expense analysis carries a provenance badge — HIGH (green, AMFI factsheets), MEDIUM (yellow, Exa MCP), LOW (red, Google Search estimated) — so the user always knows how trustworthy each number is.

**Tax-Aware Returns:** Portfolio returns are displayed with pre-tax and post-tax views, so users see the real impact of LTCG/STCG on their holdings.

---

### 2. Tax Wizard

**What it does:** Input your salary structure (or upload Form 16) and get an exact, slab-by-slab comparison of Old vs New tax regime for FY 2025-26, plus personalised optimisation suggestions ranked by risk and liquidity.

**The Agents:**

| Agent | Role | Model |
|---|---|---|
| **InputCollectorAgent** | Extracts and validates structured salary data from raw user input using Gemini Flash | Gemini 2.5 Flash |
| **OldRegimeAgent** | Calculates old regime tax: 0/5/20/30% brackets at ₹2.5L/₹5L/₹10L thresholds | Deterministic |
| **NewRegimeAgent** | Calculates new regime FY 2025-26 tax: 0/5/10/15/20/25/30% brackets at ₹4L/₹8L/₹12L/₹16L/₹20L/₹24L thresholds | Deterministic |
| **TaxOptimizerAgent** | Compares regimes, identifies missed deductions (80C, 80CCD1B, 80D, HRA, home loan interest), generates narrative with specific investment suggestions | Gemini 2.5 Pro |
| **ComplianceCheckerAgent** | Regulatory compliance scan | Gemini 2.5 Flash |
| **DisclaimerInjectorAgent** | SEBI disclaimer injection | Gemini 2.5 Flash |

**Pipeline Flow:**

```
InputCollector → [OldRegime ‖ NewRegime] → TaxOptimizer → Compliance Loop (max 2 iterations)
```

**NPS What-If Toggle:** Users can instantly see how an additional NPS contribution (Section 80CCD1B — up to ₹50,000) affects their tax liability in both regimes, without re-running the full pipeline.

**Client-Side Tax Engine:** For instant slider-driven reactivity, TaxWizard runs a lightweight deterministic tax engine entirely in the browser, so slab breakdowns update at 60fps as users tweak their inputs.

---

### 3. FIRE Planner

**What it does:** Input your age, income, expenses, existing investments, and retirement goals. ChanakAI builds a complete financial independence roadmap: SIP glidepath, asset allocation shifts, insurance gap analysis, Monte Carlo success probability, and a Gemini-generated narrative strategy — all dynamically updating as you change any parameter.

**The Agents:**

| Agent | Role | Model |
|---|---|---|
| **GoalProfilerAgent** | Normalises raw FIRE input into structured FireInputs; sets life expectancy to age 85 | Deterministic |
| **MacroAgent** | Fetches live macroeconomic parameters (inflation, Nifty returns, FD rate, bond yield, repo rate) via Gemini; falls back to hardcoded snapshot | Gemini 2.5 Flash |
| **MonteCarloAgent** | Runs 1,000-iteration Monte Carlo simulation using live macro assumptions | Deterministic |
| **SipGlidepathAgent** | Computes target corpus (annual draw ÷ 3% SWR), solves required SIP (median + safety margin), builds equity→debt glidepath | Deterministic |
| **InsuranceGapAgent** | Calculates life cover gap (12× income rule); recommends ₹20L health cover | Deterministic |
| **AdjustedMonteCarloAgent** | Re-runs Monte Carlo with the *required SIP* from SipGlidepath if baseline success is < 5%; provides before/after comparison | Deterministic |
| **RoadmapBuilderAgent** | Interprets Monte Carlo distribution, builds scenario comparisons (optimistic/median/pessimistic), generates narrative roadmap | Gemini 3.1 Pro Preview |
| **ComplianceCheckerAgent** | Regulatory compliance scan | Gemini 2.5 Flash |
| **DisclaimerInjectorAgent** | SEBI disclaimer injection | Gemini 2.5 Flash |

**Pipeline Flow:**

```
[GoalProfiler ‖ Macro] → [MonteCarlo ‖ SipGlidepath ‖ InsuranceGap] → [AdjustedMonteCarlo → RoadmapBuilder] → Compliance Loop (max 2 iterations)
```

**Monte Carlo Engine — Pure Math, Zero Dependencies:**

The simulation engine is a self-contained TypeScript module with no npm dependencies. Key parameters:

| Parameter | Value |
|---|---|
| Default iterations | 1,000 (baseline), 500 (what-if for speed) |
| SIP step-up rate | 5% annually |
| Safe withdrawal rate | 3% |
| PRNG | Seeded Mulberry32 (deterministic, reproducible) |
| Pre-retirement equity allocation | 90% → 60% (linear glidepath) |
| Post-retirement allocation | 40% equity / 60% debt |
| Equity return (mean) | 12% ± 18% std dev |
| Debt return | max(FD rate 6.8%, bond yield 7.1%) |
| Inflation | 6% ± 1.5% std dev |
| Life expectancy | 85 years |
| Equity return clamp | [-55%, +70%] |
| Inflation clamp | [-1%, +15%] |
| Conservative mode | Equity -3%, Debt -1% |

**Box-Muller transform** generates normal variates from uniform PRNG output. Returns and inflation are sampled independently each year for each iteration, producing a realistic distribution of outcomes.

---

## What-If Builder

**What it does:** Four interactive sliders let users explore "what if?" scenarios in real time. Drag a slider and see your FIRE success probability, projected corpus, and retirement readiness update instantly — no page reload, no re-run.

**Sliders:**
- Monthly SIP amount
- Retirement age
- Monthly post-retirement draw
- Equity allocation percentage

**How it works:** Each slider change fires a request to `/api/v2/what-if/fire`, which runs a fresh 500-iteration Monte Carlo in ~80ms and returns the updated probability distribution. The UI shows:

- **Probability gauge** — colour-coded success probability (red < 50%, yellow 50-80%, green > 80%)
- **Corpus preview** — projected corpus at retirement (P10 / P50 / P90)
- **Delta indicators** — how much each metric changed from your baseline plan

This directly addresses the hackathon requirement: *"The plan must update dynamically if the user changes one input. Static outputs requiring a full re-run will score lower."*

---

## AI Advisory Chat (Root Orchestrator)

**What it does:** A conversational financial mentor that understands your complete financial picture — your profile, all three pipeline results, uploaded documents, and chat history — and gives personalised advice using Gemini 3 Flash.

**How it works:**

1. **Intent Classification** (Gemini 2.5 Flash) — Every message is classified as one of: `portfolio`, `tax`, `fire`, `advisory`, `multi`, or `unknown`
2. **Pipeline Routing** — If the intent maps to a specific pipeline, the user gets a "Launch [Pipeline Name] →" button to navigate directly
3. **Advisory Mode** — For general financial questions, the orchestrator builds a rich context payload:
   - User profile (age, city, income, investments, goals, risk tolerance)
   - Cross-pipeline data (tax regime, XIRR, FIRE probability, required SIP, deductions, fund count, corpus)
   - Parsed document summaries (CAS holdings, Form 16 deductions)
   - Last 5 chat messages for conversational continuity
4. **Gemini 3 Flash** generates a personalised response grounded in the user's actual data, with fallback to Gemini 2.5 Flash

**Chat UI:** Scrollable message thread with user/assistant bubbles, typing indicator, pipeline navigation buttons, and maintained chat history.

---

## Cross-Pipeline Intelligence

The three pipelines don't operate in silos — they share data through an `AnalysisContext` that extracts and merges results from all pipelines:

| Source Pipeline | Data Shared | Used By |
|---|---|---|
| Tax Wizard | Optimal regime, marginal bracket, total deductions, taxable income | Advisory Chat (personalised tax advice), FIRE Planner (post-tax income assumptions) |
| Portfolio X-Ray | Portfolio XIRR, total corpus, fund count | Advisory Chat (investment performance context), FIRE Planner (existing corpus baseline) |
| FIRE Planner | Success probability, required SIP, insurance gaps | Advisory Chat (retirement readiness context), Portfolio X-Ray (tax-aware return display) |

This means the AI advisor knows your *complete* financial picture when answering any question — not just the data from one pipeline.

---

## Document Intelligence (Gemini Vision PDF Parsing)

**What it does:** Upload a PDF — CAS statement, Form 16, or payslip — and ChanakAI extracts structured financial data using Gemini 2.5 Flash's vision capabilities. No Python, no OCR libraries, no third-party PDF parsers.

**Supported Document Types:**

| Type | Extracted Fields |
|---|---|
| **CAS** (CAMS/KFintech) | Investor name, PAN, fund holdings (fund name, folio, units, NAV, current value), transaction history (date, type, amount, units) |
| **Form 16** | Employer name, PAN, assessment year, gross salary, all deductions by section, tax deducted |
| **Payslip** | Employer name, month, basic salary, HRA, allowances, gross salary, deductions, net salary |

**How it works:**
1. PDF is converted to base64
2. Sent to Gemini as inline data with `mimeType: 'application/pdf'`
3. Structured JSON extraction via `responseMimeType: 'application/json'` with typed schemas
4. Each document type has a dedicated prompt and JSON schema
5. Confidence score (0–1) calculated from ratio of non-null required fields
6. Parsed data auto-fills onboarding fields and enriches pipeline context

**Max file size:** 10 MB

---

## Infographic Generation (Nano Banana 2)

**What it does:** One-click AI-generated visual summary cards for each pipeline result — portfolio health, tax comparison, and FIRE roadmap — using Gemini 3.1 Flash Image Preview (internally known as "Nano Banana 2").

**Types:** `fire`, `portfolio`, `tax`

**Output:** Base64-encoded image with caption, downloadable and expandable in the UI.

---

## Onboarding & Preset Personas

A 5-step onboarding wizard collects user data progressively:

1. **Hero** — Brand introduction
2. **About You** — Age, city, income
3. **Investments** — 8 asset types (MF, PPF, NPS, FD, Stocks, EPF, Real Estate, Gold)
4. **Goals & Retirement** — Life goals, retirement age, monthly expense, SIP, deductions
5. **Document Upload** — PDF upload with AI parsing

**One-Click Personas** for instant demo setup:

| Persona | Age | City | Income | Key Profile |
|---|---|---|---|---|
| Student / Intern | 22 | Bengaluru | ₹4.5L | Minimal investments, starting out |
| Young Professional | 28 | Mumbai | ₹18L | Growing portfolio, home goal, NPS |
| Mid-Career | 35 | Delhi | ₹32L | Diversified across 8 asset types, child education goal |
| Senior Executive | 48 | Pune | ₹55L | Large corpus (₹1.5Cr+ real estate), nearing target |
| Near-Retirement | 58 | Chennai | ₹25L | Debt-heavy, 2 years to retirement |

Each persona fills all onboarding fields with realistic Indian financial data, enabling a complete end-to-end demo in one click.

---

## Enterprise Readiness

### Compliance Guardrails
Every pipeline ends with a **Compliance Loop** (max 2 iterations):
1. `ComplianceCheckerAgent` scans the output for regulatory violations — promises of returns, unlicensed advisory language, incorrect tax rates, missing disclaimers
2. `DisclaimerInjectorAgent` rewrites flagged sections and appends SEBI-mandated disclaimers
3. If violations persist after rewrite, the loop runs again (up to 2 iterations)

### Audit Trail ("Show Your Math")
The `AgentExecutionLog` component provides full transparency:
- Every agent's start/complete/error events
- Latency per agent
- Total pipeline execution time
- Grouped by pipeline stage
- Toggleable from the dashboard

This directly addresses the evaluation criteria: *"Agents that give only a final answer without traceable logic will be penalised."*

### Graceful Degradation
- **Model fallbacks:** Gemini 3.1 Pro Preview → Gemini 2.5 Pro → Deterministic (FIRE), Gemini 3 Flash → Gemini 2.5 Flash (Advisory)
- **MFapi fallback:** If live NAV fetch fails, the system continues with user-provided data
- **MacroAgent fallback:** If live macro parameters fail, hardcoded 2026 snapshot is used
- **SSE streaming:** Pipeline progress is streamed in real time via Server-Sent Events — users see each agent activate, not a blank loading screen

### Error Handling
- React `ErrorBoundary` catches render errors with retry
- Pipeline-level try/catch with structured error events
- Per-agent timing and error logging
- Multer file validation (10MB limit, PDF only)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI Models** | Google Gemini (6 model variants) | Intent classification, financial reasoning, narrative generation, image generation, PDF vision parsing |
| **Runtime** | Node.js 18+ with native fetch | Zero Python dependencies |
| **Server** | Express 4 + TypeScript | 14 API endpoints, SSE streaming, multipart upload |
| **Frontend** | React 19 + Vite 6 | SPA with hot-module replacement |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Charts** | Recharts 3 | Monte Carlo fan charts, tax comparison bars, glidepath area charts |
| **Animation** | Motion (Framer Motion) 12 | Smooth transitions and loading states |
| **Icons** | Lucide React | Consistent icon set |
| **Build** | Vite + TypeScript 5.8 | Fast builds, type safety |
| **AI SDK** | @google/genai v1.29+ | Unified Gemini API access (text, vision, structured output, image generation) |
| **Data** | MFapi.in | Live mutual fund NAV, scheme metadata, fund search |
| **File Upload** | Multer 2 | PDF upload handling |

---

## Gemini Model Usage Summary

ChanakAI uses **6 distinct Gemini model variants** across its agents:

| Model | Count | Use Cases |
|---|---|---|
| **Gemini 2.5 Flash** | 10 agents | Intent classification, salary extraction, compliance checking, disclaimer injection, PDF parsing, portfolio ingestion, overlap analysis, expense analysis, benchmark comparison, macro parameter fetching |
| **Gemini 2.5 Pro** | 3 agents | Tax optimisation reasoning, portfolio rebalancing strategy, FIRE roadmap fallback |
| **Gemini 3 Flash** | 1 agent | Advisory response generation (Root Orchestrator) |
| **Gemini 3.1 Pro Preview** | 1 agent | FIRE roadmap narrative generation |
| **Gemini 3.1 Flash Image Preview** | 1 endpoint | Infographic visual summary generation |

**Smart model routing:** Lightweight tasks (classification, extraction, compliance) use Flash models for speed and cost efficiency. Complex reasoning tasks (optimisation, rebalancing, narratives) use Pro models for depth. This directly addresses the evaluation bonus: *"Teams that achieve comparable results with smaller or open-source models, or use smart routing between large and small models, will score higher."*

---

## Agent Architecture Summary

**24 specialised agents** across 4 domains:

| Domain | Agents | Pattern |
|---|---|---|
| Core Framework | 5 (Agent, DeterministicAgent, LlmAgent, ParallelAgent, SequentialAgent, LoopAgent, SessionState) | Abstract base classes + orchestration primitives |
| Tax Pipeline | 7 (InputCollector, OldRegime, NewRegime, TaxOptimizer, ComplianceChecker, DisclaimerInjector, TaxPipeline) | Sequential → Parallel → Sequential → Loop |
| Portfolio Pipeline | 8 (Ingestion, XIRR, Overlap, Expense, Benchmark, RebalancingStrategist, ComplianceChecker, DisclaimerInjector, PortfolioPipeline) | Sequential → Parallel → Sequential → Loop |
| FIRE Pipeline | 9 (GoalProfiler, Macro, MonteCarlo, SipGlidepath, InsuranceGap, AdjustedMonteCarlo, RoadmapBuilder, ComplianceChecker, DisclaimerInjector, FirePipeline) | Parallel → Parallel → Sequential → Loop |
| Orchestrator | 2 (IntentClassifier, RootOrchestrator) | Classification → Routing/Advisory |

**Orchestration patterns used:**
- `ParallelAgent` — runs sub-agents concurrently via `Promise.allSettled`
- `SequentialAgent` — chains agents on shared `SessionState`
- `LoopAgent` — iterates until exit condition or max iterations (compliance review)
- All agents emit typed events consumed by SSE for real-time frontend updates

---

## Impact Model

### The Problem
- 95% of Indians lack a financial plan
- Professional financial advisors charge ₹25,000+/year, serving only HNIs
- Average Indian loses ₹15,000–₹40,000/year to suboptimal tax regime choice alone
- Mutual fund overlap and expense drag silently erode returns by 0.5–1.5% annually

### ChanakAI's Impact

| Metric | Before ChanakAI | After ChanakAI | Delta |
|---|---|---|---|
| Time to get a financial plan | 2–4 weeks (advisor meetings) | < 60 seconds | **99.9% reduction** |
| Cost of financial advice | ₹25,000+/year | ₹0 | **100% reduction** |
| Tax regime optimisation | Manual spreadsheet guesswork | Exact slab-by-slab comparison + missed deductions | **₹15K–₹40K/year saved** |
| Portfolio health check | None (or annual advisor review) | Real-time with live NAV data | **Continuous monitoring** |
| FIRE planning | Static one-time calculation | Dynamic Monte Carlo with what-if scenarios | **Probabilistic, not deterministic** |
| Regulatory compliance | Dependent on advisor ethics | Automated 2-iteration compliance loop | **Built-in guardrails** |

### Assumptions
- Tax savings based on average Indian salaried professional (₹12–₹30L CTC) missing 80CCD1B (₹50K) and 80D (₹25K–₹1L) deductions
- Portfolio drag reduction assumes switching 3 Regular-plan funds to Direct equivalents (0.5–1% TER spread)
- Time savings assume 3 advisor meetings × 2 hours each vs. 60-second ChanakAI pipeline

---

## Hackathon Scenario Coverage

### Scenario 1: FIRE Plan for a Mid-Career Professional ✅
> 34yo, ₹24L/year, ₹18L MF + ₹6L PPF, retire at 50, ₹1.5L/month draw

ChanakAI's FIRE pipeline handles this exactly:
- GoalProfiler normalises inputs, MacroAgent fetches live parameters
- MonteCarloAgent runs 1,000 iterations with realistic equity/debt returns
- SipGlidepathAgent computes required SIP with 90→60% equity glidepath
- InsuranceGapAgent flags cover gaps (12× income rule)
- **What-If Builder** lets the user drag retirement age from 50→55 and see probability update in ~80ms — no re-run required

### Scenario 2: Tax Regime Optimisation — Edge Case ✅
> ₹18L base, ₹3.6L HRA, ₹1.5L 80C, ₹50K NPS, ₹40K home loan interest

ChanakAI's Tax pipeline handles this:
- InputCollector extracts structured salary with all deduction components
- OldRegime and NewRegime agents calculate exact slab-by-slab liability
- TaxOptimizer compares regimes, flags additional optimisation opportunities
- **Step-by-step traceability** via AgentExecutionLog — no black-box answers

### Scenario 3: MF Portfolio X-Ray — Overlap and Rebalancing ✅
> 6 funds across 4 AMCs, significant large-cap overlap

ChanakAI's Portfolio pipeline handles this:
- IngestionAgent resolves all 6 funds via MFapi.in for real NAV data
- XirrAgent calculates true portfolio XIRR (Newton-Raphson)
- OverlapAgent identifies stock-level overlap with confidence badges
- ExpenseAgent flags Regular→Direct switch opportunities
- BenchmarkAgent compares vs category benchmarks
- RebalancingStrategist generates **specific, fund-level** buy/sell/hold recommendations with tax context

---

*Built with Gemini. No Python. No compromises. Just 24 agents showing their math.*
