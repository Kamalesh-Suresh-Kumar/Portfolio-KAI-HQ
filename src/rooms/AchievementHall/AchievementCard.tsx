import type { Achievement } from "../../knowledge-engine/types";
import {
  Award,
  ShieldCheck,
  Calendar,
  Building,
  Star,
  ArrowUpRight,
  FileCheck,
  GraduationCap,
} from "lucide-react";

interface AchievementCardProps {
  achievement: Achievement;
  onInspect: (achievement: Achievement) => void;
}

export default function AchievementCard({
  achievement,
  onInspect,
}: AchievementCardProps) {
  const categoryLabels: Record<string, string> = {
    demonstration: "Cybersecurity Demo",
    certification: "Technical Certification",
    leadership: "Leadership & Cadetship",
    academic: "Academic Distinction",
    hackathon: "Hackathon & Challenge",
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "demonstration":
        return <ShieldCheck size={13} />;
      case "certification":
        return <FileCheck size={13} />;
      case "leadership":
        return <Award size={13} />;
      case "academic":
        return <GraduationCap size={13} />;
      default:
        return <Award size={13} />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onInspect(achievement);
    }
  };

  return (
    <article
      className={`achievement-card ${achievement.highlight ? "card-highlighted" : ""}`}
      onClick={() => onInspect(achievement)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Inspect ${achievement.title} issued by ${achievement.issuer}`}
    >
      <div className="achievement-card-top">
        <div className="achievement-meta-row">
          <span
            className={`achievement-cat-badge cat-${achievement.category}`}
          >
            {getCategoryIcon(achievement.category)}
            <span>{categoryLabels[achievement.category] || achievement.category}</span>
          </span>

          {achievement.highlight && (
            <span className="achievement-highlight-pill">
              <Star size={11} fill="#fbbf24" />
              <span>Verified Highlight</span>
            </span>
          )}
        </div>

        <div className="achievement-title-group">
          <h3 className="achievement-card-title">{achievement.title}</h3>
          <div className="achievement-issuer-row">
            <Building size={14} color="#64748b" />
            <span>{achievement.issuer}</span>
          </div>
        </div>

        <p className="achievement-card-desc">{achievement.description}</p>
      </div>

      <div className="achievement-card-bottom">
        <span className="achievement-date">
          <Calendar size={12} style={{ display: "inline", marginRight: 4 }} />
          {achievement.date}
        </span>

        <button
          type="button"
          className="achievement-inspect-btn"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(achievement);
          }}
          aria-label={`Inspect verification details for ${achievement.title}`}
        >
          <span>Inspect Record</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </article>
  );
}
