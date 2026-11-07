import { useState, useMemo, useCallback } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { Project, ProjectDomain } from "../../knowledge-engine/types";
import { useExperienceEngine } from "../../experience-engine";
import ProjectCard from "./ProjectCard";
import ProjectDetailModal from "./ProjectDetailModal";
import { Search, Filter, Terminal } from "lucide-react";
import "./engineering-lab.css";

type FilterTab = "all" | ProjectDomain;

export default function EngineeringLaboratory() {
  const { routeParams, changeRoom, mode } = useExperienceEngine();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Derive selected project directly from routeParams without cascading effect renders
  const selectedProject = useMemo<Project | null>(() => {
    if (routeParams.project) {
      return knowledgeEngine.getProjectById(routeParams.project) || null;
    }
    return null;
  }, [routeParams.project]);

  const handleInspectProject = useCallback((project: Project) => {
    changeRoom("EngineeringLaboratory", { project: project.id });
  }, [changeRoom]);

  const handleCloseProject = useCallback(() => {
    changeRoom("EngineeringLaboratory");
  }, [changeRoom]);

  // Retrieve projects from Knowledge Engine (single source of truth)
  const allProjects = useMemo(() => knowledgeEngine.getProjects(), []);

  // Compute category breakdown dynamically from the dataset
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProjects.length };
    for (const p of allProjects) {
      counts[p.domain] = (counts[p.domain] || 0) + 1;
    }
    return counts;
  }, [allProjects]);

  // Compute high-level facility telemetry stats from actual dataset
  const stats = useMemo(() => {
    const productionCount = allProjects.filter((p) => p.status === "production").length;
    const securityCount = allProjects.filter((p) => p.domain === "cybersecurity").length;
    const allStacks = new Set(allProjects.flatMap((p) => p.stack));

    return {
      total: allProjects.length,
      production: productionCount,
      security: securityCount,
      uniqueStacks: allStacks.size,
    };
  }, [allProjects]);

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesCategory =
        activeFilter === "all" || project.domain === activeFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        project.title.toLowerCase().includes(q) ||
        project.summary.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.stack.some((tech) => tech.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allProjects, activeFilter, searchQuery]);

  // Mode-aware sorting (never hides content, only re-orders emphasis)
  const displayProjects = useMemo(() => {
    const list = [...filteredProjects];
    if (mode === "recruiter") {
      return list.sort((a, b) => {
        if (a.status === "production" && b.status !== "production") return -1;
        if (b.status === "production" && a.status !== "production") return 1;
        return 0;
      });
    }
    if (mode === "developer") {
      return list.sort((a, b) => {
        if (a.domain === "cybersecurity" && b.domain !== "cybersecurity") return -1;
        if (b.domain === "cybersecurity" && a.domain !== "cybersecurity") return 1;
        return 0;
      });
    }
    return list;
  }, [filteredProjects, mode]);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Specimens" },
    { key: "cybersecurity", label: "Cybersecurity & Li-Fi" },
    { key: "fullstack", label: "Full-Stack Web" },
    { key: "devops", label: "DevOps & CI/CD" },
    { key: "ai-ml", label: "AI & Systems" },
  ];

  return (
    <section className="engineering-lab" aria-label="Engineering Laboratory">
      {/* Facility Header */}
      <header className="lab-header">
        <div className="lab-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-02 // SPECIMEN ARCHIVE</span>
        </div>

        <div className="lab-headline-group">
          <h1 className="lab-title">Engineering Laboratory</h1>
          <p className="lab-subtitle">
            Curated repository of software engineering projects, security protocol implementations, 
            and automated deployment architectures. Inspect any specimen for architectural decisions, 
            metrics, and cross-linked proficiencies.
          </p>
        </div>

        {/* Mode Perspective Lens Banner */}
        {mode !== "neutral" && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 8,
              background: mode === "recruiter" ? "rgba(34, 197, 94, 0.12)" : "rgba(56, 189, 248, 0.12)",
              border: `1px solid ${mode === "recruiter" ? "rgba(34, 197, 94, 0.3)" : "rgba(56, 189, 248, 0.3)"}`,
              fontSize: "0.82rem",
              color: mode === "recruiter" ? "#86efac" : "#7dd3fc",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <strong>{mode === "recruiter" ? "// RECRUITER LENS:" : "// DEVELOPER LENS:"}</strong>
            <span>
              {mode === "recruiter"
                ? "Emphasizing production status, operational metrics, and delivery outcomes. All specimens remain fully accessible."
                : "Emphasizing system architecture, protocols, and technical implementation depth. Inspect cards for full architecture notes."}
            </span>
          </div>
        )}

        {/* Facility Telemetry Stats */}
        <div className="lab-stats-grid">
          <div className="lab-stat-box">
            <span className="lab-stat-box-value">{stats.total}</span>
            <span className="lab-stat-box-label">Total Specimens</span>
          </div>
          <div className="lab-stat-box">
            <span className="lab-stat-box-value" style={{ color: "#22c55e" }}>
              {stats.production}
            </span>
            <span className="lab-stat-box-label">Production Ready</span>
          </div>
          <div className="lab-stat-box">
            <span className="lab-stat-box-value" style={{ color: "#c084fc" }}>
              {stats.security}
            </span>
            <span className="lab-stat-box-label">Security Protocols</span>
          </div>
          <div className="lab-stat-box">
            <span className="lab-stat-box-value" style={{ color: "#facc15" }}>
              {stats.uniqueStacks}
            </span>
            <span className="lab-stat-box-label">Verified Toolchains</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Controls */}
      <div className="lab-controls">
        <div className="lab-filter-pills" role="tablist" aria-label="Project domains">
          {filterTabs.map((tab) => {
            const count = filterCounts[tab.key] || 0;
            if (tab.key !== "all" && count === 0) return null;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab.key}
                className={`lab-filter-btn ${activeFilter === tab.key ? "active" : ""}`}
                onClick={() => setActiveFilter(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="lab-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="lab-search-input-wrapper">
          <Search size={14} className="lab-search-icon" />
          <input
            type="text"
            className="lab-search-input"
            placeholder="Search stack, title, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter engineering specimens by keyword or stack"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {displayProjects.length > 0 ? (
        <div className="lab-projects-grid">
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onInspect={handleInspectProject}
            />
          ))}
        </div>
      ) : (
        <div className="lab-empty-state">
          <Filter size={32} color="#64748b" />
          <h3 style={{ color: "#f1f5f9", margin: 0 }}>No matching specimens found</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            No engineering specimens match the criteria "{searchQuery}". Try resetting filters or searching for another keyword.
          </p>
          <button
            type="button"
            className="lab-filter-btn active"
            onClick={() => {
              setActiveFilter("all");
              setSearchQuery("");
            }}
            style={{ marginTop: 8 }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={handleCloseProject}
      />
    </section>
  );
}
