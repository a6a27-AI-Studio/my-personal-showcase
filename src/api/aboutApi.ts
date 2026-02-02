import { supabase } from '../lib/supabaseClient';

// About 資料類型
export interface SiteAbout {
    id: string;
    title: string;
    subtitle?: string;
    bio: string;
    profile_image_url?: string;
    social_links?: Array<{
        platform: string;
        url: string;
    }>;
    created_at: string;
    updated_at: string;
}

/**
 * 取得關於我的內容
 */
export const getAbout = async (): Promise<SiteAbout | null> => {
    try {
        const { data, error } = await supabase
            .from('site_about')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching about:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching about:', error);
        return null;
    }
};

/**
 * 更新關於我的內容（需要 admin 權限）
 */
export const updateAbout = async (data: Partial<SiteAbout>): Promise<boolean> => {
    try {
        // 先取得現有記錄的 ID
        const existing = await getAbout();
        if (!existing) {
            throw new Error('No existing about record found');
        }

        const { error } = await supabase
            .from('site_about')
            .update(data)
            .eq('id', existing.id);

        if (error) {
            console.error('Error updating about:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating about:', error);
        return false;
    }
};
