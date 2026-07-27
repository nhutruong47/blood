import { Outlet } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

export function AdminLayout() {
  return (
    <MainLayout role="Admin">
      <Outlet />
    </MainLayout>
  );
}