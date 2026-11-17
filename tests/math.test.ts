import { describe, it, expect } from 'vitest';
import { calculate, ValidationError } from '../src/math/engine';
import {
  normalCDF,
  normalQuantile,
  tCDF,
  tQuantile,
  chiCDF,
  fCDF,
  density,
} from '../src/math/distributions';
import { defaults } from '../src/content/methods';
import { examples } from '../src/content/examples';
import { topics } from '../src/content/topics';
import katex from 'katex';
import type { Method, Values } from '../src/types';
import scipy from './scipy-reference.json';
import distributionReferences from './distribution-reference.json';
describe('distribution grid against independent SciPy values', () => {
  for (const family of ['t', 'chi', 'f'])
    it(`${family} CDF across degrees of freedom and bounds`, () => {
      for (const row of distributionReferences.filter((r) => r.family === family)) {
        const actual =
          family === 't'
            ? tCDF(row.x, row.df)
            : family === 'chi'
              ? chiCDF(row.x, row.df)
              : fCDF(row.x, row.df, row.df2!);
        expect(actual).toBeCloseTo(row.expected, 6);
      }
    });
});
describe('independent SciPy reference fixtures', () => {
  for (const e of examples.filter((e) => e.method))
    it(`independent reference: ${e.id}`, () => {
      const actual = calculate(e.method!, { ...defaults(e.method!), ...e.values }).value;
      expect(actual).toBeCloseTo(scipy[e.id as keyof typeof scipy], 6);
    });
});
describe('distribution reference identities', () => {
  it('normal median, 95% quantile, symmetry and empirical area', () => {
    expect(normalCDF(0)).toBe(0.5);
    expect(normalQuantile(0.975)).toBeCloseTo(1.95996398454, 9);
    expect(normalCDF(-1.4)).toBeCloseTo(1 - normalCDF(1.4), 12);
    expect(normalCDF(1) - normalCDF(-1)).toBeCloseTo(0.682689492137, 10);
  });
  it('Student t with 1 df is Cauchy', () => {
    for (const x of [-4, -1, 0, 1, 3])
      expect(tCDF(x, 1)).toBeCloseTo(0.5 + Math.atan(x) / Math.PI, 9);
    expect(tQuantile(0.975, 11)).toBeCloseTo(2.20098516008, 7);
    expect(tQuantile(0.975, 19)).toBeCloseTo(2.09302405441, 7);
  });
  it('chi-square with 2 df is exponential', () => {
    for (const x of [0, 0.1, 1, 5, 20]) expect(chiCDF(x, 2)).toBeCloseTo(1 - Math.exp(-x / 2), 10);
    expect(chiCDF(-1, 2)).toBe(0);
  });
  it('F(1,1) has the analytic square-Cauchy CDF', () => {
    for (const x of [0.1, 1, 2, 10])
      expect(fCDF(x, 1, 1)).toBeCloseTo((2 / Math.PI) * Math.atan(Math.sqrt(x)), 9);
    expect(fCDF(-1, 4, 8)).toBe(0);
  });
  it('has consistent normal densities', () => {
    expect(
      density(
        { family: 'normal', center: 10, scale: 2, df: 0, df2: 0, lower: 0, upper: 1, axis: 'x' },
        10,
      ),
    ).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 12);
  });
});
describe('lecture examples and source fidelity', () => {
  for (const example of examples.filter((e) => e.method))
    it(`${example.id} · L${example.lecture} p${example.page}`, () => {
      const solution = calculate(example.method!, {
        ...defaults(example.method!),
        ...example.values,
      });
      expect(Number.isFinite(solution.value)).toBe(true);
      expect(solution.steps.length).toBeGreaterThanOrEqual(3);
      if (example.expected !== undefined)
        expect(Math.abs(solution.value - example.expected)).toBeLessThanOrEqual(
          example.tolerance ?? 1e-6,
        );
      for (const text of [
        solution.formula,
        solution.answerTex,
        ...solution.steps.flatMap((s) => (s.tex ? [s.tex] : [])),
      ])
        expect(() =>
          katex.renderToString(text, { throwOnError: true, strict: 'error' }),
        ).not.toThrow();
    });
  it('retains the source answers for incorrect CI and sample-size examples', () => {
    expect(examples.find((e) => e.id === 'seniors-ci')?.sourceAnswer).toContain('2.5');
    expect(examples.find((e) => e.id === 'sample-size')?.sourceAnswer).toContain('132');
    expect(examples.filter((e) => e.exercise)).toHaveLength(5);
  });
  it('renders every academic formula with strict KaTeX', () => {
    for (const topic of topics)
      for (const f of topic.formulas)
        expect(
          () => katex.renderToString(f.tex, { throwOnError: true, strict: 'error' }),
          `${topic.id}: ${f.name}`,
        ).not.toThrow();
  });
});
describe('method validation', () => {
  const reject = (method: Method, changes: Values) =>
    expect(() => calculate(method, { ...defaults(method), ...changes })).toThrow(ValidationError);
  it('rejects empty, infinite and zero spread', () => {
    reject('normal', { sd: '' });
    reject('normal', { sd: 'Infinity' });
    reject('normal', { sd: '0' });
    reject('normal', { a: 'NaN' });
  });
  it('rejects crossed bounds', () => {
    reject('normal', { tail: 'between', a: '3', b: '2' });
    reject('bounds', { lower: '4', upper: '4' });
  });
  it('requires positive integer degrees of freedom and integer sample size', () => {
    reject('t', { df: '0' });
    reject('chi', { df: '2.5' });
    reject('f', { df2: '-1' });
    reject('mean-known', { n: '2.5' });
  });
  it('enforces normality and the lecturer’s n boundary', () => {
    reject('variance', { normal: 'false' });
    reject('ci-t', { normal: 'false' });
    reject('ci-large', { n: '29' });
    reject('ci-t', { n: '30' });
    reject('mean-known', { normal: 'false', n: '16' });
    expect(() =>
      calculate('mean-known', { ...defaults('mean-known'), normal: 'false', n: '30' }),
    ).not.toThrow();
  });
  it('enforces normal approximation expected counts', () => {
    reject('proportion', { p: '.01', n: '50' });
    reject('proportion', { p: '1' });
    reject('proportion', { a: '1.1' });
    expect(() => calculate('proportion-moments', { p: '0', n: '5' })).not.toThrow();
  });
  it('rejects impossible summary data and invalid confidence', () => {
    reject('ci-summary', { sum: '100', sumSq: '5' });
    reject('ci-known', { confidence: '100' });
    reject('inverse', { prob: '0' });
  });
  it('cannot falsely promise a small-n t plan', () => reject('size-t', { sd: '4', error: '.001' }));
  it('rounds sample size up and verifies the requested error', () => {
    const result = calculate('size-large', {
      sd: '.3',
      confidence: '95',
      error: '.05',
      strict: 'true',
    });
    expect(result.value).toBe(139);
    expect(Number(result.metrics[0].value)).toBeLessThan(0.05);
  });
  it('supports the three small/large/known mean regimes and small-t planning', () => {
    for (const method of [
      'mean-known',
      'mean-large',
      'mean-t',
      'size-known',
      'size-large',
      'size-t',
    ] as Method[])
      expect(Number.isFinite(calculate(method, defaults(method)).value)).toBe(true);
  });
});
