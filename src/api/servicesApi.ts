import { supabase } from '../lib/supabaseClient';

// Service 資料類型
export interface Service {
    id: string;
    title: string;
    description: string;
    icon_url?: string;
    features?: string[];
    sort_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * 取得所有服務（依 sort_order 排序）
 */
export const getServices = async (): Promise<Service[]> => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            throw new Error(`Error fetching services: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error fetching services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * 新增服務（需要 admin 權限）
 */
export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service | null> => {
    try {
        const { data, error } = await supabase
            .from('services')
            .insert(service)
            .select()
            .single();

        if (error) {
            console.error('Error creating service:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating service:', error);
        return null;
    }
};

/**
 * 更新服務（需要 admin 權限）
 */
export const updateService = async (id: string, updates: Partial<Service>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating service:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating service:', error);
        return false;
    }
};

/**
 * 刪除服務（需要 admin 權限）
 */
export const deleteService = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting service:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting service:', error);
        return false;
    }
};

/**
 * 批次更新服務排序（需要 admin 權限）
 */
export const reorderServices = async (items: Array<{ id: string; sort_order: number }>): Promise<boolean> => {
    try {
        const updates = items.map(item =>
            supabase
                .from('services')
                .update({ sort_order: item.sort_order })
                .eq('id', item.id)
        );

        const results = await Promise.all(updates);

        const hasError = results.some(result => result.error);
        if (hasError) {
            console.error('Error reordering services');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error reordering services:', error);
        return false;
    }
};
