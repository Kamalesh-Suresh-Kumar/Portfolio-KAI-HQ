import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { knowledgeEngine } from "../../knowledge-engine";
import { useExperienceEngine, getSearchResultParams } from "../../experience-engine";
import {
  Search,
  Command,
  Home,
  Laptop,
  Brain,
  Trophy,
  FolderOpen,
  MessageSquare,
  Cpu,
  Radio,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "KAI HQ Actions" | "Search Result";
  icon: React.ReactNode;
  action: () => void;
  subtext?: string;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { changeRoom, openKAI, mode, setMode } = useExperienceEngine();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus and lock body scroll on mount
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Standard Facility Navigation Commands
  const standardCommands: CommandItem[] = useMemo(() => [
    {
      id: "cmd-lobby",
      title: "Go to Lobby",
      category: "Navigation",
      icon: <Home size={15} color="#38bdf8" />,
      subtext: "ROOM-01 // Orientation & Core Systems",
      action: () => {
        changeRoom("Lobby");
        onClose();
      },
    },
    {
      id: "cmd-eng-lab",
      title: "Open Engineering Laboratory",
      category: "Navigation",
      icon: <Laptop size={15} color="#38bdf8" />,
      subtext: "ROOM-02 // Software Projects & Architectures",
      action: () => {
        changeRoom("EngineeringLaboratory");
        onClose();
      },
    },
    {
      id: "cmd-memory-archive",
      title: "Open Memory Archive",
      category: "Navigation",
      icon: <Brain size={15} color="#34d399" />,
      subtext: "ROOM-03 // Career & Academic History",
      action: () => {
        changeRoom("MemoryArchive");
        onClose();
      },
    },
    {
      id: "cmd-achievement-hall",
      title: "Open Achievement Hall",
      category: "Navigation",
      icon: <Trophy size={15} color="#facc15" />,
      subtext: "ROOM-04 // Credentials & Verifications",
      action: () => {
        changeRoom("AchievementHall");
        onClose();
      },
    },
    {
      id: "cmd-document-vault",
      title: "Open Document Vault",
      category: "Navigation",
      icon: <FolderOpen size={15} color="#f472b6" />,
      subtext: "ROOM-05 // Deliverable Documents & Resumes",
      action: () => {
        changeRoom("DocumentVault");
        onClose();
      },
    },
    {
      id: "cmd-comm-center",
      title: "Open Communication Center",
      category: "Navigation",
      icon: <MessageSquare size={15} color="#818cf8" />,
      subtext: "ROOM-06 // Communication & Outlets",
      action: () => {
        changeRoom("CommunicationCenter");
        onClose();
      },
    },
    {
      id: "cmd-skill-processor",
      title: "Open Skill Processor",
      category: "Navigation",
      icon: <Cpu size={15} color="#38bdf8" />,
      subtext: "ROOM-07 // Skills & Proficiencies",
      action: () => {
        changeRoom("SkillProcessor");
        onClose();
      },
    },
    {
      id: "cmd-mission-control",
      title: "Open Mission Control",
      category: "Navigation",
      icon: <Radio size={15} color="#a855f7" />,
      subtext: "ROOM-08 // Command & Search Operations",
      action: () => {
        changeRoom("MissionControl");
        onClose();
      },
    },
    {
      id: "cmd-kai-assistant",
      title: "Launch KAI Assistant",
      category: "KAI HQ Actions",
      icon: <Sparkles size={15} color="#38bdf8" />,
      subtext: "Open conversational assistant sidebar",
      action: () => {
        openKAI();
        onClose();
      },
    },
    {
      id: "cmd-mode-recruiter",
      title: "Switch to Recruiter Mode",
      category: "KAI HQ Actions",
      icon: <Sparkles size={15} color="#34d399" />,
      subtext: "Prioritize resume variants, credentials & screening",
      action: () => {
        setMode("recruiter");
        onClose();
      },
    },
    {
      id: "cmd-mode-developer",
      title: "Switch to Developer Mode",
      category: "KAI HQ Actions",
      icon: <Sparkles size={15} color="#38bdf8" />,
      subtext: "Prioritize architecture notes, code links & telemetry",
      action: () => {
        setMode("developer");
        onClose();
      },
    },
    {
      id: "cmd-mode-neutral",
      title: "Switch to Neutral Tour",
      category: "KAI HQ Actions",
      icon: <Sparkles size={15} color="#94a3b8" />,
      subtext: "Balanced perspective across all facilities",
      action: () => {
        setMode("neutral");
        onClose();
      },
    },
  ], [changeRoom, openKAI, setMode, onClose]);

  // If query is present, search knowledge engine as well as filtering commands
  const displayedItems: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return standardCommands;
    }

    // Filter standard commands
    const matchingStandard = standardCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtext && c.subtext.toLowerCase().includes(q))
    );

    // Get search results from Knowledge Engine with mode-aware scoring
    const searchResults = knowledgeEngine.search(q, { mode });
    const searchItems: CommandItem[] = searchResults.slice(0, 6).map((res) => {
      const { targetRoom, params } = getSearchResultParams(res);
      return {
        id: `search-${res.type}-${res.id}`,
        title: res.title,
        category: "Search Result",
        icon: <Search size={14} color="#38bdf8" />,
        subtext: `[${res.type.toUpperCase()}] → Inspect in ${targetRoom}`,
        action: () => {
          changeRoom(targetRoom, params);
          onClose();
        },
      };
    });

    return [...matchingStandard, ...searchItems];
  }, [query, standardCommands, changeRoom, mode, onClose]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayedItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedItems.length) % (displayedItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (displayedItems[selectedIndex]) {
        displayedItems[selectedIndex].action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="cmd-palette-backdrop"
      onClick={onClose}
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <div
        className="cmd-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="KAI HQ Command Palette"
      >
        {/* Input header */}
        <div className="cmd-palette-input-wrap">
          <Command size={18} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command or search knowledge index..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-label="Command search input"
          />
          <button
            type="button"
            className="skill-modal-close-btn"
            onClick={onClose}
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results list */}
        <div className="cmd-palette-results" ref={listRef} role="listbox">
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={idx === selectedIndex}
                className={`cmd-palette-item ${idx === selectedIndex ? "selected" : ""}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="cmd-item-left">
                  {item.icon}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="cmd-item-title">{item.title}</span>
                    {item.subtext && <span className="cmd-item-sub">{item.subtext}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))
          ) : (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748b" }}>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>
                No commands or search matches for "{query}"
              </p>
            </div>
          )}
        </div>

        {/* Footer with shortcuts */}
        <div className="cmd-palette-footer">
          <div className="cmd-footer-shortcuts">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to dismiss</span>
          </div>
          <span>KAI HQ COMMAND SYSTEM</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
