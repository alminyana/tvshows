import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, AuthProvider, NotificationProvider } from '@/context';
import { Layout, ProtectedRoute } from '@/components/layout';
import { SeriesListPage, SeriesDetailPage, SeriesFormPage, DashboardPage, NotFoundPage, LandingPage } from '@/pages';

const ShowcasePage = lazy(() =>
  import('@/pages/ShowcasePage/ShowcasePage').then((m) => ({ default: m.ShowcasePage }))
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<Layout />}>
            <Route path="/series" element={<SeriesListPage />} />
            <Route path="/series/:id" element={<SeriesDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/series/new" element={<SeriesFormPage />} />
              <Route path="/series/:id/edit" element={<SeriesFormPage />} />
            </Route>
            {import.meta.env.DEV && (
              <Route
                path="/showcase"
                element={(
                  <Suspense fallback={null}>
                    <ShowcasePage />
                  </Suspense>
                )}
              />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
