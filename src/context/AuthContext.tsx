"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AuthResponse, AuthTokens, AuthUser } from '@/types';
import { authService } from '@/services/authService';
import { authTokens } from '@/lib/authTokens';
import { authEvents } from '@/lib/authEvents';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { email: string; password: string }, options?: { remember?: boolean }) => Promise<AuthUser>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) => Promise<AuthUser>;
  logout: (options?: { redirect?: boolean }) => Promise<void>;
  completeOAuthLogin: (tokens: AuthTokens) => Promise<void>;
  refreshProfile: () => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistTokens = ({ accessToken, refreshToken }: AuthTokens, options?: { persistRefresh?: boolean }) => {
  authTokens.setAccessToken(accessToken);
  authTokens.setRefreshToken(refreshToken, { persist: options?.persistRefresh });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);

  const fetchProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile.user);
    return profile.user;
  }, []);

  const initialize = useCallback(async () => {
    if (pathname?.startsWith('/auth/callback')) {
      setIsLoading(false);
      return;
    }

    const redirectToken = searchParams?.get('oauth');
    if (redirectToken) {
      setIsLoading(false);
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const refreshToken = authTokens.getRefreshToken();
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      const tokens = await authService.refresh(refreshToken);
      persistTokens(tokens);
      await fetchProfile();
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      authTokens.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, pathname, searchParams]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      authTokens.clear();
      // Clear risk disclosure acceptance on token expiry
      localStorage.removeItem('niftyswift_risk_accepted');
      setUser(null);
      router.replace('/signin');
    });

    return unsubscribe;
  }, [router]);

  const handleAuthSuccess = useCallback((payload: AuthResponse, options?: { remember?: boolean }) => {
    persistTokens(payload, { persistRefresh: options?.remember ?? true });
    setUser(payload.user);
    return payload.user;
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }, options?: { remember?: boolean }) => {
      setIsLoading(true);
      try {
        const response = await authService.login(payload);
        return handleAuthSuccess(response, options);
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
      setIsLoading(true);
      try {
        const response = await authService.register(payload);
        return handleAuthSuccess(response);
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(
    async (options?: { redirect?: boolean }) => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error logging out:', error);
      } finally {
        authTokens.clear();
        // Clear risk disclosure acceptance on logout
        localStorage.removeItem('niftyswift_risk_accepted');
        setUser(null);
        if (options?.redirect !== false) {
          router.replace('/signin');
        }
      }
    },
    [router]
  );

  const completeOAuthLogin = useCallback(
    async (tokens: AuthTokens) => {
      setIsLoading(true);
      try {
        persistTokens(tokens);
        await fetchProfile();
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      completeOAuthLogin,
      refreshProfile: fetchProfile,
    }),
    [completeOAuthLogin, fetchProfile, isLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


