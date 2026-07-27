import { Outlet } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

export function MedicalCenterLayout() {
  return (
    <MainLayout role="Medical Center">
      <Outlet />
    </MainLayout>
  );
}