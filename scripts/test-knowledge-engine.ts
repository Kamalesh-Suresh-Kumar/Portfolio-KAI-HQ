import fs from "fs";
import path from "path";
import { knowledgeEngine } from "../src/knowledge-engine";
import { projectsData } from "../src/knowledge-engine/data/projects";
import { skillsData } from "../src/knowledge-engine/data/skills";
import { timelineData } from "../src/knowledge-engine/data/timeline";
import { achievementsData } from "../src/knowledge-engine/data/achievements";
import { resumeVariantsData } from "../src/knowledge-engine/data/resumes";
import { roomsMetadata } from "../src/knowledge-engine/data/rooms";

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

console.log("=== KAI HQ Phase C1 & C2: Knowledge Engine & Data Integrity Audit ===\n");

// 1. Entity ID Uniqueness
console.log("1. Entity Identifier Uniqueness Checks");

function checkUniqueness(items: { id: string }[], typeName: string) {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.push(item.id);
    }
    seen.add(item.id);
  }
  assert(duplicates.length === 0, `All ${typeName} IDs are unique (Total: ${items.length}, Duplicates: ${duplicates.length})`);
}

checkUniqueness(projectsData, "Projects");
checkUniqueness(skillsData, "Skills");
checkUniqueness(timelineData, "Timeline");
checkUniqueness(achievementsData, "Achievements");
checkUniqueness(resumeVariantsData, "Resume Variants");
checkUniqueness(roomsMetadata, "Rooms");

// 2. Cross-Reference Integrity
console.log("\n2. Cross-Reference & Linkage Integrity Checks");

// Project -> Skill references
let brokenProjectSkills = 0;
for (const project of projectsData) {
  for (const skillId of project.relatedSkillIds) {
    const skill = knowledgeEngine.getSkillById(skillId);
    if (!skill) {
      console.error(`    Project '${project.id}' references non-existent skill '${skillId}'`);
      brokenProjectSkills++;
    }
  }
}
assert(brokenProjectSkills === 0, `All project -> skill cross-references resolve (Broken: ${brokenProjectSkills})`);

// Skill -> Project references
let brokenSkillProjects = 0;
for (const skill of skillsData) {
  for (const projectId of skill.linkedProjectIds) {
    const project = knowledgeEngine.getProjectById(projectId);
    if (!project) {
      console.error(`    Skill '${skill.id}' references non-existent project '${projectId}'`);
      brokenSkillProjects++;
    }
  }
}
assert(brokenSkillProjects === 0, `All skill -> project cross-references resolve (Broken: ${brokenSkillProjects})`);

// Achievement -> Project references
let brokenAchievementProjects = 0;
for (const ach of achievementsData) {
  for (const projectId of ach.relatedProjectIds || []) {
    const project = knowledgeEngine.getProjectById(projectId);
    if (!project) {
      console.error(`    Achievement '${ach.id}' references non-existent project '${projectId}'`);
      brokenAchievementProjects++;
    }
  }
}
assert(brokenAchievementProjects === 0, `All achievement -> project cross-references resolve (Broken: ${brokenAchievementProjects})`);

// 3. Query Function Safety & Error Handling
console.log("\n3. Query Function Safety & Unknown Identifier Handling");

assert(knowledgeEngine.getProjectById("non-existent-id") === undefined, "getProjectById('non-existent-id') safely returns undefined");
assert(knowledgeEngine.getSkillById("non-existent-id") === undefined, "getSkillById('non-existent-id') safely returns undefined");
assert(knowledgeEngine.getTimelineById("non-existent-id") === undefined, "getTimelineById('non-existent-id') safely returns undefined");
assert(knowledgeEngine.getAchievementById("non-existent-id") === undefined, "getAchievementById('non-existent-id') safely returns undefined");
assert(knowledgeEngine.getResumeVariantById("non-existent-id") === undefined, "getResumeVariantById('non-existent-id') safely returns undefined");
assert(knowledgeEngine.getRoomMetadata("Lobby") !== undefined, "getRoomMetadata('Lobby') returns valid RoomMetadata");

// Filtering
const fullstackProjects = knowledgeEngine.getProjects({ domain: "fullstack" });
assert(fullstackProjects.length > 0 && fullstackProjects.every(p => p.domain === "fullstack"), `getProjects({ domain: 'fullstack' }) returns ${fullstackProjects.length} filtered items`);

const expertSkills = knowledgeEngine.getSkills().filter(s => s.proficiencyLevel === "expert");
assert(expertSkills.length > 0, `getSkills() returns ${expertSkills.length} expert level skills`);

// 4. Search Tokenization & Scoring
console.log("\n4. Search Tokenization, Scoring & Ranking Checks");

assert(knowledgeEngine.search("").length === 0, "search('') returns empty array without error");
assert(knowledgeEngine.search("   ").length === 0, "search('   ') with whitespace returns empty array");

const searchResults = knowledgeEngine.search("Li-Fi Penetration");
assert(searchResults.length > 0, `search('Li-Fi Penetration') returned ${searchResults.length} results`);
assert(searchResults[0].id === "lifi-security-protocols", `search('Li-Fi Penetration') ranked 'lifi-security-protocols' highest (score: ${searchResults[0].score})`);

// C3: Mode-Weighted Search Ranking
const recruiterSearch = knowledgeEngine.search("engineer", { mode: "recruiter" });
const recruiterTopIsResume = recruiterSearch.length > 0 && recruiterSearch[0].type === "resume";
assert(recruiterTopIsResume, `search('engineer', { mode: 'recruiter' }) boosted resume variant to rank 1 (type: ${recruiterSearch[0]?.type})`);

const developerSearch = knowledgeEngine.search("systems", { mode: "developer" });
const developerTopIsProjectOrSkill = developerSearch.length > 0 && (developerSearch[0].type === "project" || developerSearch[0].type === "skill");
assert(developerTopIsProjectOrSkill, `search('systems', { mode: 'developer' }) prioritized project/skill (type: ${developerSearch[0]?.type})`);

// 5. Resume PDF Physical Artifacts (C2 Verification)
console.log("\n5. Document Vault PDF Artifacts on Disk");

const publicDocsDir = path.resolve(process.cwd(), "public/documents");
assert(fs.existsSync(publicDocsDir), `public/documents/ directory exists`);

const resumeFiles = [
  "resume-fullstack.pdf",
  "resume-backend.pdf",
  "resume-cybersecurity.pdf",
  "resume-ai-systems.pdf",
];

for (const filename of resumeFiles) {
  const fullPath = path.join(publicDocsDir, filename);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(exists && size > 1000, `Physical artifact '${filename}' exists on disk (Size: ${size} bytes)`);
}

// Summary
console.log(`\n======================================================`);
console.log(`Knowledge Engine Audit: ${passed} passed, ${failed} failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
