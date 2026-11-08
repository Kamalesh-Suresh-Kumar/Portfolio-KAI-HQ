import { test, expect } from "@playwright/test";

/**
 * KAI HQ — Production Base-Path E2E Suite (Phase 6.3.3)
 *
 * Verifies that the application executes cleanly when served under the GitHub Pages
 * production repository sub-path: /Portfolio-KAI-HQ/
 */

const BASE_PREFIX = "/Portfolio-KAI-HQ";

const ROOM_PATHS = [
  { name: "Lobby", path: `${BASE_PREFIX}/`, content: "Kamalesh Suresh Kumar" },
  { name: "Engineering Laboratory", path: `${BASE_PREFIX}/engineering-laboratory`, content: "Engineering Laboratory" },
  { name: "Memory Archive", path: `${BASE_PREFIX}/memory-archive`, content: "Memory Archive" },
  { name: "Achievement Hall", path: `${BASE_PREFIX}/achievement-hall`, content: "Achievement Hall" },
  { name: "Document Vault", path: `${BASE_PREFIX}/document-vault`, content: "Curated Career Variants" },
  { name: "Communication Center", path: `${BASE_PREFIX}/communication-center`, content: "Communication Center" },
  { name: "Skill Processor", path: `${BASE_PREFIX}/skill-processor`, content: "Skill Processor" },
  { name: "Mission Control", path: `${BASE_PREFIX}/mission-control`, content: "Mission Control" },
];

test.describe("Production Base-Path Suite (/Portfolio-KAI-HQ/)", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass the visual boot sequence to ensure deterministic execution
    await page.addInitScript(() => {
      sessionStorage.setItem("kai_hq_booted", "true");
    });
  });

  test("verifies that Lobby and core assets load under /Portfolio-KAI-HQ/", async ({ page }) => {
    const failedRequests: string[] = [];

    // Monitor network requests to ensure no assets 404
    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().includes("favicon.ico")) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto(`${BASE_PREFIX}/`);
    await page.waitForSelector("main");

    // Verify main title and contact information
    await expect(page.locator("main")).toContainText("Kamalesh Suresh Kumar");
    await expect(page.locator("#kai-sidebar-nav")).toBeVisible();

    // Verify no broken resource requests
    expect(failedRequests).toEqual([]);
  });

  for (const item of ROOM_PATHS) {
    test(`verifies room ${item.name} direct entry and refresh under ${item.path}`, async ({ page }) => {
      await page.goto(item.path);
      await page.waitForSelector("main");

      // Verify content is present
      await expect(page.locator("main")).toContainText(item.content);

      // Verify active navigation state
      const navBtn = page.locator(`#kai-sidebar-nav button:has-text("${item.name}")`);
      await expect(navBtn).toHaveAttribute("aria-current", "page");

      // Verify refresh preserves base path and nested route
      await page.reload();
      await page.waitForSelector("main");
      await expect(page.locator("main")).toContainText(item.content);
      expect(page.url()).toContain(item.path);
    });
  }

  test("verifies that resume PDF download links resolve without 404 errors", async ({ page, request }) => {
    await page.goto(`${BASE_PREFIX}/document-vault`);
    await page.waitForSelector("main");

    const pdfVariants = [
      "resume-fullstack.pdf",
      "resume-backend.pdf",
      "resume-cybersecurity.pdf",
      "resume-ai-systems.pdf",
    ];

    for (const pdf of pdfVariants) {
      // Direct HTTP check against the preview server
      const res = await request.get(`/documents/${pdf}`);
      expect(res.status(), `Physical PDF ${pdf} should return HTTP 200`).toBe(200);
      const contentType = res.headers()["content-type"];
      expect(contentType).toMatch(/application\/pdf/i);
    }
  });
});
