import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getToken, getUser, setToken, setUser, StoredUser } from "../lib/storage";

type AuthCtx = {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

type AuthResponse = { token: string; user: StoredUser };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(getUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    if (!getToken()) { setUserState(null); setLoading(false); return; }
    try {
      const me = await api.get<StoredUser | null>("/api/auth/me");
      if (me) {
        setUser(me); setUserState(me);
      } else {
        setToken(null); setUser(null); setTokenState(null); setUserState(null);
      }
    } catch {
      setToken(null);
      setUser(null);
      setTokenState(null);
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshMe(); }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
    setToken(res.token); setUser(res.user);
    setTokenState(res.token); setUserState(res.user);
  };

  const register = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/api/auth/register", { email, password });
    setToken(res.token); setUser(res.user);
    setTokenState(res.token); setUserState(res.user);
  };

  const logout = () => {
    setToken(null); setUser(null);
    setTokenState(null); setUserState(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout, refreshMe }), [user, token, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
