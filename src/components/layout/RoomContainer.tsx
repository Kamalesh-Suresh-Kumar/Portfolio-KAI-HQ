import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
import Lobby from "../../rooms/Lobby/Lobby";
import EngineeringLaboratory from "../../rooms/EngineeringLaboratory/EngineeringLaboratory";
import MemoryArchive from "../../rooms/MemoryArchive/MemoryArchive";
import AchievementHall from "../../rooms/AchievementHall/AchievementHall";
import DocumentVault from "../../rooms/DocumentVault/DocumentVault";
import CommunicationCenter from "../../rooms/CommunicationCenter/CommunicationCenter";
import SkillProcessor from "../../rooms/SkillProcessor/SkillProcessor";
import MissionControl from "../../rooms/MissionControl/MissionControl";
export default function RoomContainer() {
    const { currentRoom } = useExperienceEngine();
    function renderRoom() {
        switch (currentRoom) {
            case "Lobby":
                return <Lobby />;
            case "EngineeringLaboratory":
                return <EngineeringLaboratory />;
            case "MemoryArchive":
                return <MemoryArchive />;
            case "AchievementHall":
                return <AchievementHall />;
            case "DocumentVault":
                return <DocumentVault />;
            case "CommunicationCenter":
                return <CommunicationCenter />;
            case "SkillProcessor":
                return <SkillProcessor />;
            case "MissionControl":
                return <MissionControl />;
            default:
                return <Lobby />;
        }
    }
    return renderRoom();
}