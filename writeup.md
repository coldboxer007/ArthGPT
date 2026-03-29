# ChanakAI — ET AI Hackathon 2026 Submission
## Track 9: AI Money Mentor — "Your Money. Finally Understood."

**GitHub Repository:** [https://github.com/coldboxer007/ChanakAI](https://github.com/coldboxer007/ChanakAI)  
**Live Demo:** [https://chanakai-1027824348124.asia-south1.run.app](https://chanakai-1027824348124.asia-south1.run.app)

---

### 1. Architectural Philosophy: The "Math vs. Mind" Framework

ChanakAI is built on a fundamental separation of **Deterministic Computation (Math)** and **Heuristic Reasoning (Mind)**. Traditional AI advisors often fail by asking LLMs to perform arithmetic, leading to "hallucinated math." ChanakAI solves this by orchestrating **24 specialized agents** where every calculation is performed by TypeScript-native engines, while LLMs are reserved for intent classification, data extraction, and narrative generation.

<div align="center">
<img src="diagrams/mathvmind.png" alt="Math vs Mind Architecture" width="800" />
<br/>
<em>Fig 1: Math vs. Mind — Decoupling verifiable computation from AI-driven advisory.</em>
</div>

---

### 2. Multi-Agent Orchestration (The Custom Framework)

We built a custom agent orchestration framework in TypeScript (zero Python/LangChain dependencies) to ensure sub-100ms latency for computational tasks and robust SSE streaming.

#### 2.1 The Five Agent Primitives
1.  **`DeterministicAgent`**: Executes pure TypeScript logic (e.g., `OldRegimeAgent` for tax slabs). Returns structured results with 0% variance.
2.  **`LlmAgent`**: Utilizes Gemini (1.5/2.5/3) with strict JSON-mode schema enforcement for extraction and optimization tasks.
3.  **`ParallelAgent`**: Implements a "fan-out" pattern using `Promise.allSettled`, allowing concurrent execution of independent analysis (e.g., XIRR, Overlap, and Benchmark analysis run in parallel).
4.  **`SequentialAgent`**: Implements a "pipeline" pattern where a shared `SessionState` is mutated by agents in order.
5.  **`LoopAgent`**: An "Autonomous Refiner" used for our **2-iteration Compliance Cycle**. It runs a generator → checker → injector loop until the output is SEBI-compliant.

#### 2.2 Global State Management: `AnalysisContext`
The `AnalysisContext` acts as a cross-pipeline blackboard. It merges the outputs of all three pipelines (Tax, Portfolio, FIRE) into a unified financial graph. This allows the **Root Orchestrator** to answer complex cross-domain questions (e.g., *"How does switching to the New Tax Regime affect my FIRE age?"*) by querying the merged state.

---

### 3. Pipeline Deep-Dives: 24 Specialized Agents

<div align="center">
<img src="diagrams/multiagent.png" alt="Multi-Agent Orchestration Architecture" width="800" />
<br/>
<em>Fig 2: ChanakAI Multi-Agent Pipeline Flow — Sequential stages with parallel execution.</em>
</div>

#### 3.1 Portfolio X-Ray (8 Agents)
*   **Ingestion (Stage 1)**: `IngestionAgent` resolves ISINs and real-time NAVs via **MFapi.in**.
*   **Analysis (Stage 2 - Parallel)**: 
    *   `XirrAgent`: Newton-Raphson iteration for true portfolio IRR.
    *   `OverlapAgent`: Stock-level ISIN matching to identify hidden concentration.
    *   `ExpenseAgent`: Quantifies "Regular vs Direct" plan drag in absolute ₹ terms.
    *   `BenchmarkAgent`: Comparison against Nifty 50/Midcap/Smallcap indices.
*   **Optimization (Stage 3)**: `RebalancingStrategistAgent` (Gemini 2.5 Pro) generates specific Buy/Sell/Hold triggers with LTCG/STCG tax-awareness.

#### 3.2 Tax Wizard (7 Agents)
*   **Extraction**: `InputCollector` (Gemini Vision) parses Form 16/Payslips into structured salary components.
*   **Computation**: `OldRegimeAgent` and `NewRegimeAgent` compute exact slab-by-slab liability for FY 2025-26.
*   **Optimization**: `TaxOptimizerAgent` ranks missing deductions (80C, 80D, 80CCD1B) based on liquidity needs and risk profile.

#### 3.3 FIRE Path Planner (9 Agents)
*   **Ingestion**: `GoalProfiler` + `MacroAgent` (Gemini Search) fetch live inflation and bond yield data.
*   **Simulation**: `MonteCarloAgent` runs 1,000 iterations using a seeded **Mulberry32 PRNG**.
*   **Solver**: `SipGlidepathAgent` uses binary search to find the SIP amount required for a 90% success probability.
*   **Narrative**: `RoadmapBuilder` (Gemini 3.1 Pro Preview) converts numbers into a personalized 20-year prose strategy.

---

### 4. Technical Specifications & Reliability

#### 4.1 Monte Carlo Simulation Engine
ChanakAI rejects static "average return" models. Our engine samples returns from a normal distribution (12% mean, 18% volatility) and inflation from 6% mean (1.5% volatility), clamped to realistic Indian market floors/ceilings.

<div align="center">
<img src="diagrams/montecralo-screenshota.png" alt="Monte Carlo Simulation Architecture" width="800" />
<br/>
<em>Fig 3: Monte Carlo Fan Chart — P10/P50/P90 bands with ~80ms real-time What-If recalculations.</em>
</div>

#### 4.2 Enterprise Readiness
-   **Model Routing**: ChanakAI uses **6 distinct Gemini variants** optimized by task (e.g., Flash for extraction, Pro for optimization, Flash-Image for infographics).
-   **Telemetry**: Real-time SSE events (`agent_start`, `agent_complete`) provide full visibility into the agentic "black box."
-   **Infrastructure**: Containerized via multi-stage Docker (Node 22-slim), deployed to **Google Cloud Run** (Asia-South1) with auto-scaling (0-3 instances) for cost-efficiency.
-   **Compliance**: Automated SEBI disclaimer injection and probabilistic language enforcement via `LoopAgent`.

---

### 5. Quantified Impact Model

| Metric | Before ChanakAI | After ChanakAI | Impact |
|---|---|---|---|
| **Time to Plan** | 2–4 weeks (Advisor meetings) | < 60 seconds | **99.9% faster** |
| **Cost of Advice** | ₹25,000+ per year | ₹0 | **100% reduction** |
| **Tax Savings** | Manual guesswork | Slab-by-slab optimization | **₹15K–₹40K/year saved** |
| **Portfolio Health** | Annual review (if any) | Real-time rebalancing triggers | **Continuous alpha** |

**Assumptions:** Tax savings based on ₹18L CTC missing standard 80CCD1B/80D. Displacement cost based on 4 crore smartphone users in ET's base × ₹15K/yr RIA fee.

---

### 6. Hackathon Scenario Coverage
1.  **FIRE Plan**: Solves for 34yo software engineer target. Calculates ₹9.2Cr corpus with 90% confidence and identifies ₹42K monthly SIP requirement.
2.  **Tax Edge Case**: Side-by-side FY 2025-26 comparison. Identifies optimal regime for ₹18L CTC with HRA/Home Loan components.
3.  **Portfolio X-Ray**: Stock-level overlap analysis for 6 funds. Identifies 42% HDFC Bank exposure and flags 0.8% expense drag from regular plans.

---

### 7. Conclusion
ChanakAI is a production-ready, multi-agent financial advisor designed to democratize high-quality financial wisdom. By combining deterministic mathematical rigor with agentic AI reasoning, we provide a secure, compliant, and scalable "Money Mentor" for every Indian.
