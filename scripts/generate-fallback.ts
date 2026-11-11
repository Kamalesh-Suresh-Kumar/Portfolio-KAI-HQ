/**
 * KAI HQ — Static No-JavaScript Fallback Generator (Phase 6.2 / AD-03)
 *
 * Implements Architecture Decision AD-03 (Volume 3 §9, realizing UX-007).
 * Reads the typed KnowledgeEngine repository and pre-renders static semantic HTML
 * for all eight headquarters facility rooms into public/fallback/.
 *
 * Guarantees that with JavaScript disabled, all portfolio information,
 * room navigation, and direct resume downloads remain 100% accessible.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { knowledgeEngine } from "../src/knowledge-engine";
import type { RoomId } from "../src/knowledge-engine/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "fallback");
const ROOT_DIR = path.resolve(__dirname, "..");

// Safely load environment variables across both local (.env.local) and CI (process.env)
const loadedEnv = {
  ...loadEnv("production", ROOT_DIR, "VITE_"),
  ...loadEnv("development", ROOT_DIR, "VITE_"),
  ...process.env,
};
const WEB3FORMS_ACCESS_KEY = loadedEnv.VITE_WEB3FORMS_ACCESS_KEY || "";

/**
 * Escapes HTML sensitive characters to prevent raw injection and ensure valid markup.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface RoomDefinition {
  id: RoomId;
  filename: string;
  name: string;
  code: string;
  subtitle: string;
  description: string;
}

const ROOM_DEFINITIONS: RoomDefinition[] = [
  {
    id: "Lobby",
    filename: "index.html",
    name: "Lobby",
    code: "ROOM-01",
    subtitle: "System Hub & Orientation Point",
    description: "Welcome hub, identity summary, AI core visualization, and primary entry point to KAI HQ.",
  },
  {
    id: "EngineeringLaboratory",
    filename: "engineering-laboratory.html",
    name: "Engineering Laboratory",
    code: "ROOM-02",
    subtitle: "Project Specimen & Engineering Research",
    description: "Filterable collection of engineering specimens, deep-dive architectural notes, and project repositories.",
  },
  {
    id: "MemoryArchive",
    filename: "memory-archive.html",
    name: "Memory Archive",
    code: "ROOM-03",
    subtitle: "Timeline & Career Chronology",
    description: "Chronological timeline of education, software engineering internships, naval cadetship, and technical society roles.",
  },
  {
    id: "AchievementHall",
    filename: "achievement-hall.html",
    name: "Achievement Hall",
    code: "ROOM-04",
    subtitle: "Honors, Certifications & Credentials",
    description: "Evidentiary gallery showcasing law enforcement demonstrations, verified enterprise certifications, and leadership honors.",
  },
  {
    id: "DocumentVault",
    filename: "document-vault.html",
    name: "Document Vault",
    code: "ROOM-05",
    subtitle: "Role-Tailored Resumes & Technical Papers",
    description: "Role-tailored resume variants (Full-Stack, Backend, Cybersecurity, AI/Systems) with direct download capabilities.",
  },
  {
    id: "CommunicationCenter",
    filename: "communication-center.html",
    name: "Communication Center",
    code: "ROOM-06",
    subtitle: "Direct Frequency & Contact Coordinates",
    description: "Direct communication channels, GitHub repository coordinates, email links, and network presence.",
  },
  {
    id: "SkillProcessor",
    filename: "skill-processor.html",
    name: "Skill Processor",
    code: "ROOM-07",
    subtitle: "Categorized Technical Matrix & Toolchains",
    description: "Structured matrix of programming languages, frameworks, security toolchains, and architectural domains with project linkages.",
  },
  {
    id: "MissionControl",
    filename: "mission-control.html",
    name: "Mission Control",
    code: "ROOM-08",
    subtitle: "Global Telemetry, Search & Mode Controller",
    description: "Central command surface offering full-text knowledge search, system telemetry, and visitor mode configuration.",
  },
];

/**
 * Self-contained, lightweight CSS for static fallback rendering.
 * High-contrast, WCAG AA compliant, zero external dependencies.
 */
const FALLBACK_CSS = `
/* KAI HQ — Static Fallback Stylesheet (Phase 6.2 / AD-03) */
:root {
  --bg-shell: #050b16;
  --bg-card: #0c1527;
  --bg-card-alt: #101c33;
  --bg-banner: #091426;
  --border-color: #1b3358;
  --border-accent: #38bdf8;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --accent-cyan: #38bdf8;
  --accent-green: #34d399;
  --accent-amber: #fbbf24;
  --focus-ring: #38bdf8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-shell);
  color: var(--text-secondary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  padding: 0;
  margin: 0;
}

a {
  color: var(--accent-cyan);
  text-decoration: underline;
  text-underline-offset: 3px;
}

a:hover {
  color: #7dd3fc;
}

a:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.skip-link {
  position: absolute;
  top: -999px;
  left: 10px;
  background: var(--bg-card);
  color: var(--accent-cyan);
  padding: 10px 16px;
  border: 2px solid var(--accent-cyan);
  border-radius: 4px;
  z-index: 1000;
  font-weight: 700;
}

.skip-link:focus {
  top: 10px;
}

/* Static Fallback Notice Banner */
.fallback-notice-banner {
  background: var(--bg-banner);
  border-bottom: 2px solid var(--accent-cyan);
  padding: 14px 20px;
}

.fallback-notice-container {
  max-width: 1080px;
  margin: 0 auto;
}

.fallback-badge {
  display: inline-block;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-cyan);
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.fallback-notice-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Header & Navigation */
.fallback-header {
  border-bottom: 1px solid var(--border-color);
  background: #08101e;
  padding: 24px 20px 0 20px;
}

.fallback-header-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.brand-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.fallback-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.nav-link {
  display: inline-block;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-link:hover {
  background: var(--bg-card-alt);
  color: var(--text-primary);
  border-color: var(--accent-cyan);
}

.nav-link-active {
  background: var(--bg-shell);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  border-bottom: 2px solid var(--bg-shell);
  font-weight: 700;
}

/* Main Content Area */
.fallback-main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 20px 60px 20px;
}

.room-meta-badge {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent-cyan);
  margin-bottom: 8px;
}

.room-heading {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.room-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 12px;
}

.room-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

/* Card Grids */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.fallback-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fallback-card:hover {
  border-color: rgba(56, 189, 248, 0.5);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 0.85rem;
  color: var(--accent-cyan);
  font-weight: 600;
}

.badge {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.badge-production {
  background: rgba(52, 211, 153, 0.15);
  color: var(--accent-green);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.badge-completed {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.badge-tier {
  background: rgba(251, 191, 36, 0.15);
  color: var(--accent-amber);
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tag {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  background: #13223d;
  color: #cbd5e1;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #1e3a5f;
}

.btn-action {
  display: inline-block;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #0369a1;
  color: #ffffff;
  border: 1px solid #0284c7;
}

.btn-primary:hover {
  background: #075985;
  color: #ffffff;
  border-color: #0369a1;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.btn-primary:active {
  background: #0c4a6e;
  color: #ffffff;
  border-color: #075985;
}

.btn-primary[disabled],
.btn-primary:disabled {
  background: #1e293b;
  color: #94a3b8;
  border-color: #334155;
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-secondary {
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #334155;
  color: #ffffff;
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.btn-secondary:active {
  background: #0f172a;
  color: #ffffff;
}

.section-block {
  margin-top: 32px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.info-table th,
.info-table td {
  padding: 10px 14px;
  text-align: left;
  border: 1px solid var(--border-color);
}

.info-table th {
  background: #0f1c33;
  color: var(--accent-cyan);
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 700;
}

.info-table td {
  background: var(--bg-card);
  font-size: 0.9rem;
}

/* Footer */
.fallback-footer {
  border-top: 1px solid var(--border-color);
  background: #08101e;
  padding: 30px 20px;
  margin-top: 40px;
}

.fallback-footer-inner {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.9rem;
}

.footer-copy {
  font-size: 0.82rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .room-heading {
    font-size: 1.8rem;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
  .nav-link {
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}
`;

/**
 * Formats a raw proficiency level identifier into a title-cased display label.
 */
function formatProficiency(level: string): string {
  const map: Record<string, string> = {
    advanced: "Advanced",
    proficient: "Proficient",
    working_knowledge: "Working Knowledge",
    learning: "Learning",
  };
  return map[level] || level.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Builds the common page wrapper including skip link, static mode notice,
 * branding header, 8-room navigation tabs, main content, and footer.
 */
function renderPage(currentRoomId: RoomId, contentHtml: string): string {
  const currentRoom = ROOM_DEFINITIONS.find((r) => r.id === currentRoomId)!;
  const pageTitle = `${currentRoom.name} — KAI HQ Static Fallback`;
  const metaDescription = `Static no-JavaScript view of ${currentRoom.name} (${currentRoom.code}) in Kamalesh Artificial Intelligence Headquarters.`;

  const navLinksHtml = ROOM_DEFINITIONS.map((r) => {
    const isActive = r.id === currentRoomId;
    const activeClass = isActive ? " nav-link-active" : "";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    return `        <a href="./${r.filename}" class="nav-link${activeClass}"${ariaCurrent}>${escapeHtml(r.name)}</a>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <style>
${FALLBACK_CSS}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Static Fallback Mode Notice -->
  <div class="fallback-notice-banner" role="status" aria-label="Static Fallback Notice">
    <div class="fallback-notice-container">
      <span class="fallback-badge">KAI HQ // STATIC NO-JAVASCRIPT FALLBACK (UX-007, AD-03)</span>
      <p class="fallback-notice-text">
        You are viewing the pre-rendered, static HTML fallback of Kamalesh Artificial Intelligence Headquarters.
        All portfolio records, technical architectures, and direct resume downloads are fully accessible below without JavaScript.
      </p>
    </div>
  </div>

  <!-- Header & Navigation -->
  <header class="fallback-header">
    <div class="fallback-header-inner">
      <h1 class="brand-title">KAI HQ — Kamalesh Artificial Intelligence Headquarters</h1>
      <p class="brand-subtitle">Virtual Headquarters of Kamalesh Suresh Kumar &bull; Full-Stack Software Engineer &bull; Static Fallback</p>

      <nav class="fallback-nav" aria-label="Headquarters Facility Rooms">
${navLinksHtml}
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content" class="fallback-main">
    <div class="room-meta-badge">${escapeHtml(currentRoom.code)} // ${escapeHtml(currentRoom.subtitle.toUpperCase())}</div>
    <h2 class="room-heading">${escapeHtml(currentRoom.name)}</h2>
    <p class="room-subtitle">${escapeHtml(currentRoom.subtitle)}</p>
    <p class="room-description">${escapeHtml(currentRoom.description)}</p>

${contentHtml}
  </main>

  <!-- Footer -->
  <footer class="fallback-footer">
    <div class="fallback-footer-inner">
      <nav class="footer-nav" aria-label="Fallback Quick Links">
        <a href="./index.html">&larr; Return to Lobby (System Hub)</a>
        <a href="./engineering-laboratory.html">Projects Lab</a>
        <a href="./document-vault.html">Resume Downloads</a>
        <a href="./communication-center.html">Contact Coordinates</a>
        <a href="./mission-control.html">Sitemap Index</a>
      </nav>
      <p class="footer-copy">
        KAI HQ Static Fallback &bull; Deterministically generated directly from Knowledge Engine repository &bull; Zero client-side script execution required &bull; 100% accessible.
      </p>
    </div>
  </footer>
</body>
</html>
`;
}

// ============================================================================
// ROOM RENDERERS
// ============================================================================

function renderLobbyContent(): string {
  const contact = knowledgeEngine.getContact();
  const featuredProjects = knowledgeEngine.getFeaturedProjects();
  const stats = knowledgeEngine.getStats();

  const directoryList = ROOM_DEFINITIONS.filter((r) => r.id !== "Lobby")
    .map(
      (r) => `        <div class="fallback-card">
          <div class="card-header-row">
            <h4 class="card-title"><a href="./${r.filename}">${escapeHtml(r.name)}</a></h4>
            <span class="badge badge-completed">${escapeHtml(r.code)}</span>
          </div>
          <p style="font-size: 0.9rem; color: #94a3b8; margin: 0;">${escapeHtml(r.subtitle)}</p>
          <p style="font-size: 0.88rem; margin: 0;">${escapeHtml(r.description)}</p>
          <p style="margin-top: auto; padding-top: 8px;"><a href="./${r.filename}" class="btn-action btn-secondary" aria-label="Enter ${escapeHtml(r.name)} (${escapeHtml(r.code)})">Enter ${escapeHtml(r.name)} &rarr;</a></p>
        </div>`
    )
    .join("\n");

  const featuredProjectsHtml = featuredProjects
    .map(
      (p) => `        <div class="fallback-card">
          <div class="card-header-row">
            <h4 class="card-title">${escapeHtml(p.title)}</h4>
            <span class="badge ${p.status === "production" ? "badge-production" : "badge-completed"}">${escapeHtml(p.status)}</span>
          </div>
          <p class="card-subtitle">${escapeHtml(p.domain.toUpperCase())}</p>
          <p style="font-size: 0.9rem;">${escapeHtml(p.summary)}</p>
          <div class="tag-list">
            ${p.stack.slice(0, 5).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
          <p style="margin-top: auto; padding-top: 8px;"><a href="./engineering-laboratory.html#project-${escapeHtml(p.id)}" class="btn-action btn-secondary" aria-label="Inspect ${escapeHtml(p.title)} in Engineering Laboratory">Inspect in Lab &rarr;</a></p>
        </div>`
    )
    .join("\n");

  return `    <!-- System Status & Overview -->
    <div style="background: #0d192e; border: 1px solid #1b3358; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 18px; margin-bottom: 28px;">
      <h3 style="color: #38bdf8; font-size: 1.1rem; margin-bottom: 6px;">KAI HQ — UNDER ACTIVE DEVELOPMENT</h3>
      <p style="margin: 0; font-size: 0.92rem; color: #cbd5e1; line-height: 1.5;">
        This headquarters is an evolving portfolio project currently under active development. Some features, project descriptions, achievements and other information are still being refined and may be incomplete, provisional or subject to change. Additional improvements and verified content will be introduced progressively.
      </p>
    </div>

    <section class="section-block">
      <h3 class="section-title">Identity &amp; Profile Summary</h3>
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 22px;">
        <h4 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(contact.name)}</h4>
        <p style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 12px;">${escapeHtml(contact.title)} &bull; Location: ${escapeHtml(contact.location)}</p>
        <p style="line-height: 1.6; margin-bottom: 14px;">${escapeHtml(contact.bio)}</p>
        <p style="font-size: 0.9rem; color: var(--accent-green);"><strong>Availability:</strong> ${escapeHtml(contact.availability)}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">System State: ${escapeHtml(contact.systemStatus.status)} (v${escapeHtml(contact.systemStatus.version)})</p>
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-title">Headquarters Telemetry Overview</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); font-family: ui-monospace, Menlo, Consolas, monospace;">${stats.projectsCount}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Engineering Projects</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); font-family: ui-monospace, Menlo, Consolas, monospace;">${stats.skillsCount}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Technical Skills</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); font-family: ui-monospace, Menlo, Consolas, monospace;">${stats.achievementsCount}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Verified Honors</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); font-family: ui-monospace, Menlo, Consolas, monospace;">${stats.timelineCount}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Timeline Milestones</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan); font-family: ui-monospace, Menlo, Consolas, monospace;">${stats.resumeVariantsCount}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Resume Variants</div>
        </div>
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-title">Facility Directory (All Rooms)</h3>
      <div class="card-grid">
${directoryList}
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-title">Featured Engineering Projects</h3>
      <div class="card-grid">
${featuredProjectsHtml}
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-title">Verified Resume Artifacts</h3>
      <p style="margin-bottom: 14px;">Direct PDF downloads for all 4 role-tailored specifications:</p>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="../documents/resume-fullstack.pdf" download class="btn-action btn-primary" aria-label="Download Full-Stack Resume PDF">Download Full-Stack Resume (PDF)</a>
        <a href="../documents/resume-backend.pdf" download class="btn-action btn-primary" aria-label="Download Backend Resume PDF">Download Backend Resume (PDF)</a>
        <a href="../documents/resume-cybersecurity.pdf" download class="btn-action btn-primary" aria-label="Download Cybersecurity Resume PDF">Download Cybersecurity Resume (PDF)</a>
        <a href="../documents/resume-ai-systems.pdf" download class="btn-action btn-primary" aria-label="Download AI Systems Resume PDF">Download AI Systems Resume (PDF)</a>
      </div>
    </section>`;
}

function renderEngineeringLabContent(): string {
  const projects = knowledgeEngine.getProjects();

  const cardsHtml = projects
    .map((p) => {
      const metricsHtml = p.metrics && p.metrics.length > 0
        ? `<div style="background: #091222; border-left: 3px solid #34d399; padding: 8px 12px; margin-top: 8px; border-radius: 4px;">
            <strong style="color: #34d399; font-size: 0.78rem; text-transform: uppercase;">Key Metrics &amp; Impact</strong>
            <ul style="margin: 4px 0 0 18px; font-size: 0.88rem; padding: 0;">
              ${p.metrics.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}
            </ul>
          </div>`
        : "";

      const decisionHtml = p.engineeringDecision
        ? `<div style="background: #091222; border-left: 3px solid #38bdf8; padding: 8px 12px; margin-top: 8px; border-radius: 4px;">
            <strong style="color: #38bdf8; font-size: 0.78rem; text-transform: uppercase;">Architecture Decision</strong>
            <p style="margin: 0; font-size: 0.88rem;">${escapeHtml(p.engineeringDecision)}</p>
          </div>`
        : "";

      const linksHtml: string[] = [];
      if (p.links?.repo) {
        linksHtml.push(`<a href="${escapeHtml(p.links.repo)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Source Repository for ${escapeHtml(p.title)}">Source Repository &rarr;</a>`);
      }
      if (p.links?.demo) {
        linksHtml.push(`<a href="${escapeHtml(p.links.demo)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-primary" aria-label="Live Deployment for ${escapeHtml(p.title)}">Live Deployment &rarr;</a>`);
      }
      if (p.links?.documentation) {
        linksHtml.push(`<a href="${escapeHtml(p.links.documentation)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Documentation for ${escapeHtml(p.title)}">Documentation &rarr;</a>`);
      }

      return `      <article id="project-${escapeHtml(p.id)}" class="fallback-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">${escapeHtml(p.title)}</h3>
            <span class="card-subtitle">${escapeHtml(p.domain.toUpperCase())}</span>
          </div>
          <span class="badge ${p.status === "production" ? "badge-production" : "badge-completed"}">${escapeHtml(p.status)}</span>
        </div>
        <p style="font-weight: 600; color: #cbd5e1; margin: 0; font-size: 0.92rem;">${escapeHtml(p.summary)}</p>
        <p style="line-height: 1.5; font-size: 0.92rem; margin-top: 6px; color: #94a3b8;">${escapeHtml(p.description)}</p>
        ${metricsHtml}
        ${decisionHtml}
        <div style="margin-top: 8px;">
          <strong style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Technology Stack:</strong>
          <div class="tag-list" style="margin-top: 4px;">
            ${p.stack.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}
          </div>
        </div>
        ${linksHtml.length > 0 ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 10px;">${linksHtml.join("")}</div>` : ""}
      </article>`;
    })
    .join("\n\n");

  return `    <section>
      <div class="card-grid">
${cardsHtml}
      </div>
    </section>`;
}

function renderMemoryArchiveContent(): string {
  const timeline = knowledgeEngine.getTimeline();

  const itemsHtml = timeline
    .map((item) => {
      const achievementsList = item.keyAchievements && item.keyAchievements.length > 0
        ? `<ul style="margin: 8px 0 0 20px; font-size: 0.9rem; color: #cbd5e1;">
            ${item.keyAchievements.map((ach) => `<li>${escapeHtml(ach)}</li>`).join("")}
          </ul>`
        : "";

      const techTags = item.technologies && item.technologies.length > 0
        ? `<div class="tag-list" style="margin-top: 10px;">
            ${item.technologies.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>`
        : "";

      return `      <article id="timeline-${escapeHtml(item.id)}" class="fallback-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <span class="card-subtitle">${escapeHtml(item.organization)} &bull; ${escapeHtml(item.role)}</span>
          </div>
          <span class="badge badge-completed">${escapeHtml(item.period)}</span>
        </div>
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Location: ${escapeHtml(item.location)} &bull; Category: ${escapeHtml(item.category)}</p>
        <p style="line-height: 1.5; font-size: 0.92rem; margin-top: 6px;">${escapeHtml(item.description)}</p>
        ${achievementsList}
        ${techTags}
      </article>`;
    })
    .join("\n\n");

  return `    <section>
      <div class="card-grid">
${itemsHtml}
      </div>
    </section>`;
}

function renderAchievementHallContent(): string {
  const achievements = knowledgeEngine.getAchievements();

  const itemsHtml = achievements
    .map((ach) => {
      const relatedProjectsHtml = ach.relatedProjectIds && ach.relatedProjectIds.length > 0
        ? `<div style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8;">
            <strong style="text-transform: uppercase; font-size: 0.78rem;">Related Engineering Specimen:</strong>
            <div style="margin-top: 4px;">
              ${ach.relatedProjectIds.map((pid) => {
                const proj = knowledgeEngine.getProjectById(pid);
                const title = proj ? proj.title : pid;
                return `<a href="./engineering-laboratory.html#project-${escapeHtml(pid)}" class="tag" style="text-decoration: underline;" aria-label="Inspect related project ${escapeHtml(title)} in Engineering Laboratory">${escapeHtml(title)} &rarr;</a>`;
              }).join(" ")}
            </div>
          </div>`
        : "";

      const linkHtml = ach.credentialUrl
        ? `<p style="margin-top: auto; padding-top: 8px;"><a href="${escapeHtml(ach.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Verify Credential for ${escapeHtml(ach.title)}">Verify Credential &rarr;</a></p>`
        : "";

      return `      <article id="achievement-${escapeHtml(ach.id)}" class="fallback-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">${escapeHtml(ach.title)}</h3>
            <span class="card-subtitle">Issued by: ${escapeHtml(ach.issuer)}</span>
          </div>
          <span class="badge badge-tier">${escapeHtml(ach.date)}</span>
        </div>
        <p style="font-size: 0.82rem; color: #94a3b8; margin: 0; text-transform: uppercase;">Category: ${escapeHtml(ach.category)}</p>
        <p style="line-height: 1.5; font-size: 0.92rem; margin-top: 6px;">${escapeHtml(ach.description)}</p>
        ${relatedProjectsHtml}
        ${linkHtml}
      </article>`;
    })
    .join("\n\n");

  return `    <section>
      <div class="card-grid">
${itemsHtml}
      </div>
    </section>`;
}

function renderDocumentVaultContent(): string {
  const resumes = knowledgeEngine.getResumeVariants();

  const cardsHtml = resumes
    .map((r) => {
      // Relative path to existing PDF artifacts from public/fallback/
      const pdfFilename = path.basename(r.fileUrl);
      const relativePdfUrl = `../documents/${pdfFilename}`;

      const highlightsList = r.highlights && r.highlights.length > 0
        ? `<ul style="margin: 8px 0 0 20px; font-size: 0.88rem; color: #cbd5e1;">
            ${r.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
          </ul>`
        : "";

      const skillsTags = r.skillsSummary && r.skillsSummary.length > 0
        ? `<div class="tag-list" style="margin-top: 10px;">
            ${r.skillsSummary.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}
          </div>`
        : "";

      return `      <article id="resume-${escapeHtml(r.id)}" class="fallback-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">${escapeHtml(r.roleTitle)}</h3>
            <span class="card-subtitle">${escapeHtml(r.label)}</span>
          </div>
          <span class="badge badge-production">Updated ${escapeHtml(r.lastUpdated)}</span>
        </div>
        <div style="background: #091222; padding: 10px; border-radius: 4px; border-left: 3px solid #38bdf8;">
          <strong style="color: #38bdf8; font-size: 0.78rem; text-transform: uppercase;">Target Scope:</strong>
          <p style="margin: 0; font-size: 0.88rem;">${escapeHtml(r.bestFor)}</p>
        </div>
        <div>
          <strong style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase;">Tailored Highlights:</strong>
          ${highlightsList}
        </div>
        <div>
          <strong style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase;">Core Competencies:</strong>
          ${skillsTags}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 12px; border-top: 1px solid #1b3358;">
          <a href="${escapeHtml(relativePdfUrl)}" download class="btn-action btn-primary" aria-label="Download ${escapeHtml(r.label)} resume PDF">Download PDF (${escapeHtml(r.label)})</a>
          <a href="${escapeHtml(relativePdfUrl)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="View ${escapeHtml(r.label)} resume PDF in browser">View PDF</a>
        </div>
      </article>`;
    })
    .join("\n\n");

  return `    <section>
      <div class="card-grid">
${cardsHtml}
      </div>
    </section>`;
}

function renderCommunicationCenterContent(): string {
  const contact = knowledgeEngine.getContact();
  const githubCleanUrl = contact.github.startsWith("http") ? contact.github : `https://github.com/${contact.github}`;
  const githubDisplayText = contact.github.replace(/^https?:\/\//, "");

  return `    <section class="section-block" style="margin-top: 0;">
      <h3 class="section-title">Direct Communication Channels</h3>
      <div class="card-grid">
        <div class="fallback-card">
          <h4 class="card-title">Primary Electronic Mail</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">Direct inbox for professional inquiries, engineering discussions, and role interviews.</p>
          <p style="font-size: 1.1rem; font-weight: 700; margin: 12px 0;">
            <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
          </p>
          <p><a href="mailto:${escapeHtml(contact.email)}" class="btn-action btn-primary" aria-label="Dispatch Email to ${escapeHtml(contact.email)}">Dispatch Email &rarr;</a></p>
        </div>

        <div class="fallback-card">
          <h4 class="card-title">GitHub Developer Profile</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">Public open-source repositories, system architectures, and commit histories.</p>
          <p style="font-size: 1.1rem; font-weight: 700; margin: 12px 0;">
            <a href="${escapeHtml(githubCleanUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(githubDisplayText)}</a>
          </p>
          <p><a href="${escapeHtml(githubCleanUrl)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Visit GitHub Profile for ${escapeHtml(contact.name)}">Visit GitHub Profile &rarr;</a></p>
        </div>

        <div class="fallback-card">
          <h4 class="card-title">${escapeHtml(contact.kaiNexus?.name || "KAI Nexus")}</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">${escapeHtml(contact.kaiNexus?.description || "Secondary communication and operational channel.")}</p>
          <p style="font-size: 1.1rem; font-weight: 700; margin: 12px 0;">
            <a href="${escapeHtml(contact.kaiNexus?.url || "https://kamalesh-suresh-kumar.github.io/KAI-Nexus/")}" target="_blank" rel="noopener noreferrer">Access KAI Nexus</a>
          </p>
          <p><a href="${escapeHtml(contact.kaiNexus?.url || "https://kamalesh-suresh-kumar.github.io/KAI-Nexus/")}" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Open KAI Nexus external site">Open KAI Nexus &rarr;</a></p>
        </div>

        <div class="fallback-card">
          <h4 class="card-title">Phone Number</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">Direct voice communications for urgent engineering inquiries.</p>
          <p style="font-size: 1.1rem; font-weight: 700; margin: 12px 0;">
            <a href="tel:+916369638817">+91 63696 38817</a>
          </p>
          <p><a href="tel:+916369638817" class="btn-action btn-secondary" aria-label="Call Phone: +91 63696 38817">Call Phone &rarr;</a></p>
        </div>

        <div class="fallback-card">
          <h4 class="card-title">WhatsApp</h4>
          <p style="font-size: 0.9rem; color: #94a3b8;">Direct messaging and mobile chat channel.</p>
          <p style="font-size: 1.1rem; font-weight: 700; margin: 12px 0;">
            <a href="https://wa.me/916369638817" target="_blank" rel="noopener noreferrer">+91 63696 38817</a>
          </p>
          <p><a href="https://wa.me/916369638817" target="_blank" rel="noopener noreferrer" class="btn-action btn-secondary" aria-label="Open WhatsApp: +91 63696 38817">Open WhatsApp &rarr;</a></p>
        </div>
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-title">Transmit Message (Web3Forms Native Submission)</h3>
      ${
        WEB3FORMS_ACCESS_KEY
          ? `<form action="https://api.web3forms.com/submit" method="POST" class="fallback-card" style="gap: 16px;">
        <input type="hidden" name="access_key" value="${escapeHtml(WEB3FORMS_ACCESS_KEY)}" />
        <input type="hidden" name="from_name" value="KAI HQ Static Fallback" />

        <div>
          <label for="fallback-name" style="display: block; font-size: 0.82rem; font-family: monospace; text-transform: uppercase; margin-bottom: 6px; color: #cbd5e1;">Your Name / Organization <span style="color: #f87171;">*</span></label>
          <input type="text" id="fallback-name" name="name" required style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 0.9rem;" placeholder="e.g. Alex Mercer" />
        </div>

        <div>
          <label for="fallback-email" style="display: block; font-size: 0.82rem; font-family: monospace; text-transform: uppercase; margin-bottom: 6px; color: #cbd5e1;">Return Email Address <span style="color: #f87171;">*</span></label>
          <input type="email" id="fallback-email" name="email" required style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 0.9rem;" placeholder="e.g. name@organization.com" />
        </div>

        <div>
          <label for="fallback-subject" style="display: block; font-size: 0.82rem; font-family: monospace; text-transform: uppercase; margin-bottom: 6px; color: #cbd5e1;">Subject Header <span style="color: #f87171;">*</span></label>
          <input type="text" id="fallback-subject" name="subject" required style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 0.9rem;" placeholder="e.g. Full-Stack Engineering Opportunity" />
        </div>

        <div>
          <label for="fallback-message" style="display: block; font-size: 0.82rem; font-family: monospace; text-transform: uppercase; margin-bottom: 6px; color: #cbd5e1;">Message Payload (Min 10 characters) <span style="color: #f87171;">*</span></label>
          <textarea id="fallback-message" name="message" required minlength="10" rows="5" style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 0.9rem;" placeholder="Enter your message, scope details, or questions..."></textarea>
        </div>

        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 6px; padding: 12px 14px; font-size: 0.82rem; color: #94a3b8; line-height: 1.5;">
          <strong style="color: #38bdf8; display: block; margin-bottom: 2px;">Secure Message Delivery</strong>
          <span>Your message is submitted through Web3Forms and forwarded to Kamalesh at <strong>${escapeHtml(contact.email)}</strong>. Web3Forms processes your information to facilitate message delivery.</span>
        </div>

        <button type="submit" class="btn-action btn-primary" style="font-size: 0.9rem; font-weight: 700; cursor: pointer; border: none; padding: 12px 18px; border-radius: 6px; width: fit-content;">Transmit Message via Web3Forms &rarr;</button>
      </form>`
          : `<div style="padding: 14px 16px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; color: #fde68a; font-size: 0.88rem; line-height: 1.5;">
        <strong>Configuration Notice:</strong> Direct message transmission is temporarily unavailable in this static build because the Web3Forms gateway key is not configured.
      </div>`
      }
    </section>

    <section class="section-block">
      <h3 class="section-title">Operational Coordinates &amp; Status</h3>
      <table class="info-table">
        <tbody>
          <tr>
            <th scope="row">Full Name</th>
            <td>${escapeHtml(contact.name)}</td>
          </tr>
          <tr>
            <th scope="row">Professional Title</th>
            <td>${escapeHtml(contact.title)}</td>
          </tr>
          <tr>
            <th scope="row">Geographic Base</th>
            <td>${escapeHtml(contact.location)}</td>
          </tr>
          <tr>
            <th scope="row">Current Availability</th>
            <td>${escapeHtml(contact.availability)}</td>
          </tr>
          <tr>
            <th scope="row">Operational Mode</th>
            <td>Static Fallback Interface (JavaScript Disabled)</td>
          </tr>
        </tbody>
      </table>
    </section>`;
}

function renderSkillProcessorContent(): string {
  const skillsByCategory = knowledgeEngine.getSkillsByCategory();
  const categoryNames: Record<string, string> = {
    languages: "Programming Languages",
    frameworks: "Frameworks & Libraries",
    cybersecurity_systems: "Cybersecurity & Systems Security",
    tools_infrastructure: "Tools & DevOps Infrastructure",
    domains: "Core Engineering Domains",
  };

  const sectionsHtml = Object.entries(skillsByCategory)
    .map(([category, skills]) => {
      const displayName = categoryNames[category] || category;

      const skillsCards = skills
        .map(
          (s) => {
            const linkedProjectsHtml = s.linkedProjectIds.length > 0
              ? `<p style="font-size: 0.8rem; color: #94a3b8; margin-top: auto; padding-top: 8px;">Used in: ${s.linkedProjectIds.map((pid) => {
                  const proj = knowledgeEngine.getProjectById(pid);
                  const title = proj ? proj.title : pid;
                  return `<a href="./engineering-laboratory.html#project-${escapeHtml(pid)}" aria-label="Inspect ${escapeHtml(title)} in Engineering Laboratory">${escapeHtml(title)}</a>`;
                }).join(", ")}</p>`
              : "";

            return `        <div id="skill-${escapeHtml(s.id)}" class="fallback-card">
          <div class="card-header-row">
            <h4 class="card-title">${escapeHtml(s.name)}</h4>
            <span class="badge badge-tier" data-proficiency="${escapeHtml(s.proficiencyLevel)}">${escapeHtml(formatProficiency(s.proficiencyLevel))}</span>
          </div>
          <p style="font-size: 0.88rem; line-height: 1.5;">${escapeHtml(s.description || "")}</p>
          ${linkedProjectsHtml}
        </div>`;
          }
        )
        .join("\n");

      return `    <section class="section-block">
      <h3 class="section-title">${escapeHtml(displayName)}</h3>
      <div class="card-grid">
${skillsCards}
      </div>
    </section>`;
    })
    .join("\n\n");

  return `${sectionsHtml}`;
}

function renderMissionControlContent(): string {
  const stats = knowledgeEngine.getStats();
  const projects = knowledgeEngine.getProjects();
  const resumes = knowledgeEngine.getResumeVariants();
  const skills = knowledgeEngine.getSkills();
  const achievements = knowledgeEngine.getAchievements();
  const timeline = knowledgeEngine.getTimeline();

  return `    <section class="section-block" style="margin-top: 0;">
      <h3 class="section-title">Headquarters Telemetry Metrics</h3>
      <table class="info-table">
        <thead>
          <tr>
            <th>Facility Index Metric</th>
            <th>Recorded Quantity</th>
            <th>Direct Navigation Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Engineering Laboratory Projects</td>
            <td><strong>${stats.projectsCount}</strong></td>
            <td><a href="./engineering-laboratory.html">Explore Projects &rarr;</a></td>
          </tr>
          <tr>
            <td>Technical Skills &amp; Proficiencies</td>
            <td><strong>${stats.skillsCount}</strong></td>
            <td><a href="./skill-processor.html">Inspect Skill Matrix &rarr;</a></td>
          </tr>
          <tr>
            <td>Verified Credentials &amp; Honors</td>
            <td><strong>${stats.achievementsCount}</strong></td>
            <td><a href="./achievement-hall.html">Review Achievements &rarr;</a></td>
          </tr>
          <tr>
            <td>Timeline Chronology Milestones</td>
            <td><strong>${stats.timelineCount}</strong></td>
            <td><a href="./memory-archive.html">View Career Timeline &rarr;</a></td>
          </tr>
          <tr>
            <td>Role-Tailored Resume Variants</td>
            <td><strong>${stats.resumeVariantsCount}</strong></td>
            <td><a href="./document-vault.html">Download Resumes &rarr;</a></td>
          </tr>
          <tr>
            <td>Total Operational Facility Rooms</td>
            <td><strong>${stats.roomsCount}</strong></td>
            <td><a href="./index.html">System Hub Lobby &rarr;</a></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Comprehensive Sitemap Index (Volume 2 §11: Static search replacement) -->
    <section class="section-block">
      <h3 class="section-title">Complete Static Content Sitemap Index</h3>
      <p style="margin-bottom: 16px; font-size: 0.92rem; color: #94a3b8;">
        Full-text search requires JavaScript. Under static fallback mode, this complete sitemap provides instant, non-blocking navigation to every specimen, credential, and document in KAI HQ.
      </p>

      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 10px;">1. Engineering Projects (Lab)</h4>
        <ul style="margin-left: 20px; line-height: 1.8;">
          ${projects.map((p) => `<li><a href="./engineering-laboratory.html#project-${escapeHtml(p.id)}">${escapeHtml(p.title)}</a> &mdash; <em>${escapeHtml(p.domain)}</em></li>`).join("\n          ")}
        </ul>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 10px;">2. Role-Tailored Resumes (Document Vault)</h4>
        <ul style="margin-left: 20px; line-height: 1.8;">
          ${resumes.map((r) => `<li><a href="../documents/${path.basename(r.fileUrl)}" download>${escapeHtml(r.roleTitle)}</a> &mdash; PDF Specification (${escapeHtml(r.label)})</li>`).join("\n          ")}
        </ul>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 10px;">3. Verified Achievements &amp; Honors</h4>
        <ul style="margin-left: 20px; line-height: 1.8;">
          ${achievements.map((a) => `<li><a href="./achievement-hall.html#achievement-${escapeHtml(a.id)}">${escapeHtml(a.title)}</a> &mdash; ${escapeHtml(a.issuer)} (${escapeHtml(a.date)})</li>`).join("\n          ")}
        </ul>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 10px;">4. Career &amp; Academic Timeline</h4>
        <ul style="margin-left: 20px; line-height: 1.8;">
          ${timeline.map((t) => `<li><a href="./memory-archive.html#timeline-${escapeHtml(t.id)}">${escapeHtml(t.title)}</a> &mdash; ${escapeHtml(t.organization)} (${escapeHtml(t.period)})</li>`).join("\n          ")}
        </ul>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 10px;">5. Technical Skills Matrix (${skills.length} Skills)</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${skills.map((s) => `<a href="./skill-processor.html#skill-${escapeHtml(s.id)}" class="tag" style="text-decoration: none;">${escapeHtml(s.name)}</a>`).join("\n          ")}
        </div>
      </div>
    </section>`;
}

// ============================================================================
// MAIN GENERATOR ROUTINE
// ============================================================================

export function generateStaticFallback(): { generatedFiles: string[]; totalBytes: number } {
  console.log("=== KAI HQ Phase 6.2: Generating Static No-JS Fallback ===");
  console.log(`Output Directory: ${OUTPUT_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const generatedFiles: string[] = [];
  let totalBytes = 0;

  // 1. Generate standalone fallback.css for caching / optional external link
  const cssPath = path.join(OUTPUT_DIR, "fallback.css");
  fs.writeFileSync(cssPath, FALLBACK_CSS.trim(), "utf-8");
  generatedFiles.push("fallback.css");
  totalBytes += Buffer.byteLength(FALLBACK_CSS, "utf-8");

  // 2. Generate all 8 room HTML files
  for (const room of ROOM_DEFINITIONS) {
    let contentHtml = "";

    switch (room.id) {
      case "Lobby":
        contentHtml = renderLobbyContent();
        break;
      case "EngineeringLaboratory":
        contentHtml = renderEngineeringLabContent();
        break;
      case "MemoryArchive":
        contentHtml = renderMemoryArchiveContent();
        break;
      case "AchievementHall":
        contentHtml = renderAchievementHallContent();
        break;
      case "DocumentVault":
        contentHtml = renderDocumentVaultContent();
        break;
      case "CommunicationCenter":
        contentHtml = renderCommunicationCenterContent();
        break;
      case "SkillProcessor":
        contentHtml = renderSkillProcessorContent();
        break;
      case "MissionControl":
        contentHtml = renderMissionControlContent();
        break;
    }

    const fullHtml = renderPage(room.id, contentHtml);
    const filePath = path.join(OUTPUT_DIR, room.filename);
    fs.writeFileSync(filePath, fullHtml, "utf-8");

    generatedFiles.push(room.filename);
    const bytes = Buffer.byteLength(fullHtml, "utf-8");
    totalBytes += bytes;

    console.log(`  ✓ Generated ${room.filename.padEnd(30)} [${room.code}] (${(bytes / 1024).toFixed(1)} KB)`);

    // If generating Lobby (index.html), also generate lobby.html as an identical entry point
    if (room.id === "Lobby") {
      const lobbyPath = path.join(OUTPUT_DIR, "lobby.html");
      fs.writeFileSync(lobbyPath, fullHtml, "utf-8");
      generatedFiles.push("lobby.html");
      totalBytes += bytes;
      console.log(`  ✓ Generated lobby.html (mirror)             [ROOM-01] (${(bytes / 1024).toFixed(1)} KB)`);
    }
  }

  console.log(`\nSuccessfully generated ${generatedFiles.length} static fallback assets (${(totalBytes / 1024).toFixed(1)} KB total)`);
  console.log("=========================================================\n");

  return { generatedFiles, totalBytes };
}

// Auto-run if executed directly as a script
if (process.argv[1] && process.argv[1].endsWith("generate-fallback.ts")) {
  generateStaticFallback();
}
