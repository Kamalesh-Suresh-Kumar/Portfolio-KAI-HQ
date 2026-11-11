import { useState, useRef, useEffect } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine, resolveAssetUrl } from "../../experience-engine";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import {
  FolderGit2,
  Cpu,
  FileText,
  Bot,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function HeroSection() {
  const { changeRoom, openKAI, setAssistantFocus, reducedMotion, mode } = useExperienceEngine();
  const contact = knowledgeEngine.getContact();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const photoTriggerRef = useRef<HTMLButtonElement>(null);

  // 2-second hover / focus delayed tooltip for KAI AI button
  const [showKaiTooltip, setShowKaiTooltip] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleKaiButtonMouseEnter = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => {
      setShowKaiTooltip(true);
    }, 2000);
  };

  const handleKaiButtonMouseLeave = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowKaiTooltip(false);
  };

  const handleKaiButtonFocus = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => {
      setShowKaiTooltip(true);
    }, 2000);
  };

  const handleKaiButtonBlur = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowKaiTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  const handleTalkToKAI = () => {
    let contextPrompt = "Hello KAI, give me an overview of Kamalesh's engineering portfolio";
    if (mode === "recruiter") {
      contextPrompt = "Hello KAI, give me a quick recruiter summary of Kamalesh's background, qualifications, and role fit";
    } else if (mode === "developer") {
      contextPrompt = "Hello KAI, explain the system architecture, optical security protocols, and tech stacks used in Kamalesh's projects";
    }

    setAssistantFocus({ contextPrompt });
    openKAI();
  };

  const getModeBadge = () => {
    switch (mode) {
      case "recruiter":
        return "// PERSPECTIVE: RECRUITER & TALENT FOCUS";
      case "developer":
        return "// PERSPECTIVE: ENGINEERING & ARCHITECTURE FOCUS";
      case "neutral":
      default:
        return "// KAI HQ OPERATING SYSTEM v1.0";
    }
  };

  const renderKaiButton = (label: string) => (
    <div
      className="kai-tooltip-wrapper"
      onMouseEnter={handleKaiButtonMouseEnter}
      onMouseLeave={handleKaiButtonMouseLeave}
    >
      <button
        type="button"
        className="btn-hero-kai"
        onClick={handleTalkToKAI}
        onFocus={handleKaiButtonFocus}
        onBlur={handleKaiButtonBlur}
        id="hero-talk-to-kai-btn"
        aria-label={`${label} - Launch KAI Assistant`}
        aria-describedby={showKaiTooltip ? "kai-hero-tooltip" : undefined}
      >
        <Bot size={16} />
        <span>{label}</span>
      </button>
      {showKaiTooltip && (
        <div id="kai-hero-tooltip" className="kai-delayed-tooltip" role="tooltip">
          Click to interact with KAI guide
        </div>
      )}
    </div>
  );

  return (
    <div className="hero-section" role="region" aria-label="Hero Overview">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge-row">
            <span className="hero-label">{getModeBadge()}</span>
            <span className="hero-status-pill">
              <span className="pulse-dot"></span>
              SYSTEMS ONLINE
            </span>
          </div>

          <div className="hero-title-lockup">
            <img
              src={resolveAssetUrl("/assets/kai-hq-logo.svg")}
              alt="KAI HQ Primary Logo"
              className="hero-logo-img"
            />
            <div className="hero-title-text-wrap">
              <h1 className="hero-title">
                KAI HQ
                <span className="hero-subtitle-block">
                  Kamalesh Artificial Intelligence Headquarters
                </span>
              </h1>
            </div>
          </div>

          <div className="hero-profile-meta">
            <span className="profile-name">{contact.name}</span>
            <span className="profile-divider">|</span>
            <span className="profile-title">{contact.title}</span>
            <span className="profile-divider">|</span>
            <span className="profile-location">
              <MapPin size={13} color="#38bdf8" />
              {contact.location}
            </span>
          </div>

          <p className="hero-description">
            {contact.bio}
          </p>

          <div className="hero-availability-notice">
            <ShieldCheck size={15} color="#34d399" />
            <span>{contact.availability}</span>
          </div>

          {/* Action grid adapted for active mode */}
          <div className="hero-actions-grid">
            {mode === "recruiter" ? (
              <>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => changeRoom("DocumentVault")}
                  id="hero-view-resume-btn"
                >
                  <FileText size={16} />
                  <span>Download Resumes (4 Variants)</span>
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("AchievementHall")}
                  id="hero-view-achievements-btn"
                >
                  <ShieldCheck size={16} />
                  <span>Verified Credentials</span>
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("EngineeringLaboratory")}
                  id="hero-explore-engineering-btn"
                >
                  <FolderGit2 size={16} />
                  <span>Key Projects</span>
                </button>

                {renderKaiButton("Screening Q&A")}
              </>
            ) : mode === "developer" ? (
              <>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => changeRoom("EngineeringLaboratory")}
                  id="hero-explore-engineering-btn"
                >
                  <FolderGit2 size={16} />
                  <span>Explore Engineering & Code</span>
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("SkillProcessor")}
                  id="hero-view-skills-btn"
                >
                  <Cpu size={16} />
                  <span>Skill Matrix & Telemetry</span>
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("AchievementHall")}
                  id="hero-view-research-btn"
                >
                  <ShieldCheck size={16} />
                  <span>Protocol Research</span>
                </button>

                {renderKaiButton("Architecture Q&A")}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => changeRoom("EngineeringLaboratory")}
                  id="hero-explore-engineering-btn"
                >
                  <FolderGit2 size={16} />
                  <span>Explore Engineering</span>
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("SkillProcessor")}
                  id="hero-view-skills-btn"
                >
                  <Cpu size={16} />
                  <span>View Skills</span>
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => changeRoom("DocumentVault")}
                  id="hero-view-resume-btn"
                >
                  <FileText size={16} />
                  <span>View Resumes</span>
                </button>

                {renderKaiButton("Talk to KAI")}
              </>
            )}
          </div>
        </div>

        {/* AI Core Interactive Visualizer — Opens Full-Size Profile Photo Viewer */}
        <div className="hero-core-wrapper">
          <button
            ref={photoTriggerRef}
            type="button"
            className={`ai-core-interactive ${reducedMotion ? "reduced-motion" : ""}`}
            onClick={() => setIsViewerOpen(true)}
            aria-label="View full-size profile photograph of Kamalesh Suresh Kumar"
            title="Click to view full-size profile photo"
          >
            <div className="core-glow-ambient"></div>
            <div className="core-ring ring-outer"></div>
            <div className="core-ring ring-mid"></div>
            <div className="core-ring ring-inner"></div>
            <div className="core-center">
              <img
                src={resolveAssetUrl("/assets/kamalesh-portrait.png")}
                alt={contact.name}
                className="core-portrait-img"
              />
              <div className="core-portrait-glow" aria-hidden="true" />
            </div>
          </button>
          <div className="core-caption">
            <span>{contact.name.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Full-Size Profile Photo Lightbox */}
      <ProfilePhotoViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        triggerRef={photoTriggerRef}
      />
    </div>
  );
}
