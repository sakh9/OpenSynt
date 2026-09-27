import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, Home, Search } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'OPENSYNT', to: '/opensynt', Icon: Search },
];

export default function Layout() {
  const { pathname } = useLocation();
  const isHub = pathname === '/';

  return (
    <div className="site-shell min-h-screen bg-slate-950 text-slate-100">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" aria-label="OpenSynt Home">
            <span className="brand-mark"><Activity size={17} strokeWidth={2.2} /></span>
            <span className="brand-wordmark">Open<span>Synt</span></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, to, Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `site-nav-link${isActive ? ' is-active' : ''}`}>
                <Icon size={15} strokeWidth={1.8} /> <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="site-status"><span className="status-dot" /> INTELLIGENCE </div>
        </div>
      </header>
      <main key={pathname} className={`route-content${isHub ? ' route-content-hub' : ''}`}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span><Home size={13} /> OPENSYNT</span>
        <span>Open Source Intelligence</span>
      </footer>
    </div>
  );
}
