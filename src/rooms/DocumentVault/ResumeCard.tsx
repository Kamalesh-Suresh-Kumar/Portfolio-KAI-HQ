import type { ResumeVariant } from "../../knowledge-engine/types";
import {
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface ResumeCardProps {
  resume: ResumeVariant;
  onPreview: (resume: ResumeVariant) => void;
}

export default function ResumeCard({ resume, onPreview }: ResumeCardProps) {
  // Check if fileUrl is a placeholder or actual linked file
  // In the dataset: '#/documents/resume-*.pdf' represents unlinked pending production PDFs
  const isDocumentLinked =
    resume.fileUrl &&
    !resume.fileUrl.startsWith("#") &&
    (resume.fileUrl.startsWith("/") ||
      resume.fileUrl.startsWith("http://") ||
      resume.fileUrl.startsWith("https://"));

  return (
    <article
      className="resume-card"
      tabIndex={0}
      aria-label={`${resume.label} specification`}
    >
      <div className="resume-card-top">
        <div className="resume-meta-header">
          <span className="resume-target-badge">
            <ShieldCheck size={12} />
            <span>{resume.label}</span>
          </span>

          <span className="resume-updated-pill">
            <Calendar size={11} style={{ display: "inline", marginRight: 3 }} />
            Updated {resume.lastUpdated}
          </span>
        </div>

        <div className="resume-title-group">
          <h3 className="resume-card-title">{resume.roleTitle}</h3>
          <span className="resume-role-sub">{resume.label}</span>
        </div>

        <p className="resume-best-for">
          <strong style={{ color: "#f1f5f9" }}>Target Scope: </strong>
          {resume.bestFor}
        </p>

        {/* Highlights */}
        {resume.highlights && resume.highlights.length > 0 && (
          <div className="resume-highlights-box">
            <h4 className="resume-highlights-title">Tailored Highlights</h4>
            <ul className="resume-highlights-list">
              {resume.highlights.map((highlight) => (
                <li key={highlight} className="resume-highlight-item">
                  <CheckCircle2
                    size={14}
                    color="#38bdf8"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Summary */}
        <div className="resume-highlights-box">
          <h4 className="resume-highlights-title">Core Competencies</h4>
          <div className="resume-skills-wrap">
            {resume.skillsSummary.map((skill) => (
              <span key={skill} className="resume-skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="resume-card-bottom">
        <div className="resume-status-badge">
          <FileText size={13} />
          <span>PDF Variant</span>
        </div>

        <div className="resume-action-group">
          <button
            type="button"
            className="resume-action-btn btn-primary"
            onClick={() => onPreview(resume)}
            aria-label={`Inspect ${resume.label} summary specifications`}
          >
            <Layers size={13} />
            <span>Inspect Variant</span>
          </button>

          {isDocumentLinked ? (
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-action-btn btn-primary"
              aria-label={`Download ${resume.label} PDF`}
            >
              <ExternalLink size={13} />
              <span>Download</span>
            </a>
          ) : (
            <span
              className="resume-action-btn btn-disabled"
              title="Physical PDF binary artifact not yet linked into production build"
            >
              <AlertCircle size={12} />
              <span>PDF Unlinked</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
