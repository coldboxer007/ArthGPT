---
task_complexity: medium
---
# Implementation Plan: Frontend UI Revamp (AI Money Mentor)

## Plan Overview
- **Total Phases**: 4
- **Agents Involved**: `design_system_engineer`, `coder`, `code_reviewer`
- **Execution Strategy**: Sequential (Phases 1, 2) and Parallel (Phase 3 components)

## Dependency Graph
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4

## Execution Strategy
| Phase | Agent | Model | Est. Input | Est. Output | Est. Cost |
|-------|-------|-------|-----------|------------|----------|
| 1 | `design_system_engineer` | Gemini Pro | 1000 | 500 | $0.03 |
| 2 | `coder` | Gemini Flash | 1500 | 800 | $0.01 |
| 3 | `coder` | Gemini Flash | 3000 | 1200 | $0.02 |
| 4 | `code_reviewer` | Gemini Flash | 2000 | 400 | $0.01 |
| **Total** | | | **7500** | **2900** | **$0.07** |

## Phase Details

### Phase 1: Establish the New Design System
- **Objective**: Generate a new `.stitch/DESIGN.md` establishing the "Fresh AI Mentor Theme" to replace the Navy/Gold palette.
- **Agent Assignment**: `design_system_engineer`
- **Files to Create**: `.stitch/DESIGN.md`
- **Files to Modify**: None
- **Validation Criteria**: The `DESIGN.md` file must exist and contain specific color hexes, typography, and spacing tokens.
- **Dependencies**: `blocked_by`: [], `blocks`: [2]

### Phase 2: Refactor Dashboard Layout
- **Objective**: Create the 3-column layout (Sidebar, CenterStage, ChatMentor) in `Dashboard.tsx` and extract the Chatbot to a new component.
- **Agent Assignment**: `coder`
- **Files to Create**: `src/components/ChatMentor.tsx`
- **Files to Modify**: `src/components/Dashboard.tsx`
- **Validation Criteria**: Run `npm run build`. The dashboard must use a 3-column grid structure.
- **Dependencies**: `blocked_by`: [1], `blocks`: [3]

### Phase 3: Vertical Stacking Refactor of Tabs
- **Objective**: Refactor the dense data views to stack vertically instead of side-by-side to fit the narrower center column.
- **Agent Assignment**: `coder`
- **Files to Create**: None
- **Files to Modify**: `src/components/PortfolioXRay.tsx`, `src/components/FIRERoadmap.tsx`, `src/components/TaxWizard.tsx`
- **Validation Criteria**: Run `npm run build`. CSS classes like `flex-row` should be replaced with `flex-col` in target containers.
- **Dependencies**: `blocked_by`: [2], `blocks`: [4]

### Phase 4: Integration & Quality Assurance
- **Objective**: Review the final codebase to ensure state management (`AnalysisContext`) and deterministic calculators remain unbroken.
- **Agent Assignment**: `code_reviewer`
- **Files to Modify**: None
- **Validation Criteria**: `npm run lint` and `npm run build` must succeed without errors. Ensure `useWhatIf` and other hooks are preserved.
- **Dependencies**: `blocked_by`: [3], `blocks`: []

## File Inventory
- `.stitch/DESIGN.md` (Phase 1)
- `src/components/Dashboard.tsx` (Phase 2)
- `src/components/ChatMentor.tsx` (Phase 2)
- `src/components/PortfolioXRay.tsx` (Phase 3)
- `src/components/FIRERoadmap.tsx` (Phase 3)
- `src/components/TaxWizard.tsx` (Phase 3)

## Risk Classification
- **Phase 1**: LOW (Only generates markdown specs)
- **Phase 2**: MEDIUM (Layout changes might break existing CSS if not careful)
- **Phase 3**: HIGH (Refactoring complex components could accidentally remove state logic)
- **Phase 4**: LOW (Read-only review phase)

## Execution Profile
- Total phases: 4
- Parallelizable phases: 0
- Sequential-only phases: 4