import { useState, useEffect } from "react";
import { useExperienceEngine } from "../../experience-engine";
import SystemTelemetry from "./SystemTelemetry";
import GlobalSearch from "./GlobalSearch";
import CommandPalette from "./CommandPalette";
import RoomDirectory from "./RoomDirectory";
import {
  Terminal,
  Command,
  Radio,
} from "lucide-react";
import "./mission-control.css";

export default function MissionControl() {
  const { reducedMotion } = useExperienceEngine();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  return (
    <section
      className={`mission-control ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="Mission Control"
    >
      {/* Facility Header */}
      <header className="mission-header">
        <div className="mission-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-08 // SYSTEM OPERATIONS</span>
        </div>

        <div className="mission-headline-group">
          <div className="mission-title-row">
            <h1 className="mission-title">
              <Radio size={28} color="#38bdf8" />
              <span>Mission Control</span>
            </h1>

            <button
              type="button"
              className="mission-cmd-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open Command Palette"
            >
              <Command size={14} />
              <span>Open Command Palette</span>
              <kbd className="mission-kbd">⌘K / Ctrl+K</kbd>
            </button>
          </div>

          <p className="mission-subtitle">
            Central operational console for KAI Headquarters. Execute universal knowledge base searches, inspect facility telemetry, monitor application subsystems, and access rapid command routing across the portfolio.
          </p>
        </div>
      </header>

      {/* Global Universal Search Console */}
      <GlobalSearch onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Dynamic System Telemetry & Operational States */}
      <SystemTelemetry />

      {/* Facility Room Directory */}
      <RoomDirectory />

      {/* Quick Action Command Palette Modal */}
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      )}
    </section>
  );
}
