import { Outlet } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

export function DonorLayout() {
  return (
    <MainLayout role="Donor">
      <Outlet />
    </MainLayout>
  );
}