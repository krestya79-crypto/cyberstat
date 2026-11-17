import { useState } from 'react';
import { ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import {
  categories,
  getFormula,
  statisticalFormulas,
  visibleFields,
  formulaDefaults,
  type Category,
} from '../content/statistics';
import { exampleById, examples } from '../content/examples';
import { solveStatistics } from '../math/statisticsEngine';
import { ValidationError } from '../math/engine';
import type { StatisticalSolution } from '../math/statisticsTypes';
import { MathText } from '../components/Math';
import { SourceLink } from '../components/SourceLink';
import { StatisticalSolutionView } from '../components/StatisticalSolutionView';
import { readStored, useStored, writeStored } from '../lib/storage';
import type { Values } from '../types';
import '../statistics.css';

export function StatisticalSolver({
  formulaId,
  exampleId,
}: {
  formulaId?: string;
  exampleId?: string;
}) {
  const example = exampleId ? exampleById(exampleId) : undefined;
  const formula =
    getFormula(example?.method ?? formulaId ?? 'arithmetic-mean') ?? getFormula('arithmetic-mean')!;
  const [values, setValues, storageFailed] = useStored<Values>(
    `statistics:${formula.id}`,
    example
      ? example.method
        ? { ...formulaDefaults(formula.id), ...example.values }
        : Object.fromEntries(
            formula.fields.map((f) => [f.key, f.kind === 'checkbox' ? f.default : '']),
          )
      : formulaDefaults(formula.id),
  );
  // A linked worked example always loads its original inputs; personal drafts apply to custom problems.
  const [inputs, setInputs] = useState<Values>(() =>
    example?.method ? { ...formulaDefaults(formula.id), ...example.values } : values,
  );
  const [result, setResult] = useState<StatisticalSolution | null>(() => {
    if (!example?.method) return null;
    try {
      return solveStatistics(formula.id, { ...formulaDefaults(formula.id), ...example.values });
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<{ field: string; message: string } | null>(null),
    [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>(() =>
    readStored('solution-mode', 'quick'),
  );
  const sourceUnchanged =
    !!example?.method &&
    example.method === formula.id &&
    Object.entries(example.values).every(([k, v]) => inputs[k] === v);
  const relevantExamples = examples.filter((e) => e.method === formula.id);
  function update(key: string, value: string) {
    const next = { ...inputs, [key]: value };
    setInputs(next);
    setValues(next);
    setDirty(true);
    setError(null);
  }
  function changeFormula(id: string) {
    location.hash = `/solver?formula=${id}`;
  }
  function categoryChange(category: Category) {
    changeFormula(statisticalFormulas.find((f) => f.category === category)!.id);
  }
  function solve() {
    try {
      setResult(solveStatistics(formula.id, inputs));
      setError(null);
      setDirty(false);
    } catch (e) {
      setResult(null);
      setError({
        field: e instanceof ValidationError ? e.field : 'result',
        message: e instanceof Error ? e.message : 'Check the supplied values.',
      });
    }
  }
  return (
    <>
      <div className="print-heading">
        <strong>CyberStat</strong>
        <span>Statistical Problem Solver</span>
        <p>{formula.name}</p>
      </div>
      <header className="page-heading">
        <span className="eyebrow">YOUR STATISTICAL WORKSPACE</span>
        <h1>Statistical Solver</h1>
        <p>
          Choose a method, select its formula, enter your data, and solve with clear mathematics and
          a graph.
        </p>
      </header>
      {((formulaId && !getFormula(formulaId)) || (exampleId && !example)) && (
        <p className="review-note" role="alert">
          That formula or example was not found. Choose a formula below.
        </p>
      )}
      <div className="stat-selection">
        <section className="stat-step">
          <div className="stat-step-title">
            <span>01</span>
            <div>
              <span className="eyebrow">SELECT STATISTICAL METHOD</span>
              <h2>What kind of problem?</h2>
            </div>
          </div>
          <label className="field">
            <span>Statistical method</span>
            <select
              aria-label="Statistical method"
              value={formula.category}
              onChange={(e) => categoryChange(e.target.value as Category)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="stat-helper">
            {categories.find((c) => c.id === formula.category)?.description}
          </p>
        </section>
        <section className="stat-step">
          <div className="stat-step-title">
            <span>02</span>
            <div>
              <span className="eyebrow">SELECT THE FORMULA</span>
              <h2>Use the right relationship.</h2>
            </div>
          </div>
          <label className="field">
            <span>Statistical formula</span>
            <select
              aria-label="Statistical formula"
              value={formula.id}
              onChange={(e) => changeFormula(e.target.value)}
            >
              {statisticalFormulas
                .filter((f) => f.category === formula.category)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </label>
          <p className="stat-helper">{formula.use}</p>
        </section>
      </div>
      <section className="stat-formula-overview">
        <div>
          <span className="eyebrow">SELECTED FORMULA</span>
          <MathText tex={formula.tex} block />
          <p>{formula.variables}</p>
        </div>
        <details>
          <summary>When to use it · conditions & assumptions</summary>
          <ul>
            {formula.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>
            <strong>Required result:</strong> {formula.required}
          </p>
        </details>
      </section>
      {example && (
        <section className="problem-panel">
          <div className="section-heading">
            <span className="eyebrow">
              {example.exercise ? 'WORKED EXERCISE' : 'ORIGINAL WORKED EXAMPLE'}
              {example.part ? ` · PART ${example.part.toUpperCase()}` : ''}
            </span>
            <SourceLink lecture={example.lecture} page={example.page} />
          </div>
          <h3>{example.title}</h3>
          <p>{example.question}</p>
          {example.symbolic && (
            <p>
              The inputs use the equivalent standardized bounds after the unspecified population
              spread cancels.
            </p>
          )}
          {!example.method && (
            <div className="source-answer">
              <strong>Preserved source illustration</strong>
              <p>{example.sourceAnswer}</p>
              <p>
                {example.review} No numerical data or confidence procedure is inferred. Enter your
                own data below to apply the selected formula.
              </p>
            </div>
          )}
        </section>
      )}
      <div className="workspace-columns stat-workspace">
        <form
          className="input-panel stat-input"
          onSubmit={(e) => {
            e.preventDefault();
            solve();
          }}
          noValidate
        >
          <div className="stat-step-title">
            <span>03</span>
            <div>
              <span className="eyebrow">ENTER PROBLEM DATA</span>
              <h2>Given information.</h2>
            </div>
          </div>
          {relevantExamples.length > 0 && (
            <label className="example-select">
              Load an existing worked example
              <select
                aria-label="Load worked example"
                value={example?.id ?? ''}
                onChange={(e) => {
                  if (e.target.value)
                    location.hash = `/solver?formula=${formula.id}&example=${e.target.value}`;
                }}
              >
                <option value="">Choose an example…</option>
                {relevantExamples.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                    {e.part ? ` · ${e.part}` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="field-grid">
            {visibleFields(formula, inputs).map((field) =>
              field.kind === 'checkbox' ? (
                <label key={field.key} className="check-field">
                  <input
                    type="checkbox"
                    checked={inputs[field.key] === 'true'}
                    onChange={(e) => update(field.key, String(e.target.checked))}
                    aria-label={field.label}
                  />
                  <span>{field.label}</span>
                </label>
              ) : (
                <label
                  key={field.key}
                  className={`field ${field.kind === 'dataset' ? 'data-field' : ''}`}
                >
                  <span>{field.label}</span>
                  {field.kind === 'dataset' ? (
                    <textarea
                      aria-label={field.label}
                      value={inputs[field.key] ?? ''}
                      onChange={(e) => update(field.key, e.target.value)}
                      aria-invalid={error?.field === field.key}
                      aria-describedby={field.hint ? `hint-${field.key}` : undefined}
                      spellCheck={false}
                    />
                  ) : field.kind === 'select' ? (
                    <select
                      aria-label={field.label}
                      value={inputs[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      aria-label={field.label}
                      value={inputs[field.key] ?? ''}
                      onChange={(e) => update(field.key, e.target.value)}
                      aria-invalid={error?.field === field.key}
                      aria-describedby={field.hint ? `hint-${field.key}` : undefined}
                    />
                  )}{' '}
                  {field.hint && <small id={`hint-${field.key}`}>{field.hint}</small>}
                </label>
              ),
            )}
          </div>
          {error && (
            <div className="field-error" id="statistical-error" role="alert">
              {error.message}
            </div>
          )}
          {storageFailed && (
            <p className="field-error" role="status">
              Inputs work in this session, but browser storage is unavailable.
            </p>
          )}
          <div className="form-actions">
            <button type="submit" className="button primary">
              <Calculator size={17} /> Solve problem
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                const next = formulaDefaults(formula.id);
                setInputs(next);
                setValues(next);
                setResult(null);
                setError(null);
                setDirty(false);
              }}
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          <p className="small muted">
            All calculations and graphs run on this device. Sample input values are editable.
          </p>
        </form>
        <section
          className="result-panel stat-result"
          aria-label="Statistical solution"
          aria-live="polite"
        >
          <div className="stat-step-title">
            <span>04</span>
            <div>
              <span className="eyebrow">SOLVE THE PROBLEM</span>
              <h2>Your mathematical solution.</h2>
            </div>
          </div>
          <div className="solution-toggle" role="group" aria-label="Solution presentation">
            {(['quick', 'detailed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? 'active' : ''}
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                  writeStored('solution-mode', m);
                }}
              >
                {m === 'quick' ? 'Quick Solution' : 'Detailed Step-by-Step'}
              </button>
            ))}
          </div>
          {dirty && result && (
            <p className="input-notice" role="status">
              Data changed. Solve again to update the answer and graph.
            </p>
          )}
          {result && !error ? (
            <StatisticalSolutionView
              result={result}
              formula={formula}
              mode={mode}
              dirty={dirty}
              example={example}
              sourceUnchanged={sourceUnchanged}
            />
          ) : (
            <div className="empty-result">
              <Calculator size={32} />
              <h3>Ready when your data is.</h3>
              <p>
                Check the formula and assumptions, enter your values, then choose Solve problem.
                Your graph will be generated from the calculated result.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
