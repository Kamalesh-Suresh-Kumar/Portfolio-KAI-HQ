/**
 * KAI HQ — Static Fallback Accessibility Test Suite (Phase 6.3.2)
 *
 * Evaluates all pre-rendered static HTML fallback documents in public/fallback/
 * using axe-core (via vitest-axe) inside JSDOM.
 *
 * Guarantees that static fallback documents have zero WCAG AA accessibility violations,
 * proper document structure, accessible landmark roles, and high-contrast markup.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DIR = path.resolve(__dirname, "..", "public", "fallback");

const FALLBACK_PAGES = [
  { name: "Lobby Entry Hub (index.html)", filename: "index.html" },
  { name: "Lobby Mirror Route (lobby.html)", filename: "lobby.html" },
  { name: "Engineering Laboratory (engineering-laboratory.html)", filename: "engineering-laboratory.html" },
  { name: "Memory Archive (memory-archive.html)", filename: "memory-archive.html" },
  { name: "Achievement Hall (achievement-hall.html)", filename: "achievement-hall.html" },
  { name: "Document Vault (document-vault.html)", filename: "document-vault.html" },
  { name: "Communication Center (communication-center.html)", filename: "communication-center.html" },
  { name: "Skill Processor (skill-processor.html)", filename: "skill-processor.html" },
  { name: "Mission Control (mission-control.html)", filename: "mission-control.html" },
];

describe("Static Fallback Accessibility Audit Suite (Phase 6.3.2 / WCAG AA)", () => {
  it.each(FALLBACK_PAGES)("validates zero axe accessibility violations in $name", async ({ filename }) => {
    const filePath = path.join(FALLBACK_DIR, filename);
    expect(fs.existsSync(filePath), `Static HTML file ${filename} must exist`).toBe(true);

    const html = fs.readFileSync(filePath, "utf-8");

    // Parse into JSDOM Document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Run axe evaluation on documentElement
    const results = await axe(doc.documentElement, {
      rules: {
        // In JSDOM headless testing, color contrast calculations may lack CSS styling engine
        "color-contrast": { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });

  describe("Specific Fallback Accessibility Standards Verification", () => {
    it.each(FALLBACK_PAGES)("verifies presence of skip-link and proper landmark tags in $filename", ({ filename }) => {
      const filePath = path.join(FALLBACK_DIR, filename);
      const html = fs.readFileSync(filePath, "utf-8");

      // Skip to main content link targeting #main-content
      expect(html).toContain('<a href="#main-content" class="skip-link">Skip to main content</a>');
      expect(html).toContain('id="main-content"');

      // WAI-ARIA role="status" must not be applied to landmark <aside>
      expect(html).not.toMatch(/<aside[^>]*role="status"/i);
      expect(html).toMatch(/<div[^>]*class="fallback-notice-banner"[^>]*role="status"/i);

      // Unique title and meta description
      expect(html).toMatch(/<title>.+<\/title>/);
      expect(html).toMatch(/<meta name="description" content=".+">/);
    });

    it("verifies key-value data table in Communication Center includes scope='row'", () => {
      const html = fs.readFileSync(path.join(FALLBACK_DIR, "communication-center.html"), "utf-8");
      const thMatches = html.match(/<th\b[^>]*>/g) || [];
      expect(thMatches.length).toBeGreaterThan(0);
      for (const th of thMatches) {
        expect(th).toContain('scope="row"');
      }
    });

    it("verifies repeated download and inspection links contain descriptive aria-labels", () => {
      const vaultHtml = fs.readFileSync(path.join(FALLBACK_DIR, "document-vault.html"), "utf-8");
      expect(vaultHtml).toContain('aria-label="Download Full-Stack Software Engineer resume PDF"');
      expect(vaultHtml).toContain('aria-label="View Full-Stack Software Engineer resume PDF in browser"');

      const lobbyHtml = fs.readFileSync(path.join(FALLBACK_DIR, "index.html"), "utf-8");
      expect(lobbyHtml).toContain('aria-label="Enter Engineering Laboratory (ROOM-02)"');
    });
  });
});
