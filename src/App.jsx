import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import PublicationsPage from './pages/PublicationsPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import DashboardsPage from './pages/DashboardsPage.jsx';
import DiseaseAtoZPage from './pages/DiseaseAtoZPage.jsx';

import LoginPage from './admin/pages/LoginPage.jsx';
import AdminDashboardPage from './admin/pages/AdminDashboardPage.jsx';
import AlertsPage from './admin/pages/AlertsPage.jsx';
import UsersPage from './admin/pages/UsersPage.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import ProtectedRoute from './admin/components/ProtectedRoute.jsx';
import { adminApi, getToken } from './admin/api/adminClient.js';

function AdminApp() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (getToken()) adminApi.me().then(setUser).catch(() => {});
  }, []);
  return (
    <ProtectedRoute>
      <AdminLayout user={user}>
        <Routes>
          <Route path="/" element={<AdminDashboardPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="publications" element={<PublicationsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="a-to-z" element={<DiseaseAtoZPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}