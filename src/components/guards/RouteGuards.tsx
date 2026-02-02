import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 需要登入才能訪問的路由守衛
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    // 載入中顯示 loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 未登入導向首頁
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// 需要管理員權限才能訪問的路由守衛
export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    // 載入中顯示 loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 未登入導向首頁
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 非管理員顯示 403 錯誤頁面
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
                    <p className="text-xl text-gray-600 mb-8">存取被拒絕</p>
                    <p className="text-gray-500 mb-8">您沒有權限訪問此頁面</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        返回首頁
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
