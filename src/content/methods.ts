import type { Method, Values } from '../types';
export interface Field {
  key: string;
  label: string;
  hint?: string;
  default: string;
  min?: number;
  max?: number;
  step?: string;
}
const f = (key: string, label: string, value: number, hint?: string): Field => ({
  key,
  label,
  default: String(value),
  hint,
});
const mean = f('mu', 'Population mean · μ', 40),
  sd = f(
    'sd',
    'Standard deviation · σ',
    5,
    'Enter σ, not σ². Take the square root of a given variance.',
  ),
  sampleSd = f('sd', 'Sample standard deviation · s', 4),
  n = f('n', 'Sample size · n', 36),
  xbar = f('xbar', 'Sample mean · x̄', 15),
  conf = f('confidence', 'Confidence level · %', 95, 'Enter 95 for a 95% interval.'),
  error = f('error', 'Target half-width · e', 0.05),
  p = f('p', 'Population proportion · p', 0.3, 'A decimal between 0 and 1, for example 0.30.'),
  df = f('df', 'Degrees of freedom · ν', 18);
export const methodLabels: Record<Method, string> = {
  normal: 'Normal probability',
  inverse: 'Find an unknown bound',
  t: 'Student t probability',
  chi: 'Chi-square probability',
  f: 'F probability',
  'mean-known': 'Known σ · z',
  'mean-large': 'Unknown σ · large-sample z',
  'mean-t': 'Unknown σ · small-sample t',
  variance: 'Sample variance probability',
  proportion: 'Proportion probability',
  'proportion-moments': 'Proportion mean & spread',
  'ci-known': 'Known σ · z interval',
  'ci-large': 'Unknown σ · large-sample z interval',
  'ci-t': 'Unknown σ · small-sample t interval',
  'ci-summary': 'Interval from sums',
  'size-known': 'Known σ · sample size',
  'size-large': 'Estimated σ · large sample size',
  'size-t': 'Estimated σ · small sample t size',
  bounds: 'Confidence limits & width',
};
export const methodFields: Record<Method, Field[]> = {
  normal: [mean, sd],
  inverse: [mean, sd, f('prob', 'Tail probability', 0.9875)],
  t: [df],
  chi: [{ ...df, default: '24' }],
  f: [
    f('df', 'Numerator degrees of freedom · d₁', 5),
    f('df2', 'Denominator degrees of freedom · d₂', 10),
  ],
  'mean-known': [mean, sd, n],
  'mean-large': [mean, sampleSd, n],
  'mean-t': [mean, sampleSd, { ...n, default: '12' }],
  variance: [
    f('variance', 'Population variance · σ²', 6, 'Enter variance, not standard deviation.'),
    { ...n, default: '25' },
  ],
  proportion: [p, { ...n, default: '120' }],
  'proportion-moments': [p, { ...n, default: '125' }],
  'ci-known': [xbar, sd, { ...n, default: '25' }, conf],
  'ci-large': [{ ...xbar, default: '2.6' }, sampleSd, n, conf],
  'ci-t': [
    { ...xbar, default: '7.38' },
    { ...sampleSd, default: '1.24' },
    { ...n, default: '12' },
    conf,
  ],
  'ci-summary': [
    f('sum', 'Sum of observations · Σxᵢ', 280),
    f('sumSq', 'Sum of squared observations · Σxᵢ²', 2100),
    { ...n, default: '40' },
    conf,
  ],
  'size-known': [sd, conf, error],
  'size-large': [{ ...sampleSd, default: '.3' }, conf, error],
  'size-t': [{ ...sampleSd, default: '1' }, conf, { ...error, default: '1' }],
  bounds: [
    f('lower', 'Lower confidence limit · A', 80),
    f('upper', 'Upper confidence limit · B', 120),
    conf,
  ],
};
export const probabilityMethods: Method[] = [
  'normal',
  't',
  'chi',
  'f',
  'mean-known',
  'mean-large',
  'mean-t',
  'variance',
  'proportion',
];
export const normalityMethods: Method[] = [
  'normal',
  'mean-known',
  'mean-t',
  'variance',
  'ci-known',
  'ci-t',
  'size-known',
  'size-t',
];
export function defaults(method: Method, topicId?: string): Values {
  const values: Values = { tail: 'left', a: '50', b: '55', normal: 'true', strict: 'false' };
  methodFields[method].forEach((f) => (values[f.key] = f.default));
  if (method === 'normal' && topicId === 'standard-normal')
    Object.assign(values, { mu: '0', sd: '1', a: '1.96' });
  if (method === 'normal' && topicId === 'z-score')
    Object.assign(values, { mu: '60', sd: '5', a: '75' });
  if (method === 't') Object.assign(values, { a: '2.101', tail: 'right' });
  if (method === 'chi') Object.assign(values, { a: '36.4', tail: 'right' });
  if (method === 'f') Object.assign(values, { a: '3.3258', tail: 'right' });
  if (method.startsWith('mean-'))
    Object.assign(values, {
      mu: '200',
      sd: '6',
      n: method === 'mean-large' ? '36' : '16',
      a: '199',
    });
  if (method === 'variance') Object.assign(values, { a: '9.1', b: '10.745', tail: 'right' });
  if (method === 'proportion') Object.assign(values, { a: '.35', b: '.4', tail: 'right' });
  return values;
}
