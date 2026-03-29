# Track 9: AI Money Mentor

---

## From: ET AI Hackathon 2026 — Problem Statements (PS Document)

### PROBLEM STATEMENT

95% of Indians don't have a financial plan. Financial advisors charge ₹25,000+ per year and serve only High Net-worth Individuals (HNIs). Build an AI-powered personal finance mentor that lives inside ET, turns confused savers into confident investors, and makes financial planning as accessible as checking WhatsApp.

### WHAT YOU MAY BUILD

- **Financial Independence, Retire Early (FIRE) Path Planner** — User inputs age, income, expenses, existing investments, and life goals. AI builds a complete, month-by-month financial roadmap: Systematic Investment Plan (SIP) amounts per goal, asset allocation shifts, insurance gaps, tax-saving moves, and emergency fund targets.
- **Money Health Score** — A 5-minute onboarding flow that gives a comprehensive financial wellness score across 6 dimensions: emergency preparedness, insurance coverage, investment diversification, debt health, tax efficiency, and retirement readiness.
- **Life Event Financial Advisor** — AI advisor that handles specific life-event-triggered financial decisions — bonus, inheritance, marriage, new baby — customized to your tax bracket, portfolio, risk profile, and goals.
- **Tax Wizard** — Upload Form 16 or input salary structure. AI identifies every deduction you're missing, models old vs. new tax regime with your specific numbers, and suggests tax-saving investments ranked by risk profile and liquidity needs.
- **Couple's Money Planner** — India's first AI-powered joint financial planning tool. Both partners input their data. AI optimizes across both incomes — House Rent Allowance (HRA) claims, National Pension System (NPS) matching, Systematic Investment Plan (SIP) splits for tax efficiency, joint vs. individual insurance, combined net worth tracker.
- **Mutual Fund (MF) Portfolio X-Ray** — Upload your Computer Age Management Services (CAMS) or KFintech statement and in under 10 seconds get: complete portfolio reconstruction, true Extended Internal Rate of Return (XIRR), overlap analysis, expense ratio drag, benchmark comparison, and AI-generated rebalancing plan.

---

## From: ET AI Hackathon 2026 — Tracks 6 to 9 with Scenario Packs (Avataar.ai, Hiring Partner)

### PROBLEM STATEMENT

95% of Indians don't have a financial plan. Financial advisors charge ₹25,000+ per year and serve only HNIs. Build an AI-powered personal finance mentor that lives inside ET, turns confused savers into confident investors, and makes financial planning as accessible as checking WhatsApp.

### What You May Build:

- **FIRE Path Planner** — User inputs age, income, expenses, existing investments, and life goals. AI builds a complete, month-by-month financial roadmap: SIP amounts per goal, asset allocation shifts, insurance gaps, tax-saving moves, and emergency fund targets.
- **Money Health Score** — A 5-minute onboarding flow that gives a comprehensive financial wellness score across 6 dimensions: emergency preparedness, insurance coverage, investment diversification, debt health, tax efficiency, and retirement readiness.
- **Life Event Financial Advisor** — AI advisor that handles specific life-event-triggered financial decisions — bonus, inheritance, marriage, new baby — customised to your tax bracket, portfolio, risk profile, and goals.
- **Tax Wizard** — Upload Form 16 or input salary structure. AI identifies every deduction you're missing, models old vs. new tax regime with your specific numbers, and suggests tax-saving investments ranked by risk profile and liquidity needs.
- **Couple's Money Planner** — India's first AI-powered joint financial planning tool. Both partners input their data. AI optimises across both incomes — HRA claims, NPS matching, SIP splits for tax efficiency, joint vs. individual insurance, combined net worth tracker.
- **MF Portfolio X-Ray** — Upload your CAMS or KFintech statement and in under 10 seconds get: complete portfolio reconstruction, true XIRR, overlap analysis, expense ratio drag, benchmark comparison, and AI-generated rebalancing plan.

### Evaluation Focus:

Accuracy and personalisation depth of financial advice, quality of tax and investment calculations, ability to handle complex multi-variable scenarios (joint finances, life events), regulatory compliance (SEBI/RBI guidelines — no unlicensed advisory), and measurable improvement in user financial literacy or decision quality.

### Agentic Architecture Expectation:

Teams must demonstrate an agent that autonomously collects user financial inputs, runs multi-step calculations or analysis, applies relevant regulatory rules (tax slabs, SEBI norms), and produces a specific, actionable plan — without the user having to interpret raw numbers. At least 2 distinct life scenarios must be handled correctly, including one edge case (e.g. a user with both old and new tax regime implications, or a portfolio with significant overlap). Agents must include a clear disclaimer guardrail distinguishing AI guidance from licensed financial advice.

---

## Evaluation Rubric (All Tracks)

| Dimension | Weight | What Judges Look For |
|---|---|---|
| Autonomy Depth | 30% | How many steps complete without a human in the loop? Does the agent recover from failures on its own? Can it handle branching logic and exceptions without falling over? |
| Multi-Agent Design | 20% | Are responsibilities split across agents in a way that makes sense? Do agents talk to each other effectively? Is there a clear orchestration pattern holding it together? |
| Technical Creativity | 20% | Interesting use of agentic patterns, tool integration, knowledge graphs, or domain-specific reasoning. Points for elegant architecture over brute-force complexity. Cost efficiency bonus: teams that achieve comparable results with smaller or open-source models, or use smart routing between large and small models, will score higher here. |
| Enterprise Readiness | 20% | Error handling, compliance guardrails, audit trails, graceful degradation. Could you imagine this running in a real company without someone babysitting it? |
| Impact Quantification | 10% | Can the team show the math on business value? Is the before/after measurable? Are the metrics real (not vanity)? |

---

## Shared Scenario Pack — Track 9: AI Money Mentor

### Scenario 1: FIRE plan for a mid-career professional

A 34-year-old software engineer earns ₹24L/year, has ₹18L in existing MF investments, ₹6L in PPF, and wants to retire at 50 with a monthly corpus draw of ₹1.5L (today's value, inflation-adjusted). The agent must produce a month-by-month plan: SIP amounts by fund category, asset allocation glidepath, insurance gap analysis, and estimated retirement date given current trajectory. The plan must update dynamically if the user changes one input (e.g. target retirement age from 50 to 55). Static outputs requiring a full re-run will score lower.

### Scenario 2: Tax regime optimisation — edge case

A user has a base salary of ₹18L, a ₹3.6L HRA component, ₹1.5L in 80C investments, an NPS contribution of ₹50K, and a ₹40K home loan interest deduction. The agent must calculate exact tax liability under both old and new regimes, identify which is optimal, flag any missed deductions, and suggest 2–3 additional tax-saving instruments ranked by liquidity and risk. The calculation must be shown step-by-step and verifiable. Agents that give only a final answer without traceable logic will be penalised.

### Scenario 3: MF portfolio X-Ray — overlap and rebalancing

A user uploads a CAMS statement showing investments in 6 mutual funds across 4 AMCs. Three funds have significant large-cap overlap (Reliance, HDFC, Infosys appear in all three). The agent must calculate true XIRR across the portfolio, identify and quantify the overlap by stock and percentage, flag expense ratio drag vs. a direct-plan equivalent, and generate a specific rebalancing recommendation that reduces overlap without triggering short-term capital gains tax. Vague suggestions ("consider reducing large-cap exposure") score low. Specific, fund-level changes with tax context score high.

---

## Submission Requirements

- **GitHub Repository:** A public GitHub repository containing all source code, a clear README with setup instructions, and commit history showing the build process.
- **3-Minute Pitch Video:** A recorded walkthrough covering the problem, solution, and demo highlights — showing the agent completing its workflow from start to finish. Screen recordings are fine if the system needs external API access that cannot be demoed live.
- **Architecture Document:** A 1–2 page diagram and description showing agent roles, how they communicate, tool integrations, and error-handling logic. This carries a lot of weight. A clear architecture with a simpler prototype will beat a complex demo with no legible design.
- **Impact Model:** A quantified estimate of business impact (time saved, cost reduced, revenue recovered). State your assumptions. Back-of-envelope math is fine as long as the logic holds up.
