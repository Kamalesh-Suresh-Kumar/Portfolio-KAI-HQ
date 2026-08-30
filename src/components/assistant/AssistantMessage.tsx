import { memo } from "react";
import type { AssistantMessage as IAssistantMessage } from "../../assistant/types";
import { useExperienceEngine } from "../../experience-engine";
import { ArrowRight, Bot, User, Terminal } from "lucide-react";

interface AssistantMessageProps {
  message: IAssistantMessage;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AssistantMessage({ message }: AssistantMessageProps) {
  const { changeRoom } = useExperienceEngine();

  const isUser = message.role === "user";
  const isKAI = message.role === "kai";

  return (
    <div
      className={`kai-message ${message.role}`}
      role="article"
      aria-label={`${message.role === "kai" ? "KAI Assistant" : "User"} message`}
    >
      <div className="kai-msg-bubble">
        {message.content}

        {/* Action Navigation Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="kai-msg-actions" aria-label="Suggested navigation actions">
            {message.actions.map((action, idx) => (
              <button
                key={`${action.targetRoom}-${idx}`}
                type="button"
                className="kai-action-btn"
                onClick={() => changeRoom(action.targetRoom)}
                aria-label={`${action.label} - ${action.description || `Navigate to ${action.targetRoom}`}`}
              >
                <span>{action.label}</span>
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="kai-msg-meta">
        {isUser && <User size={11} />}
        {isKAI && <Bot size={11} color="#38bdf8" />}
        {message.role === "system" && <Terminal size={11} />}
        <span>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

export default memo(AssistantMessage);
