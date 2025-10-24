// src/services/SessionProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/apiClient"; 

// ---------- Tipos ----------
interface User {
  idFuncionario: number;
  nome: string;
  email: string;
  cargo: string;
}
type LoginResponse = {
  token: string;
  idFuncionario: number;
  nome: string;
  email: string;
  cargo: string;
};
type LoginResult = { ok: true } | { ok: false; message?: string };

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // carregando sessão ao abrir app
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

// ---------- Helpers de storage (SecureStore com fallback) ----------
const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";

async function setItemSecure(key: string, value: string) {
  try { await SecureStore.setItemAsync(key, value); }
  catch { await AsyncStorage.setItem(key, value); }
}
async function getItemSecure(key: string) {
  try { return await SecureStore.getItemAsync(key); }
  catch { return await AsyncStorage.getItem(key); }
}
async function delItemSecure(key: string) {
  try { await SecureStore.deleteItemAsync(key); }
  catch { await AsyncStorage.removeItem(key); }
}

// ---------- Context ----------
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Anexa/remover Authorization header no axios
  const setAuthHeader = useCallback((token?: string | null) => {
    if (token) apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete apiClient.defaults.headers.common.Authorization;
  }, []);

  // Boot: restaura token e busca /auth/me
  useEffect(() => {
    (async () => {
      try {
        const token = await getItemSecure(TOKEN_KEY);
        if (!token) return;

        setAuthHeader(token);
        // se sua API tiver /auth/me, melhor buscar o usuário “fresco”
        const { data } = await apiClient.get<User>("/auth/me");
        setUser(data);
        await setItemSecure(USER_ID_KEY, String(data.idFuncionario));
      } catch (e) {
        // token inválido/expirado: limpa tudo
        await delItemSecure(TOKEN_KEY);
        await delItemSecure(USER_ID_KEY);
        setAuthHeader(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, [setAuthHeader]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
      const { token, idFuncionario, nome, email: userEmail, cargo } = data;

      await setItemSecure(TOKEN_KEY, token);
      await setItemSecure(USER_ID_KEY, String(idFuncionario));
      setAuthHeader(token);

      setUser({ idFuncionario, nome, email: userEmail, cargo });
      return { ok: true };
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 401 ? "Credenciais inválidas." :
        status >= 500 ? "Servidor indisponível." :
        "Falha ao entrar.";
      return { ok: false, message };
    }
  }, [setAuthHeader]);

  const logout = useCallback(async () => {
    try {
      // opcional: await apiClient.post('/auth/logout')
    } finally {
      await delItemSecure(TOKEN_KEY);
      await delItemSecure(USER_ID_KEY);
      setAuthHeader(null);
      setUser(null);
    }
  }, [setAuthHeader]);

  const value = useMemo<SessionContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    logout,
  }), [user, isInitializing, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
