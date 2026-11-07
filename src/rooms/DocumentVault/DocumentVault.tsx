import { useState, useMemo, useCallback } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { ResumeVariant } from "../../knowledge-engine/types";
import { useExperienceEngine } from "../../experience-engine";
import ResumeCard from "./ResumeCard";
import ResumeDetailModal from "./ResumeDetailModal";
import {
  Search,
  Filter,
  Terminal,
  FileText,
  ShieldCheck,
  Award,
  ExternalLink,
  Calendar,
  Building,
} from "lucide-react";
import "./document-vault.css";

export default function DocumentVault() {
  const { routeParams, changeRoom, mode } = useExperienceEngine();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Derive selected resume directly from routeParams without cascading effect renders
  const selectedResume = useMemo<ResumeVariant | null>(() => {
    if (routeParams.resume) {
      return knowledgeEngine.getResumeVariantById(routeParams.resume) || null;
    }
    return null;
  }, [routeParams.resume]);

  const handlePreviewResume = useCallback((resume: ResumeVariant) => {
    changeRoom("DocumentVault", { resume: resume.id });
  }, [changeRoom]);

  const handleCloseResume = useCallback(() => {
    changeRoom("DocumentVault");
  }, [changeRoom]);

  // Retrieve resume variants and credentials from Knowledge Engine as the single source of truth
  const allResumes = useMemo(() => knowledgeEngine.getResumeVariants(), []);
  const allAchievements = useMemo(
    () => knowledgeEngine.getAchievements(),
    []
  );

  // Credentials derived from Knowledge Engine achievements data
  const credentialRecords = useMemo(() => {
    return allAchievements.filter(
      (a) => a.category === "certification" || a.credentialUrl
    );
  }, [allAchievements]);

  // Compute dynamic vault statistics
  const stats = useMemo(() => {
    const totalVariants = allResumes.length;
    const linkedDocuments = allResumes.filter(
      (r) =>
        r.fileUrl &&
        !r.fileUrl.startsWith("#") &&
        (r.fileUrl.startsWith("/") ||
          r.fileUrl.startsWith("http://") ||
          r.fileUrl.startsWith("https://"))
    ).length;
    const credentialsCount = credentialRecords.length;
    const allSkills = new Set(allResumes.flatMap((r) => r.skillsSummary));

    return {
      totalVariants,
      linkedDocuments,
      credentialsCount,
      uniqueSkills: allSkills.size,
    };
  }, [allResumes, credentialRecords]);

  // Filter resumes by search query
  const filteredResumes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allResumes;

    return allResumes.filter((resume) => {
      return (
        resume.label.toLowerCase().includes(q) ||
        resume.roleTitle.toLowerCase().includes(q) ||
        resume.bestFor.toLowerCase().includes(q) ||
        resume.skillsSummary.some((s) => s.toLowerCase().includes(q)) ||
        resume.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [allResumes, searchQuery]);

  return (
    <section className="document-vault" aria-label="Document Vault">
      {/* Facility Header */}
      <header className="vault-header">
        <div className="vault-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-05 // VERIFIED DOCUMENTS</span>
        </div>

        <div className="vault-headline-group">
          <h1 className="vault-title">Document Vault</h1>
          <p className="vault-subtitle">
            Secure digital repository of role-tailored resume variants, verified
            competency matrices, and certified enterprise credentials. Inspect
            tailored highlights or download available specifications.
          </p>
        </div>

        {/* Mode Perspective Lens Banner */}
        {mode === "recruiter" && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 8,
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              fontSize: "0.82rem",
              color: "#86efac",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <strong>// RECRUITER PRIMARY DESTINATION:</strong>
            <span>
              All 4 role-tailored resume specifications are available with direct ATS-friendly PDF download and browser preview actions.
            </span>
          </div>
        )}

        {/* Telemetry Statistics Grid */}
        <div className="vault-stats-grid">
          <div className="vault-stat-box">
            <span className="vault-stat-value">{stats.totalVariants}</span>
            <span className="vault-stat-label">Resume Variants</span>
          </div>
          <div className="vault-stat-box">
            <span className="vault-stat-value" style={{ color: "#38bdf8" }}>
              {stats.credentialsCount}
            </span>
            <span className="vault-stat-label">Credential Records</span>
          </div>
          <div className="vault-stat-box">
            <span className="vault-stat-value" style={{ color: "#facc15" }}>
              {stats.uniqueSkills}
            </span>
            <span className="vault-stat-label">Targeted Competencies</span>
          </div>
          <div className="vault-stat-box">
            <span className="vault-stat-value" style={{ color: "#22c55e" }}>
              {stats.linkedDocuments > 0
                ? `${stats.linkedDocuments} Linked`
                : "Active Curated"}
            </span>
            <span className="vault-stat-label">Repository Status</span>
          </div>
        </div>
      </header>

      {/* Search and Controls */}
      <div className="vault-controls">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={16} color="#38bdf8" />
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#f8fafc",
            }}
          >
            Curated Career Variants ({filteredResumes.length})
          </span>
        </div>

        <div className="vault-search-wrapper">
          <Search size={14} className="vault-search-icon" />
          <input
            type="text"
            className="vault-search-input"
            placeholder="Search role, skills, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search resume variants by keyword or skill"
          />
        </div>
      </div>

      {/* Resume Variants Grid */}
      <section className="vault-section" aria-label="Role-Targeted Resume Variants">
        {filteredResumes.length > 0 ? (
          <div className="vault-resumes-grid">
            {filteredResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onPreview={handlePreviewResume}
              />
            ))}
          </div>
        ) : (
          <div className="vault-empty-state">
            <Filter size={32} color="#64748b" />
            <h3 style={{ color: "#f1f5f9", margin: 0 }}>
              No matching resume variants
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              No variant matches "{searchQuery}". Try clearing your search query.
            </p>
            <button
              type="button"
              className="vault-filter-btn active"
              onClick={() => setSearchQuery("")}
              style={{ marginTop: 8 }}
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* Verified Credentials & Certificates Registry */}
      {credentialRecords.length > 0 && (
        <section
          className="vault-section"
          aria-label="Verified Credentials Registry"
          style={{ marginTop: 12 }}
        >
          <div className="vault-section-header">
            <h2 className="vault-section-title">
              <Award size={18} color="#38bdf8" />
              <span>Verified Credentials & Enterprise Certifications</span>
            </h2>
          </div>

          <div className="credentials-grid">
            {credentialRecords.map((cred) => (
              <div key={cred.id} className="credential-item-card">
                <div className="credential-item-top">
                  <h3 className="credential-item-title">{cred.title}</h3>
                  <span
                    className="resume-target-badge"
                    style={{ fontSize: "0.68rem" }}
                  >
                    <ShieldCheck size={11} />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="credential-item-issuer">
                  <Building size={13} color="#64748b" />
                  <span>{cred.issuer}</span>
                </div>

                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#94a3b8",
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {cred.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "auto",
                    paddingTop: 8,
                    borderTop: "1px solid rgba(30, 41, 59, 0.8)",
                  }}
                >
                  <span className="credential-item-date">
                    <Calendar
                      size={11}
                      style={{ display: "inline", marginRight: 3 }}
                    />
                    {cred.date}
                  </span>

                  {cred.credentialUrl && (
                    <a
                      href={cred.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-inspect-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#38bdf8",
                        fontSize: "0.78rem",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      <span>Verify</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resume Inspection Modal */}
      <ResumeDetailModal
        resume={selectedResume}
        onClose={handleCloseResume}
      />
    </section>
  );
}
