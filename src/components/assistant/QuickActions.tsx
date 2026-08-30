import { memo } from "react";
import {
  FolderGit2,
  Cpu,
  Clock,
  Trophy,
  FileText,
  Mail,
  Compass,
} from "lucide-react";

interface QuickActionsProps {
  onSelectAction: (query: string) => void;
  customReplies?: string[];
}

const DEFAULT_ACTIONS = [
  { label: "Explore Projects", query: "Show projects", icon: <FolderGit2 size={12} /> },
  { label: "Inspect Skills", query: "What are your skills?", icon: <Cpu size={12} /> },
  { label: "Career Timeline", query: "Show career timeline", icon: <Clock size={12} /> },
  { label: "Certifications", query: "View achievements and certifications", icon: <Trophy size={12} /> },
  { label: "Open Resume", query: "Show me your resume", icon: <FileText size={12} /> },
  { label: "Contact Channels", query: "How to contact?", icon: <Mail size={12} /> },
  { label: "Mission Control", query: "Open Mission Control", icon: <Compass size={12} /> },
];

function QuickActions({ onSelectAction, customReplies }: QuickActionsProps) {
  if (customReplies && customReplies.length > 0) {
    return (
      <div className="kai-quick-actions-bar" aria-label="Suggested quick replies">
        {customReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            className="kai-quick-chip"
            onClick={() => onSelectAction(reply)}
            aria-label={`Ask: ${reply}`}
          >
            <span>{reply}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="kai-quick-actions-bar" aria-label="Quick inquiry suggestions">
      {DEFAULT_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          className="kai-quick-chip"
          onClick={() => onSelectAction(action.query)}
          aria-label={`Ask: ${action.query}`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(QuickActions);
