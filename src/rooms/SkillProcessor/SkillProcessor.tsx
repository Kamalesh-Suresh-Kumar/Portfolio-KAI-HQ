import { useState, useMemo, useEffect, useCallback } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { Skill, SkillCategory } from "../../knowledge-engine/types";
import { useExperienceEngine, parseHash, buildHash } from "../../experience-engine";
import SkillCard from "./SkillCard";
import SkillDetailModal from "./SkillDetailModal";
import {
  Terminal,
  Search,
  Filter,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import "./skill-processor.css";

type CategoryFilter = "all" | SkillCategory;

const CATEGORY_NAMES: Record<SkillCategory, string> = {
  languages: "Languages",
  frameworks: "Frameworks & Libraries",
  cybersecurity_systems: "Cybersecurity & Systems",
  tools_infrastructure: "Tools & Infrastructure",
  domains: "Architecture & Domains",
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  languages: "#38bdf8", // Sky blue
  frameworks: "#818cf8", // Indigo
  cybersecurity_systems: "#34d399", // Emerald
  tools_infrastructure: "#fbbf24", // Amber
  domains: "#f472b6", // Rose
};

export default function SkillProcessor() {
  const { reducedMotion } = useExperienceEngine();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Synchronize modal state with URL hash (e.g. #/skill-processor?skill=react)
  useEffect(() => {
    const syncFromHash = () => {
      const { room, params } = parseHash(window.location.hash);
      if (room === "SkillProcessor" && params.skill) {
        const found = knowledgeEngine.getSkillById(params.skill);
        if (found) {
          setSelectedSkill(found);
          return;
        }
      }
      if (room === "SkillProcessor" && !params.skill) {
        setSelectedSkill(null);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    if (typeof window !== "undefined") {
      window.location.hash = buildHash("SkillProcessor", {
        skill: skill.id,
      });
    }
  }, []);

  const handleCloseSkill = useCallback(() => {
    setSelectedSkill(null);
    if (typeof window !== "undefined") {
      window.location.hash = buildHash("SkillProcessor");
    }
  }, []);

  // Retrieve all skills from Knowledge Engine (Single source of truth)
  const allSkills = useMemo(() => knowledgeEngine.getSkills(), []);

  // Dynamically extract categories that actually exist in the data
  const existingCategories = useMemo<SkillCategory[]>(() => {
    const cats = new Set<SkillCategory>();
    for (const s of allSkills) {
      cats.add(s.category);
    }
    return Array.from(cats);
  }, [allSkills]);

  // Compute category counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allSkills.length };
    for (const s of allSkills) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, [allSkills]);

  // Compute telemetry metrics derived strictly from actual skill data
  const telemetry = useMemo(() => {
    const totalSkills = allSkills.length;
    const expertCount = allSkills.filter((s) => s.proficiencyLevel === "expert").length;
    const advancedCount = allSkills.filter((s) => s.proficiencyLevel === "advanced").length;
    const highTierCount = expertCount + advancedCount;
    const allLinkedProjects = new Set(allSkills.flatMap((s) => s.linkedProjectIds));

    return {
      totalSkills,
      highTierCount,
      categoryCount: existingCategories.length,
      linkedProjectsCount: allLinkedProjects.size,
    };
  }, [allSkills, existingCategories]);

  // Filter and search logic
  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allSkills.filter((skill) => {
      const matchesCategory =
        activeCategory === "all" || skill.category === activeCategory;

      if (!q) return matchesCategory;

      const matchesSearch =
        skill.name.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        (skill.description && skill.description.toLowerCase().includes(q)) ||
        skill.linkedProjectIds.some((pId) => pId.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allSkills, activeCategory, searchQuery]);

  return (
    <section
      className={`skill-processor ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="Skill Processor"
    >
      {/* Facility Header */}
      <header className="skill-header">
        <div className="skill-badge">
          <Terminal size={13} />
          <span>FACILITY CODE: ROOM-07 // CAPABILITY MATRIX</span>
        </div>

        <div className="skill-headline-group">
          <h1 className="skill-title">Skill Processor</h1>
          <p className="skill-subtitle">
            Technical capability analysis, architectural toolchain, and verified
            competency matrix. Inspect qualitative proficiency tiers and trace
            direct linkages into engineered systems and project codebases.
          </p>
        </div>

        {/* Telemetry Statistics Grid */}
        <div className="skill-stats-grid">
          <div className="skill-stat-box">
            <span className="skill-stat-value">{telemetry.totalSkills}</span>
            <span className="skill-stat-label">Core Competencies</span>
          </div>
          <div className="skill-stat-box">
            <span className="skill-stat-value" style={{ color: "#38bdf8" }}>
              {telemetry.highTierCount}
            </span>
            <span className="skill-stat-label">Expert & Advanced</span>
          </div>
          <div className="skill-stat-box">
            <span className="skill-stat-value" style={{ color: "#34d399" }}>
              {telemetry.categoryCount}
            </span>
            <span className="skill-stat-label">Technical Domains</span>
          </div>
          <div className="skill-stat-box">
            <span className="skill-stat-value" style={{ color: "#facc15" }}>
              {telemetry.linkedProjectsCount}
            </span>
            <span className="skill-stat-label">Backed Projects</span>
          </div>
        </div>
      </header>

      {/* Technical Domain Distribution Summary */}
      <section
        className="skill-domain-summary"
        aria-label="Technical Domain Distribution"
      >
        <div className="skill-domain-header">
          <span className="skill-domain-title">
            <Cpu size={14} color="#38bdf8" />
            <span>Capability Domain Distribution</span>
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              color: "#64748b",
            }}
          >
            {allSkills.length} Total Verified Nodes
          </span>
        </div>

        {/* Proportional Distribution Bar */}
        <div className="domain-bar-track" aria-hidden="true">
          {existingCategories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const pct = (count / allSkills.length) * 100;
            return (
              <div
                key={cat}
                className="domain-bar-segment"
                style={{
                  width: `${pct}%`,
                  backgroundColor: CATEGORY_COLORS[cat] || "#38bdf8",
                }}
                title={`${CATEGORY_NAMES[cat] || cat}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="domain-legend">
          {existingCategories.map((cat) => (
            <div key={cat} className="domain-legend-item">
              <div
                className="domain-dot"
                style={{
                  backgroundColor: CATEGORY_COLORS[cat] || "#38bdf8",
                }}
              />
              <span>
                {CATEGORY_NAMES[cat] || cat} ({categoryCounts[cat] || 0})
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filtering & Search Controls */}
      <div className="skill-controls">
        <div className="skill-filter-pills" role="tablist" aria-label="Skill categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            className={`skill-filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <Layers size={13} />
            <span>All Domains</span>
            <span className="skill-filter-count">{categoryCounts.all || 0}</span>
          </button>

          {existingCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`skill-filter-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span>{CATEGORY_NAMES[cat] || cat}</span>
              <span className="skill-filter-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="skill-search-wrapper">
          <Search size={14} className="skill-search-icon" />
          <input
            type="text"
            className="skill-search-input"
            placeholder="Search competencies, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search competencies by keyword, tool, or project"
          />
        </div>
      </div>

      {/* Capability Matrix Grid */}
      <section className="vault-section" aria-label="Capability Matrix Grid">
        {filteredSkills.length > 0 ? (
          <div className="skill-matrix-grid">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onSelect={handleSelectSkill}
              />
            ))}
          </div>
        ) : (
          <div className="skill-empty-state">
            <Filter size={32} color="#64748b" />
            <h3 style={{ color: "#f1f5f9", margin: 0 }}>
              No matching competencies found
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              No skills match your filter or search query "{searchQuery}".
            </p>
            <button
              type="button"
              className="skill-filter-btn active"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              style={{ marginTop: 8 }}
            >
              <Sparkles size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* Skill Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        onClose={handleCloseSkill}
      />
    </section>
  );
}
