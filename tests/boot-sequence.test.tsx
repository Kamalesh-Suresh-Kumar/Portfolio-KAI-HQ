import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import BootSequence from "../src/components/system-feedback/BootSequence";
import {
  BOOT_SEQUENCE_DURATION_MS,
  BOOT_COMPLETION_HOLD_MS,
  BOOT_EXIT_TRANSITION_MS,
} from "../src/components/system-feedback/bootConfig";
import HeadquartersShell from "../src/app/HeadquartersShell";
import { ExperienceEngineProvider } from "../src/experience-engine";

// Mock scrollIntoView for JSDOM when mounting HeadquartersShell -> Assistant/Layout
if (typeof window !== "undefined" && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? reducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("KAI HQ — Boot Sequence & Power On Timing Suite", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  describe("1. Normal First-Visit Boot Timing (~7 Seconds)", () => {
    it("configures boot duration within the 5-9 second readable range at 7000ms", () => {
      expect(BOOT_SEQUENCE_DURATION_MS).toBe(7000);
      expect(BOOT_SEQUENCE_DURATION_MS).toBeGreaterThanOrEqual(5000);
      expect(BOOT_SEQUENCE_DURATION_MS).toBeLessThanOrEqual(9000);
    });

    it("progresses through diagnostic milestones and completes after ~7 seconds (not at 1.8s)", () => {
      const onComplete = vi.fn();
      render(<BootSequence onComplete={onComplete} reducedMotion={false} />);

      const dialog = screen.getByRole("dialog", {
        name: "KAI HQ Headquarters Power On Sequence",
      });
      expect(dialog).toBeInTheDocument();

      // Advance past the legacy 1.8s mark and verify boot is still active
      act(() => {
        vi.advanceTimersByTime(1850);
      });
      expect(onComplete).not.toHaveBeenCalled();

      const progressBarMidEarly = screen.getByRole("progressbar");
      const midEarlyVal = Number(progressBarMidEarly.getAttribute("aria-valuenow"));
      expect(midEarlyVal).toBeGreaterThanOrEqual(20);
      expect(midEarlyVal).toBeLessThan(50);

      // Advance to ~3.6s (~51% progress)
      act(() => {
        vi.advanceTimersByTime(1750);
      });
      expect(onComplete).not.toHaveBeenCalled();
      expect(Number(screen.getByRole("progressbar").getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(50);

      // Advance to just before 7000ms completion hold/exit
      act(() => {
        vi.advanceTimersByTime(3350);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Advance through full 7000ms + 150ms hold + 250ms exit transition
      act(() => {
        vi.advanceTimersByTime(50 + BOOT_COMPLETION_HOLD_MS + BOOT_EXIT_TRANSITION_MS + 50);
      });

      expect(Number(screen.getByRole("progressbar").getAttribute("aria-valuenow"))).toBe(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("2. Skip & Keyboard Interaction Mechanics", () => {
    it("dismisses immediately on Skip button click and restores focus to #main-content", () => {
      const onComplete = vi.fn();
      render(
        <div>
          <main id="main-content" tabIndex={-1}>
            Headquarters Content
          </main>
          <BootSequence onComplete={onComplete} reducedMotion={false} />
        </div>
      );

      const skipBtn = screen.getByRole("button", {
        name: /Skip initialization sequence/i,
      });
      expect(skipBtn).toHaveFocus();

      fireEvent.click(skipBtn);
      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(document.getElementById("main-content")).toHaveFocus();
    });

    it("dismisses cleanly when pressing Escape key", () => {
      const onComplete = vi.fn();
      render(<BootSequence onComplete={onComplete} reducedMotion={false} />);

      fireEvent.keyDown(window, { key: "Escape" });

      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("dismisses on click on backdrop, while clicks inside terminal dialog do not skip", () => {
      const onComplete = vi.fn();
      const { container } = render(
        <BootSequence onComplete={onComplete} reducedMotion={false} />
      );

      const terminal = container.querySelector(".kai-boot-terminal") as HTMLElement;
      expect(terminal).not.toBeNull();

      // Clicking inside the terminal must not trigger skip due to stopPropagation
      fireEvent.click(terminal);
      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Clicking the outer backdrop triggers immediate skip
      const backdrop = container.querySelector(".kai-boot-backdrop") as HTMLElement;
      fireEvent.click(backdrop);
      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("protects active typing in input/textarea from accidental Space/Enter skip while allowing Escape", () => {
      const onComplete = vi.fn();
      render(
        <div>
          <input aria-label="Test text input" />
          <BootSequence onComplete={onComplete} reducedMotion={false} />
        </div>
      );

      const input = screen.getByLabelText("Test text input");
      input.focus();

      fireEvent.keyDown(window, { key: " " });
      fireEvent.keyDown(window, { key: "Enter" });
      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Pressing Escape still dismisses even while focused in an input
      fireEvent.keyDown(window, { key: "Escape" });
      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("allows Space/Enter skip when focus is on non-input element outside Skip button", () => {
      const onComplete = vi.fn();
      render(<BootSequence onComplete={onComplete} reducedMotion={false} />);

      const skipBtn = screen.getByRole("button", {
        name: /Skip initialization sequence/i,
      });
      skipBtn.blur();

      fireEvent.keyDown(window, { key: " " });
      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("3. Reduced Motion, Session Persistence & Deep-Link Bypass", () => {
    it("bypasses boot sequence in 0ms when reducedMotion prop is true", () => {
      const onComplete = vi.fn();
      const { container } = render(
        <BootSequence onComplete={onComplete} reducedMotion={true} />
      );

      expect(container.querySelector(".kai-boot-backdrop")).toBeNull();

      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("shows boot sequence on first Lobby visit, persists sessionStorage, and unmounts on skip", () => {
      render(
        <ExperienceEngineProvider>
          <HeadquartersShell />
        </ExperienceEngineProvider>
      );

      expect(
        screen.getByRole("dialog", { name: "KAI HQ Headquarters Power On Sequence" })
      ).toBeInTheDocument();
      expect(sessionStorage.getItem("kai_hq_booted")).toBeNull();

      const skipBtn = screen.getByRole("button", {
        name: /Skip initialization sequence/i,
      });
      fireEvent.click(skipBtn);

      act(() => {
        vi.advanceTimersByTime(BOOT_EXIT_TRANSITION_MS);
      });

      expect(sessionStorage.getItem("kai_hq_booted")).toBe("true");
      expect(
        screen.queryByRole("dialog", { name: "KAI HQ Headquarters Power On Sequence" })
      ).toBeNull();
    });

    it("bypasses boot sequence for returning visitors in the same session", () => {
      sessionStorage.setItem("kai_hq_booted", "true");

      render(
        <ExperienceEngineProvider>
          <HeadquartersShell />
        </ExperienceEngineProvider>
      );

      expect(
        screen.queryByRole("dialog", { name: "KAI HQ Headquarters Power On Sequence" })
      ).toBeNull();
    });

    it("bypasses boot sequence when prefers-reduced-motion OS setting is active", () => {
      mockMatchMedia(true);

      render(
        <ExperienceEngineProvider>
          <HeadquartersShell />
        </ExperienceEngineProvider>
      );

      expect(
        screen.queryByRole("dialog", { name: "KAI HQ Headquarters Power On Sequence" })
      ).toBeNull();
    });

    it("bypasses boot sequence when entering directly via a deep link to a facility room", () => {
      window.history.replaceState(null, "", "/engineering-laboratory");

      render(
        <ExperienceEngineProvider>
          <HeadquartersShell />
        </ExperienceEngineProvider>
      );

      expect(
        screen.queryByRole("dialog", { name: "KAI HQ Headquarters Power On Sequence" })
      ).toBeNull();
      expect(
        screen.getAllByRole("heading", { name: "Engineering Laboratory" }).length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("4. Timer, Animation Frame & Event Listener Cleanup", () => {
    it("cleans up timeouts, animation frames, and keydown listeners on unmount without calling onComplete", () => {
      const addListenerSpy = vi.spyOn(window, "addEventListener");
      const removeListenerSpy = vi.spyOn(window, "removeEventListener");
      const cancelRafSpy = vi.spyOn(window, "cancelAnimationFrame");

      const onComplete = vi.fn();
      const { unmount } = render(
        <BootSequence onComplete={onComplete} reducedMotion={false} />
      );

      // Verify keydown listener was attached
      const keydownAttach = addListenerSpy.mock.calls.find(
        ([event]) => event === "keydown"
      );
      expect(keydownAttach).toBeDefined();

      // Trigger skip to schedule exit timeout, then unmount before exit timeout fires
      fireEvent.keyDown(window, { key: "Escape" });
      unmount();

      // Keydown listener removed and RAF canceled
      const keydownRemove = removeListenerSpy.mock.calls.find(
        ([event]) => event === "keydown"
      );
      expect(keydownRemove).toBeDefined();
      expect(cancelRafSpy).toHaveBeenCalled();

      // Advancing timers after unmount must NOT invoke onComplete
      act(() => {
        vi.advanceTimersByTime(BOOT_SEQUENCE_DURATION_MS + 1000);
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("clears pending completion hold timer if unmounted right after reaching 100%", () => {
      const onComplete = vi.fn();
      const { unmount } = render(
        <BootSequence onComplete={onComplete} reducedMotion={false} />
      );

      // Advance right to 7000ms where progress hits 100% and schedules completion hold timer
      act(() => {
        vi.advanceTimersByTime(BOOT_SEQUENCE_DURATION_MS + 20);
      });
      expect(onComplete).not.toHaveBeenCalled();

      unmount();

      act(() => {
        vi.advanceTimersByTime(BOOT_COMPLETION_HOLD_MS + BOOT_EXIT_TRANSITION_MS + 100);
      });
      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
