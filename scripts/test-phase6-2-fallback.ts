/**
 * KAI HQ — Phase 6.2 Test Suite: Static No-JavaScript Fallback Audit
 *
 * Validates:
 * 1. Generator integrity: 8 room HTML files + mirror + CSS output
 * 2. HTML document semantics, heading hierarchies & skip link contracts
 * 3. Navigation closure: All room links resolve to existing generated pages and back to Lobby
 * 4. Content integrity: Complete parity with KnowledgeEngine (Projects, Skills, Achievements, Timeline, Resumes)
 * 5. Resume artifact links: Verified physical file targets in public/documents/
 * 6. Base-path agnosticism: Relative link resolution under root and /Portfolio-KAI-HQ/
 * 7. HTML entity escaping & safety
 * 8. Deterministic generator reproducibility (byte-for-byte idempotence)
 * 9. Semantic <noscript> integration in index.html
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { knowledgeEngine } from "../src/knowledge-engine";
import { generateStaticFallback } from "./generate-fallback";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DIR = path.resolve(__dirname, "..", "public", "fallback");
const DOCUMENTS_DIR = path.resolve(__dirname, "..", "public", "documents");
const INDEX_HTML_PATH = path.resolve(__dirname, "..", "index.html");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("=== KAI HQ Phase 6.2: Static No-JS Fallback Test Suite ===\n");

// 1. Generator Execution & File Inventory
console.log("1. Generator Execution & File Inventory");
{
  const { generatedFiles, totalBytes } = generateStaticFallback({
    isProduction: false,
  });
  assert(generatedFiles.length >= 9, `Generator produced ${generatedFiles.length} files (expected >= 9)`);
  assert(totalBytes > 50000, `Total generated fallback size is ${(totalBytes / 1024).toFixed(1)} KB (> 50 KB)`);

  const requiredRooms = [
    "index.html",
    "lobby.html",
    "engineering-laboratory.html",
    "memory-archive.html",
    "achievement-hall.html",
    "document-vault.html",
    "communication-center.html",
    "skill-processor.html",
    "mission-control.html",
  ];

  for (const roomFile of requiredRooms) {
    const fullPath = path.join(FALLBACK_DIR, roomFile);
    assert(fs.existsSync(fullPath), `Required static fallback room exists: public/fallback/${roomFile}`);
  }

  const cssPath = path.join(FALLBACK_DIR, "fallback.css");
  assert(fs.existsSync(cssPath), "Standalone fallback stylesheet exists: public/fallback/fallback.css");
}

// 2. Document Semantics & Structure Validation
console.log("\n2. Document Semantics & Structure Validation");
{
  const requiredRooms = [
    "index.html",
    "engineering-laboratory.html",
    "memory-archive.html",
    "achievement-hall.html",
    "document-vault.html",
    "communication-center.html",
    "skill-processor.html",
    "mission-control.html",
  ];

  for (const roomFile of requiredRooms) {
    const content = fs.readFileSync(path.join(FALLBACK_DIR, roomFile), "utf-8");

    assert(content.startsWith("<!DOCTYPE html>"), `${roomFile} begins with standard <!DOCTYPE html>`);
    assert(content.includes('<html lang="en">'), `${roomFile} specifies <html lang="en">`);
    assert(content.includes("<title>") && content.includes("</title>"), `${roomFile} has a populated <title> tag`);
    assert(content.includes('<meta name="description"'), `${roomFile} contains meta description tag`);
    assert(content.includes('<a href="#main-content" class="skip-link">'), `${roomFile} provides accessible skip-to-content link`);
    assert(content.includes('<main id="main-content"'), `${roomFile} provides <main id="main-content"> landmark`);
    assert(content.includes("<header") && content.includes("<footer"), `${roomFile} has semantic <header> and <footer> landmarks`);
    assert(content.includes("<style>") && content.includes("--bg-shell"), `${roomFile} embeds self-contained high-contrast CSS`);
    assert(
      content.includes("KAI HQ // STATIC NO-JAVASCRIPT FALLBACK"),
      `${roomFile} clearly identifies static fallback mode banner (UX-007, AD-03)`
    );
  }
}

// 3. Navigation Closure & Relative Link Verification
console.log("\n3. Navigation Closure & Relative Link Verification");
{
  const requiredRooms = [
    "index.html",
    "engineering-laboratory.html",
    "memory-archive.html",
    "achievement-hall.html",
    "document-vault.html",
    "communication-center.html",
    "skill-processor.html",
    "mission-control.html",
  ];

  for (const roomFile of requiredRooms) {
    const content = fs.readFileSync(path.join(FALLBACK_DIR, roomFile), "utf-8");

    // Must link back to Lobby
    assert(
      content.includes('href="./index.html"') || roomFile === "index.html",
      `${roomFile} contains link to Lobby (./index.html)`
    );

    // Navigation bar must reference all 8 rooms
    for (const targetRoom of requiredRooms) {
      assert(
        content.includes(`href="./${targetRoom}"`),
        `${roomFile} navigation contains link to ./${targetRoom}`
      );
    }

    // Must not contain hardcoded GitHub Pages absolute subpath
    assert(
      !content.includes('href="/Portfolio-KAI-HQ/fallback/'),
      `${roomFile} uses relative paths, avoiding hardcoded /Portfolio-KAI-HQ/ fallback links`
    );
  }
}

// 4. Content Parity with KnowledgeEngine
console.log("\n4. Content Parity with KnowledgeEngine");
{
  const contact = knowledgeEngine.getContact();
  const projects = knowledgeEngine.getProjects();
  const skills = knowledgeEngine.getSkills();
  const timeline = knowledgeEngine.getTimeline();
  const achievements = knowledgeEngine.getAchievements();

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Lobby content assertions
  const lobbyHtml = fs.readFileSync(path.join(FALLBACK_DIR, "index.html"), "utf-8");
  assert(lobbyHtml.includes(escapeHtml(contact.name)), `Lobby contains owner name: '${contact.name}'`);
  assert(lobbyHtml.includes("KAI HQ — UNDER ACTIVE DEVELOPMENT"), "Lobby contains active development status notice");
  assert(lobbyHtml.includes(escapeHtml(contact.title)), `Lobby contains owner title: '${contact.title}'`);

  // Engineering Laboratory assertions
  const engLabHtml = fs.readFileSync(path.join(FALLBACK_DIR, "engineering-laboratory.html"), "utf-8");
  for (const p of projects) {
    assert(engLabHtml.includes(escapeHtml(p.title)), `Engineering Lab includes project '${p.title}'`);
    assert(engLabHtml.includes(`id="project-${p.id}"`), `Engineering Lab has target anchor #project-${p.id}`);
  }

  // Memory Archive assertions
  const memoryHtml = fs.readFileSync(path.join(FALLBACK_DIR, "memory-archive.html"), "utf-8");
  for (const t of timeline) {
    assert(memoryHtml.includes(escapeHtml(t.title)), `Memory Archive includes milestone '${t.title}'`);
    assert(memoryHtml.includes(escapeHtml(t.organization)), `Memory Archive includes organization '${t.organization}'`);
    assert(memoryHtml.includes(`id="timeline-${t.id}"`), `Memory Archive has target anchor #timeline-${t.id}`);
  }

  // Achievement Hall assertions
  const achHtml = fs.readFileSync(path.join(FALLBACK_DIR, "achievement-hall.html"), "utf-8");
  for (const a of achievements) {
    assert(achHtml.includes(escapeHtml(a.title)), `Achievement Hall includes achievement '${a.title}'`);
    assert(achHtml.includes(escapeHtml(a.issuer)), `Achievement Hall includes issuer '${a.issuer}'`);
    assert(achHtml.includes(`id="achievement-${a.id}"`), `Achievement Hall has target anchor #achievement-${a.id}`);
  }

  // Skill Processor assertions
  const skillHtml = fs.readFileSync(path.join(FALLBACK_DIR, "skill-processor.html"), "utf-8");
  for (const s of skills) {
    assert(skillHtml.includes(escapeHtml(s.name)), `Skill Processor includes skill '${s.name}'`);
    assert(skillHtml.includes(escapeHtml(s.proficiencyLevel)), `Skill Processor displays proficiency for '${s.name}'`);
    assert(skillHtml.includes(`id="skill-${s.id}"`), `Skill Processor has target anchor #skill-${s.id}`);
  }

  // Communication Center assertions
  const commHtml = fs.readFileSync(path.join(FALLBACK_DIR, "communication-center.html"), "utf-8");
  assert(commHtml.includes(contact.email), `Communication Center includes email '${contact.email}'`);
  assert(commHtml.includes(`mailto:${contact.email}`), `Communication Center provides mailto link for '${contact.email}'`);
  assert(commHtml.includes(contact.github), `Communication Center includes GitHub coordinate '${contact.github}'`);

  // Mission Control assertions
  const mcHtml = fs.readFileSync(path.join(FALLBACK_DIR, "mission-control.html"), "utf-8");
  assert(mcHtml.includes("Headquarters Telemetry Metrics"), "Mission Control includes Telemetry Metrics table");
  assert(mcHtml.includes("Complete Static Content Sitemap Index"), "Mission Control includes complete sitemap replacement (UX-007)");
  assert(mcHtml.includes(String(projects.length)), "Mission Control reports accurate projects count");
  assert(mcHtml.includes(String(skills.length)), "Mission Control reports accurate skills count");
}

// 5. Resume Artifact Linkage & Physical File Verification
console.log("\n5. Resume Artifact Linkage & Physical File Verification");
{
  const vaultHtml = fs.readFileSync(path.join(FALLBACK_DIR, "document-vault.html"), "utf-8");
  const resumes = knowledgeEngine.getResumeVariants();

  assert(resumes.length === 4, "KnowledgeEngine specifies 4 resume variants");

  for (const r of resumes) {
    const filename = path.basename(r.fileUrl);
    const expectedLink = `../documents/${filename}`;

    assert(
      vaultHtml.includes(`href="${expectedLink}" download`),
      `Document Vault provides direct download link for '${r.roleTitle}' -> ${expectedLink}`
    );

    // Verify target file physically exists on disk
    const physicalPath = path.join(DOCUMENTS_DIR, filename);
    assert(fs.existsSync(physicalPath), `Physical PDF artifact exists: public/documents/${filename}`);

    const stats = fs.statSync(physicalPath);
    assert(stats.size > 1000, `Physical PDF artifact ${filename} has valid file size: ${stats.size} bytes`);
  }
}

// 6. HTML Entity Escaping & Safety Checks
console.log("\n6. HTML Entity Escaping & Safety Checks");
{
  const allFiles = fs.readdirSync(FALLBACK_DIR).filter((f) => f.endsWith(".html"));

  for (const file of allFiles) {
    const content = fs.readFileSync(path.join(FALLBACK_DIR, file), "utf-8");

    // Ensure raw unescaped script tags are not injected in dynamic content
    const bodyContent = content.substring(content.indexOf("<body>"));
    assert(!bodyContent.includes("<script"), `${file} body contains zero <script> tags (pure static HTML)`);

    // Ensure no unrendered template tags remain
    assert(!content.includes("${"), `${file} contains no unrendered template variables`);
    assert(!content.includes("undefined"), `${file} contains no unrendered undefined strings`);
    assert(!content.includes("null"), `${file} contains no unrendered null strings`);
  }
}

// 7. Deterministic Idempotence Check
console.log("\n7. Deterministic Idempotence Check");
{
  const snapshotBefore: Record<string, string> = {};
  const files = fs.readdirSync(FALLBACK_DIR);

  for (const file of files) {
    snapshotBefore[file] = fs.readFileSync(path.join(FALLBACK_DIR, file), "utf-8");
  }

  // Run generator again
  generateStaticFallback({
    isProduction: false,
  });

  let identicalCount = 0;
  for (const file of files) {
    const contentAfter = fs.readFileSync(path.join(FALLBACK_DIR, file), "utf-8");
    if (snapshotBefore[file] === contentAfter) {
      identicalCount++;
    }
  }

  assert(
    identicalCount === files.length,
    `Deterministic generator verified: ${identicalCount}/${files.length} files produce byte-for-byte identical output on re-generation`
  );
}

// 8. Semantic <noscript> Integration in index.html
console.log("\n8. Semantic <noscript> Integration in index.html");
{
  assert(fs.existsSync(INDEX_HTML_PATH), "index.html exists at project root");
  const indexHtml = fs.readFileSync(INDEX_HTML_PATH, "utf-8");

  assert(indexHtml.includes("<noscript>"), "index.html contains <noscript> block");
  assert(indexHtml.includes("</noscript>"), "index.html contains closing </noscript> tag");
  assert(
    indexHtml.includes('href="./fallback/index.html"'),
    "index.html <noscript> provides relative link to ./fallback/index.html (base-path safe)"
  );
  assert(
    indexHtml.includes('href="./fallback/engineering-laboratory.html"'),
    "index.html <noscript> provides direct link to Engineering Lab"
  );
  assert(
    indexHtml.includes('href="./fallback/document-vault.html"'),
    "index.html <noscript> provides direct link to Document Vault"
  );
  assert(
    indexHtml.includes('<div id="root"></div>'),
    "index.html preserves React root container (<div id=\"root\"></div>)"
  );
  assert(
    indexHtml.includes('<script type="module" src="/src/main.tsx"></script>'),
    "index.html preserves Vite SPA module entry point"
  );
}

console.log("\n========================================================");
console.log(`Phase 6.2 Test Suite Results: ${passed} passed, ${failed} failed.`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
