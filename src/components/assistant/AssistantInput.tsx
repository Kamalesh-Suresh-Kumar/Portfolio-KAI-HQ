import { useState, useRef, useEffect, memo } from "react";
import { Send, Mic, MicOff, AlertCircle, X, Info, ShieldAlert } from "lucide-react";
import { speechAdapter, type VoiceInputState } from "../../assistant/speechAdapter";

interface AssistantInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isOpen?: boolean;
}

function AssistantInput({ onSend, disabled, isOpen }: AssistantInputProps) {
  const [text, setText] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVoiceSupported = speechAdapter.isRecognitionSupported();
  const privacyInfo = speechAdapter.getRecognitionPrivacyInfo();

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  // Clean up speech recognition on unmount immediately discarding any pending transcripts
  useEffect(() => {
    return () => {
      speechAdapter.abortListening();
    };
  }, []);

  // Global Escape key listener while listening to abort capture immediately
  useEffect(() => {
    if (voiceState !== "listening" && !showConsentPrompt) return;
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConsentPrompt) {
          setShowConsentPrompt(false);
        } else {
          speechAdapter.abortListening();
          setVoiceState("idle");
        }
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [voiceState, showConsentPrompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    if (voiceState === "listening") {
      speechAdapter.stopListening();
      setVoiceState("idle");
    }

    onSend(trimmed);
    setText("");
    setVoiceError(null);
  };

  const initiateListening = () => {
    speechAdapter.startListening({
      onStateChange: (state) => {
        setVoiceState(state);
      },
      onTranscript: (transcript, isFinal) => {
        setText(transcript);
        if (isFinal && transcript.trim()) {
          onSend(transcript.trim());
          setText("");
          setVoiceState("idle");
        }
      },
      onError: (errMsg) => {
        setVoiceError(errMsg);
        setVoiceState("error");
      },
    });
  };

  const handleToggleVoice = () => {
    if (voiceState === "listening") {
      speechAdapter.abortListening();
      setVoiceState("idle");
      return;
    }

    setVoiceError(null);

    const privacyMode = speechAdapter.getRecognitionPrivacyMode();
    // If browser-managed cloud recognition requires visitor consent, prompt first!
    if (privacyMode === "browser-managed-consent-required") {
      setShowConsentPrompt(true);
      return;
    }

    initiateListening();
  };

  const handleGrantConsent = () => {
    speechAdapter.setBrowserManagedConsent(true);
    setShowConsentPrompt(false);
    initiateListening();
  };

  const handleDeclineConsent = () => {
    speechAdapter.setBrowserManagedConsent(false);
    setShowConsentPrompt(false);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && voiceState === "listening") {
      e.stopPropagation();
      speechAdapter.abortListening();
      setVoiceState("idle");
    }
  };

  const isListening = voiceState === "listening";

  return (
    <footer className="kai-panel-footer">
      <span className="sr-only" role="status" aria-live="polite">
        {isListening
          ? `Voice input active. ${privacyInfo.disclosure} Press Escape to cancel.`
          : ""}
      </span>

      {showConsentPrompt && (
        <div
          className="kai-consent-dialog"
          role="region"
          aria-labelledby="kai-consent-title"
        >
          <div className="kai-consent-header">
            <ShieldAlert size={14} />
            <span id="kai-consent-title">BROWSER VOICE PROCESSING NOTICE</span>
          </div>
          <p className="kai-consent-desc">
            Your browser uses cloud-assisted speech recognition. Microphone audio may be processed by your browser vendor&apos;s speech service (such as Google or Apple). KAI HQ never records or stores your audio. Do you consent to proceed with browser-managed recognition?
          </p>
          <div className="kai-consent-actions">
            <button
              type="button"
              className="kai-consent-btn-allow"
              onClick={handleGrantConsent}
            >
              Consent &amp; Enable
            </button>
            <button
              type="button"
              className="kai-consent-btn-decline"
              onClick={handleDeclineConsent}
            >
              Decline (Keep Typing)
            </button>
          </div>
        </div>
      )}

      {isListening && (
        <div className="kai-voice-info" role="status" aria-live="polite">
          <Info size={13} style={{ flexShrink: 0 }} />
          <span>{privacyInfo.disclosure} [ESC] to cancel.</span>
        </div>
      )}

      {voiceError && (
        <div className="kai-voice-notice" role="alert" aria-live="assertive">
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span>{voiceError}</span>
          <button
            type="button"
            className="kai-voice-notice-close"
            onClick={() => setVoiceError(null)}
            aria-label="Dismiss message"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form className="kai-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="kai-text-input"
          onKeyDown={handleInputKeyDown}
          placeholder={
            isListening
              ? "Listening... speak query now..."
              : "Ask KAI about projects, skills, history..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          aria-label="Ask KAI a question or type a command"
        />

        {/* Microphone Button (Web Speech API) */}
        <button
          type="button"
          className={`kai-mic-btn ${isListening ? "kai-mic-listening active" : ""}`}
          onClick={handleToggleVoice}
          disabled={disabled || !isVoiceSupported}
          title={
            !isVoiceSupported
              ? "Voice input is not supported in this browser; typing is available"
              : isListening
              ? "Stop listening"
              : `Ask via voice (${privacyInfo.isLocalOnly ? "On-device processing" : "Browser Web Speech service"})`
          }
          aria-label={
            !isVoiceSupported
              ? "Voice input not supported"
              : isListening
              ? "Stop voice input"
              : `Start voice input (${privacyInfo.isLocalOnly ? "On-device processing" : "Browser Web Speech service"})`
          }
          aria-pressed={isListening}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="kai-send-btn"
          disabled={!text.trim() || disabled}
          aria-label="Send message to KAI"
        >
          <Send size={15} />
        </button>
      </form>
    </footer>
  );
}

export default memo(AssistantInput);
