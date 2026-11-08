import { useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import BootSequence from "../components/system-feedback/BootSequence";
import { useExperienceEngine } from "../experience-engine";

export default function HeadquartersShell() {
  const { currentRoom, reducedMotion } = useExperienceEngine();

  // Check if session has already performed power-on boot sequence or landed on deep link
  const [isBooted, setIsBooted] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      if (sessionStorage.getItem("kai_hq_booted") === "true") {
        return true;
      }
    } catch {
      // Safe catch for restricted iframe/sessionStorage
    }
    // Direct entity or room deep links immediately show target room without blocking
    return currentRoom !== "Lobby";
  });

  const handleCompleteBoot = useCallback(() => {
    setIsBooted(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("kai_hq_booted", "true");
      } catch {
        // Safe catch
      }
    }
  }, []);

  return (
    <>
      {!isBooted && !reducedMotion && (
        <BootSequence
          onComplete={handleCompleteBoot}
          reducedMotion={reducedMotion}
        />
      )}
      <Layout />
    </>
  );
}