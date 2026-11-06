import type { Room } from "./ExperienceEngineContext";
import { parsePath, buildPath, type ParsedRoute } from "./routeHelper";

export type ParsedHash = ParsedRoute;

/**
 * Backward-compatible shim for parseHash - delegates to clean path routing.
 */
export function parseHash(hash?: string): ParsedRoute {
  if (typeof window !== "undefined") {
    // If a hash exists with a path (e.g. legacy bookmark #/engineering-laboratory)
    if (hash && hash.startsWith("#/")) {
      const legacyPath = hash.replace(/^#/, "");
      return parsePath(legacyPath);
    }
    return parsePath(window.location.pathname, window.location.search);
  }
  return parsePath(hash || "/");
}

/**
 * Backward-compatible shim for buildHash - delegates to clean buildPath.
 */
export function buildHash(room: Room, params?: Record<string, string | undefined | null>): string {
  return buildPath(room, params);
}
