import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Achievement } from "../../knowledge-engine/types";
import { knowledgeEngine } from "../../knowledge-engine";
import {
  X,
  Award,
  Building,
  Calendar,
  ShieldCheck,
  FileCheck,
  Star,
  ExternalLink,
  Layers,
  GraduationCap,
} from "lucide-react";

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementDetailModal({
  achievement,
  onClose,
}: AchievementDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!achievement) return;

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
  }, [achievement, onClose]);

  if (!achievement) return null;

  const categoryLabels: Record<string, string> = {
    demonstration: "Cybersecurity Demonstration",
    certification: "Technical Certification",
    leadership: "Cadetship & Leadership",
    academic: "Academic Distinction",
    hackathon: "Hackathon & Challenge",
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "demonstration":
        return <ShieldCheck size={14} />;
      case "certification":
        return <FileCheck size={14} />;
      case "leadership":
        return <Award size={14} />;
      case "academic":
        return <GraduationCap size={14} />;
      default:
        return <Award size={14} />;
    }
  };

  // Resolve linked projects from Knowledge Engine
  const linkedProjects = (achievement.relatedProjectIds || [])
    .map((projectId) => knowledgeEngine.getProjectById(projectId))
    .filter(Boolean);

  const modalContent = (
    <div
      className="achievement-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="achievement-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-modal-title"
      >
        {/* Header */}
        <div className="achievement-modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className={`achievement-cat-badge cat-${achievement.category}`}
              >
                {getCategoryIcon(achievement.category)}
                <span>
                  {categoryLabels[achievement.category] || achievement.category}
                </span>
              </span>

              {achievement.highlight && (
                <span className="achievement-highlight-pill">
                  <Star size={11} fill="#fbbf24" />
                  <span>Verified Milestone</span>
                </span>
              )}
            </div>

            <h2
              id="achievement-modal-title"
              className="achievement-card-title"
              style={{ fontSize: "1.25rem" }}
            >
              {achievement.title}
            </h2>
          </div>

          <button
            type="button"
            className="achievement-modal-close-btn"
            onClick={onClose}
            aria-label="Close achievement verification modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="achievement-modal-body">
          {/* Metadata Overview */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(30, 41, 59, 0.8)",
              padding: "12px 16px",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#cbd5e1" }}>
              <Building size={14} color="#38bdf8" />
              <span>
                <strong>Issuer:</strong> {achievement.issuer}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#cbd5e1" }}>
              <Calendar size={14} color="#38bdf8" />
              <span>
                <strong>Timeline:</strong> {achievement.date}
              </span>
            </div>
          </div>

          {/* Description */}
          <section className="achievement-modal-section">
            <h4 className="achievement-modal-section-title">
              <Award size={14} />
              <span>Record Scope & Description</span>
            </h4>
            <p className="achievement-modal-desc">{achievement.description}</p>
          </section>

          {/* Linked Projects */}
          {linkedProjects.length > 0 && (
            <section className="achievement-modal-section">
              <h4 className="achievement-modal-section-title">
                <Layers size={14} />
                <span>Related Engineering Specimen</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {linkedProjects.map((project) => (
                  <div
                    key={project!.id}
                    className="achievement-modal-project-box"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h5 className="achievement-modal-project-title">
                        {project!.title}
                      </h5>
                      <span
                        className="achievement-cat-badge"
                        style={{
                          fontSize: "0.7rem",
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                        }}
                      >
                        {project!.domain}
                      </span>
                    </div>
                    <p className="achievement-modal-project-summary">
                      {project!.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verification / Credential Links */}
          {achievement.credentialUrl && (
            <section className="achievement-modal-section">
              <h4 className="achievement-modal-section-title">
                <ShieldCheck size={14} />
                <span>Credential Verification</span>
              </h4>
              <a
                href={achievement.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#38bdf8",
                  fontSize: "0.88rem",
                  textDecoration: "underline",
                }}
              >
                <span>View Official Certificate Credential</span>
                <ExternalLink size={14} />
              </a>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="achievement-modal-footer">
          <button
            type="button"
            className="achievement-modal-btn"
            onClick={onClose}
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
