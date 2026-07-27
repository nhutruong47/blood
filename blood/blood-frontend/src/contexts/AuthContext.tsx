import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useLogin, useLogout, useRefreshtoken } from '@/shared/api/generated/auth-controller/auth-controller';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshtoken();

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginMutation.mutateAsync({ data: { email, password } });
    const data = (response?.data as any)?.data;
    if (data?.accessToken) {
      const newToken = data.accessToken;
      const newUser: User = {
        id: data.user?.id,
        email: data.user?.email,
        firstName: data.user?.firstName,
        lastName: data.user?.lastName,
        bloodGroup: data.user?.bloodGroup,
        role: data.user?.role,
        status: data.user?.status,
      };
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }, [loginMutation]);

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      },
    });
  }, [logoutMutation]);

  const refreshToken = useCallback(async () => {
    const stored = localStorage.getItem('refreshToken');
    if (!stored) {
      logout();
      return;
    }
    try {
      const response = await refreshMutation.mutateAsync({ data: { refreshToken: stored } });
      const data = (response?.data as any)?.data;
      if (data?.accessToken) {
        setToken(data.accessToken);
        if (data.user) {
          const refreshedUser: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            bloodGroup: data.user.bloodGroup,
            role: data.user.role,
            status: data.user.status,
          };
          setUser(refreshedUser);
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }
        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
    } catch {
      logout();
    }
  }, [refreshMutation, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}