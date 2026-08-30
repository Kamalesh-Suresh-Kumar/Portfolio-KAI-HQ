import { useExperienceEngine } from "../../experience-engine";
import type { VisitorMode } from "../../experience-engine/ExperienceEngineContext";
import { UserCheck, Code2, Layers, Sparkles } from "lucide-react";

interface ModeOption {
  id: VisitorMode;
  label: string;
  badge: string;
  description: string;
  focusHighlights: string[];
  icon: React.ReactNode;
}

const MODES: ModeOption[] = [
  {
    id: "neutral",
    label: "Neutral Tour",
    badge: "COMPLETE",
    description: "Explore the comprehensive KAI HQ operating system across all engineering facilities, credentials, and capabilities.",
    focusHighlights: ["All 8 Facilities", "Global Search", "Full Knowledge Index"],
    icon: <Layers size={18} />,
  },
  {
    id: "recruiter",
    label: "Recruiter Focus",
    badge: "TALENT & IMPACT",
    description: "Tailored view prioritizing engineering projects, verified credentials, achievements, education milestones, and resume specifications.",
    focusHighlights: ["Resume Variants", "Verified Police Briefing", "Milestones & Roles"],
    icon: <UserCheck size={18} />,
  },
  {
    id: "developer",
    label: "Engineering Focus",
    badge: "ARCHITECTURE",
    description: "Deep dive into system architecture, optical security protocols, decoupled state engines, algorithms, and tech stack proficiencies.",
    focusHighlights: ["Li-Fi Protocols", "Sub-10ms Intent Engine", "Skill Matrix & Telemetry"],
    icon: <Code2 size={18} />,
  },
];

export default function VisitorModeSelector() {
  const { mode, setMode } = useExperienceEngine();

  return (
    <section className="lobby-mode-section" aria-label="Visitor Perspective Selector">
      <div className="lobby-section-header">
        <div>
          <span className="lobby-sub-badge">// PERSPECTIVE</span>
          <h2 className="lobby-section-title">Visitor Experience Mode</h2>
        </div>
        <div className="lobby-mode-active-pill">
          <Sparkles size={13} color="#38bdf8" />
          <span>CURRENT MODE: {mode.toUpperCase()}</span>
        </div>
      </div>

      <p className="lobby-mode-intro">
        Select a tailored perspective to customize recommended inspection paths, contextual emphasis, and assistant guidance across KAI HQ:
      </p>

      <div className="lobby-mode-grid" role="radiogroup" aria-label="Visitor mode options">
        {MODES.map((item) => {
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`lobby-mode-card ${isSelected ? "selected" : ""}`}
              onClick={() => setMode(item.id)}
            >
              <div className="mode-card-header">
                <div className="mode-icon-box">{item.icon}</div>
                <span className="mode-badge">{item.badge}</span>
              </div>

              <div className="mode-card-body">
                <h3 className="mode-title">{item.label}</h3>
                <p className="mode-description">{item.description}</p>
              </div>

              <div className="mode-card-highlights">
                {item.focusHighlights.map((hl) => (
                  <span key={hl} className="mode-chip">
                    • {hl}
                  </span>
                ))}
              </div>

              <div className="mode-select-indicator">
                <span>{isSelected ? "● ACTIVE PERSPECTIVE" : "SELECT MODE"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
