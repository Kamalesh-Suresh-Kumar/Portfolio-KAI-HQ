import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine } from "../../experience-engine";
import type { Room } from "../../experience-engine/ExperienceEngineContext";
import type { RoomMetadata } from "../../knowledge-engine/types";
import {
  Compass,
  FolderGit2,
  Clock,
  Trophy,
  FileText,
  MessageSquare,
  Cpu,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

export default function FacilityNavigationGrid() {
  const { currentRoom, changeRoom } = useExperienceEngine();

  const rooms = useMemo(() => {
    const res = knowledgeEngine.getRoomMetadata();
    return Array.isArray(res) ? res : [];
  }, []);

  const getRoomIcon = (id: string) => {
    switch (id) {
      case "Lobby":
        return <Compass size={20} color="#38bdf8" />;
      case "EngineeringLaboratory":
        return <FolderGit2 size={20} color="#38bdf8" />;
      case "MemoryArchive":
        return <Clock size={20} color="#34d399" />;
      case "AchievementHall":
        return <Trophy size={20} color="#facc15" />;
      case "DocumentVault":
        return <FileText size={20} color="#f472b6" />;
      case "CommunicationCenter":
        return <MessageSquare size={20} color="#38bdf8" />;
      case "SkillProcessor":
        return <Cpu size={20} color="#818cf8" />;
      case "MissionControl":
        return <SlidersHorizontal size={20} color="#38bdf8" />;
      default:
        return <Compass size={20} color="#38bdf8" />;
    }
  };

  return (
    <section className="lobby-facilities-section" aria-label="Explore KAI HQ Operational Facilities">
      <div className="lobby-section-header">
        <div>
          <span className="lobby-sub-badge">// FACILITY DIRECTORY</span>
          <h2 className="lobby-section-title">Explore KAI HQ Facilities</h2>
        </div>
        <span className="lobby-meta-tag">8 INTERCONNECTED ROOMS</span>
      </div>

      <p className="lobby-facilities-intro">
        Navigate to any dedicated room in the headquarters to inspect code, proficiencies, credentials, or system controls:
      </p>

      <div className="lobby-facilities-grid">
        {rooms.map((rm: RoomMetadata) => {
          const isCurrent = currentRoom === rm.id;
          return (
            <button
              key={rm.id}
              type="button"
              className={`lobby-facility-card ${isCurrent ? "current-room" : ""}`}
              onClick={() => changeRoom(rm.id as Room)}
              aria-label={`Enter facility ${rm.name} (${rm.code})`}
            >
              <div className="facility-card-top">
                <div className="facility-icon-wrap">{getRoomIcon(rm.id)}</div>
                <span className="facility-code-pill">{rm.code}</span>
              </div>

              <div className="facility-card-body">
                <h3 className="facility-title">{rm.name}</h3>
                <p className="facility-desc">{rm.description}</p>
              </div>

              <div className="facility-card-foot">
                <span className="facility-action-text">
                  {isCurrent ? "● CURRENT LOCATION" : "ENTER FACILITY"}
                </span>
                <ArrowRight size={13} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
