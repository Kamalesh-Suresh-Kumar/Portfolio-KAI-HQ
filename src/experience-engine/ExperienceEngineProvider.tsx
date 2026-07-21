import { useState } from "react";
import type { ReactNode } from "react";
import {
  ExperienceEngineContext,
  type Room,
} from "./ExperienceEngineContext";
export function ExperienceEngineProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentRoom, setCurrentRoom] = useState<Room>("Lobby");
  function changeRoom(room: Room) {
    setCurrentRoom(room);
  }
  return (
    <ExperienceEngineContext.Provider
      value={{
        currentRoom,
        changeRoom,
      }}
    >
      {children}
    </ExperienceEngineContext.Provider>
  );
}