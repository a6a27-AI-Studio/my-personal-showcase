// User Roles
export type UserRole = 'guest' | 'user' | 'admin';

// User/Me
export interface Me {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
}

// Link
export interface Link {
  label: string;
  url: string;
  icon?: string;
}

// About
export interface About {
  id: string;
  headline: string;
  subheadline: string;
  bio?: string;
  highlights: string[];
  links: Link[];
  avatarUrl?: string;
  updatedAt: string;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'database' | 'tools' | 'other';
  level: number; // 1-5
  tags: string[];
  sortOrder: number;
  updatedAt: string;
}

// Experience
export interface Experience {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  isCurrent: boolean;
  summary: string;
  highlights: string[];
  techStack: string[];
  sortOrder: number;
  updatedAt: string;
}

// Service
export interface Service {
  id: string;
  name: string;
  summary: string;
  description?: string;
  deliverables: string[];
  process: string[];
  icon?: string;
  relatedPortfolioIds: string[];
  sortOrder: number;
  updatedAt: string;
}

// Portfolio Item
export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  problem?: string;
  solution?: string;
  impact: string[];
  tags: string[];
  techStack: string[];
  links: Link[];
  status: 'draft' | 'published';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy resume meta removed (export-only flow)

export interface ResumeExportSettings {
  id: string;
  showHeader: boolean;
  showSummary: boolean;
  showExperiences: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showContact: boolean;
  showEmail: boolean;
  showPhone: boolean;
  contactEmail?: string;
  contactPhone?: string;
  updatedAt: string;
}

export type DeleteMode = 'soft' | 'hard';

// Message (for Contact)
export interface Message {
  id: string;
  userId: string;
  title?: string;
  content: string;
  adminReply?: string;
  repliedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Filter params
export interface SkillFilterParams {
  category?: Skill['category'];
  tag?: string;
}

export interface PortfolioFilterParams {
  q?: string;
  tag?: string;
  tech?: string;
  includeAll?: boolean; // If true, includes drafts; otherwise only published items
}
