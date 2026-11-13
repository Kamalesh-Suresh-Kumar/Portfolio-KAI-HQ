import { useState, useEffect, useCallback, useRef } from "react";
import { Terminal, Shield, FastForward } from "lucide-react";
import {
  BOOT_SEQUENCE_DURATION_MS,
  BOOT_COMPLETION_HOLD_MS,
  BOOT_EXIT_TRANSITION_MS,
} from "./bootConfig";
import "./boot-sequence.css";

interface BootSequenceProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

interface BootStep {
  id: string;
  code: string;
  text: string;
  detail: string;
  minProgress: number;
}

const BOOT_STEPS: BootStep[] = [
  {
    id: "step-1",
    code: "NET_INIT",
    text: "Establishing Secure Gateway Connection",
    detail: "Latency: <10ms | Protocol: HTTP/2 Static SPA",
    minProgress: 20,
  },
  {
    id: "step-2",
    code: "DATA_SYNC",
    text: "Mounting In-Memory Knowledge Engine",
    detail: "4 Projects | 20 Skills | 4 Resumes | 5 Credentials",
    minProgress: 50,
  },
  {
    id: "step-3",
    code: "FACILITY_MOUNT",
    text: "Initializing 8 Engineering Facilities",
    detail: "Spatial Router: Active | History API: Engaged",
    minProgress: 80,
  },
  {
    id: "step-4",
    code: "KAI_READY",
    text: "KAI Intelligence Guide Operational",
    detail: "Deterministic Pattern Router | Web Speech Layer Ready",
    minProgress: 100,
  },
];

export default function BootSequence({ onComplete, reducedMotion = false }: BootSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const hasFinishedRef = useRef(false);
  const isMountedRef = useRef(true);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mount lifecycle and clean up any pending timeouts on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      hasFinishedRef.current = false;
      if (completionTimerRef.current !== null) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
      if (exitTimerRef.current !== null) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, []);

  // Complete and unmount with subtle transition
  const finishSequence = useCallback(() => {
    if (hasFinishedRef.current || !isMountedRef.current) return;
    hasFinishedRef.current = true;

    if (completionTimerRef.current !== null) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      if (!isMountedRef.current) return;
      onComplete();
      // Restore focus to the main landmark for seamless keyboard navigation
      if (typeof document !== "undefined") {
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
        }
      }
    }, reducedMotion ? 0 : BOOT_EXIT_TRANSITION_MS);
  }, [onComplete, reducedMotion]);

  // Reduced motion bypasses sequence immediately per REQ-ACC-002
  useEffect(() => {
    if (reducedMotion) {
      finishSequence();
    }
  }, [reducedMotion, finishSequence]);

  // Focus skip button on mount for accessibility
  useEffect(() => {
    if (!reducedMotion) {
      skipBtnRef.current?.focus();
    }
  }, [reducedMotion]);

  // Keyboard skip listener: Escape predictability, Space/Enter only when appropriate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable);

      // Escape always dismisses the sequence cleanly
      if (e.key === "Escape") {
        e.preventDefault();
        finishSequence();
        return;
      }

      // Space and Enter should only dismiss if not typing and not already handled by a focused button
      if (!isInput && (e.key === "Enter" || e.key === " ")) {
        if (activeEl === skipBtnRef.current) {
          // Native button click handles invocation
          return;
        }
        e.preventDefault();
        finishSequence();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finishSequence]);

  // Deterministic timed sequence: 0 to 100% in BOOT_SEQUENCE_DURATION_MS (7.0 seconds)
  useEffect(() => {
    if (reducedMotion) return;

    const startTime = performance.now();
    const duration = BOOT_SEQUENCE_DURATION_MS;

    let frameId: number | null = null;

    const tick = (now: number) => {
      if (!isMountedRef.current || hasFinishedRef.current) return;

      const elapsed = Math.max(0, now - startTime);
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        frameId = null;
        completionTimerRef.current = setTimeout(() => {
          completionTimerRef.current = null;
          finishSequence();
        }, BOOT_COMPLETION_HOLD_MS);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (completionTimerRef.current !== null) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, [reducedMotion, finishSequence]);

  if (reducedMotion) return null;

  return (
    <div
      className={`kai-boot-backdrop ${isExiting ? "exiting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="KAI HQ Headquarters Power On Sequence"
      onClick={finishSequence}
    >
      <div
        className="kai-boot-terminal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <header className="kai-boot-header">
          <div className="kai-boot-header-title">
            <Terminal size={16} color="#38bdf8" />
            <span>KAI HQ // SYSTEM INITIALIZATION</span>
          </div>
          <button
            ref={skipBtnRef}
            type="button"
            className="kai-boot-skip-btn"
            onClick={finishSequence}
            aria-label="Skip initialization sequence and enter headquarters immediately"
            title="Press Escape to skip"
          >
            <span>SKIP [ESC]</span>
            <FastForward size={14} />
          </button>
        </header>

        {/* Progress Display */}
        <div className="kai-boot-progress-section">
          <div className="kai-boot-progress-meta">
            <span className="kai-boot-meta-label">SYS_POWER_ON // BOOT_PROGRESS</span>
            <span className="kai-boot-meta-pct">{progress}%</span>
          </div>
          <div
            className="kai-boot-progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Headquarters initialization progress"
          >
            <div
              className="kai-boot-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Boot Steps */}
        <div className="kai-boot-steps-list" role="status" aria-live="polite">
          {BOOT_STEPS.map((step) => {
            const isCompleted = progress >= step.minProgress;
            const isCurrent = progress < step.minProgress && progress >= step.minProgress - 25;

            return (
              <div
                key={step.id}
                className={`kai-boot-step-item ${isCompleted ? "completed" : ""} ${
                  isCurrent ? "current" : ""
                }`}
              >
                <div className="kai-boot-step-marker">
                  {isCompleted ? (
                    <span className="kai-boot-ok">●</span>
                  ) : isCurrent ? (
                    <span className="kai-boot-active">▶</span>
                  ) : (
                    <span className="kai-boot-pending">○</span>
                  )}
                </div>
                <div className="kai-boot-step-info">
                  <div className="kai-boot-step-main">
                    <span className="kai-boot-step-code">[{step.code}]</span>
                    <span className="kai-boot-step-text">{step.text}</span>
                  </div>
                  <span className="kai-boot-step-detail">{step.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hardware & Security Disclaimer */}
        <footer className="kai-boot-footer">
          <div className="kai-boot-footer-secure">
            <Shield size={12} color="#34d399" />
            <span>AUTHENTICATED CLIENT-SIDE OPERATING SYSTEM</span>
          </div>
          <span className="kai-boot-footer-hint">TAP SCREEN OR PRESS ESC TO ENTER IMMEDIATELY</span>
        </footer>
      </div>
    </div>
  );
}
