import Header from "../navigation/Header";
import Sidebar from "../navigation/Sidebar";
import MainContent from "./MainContent";
export default function Layout() {
    return (
        <div className="layout">
            <Header />
            <div className="layout-body">
                <Sidebar />
                <MainContent />
            </div>
        </div>
    );
}