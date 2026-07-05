import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, setToken } from '../api/adminClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.login(email, password);
      setToken(data.access_token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a2340', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a2340', margin: 0 }}>LNHSP Admin</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Lesotho National Health Surveillance</p>
        </div>
        {error && (
          <div style={{ background: '#fde8e8', color: '#c0392b', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@lnhsp.gov.ls"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#1a2340', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
