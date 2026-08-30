import { useState, useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import type { SearchResult } from "../../knowledge-engine/types";
import { useExperienceEngine, getSearchResultParams } from "../../experience-engine";
import type { Room } from "../../experience-engine/ExperienceEngineContext";
import {
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  Command,
} from "lucide-react";

interface GlobalSearchProps {
  onOpenCommandPalette?: () => void;
}

type TypeFilter = "all" | SearchResult["type"];

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  project: "Project",
  skill: "Skill",
  timeline: "Timeline",
  achievement: "Achievement",
  resume: "Resume",
  room: "Facility Room",
};

const ROOM_DISPLAY_NAMES: Record<Room, string> = {
  Lobby: "Lobby",
  EngineeringLaboratory: "Engineering Laboratory",
  MemoryArchive: "Memory Archive",
  AchievementHall: "Achievement Hall",
  DocumentVault: "Document Vault",
  CommunicationCenter: "Communication Center",
  SkillProcessor: "Skill Processor",
  MissionControl: "Mission Control",
};

export default function GlobalSearch({ onOpenCommandPalette }: GlobalSearchProps) {
  const { changeRoom } = useExperienceEngine();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<TypeFilter>("all");

  // Call the single-source-of-truth search API from Knowledge Engine
  const rawResults = useMemo(() => {
    if (!query.trim()) return [];
    return knowledgeEngine.search(query);
  }, [query]);

  // Compute filter counts for the current query
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rawResults.length };
    for (const r of rawResults) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }
    return counts;
  }, [rawResults]);

  // Filter results by active type
  const filteredResults = useMemo(() => {
    if (activeType === "all") return rawResults;
    return rawResults.filter((r) => r.type === activeType);
  }, [rawResults, activeType]);

  const handleResultClick = (result: SearchResult) => {
    const { targetRoom, params } = getSearchResultParams(result);
    changeRoom(targetRoom, params);
  };

  const handleKeyDown = (e: React.KeyboardEvent, result: SearchResult) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleResultClick(result);
    }
  };

  return (
    <section className="search-console-section" aria-label="Global Portfolio Search">
      <div className="search-console-header">
        <div className="search-console-title-group">
          <h2 className="search-console-title">
            <Search size={18} color="#38bdf8" />
            <span>Search KAI HQ Knowledge Base</span>
          </h2>
          <p className="search-console-subtitle">
            Universal deterministic search indexing all engineering projects, competencies, career milestones, certifications, and documents.
          </p>
        </div>

        {onOpenCommandPalette && (
          <button
            type="button"
            className="mission-cmd-btn"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
          >
            <Command size={14} />
            <span>Command Palette</span>
            <kbd className="mission-kbd">⌘K / Ctrl+K</kbd>
          </button>
        )}
      </div>

      {/* Main Search Input */}
      <div className="search-input-box">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          className="search-main-input"
          placeholder="Search projects, skills, timeline, achievements, resumes, rooms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Global portfolio search query"
        />
        <div className="search-input-shortcut">
          <kbd className="mission-kbd">ESC to clear</kbd>
        </div>
      </div>

      {/* Type Filters */}
      {query.trim().length > 0 && (
        <div className="search-type-filters" role="tablist" aria-label="Search result types">
          <button
            type="button"
            role="tab"
            aria-selected={activeType === "all"}
            className={`search-filter-pill ${activeType === "all" ? "active" : ""}`}
            onClick={() => setActiveType("all")}
          >
            <Layers size={12} />
            <span>All Results</span>
            <span className="search-filter-count">{typeCounts.all || 0}</span>
          </button>

          {(["project", "skill", "timeline", "achievement", "resume", "room"] as SearchResult["type"][]).map(
            (type) => {
              const count = typeCounts[type] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={activeType === type}
                  className={`search-filter-pill ${activeType === type ? "active" : ""}`}
                  onClick={() => setActiveType(type)}
                >
                  <span>{TYPE_LABELS[type]}</span>
                  <span className="search-filter-count">{count}</span>
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Results Container */}
      <div className="search-results-container" aria-live="polite">
        {query.trim().length > 0 ? (
          filteredResults.length > 0 ? (
            <>
              <div className="search-results-summary">
                <span>
                  FOUND {filteredResults.length} MATCH{filteredResults.length === 1 ? "" : "ES"} ACROSS KAI HQ INDEX
                </span>
                <span>SELECT TO NAVIGATE DIRECTLY</span>
              </div>

              {filteredResults.map((result) => {
                const targetFacility = ROOM_DISPLAY_NAMES[result.targetRoom as Room] || result.targetRoom;
                return (
                  <article
                    key={`${result.type}-${result.id}`}
                    className="search-result-card"
                    tabIndex={0}
                    role="button"
                    onClick={() => handleResultClick(result)}
                    onKeyDown={(e) => handleKeyDown(e, result)}
                    aria-label={`Inspect ${result.title} in ${targetFacility}`}
                  >
                    <div className="search-result-header">
                      <div className="search-result-title-group">
                        <span className={`type-badge ${result.type}`}>
                          {result.type}
                        </span>
                        <h3 className="search-result-title">{result.title}</h3>
                      </div>

                      <div className="search-result-action">
                        <span>Inspect in {targetFacility}</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>

                    <p className="search-result-summary-text">{result.summary}</p>
                  </article>
                );
              })}
            </>
          ) : (
            <div className="search-empty-prompt">
              <Sparkles size={24} color="#64748b" />
              <p style={{ margin: 0, color: "#f1f5f9", fontWeight: 600 }}>
                No indexed entries match "{query}"
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>
                Try searching for technologies (e.g. "React", "Python", "Docker"), domains ("cybersecurity", "backend"), or rooms ("Laboratory", "Vault").
              </p>
            </div>
          )
        ) : (
          <div className="search-empty-prompt">
            <Search size={22} color="#64748b" />
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.88rem" }}>
              Begin typing in the search console above or press <kbd className="mission-kbd">⌘K / Ctrl+K</kbd> to launch the command palette.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
