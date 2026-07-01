import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

const TAG_CLASS = {
  Outbreak: 'tag-red',
  Watch: 'tag-amber',
  Investigation: 'tag-amber',
  Resolved: 'tag-green',
  Advisory: 'tag-blue',
};

const LEVEL_CLASS = {
  red: 'level-red',
  amber: 'level-amber',
  green: 'level-green',
  blue: 'level-blue',
};

const STATUS_DOT = { active: 'dot-red', watch: 'dot-amber', routine: 'dot-green', nocases: 'dot-green' };
const STATUS_BADGE = { active: 'ds-active', watch: 'ds-watch', routine: 'ds-routine', nocases: 'ds-routine' };
const STATUS_LABEL = { active: 'Active', watch: 'Watch', routine: 'Routine', nocases: 'No cases' };

export default function HomePage() {
  const [alerts, setAlerts] = useState(null);
  const [diseases, setDiseases] = useState(null);
  const [reports, setReports] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.listAlerts({ active_only: true, limit: 10 }),
      api.diseaseStatusSummary(),
      api.listReports({ report_type: 'weekly' }),
      api.dashboardOverview('national'),
    ])
      .then(([a, d, r, o]) => {
        setAlerts(a);
        setDiseases(d);
        setReports(r.items || []);
        setOverview(o);
      })
      .catch(setError);
  }, []);

  if (error) return <ErrorState error={error} />;
  if (!alerts || !diseases || !reports || !overview) return <Loading />;

  const kpi = overview.kpi;
  const topDiseases = diseases.slice(0, 8);
  const topReports = reports.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section id="hero" aria-labelledby="hero-heading">
        <div className="container hero-grid">
          <div className="hero-left">
            <p className="hero-eyebrow">National disease surveillance · Week 24, 2025</p>
            <h1 className="hero-headline" id="hero-heading">
              Protecting Lesotho
              <br />
              from <em>Public Health Threats</em>
            </h1>
            <p className="hero-sub">
              Real-time surveillance data, outbreak alerts, and epidemiological intelligence for
              healthcare workers, policymakers, and the public.
            </p>
            <div className="hero-actions">
              <Link to="/a-to-z" className="btn-primary">Disease A–Z</Link>
              <Link to="/reports" className="btn-secondary">Weekly reports</Link>
            </div>
          </div>
          <div className="alert-level-card" role="complementary" aria-label="National alert level">
            <div className="label">National alert level</div>
            <span className="alert-badge badge-amber">{kpi.alert_level.status_label}</span>
            <div className="al-num">{kpi.alert_level.level_number}</div>
            <div className="al-sub">
              Active outbreaks monitored
              <br />
              across {new Set(alerts.map((a) => a.district?.slug).filter(Boolean)).size || 3} districts
            </div>
          </div>
        </div>
      </section>

      {/* Disease status strip */}
      <div id="status-strip" role="region" aria-label="Disease surveillance status">
        <div className="status-scroll" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          {diseases.map((d) => (
            <div className="status-pill" key={d.slug}>
              <span className={`dot ${STATUS_DOT[d.status] || 'dot-green'}`}></span>
              <span className="disease">{d.name}</span>
              <span className="count">
                {d.status === 'nocases' ? 'no cases' : d.status === 'routine' ? 'routine' : `${d.cases_this_week} cases`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Stats row */}
        <div className="stats-row" role="region" aria-label="This week's national statistics">
          <div className="stat-card highlight">
            <div className="st-label">Active outbreaks</div>
            <div className="st-val">{kpi.active_outbreaks}</div>
            <div className="st-sub">
              {diseases.filter((d) => d.status === 'active' || d.status === 'watch').map((d) => d.name).join(', ') || '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="st-label">Cases this week</div>
            <div className="st-val">{kpi.cases_this_week}</div>
            <div className="st-sub">Across all IDSR diseases</div>
          </div>
          <div className="stat-card">
            <div className="st-label">Districts under surveillance</div>
            <div className="st-val">{kpi.districts_reporting.split('/')[1] || 10}</div>
            <div className="st-sub">All districts reporting</div>
          </div>
        </div>

        <div className="main-grid">
          <div className="main-col">
            <div className="section-header">
              <h2 className="section-title">Outbreak alerts &amp; advisories</h2>
            </div>
            <div className="alerts-feed" role="feed" aria-label="Outbreak alerts">
              {alerts.map((a) => (
                <div className={`alert-card ${LEVEL_CLASS[a.level] || ''}`} key={a.slug}>
                  <div>
                    <div className="alert-meta">
                      <span className={`alert-tag ${TAG_CLASS[a.tag] || 'tag-blue'}`}>{a.tag}</span>
                      <span className="alert-date">
                        {a.published_date}{a.epi_week ? ` · Week ${a.epi_week}` : ''}
                      </span>
                    </div>
                    <div className="alert-title">{a.title}</div>
                    <div className="alert-body">{a.body}</div>
                  </div>
                  <div className="alert-district">{a.district ? `${a.district.name}\ndistrict` : 'National'}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="sidebar" aria-label="Disease information and reports">
            <div className="widget">
              <div className="widget-head">
                <span className="wh-title">Disease A–Z</span>
                <Link to="/a-to-z">Full library →</Link>
              </div>
              <div className="widget-body">
                <ul className="disease-list">
                  {topDiseases.map((d) => (
                    <li key={d.slug}>
                      <Link to="/a-to-z">
                        <span className="d-name">{d.name}</span>
                        <span className={`d-status ${STATUS_BADGE[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="widget">
              <div className="widget-head">
                <span className="wh-title">Epidemiological reports</span>
                <Link to="/reports">All reports →</Link>
              </div>
              <div className="widget-body">
                <ul className="report-list">
                  {topReports.map((r) => (
                    <li key={r.slug}>
                      <a href={`/api/v1/reports/${r.slug}`}>
                        <div className="pdf-icon">PDF</div>
                        <div className="report-info">
                          <div className="r-name">{r.title}</div>
                          <div className="r-date">
                            {r.published_date}{r.file_size_mb ? ` · ${r.file_size_mb} MB` : ''}
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
