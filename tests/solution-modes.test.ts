import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import katex from 'katex';
import { statisticalFormulas, formulaDefaults, getFormula } from '../src/content/statistics';
import { solveStatistics } from '../src/math/statisticsEngine';
import { StatisticalSolutionView } from '../src/components/StatisticalSolutionView';
import { ValidationError } from '../src/math/engine';

describe('explicit concise summaries of validated calculations', () => {
  for (const formula of statisticalFormulas)
    it(`${formula.id}: both modes share the calculated answer and render the intended content`, () => {
      const result = solveStatistics(formula.id, formula.initial);
      expect(result.concise.substitutionTex.length).toBeGreaterThan(4);
      expect(result.concise.interpretation.length).toBeGreaterThan(10);
      expect(result.concise.interpretation.length).toBeLessThan(180);
      expect(() =>
        katex.renderToString(result.concise.substitutionTex, {
          strict: 'error',
          throwOnError: true,
        }),
      ).not.toThrow();
      const before = JSON.stringify(result);
      const render = (mode: 'quick' | 'detailed') =>
        renderToStaticMarkup(
          createElement(StatisticalSolutionView, {
            result,
            formula,
            mode,
            dirty: false,
            sourceUnchanged: false,
          }),
        );
      const quick = render('quick'),
        detailed = render('detailed');
      for (const html of [quick, detailed])
        expect(html).toContain(`data-result-value="${result.value}"`);
      expect(quick).toContain('DIRECT SUBSTITUTION');
      for (const forbidden of [
        'GIVEN INFORMATION',
        'WHY THIS METHOD',
        'VARIABLES &amp; PARAMETERS',
        'GRAPHICAL SOLUTION',
        'solution-steps',
        'calculation-table',
        'metric-row',
      ])
        expect(quick).not.toContain(forbidden);
      for (const required of [
        'GIVEN INFORMATION',
        'REQUIRED INFORMATION',
        'WHY THIS METHOD',
        'VARIABLES &amp; PARAMETERS',
        'Assumptions and conditions',
        'GRAPHICAL SOLUTION',
        'STATISTICAL INTERPRETATION',
      ])
        expect(detailed).toContain(required);
      expect((detailed.match(/class="step-index"/g) ?? []).length).toBe(result.steps.length);
      expect(JSON.stringify(result)).toBe(before);
    });
  it('uses supplied observations for every squared-deviation row', () => {
    const result = solveStatistics('sample-variance', { data: '1,2,9' });
    expect(result.value).toBe(19);
    expect(result.workingTables?.[0].rows).toEqual([
      [1, 1, -3, 9],
      [2, 2, -2, 4],
      [3, 9, 5, 25],
    ]);
    expect(result.concise.substitutionTex).toContain('(1-4)^2+(2-4)^2+(9-4)^2');
    expect(result.steps.some((s) => s.tex?.includes('38'))).toBe(true);
  });
  it('substitutes raw mean-test inputs and exposes the actual SE calculation', () => {
    const result = solveStatistics('z-test', {
      ...formulaDefaults('z-test'),
      xbar: '53',
      mu0: '50',
      sd: '10',
      n: '100',
    });
    expect(result.concise.substitutionTex).toContain('53-50');
    expect(result.concise.substitutionTex).toContain('10/\\sqrt{100}');
    expect(
      result.steps.find((s) => s.title === 'Calculate the null-model standard error')?.tex,
    ).toBe('SE=10/\\sqrt{100}=1');
    expect(result.value).toBeCloseTo(0.00269979606326, 10);
  });
  it('uses paired data for cross-products, predictions and residuals', () => {
    const result = solveStatistics('regression', { xs: '1,2,3', ys: '3,5,7' });
    expect(result.value).toBe(2);
    expect(result.workingTables?.[0].rows).toEqual([
      [1, 1, 3, -1, -2, 1, 4, 2, 3, 0],
      [2, 2, 5, 0, 0, 0, 0, 0, 5, 0],
      [3, 3, 7, 1, 2, 1, 4, 2, 7, 0],
    ]);
    expect(result.concise.substitutionTex).toContain('\\frac{4}{2}');
  });
  it('does not create a summary for invalid data', () => {
    for (const [id, patch] of [
      ['sample-variance', { data: '5' }],
      ['z-test', { sd: '0' }],
      ['regression', { xs: '1,1', ys: '2,3' }],
    ] as const)
      expect(() => solveStatistics(id, { ...formulaDefaults(id), ...patch })).toThrow(
        ValidationError,
      );
  });
  it('shows no invented physical unit when data have no supplied measurement label', () => {
    const result = solveStatistics('sample-variance', { data: '1,2,9' });
    expect(result.concise.unit).toBe('Squared units of the observations');
    expect(getFormula('sample-variance')).toBeTruthy();
  });
});
