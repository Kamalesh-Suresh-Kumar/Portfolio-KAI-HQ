import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { Skill, Project } from "../../knowledge-engine/types";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine, buildPath } from "../../experience-engine";
import {
  X,
  Layers,
  FolderGit2,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SkillDetailModalProps {
  skill: Skill | null;
  onClose: () => void;
}

export default function SkillDetailModal({
  skill,
  onClose,
}: SkillDetailModalProps) {
  const { changeRoom } = useExperienceEngine();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!skill) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [skill, onClose]);

  // Resolve linked projects through Knowledge Engine single source of truth
  const linkedProjects = useMemo<Project[]>(() => {
    if (!skill || !skill.linkedProjectIds) return [];
    return skill.linkedProjectIds
      .map((id) => knowledgeEngine.getProjectById(id))
      .filter((p): p is Project => p !== undefined);
  }, [skill]);

  if (!skill) return null;

  const getProficiencyLabel = (level: string): string => {
    switch (level) {
      case "advanced":
        return "Advanced";
      case "proficient":
        return "Proficient";
      case "working_knowledge":
        return "Working Knowledge";
      case "learning":
        return "Learning";
      default:
        return level;
    }
  };

  const modalContent = (
    <div
      className="skill-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="skill-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-modal-title"
      >
        {/* Header */}
        <div className="skill-modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`capability-level-label level-${skill.proficiencyLevel}`}>
                ● {getProficiencyLabel(skill.proficiencyLevel).toUpperCase()}
              </span>
              <span className="skill-cat-pill" style={{ color: "#94a3b8" }}>
                // {skill.category.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <h2 id="skill-modal-title" className="skill-card-title" style={{ fontSize: "1.3rem" }}>
              {skill.name}
            </h2>
          </div>

          <button
            type="button"
            className="skill-modal-close-btn"
            onClick={onClose}
            aria-label="Close capability specification dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="skill-modal-body">
          {/* Engineering Context / Description */}
          {skill.description && (
            <div className="skill-modal-section">
              <h3 className="skill-modal-section-title">
                <Cpu size={14} />
                <span>Technical Scope & Context</span>
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(30, 41, 59, 0.8)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  margin: 0,
                }}
              >
                {skill.description}
              </p>
            </div>
          )}

          {/* Proficiency Metrics Breakdown */}
          <div className="skill-modal-section">
            <h3 className="skill-modal-section-title">
              <ShieldCheck size={14} />
              <span>Verified Capability Tier</span>
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#090e1a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={18} color="#38bdf8" />
                <div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f8fafc" }}>
                    {getProficiencyLabel(skill.proficiencyLevel)} Competency
                  </span>
                  <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: 0 }}>
                    Integrated in core engineering pipelines & project architectures
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Projects (Relationships) */}
          <div className="skill-modal-section">
            <h3 className="skill-modal-section-title">
              <FolderGit2 size={14} />
              <span>
                Linked Engineering Projects ({linkedProjects.length})
              </span>
            </h3>

            {linkedProjects.length > 0 ? (
              <div className="skill-linked-projects-list">
                {linkedProjects.map((project) => (
                  <div key={project.id} className="skill-linked-project-item">
                    <div className="linked-proj-header">
                      <span className="linked-proj-title">{project.title}</span>
                      <span
                        className="skill-cat-pill"
                        style={{
                          background: "rgba(56, 189, 248, 0.1)",
                          color: "#38bdf8",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.68rem",
                        }}
                      >
                        {project.domain}
                      </span>
                    </div>

                    <p className="linked-proj-summary">{project.summary}</p>

                    <div className="linked-proj-stack">
                      {project.stack.map((tech) => (
                        <span key={tech} className="linked-stack-pill">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginTop: 4,
                        paddingTop: 6,
                        borderTop: "1px solid rgba(30, 41, 59, 0.6)",
                      }}
                    >
                      <a
                        href={buildPath("EngineeringLaboratory")}
                        onClick={(e) => {
                          e.preventDefault();
                          changeRoom("EngineeringLaboratory");
                          onClose();
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.76rem",
                          color: "#38bdf8",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        <span>View in Engineering Lab</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "#94a3b8",
                  fontStyle: "italic",
                  margin: 0,
                  padding: "12px",
                  background: "#090e1a",
                  borderRadius: 6,
                }}
              >
                No directly linked standalone projects for this foundational competency; utilized cross-system across tooling and scripts.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="skill-modal-footer">
          <button
            type="button"
            className="skill-filter-btn active"
            onClick={onClose}
          >
            <Layers size={13} />
            <span>Close Specification</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
