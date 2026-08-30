import { useMemo } from "react";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine } from "../../experience-engine";
import { Trophy, Award, ShieldCheck, ArrowRight } from "lucide-react";

export default function FeaturedAchievementsSection() {
  const { changeRoom, setAssistantFocus } = useExperienceEngine();

  const achievements = useMemo(() => {
    return knowledgeEngine.getAchievements().filter((a) => a.highlight);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "demonstration":
        return <ShieldCheck size={18} color="#38bdf8" />;
      case "certification":
        return <Award size={18} color="#facc15" />;
      default:
        return <Trophy size={18} color="#34d399" />;
    }
  };

  return (
    <section className="lobby-achievements-section" aria-label="Verified Credentials & Honors">
      <div className="lobby-section-header">
        <div>
          <span className="lobby-sub-badge">// ACHIEVEMENT HALL</span>
          <h2 className="lobby-section-title">Verified Honors & Security Briefings</h2>
        </div>
        <button
          type="button"
          className="lobby-text-cta"
          onClick={() => changeRoom("AchievementHall")}
        >
          <span>View All in Hall</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="lobby-achievements-grid">
        {achievements.map((ach) => (
          <div key={ach.id} className="lobby-achievement-card">
            <div className="achievement-card-top">
              <div className="achievement-icon-wrapper">
                {getCategoryIcon(ach.category)}
              </div>
              <span className="achievement-date-chip">{ach.date}</span>
            </div>

            <h3 className="achievement-title">{ach.title}</h3>
            <span className="achievement-issuer">Issued by: {ach.issuer}</span>
            <p className="achievement-desc">{ach.description}</p>

            <div className="achievement-card-bottom">
              <button
                type="button"
                className="btn-achievement-action"
                onClick={() => {
                  setAssistantFocus({
                    contextPrompt: `Tell me about the achievement: ${ach.title}`,
                  });
                  changeRoom("AchievementHall", { achievement: ach.id });
                }}
              >
                <span>Inspect Record</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
