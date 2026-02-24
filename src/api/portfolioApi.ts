import { supabase } from '../lib/supabaseClient';

// Portfolio 資料類型
export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    summary: string;
    description?: string;
    thumbnail_url?: string;
    image_urls?: string[];
    tags?: string[];
    status: 'draft' | 'published';
    links?: Array<{
        type: string;
        url: string;
    }>;
    impact?: {
        metrics?: string[];
        achievements?: string[];
    };
    start_date?: string;
    end_date?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * 取得已發布的作品（前台使用）
 */
export const getPublishedPortfolios = async (): Promise<PortfolioItem[]> => {
    try {
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('status', 'published')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Error fetching published portfolios: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error fetching published portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * 依 slug 取得單一作品詳情（前台使用）
 */
export const getPortfolioBySlug = async (slug: string): Promise<PortfolioItem | null> => {
    try {
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            console.error('Error fetching portfolio by slug:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching portfolio by slug:', error);
        return null;
    }
};

/**
 * 取得所有作品（含草稿，後台使用，需要 admin 權限）
 */
export const getAllPortfolios = async (): Promise<PortfolioItem[]> => {
    try {
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Error fetching all portfolios: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error fetching all portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * 新增作品（需要 admin 權限）
 */
export const createPortfolio = async (
    portfolio: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>
): Promise<PortfolioItem | null> => {
    try {
        const { data, error } = await supabase
            .from('portfolio_items')
            .insert(portfolio)
            .select()
            .single();

        if (error) {
            console.error('Error creating portfolio:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating portfolio:', error);
        return null;
    }
};

/**
 * 更新作品（需要 admin 權限）
 */
export const updatePortfolio = async (id: string, updates: Partial<PortfolioItem>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('portfolio_items')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating portfolio:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating portfolio:', error);
        return false;
    }
};

/**
 * 刪除作品（需要 admin 權限）
 */
export const deletePortfolio = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting portfolio:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        return false;
    }
};

/**
 * 切換發布狀態（需要 admin 權限）
 */
export const togglePublishStatus = async (id: string, currentStatus: 'draft' | 'published'): Promise<boolean> => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    return updatePortfolio(id, { status: newStatus });
};

/**
 * 上傳作品圖片到 Storage
 */
export const uploadPortfolioImage = async (file: File, slug: string, type: 'thumbnail' | 'screenshot', index?: number): Promise<string | null> => {
    try {
        // 生成檔案名稱
        const fileExt = file.name.split('.').pop();
        const fileName = index !== undefined
            ? `${slug}/${type}-${index}.${fileExt}`
            : `${slug}/${type}.${fileExt}`;

        // 上傳到 portfolio bucket
        const { data, error } = await supabase.storage
            .from('portfolio')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true, // 允許覆蓋同名檔案
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        // 取得公開 URL
        const { data: urlData } = supabase.storage
            .from('portfolio')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

/**
 * 搜尋作品（前台使用，支援關鍵字和標籤篩選）
 */
export const searchPortfolios = async (
    keyword?: string,
    tags?: string[]
): Promise<PortfolioItem[]> => {
    try {
        let query = supabase
            .from('portfolio_items')
            .select('*')
            .eq('status', 'published');

        // 關鍵字搜尋（搜尋 title 和 summary）
        if (keyword && keyword.trim()) {
            query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
        }

        // 標籤篩選
        if (tags && tags.length > 0) {
            query = query.contains('tags', tags);
        }

        query = query.order('sort_order', { ascending: true });

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error searching portfolios: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error searching portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
