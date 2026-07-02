//const BASE = '/api/v1';
const BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1`;

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} on ${path}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const api = {
  // Diseases
  listDiseases: (params = {}) => getJSON(`/diseases${qs(params)}`),
  diseaseStatusSummary: () => getJSON('/diseases/status-summary'),
  getDisease: (slug) => getJSON(`/diseases/${slug}`),

  // Districts
  listDistricts: () => getJSON('/districts'),

  // Alerts
  listAlerts: (params = {}) => getJSON(`/alerts${qs(params)}`),
  getAlert: (slug) => getJSON(`/alerts/${slug}`),

  // Publications
  listPublications: (params = {}) => getJSON(`/publications${qs(params)}`),

  // Resources
  listResources: (params = {}) => getJSON(`/resources${qs(params)}`),
  resourceCategoryCounts: () => getJSON('/resources/category-counts'),

  // Reports
  listReports: (params = {}) => getJSON(`/reports${qs(params)}`),
  getReport: (slug) => getJSON(`/reports/${slug}`),
  activeSitreps: () => getJSON('/reports/active-sitreps'),

  // Dashboards
  dashboardOverview: (district = 'national') =>
    getJSON(`/dashboards/overview${qs({ district })}`),
};

function qs(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.set(k, v);
  return `?${sp.toString()}`;
}
