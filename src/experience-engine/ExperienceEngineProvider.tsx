import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  ExperienceEngineContext,
  type Room,
  type VisitorMode,
  type KAIStatus,
  type AssistantFocusPayload,
} from "./ExperienceEngineContext";
import { parseHash, buildHash } from "./urlHelper";

export function ExperienceEngineProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Initialize room from window hash if present, or default to "Lobby"
  const [currentRoom, setCurrentRoom] = useState<Room>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      return parseHash(window.location.hash).room;
    }
    return "Lobby";
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

  // Change room and synchronize with URL hash
  const changeRoom = useCallback((room: Room, params?: Record<string, string>) => {
    setCurrentRoom(room);
    if (typeof window !== "undefined") {
      const targetHash = buildHash(room, params);
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }, []);

  // Listen for browser back/forward and hash changes
  useEffect(() => {
    function handleHashChange() {
      const { room } = parseHash(window.location.hash);
      setCurrentRoom(room);
    }

    // Set initial hash if not set
    if (!window.location.hash) {
      window.location.hash = buildHash(currentRoom);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [currentRoom]);

  // KAI helper actions
  const openKAI = useCallback(() => setIsKAIOpen(true), []);
  const closeKAI = useCallback(() => setIsKAIOpen(false), []);
  const toggleKAI = useCallback(() => setIsKAIOpen((prev) => !prev), []);

  const kaiStatus: KAIStatus = isKAIOpen ? "open" : "closed";

  return (
    <ExperienceEngineContext.Provider
      value={{
        currentRoom,
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
