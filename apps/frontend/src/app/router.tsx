import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { useAuthStore } from '@/store/auth-store';

function ProtectedRoute() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  return session && user ? <AppShell><DashboardPage /></AppShell> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  return session && user ? <Navigate to="/" replace /> : <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute />} />
      <Route path="/" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
