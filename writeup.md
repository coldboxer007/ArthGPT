# ChanakAI — ET AI Hackathon 2026 Submission
## Track 9: AI Money Mentor — "Your Money. Finally Understood."

**GitHub Repository:** [https://github.com/coldboxer007/ChanakAI](https://github.com/coldboxer007/ChanakAI)  
**Live Demo:** [https://chanakai-1027824348124.asia-south1.run.app](https://chanakai-1027824348124.asia-south1.run.app)

---

### 1. Executive Summary

**Problem:** 95% of Indians lack a formal financial plan. Professional advisors charge ₹25,000+/year, serving only HNIs. Average salaried Indians lose ₹15K–₹40K annually to suboptimal tax regime choices and "portfolio drag" from mutual fund overlap and regular-plan expense ratios.

**Solution:** ChanakAI is India's first **fully autonomous multi-agent financial advisor**. It replaces a high-cost human advisor with 24 specialized AI agents across three deep-analysis pipelines: **Portfolio X-Ray**, **Tax Wizard**, and **FIRE Planner**. ChanakAI delivers institutional-grade financial planning in under 60 seconds, with built-in SEBI-compliant guardrails and real-time SSE audit trails.

---

### 2. Multi-Agent Architecture (The "Mind")

ChanakAI's core differentiator is its **custom multi-agent framework** built on 5 agent primitives. This allows for complex, branching financial reasoning that "brute-force" LLM wrappers cannot achieve.

<div align="center">
<img src="diagrams/multiagent.png" alt="Multi-Agent Orchestration Architecture" width="800" />
<br/>
<em>Fig 1: ChanakAI Multi-Agent Orchestration — 24 agents across 3 pipelines with cross-pipeline context sharing.</em>
</div>

#### 2.1 Agent Primitives (The Building Blocks)
- **`DeterministicAgent`**: Pure TypeScript computation (Tax slabs, XIRR, Monte Carlo). No LLM calls. 100% reproducible.
- **`LlmAgent`**: Reasoning-heavy tasks (Tax optimization, PDF extraction, Narrative generation) using Gemini 1.5/2.5/3 variants.
- **`ParallelAgent`**: Fans out independent tasks concurrently (e.g., Stage 2 of every pipeline) via `Promise.allSettled`.
- **`SequentialAgent`**: Chains agents on a shared `SessionState` where output of A feeds input of B.
- **`LoopAgent`**: Iterates until an exit condition (Compliance Review/Fix cycles).

#### 2.2 The Root Orchestrator & Context Sharing
- **Intent Classifier**: Uses Gemini 2.5 Flash to route user queries to the correct pipeline or the **Advisory Engine**.
- **AnalysisContext**: A global singleton that merges results from all 3 pipelines (e.g., Tax regime, XIRR, FIRE probability) into a unified object. This allows the Advisory Engine to answer questions like: *"Given my high portfolio XIRR and New Tax Regime savings, can I retire 2 years earlier?"*

---

### 3. Math vs. Mind: The Compliance Framework

Financial planning requires 100% numerical accuracy (Math) and nuanced reasoning (Mind). ChanakAI separates these to ensure regulatory compliance and enterprise readiness.

<div align="center">
<img src="diagrams/mathvmind.png" alt="Math vs Mind Architecture" width="800" />
<br/>
<em>Fig 2: Math vs. Mind — Separation of deterministic computation from AI reasoning.</em>
</div>

- **The Math (Deterministic Layer)**: 
  - **`XirrAgent`**: Implements Newton-Raphson iteration for true portfolio returns.
  - **`TaxRegimeAgents`**: Hardcoded FY 2025-26 slab logic (deterministic).
  - **`MonteCarloAgent`**: 1,000 simulations using seeded Mulberry32 PRNG.
- **The Mind (AI Reasoning Layer)**:
  - **`MacroAgent`**: Uses Gemini Flash with Google Search grounding to fetch live inflation/FD/Nifty data.
  - **`ComplianceLoop`**: A `LoopAgent` that runs `ComplianceChecker` → `DisclaimerInjector`. It scans for:
    1. Unlicensed advice (replaces "You should buy X" with "Historically, X has...").
    2. Certainty claims (replaces "You will earn 15%" with "Projected 12% probability").
    3. Missing SEBI disclaimers.

---

### 4. Specialized Pipeline Inventories

#### 4.1 Portfolio X-Ray (8 Agents)
- **`IngestionAgent`**: Resolves funds via MFapi.in.
- **`XirrAgent`**: Computes time-weighted returns.
- **`OverlapAgent`**: Identifies stock-level overlap (ISIN matching) across AMCs.
- **`ExpenseAgent`**: Flags Regular-to-Direct plan switches with ₹ drag calculation.
- **`RebalancingStrategist`**: (Gemini 2 Pro) Generates fund-level swap recommendations with tax-awareness.

#### 4.2 Tax Wizard (7 Agents)
- **`InputCollector`**: Gemini Vision parsing of Form 16 / Payslips.
- **`OldRegimeAgent` / `NewRegimeAgent`**: Side-by-side deterministic slab working.
- **`TaxOptimizer`**: (Gemini 2 Pro) Ranks missed deductions (80C, 80D, 80CCD1B) by liquidity and risk.

#### 4.3 FIRE Path Planner (9 Agents)
- **`MonteCarloAgent`**: 1,000 simulations with realistic return distributions (12% mean ± 18% std dev).
- **`SipGlidepathAgent`**: Binary search for required monthly SIP with 90% success probability.
- **`RoadmapBuilder`**: (Gemini 3.1 Pro Preview) Generates the narrative personalized strategy prose.

<div align="center">
<img src="diagrams/montecralo-screenshota.png" alt="Monte Carlo Simulation Architecture" width="800" />
<br/>
<em>Fig 3: Monte Carlo Fan Chart Architecture — P10/P50/P90 probability bands with ~80ms What-If re-runs.</em>
</div>

---

### 5. Enterprise Readiness & Reliability

- **Graceful Degradation**: 3-tier model fallback strategy (Gemini 3.1 Pro → 2.5 Pro → 2.5 Flash → Deterministic Fallback).
- **Audit Trail**: Every agent's start/complete/error events, latency, and model used are emitted via SSE for a "Show Your Math" UI.
- **Error Boundaries**: React Error Boundaries per tab ensure a crash in Tax Wizard doesn't affect FIRE Planner.
- **Deployment**: Multi-stage Docker build deployed to Google Cloud Run (Asia-South1) with 0-3 instance auto-scaling.

---

### 6. Impact Model (Quantified Business Value)

| Metric | Before ChanakAI | After ChanakAI | Impact |
|---|---|---|---|
| **Time to Plan** | 2–4 weeks (3 advisor meetings) | < 60 seconds | **99.9% faster** |
| **Cost of Advice** | ₹25,000+ per year | ₹0 | **100% reduction** |
| **Tax Savings** | Manual guesswork / missing deductions | Slab-by-slab exact optimization | **₹15K–₹40K/year saved** |
| **Portfolio Alpha** | 0.5–1.5% drag (Overlap/Regular plans) | Automated rebalancing plan | **Continuous monitoring** |

**Assumptions:** Tax savings based on ₹12–₹30L CTC missing 80CCD1B/80D. Displacement cost based on 4 crore smartphone users in ET's base × ₹15K/yr RIA fee.

---

### 7. Scenario Walkthrough Summary
1. **FIRE Plan**: 34yo engineer, ₹24L income. ChanakAI solves for ₹1.5L monthly draw, calculates a ₹9.2Cr corpus target, and finds the ₹42K monthly SIP needed with a 90→60% equity glidepath.
2. **Tax Optimization**: ₹18L base salary edge case. Identifies Old Regime is only better if 80C + 80D + HRA exceeds ₹4.25L; otherwise, NPS-heavy New Regime wins.
3. **Portfolio X-Ray**: 6-fund overlap. Quantifies 42% exposure to HDFC Bank across 3 funds; suggests consolidating into 1 direct-plan fund to save ₹12K/year in commissions.

---

### 8. Conclusion
ChanakAI demonstrates that high-quality financial planning doesn't require a ₹25,000/year fee. By orchestrating 24 specialized agents with a strict "Math vs. Mind" separation, we have built a system that is autonomous, compliant, and ready for enterprise deployment inside the Economic Times ecosystem.
