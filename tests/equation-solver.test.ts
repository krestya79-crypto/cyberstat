import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { solveMath } from '../src/math/equationSolver';
import { ExpressionError } from '../src/math/expression';

describe('scientific calculator', () => {
  const cases: [string, number][] = [
    ['2 + 3 * 4', 14],
    ['(2 + 3) * 4', 20],
    ['-2^2', -4],
    ['(-2)^2', 4],
    ['2^-2', 0.25],
    ['2^3^2', 512],
    ['.5 + .25', 0.75],
    ['2(3+4)', 14],
    ['2pi', 2 * Math.PI],
    ['sqrt(144)+sin(30)', 12.5],
    ['cos(60)', 0.5],
    ['tan(45)', 1],
    ['asin(.5)', 30],
    ['acos(.5)', 60],
    ['atan(1)', 45],
    ['ln(e)', 1],
    ['log(1000)', 3],
    ['exp(1)', Math.E],
    ['cbrt(-8)', -2],
    ['abs(-4)', 4],
    ['floor(2.9)+ceil(2.1)', 5],
    ['5!', 120],
    ['0!', 1],
    ['200*15%', 30],
    ['1e-3 + 2e-3', 0.003],
    ['2×(3+1)÷4', 2],
  ];
  for (const [input, expected] of cases)
    it(input, () => expect(solveMath(input).realValue).toBeCloseTo(expected, 10));
  it('honors radians and answer memory', () => {
    expect(solveMath('sin(pi/2)', 'rad').realValue).toBeCloseTo(1, 12);
    expect(solveMath('ans*3', 'deg', 7).realValue).toBe(21);
    expect(solveMath('asin(1)', 'rad').realValue).toBeCloseTo(Math.PI / 2, 12);
  });
  it('records individual operations in evaluation order', () => {
    const result = solveMath('sqrt(81)+2*3');
    const working = result.steps.map((s) => s.tex).join(' ');
    expect(working).toContain('\\sqrt{81}=9');
    expect(working).toContain('=6');
    expect(result.realValue).toBe(15);
  });
});
describe('linear and quadratic equations', () => {
  const cases: [string, number[]][] = [
    ['2x+3=11', [4]],
    ['2(x+3)=18', [6]],
    ['3x-7=x+5', [6]],
    ['x/2+1=4', [6]],
    ['1e-12*x=1', [1e12]],
    ['0.1x+0.2x=0.3x+1', []],
    ['x^2-5x+6=0', [2, 3]],
    ['(x+1)(x-1)=0', [-1, 1]],
    ['x^2=9', [-3, 3]],
    ['x^2+4x+4=0', [-2]],
    ['x^2-4', [-2, 2]],
    ['2x^2+3x=0', [-1.5, 0]],
    ['-x^2+1=0', [-1, 1]],
    ['x+sin(30)=2', [1.5]],
    ['ans*x=21', [3]],
  ];
  for (const [input, roots] of cases)
    it(input, () => {
      const result = solveMath(input, 'deg', 7);
      expect(result.roots).toHaveLength(roots.length);
      roots.forEach((root, i) => expect(result.roots![i]).toBeCloseTo(root, 9));
    });
  it('distinguishes identities and contradictions', () => {
    expect(solveMath('2(x+1)=2x+2').kind).toBe('identity');
    expect(solveMath('2x+1=2x+2').kind).toBe('contradiction');
  });
  it('returns complex conjugates for a negative discriminant', () => {
    const result = solveMath('x^2+1=0');
    expect(result.roots).toEqual([]);
    expect(result.answerTex).toContain('1i');
    expect(result.interpretation).toContain('no real solution');
  });
  it('uses a stable formula for widely separated quadratic roots', () => {
    const roots = solveMath('x^2-100000000x+1=0').roots!;
    expect(roots[0]).toBeCloseTo(1e-8, 15);
    expect(roots[1]).toBeCloseTo(1e8, 5);
    expect(roots[0] * roots[1]).toBeCloseTo(1, 12);
  });
  it('identifies a near-repeated decimal root and reports its numerical precision', () => {
    const result = solveMath('(x-0.1)^2=0');
    expect(result.roots).toHaveLength(1);
    expect(result.roots![0]).toBeCloseTo(0.1, 12);
    expect(solveMath('x^2-0.2x+0.01=0').interpretation).toContain('approximation');
  });
  it('does not change Ans to an arbitrary root of a two-root equation', () =>
    expect(solveMath('x^2-1=0').realValue).toBeUndefined());
});
describe('safe expression validation and mathematics rendering', () => {
  for (const input of [
    '',
    '2+',
    '(2+3',
    '2 3',
    'x=',
    '=3',
    'x=2=3',
    '1/0',
    'sqrt(-1)',
    'ln(0)',
    'log(-2)',
    'asin(2)',
    'tan(90)',
    '(-2)!',
    '2.5!',
    '171!',
    'exp(10000)',
    'x^3=1',
    'sin(x)=0',
    '1/x=2',
    'x^x=2',
    'sqrt(x)=3',
    'alert(1)',
    'window.location=2',
    'constructor(2)',
  ])
    it(`rejects ${input || 'an empty input'}`, () =>
      expect(() => solveMath(input)).toThrow(ExpressionError));
  it('limits input length and nesting', () => {
    expect(() => solveMath('1'.repeat(501))).toThrow(ExpressionError);
    expect(() => solveMath('('.repeat(65) + '1' + ')'.repeat(65))).toThrow(ExpressionError);
  });
  it('renders every solution step as valid KaTeX', () => {
    for (const input of [
      '2x+3=11',
      'x^2-5x+6=0',
      'x^2+1=0',
      'x=x',
      'x=x+1',
      'sqrt(81)+2^3',
      'sin(30)+15%',
      '1e30*1e30',
    ]) {
      const result = solveMath(input);
      for (const tex of [
        result.inputTex,
        result.answerTex,
        ...result.steps.flatMap((s) => (s.tex ? [s.tex] : [])),
      ])
        expect(() =>
          katex.renderToString(tex, { throwOnError: true, strict: 'error' }),
        ).not.toThrow();
    }
  });
});
