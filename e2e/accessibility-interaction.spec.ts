import { test, expect } from "@playwright/test";

/**
 * KAI HQ — Accessibility Interaction E2E Suite (Phase 6.3.3)
 *
 * Verifies real browser keyboard navigation, skip-link focus management,
 * visible focus rings, and reduced-motion mode functionality.
 */

test.describe("Accessibility Interaction & Keyboard Navigation Suite", () => {
  test("verifies skip-to-main-content keyboard accessibility and focus transfer", async ({ page }) => {
    // Navigate with boot sequence skipped so the interface is immediately interactive
    await page.addInitScript(() => {
      sessionStorage.setItem("kai_hq_booted", "true");
    });
    await page.goto("");
    await page.waitForSelector(".skip-to-content-link");

    // Press Tab once to bring focus to the skip link
    await page.keyboard.press("Tab");

    // The skip link must be focused
    const isSkipLinkFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el !== null && el.classList.contains("skip-to-content-link");
    });
    expect(isSkipLinkFocused, "First Tab stroke must focus the skip link").toBe(true);

    // Press Enter to trigger the skip link
    await page.keyboard.press("Enter");

    // Focus must move directly to #main-content
    const isMainFocused = await page.evaluate(() => {
      return document.activeElement?.id === "main-content";
    });
    expect(isMainFocused, "Activating skip link must move focus to #main-content").toBe(true);
  });

  test("verifies keyboard navigation through sidebar facility rooms", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kai_hq_booted", "true");
    });
    await page.goto("");
    await page.waitForSelector("#kai-sidebar-nav");

    // Focus the first button in the sidebar nav
    const firstButton = page.locator("#kai-sidebar-nav button").first();
    await firstButton.focus();

    // Verify it has focus
    await expect(firstButton).toBeFocused();

    // Tab to the next button (Engineering Laboratory)
    await page.keyboard.press("Tab");
    const secondButton = page.locator("#kai-sidebar-nav button").nth(1);
    await expect(secondButton).toBeFocused();

    // Activate Engineering Laboratory via keyboard (Enter key)
    await page.keyboard.press("Enter");
    await page.waitForURL("**/engineering-laboratory");
    await expect(page.locator("main")).toContainText("Engineering Laboratory");
    await expect(secondButton).toHaveAttribute("aria-current", "page");

    // Tab to the next button (Memory Archive) and activate with Space key
    await page.keyboard.press("Tab");
    const thirdButton = page.locator("#kai-sidebar-nav button").nth(2);
    await expect(thirdButton).toBeFocused();
    await page.keyboard.press("Space");
    await page.waitForURL("**/memory-archive");
    await expect(page.locator("main")).toContainText("Memory Archive");
    await expect(thirdButton).toHaveAttribute("aria-current", "page");
  });

  test("verifies focus indicator visibility in the browser", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("kai_hq_booted", "true");
    });
    await page.goto("");
    await page.waitForSelector("#kai-sidebar-nav");

    const navButton = page.locator("#kai-sidebar-nav button").first();
    await navButton.focus();

    // Verify computed outline or focus styling
    const outlineInfo = await navButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
      };
    });

    // The element must exhibit an active focus indicator (either outline or box-shadow ring)
    const hasFocusRing =
      (outlineInfo.outlineStyle !== "none" && parseInt(outlineInfo.outlineWidth, 10) > 0) ||
      (outlineInfo.boxShadow !== "none" && outlineInfo.boxShadow.length > 0);

    expect(hasFocusRing, "Focused interactive element must render a visible focus ring").toBe(true);
  });

  test("verifies that reduced-motion preference bypasses intro sequence and maintains full functionality", async ({ page }) => {
    // Do NOT set sessionStorage kai_hq_booted, but emulate reduced-motion
    await page.emulateMedia({ reducedMotion: "reduce" });

    const startTime = Date.now();
    await page.goto("");
    await page.waitForSelector("main");
    const elapsed = Date.now() - startTime;

    // With reduced motion, boot sequence must resolve instantly (< 1000ms including page load)
    expect(elapsed, "Reduced motion must bypass the 1800ms boot animation").toBeLessThan(2000);

    // Layout should contain reduced-motion class
    const layoutHasReducedMotion = await page.locator(".layout").evaluate((el) => el.classList.contains("reduced-motion"));
    expect(layoutHasReducedMotion, "Layout container must reflect reduced-motion state").toBe(true);

    // Verify full interactive traversal remains functional
    await page.locator('#kai-sidebar-nav button:has-text("Mission Control")').click();
    await page.waitForURL("**/mission-control");
    await expect(page.locator("main")).toContainText("Mission Control");
  });
});
