import type { RefObject } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
import type { Room } from "../../experience-engine/ExperienceEngineContext";

const ROOM_DISPLAY_NAMES: Record<Room, string> = {
  Lobby: "Lobby",
  EngineeringLaboratory: "Engineering Laboratory",
  MemoryArchive: "Memory Archive",
  AchievementHall: "Achievement Hall",
  DocumentVault: "Document Vault",
  CommunicationCenter: "Communication Center",
  SkillProcessor: "Skill Processor",
  MissionControl: "Mission Control",
};

interface HeaderProps {
  isMobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
  toggleButtonRef?: RefObject<HTMLButtonElement | null>;
}

export default function Header({
  isMobileNavOpen = false,
  onToggleMobileNav,
  toggleButtonRef,
}: HeaderProps) {
  const { currentRoom } = useExperienceEngine();
  const displayName = ROOM_DISPLAY_NAMES[currentRoom] || currentRoom;

  return (
    <header className="header" role="banner">
      <div className="header-left">
        {onToggleMobileNav && (
          <button
            ref={toggleButtonRef}
            type="button"
            className="mobile-menu-btn"
            onClick={onToggleMobileNav}
            aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileNavOpen}
            aria-controls="kai-sidebar-nav"
          >
            {isMobileNavOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        )}
        <div className="header-branding">
          <h1>KAI HQ</h1>
          <p>Kamalesh Artificial Intelligence Headquarters</p>
        </div>
      </div>
      <div className="header-right" aria-live="polite">
        <span className="room-label">CURRENT ROOM</span>
        <h2>{displayName}</h2>
      </div>
    </header>
  );
}