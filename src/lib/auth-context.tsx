"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type ApiUser, type LoginResult } from "./api";

interface AuthContextValue {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginWithMfa: (mfaToken: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        const hadToken = !!localStorage.getItem("auth_token");
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (hadToken) {
          window.location.href = "/session-expired";
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await api.auth.login(email, password);
    if (result.mfaRequired) {
      return result;
    }
    localStorage.setItem("auth_token", result.token!);
    document.cookie = `auth_token=${result.token}; path=/; samesite=lax`;
    setUser(result.user!);
    return result;
  }, []);

  const loginWithMfa = useCallback(async (mfaToken: string, code: string) => {
    const result = await api.mfa.verifyLogin(mfaToken, code);
    localStorage.setItem("auth_token", result.token);
    document.cookie = `auth_token=${result.token}; path=/; samesite=lax`;
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    window.location.href = "/login?logged_out=true";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithMfa,
      logout,
    }),
    [user, isLoading, login, loginWithMfa, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
