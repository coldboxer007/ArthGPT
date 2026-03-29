# ChanakAI Ship Sprint — Design Spec
**Date:** 2026-03-29  
**Status:** Approved  
**Scope:** 4 workstreams to ship-ready state for ET AI Hackathon 2026

---

## Context

ChanakAI (formerly ArthaGPT) is a multi-agent financial planning system with 3 pipelines (Portfolio X-Ray, Tax Wizard, FIRE Planner). After completing 12 architecture gap tasks, a UI review revealed 4 remaining issues that must be resolved before the hackathon submission.

---

## Workstream 1: Full AI Advisor (Orchestrator Overhaul)

### Problem

The orchestrator classifies intent and returns a canned switch-case message. It does not actually answer the user's question. The user's financial profile, cross-pipeline results, and parsed documents are never sent to the server. The `context` parameter in `orchestrate()` is dead code.

### Solution

Transform the orchestrator into a dual-mode system: **router + conversational advisor**.

**Architecture:**
```
User question
  |
Intent Classifier (gemini-2.5-flash - fast, cheap)
  |
  +-- Pipeline intent (portfolio/tax/fire) -> Enhanced routing message with user data references
  +-- Advisory intent (new) -> Gemini 3 Flash call with full user context -> Personalized answer
  +-- Multi intent -> Route to first pipeline + mention cross-domain
```

### Changes

#### A. New intent type: `advisory`
**File:** `src/server/agents/orchestrator/intentClassifier.ts`

Add `advisory` to the Intent union type. Update the classification prompt to include:
- "advisory": General financial questions, budgeting, goal planning, savings strategies, ad-hoc financial queries that don't map to a specific pipeline

The classifier model stays `gemini-2.5-flash` (fast classification, not generation).

#### B. Frontend sends full context
**File:** `src/components/Dashboard.tsx`

`handleOrchestratorSubmit` sends:
```typescript
{
  message: string,
  profile: {
    age: number,
    city: string,
    income: number,
    investments: string[],
    goals: string[],
    retireAge: number,
    salaryCTC?: number,
    basicSalary?: number,
    hra?: number,
    monthlySipCurrent?: number,
    existingMfCorpus?: number,
    existingPpfCorpus?: number,
    targetMonthlyDraw?: number,
  },
  crossPipelineData: CrossPipelineData | null,
  documents: {
    hasCas: boolean,
    hasForm16: boolean,
    hasPayslip: boolean,
    casData?: object,
    form16Data?: object,
    payslipData?: object,
  },
  chatHistory: Array<{role: 'user'|'assistant', content: string}> // last 5 messages
}
```

Calls `getCrossPipelineData()` from `useAnalysis()` context.

#### C. Server forwards full context
**File:** `server.ts`

`/api/v2/orchestrate` extracts `{ message, profile, crossPipelineData, documents, chatHistory }` and passes all to `orchestrate()`.

#### D. Orchestrator calls Gemini for advisory intent
**File:** `src/server/agents/orchestrator/RootOrchestrator.ts`

For `advisory` intent:
- Import `GoogleGenAI` from `@google/genai`
- Call `gemini-3-flash` with structured system prompt:

```
You are ChanakAI, India's AI financial advisor. You provide personalized,
actionable financial advice for Indian users. Use the user's actual financial
data to give specific recommendations.

Rules:
- Reference actual numbers from the user's profile (income, SIP, corpus, age)
- Give India-specific advice (mention actual schemes, tax sections, SEBI guidelines)
- Be concise but substantive (3-5 paragraphs max)
- Include actionable next steps
- Add SEBI disclaimer: "This is AI-generated educational content, not financial advice"
- If cross-pipeline results are available, reference them
- If chat history is provided, maintain conversational continuity

User Profile: {profile JSON}
Cross-Pipeline Results: {crossPipelineData JSON or "No analysis run yet"}
Parsed Documents: {documents summary or "No documents uploaded"}
Chat History: {last 5 messages or "New conversation"}
```

- `responseMimeType: 'application/json'` with schema: `{ message: string, suggestedPipeline?: string }`

For pipeline intents (portfolio/tax/fire):
- Enhanced routing messages that reference actual user data
- Populate `suggestedInputs` from user profile when available

#### E. Conversation history (lightweight)
**File:** `src/components/Dashboard.tsx`

Add React state for conversation messages:
```typescript
const [chatHistory, setChatHistory] = useState<Array<{role: 'user'|'assistant', content: string}>>([]);
```

Display as a scrollable chat thread. Send last 5 messages as context to server.

### Success criteria
- User asks "I want to buy a car in 2 years" -> gets personalized answer referencing their income, SIP, corpus
- User asks "Analyze my portfolio" -> gets routing message mentioning their actual fund count/corpus
- Conversation maintains context across 2-3 follow-up messages

---

## Workstream 2: What-If Monte Carlo Fix

### Problem

Success probability always shows 100% because:
1. `FIRE_STEP_UP_RATE = 0.10` (10% annual SIP step-up) builds unrealistically large corpuses
2. Post-retirement allocation is 60/40 equity/debt - too growth-heavy for retirees
3. Only 300 iterations - coarse granularity near 100%

### Solution

#### A. Fix Monte Carlo parameters
**File:** `src/server/agents/utils/fire.ts`

| Parameter | Current | New | Rationale |
|-----------|---------|-----|-----------|
| `FIRE_STEP_UP_RATE` | 0.10 | **0.05** | Matches realistic Indian salary growth (5-7%) |
| Post-retirement equity allocation | 60% | **40%** | Conservative for retirees (40/60 equity/debt) |
| Post-retirement debt allocation | 40% | **60%** | Conservative for retirees |

Line 11: `const FIRE_STEP_UP_RATE = 0.05;`
Lines 343-344: `equityCorpus = postWithdrawal * 0.40; debtCorpus = postWithdrawal * 0.60;`

#### B. Increase what-if iterations
**File:** `server.ts`

Change what-if endpoint iterations from 300 to 500.

#### C. UI improvements
**File:** `src/components/WhatIfPanel.tsx`

- **Probability gauge:** Color-gradient indicator:
  - Red: <50% ("High Risk")
  - Orange: 50-70% ("Moderate Risk")
  - Yellow: 70-85% ("Moderate")
  - Green: >85% ("On Track")
- **Corpus preview:** Show P50 projected corpus at retirement below the probability
- **Delta indicators:** Show +/- change from baseline when sliders move

### Success criteria
- 28yo, 25K SIP, retire at 55, 50K draw sees ~70-85% (not 100%)
- Reducing SIP to 5K shows noticeable probability drop
- UI clearly communicates risk level through color coding

---

## Workstream 3: Rebrand to ChanakAI

### Rules
- `ArthaGPT` -> `ChanakAI`
- `ArthGPT` -> `ChanakAI`
- `arthagpt` -> `chanakai` (lowercase contexts)
- Tagline stays: "Your Money. Finally Understood."
- `package.json` name: `chanakai`

### Files to change (22 files, ~38 occurrences)

**Config/Manifest:**
- `package.json` (line 2)
- `metadata.json` (line 2)
- `.vscode/tasks.json` (line 5)

**HTML:**
- `index.html` (lines 6, 9)

**Frontend Components:**
- `src/components/Onboarding.tsx` (line 422)
- `src/components/Dashboard.tsx` (lines 15, 120, 235)
- `src/components/Loading.tsx` (lines 69, 78, 84, 267)
- `src/components/FIRERoadmap.tsx` (line 768)
- `src/components/PortfolioXRay.tsx` (line 512)
- `src/components/InfographicCard.tsx` (line 26)

**Server/Agents:**
- `src/server/agents/orchestrator/intentClassifier.ts` (line 23)
- `src/server/agents/utils/fireGemini.ts` (line 112)
- `src/server/agents/utils/imageGen.ts` (lines 46, 104, 158)

**Documentation:**
- `README.md` (10 occurrences)
- `.github/copilot-instructions.md` (line 1)
- `conductor/index.md` (line 3)
- `conductor/tech-stack.md` (line 1)
- `conductor/product.md` (lines 1, 4)
- `conductor/2026-03-29-frontend-state-fix-design.md` (line 12)
- `docs/plans/00-master-plan.md` (lines 1, 4)
- `docs/plans/05-root-orchestrator.md` (line 55)

**Excluded:** `package-lock.json` (auto-regenerates), `.git/` internals

### Success criteria
- No occurrence of "ArthaGPT" or "ArthGPT" in any source file
- Browser tab shows "ChanakAI - Your Money. Finally Understood."

---

## Workstream 4: UX Polish from Screenshot Analysis

### Problem A: Orchestrator response is just text
Pipeline routing messages display as text but don't help navigate.

### Solution A: Auto-navigate on pipeline routing
**File:** `src/components/Dashboard.tsx`

When orchestrator returns a pipeline intent, add a "Go to [Pipeline Name]" button. Clicking switches the active tab.

### Problem B: No conversation history in UI
Each orchestrator message is isolated.

### Solution B: Chat thread UI
**File:** `src/components/Dashboard.tsx`

Display orchestrator interactions as a scrollable chat thread:
- User messages: right-aligned, dark background
- AI messages: left-aligned, card-style with gold accent
- Pipeline routing messages get a card with pipeline icon + "Launch" button
- Advisory messages get formatted markdown display

Maintain in React state. Send last 5 messages to server for conversational context.

### Success criteria
- Orchestrator section looks like a chat interface
- Pipeline routing includes clickable navigation action
- Advisory responses display with proper formatting

---

## Model Selection Summary

| Use Case | Model | Rationale |
|----------|-------|-----------|
| Intent classification | `gemini-2.5-flash` | Fast, cheap, proven |
| Advisory responses | `gemini-3-flash` | Latest Flash, good quality for advice |
| FIRE roadmap narrative | `gemini-3.1-pro-preview` | Unchanged |
| Tax/Portfolio agents | `gemini-2.5-flash` | Unchanged |
| Infographic generation | `gemini-3.1-flash-image-preview` | Unchanged |
| PDF parsing | `gemini-2.5-pro` | Unchanged |

---

## Implementation Order

1. **Rebrand first** (Workstream 3) - mechanical find-and-replace, no logic changes
2. **Monte Carlo fix** (Workstream 2) - small parameter changes, high demo impact
3. **AI Advisor** (Workstream 1) - largest change, highest value for judges
4. **UX Polish** (Workstream 4) - chat thread UI, auto-navigate

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `gemini-3-flash` not available via API key | Fallback to `gemini-2.5-flash` |
| Monte Carlo changes make probability too low | 5% step-up should produce 70-85% for mid-career persona |
| Rebrand misses an occurrence | Grep verification pass after all replacements |
| Chat history grows too large | Cap at last 5 messages |
