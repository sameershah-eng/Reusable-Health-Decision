# Clara Health — Women's Health Decision Support Framework

Clara is a patient-directed clinical decision-support framework designed for complex, sensitive healthcare choices. Rather than dispensing automated medical advice or acting as an unpredictable generative chatbot, Clara provides a calm, evidence-grounded 5-stage longitudinal journey: **Context → Understand → Decision → Observe → Learn**.

The platform is engineered around an **immutable snapshot rule**: when a user records a decision, Clara takes a frozen, tamper-proof snapshot of the exact context version, clinical considerations, and open clinician questions present at that moment. Subsequent changes to live context generate new version increments without altering historical decision briefs.

---

## Key Features

1. **Agnostic Architecture**:
   - Zero hardcoded topic logic in `/src/core`.
   - Topics (e.g., *Hormone Replacement Therapy* and *Thermage RF Tightening*) are registered purely via typed configuration files.
2. **5-Stage Longitudinal Journey**:
   - **Context**: Structured questionnaire with soft "I'm not sure / skip" options on every field.
   - **Understand**: Clear separation between "What you told us" and "What we don't know yet" (soft outlined chips detailing clinical significance). Three perspectives: *Yourself*, *Science* (graded evidence cards), and *Others* (illustrative real-world stories).
   - **Decision**: Printable clinical Decision Brief with open questions for your doctor, choice selection, reasoning, confidence score, and baseline observation tracking.
   - **Observe**: Simulated follow-up (+6 weeks mock clock) to re-evaluate metrics and test snapshot immutability.
   - **Learn**: Retrospective Before → Decision → After comparison with Recharts visual deltas, drift alerts, and a permanent Learning Record.
3. **Synthetic Reviewer Scenarios (Demo Tools Drawer)**:
   - 4 pre-seeded personas: *Elena Vance* (Complete HRT), *Claire Jenkins* (High Unknowns), *Maya Lin* (Context Drift), and *Chloe Zhang* (Thermage).
   - Quick clock advance (+6 weeks), JSON data export, reset to default seed, and runtime API provider mode toggle (`mock` vs `http`).
4. **Clinical Neutrality**:
   - Explicit disclaimers, no chatbots, no automated treatment prescriptions, and WCAG AA accessible editorial styling.

---

## Directory Layout

```
/src
  /core
    /journey        -> Topic-agnostic journey engine & stage definitions
    /components     -> Shared UI primitives (Stepper, QuestionRenderer, SummaryPanel,
                       PerspectiveTabs, EvidenceCard, StoryCard, DecisionBriefCard,
                       ObservationTracker, ComparisonView, Button, Card, Chip, Slider, Modal)
    /logic          -> Pure business logic: buildSummary, detectUnknowns, evaluateRules,
                       createSnapshot, compareBeforeAfter
  /domain
    types.ts        -> TypeScript interfaces for all domain entities
    schemas.ts      -> Zod schemas for runtime validation
  /topics
    registry.ts     -> TopicRegistry for dynamic registration & retrieval
    /hrt            -> Hormone Replacement Therapy (config, evidence, stories, rules)
    /thermage       -> Minimal Thermage radiofrequency topic proving extensibility
  /services
    interfaces.ts   -> Service contracts (Context, Decision, Content, Observation, Learning)
    /mock           -> LocalStorage-backed implementation with simulated latency (200-350ms)
    /http           -> Typed fetch stubs matching service contracts
    index.ts        -> ServiceProvider selecting mock or http via VITE_API_MODE
  /data
    /seed           -> 4 synthetic test personas & longitudinal records
  /state            -> Zustand state management (journeyStore, uiStore)
  /pages            -> Routes: HomePage (Topic Picker), JourneyPage, HistoryPage
```

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

The application will be served at `http://localhost:3000`.

### 3. Running Unit Tests

```bash
npm run test
```

Runs the Vitest suite testing `createSnapshot` (immutability and deep freeze), `detectUnknowns`, `evaluateRules`, and `compareBeforeAfter`.

### 4. Production Build

```bash
npm run build
```

---

## Environment Variables

Defined in `.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_MODE` | Active service implementation: `mock` (localStorage + simulated latency) or `http` (REST API stubs) | `mock` |
| `VITE_API_BASE_URL` | Base URL for remote backend when `VITE_API_MODE=http` | `/api` |

---

## How the Journey Engine Works

The journey engine (`/src/core/journey/journeyEngine.ts`) evaluates user progress independently of any specific medical domain:

1. **Accessibility Logic**: A stage is unlocked when prerequisites are satisfied (e.g., Context must have initial engagement before Understand; Decision must be recorded before Observe; Observe must have completed follow-up before Learn).
2. **Snapshot Engine**: When a user selects a decision, `createSnapshot()` executes a deep clone of the current context version, evaluates all topic rules, builds the Decision Brief, and runs `Object.freeze()` on all nested levels.
3. **Context Drift Detection**: If a user updates their health answers after a decision is made, the context version increments (e.g., from v1 to v2). The engine detects the mismatch between `currentContext.version` and `snapshot.contextVersion` and surfaces a prominent notice explaining that the historical decision remains anchored to v1.
