import { Link } from 'react-router-dom';
import { ArrowUpRight, Bug, BookOpen, Newspaper, Search } from 'lucide-react';

const TOOLS = [
  { name: 'OSINQUEST', description: 'Investigate IP addresses and domains across reputation, DNS, location and exposure data.', icon: Search, path: '/osinquest', status: 'Live' },
  { name: 'Raven Eyes', description: 'Track recent vulnerabilities and search the CVE catalogue by keyword or severity.', icon: Bug, path: '/raven-eyes', status: 'Live' },
  { name: 'Infos', description: 'Follow cybersecurity reporting from trusted sources, grouped by threat category.', icon: Newspaper, path: '/infos', status: 'Live' },
  { name: 'Security glossary', description: 'A plain-English reference for the language of security work.', icon: BookOpen, path: null, status: 'Planned' },
];

export default function Hub() {
  return (
    <div className="hub-wrap">
      <header className="hub-intro">
        <div>
          <p className="page-kicker">Independent security toolkit <span className="tool-index">/ 01—03</span></p>
          <h1 className="hub-title">Clarity for<br /><em>the signal.</em></h1>
        </div>
        <p className="hub-copy">Practical tools for understanding what is happening across the security landscape, from one focused workspace.</p>
      </header>
      <section aria-label="SakhasHQ tools" className="tool-grid">
        {TOOLS.map(({ name, description, icon: Icon, path, status }, index) => {
          const content = (
            <>
              <div className="tool-card-top">
                <Icon className="tool-icon" size={19} strokeWidth={1.7} />
                <span className="tool-index">0{index + 1} <span className="tool-state">{status}</span></span>
              </div>
              <h2 className="tool-name">{name}</h2>
              <p className="tool-description">{description}</p>
              {path && <ArrowUpRight className="absolute right-5 top-[62px] text-[#65716a]" size={15} />}
            </>
          );
          return path ? <Link key={name} to={path} className="tool-card relative">{content}</Link> : <div key={name} className="tool-card is-planned relative">{content}</div>;
        })}
      </section>
    </div>
  );
}
