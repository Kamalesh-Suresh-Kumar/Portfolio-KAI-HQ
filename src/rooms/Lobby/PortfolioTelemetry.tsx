import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine } from "../../experience-engine";
import {
  FolderGit2,
  Cpu,
  Trophy,
  Clock,
  FileText,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function PortfolioTelemetry() {
  const { changeRoom } = useExperienceEngine();

  // Dynamic telemetry statistics derived directly from knowledgeEngine.getStats()
  const stats = useMemo(() => {
    const s = knowledgeEngine.getStats();
    return [
      {
        id: "stat-projects",
        label: "Engineering Projects",
        value: String(s.projectsCount),
        detail: "Optical Security & Full-Stack Architectures",
        icon: <FolderGit2 size={20} color="#38bdf8" />,
        targetRoom: "EngineeringLaboratory" as const,
      },
      {
        id: "stat-skills",
        label: "Technical Proficiencies",
        value: String(s.skillsCount),
        detail: "Languages, Security & Infrastructure",
        icon: <Cpu size={20} color="#818cf8" />,
        targetRoom: "SkillProcessor" as const,
      },
      {
        id: "stat-achievements",
        label: "Verified Credentials",
        value: String(s.achievementsCount),
        detail: "Police Briefing, Certifications & Honors",
        icon: <Trophy size={20} color="#facc15" />,
        targetRoom: "AchievementHall" as const,
      },
      {
        id: "stat-timeline",
        label: "Milestone Records",
        value: String(s.timelineCount),
        detail: "Chronological Education & Roles",
        icon: <Clock size={20} color="#34d399" />,
        targetRoom: "MemoryArchive" as const,
      },
      {
        id: "stat-resumes",
        label: "Resume Specifications",
        value: String(s.resumeVariantsCount),
        detail: "Tailored Role Variants Ready in Vault",
        icon: <FileText size={20} color="#f472b6" />,
        targetRoom: "DocumentVault" as const,
      },
      {
        id: "stat-rooms",
        label: "Facility Rooms",
        value: String(s.roomsCount),
        detail: "Integrated Modular Operational Spaces",
        icon: <Compass size={20} color="#38bdf8" />,
        targetRoom: "MissionControl" as const,
      },
    ];
  }, []);

  return (
    <section className="lobby-telemetry-section" aria-label="Portfolio Telemetry Overview">
      <div className="lobby-section-header">
        <div>
          <span className="lobby-sub-badge">// TELEMETRY</span>
          <h2 className="lobby-section-title">Knowledge Engine Index Metrics</h2>
        </div>
        <span className="lobby-meta-tag">DETERMINISTIC IN-MEMORY REPOSITORY</span>
      </div>

      <div className="lobby-telemetry-grid">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            className="lobby-telemetry-card"
            onClick={() => changeRoom(stat.targetRoom)}
            aria-label={`Inspect ${stat.label} in ${stat.targetRoom}`}
          >
            <div className="telemetry-card-head">
              <div className="telemetry-icon-box">{stat.icon}</div>
              <span className="telemetry-stat-num">{stat.value}</span>
            </div>
            <div className="telemetry-card-info">
              <h3 className="telemetry-card-label">{stat.label}</h3>
              <p className="telemetry-card-desc">{stat.detail}</p>
            </div>
            <div className="telemetry-card-footer">
              <span>Inspect Facility</span>
              <ArrowRight size={13} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
