# KAI HQ
## Volume 2 — Experience Design Document

**Document Status:** Draft v1.0
**Classification:** Internal Engineering Document
**Continues From:** Volume 1 (Vision & Software Requirements Specification)
**Precedes:** Volume 3 (Technical Design Document)

This document assumes Volume 1 as read. It does not restate requirements; it references them by ID (`REQ-*`, `NFR-*`, `US-*`) and assigns each experience decision a new **UX-ID** for downstream traceability into Volume 3.

---

## 0. Document Control

| Field | Value |
|---|---|
| Document ID | KAI-HQ-V2-XD |
| Version | 1.0 |
| Depends On | KAI-HQ-V1-SRS |
| Feeds Into | KAI-HQ-V3-TDD |

---

## 1. Purpose of This Volume

Volume 1 established *what* the system must do. This volume converts that into *how it feels to experience it* — without yet specifying implementation. Every UX decision below is traceable to a requirement, and every UX-ID introduced here will be referenced in Volume 3 as the target that architecture must serve.

---

## 2. Experience Philosophy

Three governing principles discipline every decision in this document:

1. **The headquarters is the product; KAI is the guide.** (Reaffirms the constraint from Volume 1 §3.) No screen, room, or interaction should require KAI to be functional or present. This directly operationalizes REQ-KAI-007.
2. **Depth on demand, not depth by default.** A recruiter (Persona A) must be able to ignore all spectacle and get a resume in under a minute (US-01). A hiring manager (Persona B) must be able to go arbitrarily deep without the system resisting them (UC-02). The experience must serve both without forcing either into the other's path.
3. **Every enhancement is optional; every core function survives its absence.** Voice, 3D, and animation are enhancements layered onto a fully functional static core (REQ-ACC-001–004). This document designs the fallback experience *first*, then layers spectacle on top — not the reverse.

---

## 3. Headquarters Story (Narrative Frame)

The visitor is not "loading a website" — narratively, they are requesting remote access to a private engineering headquarters. The frame is deliberately light — this is a portfolio, not a game, and the story must never block or gate access to content (this is a hard boundary against RISK-01 from Volume 1).

**Narrative beats:**

1. **Access Requested** — a minimal, fast-loading holding state (not a long cinematic) confirms the visitor's connection is being established.
2. **Power On** — the headquarters interface resolves into view; ambient visual/audio (optional, muted by default) suggests systems activating.
3. **KAI Online** — KAI greets the visitor (REQ-KAI-001) and offers two paths: browse independently (REQ-NAV-003) or state an intent to KAI (REQ-KAI-004).
4. **Free Exploration** — the visitor moves through rooms at will for the remainder of the session.

**Design constraint UX-001:** The Power On sequence must be skippable within 1 interaction (tap/click/Esc) and must never exceed 3 seconds even if not skipped, to protect US-01's 60-second budget. *(Traces to REQ-NAV-001, NFR-PERF-001.)*

---

## 4. KAI — Personality & Conversation Style

KAI is a **colleague giving a tour**, not a customer-service chatbot and not a sci-fi character doing a bit. Tone calibration:

| Attribute | KAI is... | KAI is NOT... |
|---|---|---|
| Register | Concise, warm, competent | Verbose, deferential, ceremonious |
| Humor | Light, dry, occasional | Constant, jokey, distracting |
| Confidence | States facts about the developer directly ("He built...") | Hedging or self-deprecating |
| Framing | Third-person about the developer, first-person about itself | Pretending to *be* the developer |

**Conversation style rules (UX-002):**
- Responses default to 1–2 sentences, with an explicit offer to go deeper ("Want the technical breakdown?") rather than front-loading detail. This serves both Persona A (skims) and Persona B (opts into depth) without a mode switch.
- KAI always names the room it is navigating to before transitioning ("Taking you to the Engineering Laboratory.") so navigation is predictable even for users relying on a screen reader (REQ-ACC-005).
- KAI never fabricates — if the Knowledge Engine has no matching entry, KAI states that plainly and offers the closest alternative (search fallback), rather than generating a plausible-sounding non-answer. This is the experience-level expression of REQ-KAI-006 (rule/template, not generative).

**Sample exchanges (illustrative, not final copy):**

> Visitor: "What's the coolest thing you've built?"
> KAI: "Probably the Li-Fi penetration testing project — he built and demoed two custom protocols to an actual cybercrime police department. Want to see it?"

> Visitor: "Show me backend projects."
> KAI: "Filtering the Engineering Laboratory to backend work now."

---

## 5. Visitor Journey Map

| Stage | Visitor State | System Response | Requirements Served |
|---|---|---|---|
| Arrival | Unknown intent | Fast Power On sequence, skippable | UX-001, REQ-NAV-001 |
| Orientation | Deciding path | KAI greets + offers Recruiter/Developer framing without forcing a choice | REQ-MODE-001/002 |
| Declared or Inferred Intent | Recruiter, technical evaluator, or peer | System biases navigation/content emphasis accordingly | REQ-KAI-004 |
| Exploration | Free browsing | All rooms reachable via persistent navigation, independent of KAI | REQ-NAV-003 |
| Deep Dive (optional) | Investigating one artifact | Room-level detail, search, related links | REQ-KNOW-002 |
| Conversion | Resume download / contact | Low-friction, always ≤3 actions from any room | US-01 |
| Exit | Session ends | No forced retention pattern (no exit-intent popups, no nag modals) | Philosophy §2 |

**Design constraint UX-003:** No room shall be more than 2 navigation actions from any other room, enforced via a persistent navigation affordance (not solely via KAI). *(Traces to REQ-NAV-003.)*

---

## 6. Navigation System

Not a menu — a **navigation system**, per the brief's design philosophy. Three coexisting, always-available methods, satisfying REQ-NAV-003/004 and the multi-modal input goal from Volume 1 §6:

1. **Spatial map affordance** — a persistent, minimal control (e.g., a corner-anchored headquarters map/index) listing all 8 rooms, usable by mouse, touch, or keyboard (Tab + Enter).
2. **Command/search bar** — type-ahead access to any room or content entry, usable without ever engaging KAI conversationally. Serves keyboard-first and screen-reader users primarily.
3. **Conversational routing** — asking KAI to take you somewhere (REQ-KAI-004), an alternative *path* to the same destinations, never the only path.

**Design constraint UX-004:** All three methods must resolve to the same underlying navigation state (single source of truth) so that "where am I" is never ambiguous across input methods — this anticipates the Experience Engine's mediating role (Volume 1 §12) and will be a direct input to Volume 3's state management design.

---

## 7. Room-by-Room Experience Design

Each room description below follows a fixed template: **Purpose → What the visitor sees/does → Primary content → KAI's role → Fallback behavior**, and is assigned a UX-ID.

### 7.1 Lobby — `UX-ROOM-01`
**Purpose:** Orientation and entry point (REQ-NAV-001, REQ-KAI-001).
**Experience:** First room after Power On. Presents a short, scannable summary of the developer (role, focus areas) and the two soft path affordances (Recruiter / Developer framing) without gating.
**Primary content:** One-line identity statement, current roles (CSE undergrad, two internships), links to all other rooms.
**KAI's role:** Greets, offers orientation questions.
**Fallback:** Static hero section with the same identity statement and a plain navigation list; fully readable with JS disabled (REQ-ACC-004).

### 7.2 Engineering Laboratory — `UX-ROOM-02`
**Purpose:** Projects (REQ-KNOW-001, REQ-KAI-005).
**Experience:** A filterable collection of project "specimens" (objects, not cards — per Volume 1's design philosophy). Filters by domain (Backend, Frontend, Cybersecurity, DevOps) rather than an undifferentiated grid.
**Primary content:** Project title, one-paragraph summary, tech stack, links (repo/demo), and — where applicable — a short "engineering decision" callout (e.g., the Li-Fi RX 2.0/3.0 protocol work).
**KAI's role:** Can filter or highlight a project on request; explains technical decisions if asked.
**Fallback:** Static list grouped by domain heading, all links present as plain anchors.

### 7.3 Memory Archive — `UX-ROOM-03`
**Purpose:** Timeline / history (REQ-KNOW-001).
**Experience:** Chronological record of education, internships (Viyuga Innovations, Infosys SpringBoard), NCC (Navy Wing) leadership, and IEEE Computer Society Event Team role — presented as a timeline, not a resume duplicate.
**Primary content:** Dated entries with short context, distinguishing overlapping commitments (e.g., internship concurrent with NCC/IEEE roles) clearly rather than implying a single linear career path.
**KAI's role:** Can answer "when did X happen" or "what was he doing during Y" queries.
**Fallback:** Static ordered list, reverse-chronological.

### 7.4 Achievement Hall — `UX-ROOM-04`
**Purpose:** Certificates and achievements (REQ-DOC-003).
**Experience:** A gallery-style room; each achievement is an "object" with issuer, date, and credential link if available. Not merged with the Document Vault, since achievements are evidentiary/credentialing content, distinct from resumes (deliverable documents).
**Primary content:** Certificate name, issuing body, date, verification link.
**KAI's role:** Can surface achievements relevant to a stated interest (e.g., "cybersecurity" → surfaces relevant certs alongside the Li-Fi project cross-reference to `UX-ROOM-02`).
**Fallback:** Static list/table.

### 7.5 Document Vault — `UX-ROOM-05`
**Purpose:** Resume storage/retrieval (REQ-DOC-001/002).
**Experience:** The highest-priority conversion point for Persona A. Presents all resume variants (Backend, Frontend, Full Stack, Cybersecurity Analyst) as clearly labeled, immediately downloadable objects — no interaction required beyond one click/tap.
**Primary content:** Resume variant name, one-line "best for" descriptor, direct download action, last-updated date.
**KAI's role:** Can pre-filter to the most relevant variant based on stated recruiter intent (UC-01), but never *requires* this path.
**Fallback:** Static download links, fully functional with JS disabled — this is the single most important fallback in the system given US-01's conversion priority.

**Design constraint UX-005:** The Document Vault must be reachable in ≤2 actions from the Lobby via at least one of the three navigation methods (UX-004), independent of KAI. *(Directly protects the 60-second budget in US-01/Metric table §13 of Volume 1.)*

### 7.6 Communication Center — `UX-ROOM-06`
**Purpose:** Contact (REQ-KNOW-001).
**Experience:** Direct, low-friction contact methods (email, LinkedIn, GitHub) presented plainly — this room deliberately resists over-design, since its job is to get out of the way.
**Primary content:** Contact channels, optionally a lightweight message affordance (mailto-based; no backend form processing, consistent with REQ-DEPLOY-002).
**KAI's role:** Minimal — may confirm channels on request.
**Fallback:** Static mailto/profile links.

### 7.7 Skill Processor — `UX-ROOM-07`
**Purpose:** Skills (REQ-KNOW-001/002).
**Experience:** Skills presented grouped by category (Languages, Frameworks, Infrastructure, Domains) rather than an undifferentiated tag cloud, with proficiency context implied by project cross-references rather than unverifiable self-rated bars/percentages (a deliberate credibility choice).
**Primary content:** Skill name, category, linked project(s) demonstrating it (cross-reference to `UX-ROOM-02`).
**KAI's role:** Can answer "does he know X" and link to demonstrating project.
**Fallback:** Static grouped list.

### 7.8 Mission Control — `UX-ROOM-08`
**Purpose:** Search, overview, and mode switching (REQ-KNOW-002, REQ-MODE-001/002).
**Experience:** The system's command surface — global search across the entire Knowledge Engine, plus the Recruiter Mode / Developer Mode toggle. This is also where a returning or exploratory visitor gets a full map of the headquarters at a glance.
**Primary content:** Search input, mode toggle, full room index.
**KAI's role:** Search can be typed directly or requested conversationally; results are identical either way (single source of truth, UX-004).
**Fallback:** Static search is not feasible without JS; fallback is a complete static sitemap-style index of all content, satisfying REQ-ACC-004 without requiring functional search.

---

## 8. Recruiter Mode vs. Developer Mode (UX-006)

These are **content-emphasis and default-navigation states**, not gated experiences (per Volume 1 §17's scope clarification — no authentication, no separate builds).

| Aspect | Recruiter Mode | Developer Mode |
|---|---|---|
| Default landing emphasis after Lobby | Document Vault, contact | Engineering Laboratory, architecture notes |
| Project card density | Summary-first, one-line technical detail | Full technical detail expanded by default |
| KAI's default response length | Shorter, action-oriented | Longer, technically detailed |
| Achievement Hall framing | Credentialing/verification emphasis | Skill-demonstration emphasis |

**Design constraint:** Switching modes must never hide content — only reorder emphasis and default expansion state. This preserves REQ-NAV-003 (navigation independent of any single path) and prevents Mode from becoming a de facto access-control mechanism, which is explicitly out of scope.

---

## 9. Interaction Principles

1. **Every interactive element is an object, not a control.** A resume is not a "download button," it is a document you pick up. This is a framing discipline for Volume 3's component naming and Volume 2's copywriting, not a claim about literal 3D objects — the metaphor must hold even in the 2D static fallback.
2. **No interaction is irreversible or destructive.** All navigation is non-modal; back/forward and direct re-navigation always work (REQ-NAV-005 deep-linking supports this).
3. **KAI never interrupts.** KAI responds to input; it does not proactively pop up unsolicited messages during free exploration, avoiding the "nagging assistant" failure mode common to chatbot portfolios.
4. **Every animated transition has a non-animated equivalent state, not just a shorter version of itself.** Satisfies `prefers-reduced-motion` (REQ-ACC-002) as a first-class state, not a degraded afterthought.

---

## 10. Animation Principles

| Principle | Rule |
|---|---|
| Purposeful motion only | Animation communicates a state change (room transition, KAI speaking, load state) — never decorative-only motion on static content. |
| Budget-aware | Animation complexity scales down automatically under a measured frame-rate threshold (serves NFR-PERF-002; exact thresholds specified in Volume 3). |
| Interruptible | Any in-progress transition can be interrupted by a new navigation action without visual glitching or blocked input. |
| Reduced-motion parity | With `prefers-reduced-motion` engaged, all transitions become instant or cross-fade only; no content is exclusively conveyed through motion. |

---

## 11. Accessibility & Fallback Experience (Design-Level)

This section is the experience-design counterpart to Volume 1 §8.6/§10; it defines *what the fallback looks like*, not how it's implemented.

**Fallback experience definition (UX-007):** With JavaScript, WebGL, audio, and animation all unavailable simultaneously (worst case), the visitor still receives:
- A static, semantically structured HTML page per room (or a single long-form page with anchored sections) — headings, lists, and links only.
- Full resume access (Document Vault) via direct download links.
- Full contact access (Communication Center) via mailto/profile links.
- A complete site index in place of Mission Control's interactive search.

This fallback is treated as a **first-class designed experience**, not an error state — it is the experience Persona A (time-constrained recruiter) may effectively receive even with full JS available, simply by not engaging with any enhancement layer.

**Screen reader flow:** Room headings use a consistent heading hierarchy (H1 = room name, H2 = content groupings) so that screen-reader users can navigate by heading jump exactly as sighted keyboard users navigate by the map affordance (UX-004 consistency requirement extends here).

---

## 12. Responsive Experience

### 12.1 Desktop Experience
Full spatial navigation affordance (map/index) persistently visible (e.g., docked), generous room content density, KAI presented as a persistent but non-intrusive corner presence.

### 12.2 Mobile Experience
- Spatial map affordance collapses to an explicit toggle (not hidden without indication) to preserve content viewport.
- KAI's conversational input is promoted (bottom-anchored, thumb-reachable) since typing/tapping is the dominant mobile interaction; voice remains optional (REQ-KAI-003 stays Should-priority on mobile too).
- Room content reflows to single-column; the "object" metaphor (§9) is preserved through card-like static presentation rather than 3D-only manipulation.
- Document Vault download actions use native mobile download/share affordances where available.

**Design constraint UX-008:** No functionality available on desktop may be entirely absent on mobile; only density and input emphasis may differ. *(Protects REQ-NAV-003/REQ-DOC-002 parity across devices.)*

---

## 13. Design Language (Direction, Not Final Visual System)

Volume 2 sets direction; final tokens (exact colors, type scale, spacing) are a visual-design implementation detail appropriately owned during build, but the following constraints are binding:

- **Tone:** Technical-facility aesthetic (clean, systemic, slightly industrial-futuristic) — not skeuomorphic sci-fi kitsch, not generic SaaS-portfolio minimalism. It should look unmistakably like *a system*, not *a webpage*.
- **Typography:** A clear technical/monospace accent for system-status and data-driven content (e.g., search results, metadata) paired with a highly legible humanist sans for body content — legibility for Persona A/B is non-negotiable and outranks thematic purity.
- **Color:** A restrained palette with one or two accent colors reserved specifically for interactive/system-state signaling (e.g., "room active," "KAI speaking") so color carries functional meaning, not just decoration.
- **Motion-as-material:** Where 3D/WebGL is used (per TG technology direction, Volume 1 §14), it renders environment and transitions — never blocks access to text content, which always exists as real, selectable, screen-reader-visible DOM content layered appropriately, not baked into canvas/3D-only rendering.

---

## 14. Component Grouping (Experience-Level, Pre-Architecture)

For Volume 3 to design a component hierarchy, this volume groups experience elements into functional families (not yet components):

| Family | Includes | Rooms Using It |
|---|---|---|
| Navigation Family | Map affordance, command/search bar, breadcrumb/current-room indicator | All rooms |
| Assistant Family | KAI avatar/presence, conversation surface, voice toggle | All rooms (persistent) |
| Content Object Family | Project specimen, resume document, certificate object, skill entry, timeline entry, contact channel | Rooms 7.2–7.7 |
| System Feedback Family | Loading/boot states, transition indicators, mode indicator | Lobby, Mission Control, transitions |

---

## 15. UX Flow Summaries (Screen Hierarchy)

```
Entry
 └─ Power On (UX-001, skippable)
     └─ Lobby (UX-ROOM-01)
         ├─ Engineering Laboratory (UX-ROOM-02)
         │    └─ Project Detail (in-room expansion, not a new route necessarily)
         ├─ Memory Archive (UX-ROOM-03)
         ├─ Achievement Hall (UX-ROOM-04)
         ├─ Document Vault (UX-ROOM-05) ── Resume Download (terminal action)
         ├─ Communication Center (UX-ROOM-06) ── Contact action (terminal action)
         ├─ Skill Processor (UX-ROOM-07)
         └─ Mission Control (UX-ROOM-08)
              ├─ Global Search → any room/content object
              └─ Mode Toggle (Recruiter/Developer) → re-emphasizes existing rooms, no new routes
```

All non-Lobby rooms are siblings, mutually reachable within the UX-003 two-action constraint via the Navigation Family (§14), independent of this tree's implied depth.

---

## 16. Cross-Reference Table (Volume 1 → Volume 2)

| Volume 1 Requirement | Volume 2 UX Realization |
|---|---|
| REQ-NAV-001 | UX-001 (Power On sequence) |
| REQ-NAV-002 | §7 (8 rooms defined) |
| REQ-NAV-003 | UX-003, UX-004, §6 (three navigation methods) |
| REQ-KAI-001–007 | §4 (KAI personality/conversation), room "KAI's role" subsections |
| REQ-KNOW-001–005 | §7 room "Primary content" subsections, §15 search flow |
| REQ-DOC-001–004 | UX-ROOM-05, UX-005 |
| REQ-MODE-001–003 | §8, UX-006 |
| REQ-ACC-001–005 | §10, §11, UX-007 |
| REQ-DEPLOY-001–004 | Indirectly honored — no experience decision in this volume assumes a backend |
| US-01–US-06 | §5 journey map, UX-005, §11 fallback definition |

This table closes the loop for Volume 1 traceability and will be extended (not replaced) by an equivalent table in Volume 3 mapping UX-IDs to implementation.

---

## 17. Acceptance Criteria (Document-Level)

Volume 2 is complete and ready to gate Volume 3 when:

- [ ] Every room from Volume 1 §9 has a corresponding UX-ROOM entry with all five template fields.
- [ ] Every UX-ID is traceable to at least one Volume 1 requirement ID (see §16).
- [ ] The fallback experience (§11) is specified concretely enough to be buildable without further design input.
- [ ] No implementation detail (framework choice, state management, file structure) has leaked into this document — those belong to Volume 3.
- [ ] Mobile and desktop experiences are both specified with explicit parity constraints (UX-008).

---

## 18. Forward Reference to Volume 3

Volume 3 (Technical Design Document) will take every UX-ID in this volume and define:

- The Experience Engine architecture realizing the single-source-of-truth navigation state (UX-004)
- The Knowledge Engine schema realizing §7's "Primary content" fields per room
- The KAI conversation/routing implementation realizing §4's conversation rules and REQ-KAI-006's rule-based constraint
- The fallback rendering strategy realizing §11 (static HTML generation approach)
- The animation/performance system realizing §10's budget-aware degradation
- CI/CD automation realizing the content-update flows implied by UX-005 and Volume 1's REQ-KNOW-004

No UX decision made here will be redesigned in Volume 3 — only implemented.

---

*End of Volume 2. Proceed to Volume 3 — Technical Design Document.*
