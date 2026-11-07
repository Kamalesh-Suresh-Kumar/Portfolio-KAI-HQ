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

      {/* 2. Active Development Notice */}
      <section
        className="lobby-dev-notice"
        role="status"
        aria-label="Headquarters Active Development Status"
      >
        <div className="dev-notice-header">
          <span className="dev-notice-pulse" aria-hidden="true" />
          <h2 className="dev-notice-title">KAI HQ — UNDER ACTIVE DEVELOPMENT</h2>
        </div>
        <p className="dev-notice-body">
          This headquarters is an evolving portfolio project currently under active development. Some features, project descriptions, achievements and other information are still being refined and may be incomplete, provisional or subject to change. Additional improvements and verified content will be introduced progressively.
        </p>
      </section>

      {/* 3. Portfolio Dynamic Telemetry */}
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
