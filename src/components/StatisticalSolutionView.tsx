import { Printer } from 'lucide-react';
import { MathText } from './Math';
import { DistributionChart, IntervalChart } from './Chart';
import { StatisticalPlots } from './StatisticalPlots';
import { SourceLink } from './SourceLink';
import type { StatisticalSolution } from '../math/statisticsTypes';
import type { StatisticalFormula } from '../content/statistics';
import type { Example } from '../types';
import { categories } from '../content/statistics';
import { project } from '../content/project';
export function StatisticalSolutionView({
  result,
  formula,
  mode,
  dirty,
  example,
  sourceUnchanged,
}: {
  result: StatisticalSolution;
  formula: StatisticalFormula;
  mode: 'quick' | 'detailed';
  dirty: boolean;
  example?: Example;
  sourceUnchanged: boolean;
}) {
  return (
    <div className={dirty ? 'stale-solution' : ''}>
      <div className="result-answer">
        <span className="eyebrow">{result.title}</span>
        <MathText tex={result.answerTex} block />
        <p>{result.interpretation}</p>
      </div>
      <div className="metric-row">
        {result.metrics
          .filter((m) => !['Probability', 'Percentage'].includes(m.label))
          .map((m) => (
            <div key={m.label}>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
            </div>
          ))}
      </div>
      <div className="solution-working">
        <div className="solution-given">
          <span className="step-label">GIVEN INFORMATION</span>
          <p>{result.given}</p>
        </div>
        {mode === 'detailed' && (
          <>
            <div className="solution-given">
              <span className="step-label">REQUIRED INFORMATION</span>
              <p>{formula.required}</p>
            </div>
            <div className="solution-given">
              <span className="step-label">SELECTED METHOD</span>
              <p>
                {categories.find((c) => c.id === formula.category)?.name} · {formula.name}
              </p>
            </div>
            <div className="solution-given">
              <span className="step-label">VARIABLES & PARAMETERS</span>
              <p>{formula.variables}</p>
            </div>
          </>
        )}
        <div>
          <span className="step-label">SELECTED FORMULA</span>
          <MathText tex={result.formula} block />
        </div>
        <ol className="solution-steps">
          {(mode === 'detailed'
            ? result.steps
            : result.steps.filter((_, i) => i >= Math.max(0, result.steps.length - 3))
          ).map((s, i) => (
            <li key={`${i}-${s.title}`}>
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
      <section className="visualization" aria-label="Solution visualization">
        <span className="eyebrow">GRAPHICAL SOLUTION</span>
        {result.plot ? (
          <StatisticalPlots plot={result.plot} />
        ) : result.curve ? (
          <DistributionChart curve={result.curve} />
        ) : result.interval ? (
          <IntervalChart interval={result.interval} />
        ) : (
          <p className="graph-not-applicable">
            {result.graphReason ??
              'No distribution or data set is specified for a meaningful plot of this scalar result.'}
          </p>
        )}
      </section>
      {mode === 'detailed' && (
        <section className="solution-assumptions">
          <h4>Assumptions and conclusions</h4>
          <ul>
            {formula.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {result.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
          <p>{result.interpretation}</p>
        </section>
      )}
      {example && (
        <aside className={`source-answer ${example.review ? 'review-note' : ''}`}>
          <strong>
            {example.exercise
              ? 'Original exercise · calculated solution'
              : example.review
                ? 'Source review note'
                : 'Original example comparison'}
          </strong>
          <p>
            <b>Source states:</b> {example.sourceAnswer}
          </p>
          {example.review && <p>{example.review}</p>}
          {!sourceUnchanged && (
            <p>
              The current inputs differ from the original example. Its stated answer applies only to
              its original values.
            </p>
          )}
          <SourceLink lecture={example.lecture} page={example.page} />
        </aside>
      )}
      <div className="export-actions">
        <button
          type="button"
          className="button secondary"
          disabled={dirty}
          onClick={() => window.print()}
        >
          <Printer size={16} /> Export solution as PDF
        </button>
        <span className="small muted">
          Choose Save as PDF in the browser print dialog. The selected solution mode and graph are
          included.
        </span>
      </div>
      <footer className="print-footer">
        CyberStat · {project.student} · {project.university} · {project.doctor} · {project.subject}
      </footer>
    </div>
  );
}
