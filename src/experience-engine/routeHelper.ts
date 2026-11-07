import type { RoomId, SearchResult } from "../knowledge-engine/types";
import type { Room } from "./ExperienceEngineContext";

/**
 * Canonical Room to URL slug mapping for clean path routing.
 * Lobby maps to "" because it is the base root ("/" or "/Portfolio-KAI-HQ/").
 */
export const ROOM_SLUG_MAP: Record<Room, string> = {
  Lobby: "",
  EngineeringLaboratory: "engineering-laboratory",
  MemoryArchive: "memory-archive",
  AchievementHall: "achievement-hall",
  DocumentVault: "document-vault",
  CommunicationCenter: "communication-center",
  SkillProcessor: "skill-processor",
  MissionControl: "mission-control",
};

export interface ParsedRoute {
  room: Room;
  entityType?: "project" | "skill" | "resume" | "achievement" | "timeline";
  entityId?: string;
  params: Record<string, string>;
}

/**
 * Returns the active application base path without trailing slash.
 * In production GitHub Pages, this is "/Portfolio-KAI-HQ".
 * In development / preview at root, this is "".
 */
export function getAppBasePath(): string {
  // Check CI / Node environment (e.g. tests or build)
  const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  if (envObj?.GITHUB_ACTIONS) {
    return "/Portfolio-KAI-HQ";
  }

  const viteBase =
    typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
      ? import.meta.env.BASE_URL
      : "/";

  if (viteBase && viteBase !== "/") {
    return viteBase.replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/Portfolio-KAI-HQ")
  ) {
    return "/Portfolio-KAI-HQ";
  }

  return "";
}

/**
 * Builds a clean, path-based URL for a given room and optional entity parameters.
 * Examples:
 * buildPath("Lobby") => "/Portfolio-KAI-HQ/"
 * buildPath("EngineeringLaboratory") => "/Portfolio-KAI-HQ/engineering-laboratory"
 * buildPath("EngineeringLaboratory", { project: "lifi-security-protocols" })
 *   => "/Portfolio-KAI-HQ/engineering-laboratory/project/lifi-security-protocols"
 * buildPath("SkillProcessor", { skill: "typescript" })
 *   => "/Portfolio-KAI-HQ/skill-processor/skill/typescript"
 * buildPath("DocumentVault", { resume: "resume-fullstack" })
 *   => "/Portfolio-KAI-HQ/document-vault/resume/resume-fullstack"
 * buildPath("AchievementHall", { achievement: "ach-lifi-cybercrime-demo" })
 *   => "/Portfolio-KAI-HQ/achievement-hall/achievement/ach-lifi-cybercrime-demo"
 * buildPath("MemoryArchive", { timeline: "timeline-cse-undergrad" })
 *   => "/Portfolio-KAI-HQ/memory-archive/timeline/timeline-cse-undergrad"
 */
export function buildPath(
  room: Room,
  params?: Record<string, string | undefined | null>
): string {
  const base = getAppBasePath();
  const slug = ROOM_SLUG_MAP[room] ?? "";

  // Lobby is always the root of the base
  if (!slug) {
    return base ? `${base}/` : "/";
  }

  let entitySubpath = "";
  const extraParams: Record<string, string> = {};

  if (params) {
    if (room === "EngineeringLaboratory" && params.project) {
      entitySubpath = `/project/${encodeURIComponent(params.project)}`;
    } else if (room === "SkillProcessor" && params.skill) {
      entitySubpath = `/skill/${encodeURIComponent(params.skill)}`;
    } else if (room === "DocumentVault" && params.resume) {
      entitySubpath = `/resume/${encodeURIComponent(params.resume)}`;
    } else if (room === "AchievementHall" && params.achievement) {
      entitySubpath = `/achievement/${encodeURIComponent(params.achievement)}`;
    } else if (room === "MemoryArchive" && params.timeline) {
      entitySubpath = `/timeline/${encodeURIComponent(params.timeline)}`;
    }

    // Preserve any auxiliary parameters
    for (const [key, val] of Object.entries(params)) {
      if (!val) continue;
      const isHandledEntity =
        (room === "EngineeringLaboratory" && key === "project") ||
        (room === "SkillProcessor" && key === "skill") ||
        (room === "DocumentVault" && key === "resume") ||
        (room === "AchievementHall" && key === "achievement") ||
        (room === "MemoryArchive" && key === "timeline");

      if (!isHandledEntity) {
        extraParams[key] = val;
      }
    }
  }

  const cleanBase = base ? base.replace(/\/+$/, "") : "";
  const fullPath = `${cleanBase}/${slug}${entitySubpath}`.replace(/\/+/g, "/");

  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(extraParams)) {
    searchParams.set(k, v);
  }
  const queryString = searchParams.toString();

  return queryString ? `${fullPath}?${queryString}` : fullPath;
}

/**
 * Parses the current pathname and query search into its target Room and parameters.
 * Supports:
 * - Direct room paths (/engineering-laboratory)
 * - Clean entity paths (/engineering-laboratory/project/lifi-security-protocols)
 * - Base-path prefixed URLs (/Portfolio-KAI-HQ/engineering-laboratory/...)
 * - Fallback to Lobby for invalid or unrecognized routes
 */
export function parsePath(
  pathname?: string,
  search?: string
): ParsedRoute {
  const currentPath =
    pathname !== undefined
      ? pathname
      : typeof window !== "undefined"
      ? window.location.pathname
      : "/";

  const currentSearch =
    search !== undefined
      ? search
      : typeof window !== "undefined"
      ? window.location.search
      : "";

  let stripped = currentPath;
  const repoPrefix = "/Portfolio-KAI-HQ";
  const base = getAppBasePath();

  if (stripped.startsWith(repoPrefix)) {
    stripped = stripped.slice(repoPrefix.length);
  } else if (base && stripped.startsWith(base)) {
    stripped = stripped.slice(base.length);
  }

  // Remove leading/trailing slashes and split segments
  const clean = stripped.replace(/^\/+|\/+$/g, "");
  const segments = clean ? clean.split("/").map((s) => decodeURIComponent(s)) : [];

  let matchedRoom: Room = "Lobby";
  let entityType: ParsedRoute["entityType"];
  let entityId: string | undefined;
  const params: Record<string, string> = {};

  // Parse query parameters
  if (currentSearch) {
    const rawSearch = currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch;
    const urlParams = new URLSearchParams(rawSearch);
    urlParams.forEach((val, key) => {
      if (val) params[key] = val;
    });
  }

  if (segments.length === 0) {
    matchedRoom = "Lobby";
  } else {
    const firstSegment = segments[0].toLowerCase();

    // Map room
    for (const [room, slug] of Object.entries(ROOM_SLUG_MAP)) {
      if (
        slug === firstSegment ||
        (slug === "" && (firstSegment === "lobby" || firstSegment === ""))
      ) {
        matchedRoom = room as Room;
        break;
      }
    }

    // Map clean entity subpaths: /{room}/{entity-type}/{entity-id}
    if (segments.length >= 3) {
      const typeSegment = segments[1].toLowerCase();
      const idSegment = segments[2];

      if (typeSegment === "project" && matchedRoom === "EngineeringLaboratory") {
        entityType = "project";
        entityId = idSegment;
        params.project = idSegment;
      } else if (typeSegment === "skill" && matchedRoom === "SkillProcessor") {
        entityType = "skill";
        entityId = idSegment;
        params.skill = idSegment;
      } else if (typeSegment === "resume" && matchedRoom === "DocumentVault") {
        entityType = "resume";
        entityId = idSegment;
        params.resume = idSegment;
      } else if (typeSegment === "achievement" && matchedRoom === "AchievementHall") {
        entityType = "achievement";
        entityId = idSegment;
        params.achievement = idSegment;
      } else if (typeSegment === "timeline" && matchedRoom === "MemoryArchive") {
        entityType = "timeline";
        entityId = idSegment;
        params.timeline = idSegment;
      }
    }
  }

  // Query parameter fallback for entity IDs (?project=...)
  if (!entityId) {
    if (matchedRoom === "EngineeringLaboratory" && params.project) {
      entityType = "project";
      entityId = params.project;
    } else if (matchedRoom === "SkillProcessor" && params.skill) {
      entityType = "skill";
      entityId = params.skill;
    } else if (matchedRoom === "DocumentVault" && params.resume) {
      entityType = "resume";
      entityId = params.resume;
    } else if (matchedRoom === "AchievementHall" && params.achievement) {
      entityType = "achievement";
      entityId = params.achievement;
    } else if (matchedRoom === "MemoryArchive" && params.timeline) {
      entityType = "timeline";
      entityId = params.timeline;
    }
  }

  return { room: matchedRoom, entityType, entityId, params };
}

/**
 * Maps a Knowledge Engine SearchResult entity directly to its target Room
 * and corresponding deep-link parameter key-value pair.
 */
export function getSearchResultParams(result: SearchResult): {
  targetRoom: Room;
  params?: Record<string, string>;
} {
  switch (result.type) {
    case "project":
      return {
        targetRoom: "EngineeringLaboratory",
        params: { project: result.id },
      };
    case "skill":
      return {
        targetRoom: "SkillProcessor",
        params: { skill: result.id },
      };
    case "resume":
      return {
        targetRoom: "DocumentVault",
        params: { resume: result.id },
      };
    case "achievement":
      return {
        targetRoom: "AchievementHall",
        params: { achievement: result.id },
      };
    case "timeline":
      return {
        targetRoom: "MemoryArchive",
        params: { timeline: result.id },
      };
    case "room":
    default:
      return {
        targetRoom: (result.targetRoom as RoomId) || "Lobby",
        params: undefined,
      };
  }
}

/**
 * Resolves a public static asset path against the active base path.
 * Examples:
 * resolveAssetUrl("/documents/resume-fullstack.pdf")
 *   => "/Portfolio-KAI-HQ/documents/resume-fullstack.pdf" (in production)
 *   => "/documents/resume-fullstack.pdf" (in local dev / preview)
 */
export function resolveAssetUrl(assetPath: string): string {
  if (!assetPath) return "";
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }
  const cleanAsset = assetPath.replace(/^#+/, "");
  const base = getAppBasePath();
  const normalizedPath = cleanAsset.startsWith("/") ? cleanAsset : `/${cleanAsset}`;
  return base ? `${base.replace(/\/+$/, "")}${normalizedPath}` : normalizedPath;
}

