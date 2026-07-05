import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminClient';

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 24, flex: 1, minWidth: 160, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a2340' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.all([
      adminApi.getAlerts().catch(() => []),
      adminApi.getReports().catch(() => []),
      adminApi.getPublications().catch(() => []),
      adminApi.getUsers().catch(() => []),
    ]).then(([alerts, reports, publications, users]) => {
      setStats({
        alerts: Array.isArray(alerts) ? alerts.length : alerts?.items?.length,
        reports: Array.isArray(reports) ? reports.length : reports?.items?.length,
        publications: Array.isArray(publications) ? publications.length : publications?.items?.length,
        users: Array.isArray(users) ? users.length : users?.items?.length,
      });
    });
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2340', marginBottom: 24 }}>Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Total Alerts" value={stats.alerts} icon="🚨" color="#e74c3c" />
        <StatCard label="Reports" value={stats.reports} icon="📄" color="#3498db" />
        <StatCard label="Publications" value={stats.publications} icon="📚" color="#2ecc71" />
        <StatCard label="Users" value={stats.users} icon="👥" color="#9b59b6" />
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', color: '#1a2340' }}>Quick Links</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[['🚨 Manage Alerts', '/admin/alerts'], ['📄 Manage Reports', '/admin/reports'], ['📚 Manage Publications', '/admin/publications'], ['👥 Manage Users', '/admin/users']].map(([label, path]) => (
            <a key={path} href={path} style={{ padding: '10px 18px', background: '#1a2340', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
