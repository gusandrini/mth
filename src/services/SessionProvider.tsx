import { createContext, PropsWithChildren, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

interface User {
  idFuncionario: number;          // inexistente no login atual → usamos 0
  nome: string;                    // derivado do username
  email: string;                   // se username for e-mail, usamos; senão deixamos vazio
  cargo: string;                   // sem dado no login atual → "-"
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

/** Deriva um objeto User mínimo a partir do username/email */
function buildUser(emailOrUsername: string): User {
  const looksLikeEmail = emailOrUsername.includes("@");
  const nomeBase = looksLikeEmail ? emailOrUsername.split("@")[0] : emailOrUsername;
  const nome = nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1);

  return {
    idFuncionario: 0,
    nome,
    email: looksLikeEmail ? emailOrUsername : "",
    cargo: "-",
  };
}

const SessionProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      // 👉 seu backend atual: POST /api/auth/login { username, password }
      const { data } = await apiClient.post("/api/auth/login", {
        username: emailOrUsername,
        password,
      });

      const token: string | undefined = data?.token;
      if (!token) return false;

      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USERNAME_KEY, emailOrUsername);

      // injeta o Authorization para as próximas requisições
      (apiClient.defaults.headers.common as any).Authorization = `Bearer ${token}`;

      // como a API ainda não devolve o usuário, criamos um “mínimo” para UI
      setUser(buildUser(emailOrUsername));
      return true;
    } catch (error: any) {
      // 401 = credenciais inválidas
      if (error?.response?.status === 401) return false;
      console.error("Erro inesperado no login:", error?.response?.data || error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY]);
    delete (apiClient.defaults.headers.common as any).Authorization;
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
};

export { SessionProvider, useSession };
