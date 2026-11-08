import { useState, useRef, useEffect } from "react";
import Header from "../navigation/Header";
import Sidebar from "../navigation/Sidebar";
import MainContent from "./MainContent";
import Assistant from "../assistant/Assistant";
import { useExperienceEngine } from "../../experience-engine";
import { ROOM_DISPLAY_NAMES } from "../../experience-engine/routeHelper";

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { currentRoom, reducedMotion } = useExperienceEngine();
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Centralized Route Announcer for screen readers (aria-live="polite", aria-atomic="true")
  const isInitialMountRef = useRef(true);
  const previousRoomRef = useRef(currentRoom);
  const [routeAnnouncement, setRouteAnnouncement] = useState<string>("");

  useEffect(() => {
    // Avoid announcing initial application boot as a room transition per REQ
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousRoomRef.current = currentRoom;
      return;
    }

    if (previousRoomRef.current !== currentRoom) {
      const roomName = ROOM_DISPLAY_NAMES[currentRoom] || currentRoom;
      setRouteAnnouncement(`Navigated to ${roomName} facility.`);
      previousRoomRef.current = currentRoom;
    }
  }, [currentRoom]);

  // Return focus to menu toggle button when mobile drawer closes
  useEffect(() => {
    if (wasOpenRef.current && !isMobileNavOpen) {
      menuToggleRef.current?.focus();
    }
    wasOpenRef.current = isMobileNavOpen;
  }, [isMobileNavOpen]);

  // Lock body scroll when mobile drawer is open to prevent background bleed
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const handleCloseMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.focus();
      mainEl.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <div className={`layout ${reducedMotion ? "reduced-motion" : ""}`}>
      {/* 1. Skip to Content Link (First keyboard interactive element) */}
      <a
        href="#main-content"
        className="skip-to-content-link"
        onClick={handleSkipToContent}
      >
        Skip to main content
      </a>

      {/* 2. Centralized screen-reader route announcement live region */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id="kai-route-announcer"
      >
        {routeAnnouncement}
      </div>

      <Header
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={handleToggleMobileNav}
        toggleButtonRef={menuToggleRef}
      />
      <div
        className={`sidebar-backdrop ${isMobileNavOpen ? "active" : ""}`}
        onClick={handleCloseMobileNav}
        aria-hidden="true"
      />
      <div className="layout-body">
        <Sidebar
          isMobileNavOpen={isMobileNavOpen}
          onCloseMobileNav={handleCloseMobileNav}
        />
        <MainContent />
      </div>
      <Assistant />
    </div>
  );
}