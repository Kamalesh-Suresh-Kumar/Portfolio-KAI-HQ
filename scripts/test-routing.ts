import { parsePath, buildPath, getSearchResultParams, ROOM_SLUG_MAP } from "../src/experience-engine/routeHelper";
import { knowledgeEngine } from "../src/knowledge-engine";
import type { Room } from "../src/experience-engine/ExperienceEngineContext";

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

console.log("=== KAI HQ Phase B: Comprehensive Route Verification ===\n");

// --- 1. Test All Eight Room Routes (Dev Mode: Base '') ---
console.log("1. Testing All 8 Room Routes (Dev Mode: Base '')");
const rooms: Room[] = [
  "Lobby",
  "EngineeringLaboratory",
  "MemoryArchive",
  "AchievementHall",
  "DocumentVault",
  "CommunicationCenter",
  "SkillProcessor",
  "MissionControl",
];

for (const room of rooms) {
  const path = buildPath(room);
  const parsed = parsePath(path);
  assert(parsed.room === room, `buildPath('${room}') -> '${path}' -> parses back to room '${room}'`);
}

// --- 2. Test All Eight Room Routes (Prod Mode: Base '/Portfolio-KAI-HQ') ---
console.log("\n2. Testing All 8 Room Routes (Production Mode with /Portfolio-KAI-HQ prefix)");
for (const room of rooms) {
  const slug = ROOM_SLUG_MAP[room];
  const prodPath = slug ? `/Portfolio-KAI-HQ/${slug}` : `/Portfolio-KAI-HQ/`;
  const parsed = parsePath(prodPath);
  assert(parsed.room === room, `Path '${prodPath}' -> parses correctly to '${room}'`);
}

// --- 3. Test Entity Detail Routes ---
console.log("\n3. Testing Entity Detail Routes");

// Project
const projectPath = buildPath("EngineeringLaboratory", { project: "lifi-security-protocols" });
const parsedProject = parsePath(projectPath);
assert(
  parsedProject.room === "EngineeringLaboratory" &&
  parsedProject.entityType === "project" &&
  parsedProject.entityId === "lifi-security-protocols" &&
  parsedProject.params.project === "lifi-security-protocols",
  `Project route: ${projectPath} -> room=EngineeringLaboratory, entity=lifi-security-protocols`
);
const foundProject = knowledgeEngine.getProjectById(parsedProject.params.project);
assert(foundProject?.id === "lifi-security-protocols", `Project entity exists in KnowledgeEngine: ${foundProject?.title}`);

// Skill
const skillPath = buildPath("SkillProcessor", { skill: "typescript" });
const parsedSkill = parsePath(skillPath);
assert(
  parsedSkill.room === "SkillProcessor" &&
  parsedSkill.entityType === "skill" &&
  parsedSkill.entityId === "typescript" &&
  parsedSkill.params.skill === "typescript",
  `Skill route: ${skillPath} -> room=SkillProcessor, entity=typescript`
);
const foundSkill = knowledgeEngine.getSkillById(parsedSkill.params.skill);
assert(foundSkill?.id === "typescript", `Skill entity exists in KnowledgeEngine: ${foundSkill?.name}`);

// Resume
const resumePath = buildPath("DocumentVault", { resume: "resume-fullstack" });
const parsedResume = parsePath(resumePath);
assert(
  parsedResume.room === "DocumentVault" &&
  parsedResume.entityType === "resume" &&
  parsedResume.entityId === "resume-fullstack" &&
  parsedResume.params.resume === "resume-fullstack",
  `Resume route: ${resumePath} -> room=DocumentVault, entity=resume-fullstack`
);
const foundResume = knowledgeEngine.getResumeVariantById(parsedResume.params.resume);
assert(foundResume?.id === "resume-fullstack", `Resume variant exists in KnowledgeEngine: ${foundResume?.label}`);

// Achievement
const achPath = buildPath("AchievementHall", { achievement: "ach-lifi-cybercrime-demo" });
const parsedAch = parsePath(achPath);
assert(
  parsedAch.room === "AchievementHall" &&
  parsedAch.entityType === "achievement" &&
  parsedAch.entityId === "ach-lifi-cybercrime-demo" &&
  parsedAch.params.achievement === "ach-lifi-cybercrime-demo",
  `Achievement route: ${achPath} -> room=AchievementHall, entity=ach-lifi-cybercrime-demo`
);
const foundAch = knowledgeEngine.getAchievementById(parsedAch.params.achievement);
assert(foundAch?.id === "ach-lifi-cybercrime-demo", `Achievement exists in KnowledgeEngine: ${foundAch?.title}`);

// Timeline
const timelinePath = buildPath("MemoryArchive", { timeline: "timeline-cse-undergrad" });
const parsedTimeline = parsePath(timelinePath);
assert(
  parsedTimeline.room === "MemoryArchive" &&
  parsedTimeline.entityType === "timeline" &&
  parsedTimeline.entityId === "timeline-cse-undergrad" &&
  parsedTimeline.params.timeline === "timeline-cse-undergrad",
  `Timeline route: ${timelinePath} -> room=MemoryArchive, entity=timeline-cse-undergrad`
);
const foundTimeline = knowledgeEngine.getTimelineById(parsedTimeline.params.timeline);
assert(foundTimeline?.id === "timeline-cse-undergrad", `Timeline milestone exists in KnowledgeEngine: ${foundTimeline?.title}`);

// --- 4. Test Fallbacks ---
console.log("\n4. Testing Fallbacks & Invalid Inputs");
const invalidRoomRoute = parsePath("/Portfolio-KAI-HQ/nonexistent-room");
assert(invalidRoomRoute.room === "Lobby", "Invalid room path '/Portfolio-KAI-HQ/nonexistent-room' safely falls back to Lobby");

const unknownProjectRoute = parsePath("/Portfolio-KAI-HQ/engineering-laboratory/project/nonexistent-id");
assert(unknownProjectRoute.room === "EngineeringLaboratory", "Unknown project route stays in EngineeringLaboratory");
const foundUnknownProject = knowledgeEngine.getProjectById(unknownProjectRoute.params.project);
assert(foundUnknownProject === undefined, "KnowledgeEngine returns undefined for unknown project ID without crash");

// --- 5. Test SearchResult Parameter Generation ---
console.log("\n5. Testing SearchResult Entity Mapping");
const searchResults = knowledgeEngine.search("penetration testing");
assert(searchResults.length > 0, `Search for 'penetration testing' returned ${searchResults.length} results`);
for (const res of searchResults.slice(0, 4)) {
  const { targetRoom, params } = getSearchResultParams(res);
  const targetPath = buildPath(targetRoom, params);
  const reParsed = parsePath(targetPath);
  assert(
    reParsed.room === targetRoom,
    `SearchResult '${res.title}' (${res.type}) -> targetRoom='${targetRoom}', path='${targetPath}'`
  );
}

// Summary
console.log(`\n==============================================`);
console.log(`Route Test Results: ${passed} passed, ${failed} failed`);
console.log(`==============================================\n`);

if (failed > 0) {
  process.exit(1);
}
