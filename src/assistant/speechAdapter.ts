/**
 * KAI HQ — SpeechAdapter (Volume 3 §7.3 Voice Layer)
 * Wraps the Web Speech API (SpeechRecognition and SpeechSynthesis)
 * behind a strict feature-detection boundary.
 *
 * Implements REQ-KAI-003: Progressive enhancement, zero external dependencies,
 * fully optional, client-side only, no recording storage.
 */

// Ambient SpeechRecognition types for browsers supporting the Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: { new (): ISpeechRecognition };
  webkitSpeechRecognition?: { new (): ISpeechRecognition };
}

export type VoiceInputState = "idle" | "listening" | "processing" | "error" | "unsupported";

export interface SpeechRecognitionCallbacks {
  onStateChange: (state: VoiceInputState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
}

class SpeechAdapter {
  private recognitionInstance: ISpeechRecognition | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeSpeakingCallback: (() => void) | null = null;

  /**
   * Feature-detection for SpeechRecognition (Voice-to-Text).
   */
  public isRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    const win = window as unknown as WindowWithSpeech;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  /**
   * Feature-detection for SpeechSynthesis (Text-to-Speech).
   */
  public isSynthesisSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  }

  /**
   * Clean raw markdown, bullet characters, emojis, and URLs before speech synthesis
   * so KAI sounds natural, fluent, and professional.
   */
  public cleanTextForSpeech(raw: string): string {
    if (!raw) return "";

    return (
      raw
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "Code block omitted.")
        .replace(/`([^`]+)`/g, "$1")
        // Remove markdown links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove URLs
        .replace(/https?:\/\/\S+/g, "link")
        // Remove markdown asterisks and hashtags
        .replace(/[*#_~]/g, "")
        // Replace bullets with pauses
        .replace(/^[•\-*]\s+/gm, "")
        .replace(/\n•\s+/g, ". ")
        // Normalize whitespace and newlines into smooth sentence boundaries
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Starts listening for voice input.
   * Feeds transcripts back to the provided callbacks.
   */
  public startListening(callbacks: SpeechRecognitionCallbacks): void {
    if (!this.isRecognitionSupported()) {
      callbacks.onStateChange("unsupported");
      callbacks.onError("Voice input is not supported in this browser. Please use text input.");
      return;
    }

    try {
      this.stopListening();
      const win = window as unknown as WindowWithSpeech;
      const RecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!RecognitionConstructor) {
        callbacks.onStateChange("unsupported");
        return;
      }

      const rec = new RecognitionConstructor();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        callbacks.onStateChange("listening");
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results.item(i);
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (final) {
          callbacks.onStateChange("processing");
          callbacks.onTranscript(final.trim(), true);
        } else if (interim) {
          callbacks.onTranscript(interim.trim(), false);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        callbacks.onStateChange("error");
        let msg = "Voice capture failed.";

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          msg = "Microphone access was denied. You can continue typing in the console.";
        } else if (event.error === "no-speech") {
          msg = "No speech detected. Please tap the microphone and try again.";
        } else if (event.error === "network") {
          msg = "Voice network services unavailable. Please use text input.";
        }

        callbacks.onError(msg);
      };

      rec.onend = () => {
        callbacks.onStateChange("idle");
        this.recognitionInstance = null;
      };

      this.recognitionInstance = rec;
      rec.start();
    } catch {
      callbacks.onStateChange("error");
      callbacks.onError("Unable to initialize microphone input.");
      this.recognitionInstance = null;
    }
  }

  /**
   * Stops the active speech recognition instance if running.
   */
  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // Ignore if already stopped
      }
      this.recognitionInstance = null;
    }
  }

  /**
   * Speaks the provided text via Web Speech API Synthesis.
   * Cancels any previously active speech to ensure speech output never overlaps.
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: Error) => void
  ): void {
    if (!this.isSynthesisSupported()) {
      return;
    }

    try {
      this.stopSpeaking();

      const cleaned = this.cleanTextForSpeech(text);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice =
          voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) ||
          voices.find((v) => v.lang.startsWith("en"));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.activeSpeakingCallback = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (ev) => {
        this.currentUtterance = null;
        this.activeSpeakingCallback = null;
        if (ev.error !== "canceled" && ev.error !== "interrupted") {
          if (onError) onError(new Error(`Speech synthesis error: ${ev.error}`));
        }
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.activeSpeakingCallback = onEnd || null;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (onError && err instanceof Error) onError(err);
    }
  }

  /**
   * Immediately terminates active speech synthesis playback.
   */
  public stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe catch
      }
    }
    if (this.activeSpeakingCallback) {
      this.activeSpeakingCallback();
      this.activeSpeakingCallback = null;
    }
    this.currentUtterance = null;
  }

  /**
   * Checks if synthesis is actively speaking.
   */
  public isSpeaking(): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }
    return Boolean(window.speechSynthesis.speaking || this.currentUtterance);
  }
}

export const speechAdapter = new SpeechAdapter();
