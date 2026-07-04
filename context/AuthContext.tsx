"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser(t: string) {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // Token invalid/expired — clear it
      localStorage.removeItem("griffy_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("griffy_token");
    if (stored) {
      setToken(stored);
      fetchUser(stored);
    } else {
      setLoading(false);
    }
  }, []);

  function login(newToken: string) {
    localStorage.setItem("griffy_token", newToken);
    setToken(newToken);
    fetchUser(newToken);
  }

  function logout() {
    localStorage.removeItem("griffy_token");
    setToken(null);
    setUser(null);
  }

  function refresh() {
    const t = localStorage.getItem("griffy_token");
    if (t) fetchUser(t);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
