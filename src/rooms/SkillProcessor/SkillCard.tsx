import type { Skill, SkillCategory } from "../../knowledge-engine/types";
import { FolderGit2, ChevronRight, Layers } from "lucide-react";

interface SkillCardProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: "Language",
  frameworks: "Framework / Library",
  cybersecurity_systems: "Cybersecurity & Systems",
  tools_infrastructure: "Tool / Infrastructure",
  domains: "Architecture & Domain",
};

export default function SkillCard({ skill, onSelect }: SkillCardProps) {
  // Map qualitative proficiency level to discrete capability bar count (1 to 4)
  const getProficiencyTier = (level: Skill["proficiencyLevel"]): number => {
    switch (level) {
      case "expert":
        return 4;
      case "advanced":
        return 3;
      case "intermediate":
        return 2;
      case "foundational":
        return 1;
      default:
        return 1;
    }
  };

  const tier = getProficiencyTier(skill.proficiencyLevel);
  const categoryLabel = CATEGORY_LABELS[skill.category] || skill.category;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(skill);
    }
  };

  return (
    <article
      className="skill-card"
      tabIndex={0}
      role="button"
      onClick={() => onSelect(skill)}
      onKeyDown={handleKeyDown}
      aria-label={`Inspect ${skill.name} capability (${skill.proficiencyLevel} tier)`}
    >
      <div className="skill-card-top">
        <div className="skill-card-header">
          <h3 className="skill-card-title">{skill.name}</h3>
          <span className="skill-cat-pill">{categoryLabel}</span>
        </div>

        {skill.description && (
          <p className="skill-card-desc">{skill.description}</p>
        )}

        {/* Discrete Capability Meter */}
        <div className="capability-meter-wrap" aria-label={`Proficiency: ${skill.proficiencyLevel}`}>
          <div className="capability-meter-header">
            <span style={{ color: "#94a3b8" }}>Proficiency Tier</span>
            <span className={`capability-level-label level-${skill.proficiencyLevel}`}>
              {skill.proficiencyLevel}
            </span>
          </div>

          <div className="capability-bars" aria-hidden="true">
            {[1, 2, 3, 4].map((blockIndex) => (
              <div
                key={blockIndex}
                className={`meter-block ${
                  blockIndex <= tier ? `filled level-${skill.proficiencyLevel}` : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="skill-card-bottom">
        <div className="skill-projects-count">
          <FolderGit2 size={13} />
          <span>
            {skill.linkedProjectIds.length === 1
              ? "1 Linked Project"
              : `${skill.linkedProjectIds.length} Linked Projects`}
          </span>
        </div>

        <div className="skill-inspect-cue">
          <Layers size={12} />
          <span>Inspect</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </article>
  );
}
