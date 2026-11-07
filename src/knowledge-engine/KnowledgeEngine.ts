import { contactData } from './data/contact';
import { projectsData } from './data/projects';
import { skillsData } from './data/skills';
import { timelineData } from './data/timeline';
import { achievementsData } from './data/achievements';
import { resumeVariantsData } from './data/resumes';
import { roomsMetadata } from './data/rooms';
import type {
  Project,
  ProjectDomain,
  Skill,
  SkillCategory,
  ExperienceTimeline,
  TimelineCategory,
  Achievement,
  AchievementCategory,
  ResumeVariant,
  ContactPayload,
  RoomId,
  RoomMetadata,
  SearchResult,
  KnowledgeBaseData,
} from './types';

/**
 * KnowledgeEngine
 * Central typed query and search interface for KAI HQ portfolio data.
 * Implements read-only static knowledge access per KAI-HQ Technical Design (Volume 3 §6).
 */
export class KnowledgeEngine {
  private readonly schemaVersion = '1.0.0';
  private readonly generatedAt = new Date().toISOString();
  private readonly owner = 'Kamalesh Suresh Kumar';

  // --- Contact & Profile Queries ---
  public getContact(): ContactPayload {
    return { ...contactData };
  }

  // --- Project Queries ---
  public getProjects(filter?: { domain?: ProjectDomain; featuredOnly?: boolean }): Project[] {
    let result = [...projectsData];

    if (filter?.domain) {
      result = result.filter((p) => p.domain === filter.domain);
    }

    if (filter?.featuredOnly) {
      result = result.filter((p) => p.featured);
    }

    return result;
  }

  public getProjectById(id: string): Project | undefined {
    return projectsData.find((p) => p.id === id);
  }

  public getFeaturedProjects(): Project[] {
    return projectsData.filter((p) => p.featured);
  }

  // --- Skill Queries ---
  public getSkills(category?: SkillCategory): Skill[] {
    if (category) {
      return skillsData.filter((s) => s.category === category);
    }
    return [...skillsData];
  }

  public getSkillById(id: string): Skill | undefined {
    return skillsData.find((s) => s.id === id);
  }

  public getSkillsByCategory(): Record<SkillCategory, Skill[]> {
    const categories: SkillCategory[] = [
      'languages',
      'frameworks',
      'cybersecurity_systems',
      'tools_infrastructure',
      'domains',
    ];

    const grouped = {} as Record<SkillCategory, Skill[]>;
    for (const cat of categories) {
      grouped[cat] = skillsData.filter((s) => s.category === cat);
    }
    return grouped;
  }

  // --- Timeline Queries ---
  public getTimeline(category?: TimelineCategory): ExperienceTimeline[] {
    if (category) {
      return timelineData.filter((t) => t.category === category);
    }
    return [...timelineData];
  }

  public getTimelineById(id: string): ExperienceTimeline | undefined {
    return timelineData.find((t) => t.id === id);
  }

  // --- Achievement & Certification Queries ---
  public getAchievements(category?: AchievementCategory): Achievement[] {
    if (category) {
      return achievementsData.filter((a) => a.category === category);
    }
    return [...achievementsData];
  }

  public getAchievementById(id: string): Achievement | undefined {
    return achievementsData.find((a) => a.id === id);
  }

  // --- Resume Queries ---
  public getResumeVariants(): ResumeVariant[] {
    return [...resumeVariantsData];
  }

  public getResumeVariantById(id: string): ResumeVariant | undefined {
    return resumeVariantsData.find((r) => r.id === id);
  }

  // --- Room Queries ---
  public getRoomMetadata(id?: RoomId): RoomMetadata[] | RoomMetadata | undefined {
    if (id) {
      return roomsMetadata.find((r) => r.id === id);
    }
    return [...roomsMetadata];
  }

  // --- System Overview & Aggregate Stats ---
  public getStats() {
    return {
      projectsCount: projectsData.length,
      skillsCount: skillsData.length,
      timelineCount: timelineData.length,
      achievementsCount: achievementsData.length,
      resumeVariantsCount: resumeVariantsData.length,
      roomsCount: roomsMetadata.length,
    };
  }

  public getAllData(): KnowledgeBaseData {
    return {
      schemaVersion: this.schemaVersion,
      generatedAt: this.generatedAt,
      owner: this.owner,
      contact: this.getContact(),
      projects: this.getProjects(),
      skills: this.getSkills(),
      timeline: this.getTimeline(),
      achievements: this.getAchievements(),
      resumes: this.getResumeVariants(),
      rooms: this.getRoomMetadata() as RoomMetadata[],
    };
  }

  // --- Search & Retrieval ---
  /**
   * Fast, client-side keyword and token matching search across all knowledge domains.
   * Delivers instantaneous (<10ms) deterministic results across rooms, projects, skills, timeline, and resumes.
   */
  public search(
    query: string,
    options?: { mode?: 'neutral' | 'recruiter' | 'developer' }
  ): SearchResult[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const tokens = cleanQuery.split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    // Search Projects
    for (const project of projectsData) {
      const matchScore = this.calculateMatchScore(
        [
          project.title,
          project.summary,
          project.description,
          project.domain,
          ...(project.stack || []),
          project.engineeringDecision || '',
        ],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: project.id,
          title: project.title,
          type: 'project',
          targetRoom: 'EngineeringLaboratory',
          summary: project.summary,
          matchedFields: ['stack', 'summary', 'domain'],
          score: matchScore,
        });
      }
    }

    // Search Skills
    for (const skill of skillsData) {
      const matchScore = this.calculateMatchScore(
        [skill.name, skill.category, skill.description || '', skill.proficiencyLevel],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: skill.id,
          title: skill.name,
          type: 'skill',
          targetRoom: 'SkillProcessor',
          summary: skill.description || `${skill.name} (${skill.category})`,
          matchedFields: ['name', 'category'],
          score: matchScore,
        });
      }
    }

    // Search Timeline
    for (const item of timelineData) {
      const matchScore = this.calculateMatchScore(
        [
          item.title,
          item.organization,
          item.role,
          item.description,
          item.category,
          ...item.keyAchievements,
        ],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: item.id,
          title: `${item.role} @ ${item.organization}`,
          type: 'timeline',
          targetRoom: 'MemoryArchive',
          summary: item.description,
          matchedFields: ['title', 'organization', 'role'],
          score: matchScore,
        });
      }
    }

    // Search Achievements
    for (const ach of achievementsData) {
      const matchScore = this.calculateMatchScore(
        [ach.title, ach.issuer, ach.description, ach.category],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: ach.id,
          title: ach.title,
          type: 'achievement',
          targetRoom: 'AchievementHall',
          summary: `${ach.issuer} (${ach.date}) — ${ach.description}`,
          matchedFields: ['title', 'issuer'],
          score: matchScore,
        });
      }
    }

    // Search Resumes
    for (const res of resumeVariantsData) {
      const matchScore = this.calculateMatchScore(
        [res.label, res.roleTitle, res.bestFor, ...res.skillsSummary, ...res.highlights],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: res.id,
          title: res.label,
          type: 'resume',
          targetRoom: 'DocumentVault',
          summary: res.bestFor,
          matchedFields: ['roleTitle', 'bestFor', 'skills'],
          score: matchScore,
        });
      }
    }

    // Search Rooms
    for (const room of roomsMetadata) {
      const matchScore = this.calculateMatchScore(
        [room.name, room.subtitle, room.domain, room.description, room.code],
        tokens
      );

      if (matchScore > 0) {
        results.push({
          id: room.id,
          title: room.name,
          type: 'room',
          targetRoom: room.id,
          summary: room.description,
          matchedFields: ['name', 'domain', 'subtitle'],
          score: matchScore + 0.5, // Slight priority for exact room names
        });
      }
    }

    // Mode-specific score weighting:
    // Recruiter mode boosts resumes and credentials; Developer mode boosts projects and technical skills.
    if (options?.mode === 'recruiter') {
      for (const res of results) {
        if (res.type === 'resume') res.score += 3.0;
        if (res.type === 'achievement') res.score += 2.0;
        if (res.type === 'timeline') res.score += 1.2;
      }
    } else if (options?.mode === 'developer') {
      for (const res of results) {
        if (res.type === 'project') res.score += 3.0;
        if (res.type === 'skill') res.score += 2.0;
      }
    }

    // Sort results by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  private calculateMatchScore(corpusFields: string[], queryTokens: string[]): number {
    let totalScore = 0;
    const corpus = corpusFields.join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (corpus.includes(token)) {
        totalScore += 1;
        // Boost for whole-word or exact occurrences
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        if (regex.test(corpus)) {
          totalScore += 1.5;
        }
      }
    }

    return totalScore;
  }
}

// Singleton instance export
export const knowledgeEngine = new KnowledgeEngine();
