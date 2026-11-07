import { useEffect, useRef, useState } from "react";
import {
  FaHome,
  FaLaptopCode,
  FaBrain,
  FaTrophy,
  FaFolderOpen,
  FaComments,
  FaMicrochip,
  FaSatelliteDish,
} from "react-icons/fa";
import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
import type { Room } from "../../experience-engine/ExperienceEngineContext";

const rooms: {
  name: string;
  value: Room;
  icon: React.ReactNode;
}[] = [
  {
    name: "Lobby",
    value: "Lobby",
    icon: <FaHome />,
  },
  {
    name: "Engineering Laboratory",
    value: "EngineeringLaboratory",
    icon: <FaLaptopCode />,
  },
  {
    name: "Memory Archive",
    value: "MemoryArchive",
    icon: <FaBrain />,
  },
  {
    name: "Achievement Hall",
    value: "AchievementHall",
    icon: <FaTrophy />,
  },
  {
    name: "Document Vault",
    value: "DocumentVault",
    icon: <FaFolderOpen />,
  },
  {
    name: "Communication Center",
    value: "CommunicationCenter",
    icon: <FaComments />,
  },
  {
    name: "Skill Processor",
    value: "SkillProcessor",
    icon: <FaMicrochip />,
  },
  {
    name: "Mission Control",
    value: "MissionControl",
    icon: <FaSatelliteDish />,
  },
];

interface SidebarProps {
  isMobileNavOpen?: boolean;
  onCloseMobileNav?: () => void;
}

export default function Sidebar({
  isMobileNavOpen = false,
  onCloseMobileNav,
}: SidebarProps) {
  const { currentRoom, changeRoom } = useExperienceEngine();
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Monitor viewport width for accessible tab navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When drawer opens on mobile, focus the active or first navigation item
  useEffect(() => {
    if (isMobile && isMobileNavOpen) {
      const timer = setTimeout(() => {
        if (activeBtnRef.current) {
          activeBtnRef.current.focus();
        } else if (firstBtnRef.current) {
          firstBtnRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isMobileNavOpen]);

  // Trap focus within drawer when open on mobile, and close on Escape key
  useEffect(() => {
    if (!isMobileNavOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseMobileNav?.();
        return;
      }

      if (e.key === "Tab" && navRef.current) {
        const focusableElements = navRef.current.querySelectorAll<HTMLButtonElement>("button");
        if (focusableElements.length === 0) return;
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, onCloseMobileNav]);

  const handleRoomSelect = (roomValue: Room) => {
    changeRoom(roomValue);
    onCloseMobileNav?.();
  };

  // On mobile when closed, interactive items are excluded from tab index
  const itemTabIndex = isMobile && !isMobileNavOpen ? -1 : 0;

  return (
    <aside
      className={`sidebar ${isMobileNavOpen ? "open" : ""}`}
      id="kai-sidebar-nav"
      aria-label="Headquarters Facility Navigation"
      aria-hidden={isMobile && !isMobileNavOpen ? "true" : undefined}
    >
      <div className="sidebar-logo">
        <h2>KAI HQ</h2>
      </div>
      <nav ref={navRef} aria-label="Facility Rooms">
        {rooms.map((room, index) => {
          const isActive = currentRoom === room.value;
          return (
            <button
              key={room.value}
              ref={isActive ? activeBtnRef : index === 0 ? firstBtnRef : undefined}
              type="button"
              tabIndex={itemTabIndex}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleRoomSelect(room.value)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{room.icon}</span>
              <span>{room.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}