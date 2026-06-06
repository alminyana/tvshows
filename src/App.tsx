import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, AuthProvider, NotificationProvider } from '@/context';
import { Layout, ProtectedRoute } from '@/components/layout';
import { ShowcasePage, SeriesListPage, SeriesDetailPage, SeriesFormPage, LoginPage, DashboardPage, UsersPage, NotFoundPage } from '@/pages';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/series" replace />} />
            <Route path="/series" element={<SeriesListPage />} />
            <Route path="/series/:id" element={<SeriesDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
              <Route path="/series/new" element={<SeriesFormPage />} />
              <Route path="/series/:id/edit" element={<SeriesFormPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
            {import.meta.env.DEV && (
              <Route path="/showcase" element={<ShowcasePage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
