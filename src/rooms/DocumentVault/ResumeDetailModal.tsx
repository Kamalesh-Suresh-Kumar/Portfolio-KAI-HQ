import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ResumeVariant } from "../../knowledge-engine/types";
import { resolveAssetUrl } from "../../experience-engine";
import {
  X,
  FileText,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Printer,
  Download,
} from "lucide-react";

interface ResumeDetailModalProps {
  resume: ResumeVariant | null;
  onClose: () => void;
}

export default function ResumeDetailModal({
  resume,
  onClose,
}: ResumeDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!resume) return;

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
  }, [resume, onClose]);

  if (!resume) return null;

  const resolvedUrl = resolveAssetUrl(resume.fileUrl);
  const isDocumentLinked = Boolean(resolvedUrl && !resume.fileUrl.startsWith("#"));
  const downloadFilename = `Kamalesh-Suresh-Kumar-${resume.id.replace(/^resume-/, "")}-resume.pdf`;

  const modalContent = (
    <div className="vault-modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className="vault-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-modal-title"
      >
        {/* Header */}
        <div className="vault-modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="resume-target-badge">
                <ShieldCheck size={12} />
                <span>{resume.label}</span>
              </span>
              <span className="resume-updated-pill">
                Updated {resume.lastUpdated}
              </span>
            </div>
            <h2
              id="vault-modal-title"
              className="resume-card-title"
              style={{ fontSize: "1.25rem" }}
            >
              {resume.roleTitle}
            </h2>
          </div>

          <button
            type="button"
            className="vault-modal-close-btn"
            onClick={onClose}
            aria-label="Close document inspection dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="vault-modal-body">
          {/* Target Scope */}
          <div className="vault-section">
            <h4 className="resume-highlights-title" style={{ fontSize: "0.78rem" }}>
              <FileText size={14} style={{ display: "inline", marginRight: 4 }} />
              Role Intent & Optimal Matching
            </h4>
            <p className="resume-best-for" style={{ fontSize: "0.9rem" }}>
              {resume.bestFor}
            </p>
          </div>

          {/* Tailored Highlights */}
          <div className="vault-section">
            <h4 className="resume-highlights-title" style={{ fontSize: "0.78rem" }}>
              <Award size={14} style={{ display: "inline", marginRight: 4 }} />
              Key Experience & Engineering Highlights
            </h4>
            <ul className="resume-highlights-list">
              {resume.highlights.map((highlight) => (
                <li key={highlight} className="resume-highlight-item" style={{ fontSize: "0.88rem" }}>
                  <CheckCircle2
                    size={16}
                    color="#38bdf8"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Toolchain & Competencies */}
          <div className="vault-section">
            <h4 className="resume-highlights-title" style={{ fontSize: "0.78rem" }}>
              <Layers size={14} style={{ display: "inline", marginRight: 4 }} />
              Verified Competencies & Stack
            </h4>
            <div className="resume-skills-wrap">
              {resume.skillsSummary.map((skill) => (
                <span
                  key={skill}
                  className="resume-skill-tag"
                  style={{ fontSize: "0.8rem", padding: "4px 9px" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Document Status Note */}
          <div
            style={{
              background: isDocumentLinked
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(15, 23, 42, 0.8)",
              border: isDocumentLinked
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : "1px dashed #334155",
              borderRadius: 8,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {isDocumentLinked ? (
              <>
                <CheckCircle2 size={18} color="#22c55e" />
                <span style={{ fontSize: "0.85rem", color: "#86efac" }}>
                  Official PDF artifact is verified and linked for download.
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={18} color="#94a3b8" />
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Binary PDF artifact is curated and pending build linking. All
                  verified claims, skills, and highlights are inspectable above.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="vault-modal-footer">
          <button
            type="button"
            className="resume-action-btn"
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.35)",
            }}
            onClick={() => window.print()}
            aria-label="Print resume specification"
          >
            <Printer size={14} />
            <span>Print Specification</span>
          </button>
          {isDocumentLinked && (
            <>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-action-btn btn-primary"
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                }}
              >
                <ExternalLink size={14} />
                <span>View PDF</span>
              </a>

              <a
                href={resolvedUrl}
                download={downloadFilename}
                className="resume-action-btn btn-primary"
                style={{
                  background: "#166534",
                  color: "#4ade80",
                  borderColor: "rgba(74, 222, 128, 0.4)",
                }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </a>
            </>
          )}
          <button
            type="button"
            className="resume-action-btn btn-primary"
            onClick={onClose}
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
