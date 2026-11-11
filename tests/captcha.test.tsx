import React, { forwardRef, useImperativeHandle, createElement } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TransmissionForm from "../src/rooms/CommunicationCenter/TransmissionForm";
import { HCAPTCHA_CONFIG } from "../src/config/captchaConfig";
import { ExperienceEngineProvider } from "../src/experience-engine/ExperienceEngineProvider";

interface MockCaptchaProps {
  sitekey: string;
  theme?: string;
  reCaptchaCompat?: boolean;
  onVerify?: (token: string, ekey?: string) => void;
  onExpire?: () => void;
  onError?: (event?: string) => void;
}

interface MockCaptchaHandle {
  resetCaptcha: () => void;
}

// Controllable mock for @hcaptcha/react-hcaptcha
const mockResetCaptcha = vi.fn();
let lastMountedProps: MockCaptchaProps | null = null;

vi.mock("@hcaptcha/react-hcaptcha", () => {
  const MockHCaptchaComponent = forwardRef<MockCaptchaHandle, MockCaptchaProps>((props, ref) => {
    lastMountedProps = props;
    useImperativeHandle(ref, () => ({
      resetCaptcha: mockResetCaptcha,
    }));
    return createElement("div", {
      "data-testid": "mock-hcaptcha-widget",
      "data-sitekey": props.sitekey,
      "data-theme": props.theme,
      "data-recaptchacompat": String(props.reCaptchaCompat),
      onClick: () => props.onVerify?.("mock-token-payload-xyz", "mock-ekey"),
    });
  });
  return {
    default: MockHCaptchaComponent,
  };
});

function renderWithEngine(ui: React.ReactElement) {
  return render(<ExperienceEngineProvider>{ui}</ExperienceEngineProvider>);
}

describe("KAI HQ — Web3Forms hCaptcha Integration Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    lastMountedProps = null;
    (import.meta.env as Record<string, string>).VITE_WEB3FORMS_ACCESS_KEY = "mock-test-access-key-12345";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("1. Configuration & Staged Activation Defaults", () => {
    it("exports public sitekey and staged disabled flag in HCAPTCHA_CONFIG", () => {
      expect(HCAPTCHA_CONFIG.siteKey).toBe("50b2fe65-b00b-4b9e-ad62-3ba471098be2");
      expect(HCAPTCHA_CONFIG.enabled).toBe(false); // Must be false until dashboard activation
    });

    it("does not render hCaptcha widget by default when captchaEnabled is false", () => {
      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);
      expect(screen.queryByTestId("mock-hcaptcha-widget")).toBeNull();
    });

    it("does not include h-captcha-response in payload when captcha is inactive", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "OK" }),
      });
      globalThis.fetch = fetchMock;

      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={false} />
      );

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Visitor" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "visitor@test.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "General Enquiry" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "Testing transmission without captcha token requirement." },
      });

      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      expect(submitBtn).not.toBeDisabled();
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(payload["h-captcha-response"]).toBeUndefined();
    });
  });

  describe("2. Active Verification Enforcement (captchaEnabled = true)", () => {
    it("renders hCaptcha widget with correct sitekey, theme, and reCaptchaCompat=false", () => {
      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      const widget = screen.getByTestId("mock-hcaptcha-widget");
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveAttribute("data-sitekey", "50b2fe65-b00b-4b9e-ad62-3ba471098be2");
      expect(widget).toHaveAttribute("data-theme", "dark");
      expect(widget).toHaveAttribute("data-recaptchacompat", "false");
    });

    it("disables submit button until captcha token is verified", () => {
      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Visitor" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "visitor@test.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "General Enquiry" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "Checking button disabled state before verification challenge." },
      });

      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      expect(submitBtn).toBeDisabled();
    });

    it("enables submit button and includes token in payload after onVerify", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "OK" }),
      });
      globalThis.fetch = fetchMock;

      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Verified Sender" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "verified@test.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "Project Collaboration" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "Payload containing verified hCaptcha response token." },
      });

      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      expect(submitBtn).toBeDisabled();

      // Trigger verification callback via mock widget inside act
      act(() => {
        lastMountedProps?.onVerify?.("verified-hcaptcha-token-98765");
      });

      // Submit button should now be enabled
      expect(submitBtn).not.toBeDisabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(payload["h-captcha-response"]).toBe("verified-hcaptcha-token-98765");
      expect(payload.name).toBe("Verified Sender");

      // Verify widget was reset after submission
      expect(mockResetCaptcha).toHaveBeenCalled();
    });

    it("handles onExpire by invalidating token and disabling submit button", () => {
      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      // Verify token first
      act(() => {
        lastMountedProps?.onVerify?.("temporary-token");
      });
      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      expect(submitBtn).not.toBeDisabled();

      // Token expires
      act(() => {
        lastMountedProps?.onExpire?.();
      });
      expect(submitBtn).toBeDisabled();
    });

    it("handles onError by displaying accessible error message and clearing token", () => {
      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      // Trigger error callback
      act(() => {
        lastMountedProps?.onError?.("network-error");
      });

      const alertMsg = screen.getByRole("alert");
      expect(alertMsg).toBeInTheDocument();
      expect(alertMsg).toHaveTextContent("Verification challenge encountered an error. Please retry.");

      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      expect(submitBtn).toBeDisabled();
    });

    it("resets captcha and preserves form values on transmission error", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, message: "Server temporary failure" }),
      });
      globalThis.fetch = fetchMock;

      renderWithEngine(
        <TransmissionForm recipientEmail="kamalesh.sde@gmail.com" captchaEnabled={true} />
      );

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Retrying User" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "retry@test.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "Internship" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "This message should be preserved even if transmission gateway fails." },
      });

      // Verify
      act(() => {
        lastMountedProps?.onVerify?.("single-use-token-to-be-consumed");
      });
      const submitBtn = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getAllByText(/Transmission Failed/i).length).toBeGreaterThan(0);
      });

      // Form values preserved
      expect((screen.getByLabelText(/Your Name \/ Organization/i) as HTMLInputElement).value).toBe("Retrying User");

      // Captcha reset
      expect(mockResetCaptcha).toHaveBeenCalled();

      // Submit button is disabled again because single-use token was consumed
      expect(screen.getByRole("button", { name: /Transmit Message via Web3Forms/i })).toBeDisabled();
    });
  });
});
