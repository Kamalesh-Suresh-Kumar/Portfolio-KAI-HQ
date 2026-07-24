import { useExperienceEngine } from "../../experience-engine/useExperienceEngine";
export default function Header() {
    const { currentRoom } = useExperienceEngine();
    return (
        <header>
            <h1>KAI HQ</h1>
            <p>
                Kamalesh Artificial Intelligence Headquarters
            </p>
            <h3>
                Current Room : {currentRoom}
            </h3>
        </header>
    );
}