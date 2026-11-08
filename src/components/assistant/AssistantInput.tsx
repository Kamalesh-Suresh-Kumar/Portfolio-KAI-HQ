import { useState, useRef, useEffect, memo } from "react";
import { Send, Mic, MicOff, AlertCircle, X, Info } from "lucide-react";
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
    if (voiceState !== "listening") return;
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        speechAdapter.abortListening();
        setVoiceState("idle");
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [voiceState]);

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

  const handleToggleVoice = () => {
    if (voiceState === "listening") {
      speechAdapter.abortListening();
      setVoiceState("idle");
      return;
    }

    setVoiceError(null);
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
