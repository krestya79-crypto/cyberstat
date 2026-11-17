import { useEffect, useRef, useState } from 'react';
import { Calculator, Library, FunctionSquare, Search, ChevronRight } from 'lucide-react';
import { Examples, Formulas } from './pages/ReferencePages';
import { StatisticalSolver } from './pages/StatisticalSolver';
import { FormulaDerivations } from './pages/FormulaDerivations';
import { PwaControls, useConnection } from './components/Pwa';
import { project } from './content/project';
const nav = [
  { path: 'solver', label: 'Statistical Solver', icon: Calculator },
  { path: 'examples', label: 'Worked Examples', icon: Library },
  { path: 'formulas', label: 'Formula Notebook', icon: FunctionSquare },
];
function ProjectInformation() {
  return (
    <>
      <h2>Project Information</h2>
      <dl>
        <dt>Student Name</dt>
        <dd>{project.student}</dd>
        <dt>University Name</dt>
        <dd>{project.university}</dd>
        <dt>Doctor Name</dt>
        <dd>{project.doctor}</dd>
        <dt>Subject Name</dt>
        <dd>{project.subject}</dd>
      </dl>
    </>
  );
}
export function App() {
  const [hash, setHash] = useState(location.hash || '#/'),
    [search, setSearch] = useState('');
  const online = useConnection(),
    mainRef = useRef<HTMLElement>(null),
    previous = useRef('');
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?'),
    params = new URLSearchParams(query),
    selected = !path ? 'solver' : path;
  const title = nav.find((n) => n.path === selected)?.label ?? 'Page not found';
  useEffect(() => {
    const change = () => setHash(location.hash || '#/');
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.title = title + ' | CyberStat';
    if (previous.current && previous.current !== hash) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
    previous.current = hash;
  }, [hash, title]);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <a href="#/solver" className="brand" aria-label="CyberStat home">
          <img src={import.meta.env.BASE_URL + 'icon.svg'} alt="" />
          <span>
            CyberStat<small>MAKE SENSE OF UNCERTAINTY</small>
          </span>
        </a>
        <span className="nav-caption statistical-nav-caption">YOUR WORKSPACE</span>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <a
              key={n.path}
              href={'#/' + n.path}
              className={selected === n.path ? 'active' : ''}
              aria-current={selected === n.path ? 'page' : undefined}
            >
              <n.icon size={19} />
              {n.label}
              {selected === n.path && <span className="nav-indicator" />}
            </a>
          ))}
        </nav>
        <section className="sidebar-bottom project-information">
          <ProjectInformation />
        </section>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumbs">
            <a href="#/solver">Your workspace</a>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <div className="topbar-right">
            <form
              className="top-search"
              onSubmit={(e) => {
                e.preventDefault();
                location.hash = '/formulas?q=' + encodeURIComponent(search);
                setSearch('');
              }}
            >
              <Search size={15} />
              <input
                aria-label="Search statistical formulas"
                placeholder="Find a formula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <span className={'online-state ' + (online ? '' : 'offline')}>
              <span />
              {online ? 'Online' : 'Offline'}
            </span>
            <PwaControls />
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">
          {selected === 'solver' ? (
            <StatisticalSolver
              key={hash}
              formulaId={params.get('formula') ?? undefined}
              exampleId={params.get('example') ?? undefined}
            />
          ) : path === 'examples' ? (
            <Examples key={hash} initialSource={Number(params.get('source')) || 0} />
          ) : path === 'formulas' && params.get('view') === 'proofs' ? (
            <FormulaDerivations key={hash} entryKey={params.get('entry') ?? undefined} />
          ) : path === 'formulas' ? (
            <Formulas
              key={hash}
              initialQuery={params.get('q') ?? ''}
              entryKey={params.get('entry') ?? undefined}
            />
          ) : (
            <section className="empty-state">
              <h1>That page is no longer available.</h1>
              <a className="button primary" href="#/solver">
                Open Statistical Solver
              </a>
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>CyberStat / Statistical Problem Solver</span>
          <span>{project.student}</span>
          <details className="mobile-project-information">
            <summary>Project Information</summary>
            <ProjectInformation />
          </details>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map((n) => (
          <a
            key={n.path}
            href={'#/' + n.path}
            className={selected === n.path ? 'active' : ''}
            aria-current={selected === n.path ? 'page' : undefined}
          >
            <n.icon size={20} />
            <span>{n.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
