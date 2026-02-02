import { createClient } from '@supabase/supabase-js';

// 從環境變數取得 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 驗證環境變數是否已設定
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.\n' +
        'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
}

// 建立 Supabase Client 實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // 持久化 session（自動儲存到 localStorage）
        persistSession: true,
        // 自動刷新 token
        autoRefreshToken: true,
        // 檢測 session 變化
        detectSessionInUrl: true,
    },
});

// 匯出類型定義（用於 TypeScript）
export type SupabaseClient = typeof supabase;
