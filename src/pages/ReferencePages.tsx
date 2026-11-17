import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { topics, topicById } from '../content/topics';
import { examples } from '../content/examples';
import { MathText } from '../components/Math';
import { SourceLink } from '../components/SourceLink';
export const problemUrl = (topic: string, method?: string, example?: string) =>
  `#/solver?formula=${method ?? (topic === 'z-score' ? 'z-score' : topicById(topic)?.methods[0]) ?? 'arithmetic-mean'}${example ? `&example=${example}` : ''}`;
function Filters({
  source,
  onSource,
  query,
  onQuery,
  placeholder,
}: {
  source: number;
  onSource: (n: number) => void;
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
      <div className="source-filters" role="group" aria-label="Filter by source">
        <SlidersHorizontal size={15} />
        {[0, 1, 2, 3, 4].map((n) => (
          <button
            key={n}
            aria-pressed={source === n}
            className={source === n ? 'active' : ''}
            onClick={() => onSource(n)}
          >
            {n ? `Source ${n}` : 'All sources'}
          </button>
        ))}
      </div>
    </div>
  );
}
export function Examples({ initialSource = 0 }: { initialSource?: number }) {
  const [source, setSource] = useState(initialSource),
    [query, setQuery] = useState(''),
    [reviewOnly, setReviewOnly] = useState(false);
  const filtered = examples.filter(
    (e) =>
      (!source || e.lecture === source) &&
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
        <p>Statistical problems, original given values, and the working that connects them.</p>
      </header>
      <Filters
        source={source}
        onSource={setSource}
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
                <a href={problemUrl(e.topic, e.method, e.id)}>{e.title}</a>
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
              href={problemUrl(e.topic, e.method, e.id)}
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
            setSource(0);
            setReviewOnly(false);
          }}
        />
      )}
    </>
  );
}
export function Formulas({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery),
    [source, setSource] = useState(0);
  const entries = topics
    .flatMap((t) => t.formulas.map((f) => ({ topic: t, formula: f })))
    .filter(
      ({ topic, formula }) =>
        (!source || topic.lecture === source) &&
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
        source={source}
        onSource={setSource}
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
                SOURCE {topic.lecture} · PP. {topic.pages}
              </span>
              <h2>{formula.name}</h2>
              <a href={problemUrl(topic.id)} className="text-link">
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
            setSource(0);
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
      <p>Try a broader phrase, another source, or a formula name.</p>
      <button className="button secondary" onClick={onReset}>
        Reset search & filters
      </button>
    </div>
  );
}
