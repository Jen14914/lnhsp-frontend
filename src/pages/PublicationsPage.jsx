import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

const TYPE_BADGE = {
  bulletin: 'badge-bulletin',
  outbreak: 'badge-outbreak',
  annual: 'badge-annual',
  guideline: 'badge-guideline',
  advisory: 'badge-advisory',
  research: 'badge-research',
};

const TYPE_LABEL = {
  bulletin: 'Epidemiological Bulletin',
  outbreak: 'Outbreak Investigation',
  annual: 'Annual Report',
  guideline: 'Guidelines & Protocols',
  advisory: 'Special Advisory',
  research: 'Research Article',
};

export default function PublicationsPage() {
  const [pubType, setPubType] = useState('all');
  const [year, setYear] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listPublications({ featured_only: true }).then(setFeatured).catch(setError);
  }, []);

  useEffect(() => {
    setData(null);
    api
      .listPublications({
        pub_type: pubType === 'all' ? undefined : pubType,
        year: year === 'all' ? undefined : year,
        search: search || undefined,
        page,
      })
      .then(setData)
      .catch(setError);
  }, [pubType, year, search, page]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="tab-page active">
      <div className="pub-hero">
        <div className="container">
          <h2>Publications</h2>
          <p>
            Formally produced and officially released documents from the Lesotho Ministry of
            Health surveillance programme
          </p>
        </div>
      </div>

      <div className="pub-filter-bar">
        <div className="container pub-filter-inner">
          <label>Filter by</label>
          <select className="filter-select" value={pubType} onChange={(e) => { setPubType(e.target.value); setPage(1); }}>
            <option value="all">All types</option>
            <option value="bulletin">Epidemiological Bulletins</option>
            <option value="outbreak">Outbreak Investigation Reports</option>
            <option value="annual">Annual Reports</option>
            <option value="guideline">Guidelines &amp; Protocols</option>
            <option value="advisory">Special Advisories</option>
            <option value="research">Research &amp; Articles</option>
          </select>
          <select className="filter-select" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
            <option value="all">All years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <input
            type="search"
            className="filter-search"
            placeholder="Search publications…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {featured && featured.items?.length > 0 && (
        <div className="pub-featured">
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">Latest publications</h3>
            </div>
            <div className="featured-grid">
              {featured.items.map((p) => (
                <a href={p.file_url} className="featured-card" key={p.slug} download={!p.is_external_link}>
                  <div className="fc-thumb">
                    <span className="fc-thumb-label">{TYPE_LABEL[p.pub_type]}</span>
                    <span className="fc-thumb-icon">{p.file_format}</span>
                  </div>
                  <div className="fc-body">
                    <span className={`fc-type-badge ${TYPE_BADGE[p.pub_type]}`}>{TYPE_LABEL[p.pub_type]}</span>
                    <div className="fc-title">{p.title}</div>
                    <div className="fc-meta">
                      <span className="fc-date">
                        {p.published_date}{p.file_size_mb ? ` · ${p.file_size_mb} MB` : ''}
                      </span>
                      <span className="fc-download">{p.is_external_link ? 'View →' : 'Download'}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pub-archive">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 18 }}>
            <h3 className="section-title">Publication archive</h3>
            {data && (
              <span style={{ fontSize: 12, color: 'var(--ls-muted)' }}>
                Showing {data.items.length} of {data.total} publications
              </span>
            )}
          </div>

          {!data ? (
            <Loading />
          ) : (
            <div className="archive-grid">
              {data.items.map((p) => (
                <a href={p.file_url} className="archive-card" key={p.slug} download={!p.is_external_link}>
                  <div className="archive-icon">{p.file_format}</div>
                  <div className="archive-info">
                    <div className="ai-title">{p.title}</div>
                    <div className="ai-meta">
                      <span className={`fc-type-badge ${TYPE_BADGE[p.pub_type]}`} style={{ margin: 0 }}>
                        {TYPE_LABEL[p.pub_type]}
                      </span>
                      <span className="divider"></span>
                      <span>{p.published_date}</span>
                      {p.file_size_mb && (
                        <>
                          <span className="divider"></span>
                          <span>{p.file_size_mb} MB</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="archive-action">
                    <span className="btn-dl">{p.is_external_link ? 'View article' : 'Download'}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {data && data.total_pages > 1 && (
            <div className="pub-pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`page-btn ${n === page ? 'current' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="page-btn" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
