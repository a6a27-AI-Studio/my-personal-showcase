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

// Resume Meta
export interface ResumeMeta {
  id: string;
  version: string;
  pdfUrl: string | null;
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
