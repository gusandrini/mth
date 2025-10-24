// src/api/apiClient.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 👉 altere para sua URL real
const API_BASE_URL = "https://seu-dominio/api"; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // evita travar a UI em requisições longas
});

// ✅ Adiciona o token antes de cada requisição
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Erro ao recuperar token:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepta respostas e trata erros 401/500
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // sessão expirada → limpar storage e logar o usuário novamente
      await AsyncStorage.multiRemove(["token", "userId"]);
      console.log("Sessão expirada. Faça login novamente.");

      // opcional: pode emitir um evento global (ex: logout automático)
      // EventEmitter.emit("logout");
    }

    if (status >= 500) {
      console.warn("Erro de servidor:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
