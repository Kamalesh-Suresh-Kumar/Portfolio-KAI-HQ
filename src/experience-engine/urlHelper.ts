import type { RoomId, SearchResult } from "../knowledge-engine/types";
import type { Room } from "./ExperienceEngineContext";
import { ROOM_HASH_MAP } from "./ExperienceEngineContext";

export interface ParsedHash {
  room: Room;
  params: Record<string, string>;
}

/**
 * Parses a raw URL hash (e.g. "#/engineering-laboratory?project=lifi-security-protocols")
 * into its target Room and query parameters map.
 */
export function parseHash(hash: string): ParsedHash {
  if (!hash) {
    return { room: "Lobby", params: {} };
  }

  // Strip leading # or #/
  const raw = hash.replace(/^#\/?/, "").trim();
  const [pathPart, queryPart] = raw.split("?");

  const cleanPath = (pathPart || "").trim().toLowerCase();
  let matchedRoom: Room = "Lobby";

  for (const [room, slug] of Object.entries(ROOM_HASH_MAP)) {
    if (slug === cleanPath || room.toLowerCase() === cleanPath.replace(/-/g, "")) {
      matchedRoom = room as Room;
      break;
    }
  }

  const params: Record<string, string> = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((val, key) => {
      if (val) {
        params[key] = val;
      }
    });
  }

  return { room: matchedRoom, params };
}

/**
 * Builds a valid, sanitized URL hash string.
 * Example: buildHash("EngineeringLaboratory", { project: "lifi-security-protocols" })
 * => "#/engineering-laboratory?project=lifi-security-protocols"
 */
export function buildHash(room: Room, params?: Record<string, string | undefined | null>): string {
  const slug = ROOM_HASH_MAP[room] || "lobby";
  if (!params) {
    return `#/${slug}`;
  }

  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val && typeof val === "string" && val.trim()) {
      searchParams.set(key, val.trim());
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `#/${slug}?${queryString}` : `#/${slug}`;
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
