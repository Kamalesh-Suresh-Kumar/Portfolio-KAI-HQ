import { test, expect } from "@playwright/test";

/**
 * KAI HQ — Critical Facility Room Navigation E2E Suite (Phase 6.3.3)
 *
 * Verifies end-to-end interactive navigation across all eight facility rooms,
 * direct URL routing, nested route reloads, and browser history (back/forward).
 */

const ROOMS = [
  {
    name: "Lobby",
    slug: "",
    expectedHeading: "KAI HQ",
    expectedContent: "Kamalesh Suresh Kumar",
  },
  {
    name: "Engineering Laboratory",
    slug: "engineering-laboratory",
    expectedHeading: "Engineering Laboratory",
    expectedContent: "Li-Fi Penetration Testing",
  },
  {
    name: "Memory Archive",
    slug: "memory-archive",
    expectedHeading: "Memory Archive",
    expectedContent: "Computer Science and Engineering",
  },
  {
    name: "Achievement Hall",
    slug: "achievement-hall",
    expectedHeading: "Achievement Hall",
    expectedContent: "Cybercrime Police Department",
  },
  {
    name: "Document Vault",
    slug: "document-vault",
    expectedHeading: "Document Vault",
    expectedContent: "Role-Tailored Specifications",
  },
  {
    name: "Communication Center",
    slug: "communication-center",
    expectedHeading: "Communication Center",
    expectedContent: "kamalesh.sde@gmail.com",
  },
  {
    name: "Skill Processor",
    slug: "skill-processor",
    expectedHeading: "Skill Processor",
    expectedContent: "TypeScript",
  },
  {
    name: "Mission Control",
    slug: "mission-control",
    expectedHeading: "Mission Control",
    expectedContent: "Global Telemetry",
  },
];

test.describe("Critical Facility Room Navigation Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass the visual boot sequence to ensure deterministic execution
    await page.addInitScript(() => {
      sessionStorage.setItem("kai_hq_booted", "true");
    });
  });

  test("verifies that all eight facility rooms can be navigated via sidebar controls", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#kai-sidebar-nav");

    for (const room of ROOMS) {
      if (room.name === "Lobby") continue; // We start on Lobby

      // Click the room button in the sidebar
      const roomButton = page.locator(`#kai-sidebar-nav button:has-text("${room.name}")`);
      await expect(roomButton).toBeVisible();
      await roomButton.click();

      // Verify the URL changed to match the room slug
      await page.waitForURL(`**/${room.slug}`);

      // Verify room content rendered
      await expect(page.locator("main")).toContainText(room.expectedHeading);
      await expect(page.locator("main")).toContainText(room.expectedContent);

      // Verify sidebar navigation state
      await expect(roomButton).toHaveAttribute("aria-current", "page");
      await expect(roomButton).toHaveClass(/active/);
    }
  });

  test.describe("Direct URL Routing & Page Reload", () => {
    for (const room of ROOMS) {
      test(`verifies direct URL navigation and refresh for ${room.name}`, async ({ page }) => {
        const targetUrl = room.slug ? `/${room.slug}` : "/";
        await page.goto(targetUrl);
        await page.waitForSelector("main");

        // Verify correct room loaded on direct entry
        await expect(page.locator("main")).toContainText(room.expectedHeading);
        await expect(page.locator("main")).toContainText(room.expectedContent);

        // Verify navigation state indicator
        const activeNavBtn = page.locator(`#kai-sidebar-nav button:has-text("${room.name}")`);
        await expect(activeNavBtn).toHaveAttribute("aria-current", "page");

        // Reload the nested route to verify SPA server routing does not 404
        await page.reload();
        await page.waitForSelector("main");
        await expect(page.locator("main")).toContainText(room.expectedHeading);
        await expect(activeNavBtn).toHaveAttribute("aria-current", "page");
      });
    }
  });

  test("verifies browser Back and Forward history navigation maintains state", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#kai-sidebar-nav");

    // 1. Navigate Lobby -> Engineering Laboratory
    await page.locator('#kai-sidebar-nav button:has-text("Engineering Laboratory")').click();
    await page.waitForURL("**/engineering-laboratory");
    await expect(page.locator("main")).toContainText("Engineering Laboratory");

    // 2. Navigate Engineering Laboratory -> Memory Archive
    await page.locator('#kai-sidebar-nav button:has-text("Memory Archive")').click();
    await page.waitForURL("**/memory-archive");
    await expect(page.locator("main")).toContainText("Memory Archive");

    // 3. Navigate Memory Archive -> Document Vault
    await page.locator('#kai-sidebar-nav button:has-text("Document Vault")').click();
    await page.waitForURL("**/document-vault");
    await expect(page.locator("main")).toContainText("Document Vault");

    // 4. Press Back -> Should return to Memory Archive
    await page.goBack();
    await page.waitForURL("**/memory-archive");
    await expect(page.locator("main")).toContainText("Memory Archive");
    await expect(page.locator('#kai-sidebar-nav button:has-text("Memory Archive")')).toHaveAttribute("aria-current", "page");

    // 5. Press Back -> Should return to Engineering Laboratory
    await page.goBack();
    await page.waitForURL("**/engineering-laboratory");
    await expect(page.locator("main")).toContainText("Engineering Laboratory");
    await expect(page.locator('#kai-sidebar-nav button:has-text("Engineering Laboratory")')).toHaveAttribute("aria-current", "page");

    // 6. Press Forward -> Should return to Memory Archive
    await page.goForward();
    await page.waitForURL("**/memory-archive");
    await expect(page.locator("main")).toContainText("Memory Archive");
    await expect(page.locator('#kai-sidebar-nav button:has-text("Memory Archive")')).toHaveAttribute("aria-current", "page");

    // 7. Press Forward -> Should return to Document Vault
    await page.goForward();
    await page.waitForURL("**/document-vault");
    await expect(page.locator("main")).toContainText("Document Vault");
    await expect(page.locator('#kai-sidebar-nav button:has-text("Document Vault")')).toHaveAttribute("aria-current", "page");
  });
});
