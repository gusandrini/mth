import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// notebook
// const API_BASE_URL = "http://172.20.10.2:8080";
// pc
const API_BASE_URL = "http://192.168.68.110:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // remove sessão
      await AsyncStorage.multiRemove(['userId', 'token']);
      console.log("Sessão expirada, faça login novamente.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;