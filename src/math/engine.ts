import { chiCDF, fCDF, normalCDF, normalQuantile, tCDF, tQuantile } from './distributions';
import type { Method, Values, Solution, Step, Curve } from '../types';
import { probabilityMethods, normalityMethods } from '../content/methods';
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
export const format = (n: number, digits = 6): string =>
  Math.abs(n) > 0 && Math.abs(n) < 1e-6
    ? n.toExponential(4)
    : n.toLocaleString('en-US', { maximumFractionDigits: digits, useGrouping: false });
const v = (n: number, digits = 6) => format(n, digits);
const texNumber = (n: number) => (n < 0 ? `(${v(n)})` : v(n));
function num(values: Values, key: string, label = key): number {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '' || !Number.isFinite(Number(raw)))
    throw new ValidationError(key, `Enter a finite number for ${label}.`);
  const n = Number(raw);
  if (Math.abs(n) > 1e12)
    throw new ValidationError(key, `${label} must be no larger than 1 trillion in magnitude.`);
  return n;
}
function positive(values: Values, key: string, label = key): number {
  const n = num(values, key, label);
  if (n <= 0) throw new ValidationError(key, `${label} must be greater than zero.`);
  return n;
}
function integer(values: Values, key: string, min: number, label = key): number {
  const n = num(values, key, label);
  if (!Number.isInteger(n) || n < min || n > 10000000)
    throw new ValidationError(key, `${label} must be an integer from ${min} to 10,000,000.`);
  return n;
}
function confidence(values: Values) {
  const c = num(values, 'confidence', 'confidence level');
  if (c <= 0 || c > 99.99)
    throw new ValidationError('confidence', 'Confidence must be above 0% and at most 99.99%.');
  return c / 100;
}
function needNormal(values: Values) {
  if (values.normal !== 'true')
    throw new ValidationError(
      'normal',
      'This method requires an approximately normal population. Confirm normality or choose an applicable method.',
    );
}
const step = (title: string, text: string, tex?: string): Step => ({ title, text, tex });
export function calculate(method: Method, values: Values): Solution {
  const notes: string[] = [];
  let steps: Step[] = [];
  let given = '',
    formula = '',
    answer = '',
    answerTex = '',
    interpretation = '',
    title = '',
    value = 0;
  let curve: Curve | undefined;
  let interval: Solution['interval'];
  let metrics: Solution['metrics'] = [];
  const isCI = method.startsWith('ci-');
  const isSize = method.startsWith('size-');
  if (method === 'bounds') {
    const a = num(values, 'lower', 'lower limit'),
      b = num(values, 'upper', 'upper limit'),
      c = confidence(values);
    if (a >= b) throw new ValidationError('upper', 'The upper limit must exceed the lower limit.');
    given = `A=${v(a)}, B=${v(b)}, confidence=${v(c * 100)}%`;
    formula = 'W=B-A';
    value = b - a;
    title = 'Interval width';
    answer = `${v(value)}`;
    answerTex = `W=${v(b)}-${texNumber(a)}=${v(value)}`;
    steps = [
      step(
        'Identify the limits',
        'A is the lower confidence limit and B is the upper confidence limit.',
        `A=${v(a)},\\quad B=${v(b)}`,
      ),
      step(
        'Subtract the limits',
        'Subtract the lower limit from the upper limit to obtain the full width.',
        answerTex,
      ),
      step(
        'Find the midpoint and half-width',
        'These describe the geometry of the supplied interval.',
        `m=\\frac{A+B}{2}=${v((a + b) / 2)},\\quad e=\\frac{B-A}{2}=${v(value / 2)}`,
      ),
      step(
        'Read the confidence level',
        'The confidence level refers to a sampling procedure, not to a probability assigned to a fixed parameter after observing these limits.',
        `1-\\alpha=${v(c)},\\quad\\alpha=${v(1 - c)}`,
      ),
    ];
    interpretation =
      'These supplied limits have the width shown. Their stated confidence level must be justified by the method that produced them.';
    interval = { lower: a, upper: b, center: (a + b) / 2 };
    metrics = [
      { label: 'Half-width', value: v(value / 2) },
      { label: 'Noncoverage α', value: v(1 - c) },
    ];
  } else if (isCI) {
    const n = integer(values, 'n', method === 'ci-known' ? 1 : 2, 'sample size');
    let sd: number;
    let mean: number;
    const c = confidence(values),
      alpha = 1 - c;
    if (method === 'ci-summary') {
      const sum = num(values, 'sum', 'sum of observations'),
        squares = num(values, 'sumSq', 'sum of squared observations');
      mean = sum / n;
      const variance = (squares - (sum * sum) / n) / (n - 1);
      if (variance <= 0)
        throw new ValidationError(
          'sumSq',
          'Sum of squares must exceed (sum of observations)² / n for positive sample variance.',
        );
      sd = Math.sqrt(variance);
      steps.push(
        step(
          'Calculate the sample mean',
          'Divide the sum of observations by the sample size.',
          `\\bar X=\\frac{${v(sum)}}{${n}}=${v(mean)}`,
        ),
        step(
          'Calculate sample variance',
          'Use n−1 in the unbiased variance denominator, then take its square root.',
          `s^2=\\frac{${v(squares)}-${texNumber(sum)}^2/${n}}{${n}-1}=${v(variance)},\\quad s=${v(sd)}`,
        ),
      );
      given = `n=${n}, Σxi=${v(sum)}, Σxi²=${v(squares)}, confidence=${v(c * 100)}%`;
    } else {
      sd = positive(values, 'sd', 'standard deviation');
      mean = num(values, 'xbar', 'sample mean');
      given = `x̄=${v(mean)}, ${method === 'ci-known' ? 'σ' : 's'}=${v(sd)}, n=${n}, confidence=${v(c * 100)}%`;
    }
    if (method === 'ci-known' && n < 30) needNormal(values);
    if ((method === 'ci-large' || method === 'ci-summary') && n < 30)
      throw new ValidationError('n', 'The lecture’s large-sample z method requires n ≥ 30.');
    if (method === 'ci-t') {
      if (n >= 30)
        throw new ValidationError(
          'n',
          'This lecture workspace is for n < 30. Select the large-sample z interval for n ≥ 30.',
        );
      needNormal(values);
    }
    const t = method === 'ci-t',
      critical = t ? tQuantile(1 - alpha / 2, n - 1) : normalQuantile(1 - alpha / 2),
      se = sd / Math.sqrt(n),
      margin = critical * se,
      lower = mean - margin,
      upper = mean + margin,
      symbol = method === 'ci-known' ? '\\sigma' : 's',
      criticalSymbol = t ? 't_{\\alpha/2,n-1}' : 'z_{\\alpha/2}';
    title = `${v(c * 100)}% confidence interval`;
    formula = `\\bar X\\pm ${criticalSymbol}\\frac{${symbol}}{\\sqrt n}`;
    answer = `(${v(lower)}, ${v(upper)})`;
    answerTex = `${v(lower)}<\\mu<${v(upper)}`;
    value = lower;
    interval = { lower, upper, center: mean };
    steps.unshift(
      step(
        'Choose the method',
        t
          ? 'Unknown σ, n<30 and an approximately normal population require a t interval with n−1 degrees of freedom.'
          : method === 'ci-known'
            ? 'The population standard deviation is known; use z under the normal/large-sample conditions.'
            : 'The population standard deviation is unknown and n≥30; follow the lecture’s large-sample z approximation.',
        formula,
      ),
    );
    steps.push(
      step(
        'Split the noncoverage between the tails',
        'Convert the confidence percentage to a proportion and divide α equally.',
        `\\alpha=1-${v(c)}=${v(alpha)},\\quad\\alpha/2=${v(alpha / 2)}`,
      ),
      step(
        'Find the critical value',
        t
          ? `Use df=${n - 1} and an upper-tail area of ${v(alpha / 2)}.`
          : 'Use the standard-normal cumulative probability 1−α/2.',
        `${criticalSymbol}=${v(critical)}`,
      ),
      step(
        'Calculate the sampling standard error',
        'Divide the standard deviation by the square root of the sample size.',
        `SE=\\frac{${v(sd)}}{\\sqrt{${n}}}=${v(se)}`,
      ),
      step(
        'Calculate the confidence half-width',
        'Multiply the critical value by the standard error.',
        `e=${v(critical)}\\times ${v(se)}=${v(margin)}`,
      ),
      step(
        'Subtract and add the half-width',
        'The two endpoints are the lower and upper confidence limits.',
        `LCL=${v(mean)}-${v(margin)}=${v(lower)},\\quad UCL=${v(mean)}+${v(margin)}=${v(upper)}`,
      ),
    );
    interpretation = `Using this method repeatedly, approximately ${v(c * 100)}% of the intervals would contain the fixed population mean μ. This sample gives ${answer}.`;
    metrics = [
      { label: 'Critical value', value: v(critical) },
      { label: 'Standard error', value: v(se) },
      { label: 'Half-width', value: v(margin) },
      { label: 'Interval width', value: v(2 * margin) },
    ];
    if (method === 'ci-large' || method === 'ci-summary')
      notes.push(
        'Lecture convention: z with estimated s for n≥30. This is a large-sample approximation.',
      );
  } else if (isSize) {
    const sd = positive(values, 'sd', 'standard deviation'),
      error = positive(values, 'error', 'target half-width'),
      c = confidence(values),
      alpha = 1 - c;
    const strict = values.strict === 'true';
    let required: number;
    let critical = normalQuantile(1 - alpha / 2);
    let raw = ((critical * sd) / error) ** 2;
    if (method === 'size-t') {
      needNormal(values);
      required = 0;
      for (let n = 2; n < 30; n++) {
        if (
          strict
            ? (tQuantile(1 - alpha / 2, n - 1) * sd) / Math.sqrt(n) < error
            : (tQuantile(1 - alpha / 2, n - 1) * sd) / Math.sqrt(n) <= error
        ) {
          required = n;
          break;
        }
      }
      if (!required)
        throw new ValidationError(
          'error',
          'No sample size from 2 to 29 meets this error target with the small-sample t method. Use the large-sample planning method.',
        );
      critical = tQuantile(1 - alpha / 2, required - 1);
      raw = required;
    } else {
      required = strict ? Math.floor(raw) + 1 : Math.ceil(raw);
      if (method === 'size-large') required = Math.max(30, required);
      if (method === 'size-known' && required < 30) needNormal(values);
    }
    if (required > 10000000)
      throw new ValidationError(
        'error',
        'This target requires more than 10,000,000 observations. Choose a larger error bound.',
      );
    const achieved = (critical * sd) / Math.sqrt(required);
    value = required;
    title = 'Required sample size';
    given = `${method === 'size-known' ? 'σ' : 'planning s'}=${v(sd)}, target e=${v(error)}, confidence=${v(c * 100)}%`;
    formula =
      method === 'size-t'
        ? 't_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}\\leq e'
        : 'n\\geq\\left(\\frac{z_{\\alpha/2}s}{e}\\right)^2';
    if (method === 'size-known') formula = formula.replace('s}{e}', '\\sigma}{e}');
    answer = `${required} observations`;
    answerTex = `n=${required}`;
    steps = [
      step(
        'Choose a planning method',
        method === 'size-t'
          ? 'For an approximately normal population and n<30, the critical t value changes with n. Search the permitted integer sample sizes.'
          : method === 'size-large'
            ? 'Use a planning estimate s and the lecture’s large-sample z method, with n≥30.'
            : 'Use the known population standard deviation and a z critical value.',
        formula,
      ),
      step(
        'Find the critical value',
        `α=${v(alpha)} and α/2=${v(alpha / 2)}.`,
        `${method === 'size-t' ? 't_{\\alpha/2,n-1}' : 'z_{\\alpha/2}'}=${v(critical)}`,
      ),
      step(
        'Solve the error inequality',
        method === 'size-t'
          ? 'Test n=2,…,29 and choose the first size that meets the target.'
          : 'Square the ratio of critical value times spread to target error.',
        method === 'size-t'
          ? `e(${required})=${v(critical)}\\frac{${v(sd)}}{\\sqrt{${required}}}=${v(achieved)}`
          : `\\left(\\frac{${v(critical)}\\times${v(sd)}}{${v(error)}}\\right)^2=${v(raw)}`,
      ),
      step(
        'Select an integer size',
        strict
          ? 'The requested error is strictly less than the target, so the next integer is used when the bound is exactly integral.'
          : 'Round up; rounding down could fail the requested precision.',
        answerTex,
      ),
      step(
        'Verify the achieved half-width',
        'Substitute the selected sample size back into the original half-width expression.',
        `e=\\frac{${v(critical)}\\times${v(sd)}}{\\sqrt{${required}}}=${v(achieved)}${strict ? '<' : '\\leq'}${v(error)}`,
      ),
    ];
    interpretation = `Plan for at least ${required} independent observations under the stated assumptions. The achieved confidence half-width is ${v(achieved)}.`;
    metrics = [
      { label: 'Achieved half-width', value: v(achieved) },
      { label: 'Critical value', value: v(critical) },
      { label: 'Target half-width', value: v(error) },
    ];
    notes.push(
      'L4 p14 calls confidence half-width “standard error”. Sampling SE alone is spread/√n. A planning s is an estimate; future spread can differ.',
    );
  } else if (method === 'proportion-moments') {
    const p = num(values, 'p', 'population proportion'),
      n = integer(values, 'n', 1, 'sample size');
    if (p < 0 || p > 1)
      throw new ValidationError('p', 'Population proportion must be between 0 and 1.');
    const variance = (p * (1 - p)) / n,
      se = Math.sqrt(variance);
    value = se;
    given = `P=${v(p)}, n=${n}`;
    title = 'Sampling proportion mean & spread';
    formula = 'E(\\hat P)=P,\\quad V(\\hat P)=\\frac{P(1-P)}{n}';
    answer = `Mean ${v(p)} · SE ${v(se)}`;
    answerTex = `E(\\hat P)=${v(p)},\\quad SE=${v(se)}`;
    steps = [
      step(
        'Identify the statistic',
        'The sample proportion is the count with the characteristic divided by the sample size.',
        `\\hat P=\\frac{X}{n}`,
      ),
      step(
        'Find the expected proportion',
        'The expected sample proportion equals the population proportion.',
        `E(\\hat P)=P=${v(p)}`,
      ),
      step(
        'Calculate the sampling variance',
        'Multiply P by 1−P and divide by n.',
        `V(\\hat P)=\\frac{${v(p)}(1-${v(p)})}{${n}}=${v(variance)}`,
      ),
      step(
        'Take the square root',
        'Standard error is the standard deviation of this sampling distribution.',
        `SE=\\sqrt{${v(variance)}}=${v(se)}`,
      ),
    ];
    interpretation = `Sample proportions are centered on ${v(p)} and have standard deviation ${v(se)} across repeated independent samples of size ${n}.`;
    metrics = [
      { label: 'Mean', value: v(p) },
      { label: 'Variance', value: v(variance) },
      { label: 'Standard error', value: v(se) },
    ];
    if (n * p < 5 || n * (1 - p) < 5)
      notes.push(
        'Moments are valid, but the lecture’s normal approximation conditions are not met; no normal probability is calculated.',
      );
  } else if (method === 'inverse') {
    const mean = num(values, 'mu', 'population mean'),
      sd = positive(values, 'sd', 'standard deviation'),
      prob = num(values, 'prob', 'tail probability');
    if (prob < 0.000001 || prob > 0.999999)
      throw new ValidationError('prob', 'Probability must be between 0.000001 and 0.999999.');
    if (!['left', 'right'].includes(values.tail))
      throw new ValidationError('tail', 'Choose a lower or upper tail.');
    needNormal(values);
    const p = values.tail === 'right' ? 1 - prob : prob,
      z = normalQuantile(p),
      k = mean + sd * z;
    value = k;
    title = 'Unknown normal bound';
    given = `μ=${v(mean)}, σ=${v(sd)}, ${values.tail} tail=${v(prob)}`;
    formula = 'k=\\mu+\\sigma\\,\\varphi^{-1}(p)';
    answer = `k = ${v(k)}`;
    answerTex = `k=${v(mean)}+${v(sd)}\\times${texNumber(z)}=${v(k)}`;
    steps = [
      step(
        'Convert to a cumulative probability',
        'The normal table and inverse CDF use the area to the left.',
        `p=${values.tail === 'right' ? `1-${v(prob)}=` : ''}${v(p)}`,
      ),
      step(
        'Find the standard-normal quantile',
        'Find z such that φ(z)=p.',
        `z=\\varphi^{-1}(${v(p)})=${v(z)}`,
      ),
      step('Undo standardization', 'Multiply z by σ and add μ.', answerTex),
    ];
    interpretation = `For this normal distribution, P(X ${values.tail === 'right' ? '>' : '<'} ${v(k)})=${v(prob)}.`;
    curve = {
      family: 'normal',
      center: mean,
      scale: sd,
      df: 0,
      df2: 0,
      lower: values.tail === 'right' ? k : -Infinity,
      upper: values.tail === 'right' ? Infinity : k,
      axis: 'Observed value · X',
    };
    metrics = [
      { label: 'Critical z', value: v(z) },
      { label: 'Cumulative probability', value: v(p) },
    ];
  } else if (probabilityMethods.includes(method)) {
    const tail = values.tail;
    if (!['left', 'right', 'between'].includes(tail))
      throw new ValidationError('tail', 'Choose a probability region.');
    const a = num(values, 'a', 'bound'),
      b = tail === 'between' ? num(values, 'b', 'upper bound') : a;
    if (tail === 'between' && a >= b)
      throw new ValidationError('b', 'The upper bound must exceed the lower bound.');
    let center = 0,
      scale = 1,
      df = 0,
      df2 = 0;
    let family: Curve['family'] = 'normal';
    let cdf: (x: number) => number;
    let axis = 'Observed value · X';
    let label = 'X';
    let transformedA = a,
      transformedB = b;
    if (method === 'normal') {
      center = num(values, 'mu', 'mean');
      scale = positive(values, 'sd', 'standard deviation');
      needNormal(values);
      given = `μ=${v(center)}, σ=${v(scale)}`;
      formula = 'Z=\\frac{X-\\mu}{\\sigma}';
    } else if (method.startsWith('mean-')) {
      center = num(values, 'mu', 'population mean');
      const sd = positive(values, 'sd', 'standard deviation'),
        n = integer(values, 'n', method === 'mean-known' ? 1 : 2, 'sample size');
      scale = sd / Math.sqrt(n);
      if (method === 'mean-known' && n < 30) needNormal(values);
      if (method === 'mean-large' && n < 30)
        throw new ValidationError(
          'n',
          'The unknown-σ z approximation in the lecture requires n ≥ 30.',
        );
      if (method === 'mean-t') {
        if (n >= 30)
          throw new ValidationError('n', 'Use the lecture’s large-sample z method for n ≥ 30.');
        needNormal(values);
        family = 't';
        df = n - 1;
      }
      given = `μ=${v(center)}, ${method === 'mean-known' ? 'σ' : 's'}=${v(sd)}, n=${n}`;
      formula = `${family === 't' ? 'T' : 'Z'}=\\frac{\\bar X-\\mu}{${method === 'mean-known' ? '\\sigma' : 's'}/\\sqrt n}`;
      axis = 'Sample mean · x̄';
      label = '\\bar X';
      steps.push(
        step(
          'Calculate the sampling standard error',
          'A probability about the sample mean uses spread/√n, rather than the spread of an individual observation.',
          `SE=\\frac{${v(sd)}}{\\sqrt{${n}}}=${v(scale)}`,
        ),
      );
      if (method === 'mean-large')
        notes.push('The lecture uses s in a large-sample z approximation.');
    } else if (method === 't') {
      df = integer(values, 'df', 1, 'degrees of freedom');
      family = 't';
      given = `df=${df}`;
      formula = 'P(T>a)=1-F_{t,\\nu}(a)';
      axis = 't statistic · T';
      label = 'T';
    } else if (method === 'chi') {
      df = integer(values, 'df', 1, 'degrees of freedom');
      family = 'chi';
      given = `df=${df}`;
      formula = '\\chi^2=\\sum_{i=1}^{k}Z_i^2';
      axis = 'Chi-square statistic';
      label = '\\chi^2';
      if (a < 0 || b < 0) throw new ValidationError('a', 'Chi-square bounds must be nonnegative.');
    } else if (method === 'f') {
      df = integer(values, 'df', 1, 'numerator degrees of freedom');
      df2 = integer(values, 'df2', 1, 'denominator degrees of freedom');
      family = 'f';
      given = `d₁=${df}, d₂=${df2}`;
      formula = 'F=\\frac{U_1/d_1}{U_2/d_2}';
      axis = 'F statistic';
      label = 'F';
      if (a < 0 || b < 0) throw new ValidationError('a', 'F bounds must be nonnegative.');
      metrics.push(
        { label: 'Distribution mean', value: df2 > 2 ? v(df2 / (df2 - 2)) : 'Undefined (d₂≤2)' },
        {
          label: 'Distribution variance',
          value:
            df2 > 4
              ? v((2 * df2 * df2 * (df + df2 - 2)) / (df * (df2 - 2) ** 2 * (df2 - 4)))
              : 'Undefined (d₂≤4)',
        },
      );
    } else if (method === 'variance') {
      const variance = positive(values, 'variance', 'population variance'),
        n = integer(values, 'n', 2, 'sample size');
      needNormal(values);
      df = n - 1;
      family = 'chi';
      scale = variance / df;
      if (a < 0 || b < 0)
        throw new ValidationError('a', 'Sample variance bounds must be nonnegative.');
      given = `σ²=${v(variance)}, n=${n}`;
      formula = '\\chi^2=\\frac{(n-1)s^2}{\\sigma^2}';
      axis = 'Sample variance · s²';
      label = 's^2';
      metrics.push(
        { label: 'E(s²)', value: v(variance) },
        { label: 'V(s²)', value: v((2 * variance * variance) / df) },
      );
    } else if (method === 'proportion') {
      const p = num(values, 'p', 'population proportion'),
        n = integer(values, 'n', 1, 'sample size');
      if (p <= 0 || p >= 1)
        throw new ValidationError(
          'p',
          'For a normal probability, the population proportion must be strictly between 0 and 1.',
        );
      if (a < 0 || a > 1 || b < 0 || b > 1)
        throw new ValidationError('a', 'Proportion bounds must lie between 0 and 1.');
      if (n * p < 5 || n * (1 - p) < 5)
        throw new ValidationError(
          'n',
          `Normal approximation requires np ≥ 5 and n(1−p) ≥ 5. Current values: ${v(n * p)} and ${v(n * (1 - p))}.`,
        );
      center = p;
      scale = Math.sqrt((p * (1 - p)) / n);
      given = `P=${v(p)}, n=${n}`;
      formula = 'Z=\\frac{\\hat P-P}{\\sqrt{P(1-P)/n}}';
      axis = 'Sample proportion · P̂';
      label = '\\hat P';
      steps.push(
        step(
          'Check the normal approximation',
          'Both expected counts must be at least five under the lecture rule.',
          `nP=${v(n * p)}\\geq5,\\quad n(1-P)=${v(n * (1 - p))}\\geq5`,
        ),
        step(
          'Calculate the standard error',
          'The standard deviation of the sample proportion is the square root of its variance.',
          `SE=\\sqrt{\\frac{${v(p)}(1-${v(p)})}{${n}}}=${v(scale)}`,
        ),
      );
      notes.push(
        'Lecture method: normal approximation without continuity or finite-population correction.',
      );
    } else throw new Error('Unsupported probability method.');
    if (family === 'normal' || method.startsWith('mean-')) {
      transformedA = (a - center) / scale;
      transformedB = (b - center) / scale;
      cdf = (x) =>
        family === 't' ? tCDF((x - center) / scale, df) : normalCDF((x - center) / scale);
    } else if (family === 't') cdf = (x) => tCDF(x, df);
    else if (family === 'chi') {
      transformedA = a / scale;
      transformedB = b / scale;
      cdf = (x) => chiCDF(x / scale, df);
    } else cdf = (x) => fCDF(x, df, df2);
    const fa = cdf(a),
      fb = cdf(b);
    value = Math.max(0, Math.min(1, tail === 'left' ? fa : tail === 'right' ? 1 - fa : fb - fa));
    title = 'Probability';
    answer = `${v(value)} · ${v(value * 100, 4)}%`;
    const event =
      tail === 'between'
        ? `${v(a)}<${label}<${v(b)}`
        : `${label}${tail === 'left' ? '<' : '>'}${v(a)}`;
    answerTex = `P(${event})=${v(value)}`;
    given += `, ${tail === 'between' ? `bounds=[${v(a)},${v(b)}]` : `bound=${v(a)}`}`;
    const stat = family === 'chi' ? '\\chi^2' : family === 'f' ? 'F' : family === 't' ? 'T' : 'Z';
    steps.unshift(
      step(
        'Choose the distribution',
        method === 'variance'
          ? 'Normal-population sample variance transforms to chi-square with n−1 degrees of freedom.'
          : family === 't'
            ? 'Use Student t with the given or calculated degrees of freedom.'
            : family === 'f'
              ? 'Use the ordered numerator and denominator degrees of freedom for the F distribution.'
              : family === 'chi'
                ? 'Use chi-square with the given degrees of freedom.'
                : method === 'proportion'
                  ? 'The expected-count checks permit the lecture’s normal approximation.'
                  : 'Use a normal distribution under the stated population and sampling assumptions.',
        formula,
      ),
    );
    if (method === 'normal' || method.startsWith('mean-') || method === 'proportion')
      steps.push(
        step(
          'Standardize the bound' + (tail === 'between' ? 's' : ''),
          'Subtract the center and divide by the relevant standard deviation or sampling standard error.',
          `${stat}_a=\\frac{${v(a)}-${texNumber(center)}}{${v(scale)}}=${v(transformedA)}${tail === 'between' ? `,\\quad ${stat}_b=\\frac{${v(b)}-${texNumber(center)}}{${v(scale)}}=${v(transformedB)}` : ''}`,
        ),
      );
    if (method === 'variance')
      steps.push(
        step(
          'Transform sample variance bounds',
          'Multiply by n−1 and divide by σ².',
          `\\chi^2_a=${v(a)}/${v(scale)}=${v(transformedA)}${tail === 'between' ? `,\\quad\\chi^2_b=${v(b)}/${v(scale)}=${v(transformedB)}` : ''}`,
        ),
      );
    const cumulativeLabel = family === 'normal' ? '\\varphi' : 'F';
    steps.push(
      step(
        'Evaluate cumulative probabilities',
        'The CDF gives the area to the left. Use the lecture table or a numerical distribution function.',
        `${cumulativeLabel}(${v(transformedA)})=${v(fa)}${tail === 'between' ? `,\\quad ${cumulativeLabel}(${v(transformedB)})=${v(fb)}` : ''}`,
      ),
      step(
        'Select the requested region',
        tail === 'left'
          ? 'The lower-tail area is the CDF at the bound.'
          : tail === 'right'
            ? 'Subtract the lower-tail area from one.'
            : 'Subtract the lower cumulative probability from the upper cumulative probability.',
        `P(${event})=${tail === 'left' ? v(fa) : tail === 'right' ? `1-${v(fa)}` : `${v(fb)}-${v(fa)}`}=${v(value)}`,
      ),
    );
    interpretation = `Under the stated model, approximately ${v(value * 100, 4)}% of ${method.startsWith('mean-') ? 'sample means' : method === 'variance' ? 'sample variances' : method === 'proportion' ? 'sample proportions' : 'values'} fall ${tail === 'left' ? `below ${v(a)}` : tail === 'right' ? `above ${v(a)}` : `between ${v(a)} and ${v(b)}`}.`;
    if (values.count && values.count.trim() !== '') {
      const count = integer(values, 'count', 1, 'population count');
      steps.push(
        step(
          'Find an expected count',
          'Multiply the probability by the total number of individuals. This is an expected count, not a guaranteed observed count.',
          `E(\\mathrm{count})=${v(value)}\\times${count}=${v(value * count)}\\approx${Math.round(value * count)}`,
        ),
      );
      metrics.push({ label: 'Expected count (rounded)', value: String(Math.round(value * count)) });
    }
    curve = {
      family,
      center,
      scale,
      df,
      df2,
      lower: tail === 'right' || tail === 'between' ? a : -Infinity,
      upper: tail === 'left' ? a : tail === 'between' ? b : Infinity,
      axis,
    };
    if (method.startsWith('mean-') && family === 't')
      curve.domain = [center - 4 * scale, center + 4 * scale];
    metrics.unshift(
      { label: 'Probability', value: v(value) },
      { label: 'Percentage', value: `${v(value * 100, 4)}%` },
    );
    if (df)
      metrics.push({ label: 'Degrees of freedom', value: df2 ? `${df}, ${df2}` : String(df) });
    if (method.startsWith('mean-') || method === 'proportion')
      metrics.push({ label: 'Standard error', value: v(scale) });
  } else throw new Error(`Unsupported method: ${method}`);
  if (
    !Number.isFinite(value) ||
    steps.some((s) => s.tex?.includes('NaN') || s.tex?.includes('Infinity'))
  )
    throw new ValidationError(
      'result',
      'These inputs exceed the supported numerical range. Try less extreme values.',
    );
  if (normalityMethods.includes(method) && values.normal === 'true')
    notes.push('Population normality was confirmed for this calculation.');
  return {
    title,
    given,
    formula,
    steps,
    answer,
    answerTex,
    interpretation,
    value,
    metrics,
    curve,
    interval,
    notes,
  };
}
