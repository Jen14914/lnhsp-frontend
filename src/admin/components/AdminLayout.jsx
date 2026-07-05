import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { removeToken } from '../api/adminClient';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/alerts', label: 'Alerts', icon: '🚨' },
  { path: '/admin/reports', label: 'Reports', icon: '📄' },
  { path: '/admin/publications', label: 'Publications', icon: '📚' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    removeToken();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 60,
        background: '#1a2340',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #2d3a5a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>LNHSP Admin</span>}
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', color: active ? '#fff' : '#8899bb',
                background: active ? '#2d3a5a' : 'transparent',
                textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap',
              }}>
                <span>{item.icon}</span>
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid #2d3a5a' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px 12px', background: '#c0392b',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>🚪</span>{sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f7' }}>
        <header style={{
          background: '#fff', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e0e4ef', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ background: '#1a2340', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {user?.full_name?.[0] || 'A'}
            </span>
            <span>{user?.full_name || 'Admin'}</span>
            <span style={{ background: user?.role === 'admin' ? '#1a6b3a' : '#1a4a6b', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
              {user?.role}
            </span>
          </div>
        </header>
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
