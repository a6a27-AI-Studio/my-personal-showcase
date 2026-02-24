import type { DataClient } from '@/api/dataClient';
import type {
  About,
  Skill,
  Service,
  Experience,
  PortfolioItem,
  ResumeMeta,
  Message,
  DeleteMode,
  Me,
  UserRole,
  SkillFilterParams,
  PortfolioFilterParams,
} from '@/types';

/**
 * ApiDataClient - Placeholder for future API integration
 * 
 * This client will be used when connecting to a real backend API
 * (e.g., DMZ OpenAPI or Supabase). Currently, all methods throw
 * "not implemented" errors.
 * 
 * To switch from MockDataClient to ApiDataClient:
 * 1. Implement all methods with actual API calls
 * 2. Update DataClientProvider to use ApiDataClient
 */

const BASE_URL = '/api'; // Update with actual API base URL

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const ApiDataClient: DataClient = {
  // ===== Public Read Operations =====
  async getAbout(): Promise<About> {
    return fetchApi<About>('/about');
  },

  async listSkills(params?: SkillFilterParams): Promise<Skill[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.tag) queryParams.set('tag', params.tag);
    return fetchApi<Skill[]>(`/skills?${queryParams}`);
  },

  async listServices(): Promise<Service[]> {
    return fetchApi<Service[]>('/services');
  },

  async listExperiences(): Promise<Experience[]> {
    return fetchApi<Experience[]>('/experiences');
  },

  async listPortfolio(params?: PortfolioFilterParams): Promise<PortfolioItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.set('q', params.q);
    if (params?.tag) queryParams.set('tag', params.tag);
    if (params?.tech) queryParams.set('tech', params.tech);
    if (params?.includeAll) queryParams.set('includeAll', 'true');
    return fetchApi<PortfolioItem[]>(`/portfolio?${queryParams}`);
  },

  async getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
    try {
      return await fetchApi<PortfolioItem>(`/portfolio/${slug}`);
    } catch {
      return null;
    }
  },

  async getResume(): Promise<ResumeMeta> {
    return fetchApi<ResumeMeta>('/resume');
  },

  // ===== Identity/Auth =====
  async getMe(): Promise<Me> {
    return fetchApi<Me>('/me');
  },

  async setMockRole(_role: UserRole): Promise<void> {
    // This method is only for mock client
    console.warn('setMockRole is not available in ApiDataClient');
  },

  // ===== Messages (User's own only) =====
  async listMyMessages(): Promise<Message[]> {
    return fetchApi<Message[]>('/messages');
  },

  async createMyMessage(payload: { title?: string; content: string }): Promise<Message> {
    return fetchApi<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateMyMessage(id: string, payload: { title?: string; content?: string }): Promise<Message> {
    return fetchApi<Message>(`/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async replyMessage(id: string, payload: { reply: string }): Promise<Message> {
    return fetchApi<Message>(`/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteMyMessage(id: string, options?: { mode?: DeleteMode }): Promise<void> {
    const mode = options?.mode;
    const query = mode ? `?mode=${mode}` : '';
    await fetchApi(`/messages/${id}${query}`, { method: 'DELETE' });
  },

  // ===== Admin CMS Operations =====
  async upsertAbout(payload: About): Promise<About> {
    return fetchApi<About>('/admin/about', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async createSkill(payload: Omit<Skill, 'id' | 'updatedAt'>): Promise<Skill> {
    return fetchApi<Skill>('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSkill(id: string, payload: Partial<Skill>): Promise<Skill> {
    return fetchApi<Skill>(`/admin/skills/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteSkill(id: string): Promise<void> {
    await fetchApi(`/admin/skills/${id}`, { method: 'DELETE' });
  },

  async createService(payload: Omit<Service, 'id' | 'updatedAt'>): Promise<Service> {
    return fetchApi<Service>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateService(id: string, payload: Partial<Service>): Promise<Service> {
    return fetchApi<Service>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteService(id: string): Promise<void> {
    await fetchApi(`/admin/services/${id}`, { method: 'DELETE' });
  },

  async createExperience(payload: Omit<Experience, 'id' | 'updatedAt'>): Promise<Experience> {
    return fetchApi<Experience>('/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateExperience(id: string, payload: Partial<Experience>): Promise<Experience> {
    return fetchApi<Experience>(`/admin/experiences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteExperience(id: string): Promise<void> {
    await fetchApi(`/admin/experiences/${id}`, { method: 'DELETE' });
  },

  async createPortfolio(payload: Omit<PortfolioItem, 'id' | 'updatedAt' | 'createdAt'>): Promise<PortfolioItem> {
    return fetchApi<PortfolioItem>('/admin/portfolio', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePortfolio(id: string, payload: Partial<PortfolioItem>): Promise<PortfolioItem> {
    return fetchApi<PortfolioItem>(`/admin/portfolio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deletePortfolio(id: string): Promise<void> {
    await fetchApi(`/admin/portfolio/${id}`, { method: 'DELETE' });
  },

  async updateResumeMeta(payload: Partial<ResumeMeta>): Promise<ResumeMeta> {
    return fetchApi<ResumeMeta>('/admin/resume', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
