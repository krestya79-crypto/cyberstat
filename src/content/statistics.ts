import {
  methodFields,
  methodLabels,
  defaults,
  probabilityMethods,
  normalityMethods,
  type Field,
} from './methods';
import type { Method, Values } from '../types';

export const categories = [
  {
    id: 'descriptive',
    name: 'Descriptive Statistics',
    description: 'Summarize an observed data set.',
  },
  {
    id: 'probability',
    name: 'Probability',
    description: 'Calculate event, joint and conditional probabilities.',
  },
  {
    id: 'distributions',
    name: 'Probability Distributions',
    description: 'Evaluate continuous and discrete probability models.',
  },
  {
    id: 'sampling',
    name: 'Sampling',
    description: 'Study sample means, variances, proportions and standard errors.',
  },
  {
    id: 'intervals',
    name: 'Confidence Intervals',
    description: 'Estimate parameters and quantify interval precision.',
  },
  {
    id: 'testing',
    name: 'Hypothesis Testing',
    description: 'Calculate test statistics, p-values and rejection regions.',
  },
  {
    id: 'regression',
    name: 'Correlation and Regression',
    description: 'Explore paired observations and fit a straight line.',
  },
  {
    id: 'planning',
    name: 'Sample Size Planning',
    description: 'Choose a sample size for a target margin of error.',
  },
] as const;
export type Category = (typeof categories)[number]['id'];
export interface StatField extends Field {
  kind?: 'dataset' | 'select' | 'checkbox';
  options?: { value: string; label: string }[];
}
export interface StatisticalFormula {
  id: string;
  category: Category;
  name: string;
  tex: string;
  use: string;
  variables: string;
  required: string;
  conditions: string[];
  fields: StatField[];
  initial: Values;
  legacy?: Method;
}
const field = (key: string, label: string, value: string, hint?: string): StatField => ({
  key,
  label,
  default: value,
  hint,
});
const data = (key = 'data', label = 'Data set', value = '2, 4, 4, 4, 5, 5, 7, 9'): StatField => ({
  ...field(
    key,
    label,
    value,
    'Separate numbers with commas, spaces, semicolons or new lines. Maximum 2,000 values.',
  ),
  kind: 'dataset',
});
const normal: StatField = {
  ...field('normal', 'The population is approximately normal.', 'true'),
  kind: 'checkbox',
};
const alpha = field(
  'alpha',
  'Significance level · α',
  '0.05',
  'Enter a decimal such as 0.05, not 5.',
);
const alternative: StatField = {
  ...field('tail', 'Alternative hypothesis', 'two'),
  kind: 'select',
  options: [
    { value: 'two', label: 'Two-sided · not equal' },
    { value: 'left', label: 'Left-sided · less than' },
    { value: 'right', label: 'Right-sided · greater than' },
  ],
};
const region: StatField = {
  ...field('tail', 'Probability region', 'left'),
  kind: 'select',
  options: [
    { value: 'left', label: 'Below the bound' },
    { value: 'right', label: 'Above the bound' },
    { value: 'between', label: 'Between two bounds' },
  ],
};
const countRegion: StatField = {
  ...field('tail', 'Probability event', 'exact'),
  kind: 'select',
  options: [
    { value: 'exact', label: 'Exactly k · P(X = k)' },
    { value: 'left', label: 'At most k · P(X ≤ k)' },
    { value: 'right', label: 'At least k · P(X ≥ k)' },
  ],
};
const p = field('p', 'Probability of success · p', '0.5', 'Use a decimal between 0 and 1.');
const categoryFor = (m: Method): Category =>
  m.startsWith('size-')
    ? 'planning'
    : m.startsWith('ci-') || m === 'bounds'
      ? 'intervals'
      : m.startsWith('mean-') || ['variance', 'proportion', 'proportion-moments'].includes(m)
        ? 'sampling'
        : 'distributions';
const legacyMetadata: Record<
  Method,
  { tex: string; use: string; variables: string; conditions: string[] }
> = {
  normal: {
    tex: 'P(a<X<b)=\\Phi((b-\\mu)/\\sigma)-\\Phi((a-\\mu)/\\sigma)',
    use: 'Find lower-tail, upper-tail or between-bounds probabilities for a normal variable.',
    variables: 'μ: population mean · σ: population standard deviation · a, b: observation bounds',
    conditions: ['A normal population model is appropriate.', 'σ must be positive.'],
  },
  inverse: {
    tex: 'k=\\mu+\\sigma\\Phi^{-1}(p)',
    use: 'Find a normal observation bound from its tail probability.',
    variables: 'k: unknown bound · μ: mean · σ: standard deviation · p: cumulative probability',
    conditions: [
      'Normal population model; positive σ.',
      'The tail probability must be strictly between 0 and 1.',
    ],
  },
  t: {
    tex: 'T\\sim t_\\nu',
    use: 'Evaluate a Student t probability with specified degrees of freedom.',
    variables: 'T: t statistic · ν: degrees of freedom · a, b: statistic bounds',
    conditions: ['Positive integer degrees of freedom.'],
  },
  chi: {
    tex: '\\chi^2=\\sum_{i=1}^k Z_i^2',
    use: 'Evaluate chi-square lower, upper or between-bounds probabilities.',
    variables: 'k: degrees of freedom · Zi: independent standard normal variables',
    conditions: ['Positive integer degrees of freedom; nonnegative bounds.'],
  },
  f: {
    tex: 'F=\\frac{U_1/d_1}{U_2/d_2}',
    use: 'Evaluate the ratio of independent chi-square variables scaled by their degrees of freedom.',
    variables: 'd₁: numerator degrees of freedom · d₂: denominator degrees of freedom',
    conditions: [
      'Independent chi-square variables; positive integer d₁ and d₂.',
      'Nonnegative observation bounds.',
    ],
  },
  'mean-known': {
    tex: 'Z=\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}',
    use: 'Find a sampling-mean probability when population standard deviation is known.',
    variables:
      'x̄: sample mean · μ: population mean · σ: known population standard deviation · n: sample size',
    conditions: [
      'Independent random sample.',
      'Normal population for small samples; for n≥30 the normal approximation is used if normality is not assumed.',
    ],
  },
  'mean-large': {
    tex: 'Z\\approx\\frac{\\bar X-\\mu}{s/\\sqrt n}',
    use: 'Use the large-sample normal approximation with an estimated standard deviation.',
    variables: 's: sample standard deviation · n: sample size · μ: population mean',
    conditions: [
      'Independent random sample; n≥30.',
      'Replacing σ with s makes this a large-sample approximation.',
    ],
  },
  'mean-t': {
    tex: 'T=\\frac{\\bar X-\\mu}{s/\\sqrt n}\\sim t_{n-1}',
    use: 'Evaluate a studentized mean using a small normal sample and estimated spread.',
    variables:
      'x̄: sample mean · μ: reference mean · s: sample standard deviation · n−1: degrees of freedom',
    conditions: [
      'Independent observations from an approximately normal population.',
      'This small-sample workspace requires 2≤n<30.',
    ],
  },
  variance: {
    tex: '\\frac{(n-1)s^2}{\\sigma^2}\\sim\\chi^2_{n-1}',
    use: 'Find a sample-variance probability under a normal population model.',
    variables: 's²: sample variance · σ²: population variance · n: sample size',
    conditions: [
      'Independent random sample from a normal population.',
      'n≥2; positive population variance.',
    ],
  },
  proportion: {
    tex: 'Z=\\frac{\\hat p-p}{\\sqrt{p(1-p)/n}}',
    use: 'Approximate a sample-proportion probability.',
    variables: 'p: population proportion · p̂: sample proportion · n: sample size',
    conditions: [
      'Independent Bernoulli observations.',
      'np≥5 and n(1−p)≥5; this is an uncorrected normal approximation.',
    ],
  },
  'proportion-moments': {
    tex: 'E(\\hat p)=p,\\quad V(\\hat p)=\\frac{p(1-p)}n',
    use: 'Calculate the mean, variance and standard error of a sample proportion.',
    variables: 'p: population proportion · n: sample size · p̂: sample proportion',
    conditions: ['Independent Bernoulli sampling.', '0≤p≤1; positive integer n.'],
  },
  'ci-known': {
    tex: '\\bar X\\pm z_{1-\\alpha/2}\\frac\\sigma{\\sqrt n}',
    use: 'Estimate a population mean using known population standard deviation.',
    variables: 'x̄: observed mean · σ: known SD · n: sample size · 1−α: confidence level',
    conditions: ['Independent random sample.', 'Normal population or n≥30; σ>0.'],
  },
  'ci-large': {
    tex: '\\bar X\\pm z_{1-\\alpha/2}\\frac{s}{\\sqrt n}',
    use: 'Use a large-sample normal interval when population spread is estimated.',
    variables: 'x̄: sample mean · s: sample SD · n: sample size · 1−α: confidence level',
    conditions: [
      'Independent random sample; n≥30.',
      'This z interval uses an estimated standard error and is approximate.',
    ],
  },
  'ci-t': {
    tex: '\\bar X\\pm t_{1-\\alpha/2,n-1}\\frac{s}{\\sqrt n}',
    use: 'Estimate a population mean from a small approximately normal sample.',
    variables: 'x̄: sample mean · s: sample SD · n−1: degrees of freedom · 1−α: confidence level',
    conditions: [
      'Independent random observations from an approximately normal population.',
      'This small-sample workspace requires 2≤n<30.',
    ],
  },
  'ci-summary': {
    tex: 's^2=\\frac{\\sum x_i^2-(\\sum x_i)^2/n}{n-1},\\quad\\bar X\\pm z_{1-\\alpha/2}\\frac{s}{\\sqrt n}',
    use: 'Construct a large-sample mean interval from sums and sums of squares.',
    variables: 'Σxi: total observations · Σxi²: total squared observations · n: sample size',
    conditions: [
      'Independent random sample; n≥30.',
      'Sum of squares must be compatible with positive sample variance.',
    ],
  },
  'size-known': {
    tex: 'n=\\left\\lceil\\left(\\frac{z_{1-\\alpha/2}\\sigma}{e}\\right)^2\\right\\rceil',
    use: 'Plan a sample size for a chosen confidence level and maximum half-width.',
    variables: 'σ: known population SD · e: target half-width · 1−α: confidence level',
    conditions: [
      'Positive spread and error bound.',
      'Normal population or a sufficiently large planned sample.',
    ],
  },
  'size-large': {
    tex: 'n\\geq\\left(\\frac{z_{1-\\alpha/2}s}{e}\\right)^2',
    use: 'Plan a large sample using an estimated population standard deviation.',
    variables: 's: planning estimate of SD · e: target half-width',
    conditions: [
      'The planning SD is an estimate.',
      'n≥30; round up to satisfy the precision requirement.',
    ],
  },
  'size-t': {
    tex: 't_{1-\\alpha/2,n-1}\\frac{s}{\\sqrt n}\\leq e',
    use: 'Search for the smallest valid small-sample t design.',
    variables: 's: planning SD · e: target half-width · n−1: degrees of freedom',
    conditions: [
      'Approximately normal population.',
      'Search is limited to integer sample sizes 2–29; a tighter target may require a large-sample design.',
    ],
  },
  bounds: {
    tex: 'W=B-A,\\quad e=\\frac{B-A}{2}',
    use: 'Read the width, midpoint and half-width of supplied interval limits.',
    variables: 'A: lower limit · B: upper limit · e: half-width',
    conditions: [
      'A<B.',
      'The confidence level must be justified by the procedure that produced the interval.',
    ],
  },
};
const inherited = Object.keys(methodLabels).map((id) => {
  const method = id as Method,
    meta = legacyMetadata[method];
  const fields: StatField[] = [...methodFields[method]];
  if (probabilityMethods.includes(method))
    fields.push(
      region,
      field('a', 'Observed bound · a', defaults(method).a),
      field('b', 'Upper bound · b', defaults(method).b),
    );
  if (method === 'inverse')
    fields.push({ ...region, options: region.options!.filter((o) => o.value !== 'between') });
  if (normalityMethods.includes(method) || method === 'inverse') fields.push(normal);
  if (method.startsWith('size-'))
    fields.push({
      ...field('strict', 'The error must be strictly less than the target.', 'false'),
      kind: 'checkbox',
    });
  if (method === 'normal')
    fields.push(
      field(
        'count',
        'Total count · optional',
        '',
        'Multiply the probability by this count to obtain an expected number.',
      ),
    );
  return {
    id,
    category: categoryFor(method),
    name: methodLabels[method],
    ...meta,
    required: method.startsWith('ci-')
      ? 'Confidence limits for the population mean'
      : method.startsWith('size-')
        ? 'The required whole-number sample size'
        : method === 'bounds'
          ? 'Interval width and half-width'
          : 'The requested probability or sampling statistic',
    fields,
    initial: defaults(method),
    legacy: method,
  };
});
const custom = (
  id: string,
  category: Category,
  name: string,
  tex: string,
  use: string,
  variables: string,
  required: string,
  conditions: string[],
  fields: StatField[],
): StatisticalFormula => ({
  id,
  category,
  name,
  tex,
  use,
  variables,
  required,
  conditions,
  fields,
  initial: Object.fromEntries(fields.map((f) => [f.key, f.default])),
});
const descriptive = [
  ['arithmetic-mean', 'Arithmetic mean', '\\bar x=\\frac{\\sum x_i}{n}', 'The average observation'],
  [
    'sample-variance',
    'Sample variance',
    's^2=\\frac{\\sum(x_i-\\bar x)^2}{n-1}',
    'The unbiased sample variance',
  ],
  [
    'population-variance',
    'Population variance',
    '\\sigma^2=\\frac{\\sum(x_i-\\mu)^2}{N}',
    'The variance of the complete population',
  ],
  [
    'sample-sd',
    'Sample standard deviation',
    's=\\sqrt{\\frac{\\sum(x_i-\\bar x)^2}{n-1}}',
    'The sample standard deviation',
  ],
  [
    'population-sd',
    'Population standard deviation',
    '\\sigma=\\sqrt{\\frac{\\sum(x_i-\\mu)^2}{N}}',
    'The population standard deviation',
  ],
  [
    'median',
    'Median and quartiles',
    '\\widetilde x=\\operatorname{median}(x_{(1)},\\ldots,x_{(n)})',
    'The median, quartiles and interquartile range',
  ],
].map(([id, name, tex, required]) =>
  custom(
    id,
    'descriptive',
    name,
    tex,
    'Summarize the supplied observations without assuming a probability distribution.',
    'xi: observed values · n or N: number of observations · x̄ or μ: arithmetic mean',
    required,
    [
      'Finite numerical observations.',
      'Sample variance and sample SD require at least two observations.',
      'Quartiles use medians of the lower and upper halves, excluding the middle value for odd n.',
    ],
    [data()],
  ),
);
const testFields = [
  field('xbar', 'Sample mean · x̄', '52'),
  field('mu0', 'Null population mean · μ₀', '50'),
  field('sd', 'Standard deviation', '4'),
  field('n', 'Sample size · n', '25'),
  alpha,
  alternative,
  normal,
];
export const statisticalFormulas: StatisticalFormula[] = [
  ...descriptive,
  custom(
    'classical-probability',
    'probability',
    'Classical probability',
    'P(A)=\\frac{m}{N}',
    'Find an event probability when all outcomes are equally likely.',
    'm: favorable outcomes · N: total equally likely outcomes',
    'P(A)',
    ['Equally likely outcomes; integer counts with 0≤m≤N.'],
    [field('favorable', 'Favorable outcomes · m', '2'), field('total', 'Total outcomes · N', '6')],
  ),
  custom(
    'event-union',
    'probability',
    'Addition rule',
    'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)',
    'Combine two events while accounting for overlap.',
    'P(A), P(B): marginal probabilities · P(A∩B): joint probability',
    'The union probability',
    ['The three probabilities must describe a feasible joint distribution.'],
    [field('pa', 'P(A)', '0.4'), field('pb', 'P(B)', '0.3'), field('joint', 'P(A ∩ B)', '0.1')],
  ),
  custom(
    'conditional-probability',
    'probability',
    'Conditional probability',
    'P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}',
    'Find the probability of A when B is known to have occurred.',
    'P(A∩B): joint probability · P(B): conditioning event probability',
    'P(A | B)',
    ['P(B)>0 and 0≤P(A∩B)≤P(B).'],
    [field('joint', 'P(A ∩ B)', '0.12'), field('pb', 'P(B)', '0.3')],
  ),
  custom(
    'independent-events',
    'probability',
    'Independent events',
    'P(A\\cap B)=P(A)P(B)',
    'Multiply event probabilities when independence is justified.',
    'P(A), P(B): event probabilities',
    'The joint probability',
    ['A and B must be independent; the calculation cannot establish independence.'],
    [field('pa', 'P(A)', '0.4'), field('pb', 'P(B)', '0.3')],
  ),
  custom(
    'probability-tree',
    'probability',
    'Total probability and Bayes rule',
    'P(B)=P(A)P(B\\mid A)+P(A^c)P(B\\mid A^c)',
    'Combine two conditional branches and reverse the conditioning using Bayes rule.',
    'P(A): first branch · P(B|A), P(B|Aᶜ): conditional probabilities',
    'P(B), joint probabilities and P(A | B)',
    ['A and Aᶜ form an exhaustive, mutually exclusive partition.'],
    [
      field('pa', 'P(A)', '0.3'),
      field('givenA', 'P(B | A)', '0.8'),
      field('givenNotA', 'P(B | Aᶜ)', '0.1'),
    ],
  ),
  ...inherited,
  custom(
    'z-score',
    'distributions',
    'Z-score',
    'z=\\frac{x-\\mu}{\\sigma}',
    'Standardize an individual observation and locate it on the normal curve.',
    'x: observation · μ: population mean · σ: population standard deviation',
    'The standardized observation z',
    ['σ>0. A normal-model percentile requires a normal population assumption.'],
    [
      field('x', 'Observed value · x', '75'),
      field('mu', 'Population mean · μ', '60'),
      field('sd', 'Population standard deviation · σ', '5'),
      normal,
    ],
  ),
  custom(
    'binomial',
    'distributions',
    'Binomial probability',
    'P(X=k)=\\binom nkp^k(1-p)^{n-k}',
    'Model the number of successes in a fixed number of independent trials.',
    'n: trials · p: success probability · k: success count',
    'An exact or cumulative binomial probability',
    [
      'Independent Bernoulli trials with constant p.',
      '1≤n≤200 for a fully displayed discrete distribution; 0≤k≤n.',
    ],
    [
      field('n', 'Number of trials · n', '10'),
      p,
      field('k', 'Success count · k', '3'),
      countRegion,
    ],
  ),
  custom(
    'poisson',
    'distributions',
    'Poisson probability',
    'P(X=k)=e^{-\\lambda}\\frac{\\lambda^k}{k!}',
    'Model counts in a fixed exposure with a constant event rate.',
    'λ: expected count per exposure · k: observed count',
    'An exact or cumulative Poisson probability',
    ['Independent events with a constant average rate.', '0≤λ≤200; integer 0≤k≤1000.'],
    [
      field('lambda', 'Expected count · λ', '4'),
      field('k', 'Observed count · k', '2'),
      countRegion,
    ],
  ),
  custom(
    'standard-error',
    'sampling',
    'Standard error of the mean',
    'SE(\\bar X)=\\frac{\\sigma}{\\sqrt n}',
    'Calculate how the spread of a sample mean changes with sample size.',
    'σ: population SD · n: sample size',
    'The standard error of a sample mean',
    ['Independent observations with finite population variance.'],
    [field('sd', 'Population standard deviation · σ', '6'), field('n', 'Sample size · n', '16')],
  ),
  custom(
    'z-test',
    'testing',
    'One-sample z-test',
    'z=\\frac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}',
    'Test a population mean with known population standard deviation.',
    'μ₀: null mean · x̄: observed mean · σ: known population SD · n: sample size · α: significance level',
    'The test statistic, p-value and decision',
    [
      'Known population σ and independent random observations.',
      'Normal population or n≥30 for the large-sample approximation.',
    ],
    testFields.map((f) =>
      f.key === 'sd' ? { ...f, label: 'Known population standard deviation · σ' } : f,
    ),
  ),
  custom(
    't-test',
    'testing',
    'One-sample t-test',
    't=\\frac{\\bar x-\\mu_0}{s/\\sqrt n},\\quad \\nu=n-1',
    'Test a population mean when its standard deviation is estimated.',
    'μ₀: null mean · x̄: observed mean · s: sample SD · n−1: degrees of freedom',
    'The t statistic, p-value and decision',
    [
      'Independent random observations and n≥2.',
      'A normal population is required for small samples; large-sample use is approximate.',
    ],
    testFields.map((f) => (f.key === 'sd' ? { ...f, label: 'Sample standard deviation · s' } : f)),
  ),
  custom(
    'proportion-test',
    'testing',
    'One-proportion z-test',
    'z=\\frac{\\hat p-p_0}{\\sqrt{p_0(1-p_0)/n}}',
    'Test a population proportion under a null Bernoulli model.',
    'x: success count · n: trials · p₀: null proportion · p̂=x/n · α: significance level',
    'The z statistic, p-value and decision',
    ['Independent Bernoulli trials.', 'np₀≥5 and n(1−p₀)≥5; no continuity correction.'],
    [
      field('successes', 'Observed successes · x', '60'),
      field('n', 'Sample size · n', '100'),
      field('p0', 'Null population proportion · p₀', '0.5'),
      alpha,
      alternative,
    ],
  ),
  custom(
    'chi-square-test',
    'testing',
    'Chi-square goodness-of-fit test',
    '\\chi^2=\\sum_i\\frac{(O_i-E_i)^2}{E_i}',
    'Compare observed category counts to counts expected under a specified null model.',
    'Oi: observed count · Ei: expected count · k: categories · m: fitted parameters · df=k−1−m',
    'The chi-square statistic, right-tail p-value and decision',
    [
      'Independent category counts; each expected count must be at least 5.',
      'Observed and expected totals must match; positive degrees of freedom.',
    ],
    [
      data('observed', 'Observed category counts', '20, 30, 50'),
      data('expected', 'Expected category counts', '25, 25, 50'),
      field('estimated', 'Parameters estimated from these data · m', '0'),
      alpha,
    ],
  ),
  ...[
    [
      'correlation',
      'Pearson correlation coefficient',
      'r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}',
      'The strength and direction of the linear association',
    ],
    [
      'regression',
      'Simple linear regression',
      '\\hat y=b_0+b_1x,\\quad b_1=\\frac{S_{xy}}{S_{xx}},\\quad b_0=\\bar y-b_1\\bar x',
      'The fitted line, predictions and residuals',
    ],
  ].map(([id, name, tex, required]) =>
    custom(
      id,
      'regression',
      name,
      tex,
      'Analyze paired numerical observations using centered sums of squares and cross-products.',
      'Sxx=Σ(x−x̄)² · Syy=Σ(y−ȳ)² · Sxy=Σ(x−x̄)(y−ȳ)',
      required,
      [
        'At least two complete pairs and variation in x.',
        'Pearson r also requires variation in y.',
        'A fitted association does not establish causation. Regression inference additionally requires an appropriate error model.',
      ],
      [
        data('xs', 'X observations', '1, 2, 3, 4, 5'),
        data('ys', 'Y observations', '2, 4, 5, 4, 5'),
      ],
    ),
  ),
];
export const getFormula = (id: string) => statisticalFormulas.find((f) => f.id === id);
export const formulaDefaults = (id: string): Values => ({ ...getFormula(id)!.initial });
export function visibleFields(formula: StatisticalFormula, values: Values): StatField[] {
  return formula.fields.filter((f) => f.key !== 'b' || values.tail === 'between');
}
