import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine } from "../../experience-engine";
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
  const { changeRoom, openKAI, setAssistantFocus, reducedMotion } = useExperienceEngine();
  const contact = knowledgeEngine.getContact();

  const handleTalkToKAI = () => {
    setAssistantFocus({
      contextPrompt: "Hello KAI, give me an overview of Kamalesh's engineering portfolio",
    });
    openKAI();
  };

  return (
    <div className="hero-section" role="region" aria-label="Hero Overview">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge-row">
            <span className="hero-label">// KAI HQ OPERATING SYSTEM v1.0</span>
            <span className="hero-status-pill">
              <span className="pulse-dot"></span>
              SYSTEMS ONLINE
            </span>
          </div>

          <h1 className="hero-title">
            KAI HQ
            <span className="hero-subtitle-block">
              Kamalesh Artificial Intelligence Headquarters
            </span>
          </h1>

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

          <div className="hero-actions-grid">
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

            <button
              type="button"
              className="btn-hero-kai"
              onClick={handleTalkToKAI}
              id="hero-talk-to-kai-btn"
            >
              <Bot size={16} />
              <span>Talk to KAI</span>
            </button>
          </div>
        </div>

        {/* AI Core Interactive Visualizer */}
        <div className="hero-core-wrapper">
          <button
            type="button"
            className={`ai-core-interactive ${reducedMotion ? "reduced-motion" : ""}`}
            onClick={handleTalkToKAI}
            aria-label="Launch KAI Assistant from Central Core"
            title="Click to launch KAI Assistant"
          >
            <div className="core-glow-ambient"></div>
            <div className="core-ring ring-outer"></div>
            <div className="core-ring ring-mid"></div>
            <div className="core-ring ring-inner"></div>
            <div className="core-center">
              <span className="core-brand-text">KAI</span>
              <span className="core-status-text">CORE ONLINE</span>
            </div>
          </button>
          <div className="core-caption">
            <span>CENTRAL COGNITIVE CORE</span>
            <small>Click core to interact</small>
          </div>
        </div>
      </div>
    </div>
  );
}
