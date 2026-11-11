import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePhotoViewer from "../src/rooms/Lobby/ProfilePhotoViewer";
import Header from "../src/components/navigation/Header";
import NotificationToast from "../src/components/common/NotificationToast";
import TransmissionForm from "../src/rooms/CommunicationCenter/TransmissionForm";
import CommunicationCenter from "../src/rooms/CommunicationCenter/CommunicationCenter";
import { routeIntent } from "../src/assistant/intentRouter";
import { generateAssistantResponse } from "../src/assistant/responseTemplates";
import { knowledgeEngine } from "../src/knowledge-engine";
import Assistant from "../src/components/assistant/Assistant";
import { ExperienceEngineProvider } from "../src/experience-engine/ExperienceEngineProvider";

// Mock scrollIntoView for JSDOM
if (typeof window !== "undefined" && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

function renderWithEngine(ui: React.ReactElement) {
  return render(<ExperienceEngineProvider>{ui}</ExperienceEngineProvider>);
}

describe("KAI HQ Feature Enhancement Batch Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (import.meta.env as Record<string, string>).VITE_WEB3FORMS_ACCESS_KEY = "test-access-key-123";
  });

  describe("Feature 1: Profile Photo Viewer (Modal & Lightbox)", () => {
    it("renders modal dialog with accessible attributes, controls, and zoom levels", () => {
      const handleClose = vi.fn();
      renderWithEngine(<ProfilePhotoViewer isOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole("dialog", { name: "Full-Size Profile Photograph Viewer" });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const img = screen.getByAltText("Kamalesh Suresh Kumar — Original High Resolution Profile Photograph");
      expect(img).toBeInTheDocument();
      expect(img.getAttribute("src")).toContain("Kamalesh_S_P_bc8ac915.png");

      const zoomInBtn = screen.getByRole("button", { name: "Zoom in photograph" });
      const zoomOutBtn = screen.getByRole("button", { name: "Zoom out photograph" });
      const resetBtn = screen.getByRole("button", { name: "Reset zoom and center photograph" });
      const closeBtn = screen.getByRole("button", { name: "Close photograph viewer" });

      expect(zoomInBtn).toBeInTheDocument();
      expect(zoomOutBtn).toBeInTheDocument();
      expect(resetBtn).toBeInTheDocument();
      expect(closeBtn).toBeInTheDocument();

      // Zoom In increases scale
      fireEvent.click(zoomInBtn);
      expect(screen.getByText("150%")).toBeInTheDocument();

      // Zoom Out decreases scale
      fireEvent.click(zoomOutBtn);
      expect(screen.getByText("100%")).toBeInTheDocument();

      // Reset
      fireEvent.click(zoomInBtn);
      fireEvent.click(zoomInBtn);
      expect(screen.getByText("200%")).toBeInTheDocument();
      fireEvent.click(resetBtn);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("dismisses on Escape key press", () => {
      const handleClose = vi.fn();
      renderWithEngine(<ProfilePhotoViewer isOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("dismisses when clicking the backdrop", () => {
      const handleClose = vi.fn();
      renderWithEngine(<ProfilePhotoViewer isOpen={true} onClose={handleClose} />);

      const backdrop = document.querySelector(".profile-viewer-backdrop");
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not render when isOpen is false", () => {
      const handleClose = vi.fn();
      renderWithEngine(<ProfilePhotoViewer isOpen={false} onClose={handleClose} />);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("Feature 2: KAI Assistant Intent Recognition & Natural Variations", () => {
    it("recognizes questions about Kamalesh and creator", () => {
      const queries = [
        "who is kamalesh",
        "who is the creator",
        "who created kai",
        "who created kai hq",
        "who built this portfolio",
        "tell me about the developer",
        "who made kai hq",
        "who made this portfolio",
        "tell me about kamalesh",
        "introduce kamalesh",
        "tell me about your creator",
        "can you introduce the developer",
        "tell me about the person behind this website",
        "who designed this portfolio",
        "who programmed kai hq",
        "who is kamalsh",
      ];

      for (const q of queries) {
        const route = routeIntent(q);
        expect(route.intent).toBe("creator");
      }
    });

    it("recognizes questions about KAI and KAI HQ", () => {
      const queries = [
        "what is kai",
        "what is kai hq",
        "who is kai",
        "tell me about kai",
        "what does kai do",
        "what does kai stand for",
        "what is this place",
        "explain kai",
        "who are you",
        "introduce yourself",
      ];

      for (const q of queries) {
        const route = routeIntent(q);
        expect(route.intent).toBe("about_kai");
      }
    });

    it("handles common spelling mistakes and typos across portfolio domains", () => {
      expect(routeIntent("tell me abot the prjcts").intent).toBe("projects");
      expect(routeIntent("what skilss do u have").intent).toBe("skills");
      expect(routeIntent("experiance and career milestones").intent).toBe("timeline");
      expect(routeIntent("show achivements and certifcates").intent).toBe("achievements");
      expect(routeIntent("download curriculam cv resum").intent).toBe("resumes");
      expect(routeIntent("reachout contect email").intent).toBe("contact");
    });

    it("generates grounded responses for creator across visitor personas", () => {
      const contact = knowledgeEngine.getContact();

      // Neutral mode
      const respNeutral = generateAssistantResponse({ intent: "creator", rawQuery: "who is kamalesh" }, "neutral");
      expect(respNeutral.content).toContain(contact.name);
      expect(respNeutral.content).toContain(contact.title);

      // Recruiter mode
      const respRecruiter = generateAssistantResponse({ intent: "creator", rawQuery: "who is kamalesh" }, "recruiter");
      expect(respRecruiter.content).toContain(contact.availability);
      expect(respRecruiter.content).toContain(contact.location);

      // Developer mode
      const respDev = generateAssistantResponse({ intent: "creator", rawQuery: "who is kamalesh" }, "developer");
      expect(respDev.content).toContain("React 19");
      expect(respDev.content).toContain("Engineering Laboratory");
    });

    it("generates grounded responses for about_kai across visitor personas", () => {
      const resp = generateAssistantResponse({ intent: "about_kai", rawQuery: "what is kai hq" }, "neutral");
      expect(resp.content).toContain("Kamalesh Artificial Intelligence");
      expect(resp.content).toContain("Knowledge Engine");
    });

    it("politely handles unknown questions and offers room navigation", () => {
      const resp = generateAssistantResponse({ intent: "unknown", rawQuery: "random query unrelated to anything" }, "neutral");
      expect(resp.content.toLowerCase()).toContain("i do not have enough specific information");
      expect(resp.actions?.length).toBeGreaterThan(0);
    });
  });

  describe("Feature 4 & 6: Communication Center Web3Forms Transmission & Disclaimer", () => {
    it("renders required form controls, select options, and character counter", () => {
      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      expect(screen.getByLabelText(/Your Name \/ Organization/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Return Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message Payload/i)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 5000 characters/i)).toBeInTheDocument();

      // Check subject options
      const select = screen.getByLabelText(/Subject Category/i) as HTMLSelectElement;
      expect(select.options.length).toBe(6); // default placeholder + 5 options
      expect(screen.getByText("Internship")).toBeInTheDocument();
      expect(screen.getByText("Job Opportunity")).toBeInTheDocument();
      expect(screen.getByText("Project Collaboration")).toBeInTheDocument();
      expect(screen.getByText("General Enquiry")).toBeInTheDocument();
      expect(screen.getByText("Others")).toBeInTheDocument();
    });

    it("displays custom subject field when 'Others' is selected", () => {
      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      const select = screen.getByLabelText(/Subject Category/i);
      expect(screen.queryByLabelText(/Specify Custom Subject/i)).toBeNull();

      fireEvent.change(select, { target: { value: "Others" } });
      expect(screen.getByLabelText(/Specify Custom Subject/i)).toBeInTheDocument();
    });

    it("supports custom dropdown click and keyboard navigation with dark theme options", () => {
      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      const triggerBtn = screen.getByRole("button", { name: /Select category/i });
      expect(triggerBtn).toHaveAttribute("aria-expanded", "false");

      // Open dropdown via click
      fireEvent.click(triggerBtn);
      expect(triggerBtn).toHaveAttribute("aria-expanded", "true");

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();

      // Click "Project Collaboration" option in custom menu
      const projectOption = screen.getAllByText("Project Collaboration").find(
        (el) => el.closest(".custom-select-option")
      );
      expect(projectOption).toBeDefined();
      fireEvent.click(projectOption!);

      // Menu closes and selection updates
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(screen.getAllByText("Project Collaboration").length).toBeGreaterThanOrEqual(1);

      // Open dropdown via ArrowDown key and close via Escape
      fireEvent.keyDown(triggerBtn, { key: "ArrowDown" });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.keyDown(triggerBtn, { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("includes proper autocomplete attributes on name and email inputs", () => {
      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      const nameInput = screen.getByLabelText(/Your Name \/ Organization/i);
      const emailInput = screen.getByLabelText(/Return Email Address/i);

      expect(nameInput).toHaveAttribute("autoComplete", "name");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
    });

    it("enforces exact Feature 6 disclaimer text with no mailto fallback", () => {
      const { container } = renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      expect(screen.getByText("Secure Message Delivery")).toBeInTheDocument();
      expect(
        screen.getByText(/Your message is submitted through Web3Forms and forwarded to Kamalesh at/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Web3Forms processes your information to facilitate message delivery\./i)
      ).toBeInTheDocument();

      // Strictly verify no mailto links exist inside the transmission form
      const mailtoLinks = container.querySelectorAll('a[href^="mailto:"]');
      expect(mailtoLinks.length).toBe(0);
    });

    it("submits to Web3Forms API and resets fields on success", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Message sent successfully" }),
      });
      globalThis.fetch = fetchMock;

      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Ada Lovelace" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "ada@example.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "Job Opportunity" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "Hello Kamalesh, we would love to discuss an engineering role with our team." },
      });

      const submitButton = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.web3forms.com/submit");
      const parsedBody = JSON.parse(requestInit.body);
      expect(parsedBody.name).toBe("Ada Lovelace");
      expect(parsedBody.email).toBe("ada@example.com");
      expect(parsedBody.subject).toBe("[KAI HQ] Job Opportunity — Ada Lovelace");
      expect(parsedBody.message).toContain("Hello Kamalesh");
      expect(parsedBody.from_name).toBe("KAI HQ");
      expect(parsedBody.replyto).toBe("ada@example.com");

      // Verify success notification and reset banner
      await waitFor(() => {
        expect(screen.getByText(/Transmission Protocol Completed/i)).toBeInTheDocument();
      });

      // Click Compose Another Message to verify form was reset
      fireEvent.click(screen.getByRole("button", { name: /Compose Another Message/i }));
      expect((screen.getByLabelText(/Your Name \/ Organization/i) as HTMLInputElement).value).toBe("");
    });

    it("preserves entered data on submission failure", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, message: "Transmission failed on remote relay" }),
      });
      globalThis.fetch = fetchMock;

      renderWithEngine(<TransmissionForm recipientEmail="kamalesh.sde@gmail.com" />);

      fireEvent.change(screen.getByLabelText(/Your Name \/ Organization/i), { target: { value: "Grace Hopper" } });
      fireEvent.change(screen.getByLabelText(/Return Email Address/i), { target: { value: "grace@example.com" } });
      fireEvent.change(screen.getByLabelText(/Subject Category/i), { target: { value: "Internship" } });
      fireEvent.change(screen.getByLabelText(/Message Payload/i), {
        target: { value: "Testing failure recovery to ensure user input is preserved on error." },
      });

      const submitButton = screen.getByRole("button", { name: /Transmit Message via Web3Forms/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Transmission Failed/i).length).toBeGreaterThan(0);
      });

      // User data preserved
      expect((screen.getByLabelText(/Your Name \/ Organization/i) as HTMLInputElement).value).toBe("Grace Hopper");
      expect((screen.getByLabelText(/Return Email Address/i) as HTMLInputElement).value).toBe("grace@example.com");
    });
  });

  describe("Feature 5: Notification Toast System", () => {
    it("renders notification with status/alert roles and dismiss button", () => {
      const handleDismiss = vi.fn();
      renderWithEngine(
        <NotificationToast
          notification={{
            id: "test-1",
            type: "success",
            title: "Operation Verified",
            message: "System dispatch completed successfully.",
          }}
          onDismiss={handleDismiss}
        />
      );

      const statusEl = screen.getByRole("status");
      expect(statusEl).toBeInTheDocument();
      expect(screen.getByText("Operation Verified")).toBeInTheDocument();
      expect(screen.getByText("System dispatch completed successfully.")).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: /Dismiss notification/i });
      fireEvent.click(closeBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it("renders warning and failure notifications with role='alert'", () => {
      const { rerender } = renderWithEngine(
        <NotificationToast
          notification={{
            id: "test-fail",
            type: "failure",
            title: "Error",
            message: "Something failed",
          }}
          onDismiss={vi.fn()}
        />
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(
        <ExperienceEngineProvider>
          <NotificationToast
            notification={{
              id: "test-warn",
              type: "warning",
              title: "Warning",
              message: "Caution",
            }}
            onDismiss={vi.fn()}
          />
        </ExperienceEngineProvider>
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Feature 7: Verified External Channels (Phone & WhatsApp)", () => {
    it("renders Phone Number and WhatsApp contact cards in Communication Center", () => {
      renderWithEngine(<CommunicationCenter />);

      const phoneLink = screen.getByRole("link", { name: /Open Phone Number \(\+91 63696 38817\)/i });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute("href", "tel:+916369638817");

      const waLink = screen.getByRole("link", { name: /Open WhatsApp \(\+91 63696 38817\)/i });
      expect(waLink).toBeInTheDocument();
      expect(waLink).toHaveAttribute("href", "https://wa.me/916369638817");
      expect(waLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("Feature 8: Header Brand Navigation", () => {
    it("renders interactive header branding button that returns to Lobby", () => {
      renderWithEngine(<Header />);

      const brandButton = screen.getByRole("button", { name: "KAI HQ — Return to Lobby" });
      expect(brandButton).toBeInTheDocument();
    });
  });

  describe("Feature 2 Cooldown Protection Logic", () => {
    it("triggers 30-second cooldown after 5 consecutive unknown messages", async () => {
      let mockTime = 1000000;
      vi.spyOn(Date, "now").mockImplementation(() => mockTime);

      renderWithEngine(<Assistant />);

      // Open assistant
      const triggerBtn = screen.getByRole("button", { name: /Open KAI Assistant guide/i });
      fireEvent.click(triggerBtn);

      const input = screen.getByRole("textbox", { name: /Ask KAI a question/i }) as HTMLInputElement;
      const sendBtn = screen.getByRole("button", { name: /Send message to KAI/i });

      // Send 5 consecutive unrecognizable messages spaced by 3s so rapid rate limit is not tripped
      for (let i = 1; i <= 5; i++) {
        mockTime += 3000;
        fireEvent.change(input, { target: { value: `unrecognized_nonsense_token_${i}_xyz` } });
        fireEvent.click(sendBtn);
      }

      // 30s abuse cooldown should now be active
      await waitFor(() => {
        const disabledInput = screen.getByRole("textbox");
        expect(disabledInput).toBeDisabled();
        expect(screen.getByText(/Cooldown active/i)).toBeInTheDocument();
      });
    });

    it("triggers 15-second rapid message cooldown on 5 messages within 10 seconds", async () => {
      let mockTime = 2000000;
      vi.spyOn(Date, "now").mockImplementation(() => mockTime);

      renderWithEngine(<Assistant />);

      const triggerBtn = screen.getByRole("button", { name: /Open KAI Assistant guide/i });
      fireEvent.click(triggerBtn);

      const input = screen.getByRole("textbox", { name: /Ask KAI a question/i }) as HTMLInputElement;
      const sendBtn = screen.getByRole("button", { name: /Send message to KAI/i });

      // Send 5 valid recognized messages in rapid succession (within 500ms total)
      for (let i = 1; i <= 5; i++) {
        mockTime += 100;
        fireEvent.change(input, { target: { value: "who is kamalesh" } });
        fireEvent.click(sendBtn);
      }

      // 15s rapid rate limit cooldown should be active
      await waitFor(() => {
        const disabledInput = screen.getByRole("textbox");
        expect(disabledInput).toBeDisabled();
        expect(screen.getByText(/Rate limit active/i)).toBeInTheDocument();
      });
    });
  });
});
