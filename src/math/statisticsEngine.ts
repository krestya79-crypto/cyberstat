import { jStat } from 'jstat';
import { calculate, format, ValidationError } from './engine';
import { normalCDF, normalQuantile, tCDF, tQuantile, chiCDF } from './distributions';
import { getFormula } from '../content/statistics';
import type { Values, Step } from '../types';
import type { StatisticalSolution, StatisticalPlot } from './statisticsTypes';

const f = (n: number) => format(n);
const t = (n: number) => (n < 0 ? `(${f(n)})` : f(n));
const step = (title: string, text: string, tex?: string): Step => ({ title, text, tex });
export function parseData(raw: string, key = 'data'): number[] {
  const parts = raw
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (!parts.length) throw new ValidationError(key, 'Enter at least one numerical observation.');
  if (parts.length > 2000)
    throw new ValidationError(key, 'Use no more than 2,000 observations per data set.');
  return parts.map((part, i) => {
    if (
      !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(part) ||
      !Number.isFinite(Number(part)) ||
      Math.abs(Number(part)) > 1e12
    )
      throw new ValidationError(
        key,
        `Observation ${i + 1} must be a finite decimal number with magnitude at most 1 trillion.`,
      );
    return Number(part);
  });
}
function number(v: Values, key: string): number {
  if (
    v[key] === undefined ||
    v[key].trim() === '' ||
    !Number.isFinite(Number(v[key])) ||
    Math.abs(Number(v[key])) > 1e12
  )
    throw new ValidationError(key, `Enter a finite number for ${key}.`);
  return Number(v[key]);
}
function positive(v: Values, key: string): number {
  const x = number(v, key);
  if (x <= 0) throw new ValidationError(key, `${key} must be greater than zero.`);
  return x;
}
function integer(v: Values, key: string, min = 0, max = 10000000): number {
  const x = number(v, key);
  if (!Number.isInteger(x) || x < min || x > max)
    throw new ValidationError(key, `${key} must be an integer from ${min} to ${max}.`);
  return x;
}
function probability(v: Values, key: string, strict = false): number {
  const x = number(v, key);
  if (strict ? x <= 0 || x >= 1 : x < 0 || x > 1)
    throw new ValidationError(key, `${key} must be ${strict ? 'strictly ' : ''}between 0 and 1.`);
  return x;
}
function total(data: number[]): number {
  let result = 0,
    correction = 0;
  for (const value of data) {
    const y = value - correction,
      z = result + y;
    correction = z - result - y;
    result = z;
  }
  return result;
}
export const average = (data: number[]) => total(data) / data.length;
function median(sorted: number[]): number {
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
}
export function descriptiveData(data: number[]) {
  const sorted = [...data].sort((a, b) => a - b),
    n = data.length,
    mean = average(data),
    sum = total(data),
    ss = total(data.map((x) => (x - mean) ** 2)),
    mid = Math.floor(n / 2);
  const q1 = n === 1 ? sorted[0] : median(sorted.slice(0, mid)),
    q3 = n === 1 ? sorted[0] : median(sorted.slice(n % 2 ? mid + 1 : mid));
  const iqr = q3 - q1,
    whiskerLow = sorted.find((x) => x >= q1 - 1.5 * iqr)!,
    whiskerHigh = [...sorted].reverse().find((x) => x <= q3 + 1.5 * iqr)!;
  const binCount = sorted[0] === sorted[n - 1] ? 1 : Math.min(20, Math.ceil(Math.log2(n) + 1));
  const lo = binCount === 1 ? sorted[0] - 0.5 : sorted[0],
    hi = binCount === 1 ? sorted[0] + 0.5 : sorted[n - 1],
    width = (hi - lo) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    low: lo + i * width,
    high: lo + (i + 1) * width,
    count: 0,
  }));
  data.forEach(
    (x) => bins[Math.max(0, Math.min(binCount - 1, Math.floor((x - lo) / width)))].count++,
  );
  return {
    n,
    mean,
    sum,
    ss,
    sorted,
    median: median(sorted),
    q1,
    q3,
    whiskerLow,
    whiskerHigh,
    bins,
  };
}
const normalCurve = (center = 0, scale = 1) => ({
  family: 'normal' as const,
  center,
  scale,
  df: 0,
  df2: 0,
  lower: -Infinity,
  upper: Infinity,
  axis: 'Standardized value',
});
function inherited(id: string, v: Values): StatisticalSolution {
  const meta = getFormula(id)!,
    solution: StatisticalSolution = calculate(meta.legacy!, v);
  if (!solution.curve && !solution.interval) {
    if (id === 'proportion-moments') {
      const p = number(v, 'p'),
        n = integer(v, 'n', 1),
        se = Math.sqrt((p * (1 - p)) / n);
      if (n * p >= 5 && n * (1 - p) >= 5)
        solution.curve = {
          ...normalCurve(p, se),
          axis: 'Sample proportion',
          lower: p - se,
          upper: p + se,
        };
      else
        solution.plot = {
          kind: 'bars',
          labels: ['Mean proportion', 'Standard error'],
          values: [p, se],
          yLabel: 'Proportion units',
          caption:
            'Actual sampling moments. No normal curve is assumed because its expected-count conditions are not met.',
        };
    } else if (id.startsWith('size-')) {
      const sd = positive(v, 'sd'),
        n = solution.value,
        conf = number(v, 'confidence') / 100,
        error = positive(v, 'error');
      const ns =
        id === 'size-t'
          ? Array.from({ length: 28 }, (_, i) => i + 2)
          : [
              ...new Set([
                Math.max(id === 'size-large' ? 30 : 1, Math.floor(n / 4)),
                Math.max(id === 'size-large' ? 30 : 1, Math.floor(n / 2)),
                n,
                Math.ceil(n * 1.5),
                n * 2,
              ]),
            ].sort((a, b) => a - b);
      const half = (size: number) =>
        ((id === 'size-t' ? tQuantile((1 + conf) / 2, size - 1) : normalQuantile((1 + conf) / 2)) *
          sd) /
        Math.sqrt(size);
      solution.plot = {
        kind: 'line',
        points: ns.map((x) => ({ x, y: half(x) })),
        xLabel: 'Sample size · n',
        yLabel: 'Confidence half-width',
        caption:
          'Half-widths are recomputed from the selected statistical method and supplied spread.',
        target: error,
        observed: { x: n, y: half(n) },
      };
    } else
      solution.graphReason =
        'This calculation produces a scalar without an identified distribution or data set to plot.';
  }
  return solution;
}
export function solveStatistics(id: string, v: Values): StatisticalSolution {
  const meta = getFormula(id);
  if (!meta) throw new ValidationError('formula', 'Choose a supported statistical formula.');
  if (meta.legacy) return inherited(id, v);
  let value = 0,
    title = meta.name,
    answerTex = '',
    interpretation = '',
    given = '',
    steps: Step[] = [],
    plot: StatisticalPlot | undefined;
  let curve: StatisticalSolution['curve'];
  let metrics: StatisticalSolution['metrics'] = [];
  const notes: string[] = [];
  let substitutionTex = '',
    quickInterpretation = '',
    unit: string | undefined;
  const workingTables: NonNullable<StatisticalSolution['workingTables']> = [];
  if (meta.category === 'descriptive') {
    const data = parseData(v.data ?? ''),
      s = descriptiveData(data),
      sample = id === 'sample-variance' || id === 'sample-sd';
    if (sample && s.n < 2)
      throw new ValidationError(
        'data',
        'Sample variance and standard deviation require at least two observations.',
      );
    const variance = s.ss / (sample ? s.n - 1 : s.n),
      sd = Math.sqrt(variance);
    value =
      id === 'arithmetic-mean'
        ? s.mean
        : id === 'median'
          ? s.median
          : id.endsWith('variance')
            ? variance
            : sd;
    substitutionTex =
      id === 'arithmetic-mean'
        ? `\\bar x=\\frac{${data.length <= 8 ? data.map(t).join('+') : `\\sum_{i=1}^{${s.n}}x_i`}}{${s.n}}${data.length > 8 ? `=\\frac{${f(s.sum)}}{${s.n}}` : ''}`
        : id === 'median'
          ? `\\widetilde x=${s.n % 2 ? f(s.sorted[Math.floor(s.n / 2)]) : `\\frac{${t(s.sorted[s.n / 2 - 1])}+${t(s.sorted[s.n / 2])}}{2}`}`
          : `${id.endsWith('-sd') ? '\\sqrt{' : ''}\\frac{${s.n <= 8 ? data.map((x) => `(${f(x)}-${t(s.mean)})^2`).join('+') : f(s.ss)}}{${sample ? `${s.n}-1` : s.n}}${id.endsWith('-sd') ? '}' : ''}`;
    quickInterpretation =
      id === 'arithmetic-mean'
        ? `The ${s.n} observations have mean ${f(value)}.`
        : id === 'median'
          ? `The ordered data have median ${f(value)}.`
          : `The ${sample ? 'sample' : 'population'} ${id.endsWith('variance') ? 'variance' : 'standard deviation'} is ${f(value)}.`;
    unit = id.endsWith('variance')
      ? 'Squared units of the observations'
      : 'Same units as the observations';
    workingTables.push(
      id === 'median'
        ? {
            title: 'Ordered observations',
            explanation:
              'Sort every actual observation, retaining duplicates. Positions are one-based; the middle position or middle pair determines the median.',
            headers: ['Ordered position', 'Observed value'],
            rows: s.sorted.map((x, i) => [i + 1, x]),
          }
        : id === 'arithmetic-mean'
          ? {
              title: 'Observation total',
              explanation:
                'Sum the supplied observations, then divide that total by the number of observations. No unobserved values are introduced.',
              headers: ['i', 'xᵢ'],
              rows: [...data.map((x, i) => [i + 1, x]), ['Total', s.sum]],
            }
          : {
              title: 'Observation-by-observation working',
              explanation:
                'The total of x is used for the mean. Variance and standard deviation use the sum of the squared deviations shown here, with n−1 for a sample and n for a population.',
              headers: ['i', 'xᵢ', 'xᵢ − mean', '(xᵢ − mean)²'],
              rows: data.map((x, i) => [i + 1, x, x - s.mean, (x - s.mean) ** 2]),
            },
    );
    answerTex = `${id === 'arithmetic-mean' ? '\\bar x' : id === 'median' ? '\\widetilde x' : id === 'sample-variance' ? 's^2' : id === 'population-variance' ? '\\sigma^2' : id === 'sample-sd' ? 's' : '\\sigma'}=${f(value)}`;
    given = `n=${s.n}; observations: ${data.map(f).join(', ')}`;
    steps = [
      step(
        'Count and total the observations',
        'Every supplied observation contributes to n and the sum.',
        `n=${s.n},\\quad\\sum x_i=${f(s.sum)}`,
      ),
      step(
        'Calculate the arithmetic mean',
        'Divide the sum by the number of observations.',
        `\\bar x=\\frac{${f(s.sum)}}{${s.n}}=${f(s.mean)}`,
      ),
    ];
    if (id === 'median')
      steps.push(
        step(
          'Order the observations',
          'For odd n use the middle value; for even n average the two middle values.',
          `\\widetilde x=${f(s.median)}`,
        ),
        step(
          'Calculate the quartiles',
          'Take the medians of the lower and upper halves, excluding the central observation for odd n.',
          `Q_1=${f(s.q1)},\\quad Q_3=${f(s.q3)},\\quad IQR=${f(s.q3 - s.q1)}`,
        ),
      );
    else if (id !== 'arithmetic-mean')
      steps.push(
        step(
          'Compute squared deviations',
          'Subtract the mean from each observation, square each deviation, then sum.',
          `SS=\\sum_{i=1}^{${s.n}}(x_i-${t(s.mean)})^2=${f(s.ss)}`,
        ),
        step(
          'Use the appropriate denominator',
          sample
            ? 'Use n−1 for unbiased sample variance.'
            : 'Use N because the supplied values are treated as the complete population.',
          `${sample ? 's^2' : '\\sigma^2'}=\\frac{${f(s.ss)}}{${sample ? s.n - 1 : s.n}}=${f(variance)}`,
        ),
      );
    if (id.endsWith('-sd'))
      steps.push(
        step(
          'Take the square root',
          'Standard deviation is in the original units, whereas variance is in squared units.',
          `${sample ? 's' : '\\sigma'}=\\sqrt{${f(variance)}}=${f(sd)}`,
        ),
      );
    steps.push(
      step(
        'State the requested statistic',
        id.includes('variance')
          ? 'Interpret this value in squared data units.'
          : 'Interpret this value in the original data units.',
        answerTex,
      ),
    );
    interpretation =
      id === 'arithmetic-mean'
        ? `The ${s.n} observations have arithmetic mean ${f(value)}.`
        : id === 'median'
          ? `Half the ordered observations lie on each side of the median ${f(value)}, allowing ties.`
          : `The ${sample ? 'sample' : 'population'} ${id.endsWith('variance') ? 'variance' : 'standard deviation'} is ${f(value)}${id.endsWith('variance') ? ' in squared data units' : ''}.`;
    interpretation += ` The observed values range from ${f(s.sorted[0])} to ${f(s.sorted[s.n - 1])}; the median is ${f(s.median)} and the middle half is bounded by Q₁=${f(s.q1)} and Q₃=${f(s.q3)} under the stated quartile convention.`;
    plot = {
      kind: 'descriptive',
      data,
      mean: s.mean,
      median: s.median,
      q1: s.q1,
      q3: s.q3,
      whiskerLow: s.whiskerLow,
      whiskerHigh: s.whiskerHigh,
      bins: s.bins,
    };
    metrics = [
      { label: 'Observations', value: String(s.n) },
      { label: 'Mean', value: f(s.mean) },
      { label: 'Median', value: f(s.median) },
      { label: 'Minimum / maximum', value: `${f(Math.min(...data))} / ${f(Math.max(...data))}` },
    ];
    notes.push(
      'Histogram frequencies count the actual observations. Box-plot whiskers stop at the most extreme observations within 1.5×IQR; points beyond them are outliers.',
    );
  } else if (meta.category === 'probability') {
    if (id === 'classical-probability') {
      const m = integer(v, 'favorable'),
        n = integer(v, 'total', 1);
      if (m > n)
        throw new ValidationError('favorable', 'Favorable outcomes cannot exceed total outcomes.');
      value = m / n;
      given = `m=${m}, N=${n}`;
      answerTex = `P(A)=\\frac{${m}}{${n}}=${f(value)}`;
      substitutionTex = `P(A)=\\frac{${m}}{${n}}`;
      steps = [
        step(
          'Count equally likely outcomes',
          'Divide the favorable count by the total count.',
          answerTex,
        ),
      ];
      plot = {
        kind: 'bars',
        labels: ['A', 'Not A'],
        values: [value, 1 - value],
        yLabel: 'Probability',
        caption: 'The two complementary events exhaust the equally likely outcomes.',
      };
    } else if (id === 'event-union' || id === 'independent-events') {
      const a = probability(v, 'pa'),
        b = probability(v, 'pb'),
        joint = id === 'independent-events' ? a * b : probability(v, 'joint');
      if (joint > Math.min(a, b) + 1e-12 || joint < Math.max(0, a + b - 1) - 1e-12)
        throw new ValidationError(
          'joint',
          'The joint probability must lie between max(0, P(A)+P(B)−1) and min(P(A),P(B)).',
        );
      value = id === 'event-union' ? a + b - joint : joint;
      given = `P(A)=${f(a)}, P(B)=${f(b)}, P(A∩B)=${f(joint)}`;
      answerTex =
        id === 'event-union'
          ? `P(A\\cup B)=${f(a)}+${f(b)}-${f(joint)}=${f(value)}`
          : `P(A\\cap B)=${f(a)}\\times${f(b)}=${f(value)}`;
      substitutionTex =
        id === 'event-union'
          ? `P(A\\cup B)=${f(a)}+${f(b)}-${f(joint)}`
          : `P(A\\cap B)=${f(a)}\\times${f(b)}`;
      steps = [
        step(
          'Identify the event relationship',
          id === 'independent-events'
            ? 'Independence permits multiplying the marginal probabilities.'
            : 'Subtract the overlap once so it is not counted twice.',
          answerTex,
        ),
      ];
      plot = {
        kind: 'bars',
        labels: ['A only', 'A and B', 'B only', 'Neither'],
        values: [
          Math.max(0, a - joint),
          joint,
          Math.max(0, b - joint),
          Math.max(0, 1 - a - b + joint),
        ],
        yLabel: 'Probability',
        caption:
          'These four disjoint regions sum to one. They are derived from the supplied event probabilities.',
      };
    } else if (id === 'conditional-probability') {
      const joint = probability(v, 'joint'),
        b = probability(v, 'pb');
      if (b === 0)
        throw new ValidationError('pb', 'The conditioning event must have positive probability.');
      if (joint > b) throw new ValidationError('joint', 'P(A∩B) cannot exceed P(B).');
      value = joint / b;
      given = `P(A∩B)=${f(joint)}, P(B)=${f(b)}`;
      answerTex = `P(A\\mid B)=\\frac{${f(joint)}}{${f(b)}}=${f(value)}`;
      substitutionTex = `P(A\\mid B)=\\frac{${f(joint)}}{${f(b)}}`;
      steps = [
        step(
          'Restrict the sample space to B',
          'Divide the joint probability by the probability of the conditioning event.',
          answerTex,
        ),
      ];
      plot = {
        kind: 'bars',
        labels: ['A within B', 'Not A within B'],
        values: [value, 1 - value],
        yLabel: 'Conditional probability',
        caption: 'The chart represents the conditional sample space B, not the entire population.',
      };
    } else {
      const a = probability(v, 'pa'),
        ba = probability(v, 'givenA'),
        bn = probability(v, 'givenNotA'),
        joint = a * ba,
        other = (1 - a) * bn;
      value = joint + other;
      given = `P(A)=${f(a)}, P(B|A)=${f(ba)}, P(B|Aᶜ)=${f(bn)}`;
      answerTex = `P(B)=${f(joint)}+${f(other)}=${f(value)}`;
      substitutionTex = `P(B)=${f(a)}\\times${f(ba)}+(1-${f(a)})\\times${f(bn)}`;
      steps = [
        step(
          'Multiply along the first branch',
          'A and B occur together with probability P(A)P(B|A).',
          `P(A\\cap B)=${f(a)}\\times${f(ba)}=${f(joint)}`,
        ),
        step(
          'Multiply along the complementary branch',
          'Aᶜ and B occur together with probability P(Aᶜ)P(B|Aᶜ).',
          `P(A^c\\cap B)=(1-${f(a)})\\times${f(bn)}=${f(other)}`,
        ),
        step('Add the disjoint B branches', 'The partition A,Aᶜ is exhaustive.', answerTex),
      ];
      if (value > 0) {
        const posterior = joint / value;
        steps.push(
          step(
            'Apply Bayes rule',
            'Reverse the conditioning by dividing the joint probability by P(B).',
            `P(A\\mid B)=\\frac{${f(joint)}}{${f(value)}}=${f(posterior)}`,
          ),
        );
        metrics.push({ label: 'P(A | B)', value: f(posterior) });
      } else notes.push('P(B)=0, so the reverse conditional probability P(A|B) is undefined.');
      plot = {
        kind: 'tree',
        pa: a,
        givenA: ba,
        givenNotA: bn,
        leaves: [joint, a * (1 - ba), other, (1 - a) * (1 - bn)],
      };
    }
    interpretation = `The requested probability is ${f(value)} (${format(value * 100, 4)}%).`;
    quickInterpretation = `The requested event has probability ${format(value * 100, 4)}%.`;
    unit = 'Unitless probability';
    interpretation +=
      id === 'conditional-probability'
        ? ' This probability is relative to the conditioning event B rather than the whole sample space.'
        : id === 'independent-events'
          ? ' Multiplying the marginal probabilities is justified only under the supplied independence assumption.'
          : id === 'probability-tree'
            ? ' The two disjoint routes to B are added; the graph retains the actual branch probabilities.'
            : ' The graph partitions the supplied probability model into the labeled event regions.';
  } else if (id === 'z-score') {
    const x = number(v, 'x'),
      mu = number(v, 'mu'),
      sd = positive(v, 'sd');
    value = (x - mu) / sd;
    given = `x=${f(x)}, μ=${f(mu)}, σ=${f(sd)}`;
    answerTex = `z=\\frac{${f(x)}-${t(mu)}}{${f(sd)}}=${f(value)}`;
    substitutionTex = `z=\\frac{${f(x)}-${t(mu)}}{${f(sd)}}`;
    steps = [
      step(
        'Center the observation',
        'Subtract the population mean.',
        `x-\\mu=${f(x)}-${t(mu)}=${f(x - mu)}`,
      ),
      step('Scale by the standard deviation', 'Divide the centered observation by σ.', answerTex),
    ];
    interpretation = `The observation is ${f(Math.abs(value))} standard deviations ${value < 0 ? 'below' : 'above'} the mean.`;
    quickInterpretation = value === 0 ? 'The observation equals the mean.' : interpretation;
    unit = 'Standard deviations (dimensionless)';
    if (v.normal === 'true') {
      curve = { ...normalCurve(), upper: value };
      metrics = [
        { label: 'Normal-model percentile', value: `${format(normalCDF(value) * 100, 4)}%` },
      ];
      notes.push('The shaded area is the normal-model cumulative probability at this z-score.');
    } else
      plot = {
        kind: 'bars',
        labels: ['Observed z-score'],
        values: [value],
        yLabel: 'Standard deviations from mean',
        caption:
          'Standardization does not itself require normality. No normal-model probability is asserted.',
      };
  } else if (id === 'binomial' || id === 'poisson') {
    const binomial = id === 'binomial',
      n = binomial ? integer(v, 'n', 1, 200) : 0,
      p = binomial ? probability(v, 'p') : 0,
      lambda = binomial ? 0 : number(v, 'lambda'),
      k = integer(v, 'k', 0, binomial ? n : 1000);
    if (!binomial && (lambda < 0 || lambda > 200))
      throw new ValidationError('lambda', 'λ must be between 0 and 200.');
    if (!['exact', 'left', 'right'].includes(v.tail))
      throw new ValidationError('tail', 'Choose an exact or cumulative count probability.');
    const pmf = (x: number) =>
      binomial
        ? p === 0
          ? Number(x === 0)
          : p === 1
            ? Number(x === n)
            : jStat.binomial.pdf(x, n, p)
        : lambda === 0
          ? Number(x === 0)
          : jStat.poisson.pdf(x, lambda);
    const cdf = (x: number) =>
      x < 0
        ? 0
        : binomial
          ? p === 0
            ? 1
            : p === 1
              ? Number(x >= n)
              : jStat.binomial.cdf(x, n, p)
          : lambda === 0
            ? 1
            : jStat.poisson.cdf(x, lambda);
    value = Math.max(
      0,
      Math.min(1, v.tail === 'exact' ? pmf(k) : v.tail === 'left' ? cdf(k) : 1 - cdf(k - 1)),
    );
    const upper = binomial ? n : Math.ceil(lambda + 8 * Math.sqrt(lambda) + 10),
      points = Array.from({ length: upper + 1 }, (_, x) => ({
        x,
        y: pmf(x),
        selected: v.tail === 'exact' ? x === k : v.tail === 'left' ? x <= k : x >= k,
      }));
    const mean = binomial ? n * p : lambda,
      variance = binomial ? n * p * (1 - p) : lambda,
      event = `X${v.tail === 'exact' ? '=' : v.tail === 'left' ? '\\leq' : '\\geq'}${k}`;
    given = binomial ? `n=${n}, p=${f(p)}, k=${k}` : `λ=${f(lambda)}, k=${k}`;
    answerTex = `P(${event})=${f(value)}`;
    const massTerm = (index: string, complement: string) =>
      binomial
        ? `\\binom{${n}}{${index}}${t(p)}^{${index}}(1-${f(p)})^{${complement}}`
        : `e^{-${f(lambda)}}\\frac{${t(lambda)}^{${index}}}{${index}!}`;
    substitutionTex = `P(${event})=${v.tail === 'exact' ? massTerm(String(k), String(n - k)) : `\\sum_{j=${v.tail === 'left' ? 0 : k}}^{${v.tail === 'left' ? k : binomial ? n : '\\infty'}}${massTerm('j', `${n}-j`)}`}`;
    steps = [
      step(
        'Identify the discrete model',
        binomial
          ? 'A fixed number of independent constant-probability Bernoulli trials produces a binomial count.'
          : 'A constant rate and independent events produce a Poisson count.',
        meta.tex,
      ),
      step(
        'Substitute the parameters',
        'Evaluate the probability mass at the requested count.',
        binomial
          ? `P(X=${k})=\\binom{${n}}{${k}}${t(p)}^{${k}}(1-${f(p)})^{${n - k}}=${f(pmf(k))}`
          : `P(X=${k})=e^{-${f(lambda)}}\\frac{${t(lambda)}^{${k}}}{${k}!}=${f(pmf(k))}`,
      ),
      step(
        'Select the requested event',
        v.tail === 'right'
          ? 'For an inclusive upper tail, subtract P(X≤k−1) from one.'
          : v.tail === 'left'
            ? 'Sum the masses from zero through k.'
            : 'Use the mass at exactly k.',
        v.tail === 'exact'
          ? answerTex
          : v.tail === 'left'
            ? `P(X\\leq${k})=\\sum_{j=0}^{${k}}P(X=j)=${f(cdf(k))}`
            : `P(X\\geq${k})=1-P(X\\leq${k - 1})=1-${f(cdf(k - 1))}=${f(value)}`,
      ),
    ];
    interpretation = `Under the ${binomial ? 'binomial' : 'Poisson'} model, the event has probability ${f(value)} (${format(value * 100, 4)}%).`;
    quickInterpretation = `The requested count event has probability ${format(value * 100, 4)}%.`;
    unit = 'Unitless probability';
    interpretation += ` The modeled count has mean ${f(mean)} and variance ${f(variance)}; the selected bars identify the ${v.tail === 'exact' ? 'single count' : v.tail === 'left' ? 'inclusive lower tail' : 'inclusive upper tail'}.`;
    plot = {
      kind: 'discrete',
      points,
      caption: binomial
        ? 'Every binomial support value is plotted. Blue bars are the selected event.'
        : `The Poisson plot displays counts 0–${upper}; omitted upper-tail mass is ${f(Math.max(0, 1 - cdf(upper)))}. The probability calculation uses the full model${k > upper ? `; k=${k} is outside the displayed range` : ''}.`,
    };
    metrics = [
      { label: 'Model mean', value: f(mean) },
      { label: 'Model variance', value: f(variance) },
    ];
  } else if (id === 'standard-error') {
    const sd = positive(v, 'sd'),
      n = integer(v, 'n', 1);
    value = sd / Math.sqrt(n);
    given = `σ=${f(sd)}, n=${n}`;
    answerTex = `SE=\\frac{${f(sd)}}{\\sqrt{${n}}}=${f(value)}`;
    substitutionTex = `SE=\\frac{${f(sd)}}{\\sqrt{${n}}}`;
    quickInterpretation = `The sample mean has standard error ${f(value)}.`;
    unit = 'Same units as the observations';
    steps = [
      step(
        'Find the square root of sample size',
        'The standard error decreases with the square root of n.',
        `\\sqrt n=\\sqrt{${n}}=${f(Math.sqrt(n))}`,
      ),
      step(
        'Divide the population spread by √n',
        'Use the population SD, not its variance.',
        answerTex,
      ),
    ];
    interpretation = `The sample mean has standard deviation ${f(value)} across independent random samples of size ${n}.`;
    const ns = [
      ...new Set([
        1,
        Math.max(1, Math.floor(n / 4)),
        Math.max(1, Math.floor(n / 2)),
        n,
        n * 2,
        n * 4,
      ]),
    ].sort((a, b) => a - b);
    plot = {
      kind: 'line',
      points: ns.map((x) => ({ x, y: sd / Math.sqrt(x) })),
      xLabel: 'Sample size · n',
      yLabel: 'Standard error',
      caption: 'The curve is calculated from the supplied σ using SE=σ/√n.',
      observed: { x: n, y: value },
    };
  } else if (meta.category === 'testing') {
    const alpha = probability(v, 'alpha', true),
      chi = id === 'chi-square-test';
    let statistic: number,
      df = 0;
    let tail = v.tail as 'two' | 'left' | 'right';
    let counts: { observed: number[]; expected: number[] } | undefined;
    if (chi) {
      const observed = parseData(v.observed ?? '', 'observed'),
        expected = parseData(v.expected ?? '', 'expected');
      if (observed.length !== expected.length || observed.length < 2)
        throw new ValidationError(
          'expected',
          'Use at least two categories with matching observed and expected counts.',
        );
      if (observed.some((x) => x < 0 || !Number.isInteger(x)))
        throw new ValidationError('observed', 'Observed counts must be nonnegative integers.');
      if (expected.some((x) => x < 5))
        throw new ValidationError(
          'expected',
          'Every expected count must be at least 5 for this chi-square approximation.',
        );
      if (Math.abs(total(observed) - total(expected)) > 1e-8 * Math.max(1, total(observed)))
        throw new ValidationError(
          'expected',
          'Observed and expected counts must have matching totals.',
        );
      df = observed.length - 1 - integer(v, 'estimated', 0, observed.length - 2);
      statistic = total(observed.map((o, i) => (o - expected[i]) ** 2 / expected[i]));
      substitutionTex = `\\chi^2=${observed.length <= 8 ? observed.map((o, i) => `\\frac{(${o}-${t(expected[i])})^2}{${f(expected[i])}}`).join('+') : `\\sum_{i=1}^{${observed.length}}(O_i-E_i)^2/E_i=${f(statistic)}`}`;
      workingTables.push({
        title: 'Category contributions',
        explanation:
          'Every contribution uses the actual observed and expected counts; their sum is the chi-square statistic.',
        headers: ['Category', 'Observed O', 'Expected E', 'O − E', '(O − E)²', '(O − E)² / E'],
        rows: observed.map((o, i) => [
          i + 1,
          o,
          expected[i],
          o - expected[i],
          (o - expected[i]) ** 2,
          (o - expected[i]) ** 2 / expected[i],
        ]),
      });
      tail = 'right';
      given = `Observed: ${observed.join(', ')}; Expected: ${expected.join(', ')}; df=${df}; α=${f(alpha)}`;
      counts = { observed, expected };
      steps = [
        step(
          'Specify the null model',
          'H₀: the category probabilities match the specified model. H₁: at least one differs.',
        ),
        step(
          'Calculate each chi-square contribution',
          'Subtract expected from observed, square, divide by the expected count and sum.',
          `\\chi^2=${observed.map((o, i) => `\\frac{(${o}-${t(expected[i])})^2}{${f(expected[i])}}`).join('+')}=${f(statistic)}`,
        ),
        step(
          'Calculate degrees of freedom',
          'Subtract one and the number of parameters fitted from these same data.',
          `df=${observed.length}-1-${v.estimated}=${df}`,
        ),
      ];
    } else {
      if (!['two', 'left', 'right'].includes(tail))
        throw new ValidationError('tail', 'Choose the alternative hypothesis.');
      const n = integer(v, 'n', id === 'proportion-test' ? 1 : 2);
      let observed: number, nullValue: number, se: number, seTex: string, observedTex: string;
      if (id === 'proportion-test') {
        const x = integer(v, 'successes', 0, n),
          p0 = probability(v, 'p0', true);
        if (n * p0 < 5 || n * (1 - p0) < 5)
          throw new ValidationError(
            'n',
            'The null-model expected counts np₀ and n(1−p₀) must both be at least 5.',
          );
        observed = x / n;
        nullValue = p0;
        se = Math.sqrt((p0 * (1 - p0)) / n);
        seTex = `\\sqrt{${f(p0)}(1-${f(p0)})/${n}}`;
        observedTex = `(${x}/${n})`;
        given = `x=${x}, n=${n}, p₀=${f(p0)}, α=${f(alpha)}`;
        steps.push(
          step(
            'Calculate the sample proportion',
            'Divide observed successes by trial count.',
            `\\hat p=\\frac{${x}}{${n}}=${f(observed)}`,
          ),
          step(
            'Check the null-model expected counts',
            'Use p₀ to check the approximation and compute its standard error.',
            `np_0=${f(n * p0)},\\quad n(1-p_0)=${f(n * (1 - p0))}`,
          ),
        );
      } else {
        observed = number(v, 'xbar');
        nullValue = number(v, 'mu0');
        const sd = positive(v, 'sd');
        if (n < 30 && v.normal !== 'true')
          throw new ValidationError(
            'normal',
            'Confirm approximate population normality for a small-sample mean test.',
          );
        se = sd / Math.sqrt(n);
        seTex = `${f(sd)}/\\sqrt{${n}}`;
        observedTex = f(observed);
        given = `x̄=${f(observed)}, μ₀=${f(nullValue)}, ${id === 't-test' ? 's' : 'σ'}=${f(sd)}, n=${n}, α=${f(alpha)}`;
        if (id === 't-test') df = n - 1;
        if (v.normal !== 'true')
          notes.push(
            'Without confirmed population normality, this large-sample test uses an approximation.',
          );
      }
      statistic = (observed - nullValue) / se;
      if (id === 't-test')
        steps.push(
          step(
            'Calculate t degrees of freedom',
            'The estimated sample spread uses n−1 degrees of freedom.',
            `df=${n}-1=${df}`,
          ),
        );
      substitutionTex = `${id === 't-test' ? 't' : 'z'}=\\frac{${observedTex}-${t(nullValue)}}{${seTex}}`;
      const parameter = id === 'proportion-test' ? 'p' : '\\mu';
      steps.unshift(
        step(
          'State the hypotheses',
          'The alternative determines whether to use a left, right or two-sided p-value.',
          `H_0:${parameter}=${f(nullValue)},\\quad H_1:${parameter}${tail === 'two' ? '\\ne' : tail === 'left' ? '<' : '>'}${f(nullValue)}`,
        ),
      );
      steps.push(
        step(
          'Calculate the null-model standard error',
          'Use the spread appropriate to the selected test.',
          `SE=${seTex}=${f(se)}`,
        ),
        step(
          'Standardize the observed statistic',
          'Subtract the null value and divide by its standard error.',
          `${id === 't-test' ? 't' : 'z'}=\\frac{${f(observed)}-${t(nullValue)}}{${f(se)}}=${f(statistic)}`,
        ),
      );
    }
    const tTest = id === 't-test',
      cdf = (x: number) => (chi ? chiCDF(x, df) : tTest ? tCDF(x, df) : normalCDF(x)),
      quantile = (p: number) =>
        chi ? jStat.chisquare.inv(p, df) : tTest ? tQuantile(p, df) : normalQuantile(p);
    if (1 - (tail === 'two' ? alpha / 2 : alpha) === 1)
      throw new ValidationError(
        'alpha',
        'This significance level is beyond the supported numerical precision. Use a less extreme value.',
      );
    value = Math.max(
      0,
      Math.min(
        1,
        tail === 'two'
          ? 2 * (1 - cdf(Math.abs(statistic)))
          : tail === 'left'
            ? cdf(statistic)
            : 1 - cdf(statistic),
      ),
    );
    const low = tail === 'right' ? -Infinity : quantile(tail === 'two' ? alpha / 2 : alpha),
      high = tail === 'left' ? Infinity : quantile(tail === 'two' ? 1 - alpha / 2 : 1 - alpha),
      reject = value <= alpha;
    if ((tail !== 'right' && !Number.isFinite(low)) || (tail !== 'left' && !Number.isFinite(high)))
      throw new ValidationError(
        'alpha',
        'This significance level is beyond the supported numerical precision. Use a less extreme value.',
      );
    title = 'Hypothesis test';
    answerTex = `p=${f(value)},\\quad ${reject ? '\\text{Reject }H_0' : '\\text{Fail to reject }H_0'}`;
    const cdfName = chi ? `F_{\\chi^2_{${df}}}` : tTest ? `F_{t_{${df}}}` : '\\Phi';
    substitutionTex += `,\\quad p=${tail === 'two' ? `2[1-${cdfName}(${f(Math.abs(statistic))})]` : tail === 'left' ? `${cdfName}(${f(statistic)})` : `1-${cdfName}(${f(statistic)})`}`;
    quickInterpretation = `${reject ? 'Reject' : 'Fail to reject'} H₀ at α=${f(alpha)} for the selected alternative.`;
    unit = 'Unitless p-value';
    steps.push(
      step(
        'Evaluate the cumulative probability',
        `Use the ${chi ? `chi-square distribution with ${df} degrees of freedom` : tTest ? `t distribution with ${df} degrees of freedom` : 'standard normal distribution'} under H₀. The CDF is evaluated numerically.`,
        `${cdfName}(${f(tail === 'two' ? Math.abs(statistic) : statistic)})=${f(cdf(tail === 'two' ? Math.abs(statistic) : statistic))}`,
      ),
    );
    steps.push(
      step(
        'Evaluate the p-value',
        tail === 'two'
          ? 'Double the probability beyond the absolute statistic in one symmetric tail.'
          : tail === 'left'
            ? 'Use the cumulative probability at the observed statistic.'
            : 'Use the upper-tail probability at the observed statistic.',
        `p=${tail === 'two' ? `2[1-F(${f(Math.abs(statistic))})]` : tail === 'left' ? `F(${f(statistic)})` : `1-F(${f(statistic)})`}=${f(value)}`,
      ),
      step(
        'Compare with the chosen significance level',
        'Reject H₀ when p≤α; otherwise the evidence is insufficient to reject it.',
        `p=${f(value)}${reject ? '\\leq' : '>'}\\alpha=${f(alpha)}`,
      ),
    );
    steps.push(
      step(
        'Locate the critical region',
        'Critical values use the same null distribution and significance level as the p-value decision; the graph marks these thresholds.',
        `${tail === 'two' ? `c_L=${f(low)},\\quad c_U=${f(high)}` : tail === 'left' ? `c_L=${f(low)}` : `c_U=${f(high)}`}`,
      ),
    );
    interpretation = `${reject ? 'Reject' : 'Fail to reject'} H₀ at α=${f(alpha)}. ${reject ? 'The data provide evidence for the selected alternative under the stated model.' : 'The data do not provide sufficient evidence for the selected alternative; this does not prove H₀ true.'}`;
    metrics = [
      {
        label: chi ? 'Chi-square statistic' : tTest ? 't statistic' : 'z statistic',
        value: f(statistic),
      },
      { label: 'P-value', value: f(value) },
      { label: 'Significance α', value: f(alpha) },
      ...(df ? [{ label: 'Degrees of freedom', value: String(df) }] : []),
    ];
    plot = {
      kind: 'test',
      curve: chi
        ? {
            family: 'chi',
            center: 0,
            scale: 1,
            df,
            df2: 0,
            lower: statistic,
            upper: Infinity,
            axis: 'Chi-square statistic',
          }
        : tTest
          ? { ...normalCurve(), family: 't', df, axis: 't statistic' }
          : normalCurve(),
      statistic,
      pValue: value,
      alpha,
      tail,
      criticalLow: low,
      criticalHigh: high,
      symbol: chi ? 'χ²' : tTest ? 't' : 'z',
      counts,
    };
  } else if (meta.category === 'regression') {
    const xs = parseData(v.xs ?? '', 'xs'),
      ys = parseData(v.ys ?? '', 'ys');
    if (xs.length !== ys.length || xs.length < 2)
      throw new ValidationError(
        'ys',
        'Supply at least two complete pairs, with the same number of X and Y observations.',
      );
    const n = xs.length,
      mx = average(xs),
      my = average(ys),
      xx = total(xs.map((x) => (x - mx) ** 2)),
      yy = total(ys.map((y) => (y - my) ** 2)),
      xy = total(xs.map((x, i) => (x - mx) * (ys[i] - my)));
    if (xx === 0) throw new ValidationError('xs', 'The X values must have positive variation.');
    if (id === 'correlation' && yy === 0)
      throw new ValidationError(
        'ys',
        'Pearson correlation is undefined when all Y values are equal.',
      );
    const slope = xy / xx,
      intercept = my - slope * mx,
      r = yy > 0 ? Math.max(-1, Math.min(1, xy / Math.sqrt(xx * yy))) : undefined;
    value = id === 'correlation' ? r! : slope;
    substitutionTex =
      id === 'correlation'
        ? `r=\\frac{${f(xy)}}{\\sqrt{${f(xx)}\\times${f(yy)}}}`
        : `b_1=\\frac{${f(xy)}}{${f(xx)}},\\quad b_0=${f(my)}-${t(slope)}\\times${t(mx)}`;
    quickInterpretation =
      id === 'correlation'
        ? `Pearson r=${f(value)} describes the observed linear association.`
        : `Each one-unit increase in X changes fitted Y by ${f(slope)}.`;
    unit =
      id === 'correlation'
        ? 'Dimensionless correlation'
        : 'Slope: Y units per X unit; fitted values: Y units';
    workingTables.push({
      title: 'Paired calculations and residuals',
      explanation:
        'Preserve the supplied pairs. Sum the squared centered X and Y values and their cross-products to obtain Sxx, Syy and Sxy. Predictions and residuals use the fitted line from those same pairs.',
      headers: [
        'i',
        'X',
        'Y',
        'X − mean X',
        'Y − mean Y',
        '(X − mean X)²',
        '(Y − mean Y)²',
        'Cross-product',
        'Predicted Y',
        'Residual',
      ],
      rows: xs.map((x, i) => [
        i + 1,
        x,
        ys[i],
        x - mx,
        ys[i] - my,
        (x - mx) ** 2,
        (ys[i] - my) ** 2,
        (x - mx) * (ys[i] - my),
        intercept + slope * x,
        ys[i] - (intercept + slope * x),
      ]),
    });
    given = `n=${n}; X: ${xs.join(', ')}; Y: ${ys.join(', ')}`;
    answerTex =
      id === 'correlation'
        ? `r=\\frac{${f(xy)}}{\\sqrt{${f(xx)}\\times${f(yy)}}}=${f(value)}`
        : `\\hat y=${f(intercept)}${slope < 0 ? '-' : '+'}${f(Math.abs(slope))}x`;
    steps = [
      step(
        'Calculate the paired means',
        'Keep the original pairing of each x and y value.',
        `\\bar x=\\frac{${f(total(xs))}}{${n}}=${f(mx)},\\quad\\bar y=\\frac{${f(total(ys))}}{${n}}=${f(my)}`,
      ),
      step(
        'Calculate centered sums of squares',
        'Use deviations from the means to avoid subtracting nearly equal large raw sums.',
        `S_{xx}=\\sum(x_i-\\bar x)^2=${f(xx)},\\quad S_{yy}=\\sum(y_i-\\bar y)^2=${f(yy)}`,
      ),
      step(
        'Calculate the centered cross-product',
        'Multiply paired deviations and sum.',
        `S_{xy}=\\sum(x_i-\\bar x)(y_i-\\bar y)=${f(xy)}`,
      ),
    ];
    if (id === 'correlation')
      steps.push(
        step(
          'Standardize the cross-product',
          'Divide Sxy by the geometric mean of the two sums of squares.',
          answerTex,
        ),
      );
    else
      steps.push(
        step(
          'Calculate the slope',
          'Divide the cross-product by the X sum of squares.',
          `b_1=\\frac{${f(xy)}}{${f(xx)}}=${f(slope)}`,
        ),
        step(
          'Calculate the intercept',
          'Force the fitted line through the paired means.',
          `b_0=${f(my)}-${t(slope)}\\times${t(mx)}=${f(intercept)}`,
        ),
        step(
          'Write predictions and residuals',
          'For each observed x, predict ŷ=b₀+b₁x and compute e=y−ŷ.',
          answerTex,
        ),
      );
    interpretation =
      id === 'correlation'
        ? `Pearson r=${f(value)} summarizes the direction and strength of the observed linear association. Correlation does not imply causation.`
        : `For a one-unit increase in x, the fitted y changes by ${f(slope)}. Predictions describe this fitted sample relationship; extrapolation is not justified automatically.`;
    interpretation +=
      r === undefined
        ? ' R² is undefined because Y is constant.'
        : ` R²=${f(r * r)}: the fitted line accounts for ${format(r * r * 100, 4)}% of the observed variation in Y around its sample mean. The residuals are observed minus fitted Y values; this association does not establish causation.`;
    plot = {
      kind: 'scatter',
      points: xs.map((x, i) => ({
        x,
        y: ys[i],
        predicted: intercept + slope * x,
        residual: ys[i] - (intercept + slope * x),
      })),
      slope,
      intercept,
      rSquared: r === undefined ? undefined : r * r,
    };
    metrics = [
      { label: 'Pairs', value: String(n) },
      { label: 'Slope', value: f(slope) },
      { label: 'Intercept', value: f(intercept) },
      { label: 'R²', value: r === undefined ? 'Undefined (constant Y)' : f(r * r) },
    ];
  }
  if (
    !Number.isFinite(value) ||
    steps.some((s) => s.tex?.includes('NaN') || s.tex?.includes('Infinity'))
  )
    throw new ValidationError('result', 'These values exceed the supported numerical range.');
  return {
    concise: { substitutionTex, interpretation: quickInterpretation, unit },
    workingTables,
    title,
    given,
    formula: meta.tex,
    steps,
    answer: f(value),
    answerTex,
    interpretation,
    value,
    metrics,
    plot,
    curve,
    notes,
  };
}
