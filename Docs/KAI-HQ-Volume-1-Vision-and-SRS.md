# KAI HQ
## Volume 1 — Vision & Software Requirements Specification

**Document Status:** Draft v1.0
**Author:** Kamalesh Suresh Kumar (Product Owner) — prepared with KAI HQ Engineering Documentation Team
**Classification:** Internal Engineering Document
**Related Documents:** Volume 2 (Experience Design Document), Volume 3 (Technical Design Document)

---

## 0. Document Control

| Field | Value |
|---|---|
| Document ID | KAI-HQ-V1-SRS |
| Version | 1.0 |
| Status | Draft for Implementation Planning |
| Owner | Kamalesh Suresh Kumar |
| Reviewers | Principal Software Architect, Product Manager, UX Lead |
| Next Volume | Volume 2 — Experience Design Document |

### Revision History

| Version | Date | Description |
|---|---|---|
| 0.1 | Initial | Concept capture from project brief |
| 1.0 | Current | First complete SRS |

---

## 1. Executive Summary

KAI HQ is a personal software product that reframes the conventional "developer portfolio" as a navigable, character-guided digital headquarters. Rather than presenting a sequence of scrollable sections, the product simulates arriving at a facility that "boots up," introduces an AI representative (KAI), and allows a visitor to move between purpose-built rooms, each surfacing a different facet of the developer's work: projects, skills, achievements, documents (resumes/certificates), and contact.

The system is designed to run entirely as a static, serverless site (GitHub Pages), with no authentication, no database, and no paid infrastructure, while remaining architecturally prepared for a future automated pipeline that converts source documents (e.g., resumes) into a structured, searchable knowledge base, and eventually into a true conversational AI layer.

This document (Volume 1) defines **why** KAI HQ is being built, **who** it serves, and **what** it must do and not do. It intentionally excludes visual design (Volume 2) and implementation architecture (Volume 3); those volumes build directly on the requirement IDs defined here.

---

## 2. Problem Statement

Technical recruiters, hiring managers, and engineering peers evaluate dozens of portfolios that look structurally identical: a hero section, an about section, a project grid, a skills list, and a contact form. This sameness produces two failures:

1. **Forgettability** — the candidate's differentiated engineering ability does not register, because the delivery mechanism is generic.
2. **Shallow evaluation** — a static page rewards scanning, not exploration, so deeper artifacts (multiple tailored resumes, project internals, certificates) are rarely discovered.

KAI HQ addresses both failures by making the *exploration mechanism itself* a demonstrated engineering artifact — the portfolio becomes a system, not a document.

---

## 3. Vision Statement

> "Don't browse my portfolio. Explore my headquarters."

KAI HQ exists to make one specific impression on every visitor: that the developer who built this can design, architect, and ship a coherent, accessible, non-trivial interactive system — and that this same rigor is what they would bring to an employer's product.

The headquarters is the primary product. KAI (the robot/assistant) is a guide inside it, not the product itself. This distinction is a governing constraint for every subsequent design and technical decision (see REQ-ARCH-001).

---

## 4. Background & Project Evolution

The project underwent four conceptual iterations before reaching its current form. This history is retained in this document because it constrains scope creep — each earlier concept represents a scope the project has deliberately moved away from:

| Iteration | Concept | Why it was superseded |
|---|---|---|
| 1 | Standard developer portfolio | Indistinguishable from thousands of others |
| 2 | AI Robot Portfolio | Robot became a gimmick without a supporting environment |
| 3 | Voice Assistant Portfolio | Over-indexed on a single input modality; poor accessibility if voice fails |
| 4 | AI Receptionist Portfolio | Framed the assistant as the product, not the guide |
| 5 (current) | **KAI HQ** | Headquarters is the product; KAI is the guide; multi-modal by design |

**Design implication:** Any future feature proposal that re-centers the robot as the primary product (e.g., "make the chatbot smarter" as the headline feature) is a regression to iteration 2–4 and must be flagged against this document.

---

## 5. Goals

### 5.1 Business Goals

| ID | Goal | Success Signal |
|---|---|---|
| BG-01 | Differentiate the developer in recruiter/peer evaluation | Qualitative recall in interviews; portfolio referenced by name |
| BG-02 | Demonstrate breadth: frontend engineering, architecture, UX, automation | Volume 3 traceability shows all disciplines represented in shipped code |
| BG-03 | Operate at zero recurring cost | $0/month hosting, no paid services in MVP |
| BG-04 | Minimize ongoing maintenance burden | Resume/content updates require no code changes (data-driven) |

### 5.2 Technical Goals

| ID | Goal |
|---|---|
| TG-01 | Fully static deployment on GitHub Pages with no backend for MVP |
| TG-02 | Central "Experience Engine" mediates all cross-module communication |
| TG-03 | Modular "Knowledge Engine" decoupled from UI and from the assistant |
| TG-04 | Every experience feature has a graceful non-JS / non-WebGL / non-audio fallback |
| TG-05 | Architecture supports future AI/LLM integration without structural rewrite |

---

## 6. Target Users / Personas

### Persona A — "The Recruiter" (Priya)
Non-technical or semi-technical talent sourcer. Spends 30–90 seconds per candidate. Needs to quickly confirm role fit, download a resume, and find contact details. Time-constrained; abandons anything confusing.

**Primary needs:** fast orientation, obvious resume access, low cognitive load, working experience without audio (often browsing muted in an office).

### Persona B — "The Hiring Manager / Senior Engineer" (Arjun)
Technical evaluator assessing engineering judgment, not just resume content. Will inspect project internals, code quality signals, and how the site itself is built. Curious, will intentionally test edge cases (disable JS, resize window, try keyboard-only nav).

**Primary needs:** depth on demand, credible technical detail, respect for their time but reward for deeper exploration.

### Persona C — "The Peer / Engineering Community Visitor" (Divya)
Fellow student or developer, arrives via shared link (LinkedIn, GitHub, Discord). Motivated by curiosity and inspiration; likely to explore fully and share it further.

**Primary needs:** delight, novelty, shareability, an experience worth remembering and referencing.

### Persona D — "The Developer / Owner" (Kamalesh)
Not a visitor but a first-class user of the system: must be able to add a project, update a resume, or add a certificate without redesigning any part of the system.

**Primary needs:** low-friction content updates via static JSON, no redeployment complexity beyond `git push`.

---

## 7. Scope

### 7.1 In Scope (MVP)

- SC-01: A navigable "headquarters" shell with distinct rooms (Lobby, Engineering Laboratory, Memory Archive, Achievement Hall, Document Vault, Communication Center, Skill Processor, Mission Control)
- SC-02: KAI assistant supporting text-based interaction at minimum; voice as a progressive enhancement
- SC-03: Static JSON-backed Knowledge Engine covering projects, skills, timeline, certificates, resumes, contact
- SC-04: Search across the knowledge base (client-side, e.g., Fuse.js-class fuzzy search)
- SC-05: Resume storage and retrieval (Document Vault) with multiple role-tailored resume variants
- SC-06: Full keyboard navigability and screen-reader-compatible fallback experience
- SC-07: Responsive experience across desktop and mobile
- SC-08: Automated build-time pipeline (GitHub Actions) that regenerates the knowledge base when source content changes
- SC-09: Recruiter Mode and Developer Mode as distinct navigation/content emphasis modes

### 7.2 Out of Scope (MVP)

- OS-01: Any backend server, API, or database
- OS-02: User authentication or visitor accounts
- OS-03: A true LLM-backed conversational agent (KAI's MVP responses are rule/data-driven, not generative)
- OS-04: Payment, e-commerce, or any monetization mechanism
- OS-05: Multi-user or multi-tenant support (single-developer product)
- OS-06: Native mobile applications (web-responsive only)
- OS-07: Server-side analytics requiring persistent storage

### 7.3 Explicitly Deferred (Future Expansion, not MVP)

Captured for traceability so Volume 3 can architect without foreclosing these:

- FE-01: Local/offline LLM integration for KAI
- FE-02: Visitor memory across sessions (would require storage/consent design)
- FE-03: Interactive live coding demonstrations
- FE-04: Analytics dashboard for the developer
- FE-05: True generative conversation layer replacing rule-based responses

---

## 8. Functional Requirements

Each requirement includes an ID for cross-volume traceability. Volume 2 will map these to UX flows (UX-IDs) and Volume 3 will map both to implementation.

### 8.1 Headquarters & Navigation

| ID | Requirement | Priority |
|---|---|---|
| REQ-NAV-001 | The system shall present an entry sequence ("power on" boot state) before the main headquarters is interactive. | Must |
| REQ-NAV-002 | The system shall provide at least 8 distinct rooms, each mapped to a distinct content domain (see §9). | Must |
| REQ-NAV-003 | The visitor shall be able to move between rooms via direct navigation (menu/map) without depending on the assistant. | Must |
| REQ-NAV-004 | The system shall support keyboard-only navigation between all rooms and interactive elements. | Must |
| REQ-NAV-005 | The system shall support deep-linking to a specific room via URL route. | Should |
| REQ-NAV-006 | The system shall persist the visitor's current room across a page reload where technically feasible without a backend. | Could |

### 8.2 KAI Assistant

| ID | Requirement | Priority |
|---|---|---|
| REQ-KAI-001 | KAI shall greet the visitor at the start of the session. | Must |
| REQ-KAI-002 | KAI shall support text-based query input at minimum. | Must |
| REQ-KAI-003 | KAI shall support voice input as a progressive enhancement via the Web Speech API, without being required for any core task. | Should |
| REQ-KAI-004 | KAI shall be able to route a visitor to a specific room based on a natural-language request (e.g., "show me your projects"). | Must |
| REQ-KAI-005 | KAI shall be able to answer knowledge-base-backed questions about projects, skills, timeline, and resumes. | Must |
| REQ-KAI-006 | KAI's responses in MVP shall be generated from the static Knowledge Engine (rule/template-based), not a live LLM call. | Must |
| REQ-KAI-007 | The system shall remain fully usable if KAI is disabled or fails to load. | Must |

### 8.3 Knowledge Engine

| ID | Requirement | Priority |
|---|---|---|
| REQ-KNOW-001 | The system shall expose a structured, versioned JSON knowledge base covering: projects, skills, timeline, certificates, resumes, contact info. | Must |
| REQ-KNOW-002 | The system shall support full-text fuzzy search across the knowledge base. | Must |
| REQ-KNOW-003 | The Knowledge Engine shall be consumable independently by the search feature, the assistant, and any room's UI, without duplication of data. | Must |
| REQ-KNOW-004 | The system shall support an automated build-time process that regenerates derived knowledge artifacts when source files change. | Should |
| REQ-KNOW-005 | The Knowledge Engine schema shall be versioned to allow non-breaking future extension. | Should |

### 8.4 Document Vault (Resumes/Certificates)

| ID | Requirement | Priority |
|---|---|---|
| REQ-DOC-001 | The system shall store multiple role-tailored resume variants (e.g., Backend, Frontend, Full Stack, Cybersecurity). | Must |
| REQ-DOC-002 | The visitor shall be able to view and download any available resume variant directly. | Must |
| REQ-DOC-003 | The system shall display certificates/achievements with associated metadata (issuer, date, credential link if available). | Should |
| REQ-DOC-004 | Resume source files added to the repository shall become searchable without manual re-indexing by the developer. | Should |

### 8.5 Modes

| ID | Requirement | Priority |
|---|---|---|
| REQ-MODE-001 | The system shall provide a Recruiter Mode that emphasizes fast orientation: resume access, contact, role fit summary. | Should |
| REQ-MODE-002 | The system shall provide a Developer Mode that emphasizes technical depth: architecture notes, code links, engineering write-ups. | Should |
| REQ-MODE-003 | Mode switching shall not require a page reload. | Could |

### 8.6 Accessibility & Fallback

| ID | Requirement | Priority |
|---|---|---|
| REQ-ACC-001 | The system shall be fully operable without a microphone or speaker. | Must |
| REQ-ACC-002 | The system shall be fully operable with animations disabled (respecting `prefers-reduced-motion`). | Must |
| REQ-ACC-003 | The system shall provide a functional fallback if WebGL is unavailable. | Must |
| REQ-ACC-004 | Core content (projects, resume, contact) shall remain accessible with JavaScript disabled, where technically practical (e.g., via static HTML fallback or pre-rendering). | Should |
| REQ-ACC-005 | The system shall meet WCAG 2.1 AA contrast and interaction guidelines. | Must |

### 8.7 Deployment & Automation

| ID | Requirement | Priority |
|---|---|---|
| REQ-DEPLOY-001 | The system shall deploy to GitHub Pages with zero recurring hosting cost. | Must |
| REQ-DEPLOY-002 | The system shall require no backend server or database for MVP operation. | Must |
| REQ-DEPLOY-003 | The system shall use GitHub Actions to automate build and deployment on push. | Must |
| REQ-DEPLOY-004 | The system shall automate knowledge base regeneration as part of the CI pipeline when qualifying source files change. | Should |

---

## 9. Room-to-Domain Mapping (Preview for Volume 2)

This mapping is a requirements-level anchor; Volume 2 will expand each into a full experience description.

| Room | Content Domain | Primary Requirement(s) |
|---|---|---|
| Lobby | Entry, greeting, orientation | REQ-NAV-001, REQ-KAI-001 |
| Engineering Laboratory | Projects | REQ-KNOW-001, REQ-KAI-005 |
| Memory Archive | Timeline / history | REQ-KNOW-001 |
| Achievement Hall | Certificates, achievements | REQ-DOC-003 |
| Document Vault | Resumes | REQ-DOC-001, REQ-DOC-002 |
| Communication Center | Contact | REQ-KNOW-001 |
| Skill Processor | Skills | REQ-KNOW-001, REQ-KNOW-002 |
| Mission Control | Search / overview / mode switch | REQ-KNOW-002, REQ-MODE-001, REQ-MODE-002 |

---

## 10. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-PERF-001 | Performance | Initial meaningful paint under 2.5s on a median mobile connection (simulated 4G). |
| NFR-PERF-002 | Performance | 3D/animated scenes shall degrade gracefully on low-end devices (frame-rate-aware degradation). |
| NFR-A11Y-001 | Accessibility | WCAG 2.1 AA compliance across all static fallback views. |
| NFR-SEC-001 | Security | No collection of personally identifiable visitor data without explicit consent; no third-party trackers by default. |
| NFR-MAINT-001 | Maintainability | Adding a new project or resume shall require only a JSON/content file change, not a code change. |
| NFR-SCALE-001 | Scalability | Knowledge base structure shall support growth to hundreds of entries without redesign. |
| NFR-COMPAT-001 | Compatibility | Full functionality on latest two major versions of Chrome, Firefox, Safari, Edge. |
| NFR-COST-001 | Cost | $0 recurring infrastructure cost for MVP and foreseeable roadmap. |
| NFR-PORT-001 | Portability | No vendor lock-in beyond GitHub Pages; the static output must be deployable to any static host with no code changes. |

---

## 11. Use Cases

### UC-01: Recruiter Quickly Finds and Downloads a Role-Specific Resume
**Actor:** Priya (Recruiter)
**Preconditions:** Visitor arrives at Lobby.
**Flow:**
1. Visitor is greeted by KAI.
2. Visitor states or selects intent: "I'm hiring for a Backend role."
3. System suggests Recruiter Mode and routes to the Document Vault, pre-filtering to the Backend resume variant.
4. Visitor downloads the resume.
**Postcondition:** Resume downloaded in under 60 seconds from landing.
**Related Requirements:** REQ-KAI-004, REQ-MODE-001, REQ-DOC-002

### UC-02: Hiring Manager Inspects a Specific Project in Depth
**Actor:** Arjun (Hiring Manager)
**Flow:**
1. Visitor navigates directly to the Engineering Laboratory.
2. Visitor searches "Li-Fi" via Mission Control search.
3. System surfaces the matching project with technical detail and links.
**Postcondition:** Visitor can assess technical depth without assistant interaction.
**Related Requirements:** REQ-KNOW-002, REQ-NAV-003

### UC-03: Peer Visitor Explores Fully via Voice
**Actor:** Divya (Peer)
**Flow:**
1. Visitor enables microphone when prompted (optional).
2. Visitor asks KAI, "What's the coolest thing you've built?"
3. KAI responds and offers to navigate to the corresponding room.
**Postcondition:** Visitor experiences the full multimodal interaction.
**Related Requirements:** REQ-KAI-003, REQ-KAI-004

### UC-04: Visitor with JavaScript Disabled Reaches Core Content
**Actor:** Any visitor with restrictive browser settings
**Flow:**
1. Visitor loads the site with JS disabled.
2. Visitor sees a static fallback: navigation links, project summaries, resume download links, contact info.
**Postcondition:** No core information is unreachable.
**Related Requirements:** REQ-ACC-004

### UC-05: Developer Adds a New Resume Variant
**Actor:** Kamalesh (Developer)
**Flow:**
1. Developer adds a new resume file to the repository's resume source directory.
2. CI pipeline regenerates the knowledge base index on push.
3. New resume becomes available in Document Vault and searchable via Knowledge Engine without further code changes.
**Postcondition:** Zero-code content update.
**Related Requirements:** REQ-DOC-004, REQ-KNOW-004, REQ-DEPLOY-004

---

## 12. User Stories

| ID | Story | Acceptance Criteria (summary) | Linked Requirement(s) |
|---|---|---|---|
| US-01 | As a recruiter, I want to download a role-specific resume within a minute of arriving, so that I can screen quickly. | Resume downloadable within 3 navigation actions from Lobby. | REQ-DOC-002, REQ-MODE-001 |
| US-02 | As a hiring manager, I want to search projects by keyword, so that I can verify specific technical experience. | Search returns relevant project(s) for a matching keyword in under 300ms client-side. | REQ-KNOW-002 |
| US-03 | As a peer visitor, I want to talk to KAI naturally, so that the experience feels novel and personal. | Voice or text query routed correctly to relevant room in at least 90% of tested phrasings. | REQ-KAI-003, REQ-KAI-004 |
| US-04 | As a visitor using a screen reader, I want full access to project and resume content, so that I am not excluded. | All core content passes automated + manual screen-reader audit. | REQ-ACC-005 |
| US-05 | As the developer, I want to add a project by editing a JSON file, so that I don't need to touch UI code for content updates. | New project appears in Engineering Laboratory and search after a content-only commit. | NFR-MAINT-001 |
| US-06 | As a visitor on a low-end device, I want the experience to remain smooth, so that I don't bounce due to lag. | Scene degrades (reduced particle/3D complexity) below a defined FPS threshold. | NFR-PERF-002 |

---

## 13. Success Metrics

| Metric | Target | Notes |
|---|---|---|
| Time-to-resume-download (recruiter flow) | < 60 seconds | Primary conversion metric |
| Full accessibility audit pass rate | 100% of Must-priority REQ-ACC items | Gate for launch |
| Hosting cost | $0/month | Hard constraint, not aspirational |
| Content update turnaround (new project/resume) | No code change required | Validates NFR-MAINT-001 |
| Cross-browser functional parity | 100% on last 2 versions of major browsers | Validates NFR-COMPAT-001 |
| Qualitative recall | Portfolio referenced unprompted in at least one interview/interaction | Directional, not strictly measurable pre-launch |

---

## 14. Risks & Mitigations

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-01 | Over-investment in animation/3D at the expense of core usability (resume/contact access) | High | Medium | REQ-ACC and Recruiter Mode requirements are Must-priority and gate launch |
| RISK-02 | Voice/mic dependency alienates a large share of visitors | High | Medium | Voice is explicitly Should-priority, never Must; REQ-KAI-007 mandates full functionality without KAI |
| RISK-03 | Static JSON knowledge base becomes inconsistent with actual resume files | Medium | Medium | REQ-KNOW-004/REQ-DEPLOY-004 automate regeneration via CI |
| RISK-04 | Scope creep toward a "real" LLM integration delays MVP | Medium | Medium | OS-03 explicitly excludes this from MVP; FE-05 defers it |
| RISK-05 | GitHub Pages static-hosting constraints block a desired feature (e.g., server-side logic) | Medium | Low | TG-01/REQ-DEPLOY-002 make static-first a governing constraint from day one |
| RISK-06 | Single-developer maintenance bandwidth limits scope | Medium | High | NFR-MAINT-001 keeps content updates code-free; roadmap phases work |

---

## 15. Roadmap

| Phase | Scope | Depends On |
|---|---|---|
| Phase 0 — Foundation | Project scaffolding, Experience Engine skeleton, static fallback shell | Volume 3 |
| Phase 1 — Core Rooms | Lobby, Engineering Laboratory, Document Vault, Communication Center, static content wired to Knowledge Engine | Phase 0 |
| Phase 2 — KAI Text Assistant | Rule/template-based KAI with room-routing and knowledge Q&A | Phase 1 |
| Phase 3 — Remaining Rooms & Modes | Memory Archive, Achievement Hall, Skill Processor, Mission Control, Recruiter/Developer Modes | Phase 1 |
| Phase 4 — Voice & Motion Enhancement | Web Speech API integration, GSAP/Three.js enhancements, reduced-motion fallback validation | Phase 3 |
| Phase 5 — Automation | GitHub Actions pipeline for knowledge base regeneration from resume sources | Phase 1 |
| Phase 6 — Accessibility Hardening & Launch | Full WCAG audit, cross-browser QA, performance budget validation | All prior phases |
| Future — Deferred Items (FE-01–FE-05) | Not scheduled; revisit post-launch | Phase 6 |

---

## 16. Assumptions

| ID | Assumption |
|---|---|
| AS-01 | The developer will maintain resume/content files in a consistent, parseable format (e.g., Markdown or structured JSON) suitable for automated indexing. |
| AS-02 | GitHub Pages remains a viable free static hosting option for the project's lifetime at current scope. |
| AS-03 | Visitor devices support modern evergreen browsers (last two major versions); no legacy IE support required. |
| AS-04 | No legal/compliance requirement exists for cookie consent banners in MVP, given no tracking/PII collection (subject to re-evaluation if analytics are added later). |
| AS-05 | The single-developer maintenance model is acceptable for the product's expected lifespan and audience size. |

---

## 17. Out-of-Scope Clarification Table

To prevent ambiguity during implementation, the following are explicitly **not** part of MVP even though related terms appear in the vision brief:

| Term in Brief | MVP Interpretation |
|---|---|
| "KAI is NOT an LLM" | MVP KAI is rule/template + Knowledge-Engine-driven; no live model calls |
| "Future AI integration" | Architecture must allow it (TG-05); it is not implemented in MVP |
| "Developer Mode" / "Recruiter Mode" | Content emphasis/navigation bias only; not separate authentication-gated experiences |
| "Interactive Coding Demonstrations" | Deferred (FE-03); not in MVP room set |

---

## 18. Glossary

| Term | Definition |
|---|---|
| **KAI HQ** | The overall product: the digital headquarters and its systems. |
| **KAI** | The AI assistant character; digital representative of the developer within KAI HQ. |
| **Experience Engine** | The central coordinating layer mediating between UI, navigation, robot, and knowledge (defined fully in Volume 3). |
| **Knowledge Engine** | The modular subsystem exposing structured, searchable portfolio data. |
| **Room** | A distinct navigable area of the headquarters mapped to one content domain (see §9). |
| **Document Vault** | The room and subsystem responsible for resume/certificate storage and retrieval. |
| **Recruiter Mode / Developer Mode** | Navigation and content-emphasis states optimized for different visitor intents. |
| **MVP** | Minimum Viable Product — the scope defined in §7.1. |

---

## 19. Acceptance Criteria (Document-Level)

This Volume 1 is considered complete and ready to gate Volume 2 when:

- [ ] Every functional requirement has a unique ID and priority.
- [ ] Every persona has at least one mapped use case.
- [ ] Every use case references at least one requirement ID.
- [ ] Scope, out-of-scope, and deferred items are unambiguous and non-overlapping.
- [ ] Success metrics are measurable or explicitly marked directional.
- [ ] No implementation detail (visual design, code architecture) has leaked into this document — those belong to Volumes 2 and 3 respectively.

---

## 20. Forward Reference to Volume 2

Volume 2 (Experience Design Document) will take every requirement in §8 and §9 and convert it into:

- A full visitor journey narrative
- Room-by-room experience descriptions (wireframe-level, not visual-design-level)
- KAI's personality and conversation style
- Interaction and animation principles consistent with REQ-ACC-002/003
- Recruiter Mode / Developer Mode UX flows (REQ-MODE-001/002)
- Mobile and desktop experience variants
- Fallback experience design satisfying REQ-ACC-004

No requirement introduced here will be redefined in Volume 2 — only realized as experience.

---

*End of Volume 1. Proceed to Volume 2 — Experience Design Document.*
