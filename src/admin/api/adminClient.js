const API = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('lnhsp_token');
}

export function setToken(token) {
  localStorage.setItem('lnhsp_token', token);
}

export function removeToken() {
  localStorage.removeItem('lnhsp_token');
}

async function authFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    removeToken();
    window.location.href = '/admin/login';
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const adminApi = {
  login: async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await fetch(`${API}/api/v1/auth/token`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },
  me: () => authFetch('/auth/me'),
  getAlerts: () => authFetch('/alerts'),
  createAlert: (data) => authFetch('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateAlert: (id, data) => authFetch(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlert: (id) => authFetch(`/alerts/${id}`, { method: 'DELETE' }),
  getReports: () => authFetch('/reports'),
  createReport: (data) => authFetch('/reports', { method: 'POST', body: JSON.stringify(data) }),
  updateReport: (id, data) => authFetch(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReport: (id) => authFetch(`/reports/${id}`, { method: 'DELETE' }),
  getPublications: () => authFetch('/publications'),
  createPublication: (data) => authFetch('/publications', { method: 'POST', body: JSON.stringify(data) }),
  updatePublication: (id, data) => authFetch(`/publications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePublication: (id) => authFetch(`/publications/${id}`, { method: 'DELETE' }),
  getUsers: () => authFetch('/users/'),
  createUser: (data) => authFetch('/users/', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => authFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => authFetch(`/users/${id}`, { method: 'DELETE' }),
  getDistricts: () => authFetch('/districts'),
  getDiseases: () => authFetch('/diseases'),
};
