import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminClient';

const EMPTY = { email: '', full_name: '', role: 'editor', password: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => adminApi.getUsers().then(data => setUsers(Array.isArray(data) ? data : []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await adminApi.updateUser(editing, form);
      else await adminApi.createUser(form);
      setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await adminApi.deleteUser(id); load();
  };

  const handleEdit = (u) => {
    setForm({ email: u.email, full_name: u.full_name, role: u.role, password: '' });
    setEditing(u.id); setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a2340' }}>Users</h2>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
          style={{ padding: '8px 18px', background: '#1a2340', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </div>
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a2340' }}>{editing ? 'Edit User' : 'New User'}</h3>
          {error && <div style={{ color: '#c0392b', marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[['Full Name', 'full_name', 'text'], ['Email', 'email', 'email'], ['Password', 'password', 'password']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}{editing && key === 'password' ? ' (leave blank to keep)' : ''}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required={!editing || key !== 'password'}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
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
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1a2340' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #f0f2f7' }}>
                <td style={{ padding: '12px 16px' }}>{u.full_name}</td>
                <td style={{ padding: '12px 16px' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: u.role === 'admin' ? '#1a2340' : '#e8f4fd', color: u.role === 'admin' ? '#fff' : '#1a4a6b' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: u.is_active ? '#d4edda' : '#fde8e8', color: u.is_active ? '#1a6b3a' : '#c0392b' }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(u)} style={{ padding: '4px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
