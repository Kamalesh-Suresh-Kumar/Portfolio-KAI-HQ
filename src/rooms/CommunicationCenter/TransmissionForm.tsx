import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Info, Mail } from "lucide-react";

interface TransmissionFormProps {
  recipientEmail: string;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function TransmissionForm({
  recipientEmail,
}: TransmissionFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please provide a valid email address";
    }

    if (!formData.subject.trim()) {
      errs.subject = "Subject header is required";
    }

    if (!formData.message.trim()) {
      errs.message = "Message payload is required";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsTransmitting(true);

    // Prepare encoded mailto parameters
    const subjectLine = `[KAI HQ Communication] ${formData.subject.trim()}`;
    const bodyContent = `Name: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nMessage:\n${formData.message.trim()}\n\n---\nTransmitted via KAI HQ Communication Center`;

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subjectLine
    )}&body=${encodeURIComponent(bodyContent)}`;

    // Client-side execution without fake backend
    setTimeout(() => {
      window.location.href = mailtoUrl;
      setIsTransmitting(false);
      setTransmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setTransmitted(false);
  };

  return (
    <div className="comm-right-column" aria-label="Message Transmission Console">
      <div className="comm-form-header">
        <h3 className="comm-form-title">
          <Send size={16} color="#38bdf8" />
          <span>Transmit Message</span>
        </h3>
        <p className="comm-form-desc">
          Dispatch inquiries, opportunities, or engineering collaboration
          proposals directly to the primary communication terminal.
        </p>
      </div>

      {transmitted ? (
        <div
          className="comm-status-box comm-status-success"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>Transmission Protocol Initiated</strong>
            <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
              Your default email client has been triggered with the prepared
              payload addressed to <strong>{recipientEmail}</strong>.
            </span>
            <button
              type="button"
              className="comm-copy-btn"
              onClick={handleReset}
              style={{ marginTop: 8, width: "fit-content" }}
            >
              Compose Another Message
            </button>
          </div>
        </div>
      ) : (
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

          {/* Subject Field */}
          <div className="form-field-group">
            <label htmlFor="comm-subject" className="form-label">
              <span>Subject Header</span>
              <span className="form-required-mark">*</span>
            </label>
            <input
              id="comm-subject"
              type="text"
              className={`form-input ${errors.subject ? "input-error" : ""}`}
              placeholder="e.g. Full-Stack Engineering Opportunity"
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                if (errors.subject) setErrors({ ...errors, subject: undefined });
              }}
              aria-required="true"
              aria-invalid={!!errors.subject}
              aria-describedby={
                errors.subject ? "comm-subject-error" : undefined
              }
            />
            {errors.subject && (
              <span id="comm-subject-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.subject}</span>
              </span>
            )}
          </div>

          {/* Message Body */}
          <div className="form-field-group">
            <label htmlFor="comm-message" className="form-label">
              <span>Message Payload</span>
              <span className="form-required-mark">*</span>
            </label>
            <textarea
              id="comm-message"
              rows={4}
              className={`form-textarea ${errors.message ? "input-error" : ""}`}
              placeholder="Enter your message, scope details, or questions..."
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={
                errors.message ? "comm-message-error" : undefined
              }
            />
            {errors.message && (
              <span id="comm-message-error" className="form-error-msg">
                <AlertCircle size={12} />
                <span>{errors.message}</span>
              </span>
            )}
          </div>

          {/* Static Protocol Transparency Disclaimer */}
          <div className="form-disclaimer">
            <Info size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Direct Client Protocol:</strong> This static facility prepares your verified message parameters and routes them directly via your local mail client to <code>{recipientEmail}</code> without storing data on third-party servers.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="form-submit-btn"
            disabled={isTransmitting}
            aria-label="Transmit message via email protocol"
          >
            <Mail size={16} />
            <span>
              {isTransmitting ? "Preparing Dispatch..." : "Transmit Message"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
