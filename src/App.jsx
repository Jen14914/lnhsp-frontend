import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import PublicationsPage from './pages/PublicationsPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import DashboardsPage from './pages/DashboardsPage.jsx';
import DiseaseAtoZPage from './pages/DiseaseAtoZPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dashboards" element={<DashboardsPage />} />
        <Route path="/a-to-z" element={<DiseaseAtoZPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
