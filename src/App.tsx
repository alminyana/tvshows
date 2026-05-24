import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/context';
import { Layout } from '@/components/layout';
import { ShowcasePage } from '@/pages';

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/series" replace />} />
          <Route path="/series" element={<p>Series — próximamente (H2)</p>} />
          <Route path="/dashboard" element={<p>Dashboard — próximamente (H5)</p>} />
          <Route path="/login" element={<p>Login — próximamente (H3)</p>} />
          {import.meta.env.DEV && (
            <Route path="/showcase" element={<ShowcasePage />} />
          )}
          <Route path="*" element={<p>404 — próximamente (H7)</p>} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
