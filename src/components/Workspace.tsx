import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  RotateCcw,
  Printer,
  Check,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import type { Example, Method, Topic, Values, Solution } from '../types';
import { calculate, ValidationError } from '../math/engine';
import {
  defaults,
  methodFields,
  methodLabels,
  normalityMethods,
  probabilityMethods,
} from '../content/methods';
import { examples } from '../content/examples';
import { MathText } from './Math';
import { DistributionChart, IntervalChart } from './Chart';
import { readStored, writeStored } from '../lib/storage';
export const sourceUrl = (lecture: number, page?: number) =>
  `${import.meta.env.BASE_URL}lectures/lecture-${lecture}.pdf${page ? `#page=${page}` : ''}`;
export function SourceLink({
  lecture,
  page,
  label,
}: {
  lecture: number;
  page?: number;
  label?: string;
}) {
  return (
    <a className="source-link" href={sourceUrl(lecture, page)} target="_blank" rel="noreferrer">
      <BookOpen size={13} />
      {label ?? `Lecture ${lecture}${page ? ` · p. ${page}` : ''}`}
      <span className="sr-only"> (opens PDF in a new tab)</span>
    </a>
  );
}
export function Workspace({ topic, example }: { topic: Topic; example?: Example }) {
  const initial = example?.method ?? topic.methods[0];
  const [method, setMethod] = useState<Method>(initial);
  const [values, setValues] = useState<Values>(() =>
    example?.method
      ? { ...defaults(initial, topic.id), ...example.values }
      : readStored(`draft:${topic.id}:${initial}`, defaults(initial, topic.id)),
  );
  const [result, setResult] = useState<Solution | null>(null);
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const [mode, setMode] = useState<'quick' | 'detailed'>(() =>
    readStored('solution-mode', 'quick'),
  );
  const [dirty, setDirty] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [exportHint, setExportHint] = useState(false);
  function run(m: Method, inputs: Values) {
    try {
      setResult(calculate(m, inputs));
      setError(null);
      setDirty(false);
    } catch (e) {
      setResult(null);
      setError({
        field: e instanceof ValidationError ? e.field : 'result',
        message: e instanceof Error ? e.message : 'Unable to calculate.',
      });
    }
  }
  useEffect(() => {
    const m = example?.method ?? topic.methods[0];
    const vals = example?.method
      ? { ...defaults(m, topic.id), ...example.values }
      : readStored(`draft:${topic.id}:${m}`, defaults(m, topic.id));
    setMethod(m);
    setValues(vals);
    run(m, vals);
    setExportHint(false);
  }, [topic.id, example?.id]);
  function update(key: string, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    setDirty(true);
    setError(null);
    setStorageFailed(!writeStored(`draft:${topic.id}:${method}`, next));
  }
  function choose(m: Method) {
    setMethod(m);
    const next = readStored(`draft:${topic.id}:${m}`, defaults(m, topic.id));
    setValues(next);
    run(m, next);
  }
  const available = examples.filter((e) => e.topic === topic.id && e.method);
  const sourceUnchanged =
    example?.method === method && Object.entries(example.values).every(([k, v]) => values[k] === v);
  const showProbability = probabilityMethods.includes(method),
    showTail = showProbability || method === 'inverse';
  return (
    <section className="workspace" aria-label="Interactive calculation workspace">
      <div className="section-heading workspace-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Make the concept click.</h2>
        </div>
        <span className="local-label">
          <span /> Calculated on your device
        </span>
      </div>
      {topic.methods.length > 1 && (
        <label className="method-select">
          Statistical method
          <select value={method} onChange={(e) => choose(e.target.value as Method)}>
            {topic.methods.map((m) => (
              <option key={m} value={m}>
                {methodLabels[m]}
              </option>
            ))}
          </select>
        </label>
      )}
      {example && (
        <div className={`problem-panel ${example.review ? 'has-review' : ''}`}>
          <div className="section-heading">
            <span className="eyebrow">
              {example.exercise ? 'LECTURE EXERCISE · APP-DERIVED SOLUTION' : 'FROM THE LECTURE'}
              {example.part ? ` · PART ${example.part.toUpperCase()}` : ''}
            </span>
            <SourceLink lecture={example.lecture} page={example.page} />
          </div>
          <h3>{example.title}</h3>
          <p>{example.question}</p>
          {example.symbolic && (
            <p className="small">
              The inputs below use the equivalent standard-normal bounds after μ and σ cancel. No
              numerical σ was supplied.
            </p>
          )}
        </div>
      )}
      <div className="workspace-columns">
        <form
          className="input-panel"
          onSubmit={(e) => {
            e.preventDefault();
            run(method, values);
          }}
          noValidate
        >
          <div className="section-heading">
            <h3>Given information</h3>
            <span className="small muted">{methodLabels[method]}</span>
          </div>
          {available.length > 0 && (
            <label className="example-select">
              Try a lecture example
              <select
                aria-label="Load lecture example"
                value={example?.id ?? ''}
                onChange={(e) => {
                  if (e.target.value)
                    location.hash = `/topic/${topic.id}?example=${e.target.value}`;
                }}
              >
                <option value="">Choose an example…</option>
                {available.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                    {e.part ? ` · ${e.part}` : ''} · p{e.page}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="field-grid">
            {methodFields[method].map((field) => (
              <label className="field" key={field.key} htmlFor={`field-${field.key}`}>
                <span>{field.label}</span>
                <input
                  id={`field-${field.key}`}
                  aria-label={field.label}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={values[field.key] ?? ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  aria-invalid={error?.field === field.key}
                  aria-describedby={
                    error?.field === field.key
                      ? 'calculation-error'
                      : field.hint
                        ? `hint-${field.key}`
                        : undefined
                  }
                />
                {field.hint && <small id={`hint-${field.key}`}>{field.hint}</small>}
              </label>
            ))}
          </div>
          {showTail && (
            <fieldset className="region-field">
              <legend>Probability region</legend>
              <div className="segmented">
                {[
                  ['left', 'Below'],
                  ['right', 'Above'],
                  ...(method === 'inverse' ? [] : [['between', 'Between']]),
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={values.tail === key}
                    className={values.tail === key ? 'active' : ''}
                    onClick={() => update('tail', key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {showProbability && (
            <div className="field-grid">
              <label className="field" htmlFor="bound-a">
                <span>{values.tail === 'between' ? 'Lower bound · a' : 'Observed bound · a'}</span>
                <input
                  id="bound-a"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={values.a}
                  onChange={(e) => update('a', e.target.value)}
                  aria-invalid={error?.field === 'a'}
                />
              </label>
              {values.tail === 'between' && (
                <label className="field" htmlFor="bound-b">
                  <span>Upper bound · b</span>
                  <input
                    id="bound-b"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={values.b}
                    onChange={(e) => update('b', e.target.value)}
                    aria-invalid={error?.field === 'b'}
                  />
                </label>
              )}
            </div>
          )}
          {method === 'normal' && (
            <label className="field">
              <span>Expected count · optional total</span>
              <input
                type="number"
                step="1"
                min="1"
                value={values.count ?? ''}
                onChange={(e) => update('count', e.target.value)}
                placeholder="Leave blank for probability only"
              />
            </label>
          )}
          {(normalityMethods.includes(method) || method === 'inverse') && (
            <label className="check-field">
              <input
                type="checkbox"
                checked={values.normal === 'true'}
                onChange={(e) => update('normal', String(e.target.checked))}
              />
              <span>
                The population is approximately normal.
                <small>
                  {['mean-known', 'ci-known', 'size-known'].includes(method)
                    ? 'Required when the sample size is below 30.'
                    : 'Required by the selected lecture method.'}
                </small>
              </span>
            </label>
          )}
          {method.startsWith('size-') && (
            <label className="check-field">
              <input
                type="checkbox"
                checked={values.strict === 'true'}
                onChange={(e) => update('strict', String(e.target.checked))}
              />
              <span>Error must be strictly less than the target.</span>
            </label>
          )}
          {error && (
            <div className="field-error" id="calculation-error" role="alert">
              <AlertTriangle size={17} />
              {error.message}
            </div>
          )}
          {storageFailed && (
            <p className="field-error" role="status">
              Browser storage is unavailable. Your current inputs work in this tab but cannot be
              saved.
            </p>
          )}
          <div className="form-actions">
            <button className="button primary" type="submit">
              <Calculator size={17} /> Calculate
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                const next = defaults(method, topic.id);
                setValues(next);
                writeStored(`draft:${topic.id}:${method}`, next);
                run(method, next);
              }}
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          <p className="small muted">Full precision inside. Rounded values for reading.</p>
        </form>
        <div className="result-panel" aria-live="polite">
          <div className="section-heading">
            <h3>Your solution</h3>
            <div className="solution-toggle" role="group" aria-label="Solution presentation">
              {(['quick', 'detailed'] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => {
                    setMode(m);
                    writeStored('solution-mode', m);
                  }}
                >
                  {m === 'quick' ? 'Quick Solution' : 'Detailed Step-by-Step'}
                </button>
              ))}
            </div>
          </div>
          {dirty && (
            <p className="input-notice" role="status">
              Inputs changed. Calculate to update the solution and chart.
            </p>
          )}
          {result && !error ? (
            <div className={dirty ? 'stale-solution' : ''}>
              <div className="result-answer">
                <span className="eyebrow">{result.title}</span>
                <MathText tex={result.answerTex} block />
                <p>{result.interpretation}</p>
              </div>
              <div className="metric-row">
                {result.metrics
                  .filter((m) => m.label !== 'Probability' && m.label !== 'Percentage')
                  .map((m) => (
                    <div key={m.label}>
                      <span>{m.label}</span>
                      <strong>{m.value}</strong>
                    </div>
                  ))}
              </div>
              <div className="solution-working">
                <div className="solution-given">
                  <span className="step-label">GIVEN</span>
                  <p>{result.given}</p>
                </div>
                {mode === 'detailed' && (
                  <div className="solution-given">
                    <span className="step-label">SYMBOLS & VARIABLES</span>
                    <p>{topic.symbols}</p>
                  </div>
                )}
                <div>
                  <span className="step-label">FORMULA</span>
                  <MathText tex={result.formula} block />
                </div>
                <ol className="solution-steps">
                  {(mode === 'detailed'
                    ? result.steps
                    : result.steps.filter(
                        (_, i) =>
                          i === result.steps.length - 1 ||
                          i === result.steps.length - 2 ||
                          i === Math.max(0, result.steps.length - 3),
                      )
                  ).map((s, i) => (
                    <li key={`${method}-${s.title}`}>
                      <span className="step-index">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>{s.title}</h4>
                        {mode === 'detailed' && <p>{s.text}</p>}
                        {s.tex && <MathText tex={s.tex} block />}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              {result.curve && (
                <div className="visualization">
                  <span className="eyebrow">SEE THE PROBABILITY</span>
                  <DistributionChart curve={result.curve} />
                </div>
              )}
              {result.interval && (
                <div className="visualization">
                  <span className="eyebrow">READ THE INTERVAL</span>
                  <IntervalChart interval={result.interval} />
                </div>
              )}
              {result.notes.length > 0 && (
                <details className="method-notes">
                  <summary>Method & assumptions</summary>
                  {result.notes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </details>
              )}
              {example && (
                <div className={`source-answer ${example.review ? 'review-note' : ''}`}>
                  <strong>
                    {example.review ? <AlertTriangle size={16} /> : <Check size={16} />}{' '}
                    {example.exercise
                      ? 'Source exercise'
                      : example.review
                        ? 'Source review note'
                        : 'Lecture comparison'}
                  </strong>
                  <p>
                    <b>Source states:</b> {example.sourceAnswer}
                  </p>
                  {example.review && <p>{example.review}</p>}
                  {!sourceUnchanged && (
                    <p className="small">
                      The inputs differ from the original example. The source answer above applies
                      to its original given values.
                    </p>
                  )}
                  <SourceLink lecture={example.lecture} page={example.page} />
                </div>
              )}
              <div className="export-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={dirty}
                  onClick={() => {
                    setExportHint(true);
                    window.setTimeout(() => window.print(), 100);
                  }}
                >
                  <Printer size={16} /> Export solution as PDF
                </button>
                <span className="small muted">
                  {exportHint
                    ? 'Choose “Save as PDF” in the print dialog.'
                    : 'Includes the selected solution mode and chart.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-result">
              <Calculator size={32} />
              <h3>Let’s work through it.</h3>
              <p>Check the given information, then calculate to see your solution.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
