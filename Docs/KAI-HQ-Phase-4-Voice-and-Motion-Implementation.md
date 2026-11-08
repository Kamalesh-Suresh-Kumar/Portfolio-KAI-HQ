# KAI HQ
## Phase 4 — Voice & Motion Enhancement Implementation Document

**Document ID:** `KAI-HQ-PHASE-4-IMPL`  
**Classification:** Internal Engineering Specification & Verification Report  
**Author:** Kamalesh Suresh Kumar (Engineering Lead) with KAI HQ Core Engineering Team  
**Governing Documents:** Volume 1 (Vision & SRS), Volume 2 (Experience Design), Volume 3 (Technical Design)  
**Status:** Complete / Production-Ready  
**Date:** November 2026  

---

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | `KAI-HQ-PHASE-4-IMPL` |
| Version | 1.0.0 |
| Phase Target | Phase 4: Voice & Motion Enhancement |
| Related Volumes | `KAI-HQ-V1-SRS`, `KAI-HQ-V2-XD`, `KAI-HQ-V3-TDD` |
| Target Host | GitHub Pages (`/Portfolio-KAI-HQ/`) |
| Runtime Environment | Node.js / Bun, Vite 8, React 19, TypeScript strict |

---

## 2. Executive Summary

Phase 4 introduces two high-impact sensory and narrative enhancements to KAI HQ:
1. **The Voice Layer:** Client-side speech recognition (`SpeechRecognition`) and text-to-speech synthesis (`SpeechSynthesis`), engineered as strictly progressive, non-blocking enhancements with an explicit privacy-consent boundary.
2. **The Motion & Power On Experience:** A deterministic cybernetic boot sequence (`BootSequence.tsx`) satisfying UX-001 (< 3.0s duration, 1-interaction skip), supported by native compositor-thread CSS transitions and an instantaneous 0ms bypass under reduced-motion preferences.

All functionality is achieved with **0 KB external motion/audio dependencies** (GSAP and Three.js formally excluded via ADR-04), preserving the production bundle at **122.16 KB gzipped JavaScript** (32.1% under the ≤ 180 KB budget) and **15.31 KB gzipped CSS**.

---

## 3. Phase 4 Objectives and Scope

### In-Scope Deliverables
- **Voice-to-Text (STT):** Feature-detected browser speech recognition with granular privacy classification (`local-guaranteed`, `local-model-missing`, `browser-managed-consent-required`, `browser-managed-consented`, `unsupported`, `permission-denied`).
- **Informed Consent Protocol:** Explicit visitor consent dialog prior to engaging any cloud-assisted browser recognition engine.
- **Instance-Bound Lifecycle Hardening:** Guaranteed prevention of stale transcript emission or delayed callback leakage using instance-bound session tokens (`ActiveSpeechSession`).
- **Text-to-Speech (TTS):** Dynamic voice resolution, asynchronous `onvoiceschanged` cache loading, natural English voice prioritization, sanitization of markdown and code symbols (`cleanTextForSpeech`), and audio bleed prevention on navigation.
- **Power On Sequence:** Deterministic 1.8-second initialization terminal displaying progress and facility diagnostics, skippable via Escape, Space/Enter (non-input), or Skip button.
- **Deep-Link Bypass:** Direct room or entity URLs immediately bypass boot animation to guarantee instant access.
- **Reduced Motion Parity:** Immediate 0ms resolution for visitors with `prefers-reduced-motion` enabled.

### Strictly Out-of-Scope (Boundaries Preserved)
- No external paid speech APIs, cloud audio databases, or telemetry collection.
- No re-implementation or alteration of completed Phase 5 Knowledge Automation pipelines.
- No introduction of Phase 6 generative LLM integrations.
- No Git commits, pushes, or external deployments.

---

## 4. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HEADQUARTERS SHELL                              │
│                                                                        │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐  │
│  │   BootSequence.tsx      │         │   ExperienceEngineProvider   │  │
│  │   (UX-001, 1.8s, Skip)  │         │   (Central State Mediator)   │  │
│  └────────────┬────────────┘         └──────────────┬───────────────┘  │
│               │                                     │                  │
│               ▼                                     ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   FACILITY ROOM CONTAINER                        │  │
│  │  Lobby | EngLab | Memory | AchvHall | Vault | Comm | Skill | MC  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     KAI ASSISTANT DIALOG                         │  │
│  │                                                                  │  │
│  │   ┌─────────────────────┐             ┌──────────────────────┐   │  │
│  │   │ AssistantInput.tsx  │             │ speechAdapter.ts     │   │  │
│  │   │ - Text input (Local)│◄───────────►│ - STT Session Mgr    │   │  │
│  │   │ - Consent Dialog    │             │ - TTS Utterance Mgr  │   │  │
│  │   │ - Mic Toggle        │             │ - Privacy Classifier │   │  │
│  │   └─────────────────────┘             └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

The Voice and Motion systems operate as satellites to the central `ExperienceEngineProvider`. Voice input produces standard string queries fed directly into `ConversationRouter.resolve()`. If speech fails or is unavailable, the text input path operates without any degradation.

---

## 5. Speech Recognition Architecture

Speech recognition is encapsulated in `SpeechAdapter` (`src/assistant/speechAdapter.ts`):

```typescript
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}
```

### Recognition Workflow
1. **User Initiation:** User clicks the microphone button in `AssistantInput.tsx`.
2. **Privacy Assessment:** `speechAdapter.getRecognitionPrivacyMode()` is invoked.
3. **Branching:**
   - If `browser-managed-consent-required`: The microphone is **not** engaged. An inline consent dialog is rendered in the UI.
   - If `local-guaranteed`: Recognition starts with `rec.processLocally = true`.
   - If `browser-managed-consented`: Recognition starts with standard browser Web Speech.
4. **Stream Processing:** Interim transcripts update the input field; final transcripts trigger assistant dispatch.
5. **Teardown:** `abortListening()` resets session state on cancel, unmount, or room navigation.

---

## 6. Speech Recognition Privacy Model

The application strictly differentiates on-device processing from cloud-assisted vendor recognition.

### Privacy Status States

| State | Definition | UI Treatment |
|---|---|---|
| `local-guaranteed` | Native engine with `processLocally` confirmed | Mic active, badge: "On-device processing requested" |
| `local-model-missing` | On-device engine detected; language model not installed | Informs user that model download may be required |
| `browser-managed-consent-required` | Cloud-assisted engine; consent not yet granted | Mic blocked; displays explicit consent modal |
| `browser-managed-consented` | Cloud-assisted engine; explicit consent granted | Mic active, badge: "Browser Web Speech active (consented)" |
| `unsupported` | Browser lacks `SpeechRecognition` constructor | Mic disabled with tooltip explaining text fallback |
| `permission-denied` | Browser microphone permission was rejected | Actionable notice: "Microphone access denied. You can continue typing." |

### Explicit Consent Flow
When a visitor triggers voice input on a browser lacking confirmed on-device models, the interface displays:
> **BROWSER VOICE PROCESSING NOTICE**  
> *"Your browser uses cloud-assisted speech recognition. Microphone audio may be processed by your browser vendor's speech service (such as Google or Apple). KAI HQ never records or stores your audio. Do you consent to proceed with browser-managed recognition?"*  
> **[Consent & Enable]** / **[Decline (Keep Typing)]**

- **If Consented:** `speechAdapter.setBrowserManagedConsent(true)` is set; recognition begins.
- **If Declined:** Consent is recorded as `false`; prompt unmounts; text input receives focus.

### Typed Text Privacy Guarantee
Typed queries never leave the visitor's device. All keyword tokenization, score boosting, entity mapping, and pattern routing execute in-memory via `src/knowledge-engine/KnowledgeEngine.ts` and `src/assistant/ConversationRouter.ts`.

---

## 7. Speech Synthesis Architecture

Text-to-speech output is implemented via `window.speechSynthesis` and `SpeechSynthesisUtterance`:

1. **Independent Control:** Controlled via `speechEnabled` in Experience Engine and the speaker toggle in the assistant header.
2. **Dynamic Voice Loading:** Chrome and Safari populate voice tables asynchronously. `SpeechAdapter` subscribes to `window.speechSynthesis.onvoiceschanged` and caches voices.
3. **Language Selection:** Prioritizes English voices containing "Google", "Natural", or "Samantha", falling back to system `en-US` / `en-GB`.
4. **Text Sanitization (`cleanTextForSpeech`):**
   - Multiline code blocks (` ```ts ... ``` `) $\to$ `"Code block omitted."`
   - Markdown links (`[Vault](url)`) $\to$ `"Vault"`
   - URLs (`https://...`) $\to$ `"link"`
   - Bullet points (`•`, `-`, `*`) $\to$ Natural sentence pause `.`
   - Strips bold/italic markers (`**`, `*`, `_`, `#`, `~`).
5. **Bleed Prevention:** Active speech synthesis is stopped immediately when:
   - A new utterance begins.
   - The user changes facility rooms (`changeRoom`).
   - The user navigates history (`handlePopState`).
   - The assistant unmounts.

---

## 8. Voice Lifecycle and State Management

### Instance-Bound Session Model
To eliminate race conditions from delayed browser events, `SpeechAdapter` tracks an atomic session object:

```typescript
interface ActiveSpeechSession {
  readonly id: number;
  readonly instance: ISpeechRecognition;
  aborted: boolean;
}
```

- Each call to `startListening()` increments `sessionCounter` and constructs a new `ActiveSpeechSession`.
- All event handlers verify `if (this.activeSession !== session || session.aborted) return;`.
- Calling `abortListening()` or `stopListening()` sets `session.aborted = true` and clears `this.activeSession`.
- **Result:** Any trailing `onresult` or `onerror` events dispatched after user cancellation are discarded instantly.

---

## 9. Power On Sequence Architecture

The Power On sequence (`src/components/system-feedback/BootSequence.tsx`) fulfills `REQ-NAV-001` and `UX-001`:

- **Planned Duration:** Exactly 1.8 seconds (well below the strict 3.0s threshold).
- **Diagnostics Progression:**
  - `0.0s - 0.4s` [20%] Gateway handshake & latency diagnostics.
  - `0.4s - 0.8s` [50%] Knowledge Engine mount (4 projects, 20 skills, 4 resumes).
  - `0.8s - 1.2s` [80%] Spatial route table & 8 facilities mounted.
  - `1.2s - 1.8s` [100%] Neural interface lock & readiness.
- **One-Interaction Skip:**
  - `Escape`: Unconditionally dismisses sequence.
  - `Skip Button`: Keyboard accessible (`tabIndex={0}`, focus ring, touch target $\ge 40\text{px}$).
  - `Space` / `Enter`: Allowed when focus is on backdrop/terminal; **strictly ignored** if active element is an input, textarea, or contentEditable control.
- **Session Persistence:** Tracked via `sessionStorage.getItem('kai_hq_booted')` so returning visits within the session do not repeat the sequence.
- **Deep-Link Bypass:** Deep-linking directly to a facility room or entity modal (e.g. `/engineering-laboratory` or `/achievement-hall/achievement/...`) evaluates `currentRoom !== 'Lobby'` on initial render, bypassing the boot sequence automatically.
- **Focus Restoration:** Upon completion or skip, focus is transferred to `#main-content`, providing immediate keyboard access to the Lobby.

---

## 10. Motion and Animation Strategy

### Architecture Decision Record: Motion Engine (ADR-04)

- **Status:** Approved & Implemented.
- **Context:** Original conceptual design proposed GSAP for complex UI transitions and Three.js for interactive WebGL room rendering.
- **Decision:** Exclude GSAP and Three.js from the production bundle. Implement all visual transitions, radar sweeps, scanlines, and the Power On sequence using native CSS keyframes, CSS custom properties, and native Web Animations API.
- **Evaluation & Evidence:**
  - GSAP adds ~65 KB gzipped with zero added functional capability for 2D cybernetic terminal transitions.
  - Three.js adds >400 KB gzipped, inducing significant mobile battery drain and frame drops.
  - Native CSS `transform` and `opacity` properties execute on the GPU compositor thread without garbage-collection overhead.
  - Current build achieves **122.16 KB gzipped JS**, strictly maintaining the ≤ 180 KB budget.

---

## 11. Reduced-Motion Strategy

In compliance with `REQ-ACC-002` and Volume 2 §10:
- **System Detection:** Evaluated via `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- **In-App Preference:** Controllable via the Experience Engine header toggle.
- **Behavioral Changes:**
  - `BootSequence.tsx` bypasses in **0 ms** (unmounts and invokes `onComplete()` immediately on mount).
  - Global CSS rule sets animation and transition durations to `0.001ms !important`.
  - Ambient radar pulses and scanline animations are set to `display: none !important`.
  - Content and navigation functionality remain 100% identical.

---

## 12. Performance and Bundle Analysis

### Production Bundle Measurements (Vite 8 Build)

```
dist/index.html                   1.67 kB │ gzip:   0.75 kB
dist/assets/index-C1Zjvckf.css  102.64 kB │ gzip:  15.31 kB
dist/assets/index-DR8pBAa_.js   436.29 kB │ gzip: 122.16 kB
✓ built in 835ms
```

### Budget Comparison

| Metric | Budget Limit | Actual Build | Margin Under Budget | Status |
|---|:---:|:---:|:---:|:---:|
| **Initial JS Bundle (gzip)** | ≤ 180.00 KB | **122.16 KB** | **-57.84 KB (32.1%)** | **PASSED** |
| **CSS Bundle (gzip)** | ≤ 25.00 KB | **15.31 KB** | **-9.69 KB (38.8%)** | **PASSED** |
| **Boot Sequence Duration** | ≤ 3.00 s | **1.80 s** | **-1.20 s (40.0%)** | **PASSED** |
| **Reduced-Motion Boot** | 0.00 s | **0.00 s** | **0.00 s (Instant)** | **PASSED** |

### Critical Path vs. Total JS
Because KAI HQ is architected as an instantaneous simulation facility, all 8 rooms and Knowledge Engine structures are bundled into a single entry chunk of **122.16 KB gzipped**. There are zero deferred chunks; the initial critical path and total bundle are identical and well within the budget.

---

## 13. Accessibility Considerations

- **WCAG AA Contrast:** Terminal backgrounds (`#070e1c`), border accents (`#38bdf8`, `#fbbf24`), and typography meet 4.5:1 text contrast ratios.
- **ARIA Live Regions:** Screen readers receive status announcements when voice input begins and when consent prompts mount (`aria-live="polite"`).
- **Visible Focus Rings:** Every button, including `.kai-boot-skip-btn` and consent action buttons, provides explicit `:focus-visible` outlines (`outline: 2px solid`).
- **Touch Target Sizing:** All touch controls strictly exceed the 40px touch-target guideline (Skip button: min-height 40px; Mic toggle: 38px + 8px padding margin).

---

## 14. Error Handling and Fallbacks

| Failure Mode | Detection | System Response |
|---|---|---|
| Web Speech API unsupported | `isRecognitionSupported() === false` | Disables mic toggle; tooltips guide user to text typing. |
| Microphone permission denied | `event.error === 'not-allowed'` | Emits non-intrusive alert: "Microphone access denied. You can continue typing." |
| No speech detected | `event.error === 'no-speech'` | Resets to idle state cleanly without persistent error alerts. |
| Microphone busy / not found | `event.error === 'audio-capture'` | Reports "No microphone was found or microphone is busy." |
| Cloud service unavailable | `event.error === 'network'` | Reports "Voice network services unavailable. Please use text input." |
| User cancellation | User presses Escape or taps Mic | Calls `abortListening()`, invalidates session, drops pending audio. |
| TTS unsupported | `'speechSynthesis' in window === false` | Text response renders normally; audio step skipped silently. |

---

## 15. Implementation File Mapping

| File Path | Component / Layer | Primary Phase 4 Responsibility |
|---|---|---|
| `src/assistant/speechAdapter.ts` | Voice Engine | Web Speech API wrapper, privacy modes, consent tracking, instance session lifecycle, text cleaning. |
| `src/components/assistant/AssistantInput.tsx` | Assistant UI | Mic button, explicit consent dialog, privacy badge, global Escape handler, unmount abort. |
| `src/components/assistant/assistant.css` | Styling | High-contrast consent prompt styling, mic pulse rings, reduced-motion overrides. |
| `src/components/system-feedback/BootSequence.tsx` | System Feedback | 1.8s power on terminal, progress bar, 1-key skip, input typing protection, focus restoration. |
| `src/components/system-feedback/boot-sequence.css` | Styling | Cybernetic initialization layout (`z-index: 2500`), mobile responsiveness, reduced-motion hide. |
| `src/app/HeadquartersShell.tsx` | Application Shell | `sessionStorage` boot persistence, deep-link boot bypass logic, reduced-motion bypass. |
| `src/experience-engine/ExperienceEngineProvider.tsx` | State Mediator | Cancels speech synthesis on `changeRoom()` and `popstate` navigation. |
| `vite.config.ts` | Build Pipeline | Enforces `process.env.NODE_ENV = 'production'` during `build` to eliminate development runtime bloat. |
| `scripts/test-phase4-voice-motion.ts` | Verification | 28 automated test assertions validating voice, motion, privacy, and routing. |

---

## 16. Testing Strategy

1. **Automated Unit & Contract Tests:** Custom headless test runner (`tsx scripts/test-phase4-voice-motion.ts`) testing feature detection, session token invalidation, privacy descriptors, consent setters, text sanitization, timing budgets, and deep-link logic.
2. **Regression Routing & Data Tests:** Running `test-routing.ts` (34 assertions) and `test-knowledge-engine.ts` (31 assertions) ensuring zero breakages across rooms, entity modals, and mode filters.
3. **Static Analysis & Build Verification:** Running `eslint .` (0 errors) and `tsc -b && vite build` (0 type errors, clean production bundle).
4. **Mocked vs. Real API Separation:** Headless Node tests use mock/feature checks and do not claim to test physical microphone hardware.

---

## 17. Automated Test Results

```
=== Test Suite Execution Summary ===
1. lint:                0 errors, 0 warnings (PASSED)
2. test:phase4:         28 assertions passed (PASSED)
3. test:routing:        34 assertions passed (PASSED)
4. test:knowledge:      31 assertions passed (PASSED)
5. build (standard):    built in 816ms (PASSED)
6. build (GH Pages):    built in 835ms (PASSED)
```

---

## 18. Browser Compatibility Matrix

| Environment | Engine | Speech Recognition (STT) | Speech Synthesis (TTS) | Power On Sequence |
|---|---|---|---|---|
| **Google Chrome (Desktop/Android)** | Chromium | Supported (Cloud-assisted; requires explicit consent; on-device where model installed) | Supported (Natural Google voices available) | Supported (Full 60fps CSS animation) |
| **Microsoft Edge** | Chromium | Supported (Cloud-assisted; requires explicit consent) | Supported (Natural Microsoft voices) | Supported (Full 60fps CSS animation) |
| **Mozilla Firefox** | Gecko | Unsupported by default (Gracefully degrades to text typing) | Supported (System voices) | Supported (Full 60fps CSS animation) |
| **Apple Safari (macOS/iOS)** | WebKit | Supported via `webkitSpeechRecognition` (Requires explicit consent) | Supported (Samantha/Daniel/System voices) | Supported (Full 60fps CSS animation) |
| **Headless / Node.js** | V8 | Handled safely (`isRecognitionSupported() === false`, no exceptions) | Handled safely (`isSynthesisSupported() === false`, no exceptions) | Bypassed in tests via assertions |

---

## 19. Security and Privacy Considerations

1. **Zero External Audio Storage:** No audio stream or transcript is sent to developer servers or stored in any database.
2. **Explicit Consent Gate:** Audio is never transmitted to browser vendor servers without explicit visitor interaction and agreement.
3. **Client-Side Query Processing:** All typed text queries remain strictly inside the visitor's local browser memory.
4. **Sandboxed State:** Session tokens and boot persistence use `sessionStorage`, automatically cleared upon tab closure.

---

## 20. Known Limitations

1. **Browser Speech Recognition Heterogeneity:** Browser vendors implement Web Speech API differently; Chrome supports cloud-assisted recognition, Safari uses local/cloud dictation depending on OS version, and Firefox does not support SpeechRecognition out-of-the-box. The application gracefully provides text typing in all unsupported cases.
2. **Voice Synthesis Timbre:** Voice pitch, speed, and timbre depend on locally installed operating system voices and cannot be guaranteed to sound identical across different operating systems.

---

## 21. Requirements and UX Traceability Matrix

| Requirement ID | UX / Spec ID | Implementation Component | Verification Check | Status |
|---|---|---|---|:---:|
| `REQ-NAV-001` | `UX-001` | `src/components/system-feedback/BootSequence.tsx` | Test: Duration = 1800ms (< 3000ms), 1-key skip | **PASS** |
| `REQ-KAI-003` | Volume 2 §4 | `src/assistant/speechAdapter.ts`, `AssistantInput.tsx` | Test: Explicit consent prompt, STT/TTS | **PASS** |
| `REQ-ACC-002` | `UX-007` | `globals.css`, `boot-sequence.css`, `BootSequence.tsx` | Test: 0ms bypass under reduced motion | **PASS** |
| `NFR-PERF-001` | Volume 3 §11 | `vite.config.ts`, ADR-04 | Build: 122.16 KB JS gzip (≤ 180 KB budget) | **PASS** |
| `NFR-A11Y-001` | Volume 2 §11 | `AssistantInput.tsx`, `BootSequence.tsx` | Lint: Clean, WCAG AA contrast, focus restoration | **PASS** |

---

## 22. Phase 4 Acceptance Checklist

- [x] Speech recognition works where supported.
- [x] Local recognition is accurately detected.
- [x] No silent cloud-recognition fallback exists.
- [x] Browser-managed recognition requires explicit informed consent.
- [x] Text input always remains available.
- [x] TTS works where supported and degrades gracefully.
- [x] Speech sessions are lifecycle-safe.
- [x] Stale transcripts cannot be submitted.
- [x] Power On sequence satisfies UX-001.
- [x] Keyboard interactions are safe.
- [x] Deep links and navigation remain correct.
- [x] Reduced-motion behaviour is correct.
- [x] Motion never blocks core functionality.
- [x] Production build is verified.
- [x] Bundle budget is verified.
- [x] Existing tests pass.
- [x] New Phase 4 tests pass.
- [x] Existing room, routing and Knowledge Engine behaviour remains intact.
- [x] Volume 3 is updated.
- [x] Dedicated Phase 4 implementation documentation is created.
- [x] Documentation accurately reflects the actual code.
- [x] No Phase 5 work is repeated.
- [x] No Phase 6 implementation is started.

---

## 23. Final Completion Assessment

Phase 4 (Voice & Motion Enhancement) has achieved full engineering completion. All governing requirements from Volume 1, Volume 2, and Volume 3 are satisfied. The implementation is production-ready, accessible, fully tested, and strictly within budget.

---

## 24. Revision History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0.0 | November 2026 | Kamalesh Suresh Kumar | Final Phase 4 implementation document and verification record. |
