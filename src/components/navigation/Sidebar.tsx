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
import {
    useExperienceEngine,
} from "../../experience-engine/useExperienceEngine";
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
export default function Sidebar() {
    const { currentRoom, changeRoom } = useExperienceEngine();
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>KAI HQ</h2>
            </div>
            <nav>
                {rooms.map((room) => (
                    <button
                        key={room.value}
                        className={`nav-item ${
                            currentRoom === room.value ? "active" : ""
                        }`}
                        onClick={() => changeRoom(room.value)}
                    >
                        <span className="nav-icon">{room.icon}</span>
                        <span>{room.name}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}