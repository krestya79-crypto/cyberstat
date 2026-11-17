import type { Topic } from '../types';
export const lectures = [
  {
    n: 1,
    title: 'The normal distribution',
    description: 'From the bell curve to probability.',
    pages: 21,
  },
  {
    n: 2,
    title: 'Distributions & sample means',
    description: 'Understand how samples behave.',
    pages: 19,
  },
  {
    n: 3,
    title: 'Variance & proportions',
    description: 'Explore variability and share.',
    pages: 14,
  },
  {
    n: 4,
    title: 'Estimation & confidence',
    description: 'Make informed statements about a population.',
    pages: 16,
  },
];
export const topics: Topic[] = [
  {
    id: 'normal',
    lecture: 1,
    pages: '5–8, 14–19',
    title: 'Normal distribution',
    short: 'The shape behind the data',
    intro:
      'A continuous distribution determined by its mean μ and variance σ². Many measurable characteristics are normally or approximately normally distributed.',
    notes: [
      'The curve is bell-shaped, symmetric about μ, and never touches the horizontal axis. Its total area is one.',
      'Mean, median and mode coincide at the highest point. The domain is all real numbers; the center is denser than the tails.',
      'The lecture writes X ∼ N(μ, σ²): the second parameter is variance, not standard deviation.',
      'Approximately 68%, 95% and 99.7% lie within one, two and three standard deviations. The exact normal areas are approximately 68.27%, 95.45% and 99.73%.',
    ],
    formulas: [
      {
        name: 'Normal density',
        tex: 'f(x;\\mu,\\sigma^2)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac12(\\frac{x-\\mu}{\\sigma})^2}',
      },
      {
        name: 'Empirical rule',
        tex: 'P(\\mu-k\\sigma<X<\\mu+k\\sigma)\\approx 68\\%,95\\%,99.7\\%\\quad(k=1,2,3)',
      },
    ],
    conditions: [
      'The variable is normally distributed or explicitly assumed approximately normal.',
      'Standard deviation σ must be positive.',
    ],
    symbols:
      'μ: population mean · σ: population standard deviation · σ²: population variance · X: observed variable',
    methods: ['normal'],
    related: ['standard-normal', 'z-score', 'inverse'],
  },
  {
    id: 'standard-normal',
    lecture: 1,
    pages: '9–13',
    title: 'Standard normal distribution',
    short: 'One curve, every normal probability',
    intro:
      'The standard normal distribution has mean zero and variance one. Standardization lets you use its cumulative table for any normal variable.',
    notes: [
      'The domain is all real numbers. The bell curve is symmetric about zero, where its mean, median and mode meet.',
      'Half the area lies on each side of zero. The lecture uses φ(z) for the cumulative probability P(Z < z).',
      'Pages 12 and 13 reproduce the cumulative standard normal table. Numerical results here retain full precision rather than rounding z first.',
    ],
    formulas: [
      { name: 'Standard normal', tex: 'Z\\sim N(0,1),\\quad \\varphi(z)=P(Z<z)' },
      { name: 'Symmetry', tex: '\\varphi(-a)=1-\\varphi(a),\\quad \\varphi(0)=0.5' },
      { name: 'Between bounds', tex: 'P(a<Z<b)=\\varphi(b)-\\varphi(a)' },
    ],
    conditions: ['Use mean 0 and standard deviation 1 in this workspace.'],
    symbols: 'Z: standardized observation · φ: lecture cumulative probability notation',
    methods: ['normal'],
    related: ['normal', 'z-score'],
    review:
      'L1 p11 prints φ(−a)=1−φ(−a) and repeats an upper argument in the interval expression. These appear to be typographical errors; the identities shown here identify the corrected arguments.',
  },
  {
    id: 'z-score',
    lecture: 1,
    pages: '10–11',
    title: 'Z-score & standardization',
    short: 'Put an observation in context',
    intro:
      'A z-score measures how many standard deviations an observation is above or below the mean. Change X to Z before looking up a standard normal probability.',
    notes: [
      'Subtract the mean, then divide by the standard deviation. If variance is given, take its square root first.',
      'For continuous distributions, strict and inclusive bounds have the same probability.',
      'Left tail: use φ(z). Right tail: use 1−φ(z). Between two observations: subtract the lower cumulative probability from the upper.',
    ],
    formulas: [
      { name: 'Standardization', tex: 'Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)' },
      {
        name: 'Lower / upper tail',
        tex: 'P(X<a)=\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right),\\quad P(X>a)=1-\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      },
      {
        name: 'Interval probability',
        tex: 'P(a<X<b)=\\varphi\\!\\left(\\frac{b-\\mu}{\\sigma}\\right)-\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      },
    ],
    conditions: [
      'X follows a normal distribution.',
      'Use standard deviation in the denominator, not variance.',
    ],
    symbols: 'X: observation · μ: mean · σ: standard deviation · a,b: probability bounds',
    methods: ['normal'],
    related: ['normal', 'standard-normal', 'inverse'],
  },
  {
    id: 'inverse',
    lecture: 1,
    pages: '20',
    title: 'Find an unknown normal bound',
    short: 'Work backwards from a probability',
    intro:
      'Find k when a lower- or upper-tail normal probability is given. Read the corresponding z from the cumulative normal table, then undo standardization.',
    notes: [
      'For a right-tail probability q, first convert it to cumulative probability 1−q.',
      'Multiply the critical z by σ and add μ. The source uses rounded table values; the workspace uses a numerical quantile.',
    ],
    formulas: [
      { name: 'Unknown bound', tex: 'k=\\mu+\\sigma\\,\\varphi^{-1}(p)' },
      { name: 'Right-tail conversion', tex: 'P(X>k)=q\\quad\\Rightarrow\\quad p=1-q' },
    ],
    conditions: ['The variable is normal, σ>0, and 0<p<1.'],
    symbols: 'k: unknown bound · p: cumulative probability · q: upper-tail probability',
    methods: ['inverse'],
    related: ['normal', 'z-score'],
    review:
      'L1 p20(b) changes k−12 to k−8 and concludes 10.025. With the original mean 12, the bound is approximately 14.0235.',
  },
  {
    id: 'student-t',
    lecture: 2,
    pages: '2–5',
    title: 'Student’s t distribution',
    short: 'A little more room in the tails',
    intro:
      'A family of continuous, symmetric, bell-shaped curves indexed by degrees of freedom. The lecture uses t for small normal samples with unknown population standard deviation.',
    notes: [
      'Support is all real numbers. The curve has heavier tails than the standard normal and approaches it as degrees of freedom increase.',
      'Degrees of freedom count values free to vary after a sample statistic is calculated. For a sample mean, df=n−1.',
      'The median and mode are zero. The mean is zero only for df>1; the variance is df/(df−2) only for df>2.',
      'The table on page 4 uses selected right-tail probabilities. For t=1.50 and df=18, it brackets the probability between .05 and .10.',
    ],
    formulas: [
      { name: 't statistic', tex: 'T=\\frac{\\bar X-\\mu}{s/\\sqrt n}\\sim T(n-1)' },
      { name: 'Degrees of freedom', tex: '\\nu=n-1' },
    ],
    conditions: [
      'For the lecture’s small-sample mean method: n<30, unknown σ, approximately normal population.',
      'A t distribution itself is defined for positive degrees of freedom.',
    ],
    symbols: 'T: t statistic · ν: degrees of freedom · s: sample standard deviation',
    methods: ['t'],
    related: ['sampling-mean', 'ci-t'],
    review:
      'L2 pp2–3 state mean=0 and variance>1 without the existence conditions. Those conditions are made explicit here.',
  },
  {
    id: 'chi-square',
    lecture: 2,
    pages: '6–7',
    title: 'Chi-square distribution',
    short: 'Squared normal variables, added together',
    intro:
      'The chi-square distribution is the sum of squares of independent standard normal variables. Its degrees of freedom equal the number of squared variables.',
    notes: [
      'It is nonnegative and right-skewed. As degrees of freedom increase the shape becomes more symmetric.',
      'The mean is k and variance is 2k. The right-tail table appears on page 7.',
    ],
    formulas: [
      { name: 'Definition', tex: '\\chi^2=Z_1^2+Z_2^2+\\cdots+Z_k^2' },
      { name: 'Moments', tex: 'E(\\chi^2)=k,\\quad V(\\chi^2)=2k' },
    ],
    conditions: [
      'Z variables are independent standard normal variables.',
      'Degrees of freedom k is a positive integer.',
    ],
    symbols: 'k: degrees of freedom · Zi: independent standard normal variables',
    methods: ['chi'],
    related: ['sampling-variance', 'f-distribution'],
  },
  {
    id: 'f-distribution',
    lecture: 2,
    pages: '8–9',
    title: 'F distribution',
    short: 'A ratio of independent variability',
    intro:
      'The Fisher–Snedecor distribution describes the ratio of two independent chi-square variables, each divided by its respective degrees of freedom.',
    notes: [
      'The order of d₁ and d₂ matters. Values are nonnegative; the distribution is right-skewed and becomes more concentrated as the degrees of freedom increase.',
      'Page 9 gives an upper-tail F table at α=.05. The calculator can evaluate other probabilities numerically.',
      'The mean exists only when d₂>2, and the variance only when d₂>4. The lecture’s comment about approaching normality is qualitative.',
    ],
    formulas: [
      { name: 'F ratio', tex: 'F=\\frac{U_1/d_1}{U_2/d_2}\\sim F(d_1,d_2)' },
      { name: 'F mean', tex: 'E(F)=\\frac{d_2}{d_2-2}\\quad(d_2>2)' },
      {
        name: 'F variance',
        tex: 'V(F)=\\frac{2d_2^2(d_1+d_2-2)}{d_1(d_2-2)^2(d_2-4)}\\quad(d_2>4)',
      },
    ],
    conditions: [
      'U₁ and U₂ are independent chi-square variables.',
      'Both degrees of freedom are positive integers.',
    ],
    symbols: 'd₁: numerator df · d₂: denominator df · U₁,U₂: independent χ² variables',
    methods: ['f'],
    related: ['chi-square', 'sampling-variance'],
  },
  {
    id: 'sampling-foundations',
    lecture: 2,
    pages: '10',
    title: 'Populations, samples & statistics',
    short: 'Know what each symbol describes',
    intro:
      'A population is the whole group of interest. A sample is a subset of that population. A sampling distribution describes how a statistic varies over random samples.',
    notes: [
      'The lecture distinguishes population size N from sample size n, population mean μ from sample mean x̄, and σ² and σ from s² and s.',
      'A statistic is calculated from a sample and varies from sample to sample.',
      'Source wording: “Parameter: Is a random variable calculated from the population.” Review clarification: in the usual frequentist model a population parameter is fixed but unknown; sample statistics are random before sampling.',
    ],
    formulas: [
      {
        name: 'Population / sample symbols',
        tex: '(N,\\mu,\\sigma^2,\\sigma)\\quad\\longleftrightarrow\\quad(n,\\bar X,s^2,s)',
      },
    ],
    conditions: ['Distinguish a population quantity from its sample estimate.'],
    symbols: 'N,n: sizes · μ,x̄: means · σ²,s²: variances · σ,s: standard deviations',
    methods: [],
    related: ['sampling-mean', 'sampling-variance', 'proportion'],
  },
  {
    id: 'sampling-mean',
    lecture: 2,
    pages: '11–18',
    title: 'Sampling distribution of the mean',
    short: 'From individual values to averages',
    intro:
      'For a random sample of size n, the sample mean has expected value μ and variance σ²/n. Use the standard error of the mean to standardize an average.',
    notes: [
      'For a normal population the sampling mean is exactly normal for every sample size when σ is known.',
      'The lecture uses z with known σ for normal populations or n≥30; z with s for unknown σ when n≥30; and t with s for approximately normal populations when n<30.',
      'The unknown-σ large-sample z method is an approximation. The app follows this lecture convention instead of silently changing it to t.',
    ],
    formulas: [
      {
        name: 'Sampling mean moments',
        tex: 'E(\\bar X)=\\mu,\\quad V(\\bar X)=\\frac{\\sigma^2}{n}',
      },
      { name: 'Known σ statistic', tex: 'Z=\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}' },
      { name: 'Unknown σ, large n', tex: 'Z\\approx\\frac{\\bar X-\\mu}{s/\\sqrt n}' },
      { name: 'Unknown σ, small n', tex: 'T=\\frac{\\bar X-\\mu}{s/\\sqrt n}\\sim T(n-1)' },
    ],
    conditions: [
      'Independent random observations.',
      'Known σ: normal population or n≥30.',
      'Unknown σ: n≥30 for lecture z approximation; small n requires approximate population normality for t.',
    ],
    symbols: 'x̄: sample mean · n: sample size · μ: population mean · σ or s: standard deviation',
    methods: ['mean-known', 'mean-large', 'mean-t'],
    related: ['standard-error', 'clt', 'student-t'],
  },
  {
    id: 'standard-error',
    lecture: 2,
    pages: '11–13',
    title: 'Standard error',
    short: 'How much would an average vary?',
    intro:
      'The standard deviation of the sampling mean is called its standard error. Larger samples have less variable means.',
    notes: [
      'Divide the population standard deviation by √n. If σ is unknown, substitute s under the lecture’s applicable large-sample or t conditions.',
      'Quadrupling sample size halves the standard error. Sampling variance is the square of this standard error.',
      'L4 p14 calls a critical value multiplied by the standard error “SE”. That quantity is the confidence half-width; it is distinguished from sampling SE here.',
    ],
    formulas: [
      { name: 'Standard error of the mean', tex: '\\sigma_{\\bar X}=\\frac{\\sigma}{\\sqrt n}' },
      { name: 'Estimated standard error', tex: '\\widehat{SE}(\\bar X)=\\frac{s}{\\sqrt n}' },
    ],
    conditions: ['Random independent sample and positive standard deviation.'],
    symbols: 'σx̄: standard error · σ: population SD · s: sample SD · n: sample size',
    methods: ['mean-known', 'mean-large', 'mean-t'],
    related: ['sampling-mean', 'sample-size', 'ci-known'],
  },
  {
    id: 'clt',
    lecture: 2,
    pages: '12–13',
    title: 'Central limit theorem',
    short: 'Why averages tend toward normal',
    intro:
      'For a sufficiently large random sample from a population with finite mean and variance, the sampling distribution of the mean is approximately normal.',
    notes: [
      'The normal-population theorem on p12 is exact; the central limit theorem is approximate.',
      'The lecture operationally uses n≥30. This is a classroom rule of thumb, not a guarantee for every skewed or heavy-tailed population.',
      'The mean stays at μ while its variance shrinks to σ²/n.',
    ],
    formulas: [
      { name: 'CLT standardization', tex: '\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}\\approx N(0,1)' },
    ],
    conditions: [
      'Independent random sample; finite population mean and variance.',
      'Use the lecture n≥30 rule when population normality is not assumed.',
    ],
    symbols: 'x̄: sample mean · μ: population mean · σ²: finite population variance',
    methods: ['mean-known', 'mean-large'],
    related: ['sampling-mean', 'standard-error'],
  },
  {
    id: 'sampling-variance',
    lecture: 3,
    pages: '2–5',
    title: 'Sampling distribution of variance',
    short: 'Use chi-square to study spread',
    intro:
      'For a random sample from a normal population, transform the sample variance into a chi-square variable with n−1 degrees of freedom.',
    notes: [
      'Multiply s² by n−1 and divide by the population variance σ². Do not substitute the population standard deviation into this denominator.',
      'Since E(χ²)=n−1, dividing by (n−1)/σ² gives E(s²)=σ². Since V(χ²)=2(n−1), scaling back gives V(s²)=2σ⁴/(n−1).',
      'For an upper tail, subtract the chi-square CDF from one. For an interval, subtract the lower CDF from the upper, equivalently subtract right tails.',
    ],
    formulas: [
      { name: 'Variance statistic', tex: '\\frac{(n-1)s^2}{\\sigma^2}\\sim\\chi^2(n-1)' },
      {
        name: 'Sample variance moments',
        tex: 'E(s^2)=\\sigma^2,\\quad V(s^2)=\\frac{2\\sigma^4}{n-1}',
      },
      { name: 'Chi-square interval', tex: 'P(a<\\chi^2<b)=P(\\chi^2>a)-P(\\chi^2>b)' },
    ],
    conditions: ['Independent random sample from a normal population.', 'n≥2 and σ²>0.'],
    symbols: 's²: sample variance · σ²: population variance · n−1: degrees of freedom',
    methods: ['variance'],
    related: ['chi-square', 'sampling-foundations'],
    review:
      'Examples on L3 pp4–5 contain inconsistent tail probabilities. Original stated answers are preserved in the example library.',
  },
  {
    id: 'proportion',
    lecture: 3,
    pages: '6–13',
    title: 'Sampling distribution of a proportion',
    short: 'From a count to a share',
    intro:
      'The sample proportion is the number with a characteristic divided by sample size. Its sampling distribution has mean p and variance p(1−p)/n.',
    notes: [
      'The lecture writes P for the population proportion and P̂ for its sample estimate. Lowercase p is used in input labels for readability.',
      'The normal approximation requires np≥5 and n(1−p)≥5. It uses the uncorrected normal approximation shown in the lecture.',
      'For the finite factory example, the lecture does not apply a finite-population correction; its result is conditional on the independent-sampling approximation.',
      'Probability bounds must lie between 0 and 1. The normal approximating curve itself extends beyond these limits.',
    ],
    formulas: [
      { name: 'Sample proportion', tex: '\\hat P=\\frac{X}{n},\\quad0\\leq\\hat P\\leq1' },
      { name: 'Proportion moments', tex: 'E(\\hat P)=P,\\quad V(\\hat P)=\\frac{P(1-P)}{n}' },
      { name: 'Proportion z', tex: 'Z=\\frac{\\hat P-P}{\\sqrt{P(1-P)/n}}\\approx N(0,1)' },
      { name: 'Approximation conditions', tex: 'nP\\geq5,\\quad n(1-P)\\geq5' },
    ],
    conditions: [
      'Independent random sampling.',
      'For probability calculations, np≥5 and n(1−p)≥5.',
      'Use proportions as decimals, not percentages.',
    ],
    symbols:
      'X: characteristic count · n: sample size · P: population proportion · P̂: sample proportion',
    methods: ['proportion', 'proportion-moments'],
    related: ['standard-normal', 'sampling-foundations'],
    review:
      'L3 pp9,11,12 have numerical or sign discrepancies. Source answers and calculation review notes are shown for each example.',
  },
  {
    id: 'point-estimation',
    lecture: 4,
    pages: '2',
    title: 'Point estimation',
    short: 'A single estimate for an unknown quantity',
    intro:
      'A point estimator is a statistic, a function of the random sample. A point estimate uses a single value for an unknown population parameter.',
    notes: [
      'The lecture illustrations are μ̂=120 and σ̂²=16. They are example estimates, not a supplied data set.',
      'The sample mean estimates μ. The unbiased sample variance estimates σ²; the summary-statistics formula is worked in L4 p10.',
      'Without the original sample, no further calculation can be inferred from the illustrative values.',
    ],
    formulas: [
      { name: 'Lecture illustrations', tex: '\\hat\\mu=120,\\quad\\widehat{\\sigma^2}=16' },
      {
        name: 'Summary estimates',
        tex: '\\bar X=\\frac{\\sum x_i}{n},\\quad s^2=\\frac{\\sum x_i^2-(\\sum x_i)^2/n}{n-1}',
      },
    ],
    conditions: ['A sample or its summary statistics is required to calculate estimates.'],
    symbols: 'μ̂: point estimate of population mean · σ̂²: estimate of population variance',
    methods: ['ci-summary'],
    related: ['interval-estimation', 'ci-summary'],
  },
  {
    id: 'interval-estimation',
    lecture: 4,
    pages: '2–5',
    title: 'Interval estimation',
    short: 'Give an estimate room for uncertainty',
    intro:
      'A confidence interval estimator is a rule that determines an interval from a sample, intended to cover a population parameter at a stated long-run rate.',
    notes: [
      'The lecture’s illustrations are 80<μ<120 and 10<σ²<16. No confidence level is supplied for these illustrations.',
      'The known-σ derivation starts with P(−zα/2<Z<zα/2)=1−α, substitutes Z=(x̄−μ)/(σ/√n), multiplies by σ/√n, then rearranges to isolate μ.',
      'Assignment on p5: deduce the unknown-σ large-sample and small-normal-sample interval formulas. The resulting formulas are given on p6.',
    ],
    formulas: [
      { name: 'Source interval illustrations', tex: '80<\\mu<120,\\quad10<\\sigma^2<16' },
      {
        name: 'Pivotal inequality',
        tex: 'P\\!\\left(-z_{\\alpha/2}<\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}<z_{\\alpha/2}\\right)=1-\\alpha',
      },
      {
        name: 'Rearranged mean interval',
        tex: '\\bar X-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}<\\mu<\\bar X+z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
      },
    ],
    conditions: ['Select the correct known/unknown σ method and sample-size/normality conditions.'],
    symbols: 'α: noncoverage rate · zα/2: positive upper-tail critical value',
    methods: ['ci-known', 'ci-large', 'ci-t'],
    related: ['confidence-level', 'ci-known', 'ci-large', 'ci-t'],
    assignment:
      'Deduce both unknown-population-variance formulas. For n≥30 replace σ by s in the large-sample z approximation. For n<30 under approximate normality replace z by t with n−1 degrees of freedom.',
  },
  {
    id: 'confidence-level',
    lecture: 4,
    pages: '3, 7',
    title: 'Confidence levels & limits',
    short: 'Understand what 95% means',
    intro:
      'If a random interval [A,B] covers θ with probability 1−α, then 100(1−α)% is its confidence level. A and B are the lower and upper confidence limits.',
    notes: [
      'The width is B−A. For a symmetric interval the half-width is (B−A)/2.',
      'At 95% confidence, α=.05 and α/2=.025. The normal critical value is approximately 1.96.',
      'Confidence describes the repeated-sampling procedure. It is not the probability that a fixed parameter moves inside an already computed interval.',
    ],
    formulas: [
      { name: 'Confidence definition', tex: 'P(A<\\theta<B)=1-\\alpha' },
      { name: 'Width and limits', tex: 'LCL=A,\\quad UCL=B,\\quad W=B-A' },
    ],
    conditions: [
      'Limits must be finite and A<B.',
      'A confidence level alone does not establish that an arbitrary interval is a valid confidence procedure.',
    ],
    symbols: 'A: lower confidence limit · B: upper confidence limit · θ: population parameter',
    methods: ['bounds'],
    related: ['interval-estimation', 'ci-known'],
  },
  {
    id: 'ci-known',
    lecture: 4,
    pages: '4–8, 13',
    title: 'Mean interval · known σ',
    short: 'Estimate a mean with population spread',
    intro:
      'When population variance is known, construct a two-sided mean confidence interval using a standard-normal critical value.',
    notes: [
      'If σ² is given, take its square root first. Calculate SE=σ/√n, find zα/2, multiply to get the half-width, then subtract and add it to x̄.',
      'For a normal population the method applies to any n; otherwise the lecture requires n≥30.',
    ],
    formulas: [
      {
        name: 'Known σ confidence interval',
        tex: '\\bar X\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
      },
    ],
    conditions: ['Known population σ.', 'Normal population or n≥30, independent random sample.'],
    symbols: 'x̄: sample mean · σ: known population SD · n: sample size · α: noncoverage rate',
    methods: ['ci-known'],
    related: ['ci-large', 'ci-t', 'sample-size'],
  },
  {
    id: 'ci-large',
    lecture: 4,
    pages: '5–7, 9',
    title: 'Mean interval · unknown σ, large n',
    short: 'Use the sample spread',
    intro:
      'For unknown population variance and n≥30, the lecture substitutes s for σ and uses a z critical value.',
    notes: [
      'This is the lecturer’s large-sample normal approximation. It is kept distinct from the small-sample t method.',
      'Use the given sample standard deviation even if the printed final answer appears to imply different data.',
    ],
    formulas: [
      {
        name: 'Large sample confidence interval',
        tex: '\\bar X\\pm z_{\\alpha/2}\\frac{s}{\\sqrt n}',
      },
    ],
    conditions: ['Unknown population σ and n≥30.', 'Independent random sample.'],
    symbols: 's: sample standard deviation · x̄: sample mean',
    methods: ['ci-large'],
    related: ['ci-known', 'ci-t', 'ci-summary'],
    review:
      'L4 p9 gives s=4 but prints (2.5,2.7). The given data produce approximately (1.2934,3.9066).',
  },
  {
    id: 'ci-t',
    lecture: 4,
    pages: '5–7, 11–12',
    title: 'Mean interval · small sample t',
    short: 'Account for estimated spread',
    intro:
      'For unknown population variance, a small sample and an approximately normal population, use the Student t critical value with n−1 degrees of freedom.',
    notes: [
      'Calculate α/2 and df=n−1 before selecting the t-table entry.',
      'The source’s t critical values on pages 11 and 12 do not match the stated 95% confidence. Both are explicitly flagged in the examples.',
    ],
    formulas: [
      {
        name: 'Small sample confidence interval',
        tex: '\\bar X\\pm t_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}',
      },
    ],
    conditions: [
      'n<30 and n≥2; unknown population variance.',
      'Independent random sample from an approximately normal population.',
    ],
    symbols: 'tα/2,n−1: positive t critical with upper-tail area α/2 · s: sample SD',
    methods: ['ci-t'],
    related: ['student-t', 'ci-large'],
    review: 'For 95% confidence: t(.025,11)≈2.200985, not 2.431; t(.025,19)≈2.093024, not 3.031.',
  },
  {
    id: 'ci-summary',
    lecture: 4,
    pages: '10',
    title: 'Estimate from summary statistics',
    short: 'Start with sums, finish with an interval',
    intro:
      'When given n, the sum of observations and the sum of their squares, calculate the sample mean and unbiased sample variance before constructing the interval.',
    notes: [
      'Square the total sum, divide it by n, and subtract it from the sum of squares. Divide the difference by n−1.',
      'Take the square root to obtain s. Page 10 uses n=40, so it then applies the large-sample z confidence interval.',
    ],
    formulas: [
      { name: 'Sample mean from sums', tex: '\\bar X=\\frac{\\sum x_i}{n}' },
      { name: 'Unbiased sample variance', tex: 's^2=\\frac{\\sum x_i^2-(\\sum x_i)^2/n}{n-1}' },
      { name: 'Summary confidence interval', tex: '\\bar X\\pm z_{\\alpha/2}\\frac{s}{\\sqrt n}' },
    ],
    conditions: [
      'n≥30 for the lecture’s summary-data z interval.',
      'Sum of squares must exceed (sum)²/n for positive sample spread.',
    ],
    symbols: 'Σxi: sum of sample values · Σxi²: sum of squared sample values',
    methods: ['ci-summary'],
    related: ['point-estimation', 'ci-large'],
  },
  {
    id: 'sample-size',
    lecture: 4,
    pages: '14–15',
    title: 'Error bounds & sample size',
    short: 'Plan how much data you need',
    intro:
      'Choose a sample size so the confidence half-width is no larger than the requested error bound. Page 14 gives normal and t half-width formulas.',
    notes: [
      'The source calls critical×SE “standard error”; in this workspace it is labeled confidence half-width e to distinguish it from the sampling standard error.',
      'For a z method, rearrange e=z×σ/√n to n=(zσ/e)². Round UP to satisfy the bound. If “less than” is strict and the result is exactly integral, use the next integer.',
      'For unknown σ with a large sample, use a planning estimate s and n≥30. A small-normal-sample t design depends on n through df=n−1; the app searches integer n from 2 to 29 and reports when this regime cannot meet the target.',
    ],
    formulas: [
      { name: 'Known σ half-width', tex: 'e=z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}' },
      { name: 'Unknown σ large n half-width', tex: 'e=z_{\\alpha/2}\\frac{s}{\\sqrt n}' },
      { name: 'Unknown σ small n half-width', tex: 'e=t_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}' },
      {
        name: 'Normal sample size',
        tex: 'n=\\left\\lceil\\left(\\frac{z_{\\alpha/2}\\sigma}{e}\\right)^2\\right\\rceil',
      },
    ],
    conditions: [
      'Positive spread and target error.',
      'Known σ: normal population or n≥30.',
      'Unknown σ: planning s estimate; n≥30 for z, n<30 with normality for t.',
    ],
    symbols:
      'e: target confidence half-width · n: required sample size · s: planning estimate of SD',
    methods: ['size-known', 'size-large', 'size-t'],
    related: ['standard-error', 'ci-known', 'ci-large', 'ci-t'],
    review:
      'L4 p15 prints n=132 after √n=11.76. Squaring gives 138.2976; 139 observations are required. The original answer remains visible in its example.',
  },
];
export const topicById = (id: string) => topics.find((t) => t.id === id);
export const outlineOnly = [
  'Test of hypothesis',
  'Fitting straight lines',
  'Analysis of variance',
  'Stochastics models',
  'Poisson processes',
];
