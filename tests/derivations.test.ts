import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import katex from 'katex';
import { formulaCoverage, lectureDerivations, coverageLabels } from '../src/content/derivations';
import { topics } from '../src/content/topics';

describe('four-lecture proof provenance', () => {
  it('uses the exact four original PDFs reviewed for this content', () => {
    const hashes = [
      '1199cb72756b7ae7c1669e55117836084e958ed82fbe62b208c5a7647a6d282a',
      'b564fdf71b6de86cd4ce815d0bd91d9a5edbe306c7ed57a069c8fdff78ac452b',
      'bac665bb0bffbe4c817eaf4fe568f8faf7a4ab008d7844765621d41682ba187c',
      '2124d445c19b16522fb71be49f49b19577814fdc3edee91506402eb56b86ac8c',
    ];
    hashes.forEach((hash, i) =>
      expect(
        createHash('sha256')
          .update(readFileSync(`public/lectures/lecture-${i + 1}.pdf`))
          .digest('hex'),
      ).toBe(hash),
    );
  });
  it('classifies every original Notebook formula, including formulas without proofs', () => {
    expect(formulaCoverage).toHaveLength(49);
    expect(formulaCoverage.map((c) => c.formula)).toEqual(topics.flatMap((t) => t.formulas));
    expect(new Set(formulaCoverage.map((c) => c.key)).size).toBe(49);
    for (const c of formulaCoverage) {
      expect(c.note.length).toBeGreaterThan(25);
      expect(coverageLabels[c.kind]).toBeTruthy();
      expect(c.pages.length).toBeGreaterThan(0);
      for (const id of c.proofs) expect(lectureDerivations.some((p) => p.id === id)).toBe(true);
    }
  });
  it('does not present Lecture 2 stated theorems or the assigned unknown-variance intervals as supplied proofs', () => {
    expect(lectureDerivations.some((p) => p.lecture === 2)).toBe(false);
    expect(
      formulaCoverage.filter((c) => c.topic.lecture === 2).every((c) => c.kind === 'stated'),
    ).toBe(true);
    for (const key of ['ci-large:0', 'ci-t:0'])
      expect(formulaCoverage.find((c) => c.key === key)?.kind).toBe('assignment');
    expect(lectureDerivations.filter((p) => p.kind === 'derivation').map((p) => p.id)).toEqual([
      'normal-lower',
      'normal-upper',
      'normal-between',
      'variance-expectation',
      'variance-variance',
      'known-mean-interval',
    ]);
    expect(lectureDerivations.filter((p) => p.kind === 'worked')).toHaveLength(5);
  });
  it('has valid page references and Notebook links for every supplied chain', () => {
    const pages = [21, 19, 14, 16];
    for (const p of lectureDerivations) {
      expect(p.steps.length).toBeGreaterThanOrEqual(4);
      expect(formulaCoverage.some((c) => c.proofs.includes(p.id))).toBe(true);
      for (const page of p.pages) {
        expect(page).toBeGreaterThan(0);
        expect(page).toBeLessThanOrEqual(pages[p.lecture - 1]);
      }
    }
    for (const c of formulaCoverage)
      for (const page of c.pages) expect(page).toBeLessThanOrEqual(pages[c.topic.lecture - 1]);
  });
  it('renders every transcribed formula and separately labeled correction strictly', () => {
    for (const p of lectureDerivations)
      for (const tex of [
        ...p.steps.map((s) => s.tex),
        p.review?.printed,
        p.review?.corrected,
      ].filter(Boolean))
        expect(
          () => katex.renderToString(tex!, { strict: 'error', throwOnError: true }),
          p.id,
        ).not.toThrow();
  });
  it('preserves source errors as evidence instead of silently attributing corrected mathematics to the lecturer', () => {
    const between = lectureDerivations.find((p) => p.id === 'normal-between')!;
    expect(between.steps.at(-1)?.tex).toContain('b-\\mu');
    expect(between.review?.corrected).toContain('a-\\mu');
    const inverse = lectureDerivations.find((p) => p.id === 'inverse-right')!;
    expect(inverse.steps.at(-1)?.tex).toContain('k-8');
    expect(inverse.review?.corrected).toContain('k-12');
    const size = lectureDerivations.find((p) => p.id === 'sample-size-example')!;
    expect(size.steps.at(-1)?.tex).toContain('132.3');
    expect(size.review?.corrected).toContain('139');
    expect(Math.ceil(((1.96 * 0.3) / 0.05) ** 2)).toBe(139);
  });
});
