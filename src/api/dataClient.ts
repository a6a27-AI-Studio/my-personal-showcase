import type {
  About,
  Skill,
  Service,
  Experience,
  PortfolioItem,
  ResumeMeta,
  ResumeExportSettings,
  Message,
  DeleteMode,
  Me,
  UserRole,
  SkillFilterParams,
  PortfolioFilterParams,
} from '@/types';

// DataClient Interface - All UI components must use this interface
export interface DataClient {
  // ===== Public Read Operations =====
  getAbout(): Promise<About>;
  listSkills(params?: SkillFilterParams): Promise<Skill[]>;
  listServices(): Promise<Service[]>;
  listExperiences(): Promise<Experience[]>;
  listPortfolio(params?: PortfolioFilterParams): Promise<PortfolioItem[]>;
  getPortfolioBySlug(slug: string): Promise<PortfolioItem | null>;
  getResume(): Promise<ResumeMeta>;

  // ===== Identity/Auth =====
  getMe(): Promise<Me>;
  setMockRole(role: UserRole): Promise<void>; // For mock login switching

  // ===== Messages (User's own only) =====
  listMyMessages(): Promise<Message[]>;
  createMyMessage(payload: { title?: string; content: string }): Promise<Message>;
  updateMyMessage(id: string, payload: { title?: string; content?: string }): Promise<Message>;
  replyMessage(id: string, payload: { reply: string }): Promise<Message>;
  deleteMyMessage(id: string, options?: { mode?: DeleteMode }): Promise<void>;

  // ===== Admin CMS Operations =====
  // About
  upsertAbout(payload: About): Promise<About>;

  // Skills
  createSkill(payload: Omit<Skill, 'id' | 'updatedAt'>): Promise<Skill>;
  updateSkill(id: string, payload: Partial<Skill>): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;

  // Services
  createService(payload: Omit<Service, 'id' | 'updatedAt'>): Promise<Service>;
  updateService(id: string, payload: Partial<Service>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Experiences
  createExperience(payload: Omit<Experience, 'id' | 'updatedAt'>): Promise<Experience>;
  updateExperience(id: string, payload: Partial<Experience>): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;

  // Portfolio
  createPortfolio(payload: Omit<PortfolioItem, 'id' | 'updatedAt' | 'createdAt'>): Promise<PortfolioItem>;
  updatePortfolio(id: string, payload: Partial<PortfolioItem>): Promise<PortfolioItem>;
  deletePortfolio(id: string): Promise<void>;

  // Resume
  updateResumeMeta(payload: Partial<ResumeMeta>): Promise<ResumeMeta>;
  getResumeExportSettings(): Promise<ResumeExportSettings>;
  updateResumeExportSettings(payload: Partial<ResumeExportSettings>): Promise<ResumeExportSettings>;
}
