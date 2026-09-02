import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { Dashboard } from './pages/Dashboard.js';
import { UrlDetail } from './pages/UrlDetail.js';
import { Analytics } from './pages/Analytics.js';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="urls" element={<Dashboard />} />
        <Route path="urls/:shortCode" element={<UrlDetail />} />
        <Route path="analytics/:shortCode" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}