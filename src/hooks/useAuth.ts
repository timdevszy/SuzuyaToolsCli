import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as authService from '../services/authService';
import type { LoginResultUser, RegisterPayload } from '../services/authService';
import * as authStorage from '../services/authStorage';

type AuthContextValue = {
  user: LoginResultUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginResultUser>;
  register: (payload: RegisterPayload) => Promise<LoginResultUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResultUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const existing = await authStorage.loadSession();
      if (existing) {
        setUser(existing);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const u = await authService.login({ username, password });
      setUser(u);
      await authStorage.saveSession(u);
      return u;
    } catch (e: any) {
      const backend = e?.response?.data;
      // eslint-disable-next-line no-console
      console.log('Login error', backend || e);
      const msg =
        backend?.message || backend?.msg || e?.message || 'Login gagal';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const u = await authService.register(payload);
        setUser(u);
        await authStorage.saveSession(u);
        return u;
      } catch (e: any) {
        const backend = e?.response?.data;
        // eslint-disable-next-line no-console
        console.log('Register error', backend || e);
        const msg =
          backend?.message || backend?.msg || e?.message || 'Register gagal';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    authStorage.clearSession();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
