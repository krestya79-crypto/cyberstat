import {
  evaluate,
  parseExpression,
  hasVariable,
  expressionTex,
  numberTex,
  ExpressionError,
  finite,
  type Expression,
  type AngleMode,
} from './expression';
import type { Step } from '../types';

type Polynomial = [number, number, number];
export interface MathResult {
  kind: 'calculation' | 'linear' | 'quadratic' | 'identity' | 'contradiction';
  inputTex: string;
  answerTex: string;
  interpretation: string;
  steps: Step[];
  realValue?: number;
  roots?: number[];
  angle: AngleMode;
  answerUsed: number;
}
const cancellation = (a: number, b: number) => {
  const result = finite(a + b);
  return a * b < 0 && Math.abs(result) <= Number.EPSILON * 8 * Math.max(Math.abs(a), Math.abs(b))
    ? 0
    : result;
};
const add = (a: Polynomial, b: Polynomial, sign = 1): Polynomial =>
  a.map((v, i) => cancellation(v, sign * b[i])) as Polynomial;
function multiply(a: Polynomial, b: Polynomial): Polynomial {
  const coefficients = [0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      coefficients[i + j] = cancellation(coefficients[i + j], finite(a[i] * b[j]));
  if (coefficients[3] !== 0 || coefficients[4] !== 0)
    throw new ExpressionError(
      'Supported equations are linear or quadratic in x. Powers above x² are not supported.',
    );
  return coefficients.slice(0, 3) as Polynomial;
}
function polynomial(node: Expression, angle: AngleMode, answer: number): Polynomial {
  if (!hasVariable(node)) return [evaluate(node, angle, answer), 0, 0];
  if (node.kind === 'symbol' && node.name === 'x') return [0, 1, 0];
  if (node.kind === 'unary')
    return polynomial(node.operand, angle, answer).map((v) =>
      node.op === '-' ? -v : v,
    ) as Polynomial;
  if (node.kind === 'binary') {
    const left = polynomial(node.left, angle, answer);
    if (node.op === '^') {
      if (hasVariable(node.right))
        throw new ExpressionError(
          'An exponent containing x is not supported. Use a linear or quadratic equation.',
        );
      const exponent = evaluate(node.right, angle, answer);
      if (exponent === 0) return [1, 0, 0];
      if (exponent === 1) return left;
      if (exponent === 2) return multiply(left, left);
      throw new ExpressionError('A term containing x may only have power 0, 1, or 2.');
    }
    const right = polynomial(node.right, angle, answer);
    if (node.op === '+') return add(left, right);
    if (node.op === '-') return add(left, right, -1);
    if (node.op === '*') return multiply(left, right);
    if (right[1] !== 0 || right[2] !== 0)
      throw new ExpressionError(
        'Equations with x in a denominator are not supported. Use a constant denominator.',
      );
    if (right[0] === 0) throw new ExpressionError('Division by zero is undefined.');
    return left.map((v) => finite(v / right[0])) as Polynomial;
  }
  throw new ExpressionError(
    'Functions, factorials and percentages containing x are not supported. Use them on numerical constants inside a linear or quadratic equation.',
  );
}
function polynomialTex([c, b, a]: Polynomial): string {
  const terms: [[number, string], [number, string], [number, string]] = [
    [a, 'x^2'],
    [b, 'x'],
    [c, ''],
  ];
  let result = '';
  for (const [coefficient, symbol] of terms) {
    if (coefficient === 0) continue;
    const magnitude = Math.abs(coefficient);
    result +=
      (coefficient < 0 ? '-' : result ? '+' : '') +
      (magnitude === 1 && symbol ? '' : numberTex(magnitude)) +
      symbol;
  }
  return result || '0';
}
function evaluationSteps(
  node: Expression,
  angle: AngleMode,
  answer: number,
  steps: Step[],
): number {
  const value = evaluate(node, angle, answer);
  if (node.kind === 'binary') {
    evaluationSteps(node.left, angle, answer, steps);
    evaluationSteps(node.right, angle, answer, steps);
  } else if (node.kind === 'unary' || node.kind === 'postfix')
    evaluationSteps(node.operand, angle, answer, steps);
  else if (node.kind === 'call') evaluationSteps(node.argument, angle, answer, steps);
  if (node.kind !== 'number' && node.kind !== 'symbol' && steps.length < 100)
    steps.push({
      title:
        node.kind === 'call'
          ? `Evaluate ${node.name}`
          : node.kind === 'binary' && node.op === '^'
            ? 'Evaluate the power'
            : node.kind === 'postfix'
              ? 'Apply the postfix operation'
              : 'Apply the operation',
      text:
        node.kind === 'call' && ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(node.name)
          ? `Use ${angle === 'deg' ? 'degrees' : 'radians'} for this trigonometric operation.`
          : 'Evaluate inner expressions first, following the order of operations.',
      tex: `${expressionTex(node)}=${numberTex(value)}`,
    });
  return value;
}
export function solveMath(input: string, angle: AngleMode = 'deg', answer = 0): MathResult {
  if (input.length > 500) throw new ExpressionError('Use an expression of at most 500 characters.');
  const sides = input.split('=');
  if (sides.length > 2)
    throw new ExpressionError('Use one equals sign for a single equation in x.');
  if (sides.length === 2 && (!sides[0].trim() || !sides[1].trim()))
    throw new ExpressionError('Enter an expression on both sides of the equals sign.');
  const left = parseExpression(sides[0]);
  const common = { angle, answerUsed: answer };
  if (sides.length === 1 && !hasVariable(left)) {
    const steps: Step[] = [
      {
        title: 'Read the expression',
        text: 'Parentheses and functions come first, followed by powers, multiplication/division, and addition/subtraction. Powers associate from right to left; a leading minus is applied after a power.',
        tex: expressionTex(left),
      },
    ];
    const result = evaluationSteps(left, angle, answer, steps);
    steps.push({
      title: 'Write the result',
      text: 'Keep full precision during evaluation; round only the displayed result.',
      tex: `${expressionTex(left)}=${numberTex(result)}`,
    });
    return {
      ...common,
      kind: 'calculation',
      inputTex: expressionTex(left),
      answerTex: numberTex(result),
      realValue: result,
      interpretation: `The expression evaluates to ${Number(result.toPrecision(12))}. Trigonometric functions use ${angle === 'deg' ? 'degrees' : 'radians'}.`,
      steps,
    };
  }
  const right =
    sides.length === 2 ? parseExpression(sides[1]) : { kind: 'number' as const, value: 0 };
  const lhs = polynomial(left, angle, answer),
    rhs = polynomial(right, angle, answer);
  const [c, b, a] = add(lhs, rhs, -1);
  const inputTex = `${expressionTex(left)}=${expressionTex(right)}`;
  const steps: Step[] = [
    {
      title: 'Identify the equation',
      text:
        sides.length === 1
          ? 'No equals sign was supplied, so solve the expression equal to zero.'
          : 'Solve for x. Both sides may contain constants, parentheses and terms up to x².',
      tex: inputTex,
    },
    {
      title: 'Expand and collect each side',
      text: 'Distribute products and combine the constant, x, and x² coefficients on each side.',
      tex: `${polynomialTex(lhs)}=${polynomialTex(rhs)}`,
    },
    {
      title: 'Move all terms to the left',
      text: 'Subtract the right-hand side from both sides and combine like terms.',
      tex: `${polynomialTex([c, b, a])}=0`,
    },
  ];
  if (a === 0 && b === 0) {
    const identity = c === 0;
    steps.push({
      title: identity ? 'Recognize an identity' : 'Recognize a contradiction',
      text: identity
        ? 'The variable cancels and both sides are equal for every real x.'
        : 'The variable cancels and the remaining constant equality is false.',
      tex: `${numberTex(c)}=0`,
    });
    return {
      ...common,
      kind: identity ? 'identity' : 'contradiction',
      inputTex,
      answerTex: identity ? 'x\\in\\mathbb R' : '\\varnothing',
      interpretation: identity
        ? 'Every real number satisfies this equation.'
        : 'There is no solution: no value of x can make this equality true.',
      roots: [],
      steps,
    };
  }
  if (a === 0) {
    const root = finite(-c / b);
    steps.push(
      {
        title: 'Isolate the x term',
        text: 'Subtract the constant from both sides.',
        tex: `${numberTex(b)}x=${numberTex(-c)}`,
      },
      {
        title: 'Divide by the coefficient of x',
        text: 'The coefficient is nonzero, so divide both sides by it.',
        tex: `x=\\frac{${numberTex(-c)}}{${numberTex(b)}}=${numberTex(root)}`,
      },
    );
    return {
      ...common,
      kind: 'linear',
      inputTex,
      answerTex: `x=${numberTex(root)}`,
      realValue: root,
      roots: [root],
      interpretation: 'This linear equation has one real solution.',
      steps,
    };
  }
  // Scaling prevents unnecessary overflow; a stable q formula avoids cancellation in real roots.
  const scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c));
  const A = a / scale,
    B = b / scale,
    C = c / scale;
  const rawDiscriminant = finite(B * B - 4 * A * C);
  const nearRepeated =
    rawDiscriminant !== 0 &&
    Math.abs(rawDiscriminant) <= Number.EPSILON * 8 * (Math.abs(B * B) + Math.abs(4 * A * C));
  const discriminant = nearRepeated ? 0 : rawDiscriminant;
  const dTex = `\\left(${numberTex(b)}\\right)^2-4\\left(${numberTex(a)}\\right)\\left(${numberTex(c)}\\right)`;
  steps.push(
    {
      title: 'Identify the quadratic coefficients',
      text: 'Match the equation to ax²+bx+c=0, where a≠0.',
      tex: `a=${numberTex(a)},\\quad b=${numberTex(b)},\\quad c=${numberTex(c)}`,
    },
    {
      title: 'Use the quadratic formula',
      text: 'The sign of the discriminant determines whether the roots are real, repeated, or complex.',
      tex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
    },
    {
      title: 'Evaluate the discriminant',
      text: 'Use an equivalent scaled equation internally to avoid overflow. The discriminant has the same sign after positive scaling.',
      tex: `D=${dTex}${Number.isFinite(b * b - 4 * a * c) ? `=${numberTex(b * b - 4 * a * c)}` : ''}`,
    },
  );
  if (discriminant < 0) {
    const real = finite(-B / (2 * A)),
      imag = finite(Math.sqrt(-discriminant) / (2 * Math.abs(A)));
    const answerTex = `x=${numberTex(real)}\\pm ${numberTex(imag)}i`;
    steps.push({
      title: 'Resolve the negative discriminant',
      text: 'Use i²=−1. A negative discriminant gives two complex conjugate roots and no real roots.',
      tex: answerTex,
    });
    return {
      ...common,
      kind: 'quadratic',
      inputTex,
      answerTex,
      interpretation:
        'There are two complex conjugate solutions; this equation has no real solution.',
      roots: [],
      steps,
    };
  }
  let roots: number[];
  if (discriminant === 0) roots = [finite(-B / (2 * A))];
  else {
    const q = -0.5 * (B + (B >= 0 ? 1 : -1) * Math.sqrt(discriminant));
    roots = [finite(q / A), finite(C / q)].sort((x, y) => x - y);
  }
  const answerTex =
    roots.length === 1
      ? `x=${numberTex(roots[0])}`
      : `x_1=${numberTex(roots[0])},\\quad x_2=${numberTex(roots[1])}`;
  steps.push(
    {
      title: 'Substitute into the quadratic formula',
      text: 'Substitute the coefficients, then take the square root and divide. The calculation engine uses an algebraically equivalent stable form for distinct real roots.',
      tex: `x=\\frac{-\\left(${numberTex(b)}\\right)\\pm\\sqrt{${dTex}}}{2\\left(${numberTex(a)}\\right)}`,
    },
    {
      title: roots.length === 1 ? 'Write the repeated root' : 'Write both roots',
      text:
        roots.length === 1
          ? 'A zero discriminant gives one repeated real root.'
          : 'A positive discriminant gives two distinct real roots.',
      tex: answerTex,
    },
  );
  if (nearRepeated)
    steps.push({
      title: 'Account for numerical precision',
      text: 'The computed discriminant is within floating-point precision of zero. The displayed solution is a numerical repeated-root approximation.',
      tex: `D\\approx0,\\quad x\\approx${numberTex(roots[0])}`,
    });
  return {
    ...common,
    kind: 'quadratic',
    inputTex,
    answerTex,
    roots,
    realValue: roots.length === 1 ? roots[0] : undefined,
    interpretation: nearRepeated
      ? 'The discriminant is numerically indistinguishable from zero; this is a repeated-root approximation.'
      : roots.length === 1
        ? 'This quadratic has one repeated real root.'
        : 'This quadratic has two distinct real solutions.',
    steps,
  };
}
