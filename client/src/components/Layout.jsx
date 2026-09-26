import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, Bug, Home, Newspaper, Search } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'OSINQUEST', to: '/osinquest', Icon: Search },
  { label: 'Raven Eyes', to: '/raven-eyes', Icon: Bug },
  { label: 'Infos', to: '/infos', Icon: Newspaper },
];

export default function Layout() {
  const { pathname } = useLocation();
  const isHub = pathname === '/';

  return (
    <div className="site-shell min-h-screen bg-slate-950 text-slate-100">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" aria-label="SakhasHQ home">
            <span className="brand-mark"><Activity size={17} strokeWidth={2.2} /></span>
            <span className="brand-wordmark">Sakhas<span>HQ</span></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, to, Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `site-nav-link${isActive ? ' is-active' : ''}`}>
                <Icon size={15} strokeWidth={1.8} /> <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="site-status"><span className="status-dot" /> INTELLIGENCE SUITE</div>
        </div>
      </header>
      <main key={pathname} className={`route-content${isHub ? ' route-content-hub' : ''}`}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span><Home size={13} /> SAKHASHQ</span>
        <span>Practical security intelligence</span>
      </footer>
    </div>
  );
}
