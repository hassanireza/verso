import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, loginUser, registerUser } from "../api/endpoints";
import { tokenStore } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = async () => {
    if (!tokenStore.getAccess()) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    const onLogout = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener("verso:logout", onLogout);
    return () => window.removeEventListener("verso:logout", onLogout);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await loginUser({ username, password });
    tokenStore.set(data.tokens.access, data.tokens.refresh);
    setUser(data.user);
  };

  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }) => {
    const data = await registerUser(payload);
    tokenStore.set(data.tokens.access, data.tokens.refresh);
    setUser(data.user);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!tokenStore.getAccess()) return;
    const me = await fetchMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
