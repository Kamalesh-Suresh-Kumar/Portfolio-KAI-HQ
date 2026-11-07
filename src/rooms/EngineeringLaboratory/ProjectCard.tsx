import type { Project } from "../../knowledge-engine/types";
import { ExternalLink, ArrowUpRight, Cpu, Terminal, CheckCircle2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useExperienceEngine } from "../../experience-engine";

interface ProjectCardProps {
  project: Project;
  onInspect: (project: Project) => void;
}

export default function ProjectCard({ project, onInspect }: ProjectCardProps) {
  const { mode } = useExperienceEngine();
  const domainLabels: Record<string, string> = {
    cybersecurity: "Cybersecurity",
    fullstack: "Full-Stack",
    devops: "DevOps & CI/CD",
    "ai-ml": "AI & Systems",
    backend: "Backend",
    frontend: "Frontend",
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked directly on an external anchor tag, don't trigger modal
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    onInspect(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onInspect(project);
    }
  };

  return (
    <article
      className={`specimen-card ${mode === "developer" ? "developer-mode-card" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Inspect ${project.title}`}
    >
      <div className="specimen-card-top">
        <div className="specimen-meta-header">
          <span className="specimen-domain-badge">
            {domainLabels[project.domain] || project.domain}
          </span>
          <span className={`specimen-status-badge status-${project.status}`}>
            ● {project.status}
          </span>
        </div>

        <h3 className="specimen-title">{project.title}</h3>
        <p className="specimen-summary">{project.summary}</p>

        {/* Developer mode: Full technical architecture detail displayed */}
        {mode === "developer" && project.engineeringDecision && (
          <div
            style={{
              margin: "8px 0",
              padding: "6px 10px",
              background: "rgba(15, 23, 42, 0.7)",
              borderLeft: "2px solid #38bdf8",
              borderRadius: "0 4px 4px 0",
              fontSize: "0.78rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#38bdf8", marginBottom: 2, fontWeight: 600 }}>
              <Terminal size={11} />
              <span>Engineering Architecture Decision:</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.4 }}>{project.engineeringDecision}</p>
          </div>
        )}

        {/* Recruiter mode: Key impact / operational metric displayed */}
        {mode === "recruiter" && project.metrics && project.metrics.length > 0 && (
          <div
            style={{
              margin: "8px 0",
              padding: "6px 10px",
              background: "rgba(16, 37, 26, 0.5)",
              borderLeft: "2px solid #34d399",
              borderRadius: "0 4px 4px 0",
              fontSize: "0.78rem",
              color: "#a7f3d0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#34d399", marginBottom: 2, fontWeight: 600 }}>
              <CheckCircle2 size={11} />
              <span>Demonstrated Impact:</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.4 }}>{project.metrics[0]}</p>
          </div>
        )}

        <div className="specimen-stack-list" aria-label="Technologies used">
          {project.stack.map((tech) => (
            <span key={tech} className="specimen-stack-pill">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="specimen-card-bottom">
        <div className="specimen-actions">
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="specimen-link-btn"
              title="View Repository"
              aria-label={`View ${project.title} repository on GitHub`}
              onClick={(e) => e.stopPropagation()}
            >
              <FaGithub size={14} />
              <span>Code</span>
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="specimen-link-btn"
              title="Live Deployment"
              aria-label={`Open live demonstration for ${project.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
              <span>Live</span>
            </a>
          )}
        </div>

        <button
          type="button"
          className="specimen-inspect-btn"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(project);
          }}
          aria-label={`Inspect full engineering specifications for ${project.title}`}
        >
          <Cpu size={14} />
          <span>Inspect Specimen</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}
