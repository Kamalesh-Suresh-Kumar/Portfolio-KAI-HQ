import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine } from "../../experience-engine";
import { FolderGit2, ArrowRight, CheckCircle2, Terminal } from "lucide-react";

export default function FeaturedProjectsSection() {
  const { changeRoom, setAssistantFocus, mode } = useExperienceEngine();

  const projects = useMemo(() => {
    return knowledgeEngine.getProjects().filter((p) => p.featured || p.id === "lifi-security-protocols");
  }, []);

  const handleInspectProject = (projectId: string, projectTitle: string) => {
    setAssistantFocus({
      contextPrompt: `Tell me about the project: ${projectTitle}`,
      message: `Navigating to Engineering Laboratory to inspect architecture for ${projectTitle}.`,
    });
    changeRoom("EngineeringLaboratory", { project: projectId });
  };

  return (
    <section className="lobby-featured-projects-section" aria-label="Featured Engineering Architectures">
      <div className="lobby-section-header">
        <div>
          <span className="lobby-sub-badge">
            {mode === "developer"
              ? "// SYSTEM ARCHITECTURES & SOURCE"
              : mode === "recruiter"
              ? "// VERIFIED DELIVERABLES & IMPACT"
              : "// ENGINEERING LAB"}
          </span>
          <h2 className="lobby-section-title">Featured Systems & Architectures</h2>
        </div>
        <button
          type="button"
          className="lobby-text-cta"
          onClick={() => changeRoom("EngineeringLaboratory")}
        >
          <span>All Projects in Lab</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="lobby-projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="lobby-project-card">
            <div className="project-card-header">
              <div className="project-domain-tag">
                <FolderGit2 size={14} />
                <span>{project.domain.toUpperCase()}</span>
              </div>
              <span className={`project-status-chip ${project.status}`}>
                {project.status === "production" ? "PRODUCTION" : "COMPLETED"}
              </span>
            </div>

            <h3 className="project-title">{project.title}</h3>
            <p className="project-summary">{project.summary}</p>

            {mode === "developer" && project.engineeringDecision && (
              <div className="project-metrics-box" style={{ borderColor: "rgba(56, 189, 248, 0.4)", background: "rgba(12, 23, 44, 0.6)" }}>
                <div className="metrics-label" style={{ color: "#38bdf8" }}>
                  <Terminal size={12} color="#38bdf8" />
                  <span>ARCHITECTURE DECISION</span>
                </div>
                <p className="metric-text">{project.engineeringDecision}</p>
              </div>
            )}

            {project.metrics && project.metrics.length > 0 && mode !== "developer" && (
              <div className="project-metrics-box">
                <div className="metrics-label">
                  <CheckCircle2 size={12} color="#34d399" />
                  <span>KEY METRIC & IMPACT</span>
                </div>
                <p className="metric-text">{project.metrics[0]}</p>
              </div>
            )}

            <div className="project-stack-wrap">
              {project.stack.slice(0, 4).map((tech) => (
                <span key={tech} className="tech-badge">
                  {tech}
                </span>
              ))}
              {project.stack.length > 4 && (
                <span className="tech-badge-more">+{project.stack.length - 4}</span>
              )}
            </div>

            <div className="project-card-actions">
              <button
                type="button"
                className="btn-project-inspect"
                onClick={() => handleInspectProject(project.id, project.title)}
              >
                <span>Inspect in Lab</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn-project-kai"
                onClick={() => {
                  setAssistantFocus({
                    contextPrompt: `Explain the technical architecture of ${project.title}`,
                  });
                }}
                title="Ask KAI about this project"
              >
                <Terminal size={14} />
                <span>Ask KAI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
