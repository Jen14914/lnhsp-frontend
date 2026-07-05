import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminClient';

const EMPTY = { title: '', disease: '', district: '', severity: 'Watch', status: 'active', description: '' };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => adminApi.getAlerts().then(data => setAlerts(Array.isArray(data) ? data : data.items || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await adminApi.updateAlert(editing, form);
      else await adminApi.createAlert(form);
      setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alert?')) return;
    await adminApi.deleteAlert(id); load();
  };

  const handleEdit = (a) => {
    setForm({ title: a.title, disease: a.disease || '', district: a.district || '', severity: a.severity || 'Watch', status: a.status || 'active', description: a.description || '' });
    setEditing(a.id); setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a2340' }}>Alerts</h2>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
          style={{ padding: '8px 18px', background: '#1a2340', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ New Alert'}
        </button>
      </div>
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a2340' }}>{editing ? 'Edit Alert' : 'New Alert'}</h3>
          {error && <div style={{ color: '#c0392b', marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[['Title', 'title', 'text'], ['Disease', 'disease', 'text'], ['District', 'district', 'text']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
                  {['Watch', 'Advisory', 'Investigation', 'Outbreak'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
                  {['active', 'resolved'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ padding: '10px 24px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              {editing ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f0f2f7' }}>
              {['Title', 'Disease', 'District', 'Severity', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1a2340' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid #f0f2f7' }}>
                <td style={{ padding: '12px 16px' }}>{a.title}</td>
                <td style={{ padding: '12px 16px' }}>{a.disease}</td>
                <td style={{ padding: '12px 16px' }}>{a.district}</td>
                <td style={{ padding: '12px 16px' }}>{a.severity}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: a.status === 'active' ? '#d4edda' : '#f0f2f7', color: a.status === 'active' ? '#1a6b3a' : '#666' }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(a)} style={{ padding: '4px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(a.id)} style={{ padding: '4px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No alerts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
