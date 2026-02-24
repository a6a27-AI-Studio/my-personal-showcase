import { supabase } from '../lib/supabaseClient';

// Message 資料類型
export interface Message {
    id: string;
    user_id: string;
    name: string;
    email: string;
    subject?: string;
    content: string;
    created_at: string;
    updated_at: string;
}

/**
 * 取得我的留言（僅限本人）
 */
export const getMyMessages = async (): Promise<Message[]> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error fetching my messages: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(`Error fetching my messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * 新增留言（需要登入）
 */
export const createMessage = async (
    messageData: {
        name: string;
        email: string;
        subject?: string;
        content: string;
    }
): Promise<Message | null> => {
    try {
        // 取得當前用戶
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('User not authenticated');
            return null;
        }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                ...messageData,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating message:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating message:', error);
        return null;
    }
};

/**
 * 更新留言（僅限本人）
 */
export const updateMessage = async (
    id: string,
    updates: {
        name?: string;
        email?: string;
        subject?: string;
        content?: string;
    }
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('messages')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating message:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating message:', error);
        return false;
    }
};

/**
 * 刪除留言（僅限本人）
 */
export const deleteMessage = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting message:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
};
