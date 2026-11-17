import { ArrowLeft, CheckCircle2, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { topicById } from '../content/topics';
import { examples, exampleById } from '../content/examples';
import { MathText } from '../components/Math';
import { Workspace, SourceLink } from '../components/Workspace';
import type { Progress } from '../lib/storage';
export function TopicPage({
  id,
  exampleId,
  progress,
  onStudy,
}: {
  id: string;
  exampleId?: string;
  progress: Progress;
  onStudy: (id: string) => void;
}) {
  const topic = topicById(id);
  if (!topic)
    return (
      <section className="empty-state">
        <h1>Topic not found</h1>
        <a href="#/course" className="button primary">
          Open the course explorer
        </a>
      </section>
    );
  const found = exampleId ? exampleById(exampleId) : undefined;
  const example = found?.topic === topic.id ? found : undefined;
  const studied = progress.studied.includes(id);
  const topicExamples = examples.filter((e) => e.topic === id);
  return (
    <>
      <div className="print-heading">
        <strong>CyberStat</strong>
        <span>Probability & Statistics · Ahmed Waleed Gad</span>
        <p>
          {topic.title} · Lecture {topic.lecture}, pp. {topic.pages}
        </p>
      </div>
      <div className="topic-top">
        <a className="text-link" href="#/course">
          <ArrowLeft size={15} /> Course explorer
        </a>
        <button
          className={`button ${studied ? 'studied' : 'secondary'}`}
          onClick={() => onStudy(id)}
          aria-pressed={studied}
        >
          <CheckCircle2 size={17} />
          {studied ? 'Marked as studied' : 'Mark as studied'}
        </button>
      </div>
      <header className="page-heading topic-heading">
        <div className="eyebrow">
          LECTURE {topic.lecture} <span> / </span> PAGES {topic.pages}
        </div>
        <h1>{topic.title}</h1>
        <p>{topic.intro}</p>
      </header>
      <div className="topic-theory">
        <section className="concept-panel">
          <span className="eyebrow">THE IDEA</span>
          {topic.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
          <SourceLink lecture={topic.lecture} page={Number.parseInt(topic.pages)} />
          {topic.assignment && (
            <details>
              <summary>Lecture assignment · derive the method</summary>
              <p>{topic.assignment}</p>
            </details>
          )}
        </section>
        <aside className="formula-panel">
          <span className="eyebrow">KEEP THIS IN MIND</span>
          {topic.formulas.map((f) => (
            <div key={f.name}>
              <h3>{f.name}</h3>
              <MathText tex={f.tex} block />
            </div>
          ))}
          <p className="symbol-key">{topic.symbols}</p>
        </aside>
      </div>
      <details className="conditions" open>
        <summary>Before you use this method</summary>
        <ul>
          {topic.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
      {topic.review && (
        <details className="review-note topic-review">
          <summary>
            <AlertTriangle size={16} /> A note about the source material
          </summary>
          <p>{topic.review}</p>
        </details>
      )}
      {exampleId && !example && (
        <p className="review-note" role="alert">
          The requested example does not belong to this topic. Choose one from the library.
        </p>
      )}
      {topic.methods.length > 0 && (
        <Workspace key={`${id}:${example?.id ?? ''}`} topic={topic} example={example} />
      )}
      {topicExamples.length > 0 && (
        <section className="topic-examples">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PUT IT INTO PRACTICE</span>
              <h2>From your lecture notes.</h2>
            </div>
            <a className="text-link" href={`#/examples?lecture=${topic.lecture}`}>
              All examples <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="example-mini-list">
            {topicExamples.map((e) => (
              <a
                key={e.id}
                href={
                  e.method ? `#/topic/${e.topic}?example=${e.id}` : sourceFor(e.lecture, e.page)
                }
                target={e.method ? undefined : '_blank'}
                rel={e.method ? undefined : 'noreferrer'}
              >
                <span>
                  {e.title}
                  {e.part ? ` · ${e.part}` : ''}
                  <small>
                    {e.method
                      ? `Lecture ${e.lecture} · page ${e.page}`
                      : 'Source illustration · opens original PDF'}
                  </small>
                </span>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        </section>
      )}
      <section className="related-topics">
        <span className="eyebrow">CONNECT THE IDEAS</span>
        <h2>Continue exploring.</h2>
        <div>
          {topic.related.map((id) => {
            const t = topicById(id);
            return (
              t && (
                <a className="related-link" key={id} href={`#/topic/${id}`}>
                  <span>
                    {t.title}
                    <small>{t.short}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              )
            );
          })}
        </div>
      </section>
      <footer className="print-footer">
        CyberStat · Developed by Ahmed Waleed Gad · Under the Supervision of Dr. Mohamed Ibrahim ·
        Horus University – Egypt
      </footer>
    </>
  );
}
function sourceFor(lecture: number, page: number) {
  return `${import.meta.env.BASE_URL}lectures/lecture-${lecture}.pdf#page=${page}`;
}
