import axios from 'axios';

export const TOKEN_KEY = 'auth_token';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${stored}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export const apiGet = async <T>(url: string, config?: object): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T>(url: string, data?: unknown, config?: object): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: unknown, config?: object): Promise<T> => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

export const apiDel = async <T>(url: string, config?: object): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
