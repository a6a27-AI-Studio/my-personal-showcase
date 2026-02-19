import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// AuthContext 的類型定義
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

// 建立 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 元件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 檢查管理員狀態
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return false;
      }

      const adminStatus = (data?.length ?? 0) > 0;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Google OAuth 登入
  const signInWithGoogle = async () => {
    try {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
          queryParams: {
            // Google may still auto-pick a previously used account in some cases.
            // Adding consent + select_account makes account chooser behavior more consistent.
            prompt: 'consent select_account',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setIsAdmin(false);

      // Optional hard logout for Google session.
      // Enable with VITE_GOOGLE_LOGOUT_ON_SIGNOUT=true if you want account picker every time.
      if (import.meta.env.VITE_GOOGLE_LOGOUT_ON_SIGNOUT === 'true') {
        const continueUrl = encodeURIComponent(window.location.origin);
        window.location.href = `https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=${continueUrl}`;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // 監聽 Auth 狀態變化
  useEffect(() => {
    // 取得初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 訂閱 auth 狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 當 user 變化時檢查 admin 狀態
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook: useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
