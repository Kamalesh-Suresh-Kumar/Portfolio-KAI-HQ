// import {
//     House,
//     Cpu,
//     Brain,
//     Trophy,
//     FolderOpen,
//     MessageSquare,
//     Workflow,
//     Satellite
// } from "lucide-react";
// export default function Sidebar() {
//     return (
//         <aside>
//             <h2>Navigation</h2>
//             <ul>
//                 <li>
//                     <House size={20} />
//                     <span>Lobby</span>
//                 </li>
//                 <li>
//                     <Cpu size={20} />
//                     <span>Engineering Laboratory</span>
//                 </li>
//                 <li>
//                     <Brain size={20} />
//                     <span>Memory Archive</span>
//                 </li>
//                 <li>
//                     <Trophy size={20} />
//                     <span>Achievement Hall</span>
//                 </li>
//                 <li>
//                     <FolderOpen size={20} />
//                     <span>Document Vault</span>
//                 </li>
//                 <li>
//                     <MessageSquare size={20} />
//                     <span>Communication Center</span>
//                 </li>
//                 <li>
//                     <Workflow size={20} />
//                     <span>Skill Processor</span>
//                 </li>
//                 <li>
//                     <Satellite size={20} />
//                     <span>Mission Control</span>
//                 </li>
//             </ul>
//         </aside>
//     );
// }
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