import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { MathText } from '../components/Math';
import { SourceLink } from '../components/SourceLink';
import {
  coverageLabels,
  formulaCoverage,
  lectureDerivations,
  notebookUrl,
} from '../content/derivations';
import type { LectureDerivation } from '../content/derivations';
import '../derivations.css';

function Proof({ proof }: { proof: LectureDerivation }) {
  const links = formulaCoverage.filter((c) => c.proofs.includes(proof.id));
  return (
    <article className="lecture-proof" id={`proof-${proof.id}`}>
      <div className="proof-heading">
        <span className="eyebrow">
          {proof.kind === 'derivation'
            ? 'LECTURE DERIVATION'
            : 'WORKED APPLICATION · NOT A GENERAL PROOF'}
        </span>
        <h3>{proof.title}</h3>
        <p className="muted">{proof.topic}</p>
        <div className="proof-sources">
          {proof.pages.map((page) => (
            <SourceLink
              key={page}
              lecture={proof.lecture}
              page={page}
              label={`Lecture ${proof.lecture} · p. ${page}`}
            />
          ))}
        </div>
      </div>
      <p>{proof.scope}</p>
      <dl className="proof-context">
        <dt>Original assumptions</dt>
        <dd>{proof.assumptions}</dd>
        <dt>Notation & terminology</dt>
        <dd>{proof.notation}</dd>
      </dl>
      <ol className="proof-steps">
        {proof.steps.map((step, i) => (
          <li key={i}>
            <span className="step-index">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h4>{step.title}</h4>
              {step.expanded && (
                <span className="proof-expansion">
                  Editorial algebra expansion of a lecture arrow
                </span>
              )}
              <MathText tex={step.tex} block />
              <p>{step.explanation}</p>
            </div>
          </li>
        ))}
      </ol>
      {proof.review && (
        <aside className="proof-review" aria-label="Source review note">
          <h4>Printed source & editorial correction</h4>
          <p>{proof.review.text}</p>
          {proof.review.printed && <MathText tex={proof.review.printed} block />}
          {proof.review.corrected && <MathText tex={proof.review.corrected} block />}
        </aside>
      )}
      <div className="proof-notebook-links">
        <strong>Corresponding Formula Notebook entries</strong>
        {links.map((c) => (
          <a key={c.key} href={notebookUrl(c.key)}>
            {c.formula.name}
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
    </article>
  );
}

export function FormulaDerivations({ entryKey }: { entryKey?: string }) {
  const selected = formulaCoverage.find((c) => c.key === entryKey);
  const [lecture, setLecture] = useState(selected?.topic.lecture ?? 0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (entryKey)
        document.getElementById('selected-formula-review')?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [entryKey]);
  const visibleProofs = lectureDerivations.filter(
    (p) => (!lecture || p.lecture === lecture) && (!selected || selected.proofs.includes(p.id)),
  );
  return (
    <div className="derivations-page">
      <header className="page-heading">
        <a className="text-link" href="#/formulas">
          <ArrowLeft size={15} /> Back to Formula Notebook
        </a>
        <span className="eyebrow">YOUR FORMULA NOTEBOOK · FOUR ORIGINAL LECTURES</span>
        <h1>Formula Derivations &amp; Proofs</h1>
        <p>
          Source-based mathematics, in the lecturer’s order. Every entry points to the original PDF
          page.
        </p>
      </header>
      <div className="proof-introduction">
        <p>
          All four supplied lectures were reviewed: <strong>70 PDF pages</strong>. The section
          contains <strong>6 displayed derivation chains</strong> and{' '}
          <strong>5 worked algebraic applications</strong>. Applications and stated results are
          distinguished from proofs.
        </p>
        <p>
          The mathematical lines follow the slides. Step explanations are editorial annotations;
          explicitly marked expansions unpack algebra between the lecturer’s arrows. Printed errors
          are retained as source evidence and corrected separately. No external proofs are
          attributed to the lecturer.
        </p>
        <p>
          All <strong>49 existing Notebook formulas and identities</strong> have a source and
          derivation-status record below. A formula being used in an example does not mean its
          underlying theorem was proved.
        </p>
      </div>
      {entryKey && !selected && (
        <p role="alert">
          That Notebook entry was not found. The complete lecture audit is shown below.
        </p>
      )}
      {selected && (
        <section
          id="selected-formula-review"
          className="selected-formula-review"
          aria-label="Selected formula derivation status"
        >
          <span className="eyebrow">
            {selected.topic.title} · LECTURE {selected.topic.lecture}
          </span>
          <h2>{selected.formula.name}</h2>
          <MathText tex={selected.formula.tex} block />
          <strong className="coverage-status">{coverageLabels[selected.kind]}</strong>
          <p>{selected.note}</p>
          <div className="proof-sources">
            {selected.pages.map((page) => (
              <SourceLink
                key={page}
                lecture={selected.topic.lecture}
                page={page}
                label={`Lecture ${selected.topic.lecture} · p. ${page}`}
              />
            ))}
          </div>
          <div className="proof-actions">
            <a href={notebookUrl(selected.key)} className="text-link">
              Return to this Notebook formula <ArrowUpRight size={14} />
            </a>
            <a href="#/formulas?view=proofs" className="text-link">
              View the complete lecture audit
            </a>
          </div>
        </section>
      )}
      {!selected && (
        <div
          className="source-filters proof-filters"
          role="group"
          aria-label="Filter proofs by lecture"
        >
          {[0, 1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={lecture === n ? 'active' : ''}
              aria-pressed={lecture === n}
              onClick={() => setLecture(n)}
            >
              {n ? `Lecture ${n}` : 'All lectures'}
            </button>
          ))}
        </div>
      )}
      {[1, 2, 3, 4]
        .filter((n) => !lecture || lecture === n)
        .map((n) => {
          const proofs = visibleProofs.filter((p) => p.lecture === n);
          const entries = formulaCoverage.filter((c) => c.topic.lecture === n);
          return (
            <section className="proof-lecture" key={n} aria-labelledby={`lecture-${n}-heading`}>
              <div className="section-heading">
                <h2 id={`lecture-${n}-heading`}>Lecture {n}</h2>
                <SourceLink lecture={n} label={`Open original Lecture ${n}`} />
              </div>
              {n === 2 && (
                <p className="proof-no-derivation">
                  Lecture 2 states the Student, chi-square, F and sampling-distribution results
                  without displaying their proofs. They are recorded below as formulas without a
                  provided lecture derivation.
                </p>
              )}
              {proofs.map((proof) => (
                <Proof key={proof.id} proof={proof} />
              ))}
              {!proofs.length && n !== 2 && (
                <p className="proof-no-derivation">
                  No displayed lecture derivation accompanies the selected formula. See its source
                  status above and the formula audit below.
                </p>
              )}
              <details
                className="lecture-formula-audit"
                open={n === 2 || (selected && !proofs.length) ? true : undefined}
              >
                <summary>
                  Formula-by-formula source audit · {entries.length} Notebook entries
                </summary>
                {entries.map((c) => (
                  <div className="formula-audit-entry" key={c.key}>
                    <span className="eyebrow">{c.topic.title}</span>
                    <h3>
                      <a href={notebookUrl(c.key)}>
                        {c.formula.name}
                        <ArrowUpRight size={13} />
                      </a>
                    </h3>
                    <strong className="coverage-status">{coverageLabels[c.kind]}</strong>
                    <p>{c.note}</p>
                    <div className="proof-sources">
                      {c.pages.map((page) => (
                        <SourceLink
                          key={page}
                          lecture={n}
                          page={page}
                          label={`Lecture ${n} · p. ${page}`}
                        />
                      ))}
                    </div>
                    {c.proofs.map((id) => (
                      <a
                        key={id}
                        className="text-link audit-proof-link"
                        href={`#/formulas?view=proofs&entry=${encodeURIComponent(c.key)}`}
                      >
                        {lectureDerivations.find((p) => p.id === id)!.title}
                        <ArrowUpRight size={13} />
                      </a>
                    ))}
                  </div>
                ))}
              </details>
            </section>
          );
        })}
    </div>
  );
}
