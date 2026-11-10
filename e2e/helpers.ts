/**
 * KAI HQ — Playwright E2E Shared Helpers & Base-Path Configuration
 *
 * Centralizes environment-aware application base path resolution:
 * - Local execution: '/'
 * - GitHub Actions:  '/Portfolio-KAI-HQ/'
 */

export const APP_BASE_PATH = process.env.GITHUB_ACTIONS ? "/Portfolio-KAI-HQ/" : "/";

/**
 * Returns a normalized sub-path without leading slashes so that
 * page.goto(appPath(slug)) resolves cleanly against Playwright's baseURL.
 *
 * Examples:
 * appPath("") => ""
 * appPath("/") => ""
 * appPath("/engineering-laboratory") => "engineering-laboratory"
 * appPath("fallback/index.html") => "fallback/index.html"
 */
export function appPath(subPath: string = ""): string {
  return subPath.replace(/^\/+/, "");
}
