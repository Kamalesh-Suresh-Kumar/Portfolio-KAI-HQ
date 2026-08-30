import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { RoomMetadata, RoomId } from "../../knowledge-engine/types";
import { useExperienceEngine } from "../../experience-engine";
import {
  Compass,
  ArrowRight,
} from "lucide-react";

export default function RoomDirectory() {
  const { currentRoom, changeRoom } = useExperienceEngine();

  // Rooms metadata from Knowledge Engine
  const rooms = useMemo<RoomMetadata[]>(() => {
    const raw = knowledgeEngine.getRoomMetadata();
    return Array.isArray(raw) ? raw : [];
  }, []);

  const handleRoomClick = (roomId: RoomId) => {
    changeRoom(roomId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, roomId: RoomId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRoomClick(roomId);
    }
  };

  return (
    <section className="room-directory-section" aria-label="Facility Directory">
      <div className="room-directory-header">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 className="facility-status-title">
            <Compass size={15} color="#38bdf8" />
            <span>KAI HQ Facility Directory</span>
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
            Unified directory of the 8 specialized rooms and operational consoles in the headquarters.
          </p>
        </div>

        <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b" }}>
          {rooms.length} TOTAL FACILITIES
        </span>
      </div>

      <div className="room-directory-grid">
        {rooms.map((room) => {
          const isActive = currentRoom === room.id;
          return (
            <article
              key={room.id}
              className={`room-directory-card ${isActive ? "active-room" : ""}`}
              tabIndex={0}
              role="button"
              onClick={() => handleRoomClick(room.id)}
              onKeyDown={(e) => handleKeyDown(e, room.id)}
              aria-label={`Navigate to ${room.name} (${room.code})`}
            >
              <div className="room-card-header">
                <span className="room-code-tag">{room.code}</span>
                <span
                  className={`status-node-badge ${isActive ? "online" : "ready"}`}
                  style={{ fontSize: "0.68rem" }}
                >
                  ● {isActive ? "CURRENT FACILITY" : "ONLINE"}
                </span>
              </div>

              <div>
                <h3 className="room-card-title">{room.name}</h3>
                <p className="room-card-desc">{room.description}</p>
              </div>

              <div className="room-card-footer">
                <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#64748b" }}>
                  // {room.domain}
                </span>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#38bdf8", fontWeight: 600 }}>
                  <span>{isActive ? "Viewing" : "Navigate"}</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
