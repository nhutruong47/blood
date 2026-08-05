import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  useLogin,
  useLogout,
  useMe,
} from '@/shared/api/generated/auth-controller/auth-controller';
import { setAuthToken, AXIOS_INSTANCE } from '@/shared/api/axios-instance';
import type { QueryClient } from '@tanstack/react-query';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bloodGroup: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'user';

function persistUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function normalizeUser(raw: any): User | null {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    bloodGroup: raw.bloodGroup,
    role: raw.role,
    status: raw.status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('token') : null,
  );

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // Single shared /api/me fetch. Other components consume `useAuth().user`
  // instead of issuing their own `useMe()` calls.
  const meQuery = useMe({
    query: {
      enabled: !!token,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: false,
    },
  });

  // When /api/me returns a fresh user (e.g. server-side role/status change),
  // merge it into the context — localStorage is the bootstrap, server is truth.
  useEffect(() => {
    const fresh = (meQuery.data as any)?.data;
    const normalized = normalizeUser(fresh);
    if (normalized && (!user || normalized.email !== user.email || normalized.role !== user.role)) {
      setUser(normalized);
      persistUser(normalized);
    }
    // We deliberately don't depend on `user` — this is a one-way write from server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQuery.data]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginMutation.mutateAsync({ data: { email, password } });
      // The generated custom client already unwraps AxiosResponse. The
      // mutation result is therefore the API envelope itself.
      const data = (response as any)?.data;
      const normalized = normalizeUser(data?.user);

      if (!data?.accessToken || !normalized) {
        throw new Error('The server returned an invalid login response.');
      }

      const newToken = data.accessToken as string;
      setAuthToken(newToken);
      setToken(newToken);
      if (typeof window !== 'undefined' && data.refreshToken) {
        window.localStorage.setItem('refreshToken', data.refreshToken);
      }
      setUser(normalized);
      persistUser(normalized);

      return normalized;
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setAuthToken(null);
        setToken(null);
        setUser(null);
        persistUser(null);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('refreshToken');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      },
    });
  }, [logoutMutation]);

  const refreshToken = useCallback(async () => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('refreshToken') : null;
    if (!stored) {
      logout();
      return;
    }
    try {
      // Uses AXIOS_INSTANCE so the interceptor chain is consistent.
      // The 401 interceptor already skips /api/refresh to avoid loops.
      const response = await AXIOS_INSTANCE.post<{
        data?: { accessToken?: string; refreshToken?: string; user?: unknown };
      }>('/api/refresh', { refreshToken: stored });
      const data = response.data?.data;
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
        setToken(data.accessToken);
        const normalized = normalizeUser(data.user);
        if (normalized) {
          setUser(normalized);
          persistUser(normalized);
        }
        if (data.refreshToken && typeof window !== 'undefined') {
          window.localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isHydrating: !!token && meQuery.isLoading,
      login,
      logout,
      refreshToken,
    }),
    [user, token, meQuery.isLoading, login, logout, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Helper used by callers that already have a QueryClient reference.
export function invalidateAuthQueries(client: QueryClient) {
  client.invalidateQueries({ queryKey: ['/api/me'] });
}
