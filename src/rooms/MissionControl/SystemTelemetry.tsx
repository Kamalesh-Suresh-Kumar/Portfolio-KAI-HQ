import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import {
  FolderGit2,
  Cpu,
  Clock,
  Trophy,
  FileText,
  Compass,
  Activity,
  CheckCircle2,
  Shield,
} from "lucide-react";

export default function SystemTelemetry() {
  // Aggregate stats derived strictly from Knowledge Engine
  const stats = useMemo(() => knowledgeEngine.getStats(), []);
  const allData = useMemo(() => knowledgeEngine.getAllData(), []);
  const contact = useMemo(() => knowledgeEngine.getContact(), []);

  // Operational states for local subsystems (no fabricated external monitoring)
  const subsystemStates = [
    {
      name: "Experience Engine",
      desc: "Client-side room state, visitor mode & assistive router",
      badge: "ONLINE",
      badgeClass: "online",
    },
    {
      name: "Knowledge Engine",
      desc: "Deterministic in-memory portfolio index & search engine",
      badge: "ONLINE",
      badgeClass: "online",
    },
    {
      name: "Portfolio Telemetry",
      desc: `Structured Knowledge Base (${allData.schemaVersion})`,
      badge: "READY",
      badgeClass: "ready",
    },
    {
      name: "Navigation Subsystem",
      desc: "URL hash synchronizer & 8 facility routes",
      badge: "ONLINE",
      badgeClass: "online",
    },
    {
      name: "Document Vault",
      desc: `${stats.resumeVariantsCount} role-tailored resume specifications indexed`,
      badge: "READY",
      badgeClass: "ready",
    },
    {
      name: "Communication Center",
      desc: "Verified email, GitHub & LinkedIn direct channels",
      badge: "ACTIVE",
      badgeClass: "active",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Dynamic Telemetry Metric Cards */}
      <section aria-label="System Metrics Telemetry">
        <div className="telemetry-grid">
          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Projects</span>
              <FolderGit2 size={16} color="#38bdf8" />
            </div>
            <span className="telemetry-stat-value">{stats.projectsCount}</span>
          </div>

          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Skills</span>
              <Cpu size={16} color="#818cf8" />
            </div>
            <span className="telemetry-stat-value">{stats.skillsCount}</span>
          </div>

          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Timeline Records</span>
              <Clock size={16} color="#34d399" />
            </div>
            <span className="telemetry-stat-value">{stats.timelineCount}</span>
          </div>

          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Achievements</span>
              <Trophy size={16} color="#facc15" />
            </div>
            <span className="telemetry-stat-value">{stats.achievementsCount}</span>
          </div>

          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Resume Variants</span>
              <FileText size={16} color="#f472b6" />
            </div>
            <span className="telemetry-stat-value">{stats.resumeVariantsCount}</span>
          </div>

          <div className="telemetry-stat-card">
            <div className="telemetry-card-top">
              <span className="telemetry-stat-label">Facility Rooms</span>
              <Compass size={16} color="#a855f7" />
            </div>
            <span className="telemetry-stat-value">{stats.roomsCount}</span>
          </div>
        </div>
      </section>

      {/* Local Subsystem Operational State */}
      <section className="facility-status-panel" aria-label="Subsystem Operational Status">
        <div className="facility-status-header">
          <h2 className="facility-status-title">
            <Activity size={15} color="#38bdf8" />
            <span>Facility Subsystem Operational States</span>
          </h2>
          <span className="facility-disclaimer">
            // APPLICATION-LOCAL OPERATIONAL STATES
          </span>
        </div>

        <div className="status-nodes-grid">
          {subsystemStates.map((subsystem) => (
            <div key={subsystem.name} className="status-node-item">
              <div className="status-node-info">
                <span className="status-node-name">{subsystem.name}</span>
                <span className="status-node-desc">{subsystem.desc}</span>
              </div>
              <span className={`status-node-badge ${subsystem.badgeClass}`}>
                ● {subsystem.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* System Activity & Integrity Telemetry */}
      <section className="system-activity-panel" aria-label="System Activity and Data Integrity">
        <div className="facility-status-header">
          <h2 className="facility-status-title">
            <Shield size={15} color="#38bdf8" />
            <span>Data Integrity & Knowledge Repository Telemetry</span>
          </h2>
          <span className="facility-disclaimer">
            DETERMINISTIC IN-MEMORY REPOSITORY
          </span>
        </div>

        <div className="activity-specs-list">
          <div className="activity-spec-item">
            <span className="activity-spec-label">Repository Owner</span>
            <span className="activity-spec-val">{allData.owner}</span>
          </div>

          <div className="activity-spec-item">
            <span className="activity-spec-label">Schema Version</span>
            <span className="activity-spec-val">{allData.schemaVersion}</span>
          </div>

          <div className="activity-spec-item">
            <span className="activity-spec-label">System Availability</span>
            <span className="activity-spec-val" style={{ color: "#38bdf8" }}>
              {contact.systemStatus.status} (v{contact.systemStatus.version})
            </span>
          </div>

          <div className="activity-spec-item">
            <span className="activity-spec-label">Search Index Integrity</span>
            <span className="activity-spec-val" style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={13} />
              <span>DETERMINISTIC (0 ms latency)</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
