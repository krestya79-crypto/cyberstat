import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Calculator,
  Bookmark,
  Layers,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { lectures, topics, topicById, outlineOnly } from '../content/topics';
import { examples } from '../content/examples';
import { methodLabels } from '../content/methods';
import { DistributionChart } from '../components/Chart';
import { MathText } from '../components/Math';
import { SourceLink } from '../components/Workspace';
import type { Progress } from '../lib/storage';
export function Welcome() {
  return (
    <>
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="course-tag">
            <span /> PROBABILITY & STATISTICS, MADE CLEAR
          </span>
          <h1>
            Less memorizing.
            <br />
            More <em>understanding.</em>
          </h1>
          <p>
            Find the meaning behind the mathematics. Explore your lectures, work through real
            examples, and see statistics come to life.
          </p>
          <div className="hero-actions">
            <a href="#/dashboard" className="button primary">
              Enter your study space <ArrowRight size={18} />
            </a>
            <a href="#/course" className="text-link">
              Explore the course <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="hero-footnote">
            <span className="stacked-pages">
              <BookOpen size={17} />
            </span>
            <span>
              Built around your <strong>four course lectures.</strong>
              <br />
              Learn at your pace. Keep your progress.
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-top">
            <span className="eyebrow">A LITTLE INTUITION GOES A LONG WAY</span>
            <span className="visual-page">01 / 04</span>
          </div>
          <div className="visual-title">
            <h2>Meet the normal curve.</h2>
            <span className="formula-chip">
              <MathText tex={'Z\\sim N(0,1)'} />
            </span>
          </div>
          <DistributionChart
            compact
            curve={{
              family: 'normal',
              center: 0,
              scale: 1,
              df: 0,
              df2: 0,
              lower: -1.9599639845,
              upper: 1.9599639845,
              axis: 'Standard deviations from the mean · z',
            }}
          />
          <div className="visual-caption">
            <span className="caption-line" />
            <p>
              <strong>95% of the area.</strong> Between −1.96 and +1.96.
              <br />
              One simple picture. A whole new way to think.
            </p>
          </div>
          <a href="#/topic/standard-normal" className="visual-link">
            Explore this idea <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="learning-path">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR COURSE, CONNECTED</span>
            <h2>Four lectures. One clear path.</h2>
          </div>
          <span className="small muted">Start anywhere. Connect everything.</span>
        </div>
        <div className="lecture-path">
          {lectures.map((l) => (
            <a key={l.n} href={`#/course?lecture=${l.n}`}>
              <span className="lecture-number">0{l.n}</span>
              <h3>{l.title}</h3>
              <p>{l.description}</p>
              <span className="path-bottom">
                {topics.filter((t) => t.lecture === l.n).length} topics <ArrowUpRight size={17} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="welcome-bottom">
        <div>
          <span className="eyebrow">LEARN IT. WORK IT OUT. KEEP IT.</span>
          <h2>
            A study space that
            <br />
            stays by your side.
          </h2>
        </div>
        <div className="capability-list">
          <div>
            <Calculator size={20} />
            <p>
              <strong>Follow the mathematics</strong>
              <span>Switch between Quick and Detailed solutions.</span>
            </p>
          </div>
          <div>
            <Layers size={20} />
            <p>
              <strong>See what changes</strong>
              <span>Connect your inputs to a meaningful visualization.</span>
            </p>
          </div>
          <div>
            <Bookmark size={20} />
            <p>
              <strong>Study wherever you are</strong>
              <span>Install the app, work offline, and export solutions.</span>
            </p>
          </div>
        </div>
      </section>
      <div className="academic-signature">
        AN ACADEMIC PROJECT BY AHMED WALEED GAD <span>HORUS UNIVERSITY — EGYPT</span>
      </div>
    </>
  );
}
export function Dashboard({ progress }: { progress: Progress }) {
  const studied = progress.studied.filter((id) => topicById(id));
  const recent = progress.recent.map(topicById).filter((t) => t !== undefined);
  const next = topics.find((t) => !studied.includes(t.id)) ?? topics[0];
  const resume = recent[0] ?? next;
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">YOUR PERSONAL STUDY SPACE</span>
        <h1>A little progress, every day.</h1>
        <p>Pick up an idea, work through the mathematics, and make it yours.</p>
      </header>
      <section className="dashboard-intro">
        <div className="continue-panel">
          <span className="eyebrow">
            {recent.length ? 'PICK UP WHERE YOU LEFT OFF' : 'A GOOD PLACE TO BEGIN'}
          </span>
          <h2>{resume.title}</h2>
          <p>{resume.short}.</p>
          <a href={`#/topic/${resume.id}`} className="button primary">
            {recent.length ? 'Continue studying' : 'Start studying'} <ArrowRight size={17} />
          </a>
        </div>
        <div className="progress-panel">
          <span className="eyebrow">YOUR COURSE PROGRESS</span>
          <div className="progress-numbers">
            <strong>
              {studied.length}
              <span> / {topics.length}</span>
            </strong>
            <span>
              topics marked
              <br />
              as studied
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Topics marked as studied"
            aria-valuemin={0}
            aria-valuemax={topics.length}
            aria-valuenow={studied.length}
          >
            <span style={{ width: `${(studied.length / topics.length) * 100}%` }} />
          </div>
          <p className="small muted">
            Mark topics as studied when you feel ready. Progress stays on this device.
          </p>
        </div>
      </section>
      <section className="dashboard-course">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE BIG PICTURE</span>
            <h2>Your course notebook.</h2>
          </div>
          <a className="text-link" href="#/course">
            Explore all topics <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="lecture-rows">
          {lectures.map((l) => {
            const ts = topics.filter((t) => t.lecture === l.n);
            const done = ts.filter((t) => studied.includes(t.id)).length;
            return (
              <a href={`#/course?lecture=${l.n}`} key={l.n}>
                <span className="lecture-number">0{l.n}</span>
                <div>
                  <span className="small muted">
                    LECTURE {l.n} · {l.pages} PAGES
                  </span>
                  <h3>{l.title}</h3>
                  <p>{l.description}</p>
                </div>
                <span className="row-progress">
                  {done}/{ts.length} studied
                  <span className="progress-track">
                    <span style={{ width: `${(done / ts.length) * 100}%` }} />
                  </span>
                </span>
                <ArrowUpRight size={20} />
              </a>
            );
          })}
        </div>
      </section>
      <div className="dashboard-lower">
        <section>
          <div className="section-heading">
            <h2>Recently opened</h2>
            <span className="small muted">On this device</span>
          </div>
          {recent.length ? (
            <div className="recent-list">
              {recent.slice(0, 4).map((t) => (
                <a href={`#/topic/${t.id}`} key={t.id}>
                  <BookOpen size={17} />
                  <span>
                    {t.title}
                    <small>Lecture {t.lecture}</small>
                  </span>
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
          ) : (
            <div className="quiet-empty">
              <BookOpen size={25} />
              <p>Your recently opened topics will appear here.</p>
            </div>
          )}
        </section>
        <section className="practice-prompt">
          <span className="eyebrow">UNDERSTANDING COMES WITH PRACTICE</span>
          <h2>Try a worked example.</h2>
          <p>
            Original lecture questions, with clear working and source notes wherever an answer needs
            review.
          </p>
          <a className="text-link" href="#/examples">
            Open the example library <ArrowRight size={17} />
          </a>
          <span className="practice-count">
            {examples.filter((e) => e.method).length} calculation problems ·{' '}
            {examples.filter((e) => !e.method).length} illustrations
          </span>
        </section>
      </div>
    </>
  );
}
function Filters({
  lecture,
  onLecture,
  query,
  onQuery,
  placeholder,
}: {
  lecture: number;
  onLecture: (n: number) => void;
  query: string;
  onQuery: (s: string) => void;
  placeholder: string;
}) {
  return (
    <div className="collection-tools">
      <label className="search-field">
        <Search size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </label>
      <div className="lecture-filters" role="group" aria-label="Filter by lecture">
        <SlidersHorizontal size={15} />
        {[0, 1, 2, 3, 4].map((n) => (
          <button
            key={n}
            aria-pressed={lecture === n}
            className={lecture === n ? 'active' : ''}
            onClick={() => onLecture(n)}
          >
            {n ? `Lecture ${n}` : 'All lectures'}
          </button>
        ))}
      </div>
    </div>
  );
}
export function Course({
  initialLecture = 0,
  initialQuery = '',
  progress,
}: {
  initialLecture?: number;
  initialQuery?: string;
  progress: Progress;
}) {
  const [lecture, setLecture] = useState(initialLecture),
    [query, setQuery] = useState(initialQuery);
  const filtered = topics.filter(
    (t) =>
      (!lecture || t.lecture === lecture) &&
      `${t.title} ${t.intro} ${t.short} ${t.formulas.map((f) => f.name + ' ' + f.tex).join(' ')} ${t.notes.join(' ')} ${t.methods.map((m) => methodLabels[m]).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">THE COURSE EXPLORER</span>
        <h1>Find your next “I get it.”</h1>
        <p>Follow the lecture path, or go straight to the concept you need.</p>
      </header>
      <Filters
        lecture={lecture}
        onLecture={setLecture}
        query={query}
        onQuery={setQuery}
        placeholder="Search topics, concepts, or formulas…"
      />
      <div className="results-count">
        {filtered.length} topics <span>across {lecture ? 'this lecture' : 'four lectures'}</span>
      </div>
      {lectures
        .filter((l) => !lecture || l.n === lecture)
        .map((l) => {
          const ts = filtered.filter((t) => t.lecture === l.n);
          return (
            ts.length > 0 && (
              <section className="course-section" key={l.n}>
                <div className="lecture-section-heading">
                  <span className="lecture-number">0{l.n}</span>
                  <div>
                    <span className="eyebrow">LECTURE {l.n}</span>
                    <h2>{l.title}</h2>
                  </div>
                  <SourceLink lecture={l.n} />
                </div>
                <div className="topic-list">
                  {ts.map((t, i) => (
                    <a key={t.id} href={`#/topic/${t.id}`}>
                      <span className="topic-order">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{t.title}</h3>
                        <p>{t.short}</p>
                      </div>
                      <span className="topic-meta">
                        {progress.studied.includes(t.id) ? (
                          <span className="studied-label">
                            <CheckCircle2 size={14} /> Studied
                          </span>
                        ) : t.methods.length ? (
                          <span>
                            <Calculator size={14} /> Interactive
                          </span>
                        ) : (
                          <span>
                            <BookOpen size={14} /> Concept
                          </span>
                        )}
                        <small>pp. {t.pages}</small>
                      </span>
                      <ArrowUpRight size={18} />
                    </a>
                  ))}
                </div>
              </section>
            )
          );
        })}
      {!filtered.length && (
        <Empty
          onReset={() => {
            setQuery('');
            setLecture(0);
          }}
        />
      )}
      <aside className="scope-note">
        <BookOpen size={20} />
        <div>
          <strong>What about the rest of the course?</strong>
          <p>
            The outline on Lecture 1, page 2 also lists {outlineOnly.join(', ')}. Their teaching
            material is not in these four PDFs. They await additional lecture sources.
          </p>
        </div>
      </aside>
    </>
  );
}
export function Examples({ initialLecture = 0 }: { initialLecture?: number }) {
  const [lecture, setLecture] = useState(initialLecture),
    [query, setQuery] = useState(''),
    [reviewOnly, setReviewOnly] = useState(false);
  const filtered = examples.filter(
    (e) =>
      (!lecture || e.lecture === lecture) &&
      (!reviewOnly || e.review) &&
      `${e.title} ${e.question} ${topicById(e.topic)?.title} ${e.sourceAnswer}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">THE WORKED-EXAMPLE LIBRARY</span>
        <h1>Every problem has a path.</h1>
        <p>
          Your lecture questions, the original given values, and the working that connects them.
        </p>
      </header>
      <Filters
        lecture={lecture}
        onLecture={setLecture}
        query={query}
        onQuery={setQuery}
        placeholder="Search examples, subjects, or given values…"
      />
      <div className="section-heading results-count">
        <span>{filtered.length} example parts & illustrations</span>
        <label className="check-field compact-check">
          <input
            type="checkbox"
            checked={reviewOnly}
            onChange={(e) => setReviewOnly(e.target.checked)}
          />{' '}
          With source notes
        </label>
      </div>
      <div className="example-library">
        {filtered.map((e) => (
          <article key={e.id}>
            <div className="example-index">
              <span>0{e.lecture}</span>
              <small>p. {e.page}</small>
            </div>
            <div className="example-content">
              <div className="eyebrow">
                {topicById(e.topic)?.title}
                {e.part ? ` / PART ${e.part.toUpperCase()}` : ''}
              </div>
              <h2>
                <a href={e.method ? `#/topic/${e.topic}?example=${e.id}` : `#/topic/${e.topic}`}>
                  {e.title}
                </a>
              </h2>
              <p>{e.question}</p>
              <div className="example-tags">
                {e.exercise && <span>Practice exercise</span>}
                {!e.method && <span>Source illustration</span>}
                {e.review && (
                  <span className="review-tag">
                    <AlertTriangle size={12} /> Source note
                  </span>
                )}
                <SourceLink lecture={e.lecture} page={e.page} />
              </div>
            </div>
            <a
              className="example-open"
              aria-label={`${e.method ? 'Work through' : 'Read'} ${e.title}${e.part ? ` part ${e.part}` : ''}`}
              href={e.method ? `#/topic/${e.topic}?example=${e.id}` : `#/topic/${e.topic}`}
            >
              <ArrowUpRight size={22} />
            </a>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          onReset={() => {
            setQuery('');
            setLecture(0);
            setReviewOnly(false);
          }}
        />
      )}
    </>
  );
}
export function Formulas() {
  const [query, setQuery] = useState(''),
    [lecture, setLecture] = useState(0);
  const entries = topics
    .flatMap((t) => t.formulas.map((f) => ({ topic: t, formula: f })))
    .filter(
      ({ topic, formula }) =>
        (!lecture || topic.lecture === lecture) &&
        `${topic.title} ${formula.name} ${formula.tex}`.toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">YOUR FORMULA NOTEBOOK</span>
        <h1>The right formula. In context.</h1>
        <p>A reference you can understand, with direct links to the method and its conditions.</p>
      </header>
      <Filters
        lecture={lecture}
        onLecture={setLecture}
        query={query}
        onQuery={setQuery}
        placeholder="Search formulas or statistical methods…"
      />
      <div className="results-count">{entries.length} formulas & identities</div>
      <div className="formula-library">
        {entries.map(({ topic, formula }) => (
          <article key={`${topic.id}-${formula.name}`}>
            <div>
              <span className="eyebrow">
                LECTURE {topic.lecture} · PP. {topic.pages}
              </span>
              <h2>{formula.name}</h2>
              <a href={`#/topic/${topic.id}`} className="text-link">
                {topic.title}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <MathText tex={formula.tex} block />
          </article>
        ))}
      </div>
      {!entries.length && (
        <Empty
          onReset={() => {
            setQuery('');
            setLecture(0);
          }}
        />
      )}
    </>
  );
}
function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state">
      <Search size={30} />
      <h2>No matching ideas yet.</h2>
      <p>Try a broader phrase, another lecture, or a formula name.</p>
      <button className="button secondary" onClick={onReset}>
        Reset search & filters
      </button>
    </div>
  );
}
export function About() {
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">ABOUT THE PROJECT</span>
        <h1>
          Designed for the moment
          <br />
          an idea becomes clear.
        </h1>
        <p>CyberStat · Probability & Statistics Interactive Learning Platform</p>
      </header>
      <section className="credits-panel">
        <div className="credits-mark">
          C<span>∿</span>
        </div>
        <div>
          <span className="eyebrow">DEVELOPED BY</span>
          <h2>Ahmed Waleed Gad</h2>
          <p>
            Under the Supervision of: <strong>Dr. Mohamed Ibrahim</strong>
          </p>
          <hr />
          <p>
            Faculty of Artificial Intelligence and Informatics
            <br />
            Intelligent Cyber-Security Program
            <br />
            Horus University – Egypt
          </p>
        </div>
      </section>
      <div className="about-columns">
        <section>
          <h2>A companion to your lectures.</h2>
          <p>
            Four supplied lectures are the primary academic source. Every topic and example links to
            the original PDF page. Source answers are preserved, and numerical or notation
            discrepancies are identified alongside full-precision calculations.
          </p>
          <p>
            The PDFs credit Mohamed Ebrahim Sobh / Dr. Mohamed E. Sobh as their author. Project
            supervision is credited above exactly as requested; these are distinct roles.
          </p>
          <h3>Course context · Lecture 1, pp. 2–4</h3>
          <p>
            Assessment: coursework 10 marks, project 20, midterm 20, final 50; total 100. Learning
            methods: lectures, tutorial, self-learning, projects and discussion.
          </p>
          <p>
            The outline also names {outlineOnly.join(', ')}. Those topics await further source
            material and are not represented as implemented.
          </p>
        </section>
        <section>
          <h2>Your work stays with you.</h2>
          <p>
            Calculations run locally. Topic progress, recent history, inputs and solution
            preferences are stored in this browser on this device. There is no account, server
            database or cloud synchronization.
          </p>
          <p>
            After the app confirms it is ready offline, its interface, calculations, mathematics,
            charts and all four lecture PDFs are cached. External websites and links outside
            CyberStat still need internet.
          </p>
          <p>
            Export uses your browser’s print dialog. Select <strong>Save as PDF</strong> to create a
            document with the current solution mode, chart, source reference and project credits.
          </p>
          <p>
            Installing CyberStat depends on your browser’s PWA support. Use “Install app” for
            browser-specific guidance.
          </p>
        </section>
      </div>
      <section className="source-collection">
        <div className="section-heading">
          <h2>The original lecture material.</h2>
          <span className="small muted">70 pages · bundled for offline access</span>
        </div>
        {lectures.map((l) => (
          <div key={l.n}>
            <span className="lecture-number">0{l.n}</span>
            <div>
              <h3>{l.title}</h3>
              <p>{l.pages} pages</p>
            </div>
            <SourceLink lecture={l.n} label="Open original PDF" />
          </div>
        ))}
      </section>
      <section className="review-register">
        <span className="eyebrow">ACADEMIC TRANSPARENCY</span>
        <h2>Source review register.</h2>
        <p className="muted">
          These notes identify discrepancies and rounding differences without changing the supplied
          documents. Exercise results are app-derived, and assumptions remain explicit.
        </p>
        {examples
          .filter((e) => e.review)
          .map((e) => (
            <details key={e.id}>
              <summary>
                <span>
                  {e.title}
                  {e.part ? ` · ${e.part}` : ''}
                </span>
                <span className="small muted">
                  L{e.lecture} · p{e.page}
                </span>
              </summary>
              <p>
                <strong>Source states:</strong> {e.sourceAnswer}
              </p>
              <p>{e.review}</p>
              <SourceLink lecture={e.lecture} page={e.page} />
            </details>
          ))}
        {topics
          .filter((t) => t.review)
          .map((t) => (
            <details key={t.id}>
              <summary>{t.title} · concept note</summary>
              <p>{t.review}</p>
              <a className="text-link" href={`#/topic/${t.id}`}>
                Open topic <ExternalLink size={14} />
              </a>
            </details>
          ))}
      </section>
    </>
  );
}
