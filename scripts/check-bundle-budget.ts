/**
 * KAI HQ — Automated Bundle Budget Verification Script (Phase 6.3.4)
 *
 * Verifies that production build assets comply with the performance and
 * deliverability budget limits specified in Docs/KAI-HQ-Volume-3-Technical-Design.md §11.3:
 * - Initial JavaScript bundle (critical path): <= 180 KB gzip maximum (180,000 bytes)
 * - CSS: <= 25 KB gzip maximum (25,000 bytes)
 *
 * Lazy-loaded JavaScript chunks (e.g. dynamically imported rooms, 3D environment, or async modules)
 * are reported separately for diagnostic transparency and are NOT counted against the initial
 * critical-path entry budget.
 *
 * Asset resolution strategy:
 * 1. Checks Vite build manifest (`dist/.vite/manifest.json` or `dist/manifest.json`)
 *    to authoritatively identify the critical path entry file (`isEntry: true` or `index.html`).
 * 2. Fallback: inspects `dist/index.html` module script tag `<script type="module" src="...">`.
 * 3. Fails deterministically if entry asset is ambiguous or missing.
 *
 * Units convention:
 * - Decimal: 1 KB = 1,000 bytes (matching Vite CLI reporting convention and Volume 3 specification)
 * - Binary (KiB): 1 KiB = 1,024 bytes (provided for secondary reference)
 *
 * Exits with status code 0 on success; exits with status code 1 on budget violation
 * or if assets cannot be located/read.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

interface AssetSizeReport {
  file: string;
  rawBytes: number;
  gzipBytes: number;
}

const JS_BUDGET_KB = 180;
const CSS_BUDGET_KB = 25;

const JS_BUDGET_BYTES = JS_BUDGET_KB * 1000;
const CSS_BUDGET_BYTES = CSS_BUDGET_KB * 1000;

function formatSize(bytes: number): string {
  const kb = (bytes / 1000).toFixed(2);
  const kib = (bytes / 1024).toFixed(2);
  return `${kb} KB (${kib} KiB / ${bytes.toLocaleString()} B)`;
}

function getGzipSize(filePath: string): { rawBytes: number; gzipBytes: number } {
  const content = fs.readFileSync(filePath);
  const stat = fs.statSync(filePath);
  const gzip = zlib.gzipSync(content, { level: 9 });
  return { rawBytes: stat.size, gzipBytes: gzip.length };
}

function resolveEntryJsFile(distDir: string): { entryFile: string; manifestFound: boolean } {
  // Check Vite 5/6+ default location: dist/.vite/manifest.json
  const dotViteManifest = path.join(distDir, ".vite", "manifest.json");
  // Check root dist location: dist/manifest.json
  const rootManifest = path.join(distDir, "manifest.json");

  let manifestPath: string | null = null;
  if (fs.existsSync(dotViteManifest)) {
    manifestPath = dotViteManifest;
  } else if (fs.existsSync(rootManifest)) {
    manifestPath = rootManifest;
  }

  if (manifestPath) {
    try {
      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      // Search for isEntry: true
      for (const record of Object.values<{ file?: string; isEntry?: boolean }>(manifestContent)) {
        if (record.isEntry && record.file && record.file.endsWith(".js")) {
          return { entryFile: record.file, manifestFound: true };
        }
      }
      // Also check standard entry key "index.html"
      if (manifestContent["index.html"] && manifestContent["index.html"].file) {
        return { entryFile: manifestContent["index.html"].file, manifestFound: true };
      }
    } catch (err) {
      console.warn(`[WARN] Failed to parse manifest at '${manifestPath}':`, err);
    }
  }

  // Fallback: parse dist/index.html to find <script type="module" crossorigin src="..."></script>
  const indexHtmlPath = path.join(distDir, "index.html");
  if (fs.existsSync(indexHtmlPath)) {
    const htmlContent = fs.readFileSync(indexHtmlPath, "utf-8");
    const scriptMatch = htmlContent.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i);
    if (scriptMatch && scriptMatch[1]) {
      let scriptSrc = scriptMatch[1];
      // Strip leading slash or base path if present
      scriptSrc = scriptSrc.replace(/^\/+/, "");
      // If base path was prepended like Portfolio-KAI-HQ/assets/...
      if (scriptSrc.includes("assets/")) {
        scriptSrc = scriptSrc.substring(scriptSrc.indexOf("assets/"));
      }
      return { entryFile: scriptSrc, manifestFound: false };
    }
  }

  throw new Error(
    "Could not authoritatively identify the primary entry JavaScript bundle from either Vite manifest or dist/index.html."
  );
}

function runBundleBudgetCheck(): void {
  const distDir = path.resolve(process.cwd(), "dist");
  const assetsDir = path.join(distDir, "assets");

  console.log("================================================================================");
  console.log("KAI HQ — Production Bundle Budget Verification (Phase 6.3.4)");
  console.log("Docs/KAI-HQ-Volume-3-Technical-Design.md §11.3 Performance Budget Specification");
  console.log("================================================================================");
  console.log(`Dist Directory:   ${distDir}`);
  console.log(`Assets Directory: ${assetsDir}`);
  console.log("Budget Standard:  Decimal (1 KB = 1,000 B) | Reference: Binary (1 KiB = 1,024 B)");
  console.log(`Budgets:          Initial Critical-Path JS <= ${JS_BUDGET_KB} KB gzip | Total CSS <= ${CSS_BUDGET_KB} KB gzip\n`);

  if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
    console.error(
      `[FAIL] Distribution assets directory not found at '${assetsDir}'.\n` +
        "Ensure 'npm run build' has completed before running this budget check."
    );
    process.exit(1);
  }

  // 1. Resolve entry JavaScript bundle
  let entryRelativePath: string;
  let manifestFound = false;
  try {
    const resolution = resolveEntryJsFile(distDir);
    entryRelativePath = resolution.entryFile;
    manifestFound = resolution.manifestFound;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }

  const entryFileName = path.basename(entryRelativePath);
  const entryFullPath = path.join(distDir, entryRelativePath);

  if (!fs.existsSync(entryFullPath)) {
    console.error(`[FAIL] Resolved entry JavaScript asset '${entryFullPath}' does not exist on disk.`);
    process.exit(1);
  }

  // 2. Scan all JS and CSS assets in dist/assets
  let entries: string[];
  try {
    entries = fs.readdirSync(assetsDir);
  } catch (err) {
    console.error(`[FAIL] Unable to read assets directory '${assetsDir}':`, err);
    process.exit(1);
  }

  let entryJsReport: AssetSizeReport | null = null;
  const lazyJsReports: AssetSizeReport[] = [];
  const cssReports: AssetSizeReport[] = [];

  for (const entry of entries) {
    if (entry.endsWith(".map")) continue;

    const fullPath = path.join(assetsDir, entry);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(fullPath);
    } catch (err) {
      console.warn(`[WARN] Skipping unreadable entry '${entry}':`, err);
      continue;
    }

    if (!stat.isFile()) continue;

    if (entry.endsWith(".js")) {
      const { rawBytes, gzipBytes } = getGzipSize(fullPath);
      const report: AssetSizeReport = { file: entry, rawBytes, gzipBytes };
      if (entry === entryFileName) {
        entryJsReport = report;
      } else {
        lazyJsReports.push(report);
      }
    } else if (entry.endsWith(".css")) {
      const { rawBytes, gzipBytes } = getGzipSize(fullPath);
      cssReports.push({ file: entry, rawBytes, gzipBytes });
    }
  }

  if (!entryJsReport) {
    console.error(`[FAIL] Entry JavaScript file '${entryFileName}' was not found in assets inventory.`);
    process.exit(1);
  }

  if (cssReports.length === 0) {
    console.error("[FAIL] No CSS (.css) production assets found in 'dist/assets'.");
    process.exit(1);
  }

  // 3. Evaluation and Reporting
  let failed = false;

  console.log(`[Source of Truth: ${manifestFound ? "Vite Manifest (dist/.vite/manifest.json)" : "HTML Parsing (dist/index.html)"}]`);
  console.log("--- 1. Initial Critical-Path JavaScript Bundle ---");
  console.log(`  • Entry Asset:   ${entryJsReport.file}`);
  console.log(`    Raw Size:      ${(entryJsReport.rawBytes / 1000).toFixed(2)} KB (${entryJsReport.rawBytes.toLocaleString()} B)`);
  console.log(`    Gzip Size:     ${formatSize(entryJsReport.gzipBytes)}`);
  console.log(`    Budget Limit:  ${formatSize(JS_BUDGET_BYTES)}`);
  const jsHeadroom = JS_BUDGET_BYTES - entryJsReport.gzipBytes;
  console.log(`    Headroom:      ${jsHeadroom >= 0 ? "+" : ""}${formatSize(jsHeadroom)}`);

  if (entryJsReport.gzipBytes > JS_BUDGET_BYTES) {
    console.error(
      `  [FAIL] Critical path JS bundle exceeded ${JS_BUDGET_KB} KB budget by ${formatSize(
        entryJsReport.gzipBytes - JS_BUDGET_BYTES
      )}!`
    );
    failed = true;
  } else {
    const percentage = ((entryJsReport.gzipBytes / JS_BUDGET_BYTES) * 100).toFixed(1);
    console.log(`  [PASS] Critical path JS within budget (${percentage}% of ${JS_BUDGET_KB} KB limit utilized).\n`);
  }

  console.log("--- 2. Lazy-Loaded / Non-Critical JavaScript Chunks (Report Only) ---");
  if (lazyJsReports.length === 0) {
    console.log("  No separate lazy-loaded JavaScript chunks detected (monolithic bundle).");
  } else {
    let totalLazyGzip = 0;
    for (const chunk of lazyJsReports) {
      totalLazyGzip += chunk.gzipBytes;
      console.log(`  • ${chunk.file} -> raw: ${(chunk.rawBytes / 1000).toFixed(2)} KB | gzip: ${formatSize(chunk.gzipBytes)}`);
    }
    console.log(`  Total Lazy-Loaded JS Chunks: ${lazyJsReports.length} files | ${formatSize(totalLazyGzip)} gzipped`);
  }
  console.log("  (Note: Lazy chunks load asynchronously on demand and are not counted against initial critical path)\n");

  console.log("--- 3. Production CSS Assets ---");
  let totalCssGzip = 0;
  for (const css of cssReports) {
    totalCssGzip += css.gzipBytes;
    console.log(`  • ${css.file} -> raw: ${(css.rawBytes / 1000).toFixed(2)} KB | gzip: ${formatSize(css.gzipBytes)}`);
  }
  const cssHeadroom = CSS_BUDGET_BYTES - totalCssGzip;
  console.log(`  Total CSS Gzip: ${formatSize(totalCssGzip)}`);
  console.log(`  Budget Limit:   ${formatSize(CSS_BUDGET_BYTES)}`);
  console.log(`  Headroom:       ${cssHeadroom >= 0 ? "+" : ""}${formatSize(cssHeadroom)}`);

  if (totalCssGzip > CSS_BUDGET_BYTES) {
    console.error(
      `  [FAIL] CSS bundle exceeded ${CSS_BUDGET_KB} KB budget by ${formatSize(totalCssGzip - CSS_BUDGET_BYTES)}!`
    );
    failed = true;
  } else {
    const percentage = ((totalCssGzip / CSS_BUDGET_BYTES) * 100).toFixed(1);
    console.log(`  [PASS] CSS bundle within budget (${percentage}% of ${CSS_BUDGET_KB} KB limit utilized).\n`);
  }

  console.log("================================================================================");
  if (failed) {
    console.error("[GATE FAILED] Bundle budget threshold violation. Build rejected.");
    process.exit(1);
  } else {
    console.log("[GATE PASSED] All assets strictly comply with Volume 3 §11.3 budget specifications.");
    process.exit(0);
  }
}

runBundleBudgetCheck();
