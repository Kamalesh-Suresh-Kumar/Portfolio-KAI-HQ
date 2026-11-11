import type { Room } from "../experience-engine/ExperienceEngineContext";
import type { IntentType } from "./types";

export interface IntentRouteResult {
  intent: IntentType;
  matchedRoom?: Room;
  rawQuery: string;
}

/**
 * Normalizes query string: strips extraneous punctuation, expands common contractions,
 * and fixes frequent phonetic spelling variations.
 */
function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();

  // Remove common punctuation marks
  q = q.replace(/[?!.,;:()[\]{}"'`~]/g, " ");

  // Expand common contractions
  q = q.replace(/\bwho's\b/g, "who is");
  q = q.replace(/\bwhat's\b/g, "what is");
  q = q.replace(/\bwhere's\b/g, "where is");
  q = q.replace(/\bhow's\b/g, "how is");
  q = q.replace(/\btell me\b/g, "tell");

  // Fix common spelling mistakes & typos
  q = q.replace(/\b(kamalsh|kamlesh|kamalash|kamles|kamelesh)\b/g, "kamalesh");
  q = q.replace(/\b(projets|projcts|prjcts|prjct|projct|projekts|porjects|projectz)\b/g, "projects");
  q = q.replace(/\b(skils|skilss|skll|skil|skl)\b/g, "skills");
  q = q.replace(/\b(experiance|experiense|timline|experence|experianse|exprnc|exprnce)\b/g, "experience");
  q = q.replace(/\b(achivement|acheivement|achivements|acheivements|achievment|achievments|certifcate|certifcates|certificat|certificats)\b/g, "achievements");
  q = q.replace(/\b(resum|resumee|resumees|curriculam|curriculum)\b/g, "resume");
  q = q.replace(/\b(contect|cantact|messege|messeges|mesage|mesages|reachout)\b/g, "contact");
  q = q.replace(/\b(navigashun|navgate|navigtion)\b/g, "navigation");
  q = q.replace(/\b(abot|abt)\b/g, "about");

  // Collapse multiple spaces
  return q.replace(/\s+/g, " ").trim();
}

export function routeIntent(rawQuery: string): IntentRouteResult {
  const normalized = normalizeQuery(rawQuery);

  // 1. Greetings
  if (
    normalized === "hi" ||
    normalized === "hello" ||
    normalized === "hey" ||
    normalized === "greetings" ||
    normalized === "start" ||
    normalized === "good morning" ||
    normalized === "good afternoon" ||
    normalized === "good evening" ||
    normalized.startsWith("hi ") ||
    normalized.startsWith("hello ") ||
    normalized.startsWith("hey ") ||
    normalized.startsWith("greetings ")
  ) {
    return { intent: "greeting", rawQuery };
  }

  // 2. Creator / Kamalesh Questions
  // e.g. "who is kamalesh", "tell me about kamalesh", "introduce kamalesh", "who created kai", "who made this portfolio", "tell me about your creator"
  if (
    normalized.includes("kamalesh") ||
    normalized.includes("creator") ||
    normalized.includes("who created") ||
    normalized.includes("who made") ||
    normalized.includes("who built") ||
    normalized.includes("who designed") ||
    normalized.includes("who programmed") ||
    normalized.includes("who owns") ||
    normalized.includes("who is behind") ||
    normalized.includes("the developer") ||
    normalized.includes("the engineer") ||
    normalized.includes("the person behind") ||
    normalized.includes("the author") ||
    normalized.includes("introduce yourself and your creator") ||
    normalized.includes("who are you built by")
  ) {
    return { intent: "creator", matchedRoom: "Lobby", rawQuery };
  }

  // 3. About KAI / KAI HQ System Questions
  // e.g. "who is kai", "what is kai", "what is kai hq", "tell me about kai", "what does kai stand for", "what is this place", "explain kai", "who are you"
  if (
    normalized === "who is kai" ||
    normalized === "what is kai" ||
    normalized === "what is kai hq" ||
    normalized === "tell about kai" ||
    normalized === "tell kai" ||
    normalized === "about kai" ||
    normalized === "who are you" ||
    normalized.startsWith("who are you") ||
    normalized.includes("introduce yourself") ||
    normalized.includes("what does kai do") ||
    normalized.includes("what is kai hq") ||
    normalized.includes("who is kai") ||
    normalized.includes("what is kai") ||
    normalized.includes("about kai") ||
    normalized.includes("kai stand for") ||
    normalized.includes("what is this place") ||
    normalized.includes("explain kai") ||
    normalized.includes("purpose of kai")
  ) {
    return { intent: "about_kai", matchedRoom: "Lobby", rawQuery };
  }

  // 4. Specific Room Navigation Requests
  if (
    normalized.includes("lobby") ||
    normalized.includes("home") ||
    normalized.includes("entrance")
  ) {
    return { intent: "room_navigation", matchedRoom: "Lobby", rawQuery };
  }
  if (
    normalized.includes("engineering lab") ||
    normalized.includes("engineering laboratory") ||
    normalized.includes("codebase") ||
    normalized.includes("project specimens")
  ) {
    return { intent: "room_navigation", matchedRoom: "EngineeringLaboratory", rawQuery };
  }
  if (
    normalized.includes("memory archive") ||
    normalized.includes("career history")
  ) {
    return { intent: "room_navigation", matchedRoom: "MemoryArchive", rawQuery };
  }
  if (
    normalized.includes("achievement hall") ||
    normalized.includes("hall of fame") ||
    normalized.includes("awards hall") ||
    normalized.includes("credentials room")
  ) {
    return { intent: "room_navigation", matchedRoom: "AchievementHall", rawQuery };
  }
  if (
    normalized.includes("document vault") ||
    normalized.includes("vault")
  ) {
    return { intent: "room_navigation", matchedRoom: "DocumentVault", rawQuery };
  }
  if (
    normalized.includes("communication center") ||
    normalized.includes("comm center")
  ) {
    return { intent: "room_navigation", matchedRoom: "CommunicationCenter", rawQuery };
  }
  if (
    normalized.includes("skill processor") ||
    normalized.includes("capability matrix")
  ) {
    return { intent: "room_navigation", matchedRoom: "SkillProcessor", rawQuery };
  }
  if (
    normalized.includes("mission control") ||
    normalized.includes("command center") ||
    normalized.includes("operations room")
  ) {
    return { intent: "room_navigation", matchedRoom: "MissionControl", rawQuery };
  }

  // 5. Projects Intent
  if (
    normalized.includes("project") ||
    normalized.includes("projects") ||
    normalized.includes("built") ||
    normalized.includes("portfolio") ||
    normalized.includes("applications") ||
    normalized.includes("apps") ||
    normalized.includes("software") ||
    normalized.includes("github") ||
    normalized.includes("code") ||
    normalized.includes("work sample") ||
    normalized.includes("specimen")
  ) {
    return { intent: "projects", matchedRoom: "EngineeringLaboratory", rawQuery };
  }

  // 6. Skills Intent
  if (
    normalized.includes("skill") ||
    normalized.includes("skills") ||
    normalized.includes("tech stack") ||
    normalized.includes("stack") ||
    normalized.includes("technology") ||
    normalized.includes("technologies") ||
    normalized.includes("language") ||
    normalized.includes("languages") ||
    normalized.includes("framework") ||
    normalized.includes("frameworks") ||
    normalized.includes("proficiency") ||
    normalized.includes("competency") ||
    normalized.includes("tools") ||
    normalized.includes("python") ||
    normalized.includes("react") ||
    normalized.includes("typescript") ||
    normalized.includes("node") ||
    normalized.includes("c++") ||
    normalized.includes("optical") ||
    normalized.includes("security")
  ) {
    return { intent: "skills", matchedRoom: "SkillProcessor", rawQuery };
  }

  // 7. Timeline / Experience Intent
  if (
    normalized.includes("experience") ||
    normalized.includes("timeline") ||
    normalized.includes("education") ||
    normalized.includes("degree") ||
    normalized.includes("university") ||
    normalized.includes("college") ||
    normalized.includes("career") ||
    normalized.includes("history") ||
    normalized.includes("background") ||
    normalized.includes("work") ||
    normalized.includes("job") ||
    normalized.includes("jobs") ||
    normalized.includes("milestone") ||
    normalized.includes("milestones") ||
    normalized.includes("study")
  ) {
    return { intent: "timeline", matchedRoom: "MemoryArchive", rawQuery };
  }

  // 8. Achievements / Certifications Intent
  if (
    normalized.includes("achievement") ||
    normalized.includes("achievements") ||
    normalized.includes("certif") ||
    normalized.includes("certificate") ||
    normalized.includes("certification") ||
    normalized.includes("certifications") ||
    normalized.includes("award") ||
    normalized.includes("awards") ||
    normalized.includes("honor") ||
    normalized.includes("honors") ||
    normalized.includes("credential") ||
    normalized.includes("credentials") ||
    normalized.includes("police") ||
    normalized.includes("briefing") ||
    normalized.includes("recognition")
  ) {
    return { intent: "achievements", matchedRoom: "AchievementHall", rawQuery };
  }

  // 9. Resumes / Documents Intent
  if (
    normalized.includes("resume") ||
    normalized.includes("cv") ||
    normalized.includes("curriculum vitae") ||
    normalized.includes("document") ||
    normalized.includes("documents") ||
    normalized.includes("pdf") ||
    normalized.includes("download") ||
    normalized.includes("curated variants")
  ) {
    return { intent: "resumes", matchedRoom: "DocumentVault", rawQuery };
  }

  // 10. Contact / Communication Intent
  if (
    normalized.includes("contact") ||
    normalized.includes("email") ||
    normalized.includes("reach") ||
    normalized.includes("hire") ||
    normalized.includes("message") ||
    normalized.includes("connect") ||
    normalized.includes("linkedin") ||
    normalized.includes("nexus") ||
    normalized.includes("phone") ||
    normalized.includes("whatsapp") ||
    normalized.includes("call") ||
    normalized.includes("touch")
  ) {
    return { intent: "contact", matchedRoom: "CommunicationCenter", rawQuery };
  }

  // 11. Help / Capabilities Intent
  if (
    normalized.includes("help") ||
    normalized.includes("who are you") ||
    normalized.includes("what can you do") ||
    normalized.includes("options") ||
    normalized.includes("guide") ||
    normalized.includes("command") ||
    normalized.includes("commands") ||
    normalized.includes("features") ||
    normalized.includes("how to use")
  ) {
    return { intent: "help", rawQuery };
  }

  // 12. Fallback Unknown
  return { intent: "unknown", rawQuery };
}
