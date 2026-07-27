import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

export function RoleGuard({ children, allowedRoles, fallback = '/login' }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to={fallback} replace />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}