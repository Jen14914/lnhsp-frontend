import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

const STATUS_LABEL = {
  active: 'Active outbreak',
  watch: 'Under watch',
  routine: 'Routine surveillance',
  nocases: 'No cases reported',
};
const STATUS_BADGE_CLASS = {
  active: 'st-active',
  watch: 'st-watch',
  routine: 'st-routine',
  nocases: 'st-nocases',
};
const TREND_ICON = { up: '▲', down: '▼', flat: '—' };

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function DiseaseAtoZPage() {
  const [diseases, setDiseases] = useState(null);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedSlug, setSelectedSlug] = useState(null);

  useEffect(() => {
    api.listDiseases().then(setDiseases).catch(setError);
  }, []);

  // Server-side filters (category/status/search) re-fetch for accuracy,
  // but we debounce lightly by only firing when a filter actually changes.
  useEffect(() => {
    if (diseases === null) return; // wait for initial load
    const params = {};
    if (category !== 'all') params.category = category;
    if (status !== 'all') params.status = status;
    if (search.trim()) params.search = search.trim();
    api.listDiseases(params).then(setDiseases).catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status, search]);

  if (error) return <ErrorState error={error} />;
  if (diseases === null) return <Loading />;

  const groups = groupByLetter(diseases);
  const usedLetters = new Set(diseases.map((d) => d.letter));
  const selected = diseases.find((d) => d.slug === selectedSlug) || null;

  const statusCounts = countByStatus(diseases);

  return (
    <>
      {/* Hero */}
      <div className="atoz-hero">
        <div className="container atoz-hero-inner">
          <div>
            <h2>Disease A to Z</h2>
            <p>
              Complete index of communicable diseases under surveillance in Lesotho — with live
              status from national IDSR data
            </p>
          </div>
          <div className="atoz-search-wrap">
            <input
              type="search"
              className="atoz-search-input"
              placeholder="Search diseases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="atoz-search-btn" type="button" aria-label="Search">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filter + stats bar */}
      <div className="atoz-filter-bar">
        <div className="container atoz-filter-inner">
          <label>Category</label>
          <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All diseases</option>
            <option value="idsr1">IDSR Priority 1</option>
            <option value="idsr2">IDSR Priority 2</option>
            <option value="vpd">Vaccine-Preventable</option>
            <option value="zoonotic">Zoonotic</option>
            <option value="sti">STI / Blood-borne</option>
          </select>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active outbreak</option>
            <option value="watch">Under watch</option>
            <option value="routine">Routine surveillance</option>
            <option value="nocases">No cases</option>
          </select>
          <div className="atoz-stats">
            <div className="atoz-stat">
              <span className="as-dot" style={{ background: 'var(--alert-red)' }}></span>
              {statusCounts.active} Active
            </div>
            <div className="atoz-stat">
              <span className="as-dot" style={{ background: 'var(--alert-amber)' }}></span>
              {statusCounts.watch} Watch
            </div>
            <div className="atoz-stat">
              <span className="as-dot" style={{ background: 'var(--ls-green)' }}></span>
              {statusCounts.routine + statusCounts.nocases} Routine
            </div>
          </div>
        </div>
      </div>

      {/* Alphabet navigator */}
      <div className="atoz-alpha-bar">
        <div className="container">
          <div className="alpha-nav">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                className={`alpha-btn ${usedLetters.has(letter) ? '' : 'empty'}`}
                disabled={!usedLetters.has(letter)}
                onClick={() => {
                  document
                    .getElementById(`group-${letter}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="atoz-content">
        <div className="container atoz-split">
          <div>
            <div className="atoz-list">
              {Object.keys(groups).length === 0 ? (
                <div className="atoz-no-results">No diseases found matching your search.</div>
              ) : (
                Object.keys(groups)
                  .sort()
                  .map((letter) => (
                    <div className="atoz-letter-group" id={`group-${letter}`} key={letter}>
                      <div className="atoz-letter-anchor">
                        <span className="lc">{letter}</span>
                      </div>
                      {groups[letter].map((d) => (
                        <DiseaseEntry
                          key={d.slug}
                          disease={d}
                          selected={d.slug === selectedSlug}
                          onSelect={() => setSelectedSlug(d.slug)}
                        />
                      ))}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="atoz-detail">
            {selected ? (
              <DetailPanel disease={selected} />
            ) : (
              <div className="detail-empty">
                <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                </svg>
                <p>
                  Select any disease from the list to view its full profile — including current
                  surveillance status, symptoms, transmission, and prevention.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DiseaseEntry({ disease: d, selected, onSelect }) {
  const caseColorClass = d.status === 'active' ? 'red' : d.status === 'watch' ? 'amber' : '';
  return (
    <div
      className={`disease-entry status-${d.status} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? onSelect() : null)}
    >
      <div className="de-left">
        <div className="de-names">
          <span className="de-name">{d.name}</span>
          {d.sesotho_name && <span className="de-sesotho">{d.sesotho_name}</span>}
        </div>
        <div className="de-meta">
          <span>{d.idsr_priority}</span>
          <span className="dot"></span>
          <span>{d.transmission}</span>
        </div>
        <div className="de-desc">{truncate(d.description, 90)}</div>
      </div>
      <div className="de-right">
        <span className={`de-status ${STATUS_BADGE_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
        <div className={`de-cases ${caseColorClass}`}>{d.cases_this_week}</div>
        <div className="de-cases-label">
          {TREND_ICON[d.trend] || '—'} cases Wk24
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ disease: d }) {
  const headClass = d.status === 'active' ? 'head-red' : d.status === 'watch' ? 'head-amber' : '';
  const caseColorClass = d.status === 'active' ? 'red' : d.status === 'watch' ? 'amber' : '';
  const transmissionTags = (d.transmission || '').split(' / ').filter(Boolean);

  return (
    <div className="detail-panel active">
      <div className={`dp-head ${headClass}`}>
        <div className="dph-status">
          <span className={`de-status ${STATUS_BADGE_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
        </div>
        <div className="dph-name">{d.name}</div>
        {d.sesotho_name && <div className="dph-sesotho">{d.sesotho_name}</div>}
      </div>
      <div className="dp-body">
        {d.active_alert_note && <div className="dp-alert-box">⚠ {d.active_alert_note}</div>}

        <div className="dp-stat-row">
          <div className="dp-stat">
            <div className={`dps-val ${caseColorClass}`}>{d.cases_this_week}</div>
            <div className="dps-label">Cases Wk 24</div>
          </div>
          <div className="dp-stat">
            <div className="dps-val">{(d.idsr_priority || '').replace('IDSR ', '')}</div>
            <div className="dps-label">IDSR category</div>
          </div>
        </div>

        <div className="dp-section">
          <div className="dp-section-title">About</div>
          <p>{d.description}</p>
        </div>

        <div className="dp-section">
          <div className="dp-section-title">Transmission</div>
          <div className="dp-tags">
            {transmissionTags.map((t) => (
              <span className="dp-tag" key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="dp-section">
          <div className="dp-section-title">Symptoms</div>
          <div className="dp-symptoms">
            {(d.symptoms || []).map((s) => (
              <div className="dp-symptom" key={s}>{s}</div>
            ))}
          </div>
        </div>

        <div className="dp-section">
          <div className="dp-section-title">Prevention</div>
          <p>{d.prevention}</p>
        </div>

        <div className="dp-section">
          <div className="dp-section-title">When to seek care</div>
          <p>{d.when_to_seek_care}</p>
        </div>
      </div>
      <div className="dp-footer">
        <Link to="/reports" className="btn-dp-report">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          View surveillance reports
        </Link>
      </div>
    </div>
  );
}

function groupByLetter(diseases) {
  const groups = {};
  for (const d of diseases) {
    if (!groups[d.letter]) groups[d.letter] = [];
    groups[d.letter].push(d);
  }
  for (const letter of Object.keys(groups)) {
    groups[letter].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

function countByStatus(diseases) {
  return diseases.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    { active: 0, watch: 0, routine: 0, nocases: 0 }
  );
}

function truncate(text, n) {
  if (!text) return '';
  return text.length > n ? `${text.slice(0, n)}…` : text;
}
