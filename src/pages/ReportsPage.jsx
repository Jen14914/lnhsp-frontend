import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

const REPORT_TYPES = [
  { key: 'weekly', label: 'Weekly Epid. Reports' },
  { key: 'district', label: 'District Summaries' },
  { key: 'sitrep', label: 'Situation Reports' },
  { key: 'lab', label: 'Lab Surveillance' },
  { key: 'dq', label: 'Data Quality' },
];

const TYPE_LABEL = {
  weekly: 'Weekly Epidemiological Report',
  district: 'District Surveillance Summary',
  sitrep: 'Situation Report',
  lab: 'Laboratory Surveillance Report',
  dq: 'Data Quality Report',
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState('weekly');
  const [year, setYear] = useState('2025');
  const [district, setDistrict] = useState('all');
  const [search, setSearch] = useState('');

  const [districts, setDistricts] = useState(null);
  const [list, setList] = useState(null);
  const [sitreps, setSitreps] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listDistricts().then(setDistricts).catch(setError);
    api.activeSitreps().then(setSitreps).catch(setError);
  }, []);

  useEffect(() => {
    setList(null);
    api
      .listReports({
        report_type: reportType,
        year: year === 'all' ? undefined : year,
        district: district === 'all' ? undefined : district,
        search: search || undefined,
      })
      .then((data) => {
        setList(data);
        const first = data.items?.[0];
        if (first) setSelectedSlug(first.slug);
        else { setSelectedSlug(null); setDetail(null); }
      })
      .catch(setError);
  }, [reportType, year, district, search]);

  useEffect(() => {
    if (!selectedSlug) return;
    api.getReport(selectedSlug).then(setDetail).catch(setError);
  }, [selectedSlug]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="tab-page active">
      <div className="rep-hero">
        <div className="container">
          <h2>Reports</h2>
          <p>
            Weekly epidemiological reports, district summaries, situation reports and laboratory
            surveillance data for Lesotho&apos;s 10 districts
          </p>
        </div>
      </div>

      {sitreps && sitreps.length > 0 && (
        <div className="sitrep-banner">
          <div className="container sitrep-inner">
            <span className="sitrep-badge">⚠ Active SitReps</span>
            <div className="sitrep-cards">
              {sitreps.map((s) => (
                <div
                  className="sitrep-chip"
                  key={s.slug}
                  onClick={() => { setReportType('sitrep'); setSelectedSlug(s.slug); }}
                >
                  {s.title} <span className="sc-num">SitRep #{s.sitrep_number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rep-type-bar">
        <div className="container rep-type-inner">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.key}
              className={`rep-tab ${reportType === t.key ? 'active' : ''}`}
              onClick={() => setReportType(t.key)}
            >
              {t.label}{' '}
              <span className="rt-count">{list && list.type_counts ? list.type_counts[t.key] ?? 0 : ''}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rep-filter-bar">
        <div className="container rep-filter-inner">
          <label>Filter</label>
          <select className="filter-select" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <select className="filter-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="all">All districts</option>
            {districts?.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>
          <input
            type="search"
            className="filter-search"
            placeholder="Search reports…"
            style={{ width: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rep-content">
        <div className="container rep-split">
          <div className="rep-list">
            {!list ? (
              <Loading />
            ) : list.items.length === 0 ? (
              <div className="state-msg">No reports found.</div>
            ) : (
              list.items.map((r) => (
                <div
                  key={r.slug}
                  className={`rep-row ${selectedSlug === r.slug ? 'selected' : ''} ${r.report_type === 'sitrep' ? 'sitrep-row' : ''}`}
                  onClick={() => setSelectedSlug(r.slug)}
                >
                  <div className="rep-row-left">
                    <div className="rep-row-type">{TYPE_LABEL[r.report_type]}</div>
                    <div className="rep-row-title">{r.title}</div>
                    <div className="rep-row-meta">
                      <span>{r.published_date}</span>
                      <span className="dot"></span>
                      <span>{r.district ? r.district.name : 'National'}</span>
                      {r.file_size_mb && (
                        <>
                          <span className="dot"></span>
                          <span>{r.file_size_mb} MB</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="rep-row-right">
                    {r.report_type === 'sitrep' ? (
                      <span className="week-badge red-badge">SitRep #{r.sitrep_number}</span>
                    ) : r.epi_week ? (
                      <span className="week-badge">Week {r.epi_week}</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rep-preview">
            {!detail ? (
              <div className="preview-empty">
                <p>Select a report from the list to preview its key figures before downloading.</p>
              </div>
            ) : (
              <ReportPreview report={detail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportPreview({ report }) {
  const maxDistrict = Math.max(1, ...report.district_breakdowns.map((d) => d.case_count));
  return (
    <>
      <div className="preview-head">
        <div className="ph-label">{TYPE_LABEL[report.report_type]}</div>
        <div className="ph-title">{report.title}</div>
        <div className="ph-date">
          Published {report.published_date}{report.district ? ` · ${report.district.name}` : ' · National'}
        </div>
      </div>
      <div className="preview-body">
        {(report.active_outbreaks !== null || report.total_cases !== null) && (
          <div className="preview-stats">
            <div className="pstat">
              <div className="ps-val red">{report.active_outbreaks ?? '—'}</div>
              <div className="ps-label">Active outbreaks</div>
            </div>
            <div className="pstat">
              <div className="ps-val">{report.total_cases ?? '—'}</div>
              <div className="ps-label">Total cases</div>
            </div>
            <div className="pstat">
              <div className="ps-val amber">{report.deaths ?? '—'}</div>
              <div className="ps-label">Deaths</div>
            </div>
            <div className="pstat">
              <div className="ps-val">{report.districts_reporting ?? '—'}</div>
              <div className="ps-label">Districts reporting</div>
            </div>
          </div>
        )}

        {report.district_breakdowns.length > 0 && (
          <>
            <div className="preview-section-title">Cases by district</div>
            <div className="district-bars">
              {report.district_breakdowns.map((d) => (
                <div className="district-bar-row" key={d.district.slug}>
                  <span className="db-name">{d.district.name}</span>
                  <div className="db-track">
                    <div
                      className={`db-fill ${d.case_count / maxDistrict > 0.8 ? 'hot' : d.case_count / maxDistrict > 0.5 ? 'warm' : ''}`}
                      style={{ width: `${(d.case_count / maxDistrict) * 100}%` }}
                    ></div>
                  </div>
                  <span className="db-count">{d.case_count}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {report.disease_breakdowns.length > 0 && (
          <>
            <div className="preview-section-title">Top diseases this week</div>
            <div className="preview-diseases">
              {report.disease_breakdowns.map((d) => (
                <div className="pd-row" key={d.disease_slug}>
                  <span className="pd-name">{d.disease_name}</span>
                  <span className="pd-count">
                    {d.case_count}{' '}
                    <span className={`pd-trend ${d.trend}`}>
                      {d.trend === 'up' ? '▲' : d.trend === 'down' ? '▼' : '—'}
                      {d.trend_pct ? ` ${d.trend_pct}%` : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="preview-actions">
        <a href={report.file_url} className="btn-preview-dl" download>Download PDF</a>
        <button className="btn-preview-share" title="Copy link" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
          Share
        </button>
      </div>
    </>
  );
}
