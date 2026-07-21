# KAI HQ
## Volume 3 — Technical Design Document

**Document Status:** Draft v1.0
**Classification:** Internal Engineering Document
**Continues From:** Volume 1 (Vision & SRS), Volume 2 (Experience Design Document)

This document assumes Volumes 1 and 2 as read. It does not restate requirements or UX decisions; it implements them, referencing `REQ-*`/`NFR-*`/`US-*` (Volume 1) and `UX-*` (Volume 2) IDs throughout.

---

## 0. Document Control

| Field | Value |
|---|---|
| Document ID | KAI-HQ-V3-TDD |
| Version | 1.0 |
| Depends On | KAI-HQ-V1-SRS, KAI-HQ-V2-XD |

---

## 1. Purpose of This Volume

Volume 3 defines the buildable system: project structure, component/module boundaries, state management, the Experience Engine and Knowledge Engine internals, the automation pipeline, and the non-functional engineering guarantees (performance, testing, security, deployment) needed to satisfy Volumes 1 and 2 within the constraint of a static, backend-free deployment (TG-01, REQ-DEPLOY-001–004).

---

## 2. Architectural Overview

### 2.1 Governing Architecture (from Volume 1 §12, now made concrete)

```
Visitor
  │
  ▼
Headquarters Shell (React app, static-hosted)
  │
  ▼
Experience Engine  ◄──────────────┐
  │        │        │             │
  ▼        ▼        ▼             │
Navigation  KAI     Rooms         │
  │        Module   (UI)          │
  │          │        │           │
  │          ▼        │           │
  │     Conversation  │           │
  │       Router      │           │
  │          │        │           │
  └──────────┴────────┴──► Knowledge Engine (read-only, static JSON + index)
                                   │
                                   ▼
                          Portfolio Data (build-time generated)
                                   ▲
                                   │
                    GitHub Actions Automation Pipeline
                                   ▲
                                   │
                     Source Content (resumes, projects, certs — Markdown/JSON)
```

**Architectural Decision AD-01 — Single mediator (Experience Engine).** All cross-module communication (navigation state, KAI's current focus, active mode, search state) flows through the Experience Engine, never directly between Rooms and KAI, or between KAI and Navigation. This directly implements UX-004's "single source of truth" requirement and TG-02.

**Architectural Decision AD-02 — Knowledge Engine is read-only at runtime.** All portfolio data is generated at build time by the automation pipeline into static, versioned JSON. There is no runtime write path, no database, and no API — satisfying REQ-DEPLOY-002 and NFR-COST-001 absolutely, not approximately.

**Architectural Decision AD-03 — Fallback-first rendering.** The static/no-JS fallback (UX-007) is not a degraded version of the React app; it is a separately guaranteed HTML output produced by the same build pipeline, described in §9.

---

## 3. Technology Stack (confirmed from Volume 1 §14, with rationale)

| Layer | Technology | Rationale |
|---|---|---|
| Build tool | Vite | Fast dev/build, native ESM, static output suited to GitHub Pages |
| UI framework | React + TypeScript | Component model matches Room/Object metaphor (Volume 2 §9); TS gives schema-safety across the Knowledge Engine boundary |
| Styling | TailwindCSS | Enforces a constrained design-token system consistent with Volume 2 §13 |
| Animation | GSAP (timeline-based transitions) + Framer Motion (component-level micro-interactions) | GSAP for orchestrated room-transition sequences; Framer Motion for declarative, interruptible UI-level motion (Volume 2 §9 principle 2) |
| 3D/Environment | Three.js | Renders headquarters environment layer only; never the sole carrier of text content (Volume 2 §13) |
| Search | Fuse.js | Lightweight client-side fuzzy search over the static Knowledge Engine index, no server round-trip |
| Voice | Web Speech API | Native browser API, zero dependency, naturally optional/progressive (REQ-KAI-003) |
| CI/CD | GitHub Actions | Free, integrates natively with GitHub Pages deployment |
| Hosting | GitHub Pages | REQ-DEPLOY-001 |
| Data format | Static JSON (generated) + source Markdown/YAML frontmatter | Human-editable source, machine-consumable output |

---

## 4. Project Structure

```
kai-hq/
├── .github/
│   └── workflows/
│       ├── build-knowledge-base.yml     # regenerates knowledge/*.json on content change
│       └── deploy.yml                   # build + deploy to GitHub Pages
├── content/                             # human-edited source of truth (US-05, REQ-DOC-004)
│   ├── projects/*.md                    # frontmatter + body per project
│   ├── resumes/*.pdf + *.meta.json      # resume files + variant metadata
│   ├── certificates/*.json
│   ├── timeline/*.json
│   ├── skills/*.json
│   └── contact.json
├── scripts/
│   └── build-knowledge-base/            # Node scripts: parse content/ -> knowledge/*.json
│       ├── index.ts
│       ├── parsers/
│       └── schema/                      # Zod schemas, versioned (REQ-KNOW-005)
├── public/
│   └── fallback/                        # pre-rendered static fallback HTML (UX-007, AD-03)
├── src/
│   ├── main.tsx
│   ├── app/
│   │   └── HeadquartersShell.tsx
│   ├── experience-engine/               # AD-01
│   │   ├── ExperienceEngineProvider.tsx
│   │   ├── state/
│   │   │   ├── navigationSlice.ts
│   │   │   ├── kaiSlice.ts
│   │   │   ├── modeSlice.ts
│   │   │   └── themeSlice.ts
│   │   └── selectors/
│   ├── knowledge-engine/                # TG-03, modular, decoupled
│   │   ├── KnowledgeEngine.ts           # loads generated JSON, exposes typed query API
│   │   ├── searchIndex.ts               # Fuse.js index builder
│   │   └── types.ts                     # generated/shared types, mirrors schema/
│   ├── kai/
│   │   ├── ConversationRouter.ts        # REQ-KAI-004/005/006 — rule/template engine
│   │   ├── intents/                     # intent definitions (navigate, query, search)
│   │   ├── responses/                   # response templates
│   │   └── voice/
│   │       └── SpeechAdapter.ts         # Web Speech API wrapper, optional
│   ├── rooms/
│   │   ├── Lobby/
│   │   ├── EngineeringLaboratory/
│   │   ├── MemoryArchive/
│   │   ├── AchievementHall/
│   │   ├── DocumentVault/
│   │   ├── CommunicationCenter/
│   │   ├── SkillProcessor/
│   │   └── MissionControl/
│   ├── components/
│   │   ├── navigation/                  # map affordance, command bar, breadcrumb
│   │   ├── content-objects/             # ProjectSpecimen, ResumeDocument, CertificateObject, etc.
│   │   ├── assistant/                   # KAI avatar/presence, conversation surface
│   │   └── system-feedback/             # boot sequence, transition indicators, mode indicator
│   ├── environment/                     # Three.js scene(s), GSAP timelines
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── knowledge/                           # BUILD OUTPUT (gitignored or committed as build artifact)
│   ├── projects.json
│   ├── resumes.json
│   ├── certificates.json
│   ├── timeline.json
│   ├── skills.json
│   ├── contact.json
│   └── searchIndex.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Cross-reference:** `content/` → `knowledge/` mapping is the concrete implementation of REQ-KNOW-004/DEPLOY-004 (automated regeneration) and US-05 (code-free content updates).

---

## 5. Experience Engine — Detailed Design

Implements AD-01, TG-02, and UX-004.

### 5.1 Responsibilities

- Owns the single navigation state (`currentRoomId`, navigation history, deep-link sync with URL).
- Owns KAI's focus state (what KAI is currently referencing) so that conversational and manual navigation stay consistent.
- Owns active Mode (`recruiter | developer | neutral`) — UX-006.
- Owns theme/reduced-motion state, sourced from both system preference (`prefers-reduced-motion`) and any explicit user override.
- Exposes a single public API (`useExperienceEngine()` hook) — no component reads or writes navigation/mode/KAI state through any other channel.

### 5.2 State Shape (illustrative)

```ts
interface ExperienceState {
  navigation: {
    currentRoomId: RoomId;
    history: RoomId[];
    isTransitioning: boolean;
  };
  kai: {
    isActive: boolean;
    lastIntent: Intent | null;
    conversationLog: ConversationTurn[];
  };
  mode: 'neutral' | 'recruiter' | 'developer';
  accessibility: {
    reducedMotion: boolean;
    voiceEnabled: boolean;
  };
}
```

### 5.3 Navigation Flow (sequence diagram, text form)

```
User Action (map click | command bar | KAI intent)
        │
        ▼
ExperienceEngine.navigateTo(roomId, source)
        │
        ├─► validate roomId against Knowledge Engine room registry
        ├─► update navigation.currentRoomId
        ├─► push URL state (History API) — REQ-NAV-005
        ├─► if source === 'kai', append conversationLog entry
        └─► emit transition event → environment/ (GSAP/Three.js) OR
                                     → instant state change if reducedMotion (REQ-ACC-002)
```

This single flow guarantees UX-004's parity requirement: regardless of entry point (map, command bar, KAI), the same function executes, so state can never diverge.

### 5.4 Why not Redux/global singleton pattern by default

Given the app's bounded scope (8 rooms, no server sync, no multiplayer), React Context + `useReducer` inside `ExperienceEngineProvider` is sufficient and keeps the dependency surface minimal (supports NFR-MAINT-001 by keeping the codebase approachable for a solo maintainer). If future expansion (FE-02 visitor memory, FE-04 analytics) increases state complexity materially, this can be swapped for Zustand without changing the public `useExperienceEngine()` API — the provider boundary is the intentional seam.

---

## 6. Knowledge Engine — Detailed Design

Implements TG-03, REQ-KNOW-001–005.

### 6.1 Responsibilities

- Loads generated static JSON (`knowledge/*.json`) at app init.
- Exposes a typed, read-only query API: `getProjects(filter?)`, `getResumeVariants()`, `getSkills(category?)`, `getTimeline()`, `getCertificates()`, `getContact()`.
- Builds and exposes the Fuse.js search index (`search(query): SearchResult[]`) consumed identically by Mission Control's UI and by KAI's `ConversationRouter` — this shared consumption is the concrete fulfillment of REQ-KNOW-003 ("consumable independently... without duplication").

### 6.2 Schema Versioning (REQ-KNOW-005)

Each generated JSON file carries a `schemaVersion` field. The `KnowledgeEngine` loader checks compatibility at init and fails loudly in development (console error) if a mismatch is detected, while degrading gracefully in production (ignoring unknown fields) — preventing a stale build from silently breaking the fallback experience.

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-07-21T00:00:00Z",
  "items": [ /* ... */ ]
}
```

### 6.3 Example Schema — Project Entry

```ts
interface ProjectEntry {
  id: string;
  title: string;
  domain: 'backend' | 'frontend' | 'cybersecurity' | 'devops' | 'other';
  summary: string;              // 1-paragraph, per UX-ROOM-02
  stack: string[];
  links: { repo?: string; demo?: string };
  engineeringDecision?: string; // optional callout, per UX-ROOM-02
  relatedSkillIds: string[];    // cross-reference to Skill Processor, UX-ROOM-07
}
```

### 6.4 Example Schema — Resume Variant

```ts
interface ResumeVariant {
  id: string;
  label: string;                 // e.g., "Backend Developer"
  bestFor: string;                // one-line descriptor, per UX-ROOM-05
  fileUrl: string;                 // static asset path
  lastUpdated: string;             // ISO date
}
```

---

## 7. Conversation Engine (KAI) — Detailed Design

Implements REQ-KAI-001–007 and Volume 2 §4's conversation rules.

### 7.1 Architecture

`ConversationRouter` is a pure, rule-based intent classifier — **explicitly not** a call to a generative LLM API in MVP (REQ-KAI-006, OS-03). Structure:

```
User Input (text or voice-transcribed text)
        │
        ▼
IntentClassifier (pattern/keyword matching + lightweight scoring)
        │
        ├─► NavigateIntent   → ExperienceEngine.navigateTo(roomId, 'kai')
        ├─► QueryIntent      → KnowledgeEngine.get*() → ResponseTemplate
        ├─► SearchIntent     → KnowledgeEngine.search() → ResponseTemplate
        └─► UnknownIntent    → fallback response ("I don't have that on file. Want me to search instead?")
```

### 7.2 Why rule-based, and the future AI seam (TG-05)

`ConversationRouter` exposes a single interface, `resolve(input: string): ConversationResult`, consumed by the UI layer. Its internal implementation (pattern-matching in MVP) is fully encapsulated behind this interface. A future generative backend (FE-05) would implement the same interface (e.g., calling an external API), swapped in without touching any consuming component — this is the architectural guarantee requested by TG-05 without speculative over-engineering of the MVP itself.

### 7.3 Voice Layer

`SpeechAdapter` wraps the Web Speech API behind a feature-detection boundary. If unsupported or permission is denied, the text input path is unaffected — `ConversationRouter` never knows or cares whether input arrived via typing or speech (REQ-KAI-003 stays strictly additive).

---

## 8. Automation Pipeline (CI/CD)

Implements REQ-DEPLOY-003/004, REQ-KNOW-004, US-05.

### 8.1 `build-knowledge-base.yml` (triggered on push affecting `content/**`)

```
1. Checkout
2. Install Node deps
3. Run scripts/build-knowledge-base (parses content/*, validates against Zod schema/)
4. Fail the build if any content file fails schema validation (protects data integrity)
5. Write knowledge/*.json + searchIndex.json
6. Commit generated artifacts (or pass as build artifact to deploy job)
```

### 8.2 `deploy.yml` (triggered on push to main, or on completion of the above)

```
1. Checkout
2. Install deps
3. Run knowledge-base build (idempotent — safe to re-run)
4. vite build (produces dist/, including public/fallback/ static pages)
5. Deploy dist/ to GitHub Pages
```

### 8.3 Fallback Page Generation

A dedicated pre-render step (Node script using the same `KnowledgeEngine` query API against the generated JSON) emits static HTML per room into `public/fallback/`, ensuring the fallback (UX-007) is generated from the *same data source* as the interactive app — eliminating any risk of the two experiences diverging in content, only in interactivity.

---

## 9. Fallback Rendering Strategy (AD-03, realizing UX-007)

| Concern | Interactive App | Fallback |
|---|---|---|
| Data source | `KnowledgeEngine` at runtime (client-side JSON fetch) | Same `KnowledgeEngine` API, invoked at build time |
| Output | React SPA | Static semantic HTML, one file per room + index |
| Navigation | Experience Engine-mediated | Plain `<a href>` links between static pages |
| Search | Fuse.js client-side | Static sitemap-style index (no interactive search, per Volume 2 §11) |
| Resume access | Document Vault UI | Direct `<a href download>` links, identical file targets |

This guarantees REQ-ACC-004 is met structurally, not through best-effort progressive enhancement alone — the fallback is a genuine build output, testable independently (see §14).

---

## 10. Room-to-Component Mapping

| Room (UX-ID) | Primary Component(s) | Knowledge Engine Query |
|---|---|---|
| Lobby (`UX-ROOM-01`) | `rooms/Lobby/Lobby.tsx` | `getContact()` (identity summary), room registry |
| Engineering Laboratory (`UX-ROOM-02`) | `rooms/EngineeringLaboratory/*` + `ProjectSpecimen` | `getProjects(filter)` |
| Memory Archive (`UX-ROOM-03`) | `rooms/MemoryArchive/*` | `getTimeline()` |
| Achievement Hall (`UX-ROOM-04`) | `rooms/AchievementHall/*` + `CertificateObject` | `getCertificates()` |
| Document Vault (`UX-ROOM-05`) | `rooms/DocumentVault/*` + `ResumeDocument` | `getResumeVariants()` |
| Communication Center (`UX-ROOM-06`) | `rooms/CommunicationCenter/*` | `getContact()` |
| Skill Processor (`UX-ROOM-07`) | `rooms/SkillProcessor/*` | `getSkills(category)` |
| Mission Control (`UX-ROOM-08`) | `rooms/MissionControl/*` | `search()`, mode slice |

---

## 11. Animation & Performance System

Implements Volume 2 §10 and NFR-PERF-001/002.

### 11.1 Budget-Aware Degradation

A lightweight runtime FPS sampler (rolling average over ~2s windows) informs a `performanceTier` value (`high | medium | low`) exposed via the Experience Engine's accessibility/theme slice. `environment/` (Three.js scene) subscribes to this tier to reduce particle counts, shadow quality, and post-processing at `low`, and to disable 3D entirely in favor of a static gradient background at the lowest tier — satisfying NFR-PERF-002 without a manual settings menu requirement (though one may be exposed as a Should-priority enhancement).

### 11.2 Reduced Motion

`accessibility.reducedMotion` (sourced from `prefers-reduced-motion` media query, §5.2) is checked once at the top of every GSAP timeline and Framer Motion variant definition; when true, transition durations are set to 0 and only opacity cross-fades are used — directly implementing Volume 2 §10's reduced-motion parity rule.

### 11.3 Performance Budget

| Asset Class | Budget |
|---|---|
| Initial JS bundle (critical path) | ≤ 180KB gzipped |
| Three.js + environment assets | Lazy-loaded after Lobby's critical content is interactive |
| Fonts | Subsetted, `font-display: swap` |
| Images | WebP/AVIF with static fallback formats |

These budgets are the concrete target supporting NFR-PERF-001's 2.5s meaningful-paint requirement.

---

## 12. State Management Summary

| State Domain | Owner | Persistence |
|---|---|---|
| Navigation, KAI focus, Mode, Accessibility prefs | Experience Engine (React Context + `useReducer`) | Session-only by default; URL sync for deep-linking (REQ-NAV-005); `localStorage` persistence for Mode/reduced-motion override is a Could-priority enhancement, not required for MVP |
| Portfolio content | Knowledge Engine | Build-time static, runtime read-only, in-memory cache after first load |
| Search index | Knowledge Engine | Built once at load from `searchIndex.json`, held in memory |

No global client-side database or IndexedDB usage is required for MVP, consistent with REQ-DEPLOY-002's spirit even though that requirement technically addresses server-side backend absence.

---

## 13. Coding Standards & Naming Conventions

- **Language:** TypeScript strict mode enabled project-wide; no `any` in `knowledge-engine/` or `experience-engine/` (these are the system's contracts and must be fully typed).
- **Component naming:** PascalCase, noun-based, matching the "object not control" principle (Volume 2 §9) — e.g., `ProjectSpecimen`, not `ProjectCard`.
- **File organization:** Co-located styles/tests with components; shared cross-cutting logic only in `hooks/` and `utils/`.
- **Commit convention:** Conventional Commits (`feat:`, `fix:`, `content:` — a custom type for `content/**`-only changes to distinguish content updates from code changes in history, reinforcing NFR-MAINT-001's visibility).
- **Linting/Formatting:** ESLint + Prettier, enforced in CI (`deploy.yml` fails on lint error).

---

## 14. Testing Strategy

| Layer | Approach | Key Targets |
|---|---|---|
| Schema validation | Zod schema checks in `build-knowledge-base` pipeline | Every `content/**` file, fails build on violation |
| Unit tests | Vitest | `ConversationRouter` intent classification, `KnowledgeEngine` query API, Experience Engine reducers |
| Component tests | React Testing Library | Room components render correctly given mock Knowledge Engine data |
| Accessibility tests | axe-core (automated) + manual screen-reader pass | Gates launch per REQ-ACC-005/NFR-A11Y-001 |
| Fallback parity tests | Script comparing fallback HTML content against live Knowledge Engine data | Ensures §9's "same data source" guarantee holds over time |
| E2E | Playwright | Critical paths: UC-01 (resume download), UC-02 (project search), UC-04 (no-JS fallback reachability) |
| Performance | Lighthouse CI in pipeline | Enforces NFR-PERF-001 budget as a CI gate, not just a design intent |

---

## 15. Security Considerations

Given the no-backend, no-auth, no-database architecture (AD-02), the attack surface is deliberately minimal:

| Concern | Mitigation |
|---|---|
| XSS via content files | Content is authored by the sole developer and passes through schema-validated, typed parsing — no arbitrary HTML injection path from `content/**` into rendered output without escaping |
| Third-party script risk | Dependencies pinned via lockfile; CI includes `npm audit` (or equivalent) as a non-blocking warning step initially, promotable to blocking later |
| Data exposure | No PII collected (NFR-SEC-001); all knowledge base content is intentionally public-facing portfolio data |
| Supply chain | GitHub Actions workflows pinned to specific action versions (not floating tags) |

---

## 16. Browser Support & Compatibility

Consistent with NFR-COMPAT-001: last two major versions of Chrome, Firefox, Safari, Edge. Feature-detection (not user-agent sniffing) gates all progressive enhancements (WebGL via `Three.js` capability check, voice via `SpeechRecognition` presence check, motion via `matchMedia('(prefers-reduced-motion)')`).

---

## 17. Scalability & Maintainability

- **Content scale (NFR-SCALE-001):** JSON-array-based schema per content type scales linearly; Fuse.js indexing remains performant into the low thousands of entries, far beyond this project's realistic growth.
- **Maintainability (NFR-MAINT-001):** Verified concretely by US-05's acceptance criterion — adding `content/projects/new-project.md` and pushing is the *entire* workflow for a new project to appear across Engineering Laboratory, search, and KAI's knowledge, with zero code changes, enforced by the pipeline in §8.
- **Portability (NFR-PORT-001):** `dist/` output is a plain static bundle; no GitHub Pages-specific runtime dependency exists in application code (only the deploy workflow is GitHub-specific), so migration to any static host is a CI-config change, not a code change.

---

## 18. Versioning Strategy

- **Application:** Semantic versioning (`package.json`), tagged releases correspond to Roadmap phases (Volume 1 §15).
- **Knowledge schema:** Independently versioned (`schemaVersion`, §6.2) since content structure may evolve faster than application code.
- **Content:** Implicitly versioned via Git history; `lastUpdated` fields on resumes/projects are the visitor-facing versioning signal (per UX-ROOM-05).

---

## 19. Future AI Integration Path (realizing TG-05, FE-01/FE-05)

Because `ConversationRouter.resolve()` (§7.2) is the sole interface consumed by UI, a future integration would:

1. Implement an alternate `ConversationRouter` (e.g., `LLMConversationRouter`) calling an external or local model, still constrained to only ever return structured `ConversationResult` objects (never raw untyped text that bypasses `NavigateIntent`/`QueryIntent` handling) — preserving REQ-KAI-007's guarantee that the rest of the system never depends on KAI succeeding.
2. Reuse the existing `KnowledgeEngine` as the grounding/context source (already the shared data layer per REQ-KNOW-003), avoiding duplicate data plumbing.
3. Be feature-flagged via the Experience Engine's existing slices pattern (§5), allowing instant rollback to the rule-based router without a structural rewrite — directly satisfying TG-05's "without requiring a redesign" constraint.

No other volume or component requires modification for this future path to be viable, which is the explicit test of whether this architecture satisfies TG-05.

---

## 20. Full Traceability Matrix (Volume 1 → Volume 2 → Volume 3)

| Req ID (V1) | UX ID (V2) | Implementation (V3) |
|---|---|---|
| REQ-NAV-001 | UX-001 | `components/system-feedback/BootSequence.tsx`, skip handler |
| REQ-NAV-002/003 | §7 rooms, UX-003/004 | §10 room-to-component mapping, `experience-engine/` |
| REQ-NAV-005 | — | URL sync in `navigationSlice.ts` (§5.3) |
| REQ-KAI-001–007 | §4, room "KAI's role" | §7 Conversation Engine |
| REQ-KNOW-001–005 | §7 room content | §6 Knowledge Engine, `content/` → `knowledge/` pipeline |
| REQ-DOC-001–004 | UX-ROOM-05, UX-005 | §6.4 schema, §10 mapping, §8 automation |
| REQ-MODE-001–003 | §8 (V2), UX-006 | `modeSlice.ts` (§5.2) |
| REQ-ACC-001–005 | §10–11 (V2), UX-007 | §9 Fallback Rendering Strategy, §11.2 reduced motion |
| REQ-DEPLOY-001–004 | — | §8 Automation Pipeline, AD-02, AD-03 |
| NFR-PERF-001/002 | §10 (V2) animation principles | §11 Animation & Performance System |
| NFR-A11Y-001 | §11 (V2) | §14 Testing Strategy (axe-core gate) |
| NFR-MAINT-001 | — | §4 project structure, §17 |
| NFR-COST-001 | — | AD-02, §3 stack (all free/OSS) |
| TG-05 | — | §19 Future AI Integration Path |

---

## 21. Acceptance Criteria (Document-Level)

Volume 3 is complete and implementation-ready when:

- [ ] Every UX-ID from Volume 2 has a corresponding component/module mapping (§10).
- [ ] Every architectural decision (AD-01–03) is justified against a specific requirement.
- [ ] The fallback rendering strategy is independently testable (§14) and provably data-consistent with the interactive app (§9).
- [ ] The automation pipeline covers the full content-to-deployment path with no manual step required beyond a Git push (§8).
- [ ] A future AI integration path exists and requires no changes outside `kai/` (§19).
- [ ] The full traceability matrix (§20) has no orphaned requirement or UX-ID.

---

## 22. Summary — What This Three-Volume Set Establishes

Volume 1 defined a disciplined, traceable set of requirements resisting scope creep back into earlier project iterations (robot-as-product, voice-as-dependency, LLM-as-MVP-requirement). Volume 2 converted those requirements into a coherent, accessible experience where spectacle is strictly additive to a fully functional core. Volume 3 shows that this experience is buildable entirely as a static, zero-cost, low-maintenance system — while leaving a clean, non-speculative seam for the generative AI capability the project's name (KAI) ultimately gestures toward.

The system satisfies its own founding constraint at every layer: **the headquarters is the product; KAI is the guide.**

---

*End of Volume 3. End of KAI HQ Engineering Documentation Set (Volumes 1–3).*
