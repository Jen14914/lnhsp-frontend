import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'forms', label: 'Forms & Templates' },
  { key: 'sop', label: 'SOPs' },
  { key: 'policy', label: 'Policy Documents' },
  { key: 'training', label: 'Training Materials' },
  { key: 'iec', label: 'IEC & Posters' },
];

const ICON_CLASS = {
  forms: 'icon-blue',
  sop: 'icon-amber',
  policy: 'icon-purple',
  training: 'icon-green',
  iec: 'icon-red',
};

const TYPE_LABEL = {
  forms: 'Forms & Templates',
  sop: 'Standard Operating Procedure',
  policy: 'Policy Document',
  training: 'Training Materials',
  iec: 'IEC & Awareness Materials',
};

export default function ResourcesPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState(null);
  const [quick, setQuick] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listResources({ quick_downloads_only: true }).then(setQuick).catch(setError);
    api.resourceCategoryCounts().then(setCounts).catch(setError);
  }, []);

  useEffect(() => {
    setResources(null);
    api
      .listResources({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
      })
      .then(setResources)
      .catch(setError);
  }, [category, search]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="tab-page active">
      <div className="res-hero">
        <div className="container">
          <h2>Resources</h2>
          <p>Practical tools, forms, templates, and materials for health workers, field officers, and partners</p>
          <div className="res-search-wrap">
            <input
              type="search"
              className="res-search-input"
              placeholder="Search forms, SOPs, training materials…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="res-search-btn">Search</button>
          </div>
        </div>
      </div>

      {quick && (
        <div className="res-quick">
          <div className="container res-quick-inner">
            <span className="res-quick-label">Quick downloads</span>
            {quick.map((r) => (
              <a href={r.file_url} className="quick-chip" key={r.slug} download>
                {r.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="res-cat-bar">
        <div className="container res-cat-inner">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`cat-tab ${category === c.key ? 'active' : ''}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label} <span className="cat-count">{counts ? counts[c.key] ?? 0 : '…'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="res-content">
        <div className="container">
          {!resources ? (
            <Loading />
          ) : resources.length === 0 ? (
            <div className="state-msg">No resources found matching your search.</div>
          ) : (
            <div className="res-grid">
              {resources.map((r) => (
                <a href={r.file_url} className="res-card" key={r.slug} download={!r.is_external_link}>
                  <div className="res-card-top">
                    <div className={`res-icon ${ICON_CLASS[r.category] || 'icon-slate'}`}>{r.file_format}</div>
                    <div className="res-card-meta">
                      <div className="res-card-type">{TYPE_LABEL[r.category]}</div>
                      <div className="res-card-title">{r.title}</div>
                    </div>
                  </div>
                  <div className="res-card-desc">{r.description}</div>
                  <div className="res-card-footer">
                    <div className="res-card-info">
                      {r.version_label && <span className="version">{r.version_label}</span>}
                      <span className="updated">Updated {r.updated_date}</span>
                    </div>
                    <span className="btn-res-dl">Download {r.file_format}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
