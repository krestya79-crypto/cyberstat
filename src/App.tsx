import { useEffect, useRef, useState } from 'react';
import {
  Calculator,
  Library,
  FunctionSquare,
  ArrowUpRight,
  Search,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { Examples, Formulas, About } from './pages/StudyPages';
import { EquationSolver } from './pages/EquationSolver';
import { TopicPage } from './pages/TopicPage';
import { PwaControls, useConnection } from './components/Pwa';
import { useStored, type Progress } from './lib/storage';
import { topicById } from './content/topics';
const nav = [
  { path: 'solver', label: 'Equation Solver', icon: Calculator },
  { path: 'examples', label: 'Worked Examples', icon: Library },
  { path: 'formulas', label: 'Formula Notebook', icon: FunctionSquare },
];
export function App() {
  const [hash, setHash] = useState(location.hash || '#/');
  const [progress, setProgress, storageFailed] = useStored<Progress>('progress', {
    studied: [],
    recent: [],
  });
  const [search, setSearch] = useState('');
  const online = useConnection();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef('');
  const raw = hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  const topicId = path.startsWith('topic/') ? path.slice(6) : '';
  const isSolver = !path || ['solver', 'dashboard', 'course'].includes(path);
  const selected = path.startsWith('topic/') || isSolver ? 'solver' : path;
  const title = path.startsWith('topic/')
    ? (topicById(topicId)?.title ?? 'Topic')
    : isSolver
      ? 'Equation Solver'
      : (nav.find((n) => n.path === path)?.label ??
        (path === 'about' ? 'About CyberStat' : 'Welcome to CyberStat'));
  useEffect(() => {
    const onHash = () => setHash(location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.title = `${title} · CyberStat`;
    if (previousPath.current && previousPath.current !== hash) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
    previousPath.current = hash;
  }, [hash, title]);
  useEffect(() => {
    if (topicId && topicById(topicId))
      setProgress({
        ...progress,
        recent: [topicId, ...progress.recent.filter((id) => id !== topicId)].slice(0, 8),
      });
  }, [topicId]);
  const study = (id: string) =>
    setProgress({
      ...progress,
      studied: progress.studied.includes(id)
        ? progress.studied.filter((x) => x !== id)
        : [...progress.studied, id],
    });
  const lectureParam = Number(params.get('lecture'));
  const lecture = [1, 2, 3, 4].includes(lectureParam) ? lectureParam : 0;
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
        <a href="#/" className="brand" aria-label="CyberStat home">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <span>
            CyberStat<small>MAKE SENSE OF UNCERTAINTY</small>
          </span>
        </a>
        <div className="sidebar-course">
          <span className="course-icon">
            <GraduationCap size={19} />
          </span>
          <div>
            <strong>Probability & Statistics</strong>
            <small>Your interactive notebook</small>
          </div>
        </div>
        <span className="nav-caption">YOUR STUDY DESK</span>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <a
              key={n.path}
              className={selected === n.path ? 'active' : ''}
              aria-current={selected === n.path ? 'page' : undefined}
              href={`#/${n.path}`}
            >
              <n.icon size={19} />
              {n.label}
              {selected === n.path && <span className="nav-indicator" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="notebook-rule" />
          <p>
            Understand the idea.
            <br />
            The numbers will follow.
          </p>
        </div>
        <div className="sidebar-bottom">
          <div className="creator">
            <span>AG</span>
            <div>
              <strong>Ahmed Waleed Gad</strong>
              <small>Horus University · Egypt</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumbs">
            <a href="#/">Your study desk</a>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <div className="topbar-right">
            <form
              className="top-search"
              onSubmit={(e) => {
                e.preventDefault();
                location.hash = `/solver?q=${encodeURIComponent(search)}`;
                setSearch('');
              }}
            >
              <Search size={15} />
              <input
                aria-label="Search the course"
                placeholder="Find an idea…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <span className={`online-state ${online ? '' : 'offline'}`}>
              <span />
              {online ? 'Online' : 'Offline'}
            </span>
            <PwaControls />
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">
          {storageFailed && (
            <p role="status" className="review-note">
              Browser storage is unavailable. Progress is kept only for this session.
            </p>
          )}
          {isSolver ? (
            <EquationSolver
              key={hash}
              initialLecture={lecture}
              initialQuery={params.get('q') ?? ''}
            />
          ) : path === 'examples' ? (
            <Examples key={hash} initialLecture={lecture} />
          ) : path === 'formulas' ? (
            <Formulas />
          ) : path === 'about' ? (
            <About />
          ) : topicId ? (
            <TopicPage
              id={topicId}
              exampleId={params.get('example') ?? undefined}
              progress={progress}
              onStudy={study}
            />
          ) : (
            <section className="empty-state">
              <h1>That page isn’t in this notebook.</h1>
              <a className="button primary" href="#/solver">
                Return to your study desk
              </a>
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>
            CyberStat <span> / </span> A clearer way to understand statistics.
          </span>
          <a href="#/about">
            Made for learning. Built with care. <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map((n) => (
          <a
            key={n.path}
            href={`#/${n.path}`}
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
