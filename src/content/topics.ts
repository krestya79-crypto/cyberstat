import type { Topic } from '../types';
export const topics: Topic[] = [
  {
    id: 'normal',
    lecture: 1,
    pages: '5–8, 14–19',
    title: 'Normal distribution',
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
    methods: ['normal'],
  },
  {
    id: 'standard-normal',
    lecture: 1,
    pages: '9–13',
    title: 'Standard normal distribution',
    formulas: [
      {
        name: 'Standard normal',
        tex: 'Z\\sim N(0,1),\\quad \\varphi(z)=P(Z<z)',
      },
      {
        name: 'Symmetry',
        tex: '\\varphi(-a)=1-\\varphi(a),\\quad \\varphi(0)=0.5',
      },
      {
        name: 'Between bounds',
        tex: 'P(a<Z<b)=\\varphi(b)-\\varphi(a)',
      },
    ],
    methods: ['normal'],
  },
  {
    id: 'z-score',
    lecture: 1,
    pages: '10–11',
    title: 'Z-score & standardization',
    formulas: [
      {
        name: 'Standardization',
        tex: 'Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)',
      },
      {
        name: 'Lower / upper tail',
        tex: 'P(X<a)=\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right),\\quad P(X>a)=1-\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      },
      {
        name: 'Interval probability',
        tex: 'P(a<X<b)=\\varphi\\!\\left(\\frac{b-\\mu}{\\sigma}\\right)-\\varphi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      },
    ],
    methods: ['normal'],
  },
  {
    id: 'inverse',
    lecture: 1,
    pages: '20',
    title: 'Find an unknown normal bound',
    formulas: [
      {
        name: 'Unknown bound',
        tex: 'k=\\mu+\\sigma\\,\\varphi^{-1}(p)',
      },
      {
        name: 'Right-tail conversion',
        tex: 'P(X>k)=q\\quad\\Rightarrow\\quad p=1-q',
      },
    ],
    methods: ['inverse'],
  },
  {
    id: 'student-t',
    lecture: 2,
    pages: '2–5',
    title: 'Student’s t distribution',
    formulas: [
      {
        name: 't statistic',
        tex: 'T=\\frac{\\bar X-\\mu}{s/\\sqrt n}\\sim T(n-1)',
      },
      {
        name: 'Degrees of freedom',
        tex: '\\nu=n-1',
      },
    ],
    methods: ['t'],
  },
  {
    id: 'chi-square',
    lecture: 2,
    pages: '6–7',
    title: 'Chi-square distribution',
    formulas: [
      {
        name: 'Definition',
        tex: '\\chi^2=Z_1^2+Z_2^2+\\cdots+Z_k^2',
      },
      {
        name: 'Moments',
        tex: 'E(\\chi^2)=k,\\quad V(\\chi^2)=2k',
      },
    ],
    methods: ['chi'],
  },
  {
    id: 'f-distribution',
    lecture: 2,
    pages: '8–9',
    title: 'F distribution',
    formulas: [
      {
        name: 'F ratio',
        tex: 'F=\\frac{U_1/d_1}{U_2/d_2}\\sim F(d_1,d_2)',
      },
      {
        name: 'F mean',
        tex: 'E(F)=\\frac{d_2}{d_2-2}\\quad(d_2>2)',
      },
      {
        name: 'F variance',
        tex: 'V(F)=\\frac{2d_2^2(d_1+d_2-2)}{d_1(d_2-2)^2(d_2-4)}\\quad(d_2>4)',
      },
    ],
    methods: ['f'],
  },
  {
    id: 'sampling-foundations',
    lecture: 2,
    pages: '10',
    title: 'Populations, samples & statistics',
    formulas: [
      {
        name: 'Population / sample symbols',
        tex: '(N,\\mu,\\sigma^2,\\sigma)\\quad\\longleftrightarrow\\quad(n,\\bar X,s^2,s)',
      },
    ],
    methods: [],
  },
  {
    id: 'sampling-mean',
    lecture: 2,
    pages: '11–18',
    title: 'Sampling distribution of the mean',
    formulas: [
      {
        name: 'Sampling mean moments',
        tex: 'E(\\bar X)=\\mu,\\quad V(\\bar X)=\\frac{\\sigma^2}{n}',
      },
      {
        name: 'Known σ statistic',
        tex: 'Z=\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}',
      },
      {
        name: 'Unknown σ, large n',
        tex: 'Z\\approx\\frac{\\bar X-\\mu}{s/\\sqrt n}',
      },
      {
        name: 'Unknown σ, small n',
        tex: 'T=\\frac{\\bar X-\\mu}{s/\\sqrt n}\\sim T(n-1)',
      },
    ],
    methods: ['mean-known', 'mean-large', 'mean-t'],
  },
  {
    id: 'standard-error',
    lecture: 2,
    pages: '11–13',
    title: 'Standard error',
    formulas: [
      {
        name: 'Standard error of the mean',
        tex: '\\sigma_{\\bar X}=\\frac{\\sigma}{\\sqrt n}',
      },
      {
        name: 'Estimated standard error',
        tex: '\\widehat{SE}(\\bar X)=\\frac{s}{\\sqrt n}',
      },
    ],
    methods: ['mean-known', 'mean-large', 'mean-t'],
  },
  {
    id: 'clt',
    lecture: 2,
    pages: '12–13',
    title: 'Central limit theorem',
    formulas: [
      {
        name: 'CLT standardization',
        tex: '\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}\\approx N(0,1)',
      },
    ],
    methods: ['mean-known', 'mean-large'],
  },
  {
    id: 'sampling-variance',
    lecture: 3,
    pages: '2–5',
    title: 'Sampling distribution of variance',
    formulas: [
      {
        name: 'Variance statistic',
        tex: '\\frac{(n-1)s^2}{\\sigma^2}\\sim\\chi^2(n-1)',
      },
      {
        name: 'Sample variance moments',
        tex: 'E(s^2)=\\sigma^2,\\quad V(s^2)=\\frac{2\\sigma^4}{n-1}',
      },
      {
        name: 'Chi-square interval',
        tex: 'P(a<\\chi^2<b)=P(\\chi^2>a)-P(\\chi^2>b)',
      },
    ],
    methods: ['variance'],
  },
  {
    id: 'proportion',
    lecture: 3,
    pages: '6–13',
    title: 'Sampling distribution of a proportion',
    formulas: [
      {
        name: 'Sample proportion',
        tex: '\\hat P=\\frac{X}{n},\\quad0\\leq\\hat P\\leq1',
      },
      {
        name: 'Proportion moments',
        tex: 'E(\\hat P)=P,\\quad V(\\hat P)=\\frac{P(1-P)}{n}',
      },
      {
        name: 'Proportion z',
        tex: 'Z=\\frac{\\hat P-P}{\\sqrt{P(1-P)/n}}\\approx N(0,1)',
      },
      {
        name: 'Approximation conditions',
        tex: 'nP\\geq5,\\quad n(1-P)\\geq5',
      },
    ],
    methods: ['proportion', 'proportion-moments'],
  },
  {
    id: 'point-estimation',
    lecture: 4,
    pages: '2',
    title: 'Point estimation',
    formulas: [
      {
        name: 'Lecture illustrations',
        tex: '\\hat\\mu=120,\\quad\\widehat{\\sigma^2}=16',
      },
      {
        name: 'Summary estimates',
        tex: '\\bar X=\\frac{\\sum x_i}{n},\\quad s^2=\\frac{\\sum x_i^2-(\\sum x_i)^2/n}{n-1}',
      },
    ],
    methods: ['ci-summary'],
  },
  {
    id: 'interval-estimation',
    lecture: 4,
    pages: '2–5',
    title: 'Interval estimation',
    formulas: [
      {
        name: 'Source interval illustrations',
        tex: '80<\\mu<120,\\quad10<\\sigma^2<16',
      },
      {
        name: 'Pivotal inequality',
        tex: 'P\\!\\left(-z_{\\alpha/2}<\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}<z_{\\alpha/2}\\right)=1-\\alpha',
      },
      {
        name: 'Rearranged mean interval',
        tex: '\\bar X-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}<\\mu<\\bar X+z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
      },
    ],
    methods: ['ci-known', 'ci-large', 'ci-t'],
  },
  {
    id: 'confidence-level',
    lecture: 4,
    pages: '3, 7',
    title: 'Confidence levels & limits',
    formulas: [
      {
        name: 'Confidence definition',
        tex: 'P(A<\\theta<B)=1-\\alpha',
      },
      {
        name: 'Width and limits',
        tex: 'LCL=A,\\quad UCL=B,\\quad W=B-A',
      },
    ],
    methods: ['bounds'],
  },
  {
    id: 'ci-known',
    lecture: 4,
    pages: '4–8, 13',
    title: 'Mean interval · known σ',
    formulas: [
      {
        name: 'Known σ confidence interval',
        tex: '\\bar X\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
      },
    ],
    methods: ['ci-known'],
  },
  {
    id: 'ci-large',
    lecture: 4,
    pages: '5–7, 9',
    title: 'Mean interval · unknown σ, large n',
    formulas: [
      {
        name: 'Large sample confidence interval',
        tex: '\\bar X\\pm z_{\\alpha/2}\\frac{s}{\\sqrt n}',
      },
    ],
    methods: ['ci-large'],
  },
  {
    id: 'ci-t',
    lecture: 4,
    pages: '5–7, 11–12',
    title: 'Mean interval · small sample t',
    formulas: [
      {
        name: 'Small sample confidence interval',
        tex: '\\bar X\\pm t_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}',
      },
    ],
    methods: ['ci-t'],
  },
  {
    id: 'ci-summary',
    lecture: 4,
    pages: '10',
    title: 'Estimate from summary statistics',
    formulas: [
      {
        name: 'Sample mean from sums',
        tex: '\\bar X=\\frac{\\sum x_i}{n}',
      },
      {
        name: 'Unbiased sample variance',
        tex: 's^2=\\frac{\\sum x_i^2-(\\sum x_i)^2/n}{n-1}',
      },
      {
        name: 'Summary confidence interval',
        tex: '\\bar X\\pm z_{\\alpha/2}\\frac{s}{\\sqrt n}',
      },
    ],
    methods: ['ci-summary'],
  },
  {
    id: 'sample-size',
    lecture: 4,
    pages: '14–15',
    title: 'Error bounds & sample size',
    formulas: [
      {
        name: 'Known σ half-width',
        tex: 'e=z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
      },
      {
        name: 'Unknown σ large n half-width',
        tex: 'e=z_{\\alpha/2}\\frac{s}{\\sqrt n}',
      },
      {
        name: 'Unknown σ small n half-width',
        tex: 'e=t_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}',
      },
      {
        name: 'Normal sample size',
        tex: 'n=\\left\\lceil\\left(\\frac{z_{\\alpha/2}\\sigma}{e}\\right)^2\\right\\rceil',
      },
    ],
    methods: ['size-known', 'size-large', 'size-t'],
  },
];
export const topicById = (id: string) => topics.find((t) => t.id === id);
