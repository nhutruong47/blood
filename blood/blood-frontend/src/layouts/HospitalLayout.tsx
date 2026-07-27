import { Outlet } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

export function HospitalLayout() {
  return (
    <MainLayout role="Hospital">
      <Outlet />
    </MainLayout>
  );
}