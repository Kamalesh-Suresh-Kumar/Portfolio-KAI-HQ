import { createContext } from "react";
export type Room =
  | "Lobby"
  | "EngineeringLaboratory"
  | "MemoryArchive"
  | "AchievementHall"
  | "DocumentVault"
  | "CommunicationCenter"
  | "SkillProcessor"
  | "MissionControl";
export interface ExperienceEngineContextType {
  currentRoom: Room;
  changeRoom: (room: Room) => void;
}
export const ExperienceEngineContext =
  createContext<ExperienceEngineContextType | null>(null);