import { supabase } from '../lib/supabaseClient';

// Skill 資料類型
export interface Skill {
    id: string;
    name: string;
    category: string;
    proficiency_level?: number; // 1-5
    icon_url?: string;
    description?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * 取得所有技能（依 sort_order 排序）
 */
export const getSkills = async (): Promise<Skill[]> => {
    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Error fetching skills: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error fetching skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * 新增技能（需要 admin 權限）
 */
export const createSkill = async (skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill | null> => {
    try {
        const { data, error } = await supabase
            .from('skills')
            .insert(skill)
            .select()
            .single();

        if (error) {
            console.error('Error creating skill:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating skill:', error);
        return null;
    }
};

/**
 * 更新技能（需要 admin 權限）
 */
export const updateSkill = async (id: string, updates: Partial<Skill>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('skills')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating skill:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating skill:', error);
        return false;
    }
};

/**
 * 刪除技能（需要 admin 權限）
 */
export const deleteSkill = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting skill:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting skill:', error);
        return false;
    }
};

/**
 * 批次更新技能排序（需要 admin 權限）
 */
export const reorderSkills = async (items: Array<{ id: string; sort_order: number }>): Promise<boolean> => {
    try {
        // 使用 Promise.all 並行更新
        const updates = items.map(item =>
            supabase
                .from('skills')
                .update({ sort_order: item.sort_order })
                .eq('id', item.id)
        );

        const results = await Promise.all(updates);

        // 檢查是否有錯誤
        const hasError = results.some(result => result.error);
        if (hasError) {
            console.error('Error reordering skills');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error reordering skills:', error);
        return false;
    }
};
