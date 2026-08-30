import { knowledgeEngine } from "../knowledge-engine";
import type { RoomMetadata } from "../knowledge-engine/types";
import type { Room } from "../experience-engine/ExperienceEngineContext";
import type { AssistantMessage } from "./types";
import type { IntentRouteResult } from "./intentRouter";

export function getGreetingMessage(): AssistantMessage {
  const contact = knowledgeEngine.getContact();
  return {
    id: `msg-${Date.now()}-greeting`,
    role: "kai",
    content: `Systems operational. I am KAI, your portfolio guide for ${contact.name}'s headquarters. I can direct you through engineering projects, technical skills, career milestones, verified credentials, role-specific resumes, or communication channels.`,
    timestamp: Date.now(),
    intent: "greeting",
    actions: [
      {
        label: "Open Engineering Lab",
        targetRoom: "EngineeringLaboratory",
        description: "Explore featured software architectures",
      },
      {
        label: "Open Skill Processor",
        targetRoom: "SkillProcessor",
        description: "Inspect technical competencies",
      },
    ],
    quickReplies: [
      "Show projects",
      "What are your skills?",
      "Career timeline",
      "View resumes",
      "How to contact?",
    ],
  };
}

export function generateAssistantResponse(route: IntentRouteResult): AssistantMessage {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = Date.now();

  switch (route.intent) {
    case "greeting":
      return getGreetingMessage();

    case "projects": {
      const projects = knowledgeEngine.getProjects();
      const featured = projects.slice(0, 3);
      const projectList = featured.map((p) => `• ${p.title}: ${p.summary}`).join("\n");

      return {
        id,
        role: "kai",
        content: `Indexed ${projects.length} engineering projects. Key featured projects include:\n\n${projectList}\n\nYou can inspect live demos, architecture specs, and metrics in the Engineering Laboratory.`,
        timestamp,
        intent: "projects",
        actions: [
          {
            label: "Open Engineering Laboratory",
            targetRoom: "EngineeringLaboratory",
            description: "View all project specifications and code architectures",
          },
        ],
        quickReplies: ["Inspect skills", "View timeline", "Open Resume"],
      };
    }

    case "skills": {
      const skills = knowledgeEngine.getSkills();
      const topSkills = skills
        .filter((s) => s.proficiencyLevel === "expert" || s.proficiencyLevel === "advanced")
        .slice(0, 6)
        .map((s) => s.name)
        .join(", ");

      return {
        id,
        role: "kai",
        content: `Indexed ${skills.length} technical skills across Languages, Frameworks, Cybersecurity & Infrastructure.\n\nCore advanced competencies: ${topSkills}.\n\nAccess proficiency telemetry, domain filters, and detailed specs in the Skill Processor.`,
        timestamp,
        intent: "skills",
        actions: [
          {
            label: "Open Skill Processor",
            targetRoom: "SkillProcessor",
            description: "Explore interactive capability matrix and proficiency filters",
          },
        ],
        quickReplies: ["Show projects", "View certifications", "Inspect timeline"],
      };
    }

    case "timeline": {
      const timeline = knowledgeEngine.getTimeline();
      const recent = timeline.slice(0, 2);
      const timelineSummary = recent
        .map((t) => `• ${t.period}: ${t.role} at ${t.organization}`)
        .join("\n");

      return {
        id,
        role: "kai",
        content: `Indexed ${timeline.length} career and academic milestones:\n\n${timelineSummary}\n\nReview complete chronological work records, key deliverables, and education in the Memory Archive.`,
        timestamp,
        intent: "timeline",
        actions: [
          {
            label: "Open Memory Archive",
            targetRoom: "MemoryArchive",
            description: "Inspect chronological experience and academic records",
          },
        ],
        quickReplies: ["Show projects", "View resumes", "Contact channels"],
      };
    }

    case "achievements": {
      const achievements = knowledgeEngine.getAchievements();
      const items = achievements.map((a) => `• ${a.title} (${a.issuer}, ${a.date})`).join("\n");

      return {
        id,
        role: "kai",
        content: `Indexed ${achievements.length} verified credentials and honors:\n\n${items}\n\nExamine verified badges and credential details in the Achievement Hall.`,
        timestamp,
        intent: "achievements",
        actions: [
          {
            label: "Open Achievement Hall",
            targetRoom: "AchievementHall",
            description: "View verified certifications and honors",
          },
        ],
        quickReplies: ["Inspect skills", "View resumes", "Show projects"],
      };
    }

    case "resumes": {
      const variants = knowledgeEngine.getResumeVariants();
      const variantList = variants.map((v) => `• ${v.roleTitle} (${v.bestFor})`).join("\n");

      return {
        id,
        role: "kai",
        content: `Document Vault hosts ${variants.length} role-targeted resume specifications:\n\n${variantList}\n\nYou can preview customized matrices and download printable copies directly from the vault.`,
        timestamp,
        intent: "resumes",
        actions: [
          {
            label: "Open Document Vault",
            targetRoom: "DocumentVault",
            description: "Access role-tailored resumes and print downloads",
          },
        ],
        quickReplies: ["Show projects", "Contact channels", "Inspect skills"],
      };
    }

    case "contact": {
      const contact = knowledgeEngine.getContact();

      return {
        id,
        role: "kai",
        content: `Direct communication outlets for ${contact.name}:\n\n• Email: ${contact.email}\n• Location: ${contact.location}\n• GitHub: github.com/${contact.github}\n• LinkedIn: linkedin.com/in/${contact.linkedin || "profile"}\n\nYou can dispatch direct messages or copy communication handles in the Communication Center.`,
        timestamp,
        intent: "contact",
        actions: [
          {
            label: "Open Communication Center",
            targetRoom: "CommunicationCenter",
            description: "Access direct messaging console and social channels",
          },
        ],
        quickReplies: ["View resumes", "Show projects", "Open Mission Control"],
      };
    }

    case "room_navigation": {
      const room = route.matchedRoom || "Lobby";
      const roomMeta = knowledgeEngine.getRoomMetadata(room) as RoomMetadata | undefined;

      const roomName = roomMeta?.name || room;
      const roomDesc = roomMeta?.description || "Facility room in KAI HQ";

      return {
        id,
        role: "kai",
        content: `Routing coordinate locked: ${roomName} (${roomMeta?.code || "ROOM"}).\n\n${roomDesc}`,
        timestamp,
        intent: "room_navigation",
        actions: [
          {
            label: `Enter ${roomName}`,
            targetRoom: room as Room,
            description: `Navigate to ${roomName}`,
          },
        ],
        quickReplies: ["Show projects", "Inspect skills", "Open Mission Control"],
      };
    }

    case "help": {
      return {
        id,
        role: "kai",
        content: `I can guide your inspection across the following areas:\n\n• Projects — Architectural breakdowns & tech stacks\n• Skills — Proficiency levels & categorical filters\n• Timeline — Career history & academic milestones\n• Achievements — Verified certifications & awards\n• Resumes — 4 role-tailored curriculum vitae\n• Contact — Direct channels & communication status\n• Navigation — Instant jump to any of the 8 HQ rooms`,
        timestamp,
        intent: "help",
        actions: [
          {
            label: "Open Mission Control",
            targetRoom: "MissionControl",
            description: "Access global search and system telemetry",
          },
        ],
        quickReplies: [
          "Explore projects",
          "Inspect skills",
          "Career timeline",
          "Download resume",
          "Contact channels",
        ],
      };
    }

    case "unknown":
    default: {
      return {
        id,
        role: "kai",
        content: `I didn't recognize that command in my index. I can assist you with projects, technical skills, career timeline, achievements, resumes, contact channels, or facility navigation.`,
        timestamp,
        intent: "unknown",
        actions: [
          {
            label: "Open Mission Control Search",
            targetRoom: "MissionControl",
            description: "Search the full deterministic index across all entities",
          },
        ],
        quickReplies: [
          "Show projects",
          "What are your skills?",
          "Career timeline",
          "View resumes",
          "How to contact?",
        ],
      };
    }
  }
}
