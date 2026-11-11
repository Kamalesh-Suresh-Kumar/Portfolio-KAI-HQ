import React, { useState, useRef, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, ShieldCheck, Mail, Loader2, ChevronDown, Check } from "lucide-react";
import NotificationToast, { type NotificationItem } from "../../components/common/NotificationToast";

interface TransmissionFormProps {
  recipientEmail?: string;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  customSubject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  customSubject?: string;
  message?: string;
}

const SUBJECT_OPTIONS = [
  "Internship",
  "Job Opportunity",
  "Project Collaboration",
  "General Enquiry",
  "Others",
];

const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 10;

export default function TransmissionForm({
  recipientEmail = "kamalesh.sde@gmail.com",
}: TransmissionFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    customSubject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error" | "missing_key">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [notification, setNotification] = useState<NotificationItem | null>(null);

  // Custom accessible dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleSelectSubject = (option: string) => {
    setFormData((prev) => ({ ...prev, subject: option }));
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        const currentIdx = SUBJECT_OPTIONS.indexOf(formData.subject);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      } else {
        setHighlightedIndex((prev) => (prev < SUBJECT_OPTIONS.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        const currentIdx = SUBJECT_OPTIONS.indexOf(formData.subject);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : SUBJECT_OPTIONS.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : SUBJECT_OPTIONS.length - 1));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isDropdownOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < SUBJECT_OPTIONS.length) {
          handleSelectSubject(SUBJECT_OPTIONS[highlightedIndex]);
        } else {
          setIsDropdownOpen(false);
        }
      } else {
        setIsDropdownOpen(true);
        const currentIdx = SUBJECT_OPTIONS.indexOf(formData.subject);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      }
    } else if (e.key === "Escape") {
      if (isDropdownOpen) {
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === "Tab") {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const char = e.key.toLowerCase();
      const matchIdx = SUBJECT_OPTIONS.findIndex((opt) => opt.toLowerCase().startsWith(char));
      if (matchIdx !== -1) {
        e.preventDefault();
        if (!isDropdownOpen) setIsDropdownOpen(true);
        setHighlightedIndex(matchIdx);
      }
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = "Full name or organization is required";
    }

    if (!formData.email.trim()) {
      errs.email = "Return email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please provide a valid email address";
    }

    if (!formData.subject) {
      errs.subject = "Please select a subject from the options";
    }

    if (formData.subject === "Others" && !formData.customSubject.trim()) {
      errs.customSubject = "Please specify your custom subject";
    }

    const trimmedMsg = formData.message.trim();
    if (!trimmedMsg) {
      errs.message = "Message payload is required";
    } else if (trimmedMsg.length < MIN_MESSAGE_LENGTH) {
      errs.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters (currently ${trimmedMsg.length})`;
    } else if (trimmedMsg.length > MAX_MESSAGE_LENGTH) {
      errs.message = `Message exceeds maximum limit of ${MAX_MESSAGE_LENGTH} characters`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      setSubmissionStatus("missing_key");
      const missingMsg =
        "Configuration Unavailable: VITE_WEB3FORMS_ACCESS_KEY is not configured in this environment. Please configure your access key to enable live message submission.";
      setStatusMessage(missingMsg);
      setNotification({
        id: `toast-${Date.now()}`,
        type: "warning",
        title: "Configuration Missing",
        message: missingMsg,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("idle");
    setStatusMessage("");

    // Generate dynamic email subject
    const visitorName = formData.name.trim();
    const dynamicSubject =
      formData.subject === "Others"
        ? `[KAI HQ] Others — ${formData.customSubject.trim()} — ${visitorName}`
        : `[KAI HQ] ${formData.subject} — ${visitorName}`;

    const payload = {
      access_key: accessKey,
      name: visitorName,
      email: formData.email.trim(),
      subject: dynamicSubject,
      message: formData.message.trim(),
      from_name: "KAI HQ",
      replyto: formData.email.trim(),
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setSubmissionStatus("success");
        setStatusMessage(
          `Your message has been accepted by Web3Forms and forwarded to Kamalesh at ${recipientEmail}.`
        );
        setNotification({
          id: `toast-${Date.now()}`,
          type: "success",
          title: "Message Submitted Successfully",
          message: `Your message has been accepted by Web3Forms and forwarded to Kamalesh at ${recipientEmail}.`,
        });

        // Reset form on confirmed success
        setFormData({
          name: "",
          email: "",
          subject: "",
          customSubject: "",
          message: "",
        });
        setErrors({});
      } else {
        const errorText =
          result?.message ||
          "Unable to transmit message through the Web3Forms gateway. Please verify your inputs and try again.";
        setSubmissionStatus("error");
        setStatusMessage(errorText);
        setNotification({
          id: `toast-${Date.now()}`,
          type: "failure",
          title: "Transmission Failed",
          message: errorText,
        });
        // Entered form values are preserved so visitor can retry
      }
    } catch {
      const networkError =
        "Network connection error: Unable to reach the Web3Forms submission endpoint. Please check your connectivity and retry.";
      setSubmissionStatus("error");
      setStatusMessage(networkError);
      setNotification({
        id: `toast-${Date.now()}`,
        type: "failure",
        title: "Network Error",
        message: networkError,
      });
      // Values preserved
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComposeAnother = () => {
    setSubmissionStatus("idle");
    setStatusMessage("");
  };

  const messageLength = formData.message.length;
  const isLengthNearLimit = messageLength > MAX_MESSAGE_LENGTH * 0.9;
  const isLengthOverLimit = messageLength > MAX_MESSAGE_LENGTH;

  return (
    <div className="comm-right-column" aria-label="Message Transmission Console">
      {/* Toast Notification Container */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      <div className="comm-form-header">
        <h3 className="comm-form-title">
          <Send size={16} color="#38bdf8" />
          <span>Transmit Message</span>
        </h3>
        <p className="comm-form-desc">
          Dispatch inquiries, career proposals, or engineering collaboration
          requests directly via the secure Web3Forms gateway.
        </p>
      </div>

      {submissionStatus === "success" && (
        <div
          className="comm-status-box comm-status-success"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <strong>Transmission Protocol Completed</strong>
            <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
              {statusMessage}
            </span>
            <button
              type="button"
              className="comm-copy-btn"
              onClick={handleComposeAnother}
              style={{ marginTop: 8, width: "fit-content" }}
            >
              Compose Another Message
            </button>
          </div>
        </div>
      )}

      {submissionStatus === "error" && (
        <div
          className="comm-status-box comm-status-failure"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>Transmission Failed</strong>
            <span style={{ fontSize: "0.82rem", color: "#fca5a5" }}>
              {statusMessage}
            </span>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 4 }}>
              Your entered parameters have been retained below. You may adjust them and retry dispatch.
            </span>
          </div>
        </div>
      )}

      {submissionStatus === "missing_key" && (
        <div
          className="comm-status-box comm-status-warning"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>Configuration Notice</strong>
            <span style={{ fontSize: "0.82rem", color: "#fde68a" }}>
              {statusMessage}
            </span>
          </div>
        </div>
      )}

      {/* Form rendered always (or when not exclusively in success view) */}
      {submissionStatus !== "success" && (
        <form
          className="transmission-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Direct message dispatch form"
        >
          {/* Name Field */}
          <div className="form-field-group">
            <label htmlFor="comm-name" className="form-label">
              <span>Your Name / Organization</span>
              <span className="form-required-mark">*</span>
            </label>
            <input
              id="comm-name"
              type="text"
              autoComplete="name"
              spellCheck="false"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Alex Mercer"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "comm-name-error" : undefined}
            />
            {errors.name && (
              <span id="comm-name-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.name}</span>
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-field-group">
            <label htmlFor="comm-email" className="form-label">
              <span>Return Email Address</span>
              <span className="form-required-mark">*</span>
            </label>
            <input
              id="comm-email"
              type="email"
              autoComplete="email"
              spellCheck="false"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="e.g. name@organization.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "comm-email-error" : undefined}
            />
            {errors.email && (
              <span id="comm-email-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.email}</span>
              </span>
            )}
          </div>

          {/* Subject Dropdown — Dark Navy & Cyan Theme */}
          <div className="form-field-group">
            <label id="comm-subject-label" htmlFor="comm-subject" className="form-label">
              <span>Subject Category</span>
              <span className="form-required-mark">*</span>
            </label>

            <div className="custom-select-container" ref={dropdownRef}>
              <button
                type="button"
                id="comm-subject-trigger"
                className={`custom-select-trigger ${errors.subject ? "input-error" : ""}`}
                onClick={() => {
                  setIsDropdownOpen((prev) => !prev);
                  if (!isDropdownOpen) {
                    const currentIdx = SUBJECT_OPTIONS.indexOf(formData.subject);
                    setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
                  }
                }}
                onKeyDown={handleDropdownKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-controls={isDropdownOpen ? "comm-subject-listbox" : undefined}
                aria-activedescendant={
                  isDropdownOpen && highlightedIndex >= 0
                    ? `comm-subject-option-${highlightedIndex}`
                    : undefined
                }
                aria-required="true"
                aria-label={formData.subject ? `Selected Category: ${formData.subject}` : "Select category"}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "comm-subject-error" : undefined}
              >
                <span className={`trigger-label ${!formData.subject ? "placeholder-text" : "selected-text"}`}>
                  {formData.subject || "Select a subject"}
                </span>
                <ChevronDown size={16} className={`custom-select-arrow ${isDropdownOpen ? "open" : ""}`} />
              </button>

              {isDropdownOpen && (
                <ul
                  id="comm-subject-listbox"
                  role="listbox"
                  aria-labelledby="comm-subject-label"
                  className="custom-select-menu"
                >
                  <li
                    role="option"
                    aria-selected={formData.subject === ""}
                    aria-disabled="true"
                    className="custom-select-option option-placeholder"
                  >
                    Select a subject
                  </li>
                  {SUBJECT_OPTIONS.map((opt, idx) => {
                    const isSelected = formData.subject === opt;
                    const isHighlighted = highlightedIndex === idx;
                    return (
                      <li
                        key={opt}
                        id={`comm-subject-option-${idx}`}
                        role="option"
                        aria-selected={isSelected}
                        className={`custom-select-option ${isSelected ? "option-selected" : ""} ${isHighlighted ? "option-highlighted" : ""}`}
                        onClick={() => handleSelectSubject(opt)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check size={14} className="option-check-icon" />}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Synchronized native select for full form compatibility and testing */}
              <select
                id="comm-subject"
                name="subject"
                className="sr-only-select"
                value={formData.subject}
                onChange={(e) => {
                  setFormData({ ...formData, subject: e.target.value });
                  if (errors.subject) setErrors({ ...errors, subject: undefined });
                }}
                aria-required="true"
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "comm-subject-error" : undefined}
                tabIndex={-1}
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {errors.subject && (
              <span id="comm-subject-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.subject}</span>
              </span>
            )}
          </div>

          {/* Custom Subject Inline Field (Shown when 'Others' selected) */}
          {formData.subject === "Others" && (
            <div className="form-field-group">
              <label htmlFor="comm-custom-subject" className="form-label">
                <span>Specify Custom Subject</span>
                <span className="form-required-mark">*</span>
              </label>
              <input
                id="comm-custom-subject"
                type="text"
                autoComplete="off"
                className={`form-input ${errors.customSubject ? "input-error" : ""}`}
                placeholder="e.g. Advisory Consultation Request"
                value={formData.customSubject}
                onChange={(e) => {
                  setFormData({ ...formData, customSubject: e.target.value });
                  if (errors.customSubject) {
                    setErrors({ ...errors, customSubject: undefined });
                  }
                }}
                aria-required="true"
                aria-invalid={!!errors.customSubject}
                aria-describedby={
                  errors.customSubject ? "comm-custom-subject-error" : undefined
                }
              />
              {errors.customSubject && (
                <span id="comm-custom-subject-error" className="form-error-msg">
                  <AlertCircle size={12} />
                  <span>{errors.customSubject}</span>
                </span>
              )}
            </div>
          )}

          {/* Message Body Field */}
          <div className="form-field-group">
            <div className="form-field-meta-row">
              <label htmlFor="comm-message" className="form-label" style={{ marginBottom: 0 }}>
                <span>Message Payload</span>
                <span className="form-required-mark">*</span>
              </label>
              <span
                className={`form-char-counter ${
                  isLengthOverLimit
                    ? "limit-reached"
                    : isLengthNearLimit
                    ? "limit-near"
                    : ""
                }`}
                aria-live="polite"
              >
                {messageLength} / {MAX_MESSAGE_LENGTH} characters
              </span>
            </div>
            <textarea
              id="comm-message"
              rows={5}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`form-textarea ${errors.message ? "input-error" : ""}`}
              placeholder="Enter your message, scope details, role specifications, or collaboration proposal..."
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "comm-message-error" : undefined}
            />
            {errors.message && (
              <span id="comm-message-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.message}</span>
              </span>
            )}
          </div>

          {/* Feature 6: Secure Message Delivery Disclaimer */}
          <div className="form-disclaimer">
            <ShieldCheck size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong className="form-disclaimer-title">Secure Message Delivery</strong>
              <span>
                Your message is submitted through Web3Forms and forwarded to Kamalesh at{" "}
                <strong>{recipientEmail}</strong>. Web3Forms processes your information to facilitate message delivery.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="form-submit-btn"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Sending message..." : "Transmit Message via Web3Forms"}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail size={16} />
                <span>Transmit Message</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
