import type { RefObject } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
import type { Room, VisitorMode } from "../../experience-engine/ExperienceEngineContext";
import { Layers, UserCheck, Code2 } from "lucide-react";

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
  const { currentRoom, mode, setMode } = useExperienceEngine();
  const displayName = ROOM_DISPLAY_NAMES[currentRoom] || currentRoom;

  const modeOptions: { id: VisitorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: "neutral",
      label: "Neutral",
      icon: <Layers size={13} />,
      tooltip: "Balanced comprehensive tour",
    },
    {
      id: "recruiter",
      label: "Recruiter",
      icon: <UserCheck size={13} />,
      tooltip: "Fast screening, resumes & credentials",
    },
    {
      id: "developer",
      label: "Developer",
      icon: <Code2 size={13} />,
      tooltip: "Architecture, code & protocol depth",
    },
  ];

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

      {/* Visitor Mode Perspective Switcher */}
      <nav
        className="header-mode-nav"
        role="radiogroup"
        aria-label="Visitor Perspective Mode"
      >
        <span className="header-mode-label">// PERSPECTIVE:</span>
        <div className="header-mode-group">
          {modeOptions.map((opt) => {
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Switch perspective to ${opt.label} mode (${opt.tooltip})`}
                className={`header-mode-chip ${isSelected ? "active" : ""}`}
                onClick={() => setMode(opt.id)}
                title={opt.tooltip}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="header-right" aria-live="polite">
        <span className="room-label">CURRENT ROOM</span>
        <h2>{displayName}</h2>
      </div>
    </header>
  );
}