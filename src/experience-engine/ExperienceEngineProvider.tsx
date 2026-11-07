import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  ExperienceEngineContext,
  type Room,
  type VisitorMode,
  type KAIStatus,
  type AssistantFocusPayload,
} from "./ExperienceEngineContext";
import { parsePath, buildPath } from "./routeHelper";

export function ExperienceEngineProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Initialize room and route params from window path
  const [currentRoom, setCurrentRoom] = useState<Room>(() => {
    if (typeof window !== "undefined") {
      // Legacy hash migration check (e.g., #/engineering-laboratory)
      if (window.location.hash && window.location.hash.startsWith("#/")) {
        const legacySlug = window.location.hash.replace(/^#\/?/, "");
        const parsed = parsePath(legacySlug);
        return parsed.room;
      }
      return parsePath(window.location.pathname, window.location.search).room;
    }
    return "Lobby";
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash && window.location.hash.startsWith("#/")) {
        const legacySlug = window.location.hash.replace(/^#\/?/, "");
        return parsePath(legacySlug).params;
      }
      return parsePath(window.location.pathname, window.location.search).params;
    }
    return {};
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname + window.location.search;
    }
    return "/";
  });

  // Visitor Mode state
  const [mode, setMode] = useState<VisitorMode>("neutral");

  // KAI Assistant state
  const [isKAIOpen, setIsKAIOpen] = useState<boolean>(false);
  const [assistantFocus, setAssistantFocus] =
    useState<AssistantFocusPayload | null>(null);

  // Accessibility state
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);

  // Sync dynamically with OS prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handler);
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  // Change room and push clean path state to browser History API
  const changeRoom = useCallback((room: Room, params?: Record<string, string>) => {
    const targetPath = buildPath(room, params);
    if (typeof window !== "undefined") {
      const currentFull = window.location.pathname + window.location.search;
      if (currentFull !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
    setCurrentRoom(room);
    setRouteParams(params || {});
    setCurrentPath(targetPath);
  }, []);

  // Listen for browser Back/Forward (popstate) and handle initial legacy hash clean-up
  useEffect(() => {
    function handlePopState() {
      const { room, params } = parsePath(
        window.location.pathname,
        window.location.search
      );
      setCurrentRoom(room);
      setRouteParams(params);
      setCurrentPath(window.location.pathname + window.location.search);
    }

    // Clean up any residual legacy hash on first load by replacing URL with clean path
    if (typeof window !== "undefined" && window.location.hash && window.location.hash.startsWith("#/")) {
      const legacyRoute = window.location.hash.replace(/^#\/?/, "");
      const { room, params } = parsePath(legacyRoute);
      const cleanPath = buildPath(room, params);
      window.history.replaceState(null, "", cleanPath);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // KAI helper actions
  const openKAI = useCallback(() => setIsKAIOpen(true), []);
  const closeKAI = useCallback(() => setIsKAIOpen(false), []);
  const toggleKAI = useCallback(() => setIsKAIOpen((prev) => !prev), []);

  const kaiStatus: KAIStatus = isKAIOpen ? "open" : "closed";

  return (
    <ExperienceEngineContext.Provider
      value={{
        currentRoom,
        currentPath,
        routeParams,
        changeRoom,
        mode,
        setMode,
        isKAIOpen,
        kaiStatus,
        openKAI,
        closeKAI,
        toggleKAI,
        assistantFocus,
        setAssistantFocus,
        reducedMotion,
        setReducedMotion,
        voiceEnabled,
        setVoiceEnabled,
      }}
    >
      {children}
    </ExperienceEngineContext.Provider>
  );
}
