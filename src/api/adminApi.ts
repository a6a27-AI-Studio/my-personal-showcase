import { supabase } from '../lib/supabaseClient';

/**
 * 檢查當前用戶是否為管理員
 */
export const checkIsAdmin = async (): Promise<boolean> => {
    try {
        // 取得當前用戶
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        // 查詢 admin_users 表
        const { data, error } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * 取得管理員資訊（需要 admin 權限）
 */
export const getAdminInfo = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching admin info:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching admin info:', error);
        return null;
    }
};
