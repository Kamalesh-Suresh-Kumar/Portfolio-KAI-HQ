import type { Room } from "../experience-engine/ExperienceEngineContext";

export type IntentType =
  | "greeting"
  | "projects"
  | "skills"
  | "timeline"
  | "achievements"
  | "resumes"
  | "contact"
  | "room_navigation"
  | "help"
  | "unknown";

export type MessageRole = "user" | "kai" | "system";

export interface AssistantAction {
  label: string;
  targetRoom: Room;
  description?: string;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  intent?: IntentType;
  actions?: AssistantAction[];
  quickReplies?: string[];
}
