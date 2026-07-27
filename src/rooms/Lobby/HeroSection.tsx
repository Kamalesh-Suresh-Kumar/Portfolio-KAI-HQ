import DashboardCard from "../../components/dashboard/DashboardCard";
export default function HeroSection() {
    return (
        <DashboardCard className="hero-section">
            <div className="hero-content">
                <div className="hero-text">
                    <span className="hero-label">
                        KAI HQ Operating System
                    </span>
                    <h1>
                        Welcome to KAI Headquarters
                    </h1>
                    <p>
                        An AI-powered portfolio showcasing software engineering,
                        automation, artificial intelligence, cloud technologies,
                        and innovative projects.
                    </p>
                </div>
                <div className="hero-core">
                    <div className="ai-core">
                        <div className="core-ring ring-1"></div>
                        <div className="core-ring ring-2"></div>
                        <div className="core-center">
                            KAI
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}