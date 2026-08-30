import type { Room } from "../experience-engine/ExperienceEngineContext";
import type { IntentType } from "./types";

export interface IntentRouteResult {
  intent: IntentType;
  matchedRoom?: Room;
  rawQuery: string;
}

export function routeIntent(rawQuery: string): IntentRouteResult {
  const query = rawQuery.trim().toLowerCase();

  // 1. Direct Greetings
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "greetings" ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query === "start"
  ) {
    return { intent: "greeting", rawQuery };
  }

  // 2. Specific Room Navigation Requests
  if (query.includes("lobby") || query.includes("home") || query.includes("overview")) {
    return { intent: "room_navigation", matchedRoom: "Lobby", rawQuery };
  }
  if (
    query.includes("engineering lab") ||
    query.includes("engineering laboratory") ||
    query.includes("lab") ||
    query.includes("codebase")
  ) {
    return { intent: "room_navigation", matchedRoom: "EngineeringLaboratory", rawQuery };
  }
  if (
    query.includes("memory archive") ||
    query.includes("archive") ||
    query.includes("career history")
  ) {
    return { intent: "room_navigation", matchedRoom: "MemoryArchive", rawQuery };
  }
  if (
    query.includes("achievement hall") ||
    query.includes("hall of fame") ||
    query.includes("awards hall")
  ) {
    return { intent: "room_navigation", matchedRoom: "AchievementHall", rawQuery };
  }
  if (
    query.includes("document vault") ||
    query.includes("vault") ||
    query.includes("download resume")
  ) {
    return { intent: "room_navigation", matchedRoom: "DocumentVault", rawQuery };
  }
  if (
    query.includes("communication center") ||
    query.includes("comm center") ||
    query.includes("outlets")
  ) {
    return { intent: "room_navigation", matchedRoom: "CommunicationCenter", rawQuery };
  }
  if (
    query.includes("skill processor") ||
    query.includes("processor") ||
    query.includes("capability matrix")
  ) {
    return { intent: "room_navigation", matchedRoom: "SkillProcessor", rawQuery };
  }
  if (
    query.includes("mission control") ||
    query.includes("command center") ||
    query.includes("operations")
  ) {
    return { intent: "room_navigation", matchedRoom: "MissionControl", rawQuery };
  }

  // 3. Projects Intent
  if (
    query.includes("project") ||
    query.includes("projects") ||
    query.includes("built") ||
    query.includes("portfolio") ||
    query.includes("applications") ||
    query.includes("apps") ||
    query.includes("software") ||
    query.includes("github") ||
    query.includes("code") ||
    query.includes("work sample")
  ) {
    return { intent: "projects", matchedRoom: "EngineeringLaboratory", rawQuery };
  }

  // 4. Skills Intent
  if (
    query.includes("skill") ||
    query.includes("skills") ||
    query.includes("tech stack") ||
    query.includes("stack") ||
    query.includes("technolog") ||
    query.includes("language") ||
    query.includes("framework") ||
    query.includes("proficienc") ||
    query.includes("competenc") ||
    query.includes("tools") ||
    query.includes("python") ||
    query.includes("react") ||
    query.includes("typescript")
  ) {
    return { intent: "skills", matchedRoom: "SkillProcessor", rawQuery };
  }

  // 5. Timeline / Experience Intent
  if (
    query.includes("experience") ||
    query.includes("timeline") ||
    query.includes("education") ||
    query.includes("degree") ||
    query.includes("university") ||
    query.includes("college") ||
    query.includes("career") ||
    query.includes("history") ||
    query.includes("background") ||
    query.includes("work") ||
    query.includes("jobs") ||
    query.includes("milestone")
  ) {
    return { intent: "timeline", matchedRoom: "MemoryArchive", rawQuery };
  }

  // 6. Achievements / Certifications Intent
  if (
    query.includes("achievement") ||
    query.includes("achievements") ||
    query.includes("certif") ||
    query.includes("award") ||
    query.includes("honor") ||
    query.includes("credential") ||
    query.includes("license") ||
    query.includes("recognition")
  ) {
    return { intent: "achievements", matchedRoom: "AchievementHall", rawQuery };
  }

  // 7. Resume / Documents Intent
  if (
    query.includes("resume") ||
    query.includes("cv") ||
    query.includes("curriculum vitae") ||
    query.includes("document") ||
    query.includes("documents") ||
    query.includes("pdf") ||
    query.includes("download")
  ) {
    return { intent: "resumes", matchedRoom: "DocumentVault", rawQuery };
  }

  // 8. Contact / Communication Intent
  if (
    query.includes("contact") ||
    query.includes("email") ||
    query.includes("reach") ||
    query.includes("hire") ||
    query.includes("message") ||
    query.includes("connect") ||
    query.includes("linkedin") ||
    query.includes("social") ||
    query.includes("call") ||
    query.includes("touch")
  ) {
    return { intent: "contact", matchedRoom: "CommunicationCenter", rawQuery };
  }

  // 9. Help / Capabilities Intent
  if (
    query.includes("help") ||
    query.includes("who are you") ||
    query.includes("what can you do") ||
    query.includes("options") ||
    query.includes("guide") ||
    query.includes("command") ||
    query.includes("commands") ||
    query.includes("features")
  ) {
    return { intent: "help", rawQuery };
  }

  // 10. Fallback Unknown
  return { intent: "unknown", rawQuery };
}
