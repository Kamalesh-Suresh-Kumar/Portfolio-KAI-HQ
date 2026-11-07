import { useState, useRef, useEffect } from "react";
import Header from "../navigation/Header";
import Sidebar from "../navigation/Sidebar";
import MainContent from "./MainContent";
import Assistant from "../assistant/Assistant";

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Return focus to menu toggle button when mobile drawer closes
  useEffect(() => {
    if (wasOpenRef.current && !isMobileNavOpen) {
      menuToggleRef.current?.focus();
    }
    wasOpenRef.current = isMobileNavOpen;
  }, [isMobileNavOpen]);

  const handleCloseMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  return (
    <div className="layout">
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