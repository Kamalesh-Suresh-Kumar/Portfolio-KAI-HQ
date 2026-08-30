import { createContext } from "react";
import type { RoomId } from "../knowledge-engine/types";

export type Room = RoomId;

export type VisitorMode = "neutral" | "recruiter" | "developer";

export type KAIStatus = "closed" | "open";

export interface AssistantFocusPayload {
  message?: string;
  contextPrompt?: string;
  suggestedActions?: { label: string; action: () => void }[];
}

export interface ExperienceEngineContextType {
  // Room Navigation
  currentRoom: Room;
  changeRoom: (room: Room, params?: Record<string, string>) => void;

  // Visitor Mode
  mode: VisitorMode;
  setMode: (mode: VisitorMode) => void;

  // KAI Assistant State
  isKAIOpen: boolean;
  kaiStatus: KAIStatus;
  openKAI: () => void;
  closeKAI: () => void;
  toggleKAI: () => void;
  assistantFocus: AssistantFocusPayload | null;
  setAssistantFocus: (focus: AssistantFocusPayload | null) => void;

  // Accessibility State
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (value: boolean) => void;
}

export const ROOM_HASH_MAP: Record<Room, string> = {
  Lobby: "lobby",
  EngineeringLaboratory: "engineering-laboratory",
  MemoryArchive: "memory-archive",
  AchievementHall: "achievement-hall",
  DocumentVault: "document-vault",
  CommunicationCenter: "communication-center",
  SkillProcessor: "skill-processor",
  MissionControl: "mission-control",
};

export function hashToRoom(hash: string): Room {
  const clean = hash.replace(/^#\/?/, "").trim().toLowerCase();
  for (const [room, slug] of Object.entries(ROOM_HASH_MAP)) {
    if (slug === clean || room.toLowerCase() === clean.replace(/-/g, "")) {
      return room as Room;
    }
  }
  return "Lobby";
}

export function roomToHash(room: Room): string {
  return `#/${ROOM_HASH_MAP[room] || "lobby"}`;
}

export const ExperienceEngineContext =
  createContext<ExperienceEngineContextType | null>(null);
