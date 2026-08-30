import { useExperienceEngine } from "../../experience-engine";
import {
  Bot,
  Terminal,
  Sparkles,
  FolderGit2,
  Cpu,
  Clock,
  FileText,
  MessageSquare,
  Compass,
} from "lucide-react";

export default function AssistantIntroBanner() {
  const { openKAI, setAssistantFocus, isKAIOpen } = useExperienceEngine();

  const handleLaunchWithPrompt = (prompt: string) => {
    setAssistantFocus({
      contextPrompt: prompt,
    });
    openKAI();
  };

  return (
    <section className="lobby-kai-intro-section" aria-label="KAI Assistant Guide Introduction">
      <div className="kai-intro-card">
        <div className="kai-intro-badge-row">
          <div className="kai-status-pill">
            <span className="kai-status-dot"></span>
            <span>KAI ASSISTANT // DETERMINISTIC ENGINE READY</span>
          </div>
          <span className="kai-latency-tag">&lt; 10MS QUERY RESOLUTION</span>
        </div>

        <div className="kai-intro-main">
          <div className="kai-intro-avatar">
            <div className="avatar-rings">
              <div className="avatar-ring-outer"></div>
              <div className="avatar-ring-inner"></div>
              <div className="avatar-core">
                <Bot size={28} color="#38bdf8" />
              </div>
            </div>
          </div>

          <div className="kai-intro-text">
            <h3 className="kai-intro-heading">Need Quick Information or Direct Navigation?</h3>
            <p className="kai-intro-description">
              KAI is your local, in-memory portfolio guide. Powered strictly by the Knowledge Engine with zero external cloud dependencies or latency, KAI resolves inquiries regarding technical systems, skill proficiencies, career records, verified credentials, and role-tailored resumes.
            </p>

            <div className="kai-sample-prompts-wrap">
              <span className="sample-prompts-label">
                <Sparkles size={12} color="#38bdf8" />
                <span>TRY A DIRECT QUERY:</span>
              </span>
              <div className="sample-prompts-grid">
                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("Show me your featured engineering projects")}
                >
                  <FolderGit2 size={13} />
                  <span>"Show me your engineering projects"</span>
                </button>

                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("What are your core technical skills?")}
                >
                  <Cpu size={13} />
                  <span>"What are your core skills?"</span>
                </button>

                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("Show me your education and experience timeline")}
                >
                  <Clock size={13} />
                  <span>"Tell me about your career timeline"</span>
                </button>

                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("What resume variants are available?")}
                >
                  <FileText size={13} />
                  <span>"What resume variants are in the vault?"</span>
                </button>

                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("How can I contact Kamalesh?")}
                >
                  <MessageSquare size={13} />
                  <span>"How do I contact Kamalesh?"</span>
                </button>

                <button
                  type="button"
                  className="btn-sample-prompt"
                  onClick={() => handleLaunchWithPrompt("Take me to Mission Control")}
                >
                  <Compass size={13} />
                  <span>"Take me to Mission Control"</span>
                </button>
              </div>
            </div>

            <div className="kai-intro-footer">
              <button
                type="button"
                className="btn-launch-kai-main"
                onClick={() => {
                  setAssistantFocus({
                    contextPrompt: "Hello KAI, what can you do?",
                  });
                  openKAI();
                }}
              >
                <Terminal size={16} />
                <span>{isKAIOpen ? "KAI Dialog Active (Inspect)" : "Launch KAI Assistant"}</span>
              </button>
              <span className="kai-shortcut-hint">OR PRESS `CTRL + K` ANYWHERE IN HQ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
