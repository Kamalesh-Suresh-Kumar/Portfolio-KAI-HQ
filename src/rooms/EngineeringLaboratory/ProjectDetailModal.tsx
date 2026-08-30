import { useEffect } from "react";
import type { Project } from "../../knowledge-engine/types";
import { knowledgeEngine } from "../../knowledge-engine";
import {
  X,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) return null;

  const domainLabels: Record<string, string> = {
    cybersecurity: "Cybersecurity & Li-Fi",
    fullstack: "Full-Stack Web Architecture",
    devops: "DevOps & CI/CD Pipelines",
    "ai-ml": "AI Systems & Intent Routing",
    backend: "Backend Services",
    frontend: "Frontend Architecture",
  };

  // Resolve linked skills from the Knowledge Engine
  const linkedSkills = project.relatedSkillIds
    .map((skillId) => knowledgeEngine.getSkillById(skillId))
    .filter(Boolean);

  return (
    <div
      className="specimen-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="specimen-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="specimen-modal-title"
      >
        {/* Header */}
        <div className="specimen-modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="specimen-domain-badge">
                {domainLabels[project.domain] || project.domain}
              </span>
              <span
                className={`specimen-status-badge status-${project.status}`}
              >
                ● {project.status}
              </span>
            </div>
            <h2 id="specimen-modal-title" className="specimen-title" style={{ fontSize: "1.35rem" }}>
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            className="specimen-modal-close-btn"
            onClick={onClose}
            aria-label="Close project inspection modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="specimen-modal-body">
          {/* Engineering Overview */}
          <section className="modal-section">
            <h4 className="modal-section-title">
              <Cpu size={15} />
              <span>Engineering Overview & Purpose</span>
            </h4>
            <p className="modal-description">{project.description}</p>
          </section>

          {/* Key Metrics / Highlights */}
          {project.metrics && project.metrics.length > 0 && (
            <section className="modal-section">
              <h4 className="modal-section-title">
                <Sparkles size={15} />
                <span>Verified Milestones & Telemetry</span>
              </h4>
              <ul className="modal-metrics-list">
                {project.metrics.map((metric) => (
                  <li key={metric} className="modal-metric-item">
                    <CheckCircle2 size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Architectural Decision */}
          {project.engineeringDecision && (
            <section className="modal-section">
              <h4 className="modal-section-title">
                <ShieldCheck size={15} />
                <span>Key Architectural & Design Decision</span>
              </h4>
              <div className="modal-callout-box">
                {project.engineeringDecision}
              </div>
            </section>
          )}

          {/* Technology Stack */}
          <section className="modal-section">
            <h4 className="modal-section-title">
              <Layers size={15} />
              <span>Technology & Toolchain Stack</span>
            </h4>
            <div className="specimen-stack-list">
              {project.stack.map((tech) => (
                <span key={tech} className="specimen-stack-pill">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Linked Skills */}
          {linkedSkills.length > 0 && (
            <section className="modal-section">
              <h4 className="modal-section-title">
                <Cpu size={15} />
                <span>Cross-Linked Proficiencies</span>
              </h4>
              <div className="modal-skills-grid">
                {linkedSkills.map((skill) => (
                  <div key={skill!.id} className="modal-skill-chip">
                    <span>{skill!.name}</span>
                    <span className="modal-skill-level">
                      {skill!.proficiencyLevel}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="specimen-modal-footer">
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="specimen-link-btn"
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            >
              <FaGithub size={16} />
              <span>View Source Code</span>
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="specimen-link-btn"
              style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                borderColor: "#38bdf8",
              }}
            >
              <ExternalLink size={16} />
              <span>Live Demonstration</span>
            </a>
          )}
          <button
            type="button"
            className="specimen-link-btn"
            onClick={onClose}
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
