import type { ExperienceTimeline } from "../../knowledge-engine/types";
import {
  Calendar,
  Building,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Award,
  Users,
} from "lucide-react";

interface TimelineCardProps {
  item: ExperienceTimeline;
  isHighlighted?: boolean;
}

export default function TimelineCard({ item, isHighlighted }: TimelineCardProps) {
  const categoryLabels: Record<string, string> = {
    education: "Academic & Systems",
    internship: "Software Internship",
    leadership: "Leadership & Cadetship",
    extracurricular: "Technical Society",
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "education":
        return <GraduationCap size={14} />;
      case "internship":
        return <Briefcase size={14} />;
      case "leadership":
        return <Award size={14} />;
      case "extracurricular":
        return <Users size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };

  return (
    <div className="timeline-node" id={`timeline-${item.id}`}>
      {/* Node pin on spine */}
      <div
        className={`timeline-node-marker ${item.active || isHighlighted ? "active-node" : ""}`}
        aria-hidden="true"
      >
        <div className="timeline-node-inner-dot" />
      </div>

      {/* Milestone Content Card */}
      <article
        className={`milestone-card ${isHighlighted ? "highlighted-node" : ""}`}
        style={
          isHighlighted
            ? {
                borderColor: "#38bdf8",
                boxShadow: "0 0 24px rgba(56, 189, 248, 0.3)",
                background: "rgba(15, 23, 42, 0.95)",
              }
            : undefined
        }
        tabIndex={0}
        aria-label={`${item.title} at ${item.organization}, ${item.period}`}
      >
        <div className="milestone-card-header">
          <div className="milestone-meta-row">
            <span className="milestone-period-badge">
              <Calendar size={12} />
              <span>{item.period}</span>
            </span>

            <span className={`milestone-category-badge cat-${item.category}`}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {getCategoryIcon(item.category)}
                <span>{categoryLabels[item.category] || item.category}</span>
              </span>
            </span>
          </div>

          <div className="milestone-title-group">
            <h3 className="milestone-title">{item.title}</h3>
            <div className="milestone-org">
              <Building size={14} color="#64748b" />
              <span>
                {item.role} • {item.organization}
              </span>
            </div>
          </div>
        </div>

        <p className="milestone-description">{item.description}</p>

        {item.keyAchievements && item.keyAchievements.length > 0 && (
          <div className="milestone-achievements">
            <h4 className="milestone-achievements-title">
              Key Contributions & Highlights
            </h4>
            <ul className="milestone-achievements-list">
              {item.keyAchievements.map((ach) => (
                <li key={ach} className="milestone-achievement-item">
                  <CheckCircle2
                    size={14}
                    color="#38bdf8"
                    style={{ flexShrink: 0, marginTop: 3 }}
                  />
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
