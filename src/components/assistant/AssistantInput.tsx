import { useState, useRef, useEffect, memo } from "react";
import { Send } from "lucide-react";

interface AssistantInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isOpen?: boolean;
}

function AssistantInput({ onSend, disabled, isOpen }: AssistantInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <footer className="kai-panel-footer">
      <form className="kai-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="kai-text-input"
          placeholder="Ask KAI about projects, skills, history..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          aria-label="Ask KAI a question or type a command"
        />
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
