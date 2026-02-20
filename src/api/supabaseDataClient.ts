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
import type { DataClient } from './dataClient';
import { supabase } from '@/lib/supabaseClient';
import * as adminApi from './adminApi';

async function invokeMessagesFunction(body: Record<string, unknown>) {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    const headers: Record<string, string> = {};
    if (anonKey) headers.apikey = anonKey;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    return supabase.functions.invoke('messages', {
        body,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
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
            console.error('Error fetching skills:', error);
            return [];
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
            console.error('Error fetching services:', error);
            return [];
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
            console.error('Error fetching portfolio:', error);
            return [];
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
        const { data, error } = await invokeMessagesFunction({ action: 'list' });

        if (error) {
            console.error('Error fetching messages via edge function:', error);
            return [];
        }

        const rows = data?.messages || [];
        return rows.map((m: any) => ({
            id: m.id,
            userId: m.user_id,
            title: m.title || undefined,
            content: m.content,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
        }));
    },

    async createMyMessage(payload: { title?: string; content: string }): Promise<Message> {
        const { data, error } = await invokeMessagesFunction({ action: 'create', payload });

        if (error || !data?.message) {
            throw new Error('Failed to create message');
        }

        const m = data.message;
        return {
            id: m.id,
            userId: m.user_id,
            title: m.title || undefined,
            content: m.content,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
        };
    },

    async updateMyMessage(id: string, payload: { title?: string; content?: string }): Promise<Message> {
        const { data, error } = await invokeMessagesFunction({ action: 'update', id, payload });

        if (error || !data?.message) {
            throw new Error('Failed to update message');
        }

        const m = data.message;
        return {
            id: m.id,
            userId: m.user_id,
            title: m.title || undefined,
            content: m.content,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
        };
    },

    async deleteMyMessage(id: string): Promise<void> {
        const { error } = await invokeMessagesFunction({ action: 'delete', id });

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
        const updates: any = {};
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
        const updates: any = {};
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
        const updates: any = {};
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
