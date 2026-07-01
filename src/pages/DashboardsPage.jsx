import { useEffect, useRef, useState } from 'react';
import {
  Chart, BarController, BarElement, LineController, LineElement, PointElement,
  DoughnutController, ArcElement, CategoryScale, LinearScale, Legend, Tooltip,
} from 'chart.js';
import { api } from '../api/client.js';
import { Loading, ErrorState } from '../components/State.jsx';

Chart.register(
  BarController, BarElement, LineController, LineElement, PointElement,
  DoughnutController, ArcElement, CategoryScale, LinearScale, Legend, Tooltip
);

const BLUE = '#003F87';
const GREEN = '#007A3D';
const RED = '#C0392B';
const AMBER = '#D4770A';
const LIGHT = '#E6EEF8';

const DONUT_COLORS = [BLUE, '#5b21b6', AMBER, GREEN, '#0369a1', RED, '#92400e', '#6b7280'];

export default function DashboardsPage() {
  const [district, setDistrict] = useState('national');
  const [districts, setDistricts] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listDistricts().then(setDistricts).catch(setError);
  }, []);

  useEffect(() => {
    setOverview(null);
    api.dashboardOverview(district).then(setOverview).catch(setError);
  }, [district]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="tab-page active">
      <div className="dash-hero">
        <div className="container dash-hero-inner">
          <div>
            <h2>Surveillance Dashboards</h2>
            <p>Live epidemiological intelligence · Synced from DHIS2</p>
          </div>
        </div>
      </div>

      <div className="dash-meta-bar">
        <div className="container dash-meta-inner">
          <div className="sync-info">
            <span className="sync-dot"></span>
            Data last synced from DHIS2: <strong>{overview ? new Date(overview.last_synced).toLocaleString() : '…'}</strong>
          </div>
          <div className="dis-select-wrap">
            <label>District</label>
            <select className="filter-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="national">National (all districts)</option>
              {districts?.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!overview ? (
        <div className="container"><Loading /></div>
      ) : (
        <DashboardBody overview={overview} />
      )}
    </div>
  );
}

function DashboardBody({ overview }) {
  return (
    <div className="dash-content">
      <div className="container">
        <KpiRow kpi={overview.kpi} />
        <DiseasePills pills={overview.disease_pills} />

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="cc-title">National Epi Curve — All IDSR Diseases</div>
                <div className="cc-sub">Weekly case counts · Last 12 weeks · with epidemic threshold</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 220 }}>
              <EpiCurveChart points={overview.epi_curve} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="cc-title">Cases by District</div>
                <div className="cc-sub">Latest week · All diseases</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 220 }}>
              <DistrictChart points={overview.cases_by_district} />
            </div>
          </div>
        </div>

        <div className="charts-row-3">
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="cc-title">Disease Breakdown</div>
                <div className="cc-sub">% share of total cases · Latest week</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 200 }}>
              <DiseaseDonut points={overview.disease_share} />
            </div>
          </div>
          {overview.trend_series.slice(0, 2).map((series) => (
            <div className="chart-card" key={series.disease_slug}>
              <div className="chart-card-head">
                <div>
                  <div className="cc-title">{series.disease_name} — 12-Week Trend</div>
                  <div className="cc-sub">{series.status === 'active' ? 'Active outbreak' : 'Under watch'}</div>
                </div>
                <span
                  className="cc-badge"
                  style={
                    series.status === 'active'
                      ? { background: '#fde8e8', color: RED }
                      : { background: '#fff3e0', color: AMBER }
                  }
                >
                  {series.status === 'active' ? 'OUTBREAK' : 'WATCH'}
                </span>
              </div>
              <div className="chart-container" style={{ height: 200 }}>
                <TrendChart points={series.points} color={series.status === 'active' ? RED : AMBER} />
              </div>
            </div>
          ))}
        </div>

        <CompletenessHeatmap rows={overview.completeness} />
        <SeasonalCalendar rows={overview.seasonal_calendar} />
      </div>
    </div>
  );
}

function KpiRow({ kpi }) {
  return (
    <div className="kpi-row">
      <div className="kpi-alert">
        <div className="ka-label">National alert level</div>
        <div className="ka-level-ring"><span>{kpi.alert_level.level_number}</span></div>
        <div className="ka-status">{kpi.alert_level.status_label}</div>
      </div>
      <div className="kpi-card">
        <div className="kc-label">Active outbreaks</div>
        <div className="kc-val red">{kpi.active_outbreaks}</div>
        <div className="kc-trend"><span className="up">▲ {kpi.active_outbreaks_delta}</span> vs last week</div>
      </div>
      <div className="kpi-card">
        <div className="kc-label">Cases this week</div>
        <div className="kc-val">{kpi.cases_this_week}</div>
        <div className="kc-trend"><span className="up">▲ {kpi.cases_pct_change}%</span> vs last week</div>
      </div>
      <div className="kpi-card">
        <div className="kc-label">Deaths this week</div>
        <div className="kc-val amber">{kpi.deaths_this_week}</div>
        <div className="kc-trend">CFR <span style={{ fontWeight: 600 }}>{kpi.case_fatality_rate_pct}%</span></div>
      </div>
      <div className="kpi-card">
        <div className="kc-label">Districts reporting</div>
        <div className="kc-val green">{kpi.districts_reporting}</div>
        <div className="kc-trend"><span className="down">{kpi.districts_reporting_pct}%</span> completeness</div>
      </div>
    </div>
  );
}

function DiseasePills({ pills }) {
  const statusClass = { active: 'status-red', watch: 'status-amber', routine: 'status-green', nocases: 'status-green' };
  return (
    <div className="disease-status-grid">
      {pills.map((p) => (
        <div className={`ds-pill ${statusClass[p.status]}`} key={p.slug}>
          <div className="dp-name">{p.name}</div>
          <div className="dp-count">{p.cases_this_week}</div>
          <div className="dp-trend">{p.trend_label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Chart components (each owns a canvas + Chart.js instance lifecycle) ──

function useChart(buildConfig, deps) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, buildConfig());
    return () => chartRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}

function EpiCurveChart({ points }) {
  const canvasRef = useChart(() => ({
    type: 'bar',
    data: {
      labels: points.map((p) => p.label),
      datasets: [
        {
          label: 'Total cases',
          data: points.map((p) => p.total_cases),
          backgroundColor: points.map((p) => (p.total_cases >= p.threshold ? '#fde8e8' : LIGHT)),
          borderColor: points.map((p) => (p.total_cases >= p.threshold ? RED : BLUE)),
          borderWidth: 1, borderRadius: 3,
        },
        {
          label: 'Epidemic threshold', type: 'line',
          data: points.map((p) => p.threshold),
          borderColor: RED, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
    },
  }), [points]);
  return <canvas ref={canvasRef} />;
}

function DistrictChart({ points }) {
  const canvasRef = useChart(() => ({
    type: 'bar',
    data: {
      labels: points.map((p) => p.district),
      datasets: [{
        label: 'Cases',
        data: points.map((p) => p.case_count),
        backgroundColor: points.map((p, i) => (i === 0 ? RED : BLUE)),
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true }, y: { grid: { display: false } } },
    },
  }), [points]);
  return <canvas ref={canvasRef} />;
}

function DiseaseDonut({ points }) {
  const canvasRef = useChart(() => ({
    type: 'doughnut',
    data: {
      labels: points.map((p) => p.disease),
      datasets: [{
        data: points.map((p) => p.case_count),
        backgroundColor: DONUT_COLORS,
        borderWidth: 2, borderColor: '#fff',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } },
    },
  }), [points]);
  return <canvas ref={canvasRef} />;
}

function TrendChart({ points, color }) {
  const canvasRef = useChart(() => ({
    type: 'line',
    data: {
      labels: points.map((p) => p.label),
      datasets: [{
        label: 'Cases',
        data: points.map((p) => p.case_count),
        borderColor: color, backgroundColor: `${color}14`,
        borderWidth: 2, fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: color,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false }, ticks: { maxRotation: 0 } } },
    },
  }), [points, color]);
  return <canvas ref={canvasRef} />;
}

function CompletenessHeatmap({ rows }) {
  if (!rows.length) return null;
  const weeks = rows[0].cells.map((c) => c.epi_week);
  const statusLabel = { submitted: '✓', late: 'L', missing: '✗' };
  return (
    <div className="chart-card" style={{ marginBottom: 14 }}>
      <div className="chart-card-head">
        <div>
          <div className="cc-title">Reporting Completeness &amp; Timeliness</div>
          <div className="cc-sub">Last {weeks.length} weeks · All districts · Green = on time · Amber = late · Red = missing</div>
        </div>
      </div>
      <div
        className="completeness-grid"
        style={{ gridTemplateColumns: `110px repeat(${weeks.length}, 1fr)` }}
      >
        <div className="cg-header"></div>
        {weeks.map((w) => <div className="cg-header" key={w}>Wk {w}</div>)}
        {rows.map((row) => (
          <div className="cg-district-row" key={row.district} style={{ display: 'contents' }}>
            <div className="cg-district">{row.district}</div>
            {row.cells.map((c) => (
              <div className={`cg-cell ${c.status}`} key={c.epi_week}>{statusLabel[c.status]}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonalCalendar({ rows }) {
  if (!rows.length) return null;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <div className="cc-title">Seasonal Disease Calendar — Lesotho</div>
          <div className="cc-sub">Historical transmission intensity by month · Darker = higher activity</div>
        </div>
      </div>
      <div className="seasonal-grid">
        <div className="sg-month"></div>
        {monthNames.map((m) => <div className="sg-month" key={m}>{m}</div>)}
        {rows.map((row) => (
          <div key={row.disease} style={{ display: 'contents' }}>
            <div className="sg-disease">{row.disease}</div>
            {row.cells.map((c) => (
              <div className={`sg-cell sg-${c.intensity}`} key={c.month}></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
