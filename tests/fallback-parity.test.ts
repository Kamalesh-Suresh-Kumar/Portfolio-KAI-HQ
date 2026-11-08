/**
 * KAI HQ — Static Fallback Knowledge Engine Parity Test Suite (Phase 6.3.2)
 *
 * Verifies 100% data, schema, and navigational parity between the typed
 * KnowledgeEngine repository and pre-rendered static fallback artifacts in public/fallback/.
 *
 * All assertions are dynamically derived from knowledgeEngine queries so that
 * any data updates are automatically enforced without test drift.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { knowledgeEngine } from "../src/knowledge-engine";
import type { RoomId } from "../src/knowledge-engine/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DIR = path.resolve(__dirname, "..", "public", "fallback");
const DOCUMENTS_DIR = path.resolve(__dirname, "..", "public", "documents");

const ROOM_FILES: Record<RoomId, string> = {
  Lobby: "index.html",
  EngineeringLaboratory: "engineering-laboratory.html",
  MemoryArchive: "memory-archive.html",
  AchievementHall: "achievement-hall.html",
  DocumentVault: "document-vault.html",
  CommunicationCenter: "communication-center.html",
  SkillProcessor: "skill-processor.html",
  MissionControl: "mission-control.html",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readFallbackFile(filename: string): string {
  const filePath = path.join(FALLBACK_DIR, filename);
  expect(fs.existsSync(filePath), `Static file ${filename} must exist in public/fallback/`).toBe(true);
  return fs.readFileSync(filePath, "utf-8");
}

describe("Static Fallback Knowledge Engine Parity Suite (Phase 6.3.2)", () => {
  describe("1. Structural Artifact Presence & Mirror Parity", () => {
    it("ensures public/fallback directory and standalone fallback.css exist", () => {
      expect(fs.existsSync(FALLBACK_DIR)).toBe(true);
      const cssPath = path.join(FALLBACK_DIR, "fallback.css");
      expect(fs.existsSync(cssPath)).toBe(true);
      const cssContent = fs.readFileSync(cssPath, "utf-8");
      expect(cssContent.length).toBeGreaterThan(100);
      expect(cssContent).toContain("--bg-shell");
    });

    it("ensures all eight canonical room HTML files exist", () => {
      for (const [roomId, filename] of Object.entries(ROOM_FILES)) {
        const filePath = path.join(FALLBACK_DIR, filename);
        expect(fs.existsSync(filePath), `Room ${roomId} output (${filename}) must exist`).toBe(true);
      }
    });

    it("ensures lobby.html exists and is byte-identical to index.html", () => {
      const indexPath = path.join(FALLBACK_DIR, "index.html");
      const lobbyPath = path.join(FALLBACK_DIR, "lobby.html");
      expect(fs.existsSync(indexPath)).toBe(true);
      expect(fs.existsSync(lobbyPath)).toBe(true);

      const indexBuf = fs.readFileSync(indexPath);
      const lobbyBuf = fs.readFileSync(lobbyPath);
      expect(indexBuf.equals(lobbyBuf)).toBe(true);
    });
  });

  describe("2. Page Shell, Accessibility Landmarks & Navigational Closure", () => {
    const allFilenames = [...Object.values(ROOM_FILES), "lobby.html"];

    it.each(allFilenames)("verifies page shell and accessibility landmarks in %s", (filename) => {
      const html = readFallbackFile(filename);

      // Doctype and language
      expect(html).toMatch(/<!DOCTYPE html>/i);
      expect(html).toContain('<html lang="en">');

      // Skip link
      expect(html).toContain('<a href="#main-content" class="skip-link">Skip to main content</a>');

      // Accessible static fallback notice banner (WAI-ARIA compliant div, not aside)
      expect(html).toContain('<div class="fallback-notice-banner" role="status" aria-label="Static Fallback Notice">');
      expect(html).not.toContain('<aside class="fallback-notice-banner" role="status"');

      // Semantic landmarks
      expect(html).toContain('<header class="fallback-header">');
      expect(html).toContain('<nav class="fallback-nav" aria-label="Headquarters Facility Rooms">');
      expect(html).toContain('<main id="main-content" class="fallback-main">');
      expect(html).toContain('<footer class="fallback-footer">');

      // Navigation links to all 8 facility rooms
      for (const targetFile of Object.values(ROOM_FILES)) {
        expect(html).toContain(`href="./${targetFile}"`);
      }

      // Footer quick links
      expect(html).toContain('<a href="./index.html">&larr; Return to Lobby (System Hub)</a>');
      expect(html).toContain('<a href="./engineering-laboratory.html">Projects Lab</a>');
      expect(html).toContain('<a href="./document-vault.html">Resume Downloads</a>');
      expect(html).toContain('<a href="./communication-center.html">Contact Coordinates</a>');
      expect(html).toContain('<a href="./mission-control.html">Sitemap Index</a>');
    });

    it("verifies aria-current='page' is correctly assigned to current room link", () => {
      for (const [, filename] of Object.entries(ROOM_FILES)) {
        const html = readFallbackFile(filename);
        // The active room link must have aria-current="page" and nav-link-active
        const linkPattern = new RegExp(`<a href="./${filename}" class="nav-link nav-link-active" aria-current="page">`);
        expect(html).toMatch(linkPattern);
      }
    });
  });

  describe("3. Lobby Hub & Telemetry Parity", () => {
    it("renders complete identity summary, availability, and active status", () => {
      const html = readFallbackFile("index.html");
      const contact = knowledgeEngine.getContact();

      expect(html).toContain(escapeHtml(contact.name));
      expect(html).toContain(escapeHtml(contact.title));
      expect(html).toContain(escapeHtml(contact.location));
      expect(html).toContain(escapeHtml(contact.availability));
      expect(html).toContain(escapeHtml(contact.systemStatus.status));
    });

    it("renders dynamic telemetry overview counts matching knowledgeEngine.getStats()", () => {
      const html = readFallbackFile("index.html");
      const stats = knowledgeEngine.getStats();

      expect(html).toContain(`${stats.projectsCount}`);
      expect(html).toContain(`${stats.skillsCount}`);
      expect(html).toContain(`${stats.achievementsCount}`);
      expect(html).toContain(`${stats.timelineCount}`);
      expect(html).toContain(`${stats.resumeVariantsCount}`);
      expect(html).toContain("Headquarters Telemetry Overview");
    });

    it("renders directory cards for all other seven facility rooms", () => {
      const html = readFallbackFile("index.html");
      const otherRooms = Object.entries(ROOM_FILES).filter(([id]) => id !== "Lobby");

      for (const [, filename] of otherRooms) {
        expect(html).toContain(`href="./${filename}"`);
      }
    });

    it("renders featured engineering projects and accessible lab buttons", () => {
      const html = readFallbackFile("index.html");
      const featured = knowledgeEngine.getFeaturedProjects();
      expect(featured.length).toBeGreaterThan(0);

      for (const p of featured) {
        expect(html).toContain(escapeHtml(p.title));
        expect(html).toContain(escapeHtml(p.domain.toUpperCase()));
        expect(html).toContain(`href="./engineering-laboratory.html#project-${escapeHtml(p.id)}"`);
        expect(html).toContain(`aria-label="Inspect ${escapeHtml(p.title)} in Engineering Laboratory"`);
      }
    });

    it("renders direct download links for all 4 resume variants with aria-labels", () => {
      const html = readFallbackFile("index.html");
      expect(html).toContain('aria-label="Download Full-Stack Resume PDF"');
      expect(html).toContain('aria-label="Download Backend Resume PDF"');
      expect(html).toContain('aria-label="Download Cybersecurity Resume PDF"');
      expect(html).toContain('aria-label="Download AI Systems Resume PDF"');
    });
  });

  describe("4. Engineering Laboratory Project & Specimen Parity", () => {
    it("renders all projects from knowledgeEngine with complete details and metrics", () => {
      const html = readFallbackFile("engineering-laboratory.html");
      const projects = knowledgeEngine.getProjects();
      expect(projects.length).toBeGreaterThan(0);

      for (const p of projects) {
        // Specimen article anchor
        expect(html).toContain(`id="project-${escapeHtml(p.id)}"`);
        expect(html).toContain(escapeHtml(p.title));
        expect(html).toContain(escapeHtml(p.domain.toUpperCase()));
        expect(html).toContain(escapeHtml(p.summary));
        expect(html).toContain(escapeHtml(p.description));

        // Tech stack tags
        for (const t of p.stack) {
          expect(html).toContain(escapeHtml(t));
        }

        // Metrics list
        if (p.metrics && p.metrics.length > 0) {
          for (const metric of p.metrics) {
            expect(html).toContain(escapeHtml(metric));
          }
        }

        // Architecture decision
        if (p.engineeringDecision) {
          expect(html).toContain(escapeHtml(p.engineeringDecision));
        }

        // Links
        if (p.links?.repo) {
          expect(html).toContain(`href="${escapeHtml(p.links.repo)}"`);
          expect(html).toContain(`aria-label="Source Repository for ${escapeHtml(p.title)}"`);
        }
        if (p.links?.demo) {
          expect(html).toContain(`href="${escapeHtml(p.links.demo)}"`);
          expect(html).toContain(`aria-label="Live Deployment for ${escapeHtml(p.title)}"`);
        }
        if (p.links?.documentation) {
          expect(html).toContain(`href="${escapeHtml(p.links.documentation)}"`);
          expect(html).toContain(`aria-label="Documentation for ${escapeHtml(p.title)}"`);
        }
      }
    });

    it("verifies project links do not emit undefined, null, or empty hrefs", () => {
      const html = readFallbackFile("engineering-laboratory.html");
      expect(html).not.toContain('href="undefined"');
      expect(html).not.toContain('href="null"');
      expect(html).not.toContain('href=""');
    });
  });

  describe("5. Memory Archive Career Chronology Parity", () => {
    it("renders all timeline milestones in exact source order", () => {
      const html = readFallbackFile("memory-archive.html");
      const timeline = knowledgeEngine.getTimeline();
      expect(timeline.length).toBeGreaterThan(0);

      let lastIndex = -1;
      for (const item of timeline) {
        expect(html).toContain(`id="timeline-${escapeHtml(item.id)}"`);
        expect(html).toContain(escapeHtml(item.title));
        expect(html).toContain(escapeHtml(item.organization));
        expect(html).toContain(escapeHtml(item.role));
        expect(html).toContain(escapeHtml(item.period));
        expect(html).toContain(escapeHtml(item.location));
        expect(html).toContain(escapeHtml(item.description));

        for (const ach of item.keyAchievements) {
          expect(html).toContain(escapeHtml(ach));
        }

        // Verify sequential appearance in HTML matches source order
        const currentIndex = html.indexOf(`id="timeline-${escapeHtml(item.id)}"`);
        expect(currentIndex).toBeGreaterThan(lastIndex);
        lastIndex = currentIndex;
      }
    });
  });

  describe("6. Achievement Hall Credentials & Cross-References Parity", () => {
    it("renders all achievements and credentials with issuer and date", () => {
      const html = readFallbackFile("achievement-hall.html");
      const achievements = knowledgeEngine.getAchievements();
      expect(achievements.length).toBeGreaterThan(0);

      for (const ach of achievements) {
        expect(html).toContain(`id="achievement-${escapeHtml(ach.id)}"`);
        expect(html).toContain(escapeHtml(ach.title));
        expect(html).toContain(escapeHtml(ach.issuer));
        expect(html).toContain(escapeHtml(ach.date));
        expect(html).toContain(escapeHtml(ach.description));

        if (ach.credentialUrl) {
          expect(html).toContain(`href="${escapeHtml(ach.credentialUrl)}"`);
        }
      }
    });

    it("resolves related project IDs to project titles and links to Engineering Laboratory", () => {
      const html = readFallbackFile("achievement-hall.html");
      const achievementsWithProjects = knowledgeEngine
        .getAchievements()
        .filter((a) => a.relatedProjectIds && a.relatedProjectIds.length > 0);

      expect(achievementsWithProjects.length).toBeGreaterThan(0);

      for (const ach of achievementsWithProjects) {
        for (const pid of ach.relatedProjectIds!) {
          const project = knowledgeEngine.getProjectById(pid);
          expect(project).toBeDefined();
          expect(html).toContain(`href="./engineering-laboratory.html#project-${escapeHtml(pid)}"`);
          expect(html).toContain(escapeHtml(project!.title));
        }
      }
    });
  });

  describe("7. Document Vault Resume Variants & Physical Artifact Parity", () => {
    it("renders all 4 resume variants with role titles, target scope, and highlights", () => {
      const html = readFallbackFile("document-vault.html");
      const resumes = knowledgeEngine.getResumeVariants();
      expect(resumes.length).toBe(4);

      for (const r of resumes) {
        expect(html).toContain(`id="resume-${escapeHtml(r.id)}"`);
        expect(html).toContain(escapeHtml(r.roleTitle));
        expect(html).toContain(escapeHtml(r.label));
        expect(html).toContain(escapeHtml(r.bestFor));
        expect(html).toContain(escapeHtml(r.lastUpdated));

        for (const h of r.highlights) {
          expect(html).toContain(escapeHtml(h));
        }
        for (const s of r.skillsSummary) {
          expect(html).toContain(escapeHtml(s));
        }

        // Accessible download and view buttons
        expect(html).toContain(`aria-label="Download ${escapeHtml(r.label)} resume PDF"`);
        expect(html).toContain(`aria-label="View ${escapeHtml(r.label)} resume PDF in browser"`);
      }
    });

    it("verifies physical PDF artifacts exist for all resume variants", () => {
      const resumes = knowledgeEngine.getResumeVariants();

      for (const r of resumes) {
        const filename = path.basename(r.fileUrl);
        const physicalPdfPath = path.join(DOCUMENTS_DIR, filename);
        expect(fs.existsSync(physicalPdfPath), `PDF file ${filename} must exist on disk`).toBe(true);

        const stat = fs.statSync(physicalPdfPath);
        expect(stat.size).toBeGreaterThan(1000);
      }
    });
  });

  describe("8. Communication Center & Operational Coordinates Parity", () => {
    it("renders contact channels, clean GitHub URL, and KAI Nexus name", () => {
      const html = readFallbackFile("communication-center.html");
      const contact = knowledgeEngine.getContact();

      // Email
      expect(html).toContain(`mailto:${escapeHtml(contact.email)}`);
      expect(html).toContain(escapeHtml(contact.email));

      // GitHub: must NOT contain duplicate https://github.com/https://github.com/
      expect(html).not.toContain("https://github.com/https://github.com/");
      const cleanGithubUrl = contact.github.startsWith("http") ? contact.github : `https://github.com/${contact.github}`;
      expect(html).toContain(`href="${escapeHtml(cleanGithubUrl)}"`);

      // KAI Nexus name
      const nexusName = contact.kaiNexus?.name || "KAI Nexus";
      expect(html).toContain(escapeHtml(nexusName));
      if (contact.kaiNexus?.url) {
        expect(html).toContain(`href="${escapeHtml(contact.kaiNexus.url)}"`);
      }
    });

    it("ensures operational coordinates table has scope='row' on header cells", () => {
      const html = readFallbackFile("communication-center.html");
      expect(html).toContain('<th scope="row">Full Name</th>');
      expect(html).toContain('<th scope="row">Professional Title</th>');
      expect(html).toContain('<th scope="row">Geographic Base</th>');
      expect(html).toContain('<th scope="row">Current Availability</th>');
      expect(html).toContain('<th scope="row">Operational Mode</th>');
    });
  });

  describe("9. Skill Processor Matrix & Formatted Proficiencies", () => {
    it("renders all skills with title-cased proficiency labels", () => {
      const html = readFallbackFile("skill-processor.html");
      const skills = knowledgeEngine.getSkills();
      expect(skills.length).toBeGreaterThan(0);

      // No raw unformatted proficiency identifiers
      expect(html).not.toContain('<span class="badge badge-tier">working_knowledge</span>');

      for (const s of skills) {
        expect(html).toContain(`id="skill-${escapeHtml(s.id)}"`);
        expect(html).toContain(escapeHtml(s.name));
      }
    });

    it("resolves linked project IDs to project titles with links to Engineering Laboratory", () => {
      const html = readFallbackFile("skill-processor.html");
      const skillsWithProjects = knowledgeEngine
        .getSkills()
        .filter((s) => s.linkedProjectIds && s.linkedProjectIds.length > 0);

      expect(skillsWithProjects.length).toBeGreaterThan(0);

      for (const skill of skillsWithProjects) {
        for (const pid of skill.linkedProjectIds) {
          const project = knowledgeEngine.getProjectById(pid);
          expect(project).toBeDefined();
          expect(html).toContain(`href="./engineering-laboratory.html#project-${escapeHtml(pid)}"`);
          expect(html).toContain(escapeHtml(project!.title));
        }
      }
    });
  });

  describe("10. Mission Control Telemetry & Comprehensive Sitemap Parity", () => {
    it("renders telemetry table matching all aggregate stats from knowledgeEngine", () => {
      const html = readFallbackFile("mission-control.html");
      const stats = knowledgeEngine.getStats();

      expect(html).toContain(`<strong>${stats.projectsCount}</strong>`);
      expect(html).toContain(`<strong>${stats.skillsCount}</strong>`);
      expect(html).toContain(`<strong>${stats.achievementsCount}</strong>`);
      expect(html).toContain(`<strong>${stats.timelineCount}</strong>`);
      expect(html).toContain(`<strong>${stats.resumeVariantsCount}</strong>`);
      expect(html).toContain(`<strong>${stats.roomsCount}</strong>`);
    });

    it("renders complete sitemap index linking to every entity in KAI HQ", () => {
      const html = readFallbackFile("mission-control.html");
      const projects = knowledgeEngine.getProjects();
      const resumes = knowledgeEngine.getResumeVariants();
      const achievements = knowledgeEngine.getAchievements();
      const timeline = knowledgeEngine.getTimeline();
      const skills = knowledgeEngine.getSkills();

      for (const p of projects) {
        expect(html).toContain(`href="./engineering-laboratory.html#project-${escapeHtml(p.id)}"`);
      }
      for (const r of resumes) {
        expect(html).toContain(path.basename(r.fileUrl));
      }
      for (const a of achievements) {
        expect(html).toContain(`href="./achievement-hall.html#achievement-${escapeHtml(a.id)}"`);
      }
      for (const t of timeline) {
        expect(html).toContain(`href="./memory-archive.html#timeline-${escapeHtml(t.id)}"`);
      }
      for (const s of skills) {
        expect(html).toContain(`href="./skill-processor.html#skill-${escapeHtml(s.id)}"`);
      }
    });
  });
});
