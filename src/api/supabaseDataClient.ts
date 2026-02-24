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
import type { DataClient } from './dataClient';
import { supabase } from '@/lib/supabaseClient';
import * as adminApi from './adminApi';

async function getAccessToken(): Promise<string | null> {
    let { data: { session } } = await supabase.auth.getSession();

    // Force a refresh to avoid stale/invalid JWTs lingering in storage
    // (e.g., after project auth config changes or long-lived cached sessions).
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed.session ?? session ?? null;

    return session?.access_token ?? null;
}

type MessageRow = {
    id: string;
    user_id: string;
    title?: string | null;
    content: string;
    admin_reply?: string | null;
    replied_at?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    created_at: string;
    updated_at: string;
};

function mapMessageRow(m: MessageRow): Message {
    return {
        id: m.id,
        userId: m.user_id,
        title: m.title || undefined,
        content: m.content,
        adminReply: m.admin_reply || undefined,
        repliedAt: m.replied_at || undefined,
        deletedAt: m.deleted_at || undefined,
        deletedBy: m.deleted_by || undefined,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
    };
}

async function invokeMessagesFunction<T extends Record<string, unknown>>(body: Record<string, unknown>): Promise<{ data: T | null; error: Error | null }> {
    const accessToken = await getAccessToken();
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!accessToken) {
        return {
            data: null,
            error: new Error('No active session token. Please sign in again.'),
        };
    }

    const headers: Record<string, string> = {};
    if (anonKey) headers.apikey = anonKey;
    headers.Authorization = `Bearer ${accessToken}`;

    const result = await supabase.functions.invoke('messages', {
        body,
        headers,
    });

    return {
        data: (result.data as T | null) ?? null,
        error: (result.error as Error | null) ?? null,
    };
}

/**
 * Supabase DataClient Implementation
 * 
 * Since Supabase schema now matches frontend types exactly,
 * we can directly use the data without transformations.
 */
export const SupabaseDataClient: DataClient = {
    // ===== Public Read Operations =====
    async getAbout(): Promise<About> {
        const { data, error } = await supabase
            .from('site_about')
            .select('*')
            .single();

        if (error || !data) {
            throw new Error('About data not found');
        }

        return {
            id: data.id,
            headline: data.headline,
            subheadline: data.subheadline,
            bio: data.bio || '',
            highlights: data.highlights || [],
            links: data.links || [],
            avatarUrl: data.avatar_url || undefined,
            updatedAt: data.updated_at,
        };
    },

    async listSkills(params?: SkillFilterParams): Promise<Skill[]> {
        let query = supabase
            .from('skills')
            .select('*')
            .order('sort_order', { ascending: true });

        if (params?.category) {
            query = query.eq('category', params.category);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch skills: ${error.message}`);
        }

        return (data || []).map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            level: s.level || 3,
            tags: s.tags || [],
            sortOrder: s.sort_order,
            updatedAt: s.updated_at,
        }));
    },

    async listServices(): Promise<Service[]> {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch services: ${error.message}`);
        }

        return (data || []).map(s => ({
            id: s.id,
            name: s.name,
            summary: s.summary || '',
            description: s.description || undefined,
            deliverables: s.deliverables || [],
            process: s.process || [],
            icon: s.icon || undefined,
            relatedPortfolioIds: s.related_portfolio_ids || [],
            sortOrder: s.sort_order,
            updatedAt: s.updated_at,
        }));
    },

    async listExperiences(): Promise<Experience[]> {
        const { data, error } = await supabase
            .from('experiences')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch experiences: ${error.message}`);
        }

        return (data || []).map(e => ({
            id: e.id,
            role: e.role,
            company: e.company,
            location: e.location || undefined,
            startDate: e.start_date,
            endDate: e.end_date || undefined,
            isCurrent: e.is_current,
            summary: e.summary,
            highlights: e.highlights || [],
            techStack: e.tech_stack || [],
            sortOrder: e.sort_order,
            updatedAt: e.updated_at,
        }));
    },

    async listPortfolio(params?: PortfolioFilterParams): Promise<PortfolioItem[]> {
        let query = supabase
            .from('portfolio_items')
            .select('*');

        // Only filter by published status if includeAll is not set
        if (!params?.includeAll) {
            query = query.eq('status', 'published');
        }

        query = query.order('sort_order', { ascending: true });

        if (params?.tag) {
            query = query.contains('tags', [params.tag]);
        }

        if (params?.tech) {
            query = query.contains('tech_stack', [params.tech]);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch portfolio: ${error.message}`);
        }

        let items = (data || []).map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            summary: p.summary,
            coverImageUrl: p.cover_image_url || undefined,
            problem: p.problem || undefined,
            solution: p.solution || undefined,
            impact: p.impact || [],
            tags: p.tags || [],
            techStack: p.tech_stack || [],
            links: p.links || [],
            status: p.status as 'draft' | 'published',
            sortOrder: p.sort_order,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
        }));

        // Apply search filter
        if (params?.q) {
            const searchLower = params.q.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                item.summary.toLowerCase().includes(searchLower)
            );
        }

        return items;
    },

    async getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            coverImageUrl: data.cover_image_url || undefined,
            problem: data.problem || undefined,
            solution: data.solution || undefined,
            impact: data.impact || [],
            tags: data.tags || [],
            techStack: data.tech_stack || [],
            links: data.links || [],
            status: data.status as 'draft' | 'published',
            sortOrder: data.sort_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    },

    async getResume(): Promise<ResumeMeta> {
        const { data, error } = await supabase
            .from('resume_meta')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return {
                id: '',
                version: '0.0',
                pdfUrl: null,
                updatedAt: new Date().toISOString(),
            };
        }

        return {
            id: data.id,
            version: data.version,
            pdfUrl: data.pdf_url,
            updatedAt: data.updated_at,
        };
    },

    // ===== Identity/Auth =====
    async getMe(): Promise<Me> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                id: 'anonymous',
                name: 'Guest',
                email: undefined,
                role: 'guest',
            };
        }

        const isAdmin = await adminApi.checkIsAdmin();

        return {
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email,
            role: isAdmin ? 'admin' : 'user',
        };
    },

    async setMockRole(_role: UserRole): Promise<void> {
        console.warn('setMockRole is not supported in SupabaseDataClient');
    },

    // ===== Messages (via Edge Function) =====
    async listMyMessages(): Promise<Message[]> {
        const { data, error } = await invokeMessagesFunction<{ messages?: MessageRow[] }>({ action: 'list' });

        if (error) {
            throw new Error(`Failed to fetch messages: ${error.message}`);
        }

        const rows = (data?.messages || []) as MessageRow[];
        return rows.map(mapMessageRow);
    },

    async createMyMessage(payload: { title?: string; content: string }): Promise<Message> {
        const { data, error } = await invokeMessagesFunction<{ message?: MessageRow }>({ action: 'create', payload });

        if (error || !data?.message) {
            throw new Error('Failed to create message');
        }

        return mapMessageRow(data.message);
    },

    async updateMyMessage(id: string, payload: { title?: string; content?: string }): Promise<Message> {
        const { data, error } = await invokeMessagesFunction<{ message?: MessageRow }>({ action: 'update', id, payload });

        if (error || !data?.message) {
            throw new Error('Failed to update message');
        }

        return mapMessageRow(data.message);
    },

    async replyMessage(id: string, payload: { reply: string }): Promise<Message> {
        const { data, error } = await invokeMessagesFunction<{ message?: MessageRow }>({ action: 'reply', id, payload });

        if (error || !data?.message) {
            throw new Error('Failed to reply message');
        }

        return mapMessageRow(data.message);
    },

    async deleteMyMessage(id: string, options?: { mode?: DeleteMode }): Promise<void> {
        const mode = options?.mode ?? 'soft';
        const { error } = await invokeMessagesFunction({ action: 'delete', id, mode });

        if (error) {
            throw new Error('Failed to delete message');
        }
    },

    // ===== Admin CMS Operations =====
    async upsertAbout(payload: About): Promise<About> {
        // Get existing record
        const existing = await this.getAbout();

        const { data, error } = await supabase
            .from('site_about')
            .update({
                headline: payload.headline,
                subheadline: payload.subheadline,
                bio: payload.bio,
                highlights: payload.highlights,
                links: payload.links,
                avatar_url: payload.avatarUrl || null,
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to update about');
        }

        return this.getAbout();
    },

    async createSkill(payload: Omit<Skill, 'id' | 'updatedAt'>): Promise<Skill> {
        const { data, error } = await supabase
            .from('skills')
            .insert({
                name: payload.name,
                category: payload.category,
                level: payload.level,
                tags: payload.tags,
                sort_order: payload.sortOrder,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create skill');
        }

        return {
            id: data.id,
            name: data.name,
            category: data.category,
            level: data.level,
            tags: data.tags || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async updateSkill(id: string, payload: Partial<Skill>): Promise<Skill> {
        const updates: Record<string, unknown> = {};
        if (payload.name !== undefined) updates.name = payload.name;
        if (payload.category !== undefined) updates.category = payload.category;
        if (payload.level !== undefined) updates.level = payload.level;
        if (payload.tags !== undefined) updates.tags = payload.tags;
        if (payload.sortOrder !== undefined) updates.sort_order = payload.sortOrder;

        const { data, error } = await supabase
            .from('skills')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to update skill');
        }

        return {
            id: data.id,
            name: data.name,
            category: data.category,
            level: data.level,
            tags: data.tags || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async deleteSkill(id: string): Promise<void> {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete skill');
        }
    },

    async createService(payload: Omit<Service, 'id' | 'updatedAt'>): Promise<Service> {
        const { data, error } = await supabase
            .from('services')
            .insert({
                name: payload.name,
                summary: payload.summary,
                description: payload.description,
                deliverables: payload.deliverables,
                process: payload.process,
                icon: payload.icon,
                related_portfolio_ids: payload.relatedPortfolioIds,
                sort_order: payload.sortOrder,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create service');
        }

        return {
            id: data.id,
            name: data.name,
            summary: data.summary,
            description: data.description || undefined,
            deliverables: data.deliverables || [],
            process: data.process || [],
            icon: data.icon || undefined,
            relatedPortfolioIds: data.related_portfolio_ids || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async updateService(id: string, payload: Partial<Service>): Promise<Service> {
        const updates: Record<string, unknown> = {};
        if (payload.name !== undefined) updates.name = payload.name;
        if (payload.summary !== undefined) updates.summary = payload.summary;
        if (payload.description !== undefined) updates.description = payload.description;
        if (payload.deliverables !== undefined) updates.deliverables = payload.deliverables;
        if (payload.process !== undefined) updates.process = payload.process;
        if (payload.icon !== undefined) updates.icon = payload.icon;
        if (payload.relatedPortfolioIds !== undefined) updates.related_portfolio_ids = payload.relatedPortfolioIds;
        if (payload.sortOrder !== undefined) updates.sort_order = payload.sortOrder;

        const { data, error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to update service');
        }

        return {
            id: data.id,
            name: data.name,
            summary: data.summary,
            description: data.description || undefined,
            deliverables: data.deliverables || [],
            process: data.process || [],
            icon: data.icon || undefined,
            relatedPortfolioIds: data.related_portfolio_ids || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async deleteService(id: string): Promise<void> {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete service');
        }
    },

    async createExperience(payload: Omit<Experience, 'id' | 'updatedAt'>): Promise<Experience> {
        const { data, error } = await supabase
            .from('experiences')
            .insert({
                role: payload.role,
                company: payload.company,
                location: payload.location,
                start_date: payload.startDate,
                end_date: payload.endDate,
                is_current: payload.isCurrent,
                summary: payload.summary,
                highlights: payload.highlights,
                tech_stack: payload.techStack,
                sort_order: payload.sortOrder,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create experience');
        }

        return {
            id: data.id,
            role: data.role,
            company: data.company,
            location: data.location || undefined,
            startDate: data.start_date,
            endDate: data.end_date || undefined,
            isCurrent: data.is_current,
            summary: data.summary,
            highlights: data.highlights || [],
            techStack: data.tech_stack || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async updateExperience(id: string, payload: Partial<Experience>): Promise<Experience> {
        const updates: Record<string, unknown> = {};
        if (payload.role !== undefined) updates.role = payload.role;
        if (payload.company !== undefined) updates.company = payload.company;
        if (payload.location !== undefined) updates.location = payload.location;
        if (payload.startDate !== undefined) updates.start_date = payload.startDate;
        if (payload.endDate !== undefined) updates.end_date = payload.endDate;
        if (payload.isCurrent !== undefined) updates.is_current = payload.isCurrent;
        if (payload.summary !== undefined) updates.summary = payload.summary;
        if (payload.highlights !== undefined) updates.highlights = payload.highlights;
        if (payload.techStack !== undefined) updates.tech_stack = payload.techStack;
        if (payload.sortOrder !== undefined) updates.sort_order = payload.sortOrder;

        const { data, error } = await supabase
            .from('experiences')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to update experience');
        }

        return {
            id: data.id,
            role: data.role,
            company: data.company,
            location: data.location || undefined,
            startDate: data.start_date,
            endDate: data.end_date || undefined,
            isCurrent: data.is_current,
            summary: data.summary,
            highlights: data.highlights || [],
            techStack: data.tech_stack || [],
            sortOrder: data.sort_order,
            updatedAt: data.updated_at,
        };
    },

    async deleteExperience(id: string): Promise<void> {
        const { error } = await supabase
            .from('experiences')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete experience');
        }
    },

    async createPortfolio(payload: Omit<PortfolioItem, 'id' | 'updatedAt' | 'createdAt'>): Promise<PortfolioItem> {
        const { data, error } = await supabase
            .from('portfolio_items')
            .insert({
                slug: payload.slug,
                title: payload.title,
                summary: payload.summary,
                cover_image_url: payload.coverImageUrl,
                problem: payload.problem,
                solution: payload.solution,
                impact: payload.impact,
                tags: payload.tags,
                tech_stack: payload.techStack,
                links: payload.links,
                status: payload.status,
                sort_order: payload.sortOrder,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Supabase create error:', error);
            throw new Error(`Failed to create portfolio: ${error?.message || 'Unknown error'}`);
        }

        return {
            id: data.id,
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            coverImageUrl: data.cover_image_url || undefined,
            problem: data.problem || undefined,
            solution: data.solution || undefined,
            impact: data.impact || [],
            tags: data.tags || [],
            techStack: data.tech_stack || [],
            links: data.links || [],
            status: data.status as 'draft' | 'published',
            sortOrder: data.sort_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    },

    async updatePortfolio(id: string, payload: Partial<PortfolioItem>): Promise<PortfolioItem> {
        const updates: Record<string, unknown> = {};
        if (payload.slug !== undefined) updates.slug = payload.slug;
        if (payload.title !== undefined) updates.title = payload.title;
        if (payload.summary !== undefined) updates.summary = payload.summary;
        if (payload.coverImageUrl !== undefined) updates.cover_image_url = payload.coverImageUrl;
        if (payload.problem !== undefined) updates.problem = payload.problem;
        if (payload.solution !== undefined) updates.solution = payload.solution;
        if (payload.impact !== undefined) updates.impact = payload.impact;
        if (payload.tags !== undefined) updates.tags = payload.tags;
        if (payload.techStack !== undefined) updates.tech_stack = payload.techStack;
        if (payload.links !== undefined) updates.links = payload.links;
        if (payload.status !== undefined) updates.status = payload.status;
        if (payload.sortOrder !== undefined) updates.sort_order = payload.sortOrder;

        const { data, error } = await supabase
            .from('portfolio_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            console.error('Supabase update error:', error);
            throw new Error(`Failed to update portfolio: ${error?.message || 'Unknown error'}`);
        }

        return {
            id: data.id,
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            coverImageUrl: data.cover_image_url || undefined,
            problem: data.problem || undefined,
            solution: data.solution || undefined,
            impact: data.impact || [],
            tags: data.tags || [],
            techStack: data.tech_stack || [],
            links: data.links || [],
            status: data.status as 'draft' | 'published',
            sortOrder: data.sort_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    },

    async deletePortfolio(id: string): Promise<void> {
        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete portfolio');
        }
    },

    async updateResumeMeta(payload: Partial<ResumeMeta>): Promise<ResumeMeta> {
        // Get current resume
        const current = await this.getResume();

        if (!current.id) {
            throw new Error('No resume exists yet');
        }

        const { data, error } = await supabase
            .from('resume_meta')
            .update({
                version: payload.version || current.version,
                pdf_url: payload.pdfUrl || current.pdfUrl,
            })
            .eq('id', current.id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to update resume');
        }

        return {
            id: data.id,
            version: data.version,
            pdfUrl: data.pdf_url,
            updatedAt: data.updated_at,
        };
    },
};
