import { useState, useMemo, useEffect } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { ExperienceTimeline, TimelineCategory } from "../../knowledge-engine/types";
import { useExperienceEngine } from "../../experience-engine";
import TimelineCard from "./TimelineCard";
import { Search, Filter, Terminal } from "lucide-react";
import "./memory-archive.css";

type FilterTab = "all" | TimelineCategory;

export default function MemoryArchive() {
  const { routeParams } = useExperienceEngine();
  const [activeCategory, setActiveCategory] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const highlightedTimelineId = routeParams.timeline || null;

  // Synchronize deep-link highlight scroll from URL route params (e.g. /memory-archive/timeline/timeline-cse-undergrad)
  useEffect(() => {
    if (routeParams.timeline) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`timeline-${routeParams.timeline}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [routeParams.timeline]);

  // Retrieve timeline from Knowledge Engine as the single source of truth
  const allTimeline = useMemo(() => knowledgeEngine.getTimeline(), []);

  // Compute stats telemetry dynamically from dataset
  const stats = useMemo(() => {
    const educationCount = allTimeline.filter((t) => t.category === "education").length;
    const internshipCount = allTimeline.filter((t) => t.category === "internship").length;
    const leadershipCount = allTimeline.filter((t) => t.category === "leadership").length;
    const activeCount = allTimeline.filter((t) => t.active).length;

    return {
      total: allTimeline.length,
      education: educationCount,
      internship: internshipCount,
      leadership: leadershipCount,
      active: activeCount,
    };
  }, [allTimeline]);

  // Compute category counts dynamically
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTimeline.length };
    for (const item of allTimeline) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [allTimeline]);

  // Filter and search logic
  const filteredTimeline = useMemo(() => {
    return allTimeline.filter((item: ExperienceTimeline) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keyAchievements.some((ach) => ach.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allTimeline, activeCategory, searchQuery]);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Milestones" },
    { key: "education", label: "Education & Academics" },
    { key: "internship", label: "Internships & Industry" },
    { key: "leadership", label: "Cadetship & Leadership" },
    { key: "extracurricular", label: "Technical Societies" },
  ];

  return (
    <section className="memory-archive" aria-label="Memory Archive">
      {/* Facility Header */}
      <header className="archive-header">
        <div className="archive-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-03 // CHRONOLOGICAL LOGS</span>
        </div>

        <div className="archive-headline-group">
          <h1 className="archive-title">Memory Archive</h1>
          <p className="archive-subtitle">
            Chronological record of academic foundations, software engineering internships,
            naval wing cadet leadership, and technical society contributions.
          </p>
        </div>

        {/* Telemetry Statistics Grid */}
        <div className="archive-stats-grid">
          <div className="archive-stat-box">
            <span className="archive-stat-value">{stats.total}</span>
            <span className="archive-stat-label">Total Milestones</span>
          </div>
          <div className="archive-stat-box">
            <span className="archive-stat-value" style={{ color: "#38bdf8" }}>
              {stats.education}
            </span>
            <span className="archive-stat-label">Academic Foundations</span>
          </div>
          <div className="archive-stat-box">
            <span className="archive-stat-value" style={{ color: "#22c55e" }}>
              {stats.internship}
            </span>
            <span className="archive-stat-label">Software Internships</span>
          </div>
          <div className="archive-stat-box">
            <span className="archive-stat-value" style={{ color: "#c084fc" }}>
              {stats.leadership}
            </span>
            <span className="archive-stat-label">Leadership & Cadetship</span>
          </div>
          <div className="archive-stat-box">
            <span className="archive-stat-value" style={{ color: "#facc15" }}>
              {stats.active}
            </span>
            <span className="archive-stat-label">Active Endeavors</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Controls */}
      <div className="archive-controls">
        <div className="archive-filter-pills" role="tablist" aria-label="Timeline categories">
          {filterTabs.map((tab) => {
            const count = filterCounts[tab.key] || 0;
            if (tab.key !== "all" && count === 0) return null;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.key}
                className={`archive-filter-btn ${activeCategory === tab.key ? "active" : ""}`}
                onClick={() => setActiveCategory(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="archive-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="archive-search-wrapper">
          <Search size={14} className="archive-search-icon" />
          <input
            type="text"
            className="archive-search-input"
            placeholder="Search role, organization, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter timeline milestones by keyword"
          />
        </div>
      </div>

      {/* Chronological Timeline Container */}
      {filteredTimeline.length > 0 ? (
        <div className="timeline-container">
          <div className="timeline-spine" aria-hidden="true" />
          {filteredTimeline.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              isHighlighted={highlightedTimelineId === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="archive-empty-state">
          <Filter size={32} color="#64748b" />
          <h3 style={{ color: "#f1f5f9", margin: 0 }}>No chronological records found</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            No milestone matches the criteria "{searchQuery}". Try resetting filters or searching for another keyword.
          </p>
          <button
            type="button"
            className="archive-filter-btn active"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            style={{ marginTop: 8 }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
