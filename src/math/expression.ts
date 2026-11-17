export type AngleMode = 'deg' | 'rad';
export type Expression =
  | { kind: 'number'; value: number }
  | { kind: 'symbol'; name: string }
  | { kind: 'unary'; op: '+' | '-'; operand: Expression }
  | { kind: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: Expression; right: Expression }
  | { kind: 'postfix'; op: '!' | '%'; operand: Expression }
  | { kind: 'call'; name: string; argument: Expression };

export class ExpressionError extends Error {}
interface Token {
  text: string;
  type: 'number' | 'name' | 'operator' | 'end';
}
const functions = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sqrt',
  'cbrt',
  'ln',
  'log',
  'exp',
  'abs',
  'floor',
  'ceil',
]);
const constants = new Set(['pi', 'e', 'ans', 'x']);

export function parseExpression(input: string): Expression {
  if (!input.trim()) throw new ExpressionError('Enter a calculation or an equation first.');
  if (input.length > 500) throw new ExpressionError('Use an expression of at most 500 characters.');
  const source = input
    .replaceAll('π', 'pi')
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('²', '^2')
    .replaceAll('√', 'sqrt')
    .toLowerCase();
  const tokens: Token[] = [];
  let offset = 0;
  while (offset < source.length) {
    const rest = source.slice(offset);
    if (/^\s/.test(rest)) {
      offset++;
      continue;
    }
    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/);
    const name = rest.match(/^[a-z]+/);
    if (number) {
      tokens.push({ type: 'number', text: number[0] });
      offset += number[0].length;
    } else if (name) {
      tokens.push({ type: 'name', text: name[0] });
      offset += name[0].length;
    } else if ('+-*/^()!%'.includes(rest[0])) {
      tokens.push({ type: 'operator', text: rest[0] });
      offset++;
    } else
      throw new ExpressionError(
        `“${rest[0]}” is not supported. Use numbers, x, parentheses, and the scientific keypad.`,
      );
    if (tokens.length > 250)
      throw new ExpressionError('This expression is too long. Use fewer operations.');
  }
  tokens.push({ type: 'end', text: '' });
  let position = 0,
    depth = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const accept = (text: string) => (peek().text === text ? (take(), true) : false);
  function primary(): Expression {
    if (++depth > 60) throw new ExpressionError('Use fewer nested parentheses or powers.');
    let result: Expression;
    if (accept('(')) {
      result = sum();
      if (!accept(')')) throw new ExpressionError('A closing parenthesis is missing.');
    } else if (peek().type === 'number') {
      result = { kind: 'number', value: finite(Number(take().text)) };
    } else if (peek().type === 'name') {
      const name = take().text;
      if (functions.has(name)) {
        if (!accept('(')) throw new ExpressionError(`Use parentheses: ${name}(…).`);
        const argument = sum();
        if (!accept(')')) throw new ExpressionError(`Close the parenthesis after ${name}.`);
        result = { kind: 'call', name, argument };
      } else if (constants.has(name)) result = { kind: 'symbol', name };
      else
        throw new ExpressionError(
          `Unknown name “${name}”. The equation variable is x; use explicit multiplication between names.`,
        );
    } else
      throw new ExpressionError(
        peek().type === 'end'
          ? 'The expression is incomplete.'
          : `Unexpected “${peek().text}”. Check the operators and parentheses.`,
      );
    depth--;
    while (peek().text === '!' || peek().text === '%')
      result = { kind: 'postfix', op: take().text as '!' | '%', operand: result };
    return result;
  }
  function power(): Expression {
    const left = primary();
    return accept('^') ? { kind: 'binary', op: '^', left, right: unary() } : left;
  }
  function unary(): Expression {
    if (peek().text === '+' || peek().text === '-') {
      if (++depth > 60) throw new ExpressionError('Use fewer nested unary operators.');
      const op = take().text as '+' | '-';
      const operand = unary();
      depth--;
      return { kind: 'unary', op, operand };
    }
    return power();
  }
  function product(): Expression {
    let result = unary();
    while (
      peek().text === '*' ||
      peek().text === '/' ||
      peek().text === '(' ||
      peek().type === 'name'
    ) {
      const op = peek().text === '*' || peek().text === '/' ? (take().text as '*' | '/') : '*';
      result = { kind: 'binary', op, left: result, right: unary() };
    }
    return result;
  }
  function sum(): Expression {
    let result = product();
    while (peek().text === '+' || peek().text === '-')
      result = { kind: 'binary', op: take().text as '+' | '-', left: result, right: product() };
    return result;
  }
  const expression = sum();
  if (peek().type !== 'end')
    throw new ExpressionError(
      `Unexpected “${peek().text}”. Add an operator between adjacent numbers and check parentheses.`,
    );
  return expression;
}

export const finite = (value: number): number => {
  if (!Number.isFinite(value))
    throw new ExpressionError(
      'The result is outside the finite real-number range. Check the inputs and function domains.',
    );
  return Object.is(value, -0) ? 0 : value;
};
export function hasVariable(node: Expression): boolean {
  if (node.kind === 'symbol') return node.name === 'x';
  if (node.kind === 'binary') return hasVariable(node.left) || hasVariable(node.right);
  if (node.kind === 'unary' || node.kind === 'postfix') return hasVariable(node.operand);
  return node.kind === 'call' && hasVariable(node.argument);
}
export function operate(op: string, a: number, b: number): number {
  if (op === '/') {
    if (b === 0) throw new ExpressionError('Division by zero is undefined.');
    return finite(a / b);
  }
  if (op === '^') return finite(Math.pow(a, b));
  return finite(op === '+' ? a + b : op === '-' ? a - b : a * b);
}
export function evaluate(node: Expression, angle: AngleMode, answer: number): number {
  if (node.kind === 'number') return node.value;
  if (node.kind === 'symbol') {
    if (node.name === 'x') throw new ExpressionError('Use an equation to solve for x.');
    return node.name === 'pi' ? Math.PI : node.name === 'e' ? Math.E : finite(answer);
  }
  if (node.kind === 'unary')
    return finite((node.op === '-' ? -1 : 1) * evaluate(node.operand, angle, answer));
  if (node.kind === 'binary')
    return operate(
      node.op,
      evaluate(node.left, angle, answer),
      evaluate(node.right, angle, answer),
    );
  if (node.kind === 'postfix') {
    const value = evaluate(node.operand, angle, answer);
    if (node.op === '%') return value / 100;
    if (!Number.isInteger(value) || value < 0 || value > 170)
      throw new ExpressionError('Factorial requires an integer from 0 to 170.');
    let result = 1;
    for (let i = 2; i <= value; i++) result *= i;
    return finite(result);
  }
  const x = evaluate(node.argument, angle, answer),
    radians = angle === 'deg' ? (x * Math.PI) / 180 : x;
  const inverse = (v: number) => (angle === 'deg' ? (v * 180) / Math.PI : v);
  if (node.name === 'sqrt' && x < 0)
    throw new ExpressionError(
      'sqrt requires a nonnegative real input. Quadratic equations can still return complex roots.',
    );
  if ((node.name === 'ln' || node.name === 'log') && x <= 0)
    throw new ExpressionError(`${node.name} requires a positive input.`);
  if ((node.name === 'asin' || node.name === 'acos') && Math.abs(x) > 1)
    throw new ExpressionError(`${node.name} requires an input between −1 and 1.`);
  if (node.name === 'tan' && Math.abs(Math.cos(radians)) < 1e-14)
    throw new ExpressionError('Tangent is undefined at this angle.');
  const operations: Record<string, () => number> = {
    sin: () => Math.sin(radians),
    cos: () => Math.cos(radians),
    tan: () => Math.tan(radians),
    asin: () => inverse(Math.asin(x)),
    acos: () => inverse(Math.acos(x)),
    atan: () => inverse(Math.atan(x)),
    sqrt: () => Math.sqrt(x),
    cbrt: () => Math.cbrt(x),
    ln: () => Math.log(x),
    log: () => Math.log10(x),
    exp: () => Math.exp(x),
    abs: () => Math.abs(x),
    floor: () => Math.floor(x),
    ceil: () => Math.ceil(x),
  };
  return finite(operations[node.name]());
}
export function numberTex(n: number): string {
  const text = Object.is(n, -0) ? '0' : Number(n.toPrecision(12)).toString();
  return text.includes('e') ? text.replace(/e([+-]?\d+)/, '\\times10^{$1}') : text;
}
export function expressionTex(node: Expression): string {
  if (node.kind === 'number') return numberTex(node.value);
  if (node.kind === 'symbol')
    return node.name === 'pi' ? '\\pi' : node.name === 'ans' ? '\\mathrm{Ans}' : node.name;
  if (node.kind === 'unary') return `${node.op}\\left(${expressionTex(node.operand)}\\right)`;
  if (node.kind === 'postfix')
    return `\\left(${expressionTex(node.operand)}\\right)${node.op === '%' ? '\\%' : '!'}`;
  if (node.kind === 'binary') {
    const a = expressionTex(node.left),
      b = expressionTex(node.right);
    if (node.op === '/') return `\\frac{${a}}{${b}}`;
    if (node.op === '^') return `{\\left(${a}\\right)}^{${b}}`;
    return `\\left(${a}${node.op === '*' ? '\\times ' : node.op}${b}\\right)`;
  }
  const arg = expressionTex(node.argument);
  if (node.name === 'sqrt') return `\\sqrt{${arg}}`;
  if (node.name === 'cbrt') return `\\sqrt[3]{${arg}}`;
  if (node.name === 'abs') return `\\left|${arg}\\right|`;
  return `\\operatorname{${node.name}}\\left(${arg}\\right)`;
}
