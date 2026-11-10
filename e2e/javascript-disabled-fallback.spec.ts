import { test, expect } from "@playwright/test";

/**
 * KAI HQ — JavaScript-Disabled Static Fallback E2E Suite (Phase 6.3.3)
 *
 * Verifies that with JavaScript disabled in the browser, the pre-rendered static
 * fallback remains 100% readable, navigable, and accessible (UX-007 / AD-03).
 */

const FALLBACK_ROOMS = [
  { file: "index.html", title: "Lobby", heading: "Lobby", sampleText: "Kamalesh Suresh Kumar" },
  { file: "lobby.html", title: "Lobby", heading: "Lobby", sampleText: "Kamalesh Suresh Kumar" },
  { file: "engineering-laboratory.html", title: "Engineering Laboratory", heading: "Engineering Laboratory", sampleText: "Li-Fi Penetration Testing" },
  { file: "memory-archive.html", title: "Memory Archive", heading: "Memory Archive", sampleText: "Computer Science and Engineering" },
  { file: "achievement-hall.html", title: "Achievement Hall", heading: "Achievement Hall", sampleText: "Cybercrime Police Department" },
  { file: "document-vault.html", title: "Document Vault", heading: "Document Vault", sampleText: "Full-Stack Software Engineer" },
  { file: "communication-center.html", title: "Communication Center", heading: "Communication Center", sampleText: "kamalesh.sde@gmail.com" },
  { file: "skill-processor.html", title: "Skill Processor", heading: "Skill Processor", sampleText: "TypeScript" },
  { file: "mission-control.html", title: "Mission Control", heading: "Mission Control", sampleText: "Headquarters Telemetry Metrics" },
];

test.describe("JavaScript-Disabled Static Fallback Suite", () => {
  // Use a context where JavaScript is strictly disabled
  test.use({ javaScriptEnabled: false });

  test("verifies that static Lobby fallback loads with status notice and identity summary", async ({ page }) => {
    await page.goto("fallback/index.html");

    // Title and Static Mode Notice
    await expect(page).toHaveTitle(/Lobby — KAI HQ Static Fallback/);
    const noticeBanner = page.locator(".fallback-notice-banner");
    await expect(noticeBanner).toBeVisible();
    await expect(noticeBanner).toContainText("KAI HQ // STATIC NO-JAVASCRIPT FALLBACK");

    // Semantic headings and contact content
    await expect(page.locator("h1")).toContainText("KAI HQ — Kamalesh Artificial Intelligence Headquarters");
    await expect(page.locator("main")).toContainText("Kamalesh Suresh Kumar");
    await expect(page.locator("main")).toContainText("Software Engineer & Systems Specialist");

    // Telemetry overview metrics
    await expect(page.locator("main")).toContainText("Headquarters Telemetry Overview");
  });

  for (const room of FALLBACK_ROOMS) {
    test(`verifies static fallback page ${room.file} is directly reachable and readable without JS`, async ({ page }) => {
      await page.goto(`fallback/${room.file}`);

      // Verify page title and notice
      await expect(page).toHaveTitle(new RegExp(room.title));
      await expect(page.locator(".fallback-notice-banner")).toBeVisible();

      // Verify room heading and content
      await expect(page.locator(".room-heading")).toContainText(room.heading);
      await expect(page.locator("main")).toContainText(room.sampleText);

      // Verify active navigation tab has aria-current="page"
      const activeLink = page.locator(`.fallback-nav a.nav-link-active`);
      await expect(activeLink).toBeVisible();
      await expect(activeLink).toHaveAttribute("aria-current", "page");
    });
  }

  test("verifies internal navigation between fallback rooms works via pure static HTML links", async ({ page }) => {
    await page.goto("fallback/index.html");

    // 1. Click Engineering Laboratory in the static fallback nav
    await page.click('.fallback-nav a:has-text("Engineering Laboratory")');
    await expect(page).toHaveURL(/\/fallback\/engineering-laboratory\.html/);
    await expect(page.locator(".room-heading")).toContainText("Engineering Laboratory");

    // 2. Click Document Vault in the static fallback nav
    await page.click('.fallback-nav a:has-text("Document Vault")');
    await expect(page).toHaveURL(/\/fallback\/document-vault\.html/);
    await expect(page.locator(".room-heading")).toContainText("Document Vault");

    // 3. Click Return to Lobby in the static footer
    await page.click('.footer-nav a:has-text("Return to Lobby")');
    await expect(page).toHaveURL(/\/fallback\/index\.html/);
    await expect(page.locator(".room-heading")).toContainText("Lobby");
  });

  test("verifies direct resume PDF downloads resolve with HTTP 200 without JavaScript", async ({ page, request }) => {
    await page.goto("fallback/document-vault.html");

    // Check all 4 resume download buttons
    const downloadLinks = page.locator('a[download][href*="resume-"]');
    const count = await downloadLinks.count();
    expect(count, "Document vault must render 4 direct download links").toBe(4);

    for (let i = 0; i < count; i++) {
      const link = downloadLinks.nth(i);
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();

      // Resolve relative path against current page URL
      const absoluteUrl = new URL(href!, page.url()).toString();
      const res = await request.get(absoluteUrl);
      expect(res.status(), `Resume PDF ${href} must return HTTP 200`).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/application\/pdf/i);
    }
  });

  test("verifies index.html noscript element links cleanly to static fallback", async ({ page }) => {
    await page.goto("");

    // In JS-disabled browser, the <noscript> block is displayed
    const noscriptLink = page.locator('noscript a[href*="fallback/index.html"]').first();
    await expect(noscriptLink).toBeAttached();

    const fallbackHref = await noscriptLink.getAttribute("href");
    expect(fallbackHref).toBe("./fallback/index.html");
  });
});
