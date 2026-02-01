import type { DataClient } from '@/api/dataClient';
import type {
  About,
  Skill,
  Service,
  PortfolioItem,
  ResumeMeta,
  Message,
  Me,
  UserRole,
  SkillFilterParams,
  PortfolioFilterParams,
} from '@/types';
import {
  mockAbout,
  mockSkills,
  mockServices,
  mockPortfolio,
  mockResume,
  mockMessages,
} from './mockData';

const STORAGE_KEYS = {
  ABOUT: 'portfolio_about',
  SKILLS: 'portfolio_skills',
  SERVICES: 'portfolio_services',
  PORTFOLIO: 'portfolio_items',
  RESUME: 'portfolio_resume',
  MESSAGES: 'portfolio_messages',
  CURRENT_ROLE: 'portfolio_current_role',
  CURRENT_USER: 'portfolio_current_user',
};

// User presets for mock login
const USER_PRESETS: Record<UserRole, Me> = {
  guest: { id: 'guest', role: 'guest', name: 'Guest' },
  user: { id: 'user-1', role: 'user', name: 'John Doe', email: 'john@example.com' },
  admin: { id: 'admin-1', role: 'admin', name: 'Admin User', email: 'admin@example.com' },
};

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function initializeStorage(): void {
  // Initialize with mock data if not already present
  if (!localStorage.getItem(STORAGE_KEYS.ABOUT)) {
    setToStorage(STORAGE_KEYS.ABOUT, mockAbout);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
    setToStorage(STORAGE_KEYS.SKILLS, mockSkills);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    setToStorage(STORAGE_KEYS.SERVICES, mockServices);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO)) {
    setToStorage(STORAGE_KEYS.PORTFOLIO, mockPortfolio);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESUME)) {
    setToStorage(STORAGE_KEYS.RESUME, mockResume);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    setToStorage(STORAGE_KEYS.MESSAGES, mockMessages);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE)) {
    setToStorage(STORAGE_KEYS.CURRENT_ROLE, 'guest');
  }
}

// Initialize on module load
initializeStorage();

export const MockDataClient: DataClient = {
  // ===== Public Read Operations =====
  async getAbout(): Promise<About> {
    return getFromStorage(STORAGE_KEYS.ABOUT, mockAbout);
  },

  async listSkills(params?: SkillFilterParams): Promise<Skill[]> {
    let skills = getFromStorage<Skill[]>(STORAGE_KEYS.SKILLS, mockSkills);
    
    if (params?.category) {
      skills = skills.filter(s => s.category === params.category);
    }
    if (params?.tag) {
      skills = skills.filter(s => s.tags.includes(params.tag!));
    }
    
    return skills.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async listServices(): Promise<Service[]> {
    const services = getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, mockServices);
    return services.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async listPortfolio(params?: PortfolioFilterParams): Promise<PortfolioItem[]> {
    let items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, mockPortfolio);
    
    // Only show published items on frontend
    items = items.filter(item => item.status === 'published');
    
    if (params?.q) {
      const query = params.q.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
      );
    }
    if (params?.tag) {
      items = items.filter(item => item.tags.includes(params.tag!));
    }
    if (params?.tech) {
      items = items.filter(item => item.techStack.includes(params.tech!));
    }
    
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
    const items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, mockPortfolio);
    return items.find(item => item.slug === slug && item.status === 'published') || null;
  },

  async getResume(): Promise<ResumeMeta> {
    return getFromStorage(STORAGE_KEYS.RESUME, mockResume);
  },

  // ===== Identity/Auth =====
  async getMe(): Promise<Me> {
    const role = getFromStorage<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'guest');
    return USER_PRESETS[role];
  },

  async setMockRole(role: UserRole): Promise<void> {
    setToStorage(STORAGE_KEYS.CURRENT_ROLE, role);
  },

  // ===== Messages (User's own only) =====
  async listMyMessages(): Promise<Message[]> {
    const me = await this.getMe();
    if (me.role === 'guest') return [];
    
    const messages = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return messages.filter(msg => msg.userId === me.id);
  },

  async createMyMessage(payload: { title?: string; content: string }): Promise<Message> {
    const me = await this.getMe();
    if (me.role === 'guest') throw new Error('Must be logged in to create messages');
    
    const messages = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const now = new Date().toISOString();
    const newMessage: Message = {
      id: generateId(),
      userId: me.id,
      title: payload.title,
      content: payload.content,
      createdAt: now,
      updatedAt: now,
    };
    
    messages.push(newMessage);
    setToStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMessage;
  },

  async updateMyMessage(id: string, payload: { title?: string; content?: string }): Promise<Message> {
    const me = await this.getMe();
    if (me.role === 'guest') throw new Error('Must be logged in to update messages');
    
    const messages = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const index = messages.findIndex(msg => msg.id === id && msg.userId === me.id);
    
    if (index === -1) throw new Error('Message not found or not owned by user');
    
    messages[index] = {
      ...messages[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    
    setToStorage(STORAGE_KEYS.MESSAGES, messages);
    return messages[index];
  },

  async deleteMyMessage(id: string): Promise<void> {
    const me = await this.getMe();
    if (me.role === 'guest') throw new Error('Must be logged in to delete messages');
    
    const messages = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const filtered = messages.filter(msg => !(msg.id === id && msg.userId === me.id));
    setToStorage(STORAGE_KEYS.MESSAGES, filtered);
  },

  // ===== Admin CMS Operations =====
  async upsertAbout(payload: About): Promise<About> {
    const updated = { ...payload, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.ABOUT, updated);
    return updated;
  },

  async createSkill(payload: Omit<Skill, 'id' | 'updatedAt'>): Promise<Skill> {
    const skills = getFromStorage<Skill[]>(STORAGE_KEYS.SKILLS, []);
    const newSkill: Skill = {
      ...payload,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    };
    skills.push(newSkill);
    setToStorage(STORAGE_KEYS.SKILLS, skills);
    return newSkill;
  },

  async updateSkill(id: string, payload: Partial<Skill>): Promise<Skill> {
    const skills = getFromStorage<Skill[]>(STORAGE_KEYS.SKILLS, []);
    const index = skills.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Skill not found');
    
    skills[index] = { ...skills[index], ...payload, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.SKILLS, skills);
    return skills[index];
  },

  async deleteSkill(id: string): Promise<void> {
    const skills = getFromStorage<Skill[]>(STORAGE_KEYS.SKILLS, []);
    setToStorage(STORAGE_KEYS.SKILLS, skills.filter(s => s.id !== id));
  },

  async createService(payload: Omit<Service, 'id' | 'updatedAt'>): Promise<Service> {
    const services = getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, []);
    const newService: Service = {
      ...payload,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    };
    services.push(newService);
    setToStorage(STORAGE_KEYS.SERVICES, services);
    return newService;
  },

  async updateService(id: string, payload: Partial<Service>): Promise<Service> {
    const services = getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, []);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    
    services[index] = { ...services[index], ...payload, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.SERVICES, services);
    return services[index];
  },

  async deleteService(id: string): Promise<void> {
    const services = getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, []);
    setToStorage(STORAGE_KEYS.SERVICES, services.filter(s => s.id !== id));
  },

  async createPortfolio(payload: Omit<PortfolioItem, 'id' | 'updatedAt' | 'createdAt'>): Promise<PortfolioItem> {
    const items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
    const now = new Date().toISOString();
    const newItem: PortfolioItem = {
      ...payload,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.PORTFOLIO, items);
    return newItem;
  },

  async updatePortfolio(id: string, payload: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
    const index = items.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Portfolio item not found');
    
    items[index] = { ...items[index], ...payload, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.PORTFOLIO, items);
    return items[index];
  },

  async deletePortfolio(id: string): Promise<void> {
    const items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
    setToStorage(STORAGE_KEYS.PORTFOLIO, items.filter(p => p.id !== id));
  },

  async updateResumeMeta(payload: Partial<ResumeMeta>): Promise<ResumeMeta> {
    const current = await this.getResume();
    const updated = { ...current, ...payload, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.RESUME, updated);
    return updated;
  },
};

// Admin-specific methods that return all items including drafts
export const AdminMockDataClient = {
  async listAllPortfolio(params?: PortfolioFilterParams): Promise<PortfolioItem[]> {
    let items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, mockPortfolio);
    
    if (params?.q) {
      const query = params.q.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
      );
    }
    if (params?.tag) {
      items = items.filter(item => item.tags.includes(params.tag!));
    }
    if (params?.tech) {
      items = items.filter(item => item.techStack.includes(params.tech!));
    }
    
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getPortfolioById(id: string): Promise<PortfolioItem | null> {
    const items = getFromStorage<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, mockPortfolio);
    return items.find(item => item.id === id) || null;
  },
};
