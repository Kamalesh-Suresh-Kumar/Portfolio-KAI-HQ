import { useState, useMemo, useCallback } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { Achievement, AchievementCategory } from "../../knowledge-engine/types";
import { useExperienceEngine } from "../../experience-engine";
import AchievementCard from "./AchievementCard";
import AchievementDetailModal from "./AchievementDetailModal";
import { Search, Filter, Terminal, Star } from "lucide-react";
import "./achievement-hall.css";

type FilterTab = "all" | AchievementCategory;

export default function AchievementHall() {
  const { routeParams, changeRoom } = useExperienceEngine();
  const [activeCategory, setActiveCategory] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Derive selected achievement directly from routeParams without cascading effect renders
  const selectedAchievement = useMemo<Achievement | null>(() => {
    if (routeParams.achievement) {
      return knowledgeEngine.getAchievementById(routeParams.achievement) || null;
    }
    return null;
  }, [routeParams.achievement]);

  const handleInspectAchievement = useCallback((achievement: Achievement) => {
    changeRoom("AchievementHall", { achievement: achievement.id });
  }, [changeRoom]);

  const handleCloseAchievement = useCallback(() => {
    changeRoom("AchievementHall");
  }, [changeRoom]);

  // Retrieve achievements from Knowledge Engine as the single source of truth
  const allAchievements = useMemo(() => knowledgeEngine.getAchievements(), []);

  // Compute telemetry stats dynamically from dataset
  const stats = useMemo(() => {
    const highlights = allAchievements.filter((a) => a.highlight).length;
    const certifications = allAchievements.filter(
      (a) => a.category === "certification"
    ).length;
    const demonstrations = allAchievements.filter(
      (a) => a.category === "demonstration"
    ).length;
    const leadership = allAchievements.filter(
      (a) => a.category === "leadership"
    ).length;

    return {
      total: allAchievements.length,
      highlights,
      certifications,
      demonstrations,
      leadership,
    };
  }, [allAchievements]);

  // Compute category counts dynamically from data
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allAchievements.length };
    for (const a of allAchievements) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [allAchievements]);

  // Filter and search logic
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((a) => {
      const matchesCategory =
        activeCategory === "all" || a.category === activeCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        a.issuer.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allAchievements, activeCategory, searchQuery]);

  // Featured / Highlighted records for the dedicated showcase
  const featuredAchievements = useMemo(() => {
    return allAchievements.filter((a) => a.highlight);
  }, [allAchievements]);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Records" },
    { key: "demonstration", label: "Cybersecurity Demos" },
    { key: "certification", label: "Certifications" },
    { key: "leadership", label: "Cadetship & Leadership" },
    { key: "academic", label: "Academic Records" },
  ];

  return (
    <section className="achievement-hall" aria-label="Achievement Hall">
      {/* Facility Header */}
      <header className="hall-header">
        <div className="hall-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-04 // VERIFIED RECORDS</span>
        </div>

        <div className="hall-headline-group">
          <h1 className="hall-title">Achievement Hall</h1>
          <p className="hall-subtitle">
            Authenticated repository of cybersecurity demonstrations, enterprise
            certifications, naval cadetship service recognitions, and technical
            society contributions.
          </p>
        </div>

        {/* Telemetry Statistics Grid */}
        <div className="hall-stats-grid">
          <div className="hall-stat-box">
            <span className="hall-stat-value">{stats.total}</span>
            <span className="hall-stat-label">Total Records</span>
          </div>
          <div className="hall-stat-box">
            <span className="hall-stat-value" style={{ color: "#fbbf24" }}>
              {stats.highlights}
            </span>
            <span className="hall-stat-label">Verified Highlights</span>
          </div>
          <div className="hall-stat-box">
            <span className="hall-stat-value" style={{ color: "#f87171" }}>
              {stats.demonstrations}
            </span>
            <span className="hall-stat-label">Law Enforcement Demos</span>
          </div>
          <div className="hall-stat-box">
            <span className="hall-stat-value" style={{ color: "#4ade80" }}>
              {stats.certifications}
            </span>
            <span className="hall-stat-label">Enterprise Certs</span>
          </div>
          <div className="hall-stat-box">
            <span className="hall-stat-value" style={{ color: "#c084fc" }}>
              {stats.leadership}
            </span>
            <span className="hall-stat-label">Cadet Leadership</span>
          </div>
        </div>
      </header>

      {/* Featured / Highlighted Section (shown when no specific filter/search is restricting it) */}
      {activeCategory === "all" && !searchQuery.trim() && (
        <section className="featured-section" aria-label="Verified Milestones">
          <h2 className="featured-section-title">
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <span>Key Verified Milestones</span>
          </h2>
          <div className="featured-grid">
            {featuredAchievements.map((item) => (
              <AchievementCard
                key={item.id}
                achievement={item}
                onInspect={handleInspectAchievement}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter and Search Controls */}
      <div className="hall-controls">
        <div className="hall-filter-pills" role="tablist" aria-label="Achievement categories">
          {filterTabs.map((tab) => {
            const count = filterCounts[tab.key] || 0;
            if (tab.key !== "all" && count === 0) return null;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.key}
                className={`hall-filter-btn ${activeCategory === tab.key ? "active" : ""}`}
                onClick={() => setActiveCategory(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="hall-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="hall-search-wrapper">
          <Search size={14} className="hall-search-icon" />
          <input
            type="text"
            className="hall-search-input"
            placeholder="Search record, issuer, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter achievements by keyword"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="hall-achievements-grid">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onInspect={handleInspectAchievement}
            />
          ))}
        </div>
      ) : (
        <div className="hall-empty-state">
          <Filter size={32} color="#64748b" />
          <h3 style={{ color: "#f1f5f9", margin: 0 }}>No verified records found</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            No achievement record matches "{searchQuery}". Try resetting your search or filters.
          </p>
          <button
            type="button"
            className="hall-filter-btn active"
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

      {/* Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={handleCloseAchievement}
      />
    </section>
  );
}
