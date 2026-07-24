import {
    FaHome,
    FaLaptopCode,
    FaBrain,
    FaTrophy,
    FaFolderOpen,
    FaComments,
    FaMicrochip,
    FaSatelliteDish
} from "react-icons/fa";
export default function Sidebar() {
    return (
        <aside>
            <h2>Navigation</h2>
            <ul>
                <li>
                    <FaHome />
                    <span>Lobby</span>
                </li>
                <li>
                    <FaLaptopCode />
                    <span>Engineering Laboratory</span>
                </li>
                <li>
                    <FaBrain />
                    <span>Memory Archive</span>
                </li>
                <li>
                    <FaTrophy />
                    <span>Achievement Hall</span>
                </li>
                <li>
                    <FaFolderOpen />
                    <span>Document Vault</span>
                </li>
                <li>
                    <FaComments />
                    <span>Communication Center</span>
                </li>
                <li>
                    <FaMicrochip />
                    <span>Skill Processor</span>
                </li>
                <li>
                    <FaSatelliteDish />
                    <span>Mission Control</span>
                </li>
            </ul>
        </aside>
    );
}