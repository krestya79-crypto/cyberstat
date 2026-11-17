import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { solveStatistics, parseData, descriptiveData } from '../src/math/statisticsEngine';
import {
  statisticalFormulas,
  formulaDefaults,
  getFormula,
  visibleFields,
} from '../src/content/statistics';
import { ValidationError } from '../src/math/engine';
import references from './statistical-reference.json';
import { density } from '../src/math/distributions';

it('uses the exact chi-square density endpoint for two degrees of freedom', () => {
  expect(
    density(
      { family: 'chi', df: 2, df2: 1, center: 0, scale: 1, lower: 0, upper: 1, axis: 'x' },
      0,
    ),
  ).toBe(0.5);
});
it('rejects significance levels beyond finite quantile precision', () => {
  expect(() =>
    solveStatistics('z-test', { ...formulaDefaults('z-test'), alpha: '1e-100' }),
  ).toThrow(ValidationError);
});
describe('all statistical methods against independent SciPy references', () => {
  for (const row of references)
    it(row.id, () => {
      const result = solveStatistics(row.id, row.values);
      expect(result.value).toBeCloseTo(row.expected, 6);
      expect(!!result.plot || !!result.curve || !!result.interval || !!result.graphReason).toBe(
        true,
      );
      for (const tex of [
        result.formula,
        result.answerTex,
        ...result.steps.flatMap((s) => (s.tex ? [s.tex] : [])),
      ])
        expect(
          () => katex.renderToString(tex, { strict: 'error', throwOnError: true }),
          tex,
        ).not.toThrow();
    });
  it('renders all catalog formula notation', () => {
    for (const formula of statisticalFormulas)
      expect(() =>
        katex.renderToString(formula.tex, { strict: 'error', throwOnError: true }),
      ).not.toThrow();
  });
});
describe('descriptive statistics and graph integrity', () => {
  it('uses actual observation counts and median-of-halves quartiles', () => {
    const s = descriptiveData([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(s.mean).toBe(5);
    expect(s.median).toBe(4.5);
    expect(s.q1).toBe(4);
    expect(s.q3).toBe(6);
    expect(s.bins.reduce((sum, b) => sum + b.count, 0)).toBe(8);
  });
  it('handles constant and singleton populations honestly', () => {
    const result = solveStatistics('population-variance', { data: '4,4,4' });
    expect(result.value).toBe(0);
    expect(result.plot?.kind).toBe('descriptive');
    expect(solveStatistics('arithmetic-mean', { data: '7' }).value).toBe(7);
    expect(() => solveStatistics('sample-variance', { data: '7' })).toThrow(ValidationError);
  });
  it('preserves decimal, negative and scientific observations', () =>
    expect(parseData('-1; .5\n2e2, 0')).toEqual([-1, 0.5, 200, 0]));
  it('rejects malformed or excessive data', () => {
    for (const raw of [
      '',
      '1,hello,3',
      '1,Infinity',
      '0x10',
      '1e20',
      Array(2001).fill('1').join(','),
    ])
      expect(() => parseData(raw)).toThrow(ValidationError);
  });
});
describe('event probabilities and discrete models', () => {
  it('validates feasible joint probabilities and conditioning', () => {
    expect(() => solveStatistics('event-union', { pa: '.8', pb: '.8', joint: '.1' })).toThrow(
      ValidationError,
    );
    expect(() => solveStatistics('conditional-probability', { joint: '.2', pb: '0' })).toThrow(
      ValidationError,
    );
    expect(solveStatistics('conditional-probability', { joint: '.2', pb: '1' }).value).toBe(0.2);
  });
  it('probability-tree leaves are exhaustive and preserve their calculated probabilities', () => {
    const s = solveStatistics('probability-tree', formulaDefaults('probability-tree'));
    if (s.plot?.kind !== 'tree') throw Error('Missing tree');
    expect(s.plot.leaves.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(s.plot.leaves[0] + s.plot.leaves[2]).toBeCloseTo(s.value, 12);
  });
  it('does not invent a conditional probability when the conditioning event is impossible', () => {
    const s = solveStatistics('probability-tree', { pa: '.3', givenA: '0', givenNotA: '0' });
    expect(s.value).toBe(0);
    expect(s.notes.join(' ')).toContain('undefined');
  });
  for (const p of ['0', '1', '.3'])
    it(`binomial graph agrees with exact and inclusive tails at p=${p}`, () => {
      for (const tail of ['exact', 'left', 'right']) {
        const s = solveStatistics('binomial', { n: '10', p, k: '3', tail });
        if (s.plot?.kind !== 'discrete') throw Error('Missing PMF');
        expect(s.plot.points.reduce((sum, point) => sum + point.y, 0)).toBeCloseTo(1, 10);
        expect(
          s.plot.points.filter((point) => point.selected).reduce((sum, point) => sum + point.y, 0),
        ).toBeCloseTo(s.value, 10);
      }
    });
  it('handles a Poisson point mass at rate zero', () => {
    expect(solveStatistics('poisson', { lambda: '0', k: '0', tail: 'exact' }).value).toBe(1);
    expect(solveStatistics('poisson', { lambda: '0', k: '1', tail: 'right' }).value).toBe(0);
  });
  it('validates count bounds and model parameters', () => {
    for (const [id, changes] of [
      ['binomial', { n: '4.2' }],
      ['binomial', { p: '1.1' }],
      ['binomial', { k: '11' }],
      ['poisson', { lambda: '-1' }],
      ['poisson', { k: '.5' }],
    ] as const)
      expect(() => solveStatistics(id, { ...formulaDefaults(id), ...changes })).toThrow(
        ValidationError,
      );
  });
});
describe('hypothesis tests and regression', () => {
  it('has the correct symmetric and one-sided normal p-values and critical regions', () => {
    const initial = formulaDefaults('z-test'),
      both = solveStatistics('z-test', initial),
      right = solveStatistics('z-test', { ...initial, tail: 'right' }),
      left = solveStatistics('z-test', { ...initial, tail: 'left' });
    expect(both.value).toBeCloseTo(2 * right.value, 12);
    expect(left.value + right.value).toBeCloseTo(1, 12);
    if (both.plot?.kind !== 'test') throw Error('Missing null-distribution graph');
    expect(both.plot.criticalLow).toBeCloseTo(-1.9599639845, 8);
    expect(both.plot.criticalHigh).toBeCloseTo(1.9599639845, 8);
    expect(both.interpretation).toContain('Reject');
  });
  it('fails to reject without asserting that a null hypothesis is proved', () => {
    const s = solveStatistics('z-test', { ...formulaDefaults('z-test'), xbar: '50' });
    expect(s.value).toBe(1);
    expect(s.interpretation).toContain('Fail to reject');
    expect(s.interpretation).toContain('does not prove');
  });
  it('enforces test assumptions and compatible observed/expected counts', () => {
    for (const [id, changes] of [
      ['t-test', { sd: '0' }],
      ['z-test', { normal: 'false' }],
      ['z-test', { alpha: '1' }],
      ['proportion-test', { n: '10', p0: '.01', successes: '1' }],
      ['chi-square-test', { expected: '1,1,1' }],
      ['chi-square-test', { observed: '10,20' }],
      ['chi-square-test', { estimated: '2' }],
    ] as const)
      expect(() => solveStatistics(id, { ...formulaDefaults(id), ...changes })).toThrow(
        ValidationError,
      );
  });
  it('fits a known line and computes residuals from exactly the input pairs', () => {
    const s = solveStatistics('regression', { xs: '1,2,3,4', ys: '3,5,7,9' });
    expect(s.value).toBe(2);
    if (s.plot?.kind !== 'scatter') throw Error('Missing scatterplot');
    expect(s.plot.intercept).toBe(1);
    expect(s.plot.rSquared).toBe(1);
    expect(s.plot.points.map((p) => p.residual)).toEqual([0, 0, 0, 0]);
    expect(s.plot.points.map((p) => [p.x, p.y])).toEqual([
      [1, 3],
      [2, 5],
      [3, 7],
      [4, 9],
    ]);
  });
  it('rejects unpaired or constant correlation data but permits a constant regression response', () => {
    expect(() => solveStatistics('correlation', { xs: '1,2,3', ys: '4,4,4' })).toThrow(
      ValidationError,
    );
    expect(() => solveStatistics('regression', { xs: '1,1', ys: '2,3' })).toThrow(ValidationError);
    expect(() => solveStatistics('regression', { xs: '1,2', ys: '3' })).toThrow(ValidationError);
    const s = solveStatistics('regression', { xs: '1,2,3', ys: '4,4,4' });
    expect(s.value).toBe(0);
    expect(s.metrics.find((m) => m.label === 'R²')?.value).toContain('Undefined');
  });
  it('only exposes an upper bound when the selected probability requires it', () => {
    const formula = getFormula('normal')!;
    expect(visibleFields(formula, { tail: 'left' }).some((f) => f.key === 'b')).toBe(false);
    expect(visibleFields(formula, { tail: 'between' }).some((f) => f.key === 'b')).toBe(true);
  });
});
