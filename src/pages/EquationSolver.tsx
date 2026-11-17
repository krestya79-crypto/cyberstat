import { useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Delete,
  RotateCcw,
  BookOpen,
  Search,
} from 'lucide-react';
import { MathText } from '../components/Math';
import { solveMath, type MathResult } from '../math/equationSolver';
import { numberTex, type AngleMode } from '../math/expression';
import { useStored, readStored, writeStored } from '../lib/storage';
import { topics } from '../content/topics';
import '../solver.css';

const keys = [
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'Equation =', insert: '=' },
  { label: 'sin⁻¹', insert: 'asin(' },
  { label: 'cos⁻¹', insert: 'acos(' },
  { label: 'tan⁻¹', insert: 'atan(' },
  { label: 'x', insert: 'x' },
  { label: '√', insert: 'sqrt(' },
  { label: 'ln', insert: 'ln(' },
  { label: 'log', insert: 'log(' },
  { label: 'xʸ', insert: '^' },
  { label: 'π', insert: 'pi' },
  { label: 'e', insert: 'e' },
  { label: 'Ans', insert: 'ans' },
  { label: 'x²', insert: '^2' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: 'n!', insert: '!' },
  { label: '%', insert: '%' },
];
const numericKeys = [
  { label: '7', insert: '7' },
  { label: '8', insert: '8' },
  { label: '9', insert: '9' },
  { label: '÷', insert: '/' },
  { label: '4', insert: '4' },
  { label: '5', insert: '5' },
  { label: '6', insert: '6' },
  { label: '×', insert: '*' },
  { label: '1', insert: '1' },
  { label: '2', insert: '2' },
  { label: '3', insert: '3' },
  { label: '−', insert: '-' },
  { label: '0', insert: '0' },
  { label: '.', insert: '.' },
  { label: '=', insert: 'evaluate' },
  { label: '+', insert: '+' },
];
const samples = [
  { name: 'Linear equation', input: '2(x + 3) = 18' },
  { name: 'Quadratic equation', input: 'x^2 - 5x + 6 = 0' },
  { name: 'Scientific calculation', input: 'sqrt(144) + sin(30)' },
];
export function EquationSolver({
  initialQuery = '',
  initialLecture = 0,
}: {
  initialQuery?: string;
  initialLecture?: number;
}) {
  const [input, setInput, storageFailed] = useStored('solver-input', '');
  const [angle, setAngle] = useStored<AngleMode>('solver-angle', 'deg');
  const [answer, setAnswer] = useStored('solver-answer', 0);
  const [mode, setMode] = useState<'quick' | 'detailed'>(() =>
    readStored('solution-mode', 'quick'),
  );
  const [result, setResult] = useState<MathResult | null>(null);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [lecture, setLecture] = useState(initialLecture);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  function edit(value: string) {
    setInput(value);
    setDirty(true);
    setError('');
  }
  function run(value = input) {
    try {
      const next = solveMath(value, angle, answer);
      setResult(next);
      setError('');
      setDirty(false);
      if (next.realValue !== undefined) setAnswer(next.realValue);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check the expression and try again.');
      setResult(null);
    }
  }
  function insert(text: string) {
    const start = inputRef.current?.selectionStart ?? input.length,
      end = inputRef.current?.selectionEnd ?? start;
    const from = text === 'backspace' && start === end ? Math.max(0, start - 1) : start;
    const replacement =
      text === 'backspace'
        ? ''
        : text.endsWith('(') && end > start
          ? `${text}${input.slice(start, end)})`
          : text;
    edit(input.slice(0, from) + replacement + input.slice(end));
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(from + replacement.length, from + replacement.length);
    });
  }
  const filtered = topics.filter(
    (t) =>
      (!lecture || t.lecture === lecture) &&
      `${t.title} ${t.short} ${t.intro} ${t.formulas.map((f) => f.name + ' ' + f.tex).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">YOUR MATHEMATICS WORKSPACE</span>
        <h1>Equation Solver</h1>
        <p>
          Calculate, solve, and follow the working. One input brings your scientific calculator and
          equation solver together.
        </p>
      </header>
      <div className="equation-workspace">
        <form
          className="equation-input-panel"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          noValidate
        >
          <div className="section-heading">
            <h2>What are you working on?</h2>
            <div className="angle-control" role="group" aria-label="Angle unit">
              {(['deg', 'rad'] as const).map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className={angle === unit ? 'active' : ''}
                  aria-pressed={angle === unit}
                  onClick={() => {
                    setAngle(unit);
                    setDirty(true);
                  }}
                >
                  {unit.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <label className="equation-label" htmlFor="equation-input">
            Equation or calculation
          </label>
          <textarea
            ref={inputRef}
            id="equation-input"
            value={input}
            onChange={(e) => edit(e.target.value)}
            placeholder="e.g. 2x + 3 = 11 or sqrt(144) + sin(30)"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={500}
            aria-invalid={!!error}
            aria-describedby={error ? 'solver-error' : 'equation-help'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                run();
              }
            }}
          />
          <div className="equation-input-meta">
            <span>{input.length}/500</span>
            <button
              type="button"
              aria-label="Backspace"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert('backspace')}
            >
              <Delete size={14} /> Backspace
            </button>
            <button
              type="button"
              onClick={() => {
                edit('');
                setResult(null);
                setDirty(false);
                inputRef.current?.focus();
              }}
            >
              <RotateCcw size={13} /> Clear input
            </button>
          </div>
          <p id="equation-help" className="solver-help">
            Use x for the unknown. Enter a numerical expression to calculate, or a linear or
            quadratic equation to solve.
          </p>
          {[
            { name: 'Scientific functions', keys },
            { name: 'Number keypad', keys: numericKeys },
          ].map((group) => (
            <div
              key={group.name}
              className="scientific-keypad"
              role="group"
              aria-label={group.name}
            >
              {group.keys.map((key) => (
                <button
                  key={key.label}
                  type="button"
                  className={
                    key.insert === 'evaluate'
                      ? 'evaluate-key'
                      : ['+', '-', '*', '/', '^', '^2', '='].includes(key.insert)
                        ? 'operator-key'
                        : ''
                  }
                  aria-label={
                    key.insert === 'evaluate'
                      ? 'Evaluate input'
                      : key.insert === '='
                        ? 'Insert equals sign'
                        : `Insert ${key.label}`
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => (key.insert === 'evaluate' ? run() : insert(key.insert))}
                >
                  {key.label}
                </button>
              ))}
            </div>
          ))}
          <div className="answer-memory">
            <span>Ans · last numerical result</span>
            <MathText tex={numberTex(answer)} />
          </div>
          <p className="solver-help">
            Ans also stores a single real equation root. % divides its operand by 100; log is base
            10 and ln is the natural logarithm.
          </p>
          {error && (
            <p id="solver-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          {storageFailed && (
            <p className="field-error" role="status">
              Browser storage is unavailable. This input works for the current session.
            </p>
          )}
          <button type="submit" className="button primary solve-button">
            <Calculator size={17} /> Solve / calculate
            <ArrowRight size={17} />
          </button>
          <div className="solver-samples">
            <span className="eyebrow">TRY AN EXAMPLE</span>
            {samples.map((sample) => (
              <button
                type="button"
                key={sample.name}
                onClick={() => {
                  setInput(sample.input);
                  run(sample.input);
                }}
              >
                {sample.name}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </form>
        <section
          className="equation-result-panel"
          aria-label="Equation solution"
          aria-live="polite"
        >
          <div className="section-heading">
            <h2>Your solution</h2>
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
          </div>
          {dirty && result && (
            <p className="input-notice" role="status">
              Input or angle unit changed. Solve / calculate to update the working.
            </p>
          )}
          {result ? (
            <div className={dirty ? 'stale-solution' : ''}>
              <div className="result-answer">
                <span className="eyebrow">
                  {result.kind === 'calculation'
                    ? 'CALCULATED RESULT'
                    : result.kind === 'quadratic'
                      ? 'QUADRATIC EQUATION'
                      : 'EQUATION RESULT'}
                </span>
                <MathText tex={result.answerTex} block />
                <p>{result.interpretation}</p>
              </div>
              <div className="solution-working">
                <span className="step-label">
                  {result.kind === 'calculation' ? 'EXPRESSION' : 'EQUATION'}
                </span>
                <MathText tex={result.inputTex} block />
                {input.toLowerCase().includes('ans') && (
                  <div className="answer-memory">
                    <span>Ans used in this solution</span>
                    <MathText tex={numberTex(result.answerUsed)} />
                  </div>
                )}
                <ol className="solution-steps">
                  {(mode === 'detailed'
                    ? result.steps
                    : result.steps.filter((_, i) => i === 0 || i >= result.steps.length - 2)
                  ).map((step, i) => (
                    <li key={`${i}-${step.title}`}>
                      <span className="step-index">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{step.title}</h3>
                        {mode === 'detailed' && <p>{step.text}</p>}
                        {step.tex && <MathText tex={step.tex} block />}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="solver-precision">
                Displayed numbers use up to 12 significant digits. Both solution views use the same
                calculation.
              </p>
            </div>
          ) : (
            <div className="empty-result">
              <Calculator size={34} />
              <h3>Start with a question.</h3>
              <p>
                Type your expression, use the keypad, or try an example. Your result and
                mathematical working will appear here.
              </p>
              <MathText tex="ax^2+bx+c=0" block />
            </div>
          )}
          <details className="solver-support">
            <summary>Supported operations</summary>
            <p>
              Real numerical arithmetic, parentheses, powers, roots, trigonometric and inverse
              trigonometric functions, logarithms, exp, abs, floor, ceil, factorial (0–170),
              percentages, π, e, and Ans.
            </p>
            <p>
              Equations: one variable x, linear or quadratic, with terms on either side and constant
              denominators. Numerical functions may appear in coefficients. Complex conjugate
              quadratic roots are included.
            </p>
            <p>
              Variable denominators, higher powers, systems of equations, and functions of x such as
              sin(x) are not supported. Multiplication and division have equal precedence and run
              left to right; use explicit parentheses for grouped denominators.
            </p>
          </details>
        </section>
      </div>
      <details className="solver-lecture-tools" open={!!initialQuery || !!initialLecture}>
        <summary>
          <BookOpen size={18} /> Probability & statistics tools
          <span>Existing lecture workspaces</span>
        </summary>
        <p>
          Continue using the original lecture explanations, statistical calculators and saved study
          progress.
        </p>
        <div className="solver-tool-filters">
          <label className="search-field">
            <Search size={17} />
            <input
              type="search"
              aria-label="Search topics, concepts, or formulas…"
              placeholder="Find a lecture topic or calculator…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Lecture
            <select value={lecture} onChange={(e) => setLecture(Number(e.target.value))}>
              <option value={0}>All lectures</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  Lecture {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="solver-topic-list">
          {filtered.map((topic) => (
            <a key={topic.id} href={`#/topic/${topic.id}`}>
              <span>
                {topic.title}
                <small>
                  Lecture {topic.lecture} · {topic.short}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <h2>No matching ideas yet.</h2>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setQuery('');
                setLecture(0);
              }}
            >
              Reset search & filters
            </button>
          </div>
        )}
      </details>
    </>
  );
}
