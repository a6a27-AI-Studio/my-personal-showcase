import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Me, UserRole } from '@/types';
import { MockDataClient } from '@/mock/mockDataClient';

interface AuthContextType {
  user: Me | null;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const me = await MockDataClient.getMe();
      setUser(me);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser({ id: 'guest', role: 'guest', name: 'Guest' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    await MockDataClient.setMockRole(role);
    await loadUser();
  }, [loadUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await MockDataClient.setMockRole('guest');
    await loadUser();
  }, [loadUser]);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = user?.role !== 'guest';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
