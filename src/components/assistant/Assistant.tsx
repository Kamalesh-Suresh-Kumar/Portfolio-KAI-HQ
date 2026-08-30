import { useState, useEffect, useRef, useCallback } from "react";
import { useExperienceEngine } from "../../experience-engine";
import type { AssistantMessage as IAssistantMessage } from "../../assistant/types";
import { routeIntent } from "../../assistant/intentRouter";
import {
  getGreetingMessage,
  generateAssistantResponse,
} from "../../assistant/responseTemplates";
import AssistantMessage from "./AssistantMessage";
import AssistantInput from "./AssistantInput";
import QuickActions from "./QuickActions";
import {
  Sparkles,
  X,
  RotateCcw,
  Bot,
} from "lucide-react";
import "./assistant.css";

export default function Assistant() {
  const {
    isKAIOpen,
    openKAI,
    closeKAI,
    toggleKAI,
    assistantFocus,
    setAssistantFocus,
    reducedMotion,
  } = useExperienceEngine();

  const [messages, setMessages] = useState<IAssistantMessage[]>(() => [
    getGreetingMessage(),
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  useEffect(() => {
    if (isKAIOpen) {
      scrollToBottom();
    }
  }, [messages, isKAIOpen, scrollToBottom]);

  // Handle external Assistant Focus from Experience Engine
  useEffect(() => {
    if (assistantFocus) {
      const focus = assistantFocus;
      const timer = setTimeout(() => {
        if (focus.contextPrompt) {
          const route = routeIntent(focus.contextPrompt);
          const res = generateAssistantResponse(route);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-user-focus`,
              role: "user",
              content: focus.contextPrompt!,
              timestamp: Date.now(),
            },
            res,
          ]);
        } else if (focus.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-sys-focus`,
              role: "system",
              content: focus.message!,
              timestamp: Date.now(),
            },
          ]);
        }
        openKAI();
        setAssistantFocus(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [assistantFocus, openKAI, setAssistantFocus]);

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isKAIOpen) {
        closeKAI();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKAIOpen, closeKAI]);

  // Message Handler
  const handleSendMessage = useCallback((text: string) => {
    const userMsg: IAssistantMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const route = routeIntent(text);
    const kaiMsg = generateAssistantResponse(route);

    setMessages((prev) => [...prev, userMsg, kaiMsg]);
  }, []);

  const handleResetConversation = useCallback(() => {
    setMessages([getGreetingMessage()]);
  }, []);

  // Compute active quick replies from the latest KAI message if available
  const latestKAIMessage = [...messages].reverse().find((m) => m.role === "kai");
  const currentQuickReplies = latestKAIMessage?.quickReplies;

  return (
    <div
      className={`kai-assistant-root ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="KAI Portfolio Assistant"
    >
      {/* Floating Trigger Button */}
      <div className="kai-trigger-wrapper">
        <button
          type="button"
          className={`kai-trigger-btn ${isKAIOpen ? "active" : ""}`}
          onClick={toggleKAI}
          aria-expanded={isKAIOpen}
          aria-controls="kai-dialog-panel"
          aria-label={isKAIOpen ? "Close KAI Assistant" : "Open KAI Assistant guide"}
        >
          <div className="kai-trigger-icon-wrap">
            {!reducedMotion && !isKAIOpen && <span className="kai-pulse-ring" />}
            <Sparkles size={16} />
          </div>
          <span className="kai-trigger-label">KAI GUIDE</span>
          <span className="kai-status-dot" title="Operational" />
        </button>
      </div>

      {/* Expandable Conversation Panel */}
      {isKAIOpen && (
        <aside
          id="kai-dialog-panel"
          ref={panelRef}
          className="kai-panel"
          role="dialog"
          aria-label="KAI Portfolio Assistant Guide"
          aria-modal="false"
        >
          {/* Header */}
          <header className="kai-panel-header">
            <div className="kai-header-title-group">
              <div className="kai-header-avatar">
                <Bot size={18} />
              </div>
              <div className="kai-header-titles">
                <span className="kai-header-name">
                  <span>KAI Assistant</span>
                  <span className="kai-status-dot" />
                </span>
                <span className="kai-header-sub">PORTFOLIO INTELLIGENCE GUIDE</span>
              </div>
            </div>

            <div className="kai-header-actions">
              <button
                type="button"
                className="kai-header-btn"
                onClick={handleResetConversation}
                title="Reset conversation"
                aria-label="Reset conversation to initial greeting"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                className="kai-header-btn"
                onClick={closeKAI}
                title="Close assistant (Esc)"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Conversation Log */}
          <div
            className="kai-panel-body"
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
          >
            {messages.map((msg) => (
              <AssistantMessage
                key={msg.id}
                message={msg}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Actions */}
          <QuickActions
            onSelectAction={handleSendMessage}
            customReplies={currentQuickReplies}
          />

          {/* Message Input Footer */}
          <AssistantInput
            onSend={handleSendMessage}
            isOpen={isKAIOpen}
          />
        </aside>
      )}
    </div>
  );
}
