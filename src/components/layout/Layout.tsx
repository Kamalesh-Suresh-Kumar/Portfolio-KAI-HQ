import Header from "../navigation/Header";
import Sidebar from "../navigation/Sidebar";
import RoomContainer from "./RoomContainer";
export default function Layout() {
    return (
        <div>
            <Header />
            <div>
                <Sidebar />
                <RoomContainer />
            </div>
        </div>
    );
}