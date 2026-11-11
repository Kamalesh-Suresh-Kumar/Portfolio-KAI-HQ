import { useState, useEffect, useRef, useCallback } from "react";
import { useExperienceEngine } from "../../experience-engine";
import type { AssistantMessage as IAssistantMessage } from "../../assistant/types";
import { routeIntent } from "../../assistant/intentRouter";
import {
  getGreetingMessage,
  generateAssistantResponse,
} from "../../assistant/responseTemplates";
import { speechAdapter } from "../../assistant/speechAdapter";
import AssistantMessage from "./AssistantMessage";
import AssistantInput from "./AssistantInput";
import QuickActions from "./QuickActions";
import {
  Sparkles,
  X,
  RotateCcw,
  Bot,
  Volume2,
  VolumeX,
  Square,
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
    mode,
    voiceEnabled,
    setVoiceEnabled,
  } = useExperienceEngine();

  const [messages, setMessages] = useState<IAssistantMessage[]>(() => [
    getGreetingMessage(mode),
  ]);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  // Protection A: Consecutive flagged/unrelated messages (5 threshold -> 30s)
  const [consecutiveFlaggedCount, setConsecutiveFlaggedCount] = useState<number>(0);

  // Protection B: Rapid message rate limiting (5 within 10s -> 15s)
  const messageTimestampsRef = useRef<number[]>([]);

  // Cooldown countdown state
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [cooldownReason, setCooldownReason] = useState<"abuse" | "rate_limit" | null>(null);

  // Interval timer for active cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setCooldownReason(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedBeforeOpenRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(isKAIOpen);

  // Return focus to trigger button or originating element when assistant closes
  useEffect(() => {
    if (!wasOpenRef.current && isKAIOpen) {
      // Just opened: capture the element that initiated opening or fall back to trigger
      const active = document.activeElement as HTMLElement | null;
      lastFocusedBeforeOpenRef.current =
        active && active !== document.body && document.contains(active)
          ? active
          : triggerBtnRef.current;
    } else if (wasOpenRef.current && !isKAIOpen) {
      // Just closed: return focus to trigger or originating element
      const targetCandidate = lastFocusedBeforeOpenRef.current;
      const target =
        targetCandidate && document.contains(targetCandidate)
          ? targetCandidate
          : triggerBtnRef.current;
      if (target && typeof target.focus === "function") {
        const currentActive = document.activeElement;
        const wasFocusInPanel =
          panelRef.current && panelRef.current.contains(currentActive);
        if (!currentActive || currentActive === document.body || wasFocusInPanel) {
          target.focus();
        }
      }
      lastFocusedBeforeOpenRef.current = null;
    }
    wasOpenRef.current = isKAIOpen;
  }, [isKAIOpen]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  useEffect(() => {
    if (isKAIOpen) {
      scrollToBottom();
    }
  }, [messages, isKAIOpen, scrollToBottom]);

  // Stop active speech output
  const handleStopSpeech = useCallback(() => {
    speechAdapter.stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingId(null);
  }, []);

  // Speak a specific message content
  const handleSpeakMessage = useCallback(
    (text: string, id: string) => {
      if (activeSpeakingId === id && isSpeaking) {
        handleStopSpeech();
        return;
      }

      handleStopSpeech();
      speechAdapter.speak(
        text,
        () => {
          setIsSpeaking(true);
          setActiveSpeakingId(id);
        },
        () => {
          setIsSpeaking(false);
          setActiveSpeakingId(null);
        },
        () => {
          setIsSpeaking(false);
          setActiveSpeakingId(null);
        }
      );
    },
    [activeSpeakingId, isSpeaking, handleStopSpeech]
  );

  // Clean up active speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      speechAdapter.stopSpeaking();
    };
  }, []);

  // Handle external Assistant Focus from Experience Engine
  useEffect(() => {
    if (assistantFocus) {
      const focus = assistantFocus;
      const timer = setTimeout(() => {
        if (focus.contextPrompt) {
          const route = routeIntent(focus.contextPrompt);
          const res = generateAssistantResponse(route, mode);
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

          if (voiceEnabled && speechAdapter.isSynthesisSupported()) {
            handleSpeakMessage(res.content, res.id);
          }
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
  }, [assistantFocus, openKAI, setAssistantFocus, mode, voiceEnabled, handleSpeakMessage]);

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isKAIOpen) {
        handleStopSpeech();
        closeKAI();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKAIOpen, closeKAI, handleStopSpeech]);

  // Message Handler with Cooldown Protection
  const handleSendMessage = useCallback(
    (text: string) => {
      if (cooldownRemaining > 0) return;

      handleStopSpeech();

      const now = Date.now();

      // Protection B: Rapid-message rate limiting (5 messages within 10 seconds -> 15s cooldown)
      const recent = [...messageTimestampsRef.current, now].filter((t) => now - t <= 10000);
      messageTimestampsRef.current = recent;

      if (recent.length >= 5) {
        setCooldownRemaining(15);
        setCooldownReason("rate_limit");
        messageTimestampsRef.current = [];
        return;
      }

      const userMsg: IAssistantMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: text,
        timestamp: now,
      };

      const route = routeIntent(text);
      const kaiMsg = generateAssistantResponse(route, mode);

      // Protection A: Consecutive flagged/unrelated messages (5 threshold -> 30s cooldown)
      if (route.intent === "unknown") {
        const nextFlagged = consecutiveFlaggedCount + 1;
        if (nextFlagged >= 5) {
          setCooldownRemaining(30);
          setCooldownReason("abuse");
          setConsecutiveFlaggedCount(0);
        } else {
          setConsecutiveFlaggedCount(nextFlagged);
        }
      } else {
        // Valid, supported interaction resets consecutive flagged counter
        setConsecutiveFlaggedCount(0);
      }

      setMessages((prev) => [...prev, userMsg, kaiMsg]);

      // If voice narration is enabled, speak KAI's response
      if (voiceEnabled && speechAdapter.isSynthesisSupported()) {
        handleSpeakMessage(kaiMsg.content, kaiMsg.id);
      }
    },
    [
      cooldownRemaining,
      consecutiveFlaggedCount,
      mode,
      voiceEnabled,
      handleSpeakMessage,
      handleStopSpeech,
    ]
  );

  const handleResetConversation = useCallback(() => {
    handleStopSpeech();
    setMessages([getGreetingMessage(mode)]);
  }, [mode, handleStopSpeech]);

  const handleToggleKAI = useCallback(() => {
    if (isKAIOpen) {
      handleStopSpeech();
    }
    toggleKAI();
  }, [isKAIOpen, handleStopSpeech, toggleKAI]);

  const handleToggleVoice = useCallback(() => {
    if (voiceEnabled) {
      handleStopSpeech();
    }
    setVoiceEnabled(!voiceEnabled);
  }, [voiceEnabled, handleStopSpeech, setVoiceEnabled]);

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
          ref={triggerBtnRef}
          type="button"
          className={`kai-trigger-btn ${isKAIOpen ? "active" : ""} ${cooldownRemaining > 0 ? "in-cooldown" : ""}`}
          onClick={handleToggleKAI}
          aria-expanded={isKAIOpen}
          aria-controls="kai-dialog-panel"
          aria-label={
            cooldownRemaining > 0
              ? `KAI Assistant in cooldown (${cooldownRemaining}s remaining)`
              : isKAIOpen
              ? "Close KAI Assistant"
              : "Open KAI Assistant guide"
          }
          title={
            cooldownRemaining > 0
              ? `Cooldown active: ${cooldownRemaining}s remaining`
              : isKAIOpen
              ? "Close KAI Assistant"
              : "Open KAI Assistant guide"
          }
        >
          <div className="kai-trigger-icon-wrap">
            {!reducedMotion && !isKAIOpen && cooldownRemaining === 0 && <span className="kai-pulse-ring" />}
            <Sparkles size={16} />
          </div>
          <span className="kai-trigger-label">
            {cooldownRemaining > 0 ? `COOLDOWN ${cooldownRemaining}s` : "KAI GUIDE"}
          </span>
          <span
            className="kai-status-dot"
            style={{ backgroundColor: cooldownRemaining > 0 ? "#f59e0b" : "#34d399" }}
            title={cooldownRemaining > 0 ? `In cooldown (${cooldownRemaining}s)` : "Operational"}
          />
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
              {/* Speaking indicator and instant stop button */}
              {isSpeaking && (
                <div className="kai-speaking-pill" role="status" aria-label="KAI is speaking">
                  <div className="kai-waveform" aria-hidden="true">
                    <span className="kai-waveform-bar" />
                    <span className="kai-waveform-bar" />
                    <span className="kai-waveform-bar" />
                    <span className="kai-waveform-bar" />
                  </div>
                  <button
                    type="button"
                    className="kai-stop-speech-btn"
                    onClick={handleStopSpeech}
                    title="Stop speaking"
                    aria-label="Stop audio narration"
                  >
                    <Square size={9} fill="currentColor" />
                    <span>STOP</span>
                  </button>
                </div>
              )}

              {/* Voice Output Narration Toggle */}
              <button
                type="button"
                className={`kai-header-btn ${voiceEnabled ? "voice-active" : ""}`}
                onClick={handleToggleVoice}
                title={
                  voiceEnabled
                    ? "Mute voice narration (audio guide active)"
                    : "Enable voice narration (audio guide muted)"
                }
                aria-label={
                  voiceEnabled
                    ? "Mute voice narration"
                    : "Enable voice narration"
                }
                aria-pressed={voiceEnabled}
              >
                {voiceEnabled ? (
                  <Volume2 size={15} color="#38bdf8" />
                ) : (
                  <VolumeX size={15} />
                )}
              </button>

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
                onClick={() => {
                  handleStopSpeech();
                  closeKAI();
                }}
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
                onSpeak={handleSpeakMessage}
                isSpeakingThis={activeSpeakingId === msg.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Actions */}
          <QuickActions
            onSelectAction={handleSendMessage}
            customReplies={currentQuickReplies}
          />

          {/* Message Input Footer with Speech Recognition & Cooldown Protection */}
          <AssistantInput
            onSend={handleSendMessage}
            isOpen={isKAIOpen}
            cooldownRemaining={cooldownRemaining}
            cooldownReason={cooldownReason}
          />
        </aside>
      )}
    </div>
  );
}
