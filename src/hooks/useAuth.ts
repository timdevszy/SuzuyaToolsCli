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
  clearError: () => void;
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
      let msg = backend?.message || backend?.msg || e?.message || 'Login gagal';

      if (typeof msg === 'string') {
        const lower = msg.toLowerCase();
        if (lower.includes('username atau password atau id')) {
          msg = 'Username atau password Anda tidak sesuai.';
        }
      }

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
        // Tidak auto-login setelah register; cukup kembalikan hasilnya.
        return u;
      } catch (e: any) {
        const backend = e?.response?.data;
        // eslint-disable-next-line no-console
        console.log('Register error', backend || e);
        let rawMsg: unknown =
          backend?.message || backend?.msg || e?.message || backend || 'Register gagal';

        // Jika backend adalah object validasi field (misalnya { password: ['The password must be at least 8 characters.'] })
        if (!backend?.message && !backend?.msg && backend && typeof backend === 'object') {
          const firstKey = Object.keys(backend)[0];
          const value = (backend as any)[firstKey];
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
            rawMsg = value[0];
          }
        }

        let msg = rawMsg as string;
        if (typeof rawMsg === 'string') {
          const lower = rawMsg.toLowerCase();
          if (lower.includes('account already exist')) {
            msg =
              'Perangkat ini sudah memiliki akun terdaftar. Silakan login dengan akun tersebut.';
          }
          if (lower.includes('username atau password atau id')) {
            msg = 'Username atau password Anda tidak sesuai.';
          }
        }

        setError(msg as string);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
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
