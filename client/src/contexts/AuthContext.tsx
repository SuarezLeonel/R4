import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoginPayload, LoginResponse, AdminUser } from '../types';
import api, { apiPost, TOKEN_KEY } from '../services/api';

interface AuthContextValue {
  token: string | null;
  user: AdminUser | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_KEY = 'auth_user';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AdminUser | null {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? (JSON.parse(storedUser) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = token ?? readStoredToken();
        if (currentToken) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await apiPost<LoginResponse>('/auth/login', payload);
    setToken(response.token);
    setUser(response.user);
    try {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch {
      // ignore
    }
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
