import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';

const NAV = [
  { to: '/', label: 'Home' },
  {
    to: '/publications',
    label: 'Publications',
    submenu: [
      { to: '/publications?type=weekly',    label: 'Weekly Epidemiological Reports' },
      { to: '/publications?type=monthly',   label: 'Monthly Epidemiological Reports' },
      { to: '/publications?type=quarterly', label: 'Quarterly Epidemiological Reports' },
      { to: '/publications?type=annual',    label: 'Yearly Epidemiological Reports' },
      { to: '/publications?type=sitrep',    label: 'Situational Reports' },
      { to: '/publications?type=bulletin',  label: 'Bulletins' },
      { to: '/publications?type=research',  label: 'Articles' },
      { to: '/publications?type=fetp',      label: 'FETP Surveillance Reports' },
      { to: '/publications?type=project',   label: 'Projects' },
    ],
  },
  { to: '/resources', label: 'Resources' },
  { to: '/reports',   label: 'Reports' },
  { to: '/dashboards', label: 'Dashboards' },
  { to: '/a-to-z',   label: 'Disease A to Z' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [tickerAlerts, setTickerAlerts] = useState([]);
  const [openSubmenu, setOpenSubmenu] = useState(null); // desktop hover/click dropdown
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(null); // which mobile accordion item is open
  const navRef = useRef(null);

  useEffect(() => {
    api
      .listAlerts({ ticker_only: true, active_only: true })
      .then(setTickerAlerts)
      .catch(() => setTickerAlerts([]));
  }, []);

  // Close the mobile menu and any open dropdown whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
    setMobileSubOpen(null);
    setOpenSubmenu(null);
  }, [location.pathname, location.search]);

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenSubmenu(null);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        setOpenSubmenu(null);
        setMobileNavOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const dotClass = (level) =>
    level === 'red' ? 'red' : level === 'amber' ? 'amber' : 'green';

  // Duplicate the list once so the CSS marquee animation loops seamlessly.
  const tickerItems = [...tickerAlerts, ...tickerAlerts];

  function isActive(item) {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  }

  return (
    <>
      <header id="topbar" role="banner">
        <div className="container inner">
          <Link to="/" className="brand" aria-label="LNHSP home">
            <div className="brand-text">
              <div className="title">Lesotho Health Surveillance</div>
              <div className="eyebrow">Ministry of Health</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="topbar-nav desktop-nav" aria-label="Main navigation" ref={navRef}>
            {NAV.map((item) =>
              item.submenu ? (
                <div
                  className="nav-item-dropdown"
                  key={item.to}
                  onMouseEnter={() => setOpenSubmenu(item.to)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${isActive(item) ? 'active' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={openSubmenu === item.to}
                    onClick={() => setOpenSubmenu(openSubmenu === item.to ? null : item.to)}
                  >
                    {item.label}
                    <svg
                      className="nav-caret"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className={`nav-submenu ${openSubmenu === item.to ? 'open' : ''}`}>
                    <Link to={item.to} className="nav-submenu-all">
                      All publications
                    </Link>
                    <div className="nav-submenu-items">
                      {item.submenu.map((sub) => (
                        <Link to={sub.to} className="nav-submenu-link" key={sub.to}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.to} to={item.to} className={isActive(item) ? 'active' : ''}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile nav panel */}
        <nav
          className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}
          aria-label="Mobile navigation"
          aria-hidden={!mobileNavOpen}
        >
          {NAV.map((item) =>
            item.submenu ? (
              <div className="mobile-nav-group" key={item.to}>
                <div className="mobile-nav-group-head">
                  <Link to={item.to} className={isActive(item) ? 'active' : ''}>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className={`mobile-nav-expand ${mobileSubOpen === item.to ? 'open' : ''}`}
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-expanded={mobileSubOpen === item.to}
                    onClick={() => setMobileSubOpen(mobileSubOpen === item.to ? null : item.to)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                </div>
                <div className={`mobile-nav-submenu ${mobileSubOpen === item.to ? 'open' : ''}`}>
                  {item.submenu.map((sub) => (
                    <Link to={sub.to} key={sub.to}>{sub.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.to} to={item.to} className={isActive(item) ? 'active' : ''}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      </header>

      <div id="alert-strip" role="alert" aria-live="polite" aria-label="Current health alerts">
        <div className="container ticker-wrap">
          <span className="ticker-label">Live alerts</span>
          <div className="ticker-scroll">
            <div className="ticker-inner">
              {tickerItems.length === 0 ? (
                <span className="ticker-item">No active alerts</span>
              ) : (
                tickerItems.map((a, i) => (
                  <span className="ticker-item" key={`${a.slug}-${i}`}>
                    <span className={`ticker-dot ${dotClass(a.level)}`}></span>
                    {a.title}
                    {a.district ? ` — ${a.district.name} district` : ''}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <main id="main">{children}</main>

      <footer id="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="fb-title">Lesotho Health Surveillance</div>
              <p>
                Official disease surveillance platform of the Kingdom of Lesotho Ministry of
                Health. Data sourced from DHIS2 and the national IDSR system.
              </p>
            </div>
            <div className="footer-col">
              <h4>Surveillance</h4>
              <ul>
                <li><Link to="/">Outbreak alerts</Link></li>
                <li><Link to="/dashboards">Dashboards</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Information</h4>
              <ul>
                <li><Link to="/a-to-z">Disease A–Z</Link></li>
                <li><Link to="/reports">Weekly reports</Link></li>
                <li><Link to="/publications">Publications</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>For health workers</h4>
              <ul>
                <li><Link to="/resources">IDSR forms</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Ministry of Health, Kingdom of Lesotho · Data updated every 15 minutes from DHIS2</p>
            <span className="moh-badge">MOH · Lesotho</span>
          </div>
        </div>
      </footer>
    </>
  );
}
