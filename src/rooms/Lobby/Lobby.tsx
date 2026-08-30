import "./lobby.css";
import HeroSection from "./HeroSection";
import PortfolioTelemetry from "./PortfolioTelemetry";
import VisitorModeSelector from "./VisitorModeSelector";
import FeaturedProjectsSection from "./FeaturedProjectsSection";
import FeaturedAchievementsSection from "./FeaturedAchievementsSection";
import FacilityNavigationGrid from "./FacilityNavigationGrid";
import AssistantIntroBanner from "./AssistantIntroBanner";

export default function Lobby() {
  return (
    <div className="lobby" id="kai-lobby-view">
      {/* 1. Hero / Identity & AI Core Section */}
      <HeroSection />

      {/* 2. Portfolio Dynamic Telemetry */}
      <PortfolioTelemetry />

      {/* 3. Visitor Perspective / Mode Selector */}
      <VisitorModeSelector />

      {/* 4. Featured Engineering Systems */}
      <FeaturedProjectsSection />

      {/* 5. Featured Verified Honors & Briefings */}
      <FeaturedAchievementsSection />

      {/* 6. Quick Facility Navigation Grid */}
      <FacilityNavigationGrid />

      {/* 7. KAI Assistant Introductory Guide & Action Prompts */}
      <AssistantIntroBanner />
    </div>
  );
}
