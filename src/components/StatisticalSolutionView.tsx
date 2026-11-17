import { Printer } from 'lucide-react';
import { MathText } from './Math';
import { DistributionChart, IntervalChart } from './Chart';
import { StatisticalPlots } from './StatisticalPlots';
import { SourceLink } from './SourceLink';
import { format } from '../math/engine';
import type { StatisticalSolution } from '../math/statisticsTypes';
import type { StatisticalFormula } from '../content/statistics';
import type { Example } from '../types';
import { categories } from '../content/statistics';
import { project } from '../content/project';

type Props = { result: StatisticalSolution; formula: StatisticalFormula };
function SelectedMethod({ formula }: Pick<Props, 'formula'>) {
  return (
    <div className="solution-given">
      <span className="step-label">SELECTED METHOD</span>
      <p>
        {categories.find((c) => c.id === formula.category)?.name} · {formula.name}
      </p>
    </div>
  );
}
function FinalAnswer({ result, quick = false }: { result: StatisticalSolution; quick?: boolean }) {
  return (
    <div
      className="result-answer"
      data-result-value={result.value}
      data-answer-tex={result.answerTex}
    >
      <span className="eyebrow">FINAL ANSWER · {result.title}</span>
      <MathText tex={result.answerTex} block />
      {result.concise.unit && <span className="answer-unit">Unit: {result.concise.unit}</span>}
      {!quick && (
        <span className="step-label interpretation-label">STATISTICAL INTERPRETATION</span>
      )}
      <p className="result-interpretation">
        {quick ? result.concise.interpretation : result.interpretation}
      </p>
    </div>
  );
}
function QuickSolution({ result, formula }: Props) {
  return (
    <div className="quick-solution" data-solution-mode="quick">
      <SelectedMethod formula={formula} />
      <div className="quick-formula">
        <span className="step-label">FORMULA USED</span>
        <MathText tex={result.formula} block />
      </div>
      <div className="direct-substitution">
        <span className="step-label">DIRECT SUBSTITUTION</span>
        <MathText tex={result.concise.substitutionTex} block />
      </div>
      <FinalAnswer result={result} quick />
    </div>
  );
}
function DetailedSolution({ result, formula }: Props) {
  return (
    <div className="detailed-solution" data-solution-mode="detailed">
      <div className="solution-working">
        <div className="solution-given">
          <span className="step-label">GIVEN INFORMATION</span>
          <p>{result.given}</p>
        </div>
        <div className="solution-given">
          <span className="step-label">REQUIRED INFORMATION</span>
          <p>{formula.required}</p>
        </div>
        <SelectedMethod formula={formula} />
        <div className="method-rationale">
          <span className="step-label">WHY THIS METHOD</span>
          <p>{formula.use}</p>
        </div>
        <div>
          <span className="step-label">SELECTED FORMULA</span>
          <MathText tex={result.formula} block />
        </div>
        <div className="solution-given">
          <span className="step-label">VARIABLES &amp; PARAMETERS</span>
          <p>{formula.variables}</p>
        </div>
        <section className="solution-assumptions">
          <h4>Assumptions and conditions</h4>
          <ul>
            {formula.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {result.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </section>
        <ol className="solution-steps">
          {result.steps.map((s, i) => (
            <li key={`${i}-${s.title}`}>
              <span className="step-index">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
                {s.tex && <MathText tex={s.tex} block />}
              </div>
            </li>
          ))}
        </ol>
        {result.workingTables?.map((table) => (
          <details className="calculation-table" key={table.title} open={table.rows.length <= 20}>
            <summary>
              {table.title} · {table.rows.length} rows
            </summary>
            <p>{table.explanation}</p>
            <div className="plot-table">
              <table>
                <thead>
                  <tr>
                    {table.headers.map((h) => (
                      <th scope="col" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{typeof cell === 'number' ? format(cell, 10) : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
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
      <FinalAnswer result={result} />
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
    </div>
  );
}
export function StatisticalSolutionView({
  result,
  formula,
  mode,
  dirty,
  example,
  sourceUnchanged,
}: Props & {
  mode: 'quick' | 'detailed';
  dirty: boolean;
  example?: Example;
  sourceUnchanged: boolean;
}) {
  return (
    <div className={dirty ? 'stale-solution' : ''}>
      {mode === 'quick' ? (
        <QuickSolution result={result} formula={formula} />
      ) : (
        <DetailedSolution result={result} formula={formula} />
      )}
      {mode === 'detailed' && example && (
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
          {mode === 'quick' ? 'Export the concise result.' : 'Export the full working and graph.'}
        </span>
      </div>
      <footer className="print-footer">
        CyberStat · {project.student} · {project.university} · {project.doctor} · {project.subject}
      </footer>
    </div>
  );
}
