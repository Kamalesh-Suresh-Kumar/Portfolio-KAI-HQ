import type { ResumeVariant } from "../../knowledge-engine/types";
import { resolveAssetUrl } from "../../experience-engine";
import {
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Download,
} from "lucide-react";

interface ResumeCardProps {
  resume: ResumeVariant;
  onPreview: (resume: ResumeVariant) => void;
}

export default function ResumeCard({ resume, onPreview }: ResumeCardProps) {
  const resolvedUrl = resolveAssetUrl(resume.fileUrl);
  const isDocumentLinked = Boolean(resolvedUrl && !resume.fileUrl.startsWith("#"));

  const downloadFilename = `Kamalesh-Suresh-Kumar-${resume.id.replace(/^resume-/, "")}-resume.pdf`;

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
          <span>Verified PDF Artifact</span>
        </div>

        <div className="resume-action-group">
          <button
            type="button"
            className="resume-action-btn btn-primary"
            onClick={() => onPreview(resume)}
            aria-label={`Inspect ${resume.label} summary specifications`}
          >
            <Layers size={13} />
            <span>Inspect</span>
          </button>

          {isDocumentLinked && (
            <>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-action-btn btn-primary"
                aria-label={`View ${resume.label} PDF in new tab`}
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                }}
              >
                <ExternalLink size={13} />
                <span>View PDF</span>
              </a>

              <a
                href={resolvedUrl}
                download={downloadFilename}
                className="resume-action-btn btn-primary"
                aria-label={`Download ${resume.label} PDF`}
                style={{
                  background: "#166534",
                  color: "#4ade80",
                  borderColor: "rgba(74, 222, 128, 0.4)",
                }}
              >
                <Download size={13} />
                <span>Download</span>
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
