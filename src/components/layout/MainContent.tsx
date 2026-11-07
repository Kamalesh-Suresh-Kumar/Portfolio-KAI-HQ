import { useEffect, useRef } from "react";
import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
import RoomContainer from "./RoomContainer";

export default function MainContent() {
  const { currentRoom } = useExperienceEngine();
  const mainRef = useRef<HTMLElement>(null);

  // Automatically reset vertical scroll to top whenever the room changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentRoom]);

  return (
    <main
      ref={mainRef}
      className="main-content"
      id="main-content"
      tabIndex={-1}
      aria-label="Current Facility Room"
    >
      <RoomContainer />
    </main>
  );
}