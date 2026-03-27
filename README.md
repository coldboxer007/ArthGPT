<div align="center">

<img src="https://img.shields.io/badge/ArthaGPT-India's%20AI%20Money%20Mentor-D4AF37?style=for-the-badge&labelColor=040A18" alt="ArthaGPT" />

# ArthaGPT

**Your money. Finally understood.**

*India's first multi-agent AI financial advisor — free, instant, and built for every Indian.*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-3.1%20Pro-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/Node-22+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

<br/>

> **ET AI Hackathon 2026 — Track 9**

</div>

---

## The Problem

**95% of Indians have no financial plan.**

A qualified human advisor charges ₹25,000+/year and serves only HNIs. India has 14 crore demat account holders — roughly 9 crore have *never* consulted a financial advisor. The result: missed tax deductions, wrong mutual fund choices, no retirement plan, and chronic underinsurance.

## The Solution

ArthaGPT does what a ₹25,000/year human financial advisor does — **for every Indian with a phone, in under 10 minutes, for free.**

Upload your CAMS statement → enter your salary structure → tell us your goals → get:
- A personalised retirement roadmap with a specific monthly SIP target
- An exact FY 2025-26 tax regime comparison with full step-by-step working
- A fund-level mutual fund rebalancing plan with tax consequences

---

## Demo

```
Onboarding (5 steps, ~2 min) → AI Processing (~8 sec) → Dashboard (3 modules)
```

| Module | What you get |
|--------|-------------|
| **Portfolio X-Ray** | XIRR per fund, stock overlap heatmap, expense drag, rebalancing plan |
| **FIRE Roadmap** | Inflation-adjusted corpus, required SIP, asset glidepath, insurance gap |
| **Tax Wizard** | Old vs New regime comparison, HRA working, missed deductions, saved ₹ |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 ArthaGPT Multi-Agent System               │
├──────────────────────────────────────────────────────────┤
│  Orchestrator  ─  Gemini 3.1 Pro                         │
│  Routes requests · Manages session · Injects guardrails  │
├────────────────┬─────────────────┬───────────────────────┤
│  Portfolio     │  FIRE           │  Tax                  │
│  Agent         │  Agent          │  Agent                │
│  ─────────     │  ─────────      │  ──────               │
│  XIRR calc     │  Corpus target  │  FY 2025-26 slabs     │
│  Overlap map   │  SIP back-calc  │  HRA 3-way min        │
│  Rebalance     │  Glidepath      │  Regime comparison    │
├────────────────┴─────────────────┴───────────────────────┤
│  Tool Layer                                               │
│  CASParser MCP · mfapi.in NAV · Deterministic Engines    │
├──────────────────────────────────────────────────────────┤
│  Output Agents                                            │
│  Narrative (Gemini 3 Flash) · Image (Gemini 3.1 Flash)   │
└──────────────────────────────────────────────────────────┘
```

### Model Strategy

| Model | Role |
|-------|------|
| **Gemini 3.1 Pro** | Master reasoning — XIRR, portfolio analysis, complex planning |
| **Gemini 3 Flash** | Narrative — turning structured results into plain-language insights |
| **Gemini 2.5 Flash** | Conversational follow-ups and output reformatting |
| **Deterministic Engine** | Tax slabs, FIRE calculations — never LLM-estimated |

---

## Features

### 📊 MF Portfolio X-Ray
- Parse CAMS / KFintech PDF via CASParser API
- True XIRR per fund using the Newton-Raphson method
- Stock overlap heatmap across all holdings — spot hidden concentration risk
- Expense ratio drag: regular vs direct plan cost comparison
- Actionable, fund-level rebalancing plan with LTCG tax estimate for each switch

### 🔥 FIRE Path Planner
- Inflation-adjusted corpus target at 6% (India-specific, not US figures)
- 3% safe withdrawal rate (conservative for India's inflation environment)
- Interactive retirement age slider — every figure recalculates client-side instantly
- Monthly SIP allocation with equity/debt glidepath to retirement
- Insurance gap detection: 12× income rule vs declared cover

### 🧾 Tax Wizard — FY 2025-26
- **Deterministic engine** — never estimated by an LLM
- Complete step-by-step working shown for both regimes
- HRA exemption: three-way minimum calculation with all values visible
- Slab-by-slab tax breakdown (expandable accordion)
- Missed deduction panel with exact rupee savings at your marginal rate
- Ranked instrument recommendations (ELSS, PPF, NPS) with savings calculation
- Fully editable salary inputs — adjust any figure and results update instantly

---

## Compliance & Guardrails

| Layer | What it does |
|-------|-------------|
| **Input validation** | Age 18–80, income ≥ ₹1L, no negative corpus values — with field-level error messages |
| **Calculation guardrails** | `Math.max(0, ...)` on all financial inputs; NaN-proof throughout |
| **Output guardrails** | Qualified language only; no imperative financial instructions |
| **SEBI Disclaimer** | Full mandatory disclaimer on every analysis screen |
| **Audit Trail** | "How we calculated this" panel — every agent call, model, tool, and latency visible |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Recharts |
| **Backend** | Node.js 22, Express, Vite 6 (dev middleware) |
| **AI** | `@google/genai` SDK — Gemini 3.1 Pro, Gemini 3 Flash |
| **Data** | CASParser API (CAMS PDF), mfapi.in (live NAV) |
| **Design** | Navy `#040A18` + Gold `#D4AF37` palette, JetBrains Mono for financial figures |
| **Build** | `tsc --noEmit` → 0 errors · `vite build` → 831 KB bundle |

---

## Getting Started

**Prerequisites:** Node.js 22+ (Tailwind CSS v4 requires Node 20+), a Gemini API key

```bash
# 1. Clone
git clone https://github.com/coldboxer007/ArthGPT.git
cd ArthGPT

# 2. Use correct Node version (if you have nvm)
nvm use   # reads .nvmrc → Node 22

# 3. Install dependencies
npm install

# 4. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 5. Start the dev server
npm run dev

# → http://localhost:3000
```

> The app works without a Gemini API key — Portfolio X-Ray falls back to realistic mock data. Tax Wizard and FIRE Roadmap are fully client-side deterministic engines that require no API key at all.

---

## Project Structure

```
ArthGPT/
├── server.ts                  # Express + Vite dev server
├── src/
│   ├── App.tsx                # Root — UserProfile state, step routing
│   ├── components/
│   │   ├── Onboarding.tsx     # 5-step onboarding with full validation
│   │   ├── Loading.tsx        # Multi-agent processing animation
│   │   ├── Dashboard.tsx      # Sidebar + tab layout + audit trail
│   │   ├── PortfolioXRay.tsx  # MF analysis (Gemini-powered)
│   │   ├── FIRERoadmap.tsx    # FIRE calculator (client-side)
│   │   └── TaxWizard.tsx      # Tax engine (client-side deterministic)
│   └── server/
│       ├── taxEngine.ts       # FY 2025-26 slab engine
│       └── fireEngine.ts      # Corpus + SIP back-calculator
└── .nvmrc                     # Node 22
```

---

## Impact

| Metric | Estimate | Basis |
|--------|----------|-------|
| Addressable users | 4 crore | Literate smartphone users in ET's user base |
| Advisory cost displaced | ₹60,000 Cr/yr | 4Cr users × ₹15K/yr RIA fee |
| ET revenue potential | ₹800 Cr/yr | 2Cr MAU × ₹400/user (ads + affiliate) |
| Aggregate tax savings enabled | ₹9,000 Cr | 50L users × ₹30K avg missed deductions |
| Infrastructure cost | < $70 total | Well within $5,000 GCP credits |

---

## License

MIT — Built for **ET AI Hackathon 2026, Track 9**
