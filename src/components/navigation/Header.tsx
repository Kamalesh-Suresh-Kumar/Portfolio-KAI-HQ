import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
export default function Header() {
    const { currentRoom } = useExperienceEngine();
    return (
        <header className="header">
            <div className="header-left">
                <h1>KAI HQ</h1>
                <p>Kamalesh Artificial Intelligence Headquarters</p>
            </div>
            <div className="header-right">
                <span className="room-label">CURRENT ROOM</span>
                <h2>{currentRoom}</h2>
            </div>
        </header>
    );
}