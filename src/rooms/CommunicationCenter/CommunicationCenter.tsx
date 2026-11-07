import { useState, useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import ChannelCard, { type ChannelItem } from "./ChannelCard";
import TransmissionForm from "./TransmissionForm";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  Terminal,
  Copy,
  Check,
  Mail,
  GitBranch,
  ShieldCheck,
  Activity,
  Radio,
} from "lucide-react";
import "./communication-center.css";

export default function CommunicationCenter() {
  const [copied, setCopied] = useState(false);

  // Retrieve contact and profile data exclusively from Knowledge Engine as the single source of truth
  const contact = useMemo(() => knowledgeEngine.getContact(), []);

  // Construct real verified public communication channels
  const channels = useMemo<ChannelItem[]>(() => {
    const list: ChannelItem[] = [];

    if (contact.email) {
      list.push({
        id: "email",
        name: "Primary Email",
        sub: contact.email,
        url: `mailto:${contact.email}`,
        icon: <Mail size={18} />,
        isExternal: false,
      });
    }

    if (contact.github) {
      list.push({
        id: "github",
        name: "GitHub Profile",
        sub: "@Kamalesh-Suresh-Kumar",
        url: contact.github,
        icon: <FaGithub size={18} />,
        isExternal: true,
      });
    }

    if (contact.linkedin) {
      list.push({
        id: "linkedin",
        name: "LinkedIn Network",
        sub: "in/kamalesh-suresh-kumar",
        url: contact.linkedin,
        icon: <FaLinkedin size={18} />,
        isExternal: true,
      });
    }

    if (contact.portfolioRepo) {
      list.push({
        id: "repository",
        name: "Source Repository",
        sub: "Portfolio-KAI-HQ",
        url: contact.portfolioRepo,
        icon: <GitBranch size={18} />,
        isExternal: true,
      });
    }

    return list;
  }, [contact]);

  // Telemetry metrics derived from actual contact data
  const telemetry = useMemo(() => {
    return {
      activeChannels: channels.length,
      preferredGateway: "Direct Email",
      systemMode: contact.systemStatus?.mode || "SYSTEM_READY",
      systemStatus: contact.systemStatus?.status || "ONLINE",
      version: contact.systemStatus?.version || "1.0.0",
      location: contact.location || "Global / Remote",
    };
  }, [channels, contact]);

  // Copy email to clipboard handler with fallback
  const handleCopyEmail = async () => {
    if (!contact.email) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contact.email);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = contact.email;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Graceful failure handling
      setCopied(false);
    }
  };

  return (
    <section className="communication-center" aria-label="Communication Center">
      {/* Facility Header */}
      <header className="comm-header">
        <div className="comm-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-06 // OPEN CHANNEL</span>
        </div>

        <div className="comm-headline-group">
          <h1 className="comm-title">Communication Center</h1>
          <p className="comm-subtitle">
            Secure digital communications hub and external connection facility.
            Access verified public channels, dispatch collaboration inquiries, or
            connect with Kamalesh for engineering roles.
          </p>
        </div>

        {/* Telemetry Statistics Grid */}
        <div className="comm-stats-grid">
          <div className="comm-stat-box">
            <span className="comm-stat-value">{telemetry.activeChannels}</span>
            <span className="comm-stat-label">Verified Channels</span>
          </div>
          <div className="comm-stat-box">
            <span className="comm-stat-value" style={{ color: "#38bdf8" }}>
              {telemetry.preferredGateway}
            </span>
            <span className="comm-stat-label">Primary Gateway</span>
          </div>
          <div className="comm-stat-box">
            <span className="comm-stat-value" style={{ color: "#22c55e" }}>
              {telemetry.systemStatus}
            </span>
            <span className="comm-stat-label">Facility Mode</span>
          </div>
          <div className="comm-stat-box">
            <span className="comm-stat-value" style={{ color: "#facc15" }}>
              {telemetry.location}
            </span>
            <span className="comm-stat-label">Operating Base</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Identity & Channels / Transmission Console */}
      <div className="comm-main-grid">
        {/* Left Column: Identity & Public Channels */}
        <div className="comm-left-column">
          {/* Identity Card */}
          <div className="comm-identity-card">
            <div className="comm-identity-header">
              <div className="comm-identity-meta">
                <h2 className="comm-identity-name">{contact.name}</h2>
                <span className="comm-identity-tagline">{contact.tagline}</span>
              </div>
              <div className="comm-avatar-box" aria-hidden="true">
                KS
              </div>
            </div>

            <p className="comm-bio-text">{contact.bio}</p>

            {/* Availability Indicator */}
            {contact.availability && (
              <div className="comm-availability-box">
                <div className="comm-avail-indicator" aria-hidden="true" />
                <p className="comm-avail-text">
                  <strong>Current Status:</strong> {contact.availability}
                </p>
              </div>
            )}

            {/* Public Email Copy Bar */}
            {contact.email && (
              <div className="comm-email-bar">
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <Mail size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span className="comm-email-text">{contact.email}</span>
                </div>

                <button
                  type="button"
                  className={`comm-copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopyEmail}
                  aria-label="Copy primary email address to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Accessibility Live Region for Copy Feedback */}
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                border: 0,
              }}
            >
              {copied ? "Email address copied to clipboard" : ""}
            </div>
          </div>

          {/* Public Channels Grid */}
          <div className="comm-channels-section">
            <h3 className="comm-section-title">
              <Radio size={16} color="#38bdf8" />
              <span>Verified External Channels</span>
            </h3>

            <div className="comm-channels-grid">
              {channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </div>

          {/* System Protocol Specs */}
          {contact.systemStatus && (
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.78rem",
                color: "#94a3b8",
                fontFamily: "monospace",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={13} color="#22c55e" />
                <span>OS_KERNEL v{contact.systemStatus.version}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={13} color="#38bdf8" />
                <span>CHANNEL_SECURITY: ENCRYPTED</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Direct Message Transmission Console */}
        <TransmissionForm recipientEmail={contact.email || "kamalsuresh2005@gmail.com"} />
      </div>
    </section>
  );
}
