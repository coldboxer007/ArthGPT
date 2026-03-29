# ChanakAI — ET AI Hackathon 2026 Submission
## Track 9: AI Money Mentor — "Your Money. Finally Understood."

**GitHub Repository:** [https://github.com/coldboxer007/ChanakAI](https://github.com/coldboxer007/ChanakAI)  
**Live Demo:** [https://chanakai-1027824348124.asia-south1.run.app](https://chanakai-1027824348124.asia-south1.run.app)

---

### Executive Summary

**Problem:** 95% of Indians lack a financial plan. Professional advisors charge ₹25,000+/year, serving only HNIs. Average salaried Indians lose ₹15K–₹40K annually to suboptimal tax choices and "portfolio drag" from mutual fund overlap and regular-plan expense ratios.

**Solution:** ChanakAI is India's first **fully autonomous multi-agent financial advisor**. It replaces a high-cost human advisor with 24 specialized AI agents across three deep-analysis pipelines: **Portfolio X-Ray**, **Tax Wizard**, and **FIRE Planner**. ChanakAI delivers institutional-grade financial planning in under 60 seconds, for free, with built-in SEBI-compliant guardrails.

---

### 1. Multi-Agent Architecture (The "Mind")

ChanakAI's core differentiator is its custom multi-agent framework built on 5 agent primitives (Deterministic, LLM, Parallel, Sequential, and Loop). This allows for complex, branching financial reasoning that "brute-force" LLM wrappers cannot achieve.

<div align="center">
<img src="diagrams/multiagent.png" alt="Multi-Agent Orchestration Architecture" width="800" />
<br/>
<em>Fig 1: ChanakAI Multi-Agent Orchestration — 24 agents across 3 pipelines with cross-pipeline context sharing.</em>
</div>

#### Orchestration Pattern:
- **Sequential Stages:** Each pipeline follows a strict logical flow (e.g., Ingestion → Calculation → Optimization → Compliance).
- **Parallel Fan-out:** Within stages, independent tasks (XIRR, Overlap analysis, Benchmark comparison) run concurrently via `Promise.allSettled`.
- **Root Orchestrator:** A central "brain" uses Gemini 2.5 Flash for intent classification and Gemini 3 Flash for advisory routing, merging results from all three pipelines into a unified personal finance strategy.
- **SSE Streaming:** Real-time event emission ensures the user sees every agent's progress, providing transparency and auditability.

---

### 2. Math vs. Mind: The Compliance Framework

Financial planning requires 100% numerical accuracy (Math) and nuanced reasoning (Mind). ChanakAI separates these into two distinct layers to ensure regulatory compliance and enterprise readiness.

<div align="center">
<img src="diagrams/mathvmind.png" alt="Math vs Mind Architecture" width="800" />
<br/>
<em>Fig 2: Math vs. Mind — Separation of deterministic computation from AI reasoning.</em>
</div>

- **The Math (DeterministicAgents):** Tax slabs, XIRR (Newton-Raphson), Monte Carlo simulations, and SIP binary search are executed in pure TypeScript. These are 100% verifiable and reproducible.
- **The Mind (LlmAgents):** Gemini models (Flash/Pro) handle text extraction from PDFs (Vision), identifying missed tax deductions, and generating narrative roadmaps.
- **The Compliance Loop:** A `LoopAgent` runs a "Checker-Injector" cycle. A `ComplianceChecker` scans AI-generated advice for certainty claims or promises of returns. If violations are found, the `DisclaimerInjector` rewrites the response. This ensures zero non-compliant advice reaches the user.

---

### 3. Technical Innovations

#### Monte Carlo Engine (FIRE Path Planner)
Traditional planners use a single average return (e.g., 12%). ChanakAI runs **1,000 simulations** with realistic equity/debt return distributions and inflation volatility using a seeded PRNG (Mulberry32) for deterministic results.

<div align="center">
<img src="diagrams/montecralo-screenshota.png" alt="Monte Carlo Simulation Architecture" width="800" />
<br/>
<em>Fig 3: Monte Carlo Fan Chart Architecture — P10/P50/P90 probability bands.</em>
</div>

- **Dynamic What-If:** A 500-iteration "What-If" engine responds in ~80ms to slider changes, providing real-time visual feedback on how retirement age or SIP amounts affect the success probability.
- **SIP Solver:** Uses binary search to find the *exact* required monthly SIP to hit a 90% success probability, adjusted for a 5% annual step-up.

#### Gemini-Powered PDF Parsing (Vision)
ChanakAI uses Gemini 1.5/2.5 Flash Vision to parse complex financial documents (CAS, Form 16, Payslips) without the need for brittle regex or third-party Python libraries like `casparser`.

---

### 4. Scenario Walkthroughs

#### Scenario 1: FIRE Plan (Mid-career Professional)
For a 34-year-old software engineer earning ₹24L, ChanakAI builds a month-by-month roadmap. It identifies a ₹1.5L inflation-adjusted draw requirement and calculates a 90% probability corpus. The **SIP Solver** then computes the required monthly investment with a 90→60% equity glidepath.

#### Scenario 2: Tax Optimization (Edge Case)
In a ₹18L base salary scenario with HRA and NPS, the **Tax Wizard** identifies that the Old Regime is optimal only if specific deductions (80CCD1B, 80D) are fully utilized. It provides a slab-by-slab comparison and suggests 3 instruments ranked by liquidity.

#### Scenario 3: Portfolio X-Ray (Overlap & Rebalancing)
For a 6-fund portfolio, ChanakAI identifies stock-level overlap (e.g., 42% exposure to HDFC Bank across 3 funds) and identifies "Regular plan" expense drag. The **RebalancingStrategist** suggests specific fund-level swaps to reduce overlap while accounting for LTCG/STCG tax impact.

---

### 5. Impact Model (Quantified Business Value)

| Metric | Before ChanakAI | After ChanakAI | Impact |
|---|---|---|---|
| **Time to Plan** | 2–4 weeks (3 advisor meetings) | < 60 seconds | **99.9% faster** |
| **Cost of Advice** | ₹25,000+ per year | ₹0 | **100% reduction** |
| **Tax Savings** | Manual guesswork / missing deductions | Slab-by-slab exact optimization | **₹15K–₹40K/year saved** |
| **Portfolio Alpha** | 0.5–1.5% drag (Overlap/Regular plans) | Automated rebalancing plan | **Continuous monitoring** |

**Assumptions:** Tax savings based on ₹12–₹30L CTC missing 80CCD1B/80D. Displacement cost based on 4 crore smartphone users in ET's base × ₹15K/yr RIA fee.

---

### 6. Conclusion
ChanakAI demonstrates that high-quality financial planning doesn't require a ₹25,000/year fee. By orchestrating 24 specialized agents with a strict "Math vs. Mind" separation, we have built a system that is autonomous, compliant, and ready for enterprise deployment.
