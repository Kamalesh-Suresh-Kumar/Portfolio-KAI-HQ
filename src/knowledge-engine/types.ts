/**
 * KAI HQ Knowledge Engine - Type Definitions
 * Based on KAI HQ Technical Design Document (Volume 3 §6)
 */

export type RoomId =
  | 'Lobby'
  | 'EngineeringLaboratory'
  | 'MemoryArchive'
  | 'AchievementHall'
  | 'DocumentVault'
  | 'CommunicationCenter'
  | 'SkillProcessor'
  | 'MissionControl';

export type ProjectDomain =
  | 'fullstack'
  | 'backend'
  | 'frontend'
  | 'cybersecurity'
  | 'devops'
  | 'ai-ml';

export interface Project {
  id: string;
  title: string;
  domain: ProjectDomain;
  summary: string;
  description: string;
  stack: string[];
  links: {
    repo?: string;
    demo?: string;
    documentation?: string;
  };
  engineeringDecision?: string;
  relatedSkillIds: string[];
  featured: boolean;
  metrics?: string[];
  status: 'production' | 'completed' | 'active' | 'research';
}

export type SkillCategory =
  | 'languages'
  | 'frameworks'
  | 'cybersecurity_systems'
  | 'tools_infrastructure'
  | 'domains';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiencyLevel: 'expert' | 'advanced' | 'intermediate' | 'foundational';
  linkedProjectIds: string[];
  description?: string;
  iconName?: string;
}

export type TimelineCategory =
  | 'education'
  | 'internship'
  | 'leadership'
  | 'extracurricular';

export interface ExperienceTimeline {
  id: string;
  title: string;
  organization: string;
  role: string;
  period: string;
  startDate: string;
  endDate?: string;
  location: string;
  category: TimelineCategory;
  description: string;
  keyAchievements: string[];
  active?: boolean;
}

export type AchievementCategory =
  | 'demonstration'
  | 'certification'
  | 'leadership'
  | 'hackathon'
  | 'academic';

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: AchievementCategory;
  description: string;
  credentialUrl?: string;
  verificationId?: string;
  relatedProjectIds?: string[];
  highlight?: boolean;
}

export interface ResumeVariant {
  id: string;
  label: string;
  roleTitle: string;
  bestFor: string;
  fileUrl: string;
  lastUpdated: string;
  highlights: string[];
  skillsSummary: string[];
}

export interface ContactPayload {
  name: string;
  title: string;
  tagline: string;
  email: string;
  github: string;
  portfolioRepo: string;
  kaiNexus?: {
    name: string;
    description: string;
    url: string;
  };
  location: string;
  availability: string;
  bio: string;
  systemStatus: {
    status: 'OPTIMAL' | 'ONLINE' | 'ACTIVE';
    version: string;
    mode: string;
  };
}

export interface RoomMetadata {
  id: RoomId;
  name: string;
  subtitle: string;
  code: string;
  domain: string;
  description: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'skill' | 'timeline' | 'achievement' | 'resume' | 'room';
  targetRoom: RoomId;
  summary: string;
  matchedFields: string[];
  score: number;
}

export interface KnowledgeBaseData {
  schemaVersion: string;
  generatedAt: string;
  owner: string;
  contact: ContactPayload;
  projects: Project[];
  skills: Skill[];
  timeline: ExperienceTimeline[];
  achievements: Achievement[];
  resumes: ResumeVariant[];
  rooms: RoomMetadata[];
}
