---
design_depth: deep
task_complexity: medium
---
# Design Document: Frontend UI Revamp (AI Money Mentor)

## 1. Problem Statement
The ChanakAI frontend requires a UI/UX revamp to better reflect its "AI Money Mentor" persona. The current implementation tightly couples the chatbot to the main `Dashboard.tsx` content area, forcing it to compete for vertical space with complex financial visualizations (Portfolio X-Ray, FIRE Roadmap, Tax Wizard). Furthermore, the existing Navy/Gold Tailwind theme is rigid and not optimized for the new interactive mentoring experience. We need a cohesive, fresh aesthetic and a persistent 3-column layout (Sidebar, Main Content, Right Chatbot) that separates conversation from data while maintaining the deterministic logic of the underlying calculators.

## 2. Requirements
**Functional Requirements:**
- **REQ-1:** Implement a persistent 3-column layout (Left Sidebar, Center Content, Right Chatbot).
- **REQ-2:** Refactor existing dense data views (Portfolio, FIRE, Tax) to stack vertically within the narrower center column to preserve readability.
- **REQ-3:** The detached chatbot must maintain connection to the existing `/api/v2/orchestrate` endpoint seamlessly.

**Non-Functional Requirements & Constraints:**
- **REQ-4:** Replace the current Navy/Gold styling with a "Fresh AI Mentor Theme" synthesized by Stitch `DESIGN.md`.
- **REQ-5:** Ensure that the UI revamp is strictly presentational; the deterministic calculation logic and `AnalysisContext` state must remain untouched to comply with ET AI Hackathon guidelines.

## 3. Approach
**Selected Approach: Orchestrated Stitch Loop**
- We will orchestrate a multi-agent workflow using the `stitch-loop` skill to iteratively generate the new 3-column dashboard layout. — *[Traces To: REQ-1] Selected to ensure a perfectly cohesive, global theme generation over piece-meal component updates. (considered: Targeted Component Replacement — rejected because it risks CSS clashes and a fragmented user experience)*
- A new `.stitch/DESIGN.md` will dictate the fresh, modern theme parameters to the Stitch MCP server. — *[Traces To: REQ-4] We need a singular source of truth for the new aesthetics to replace the Navy/Gold theme.*
- The central content area will stack complex tables and charts vertically. — *[Traces To: REQ-2] The center column will be narrower due to the persistent right-side chatbot, so stacking dense data is required for readability. (considered: Horizontal Scrolling — rejected because it is less usable on desktop layouts)*
- The `react-components` skill will be employed to convert Stitch HTML/CSS back into modular React code, manually wiring the new UI elements to the existing `AnalysisContext` state without altering business logic. — *[Traces To: REQ-5] This ensures the determinism of the backend engines and calculations remains fully intact. (considered: Complete rewrite including logic — rejected because the existing engines are tightly coupled to the hackathon rubric's accuracy requirements)*

## 4. Architecture
**Component Diagram:**
- `App.tsx` (Entry point)
  - `Dashboard.tsx` (Main layout container refactored to a 3-column CSS Grid or Flexbox)
    - `Sidebar` (Left navigation, profile, document upload status)
    - `CenterStage` (Dynamic area hosting `PortfolioXRay`, `FIRERoadmap`, `TaxWizard`)
    - `ChatMentor` (Right-side persistent chat interface)

**Data Flow & Key Interfaces:**
- The `Dashboard.tsx` will coordinate the 3-column layout. — *[Traces To: REQ-1] We need a root container to manage the spatial distribution of the new UI. (considered: Floating Absolute Positioning — rejected because it overlaps and obscures charts)*
- The components within `CenterStage` will be refactored to use vertical flexbox stacking for internal charts (e.g., Monte Carlo fan chart, Tax Regime comparison) to accommodate a narrower viewport width. — *[Traces To: REQ-2] Ensures dense financial data is fully readable without forcing horizontal scrolling. (considered: Breakpoints hiding the sidebar — rejected because it disrupts navigation)*
- The `ChatMentor` will encapsulate its local `chatHistory` state and continue interacting with the `/api/v2/orchestrate` endpoint. It will read from and potentially trigger updates to the `AnalysisContext`. — *[Traces To: REQ-3] Ensures the AI mentor can command tab switches in `CenterStage` seamlessly. (considered: Lifting chat state to Context — rejected because it's localized UI state and the existing orchestrator handles cross-pipeline intent)*

## 5. Risk Assessment
- **Agent Execution Time**: The `stitch-loop` orchestrating multiple generation cycles via Stitch MCP will consume substantial execution time during the implementation phase. — *[Traces To: REQ-1] This is the inherent cost of generating a fully cohesive design programmatically. (considered: Manual targeted CSS updates — rejected because it risks an inconsistent and outdated theme)*
- **Context & Logic Preservation**: The complex, deterministic calculators in `TaxWizard` and `FIRERoadmap` might break if the newly generated React components overwrite or drop crucial state hooks (`useWhatIf`, etc.) during integration. — *[Traces To: REQ-5] We must surgically replace only the presentation layer (JSX) without touching the hooks and side-effects. (considered: Full component rewrite — rejected because the deterministic logic is heavily evaluated in the hackathon rubric)*
- **Mobile Responsiveness**: A 3-column layout on mobile devices will force extreme vertical stacking, which could make the page unnavigable. — *[Traces To: REQ-2] We must implement CSS breakpoints that gracefully hide or collapse the left sidebar and right chatbot on smaller screens to ensure core data usability. (considered: Separate mobile views — rejected because of implementation overhead)*

## 6. Success Criteria
- The Chatbot is successfully detached from the main content and pinned to the right side on desktop layouts.
- A fresh Stitch design system (`DESIGN.md`) is integrated into the styling.
- The 3-column layout is responsive, collapsing or stacking appropriately on smaller viewports.
- All original `TaxWizard`, `FIRERoadmap`, and `PortfolioXRay` logic, state, and API functionality continue to work seamlessly within the new aesthetic wrappers.