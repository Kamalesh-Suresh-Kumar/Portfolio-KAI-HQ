/**
 * KAI HQ — Automated Bundle Budget Verification Script (Phase 6.3.4)
 *
 * Verifies that production build assets in `dist/assets/` strictly comply with
 * the established performance and deliverability budget limits:
 * - JavaScript: <= 180 KB gzip maximum (180,000 bytes)
 * - CSS: <= 25 KB gzip maximum (25,000 bytes)
 *
 * Units convention:
 * - Decimal: 1 KB = 1,000 bytes (matching Vite CLI reporting convention)
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

function runBundleBudgetCheck(): void {
  const assetsDir = path.resolve(process.cwd(), "dist/assets");

  console.log("========================================================");
  console.log("KAI HQ — Production Bundle Budget Verification (Phase 6.3.4)");
  console.log("========================================================");
  console.log(`Assets Directory: ${assetsDir}`);
  console.log("Budget Standard: Decimal (1 KB = 1,000 B) | Reference: Binary (1 KiB = 1,024 B)");
  console.log(`Limits: JavaScript <= ${JS_BUDGET_KB} KB gzip | CSS <= ${CSS_BUDGET_KB} KB gzip\n`);

  if (!fs.existsSync(assetsDir)) {
    console.error(
      `[FAIL] Assets directory not found at '${assetsDir}'.\n` +
        "Ensure 'npm run build' has completed before running this budget check."
    );
    process.exit(1);
  }

  let entries: string[];
  try {
    entries = fs.readdirSync(assetsDir);
  } catch (err) {
    console.error(`[FAIL] Unable to read assets directory '${assetsDir}':`, err);
    process.exit(1);
  }

  const jsAssets: AssetSizeReport[] = [];
  const cssAssets: AssetSizeReport[] = [];

  for (const entry of entries) {
    // Exclude source maps
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
      const content = fs.readFileSync(fullPath);
      const gzip = zlib.gzipSync(content, { level: 9 });
      jsAssets.push({ file: entry, rawBytes: stat.size, gzipBytes: gzip.length });
    } else if (entry.endsWith(".css")) {
      const content = fs.readFileSync(fullPath);
      const gzip = zlib.gzipSync(content, { level: 9 });
      cssAssets.push({ file: entry, rawBytes: stat.size, gzipBytes: gzip.length });
    }
  }

  if (jsAssets.length === 0) {
    console.error("[FAIL] No JavaScript (.js) production assets found in 'dist/assets'.");
    process.exit(1);
  }

  if (cssAssets.length === 0) {
    console.error("[FAIL] No CSS (.css) production assets found in 'dist/assets'.");
    process.exit(1);
  }

  const totalJsGzip = jsAssets.reduce((sum, a) => sum + a.gzipBytes, 0);
  const totalCssGzip = cssAssets.reduce((sum, a) => sum + a.gzipBytes, 0);

  console.log("--- JavaScript Assets ---");
  for (const a of jsAssets) {
    console.log(`  • ${a.file} -> raw: ${(a.rawBytes / 1000).toFixed(2)} KB | gzip: ${formatSize(a.gzipBytes)}`);
  }
  const jsHeadroom = JS_BUDGET_BYTES - totalJsGzip;
  console.log(`  Total JS Gzip: ${formatSize(totalJsGzip)}`);
  console.log(`  Budget Limit:  ${formatSize(JS_BUDGET_BYTES)}`);
  console.log(`  Headroom:      ${jsHeadroom >= 0 ? "+" : ""}${formatSize(jsHeadroom)}\n`);

  console.log("--- CSS Assets ---");
  for (const a of cssAssets) {
    console.log(`  • ${a.file} -> raw: ${(a.rawBytes / 1000).toFixed(2)} KB | gzip: ${formatSize(a.gzipBytes)}`);
  }
  const cssHeadroom = CSS_BUDGET_BYTES - totalCssGzip;
  console.log(`  Total CSS Gzip: ${formatSize(totalCssGzip)}`);
  console.log(`  Budget Limit:   ${formatSize(CSS_BUDGET_BYTES)}`);
  console.log(`  Headroom:       ${cssHeadroom >= 0 ? "+" : ""}${formatSize(cssHeadroom)}\n`);

  let failed = false;

  if (totalJsGzip > JS_BUDGET_BYTES) {
    console.error(
      `[FAIL] JavaScript bundle exceeded budget by ${formatSize(totalJsGzip - JS_BUDGET_BYTES)}!`
    );
    failed = true;
  } else {
    console.log(`[PASS] JavaScript bundle is within budget (${(jsHeadroom / 1000).toFixed(2)} KB headroom).`);
  }

  if (totalCssGzip > CSS_BUDGET_BYTES) {
    console.error(
      `[FAIL] CSS bundle exceeded budget by ${formatSize(totalCssGzip - CSS_BUDGET_BYTES)}!`
    );
    failed = true;
  } else {
    console.log(`[PASS] CSS bundle is within budget (${(cssHeadroom / 1000).toFixed(2)} KB headroom).`);
  }

  console.log("========================================================");

  if (failed) {
    console.error("Bundle Budget Gate FAILED — Quality threshold violated.");
    process.exit(1);
  } else {
    console.log("Bundle Budget Gate PASSED — All assets within performance thresholds.");
    process.exit(0);
  }
}

runBundleBudgetCheck();
