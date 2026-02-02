import { supabase } from '../lib/supabaseClient';

// Resume 資料類型
export interface ResumeMeta {
    id: string;
    pdf_url: string;
    version: string;
    file_size_bytes?: number;
    uploaded_at: string;
    is_current: boolean;
    created_at: string;
}

/**
 * 取得當前的履歷 PDF URL
 */
export const getResumeUrl = async (): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('resume_meta')
            .select('pdf_url')
            .eq('is_current', true)
            .single();

        if (error) {
            console.error('Error fetching resume URL:', error);
            // 如果沒有資料，嘗試使用 fallback URL
            const fallbackUrl = import.meta.env.VITE_RESUME_FALLBACK_URL;
            return fallbackUrl || null;
        }

        return data.pdf_url;
    } catch (error) {
        console.error('Error fetching resume URL:', error);
        const fallbackUrl = import.meta.env.VITE_RESUME_FALLBACK_URL;
        return fallbackUrl || null;
    }
};

/**
 * 取得所有履歷版本（後台使用）
 */
export const getAllResumeVersions = async (): Promise<ResumeMeta[]> => {
    try {
        const { data, error } = await supabase
            .from('resume_meta')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching resume versions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching resume versions:', error);
        return [];
    }
};

/**
 * 上傳新的履歷 PDF（需要 admin 權限）
 */
export const uploadResumePDF = async (file: File, version: string): Promise<string | null> => {
    try {
        // 1. 上傳 PDF 到 Storage
        const fileName = `resume-v${version}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resume')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Error uploading PDF:', uploadError);
            return null;
        }

        // 2. 取得公開 URL
        const { data: urlData } = supabase.storage
            .from('resume')
            .getPublicUrl(uploadData.path);

        const publicUrl = urlData.publicUrl;

        // 3. 將舊的 is_current 設為 false
        await supabase
            .from('resume_meta')
            .update({ is_current: false })
            .eq('is_current', true);

        // 4. 新增新的 resume_meta 記錄
        const { error: insertError } = await supabase
            .from('resume_meta')
            .insert({
                pdf_url: publicUrl,
                version,
                file_size_bytes: file.size,
                is_current: true,
            });

        if (insertError) {
            console.error('Error inserting resume meta:', insertError);
            return null;
        }

        return publicUrl;
    } catch (error) {
        console.error('Error uploading resume PDF:', error);
        return null;
    }
};

/**
 * 設定特定版本為當前使用的履歷（需要 admin 權限）
 */
export const setCurrentResume = async (id: string): Promise<boolean> => {
    try {
        // 1. 將所有 is_current 設為 false
        await supabase
            .from('resume_meta')
            .update({ is_current: false })
            .eq('is_current', true);

        // 2. 將指定的設為 true
        const { error } = await supabase
            .from('resume_meta')
            .update({ is_current: true })
            .eq('id', id);

        if (error) {
            console.error('Error setting current resume:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error setting current resume:', error);
        return false;
    }
};

/**
 * 刪除履歷版本（需要 admin 權限）
 * 注意：不能刪除當前使用的版本
 */
export const deleteResumeVersion = async (id: string, fileName: string): Promise<boolean> => {
    try {
        // 1. 檢查是否為當前版本
        const { data, error: fetchError } = await supabase
            .from('resume_meta')
            .select('is_current')
            .eq('id', id)
            .single();

        if (fetchError || data?.is_current) {
            console.error('Cannot delete current resume version');
            return false;
        }

        // 2. 從 Storage 刪除檔案
        const { error: storageError } = await supabase.storage
            .from('resume')
            .remove([fileName]);

        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // 即使 Storage 刪除失敗，仍繼續刪除 DB 記錄
        }

        // 3. 刪除 DB 記錄
        const { error: deleteError } = await supabase
            .from('resume_meta')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting resume meta:', deleteError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting resume version:', error);
        return false;
    }
};
