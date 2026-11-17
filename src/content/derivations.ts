import { topics } from './topics';

export interface DerivationStep {
  title: string;
  tex: string;
  explanation: string;
  expanded?: boolean;
}
export interface LectureDerivation {
  id: string;
  lecture: number;
  topic: string;
  title: string;
  pages: number[];
  kind: 'derivation' | 'worked';
  assumptions: string;
  notation: string;
  scope: string;
  steps: DerivationStep[];
  review?: { text: string; printed?: string; corrected?: string };
}
const s = (title: string, tex: string, explanation: string, expanded = false): DerivationStep => ({
  title,
  tex,
  explanation,
  expanded,
});
const normal =
  'X has a normal distribution with mean μ and variance σ²; σ>0. For an interval, a<b.';
const normalNotation =
  'The lecturer writes φ for the standard normal cumulative probability, not the density: φ(z)=P(Z<z).';
const sampleVariance =
  'X₁,…,Xₙ is a random sample from a normal population with mean μ and variance σ²; n>1 and σ²>0.';

// Transcribed after inspecting all 70 pages of the four original project PDFs.
// Explanations and explicitly marked algebra expansions are editorial, not lecturer quotations.
export const lectureDerivations: LectureDerivation[] = [
  {
    id: 'normal-lower',
    lecture: 1,
    topic: 'Normal distribution · Remark i',
    title: 'Lower-tail normal probability',
    pages: [10, 11],
    kind: 'derivation',
    assumptions: normal,
    notation: normalNotation,
    scope:
      'Page 10 states standardization. Remark i on page 11 transforms the event and identifies its cumulative probability; it does not prove the normal transformation theorem.',
    steps: [
      s('Start with the event', 'P(X<a)', 'The required event is a value below a.'),
      s(
        'Subtract the mean and divide by σ',
        'P(X<a)=P\\left(\\frac{X-\\mu}{\\sigma}<\\frac{a-\\mu}{\\sigma}\\right)',
        'Apply the same transformation to X and the bound. Because σ is positive, the inequality keeps its direction.',
      ),
      s(
        'Change X to Z',
        '=P\\left(Z<\\frac{a-\\mu}{\\sigma}\\right)',
        'Use Z=(X−μ)/σ from page 10; the event has the same probability.',
      ),
      s(
        'Read the standard normal table',
        '=\\varphi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
        'The lecturer’s φ gives the probability to the left of the standardized bound.',
      ),
    ],
  },
  {
    id: 'normal-upper',
    lecture: 1,
    topic: 'Normal distribution · Remark ii',
    title: 'Upper-tail normal probability',
    pages: [10, 11],
    kind: 'derivation',
    assumptions: normal,
    notation: normalNotation,
    scope: 'Remark ii gives the event transformation followed by the complement rule.',
    steps: [
      s('Start with the upper event', 'P(X>a)', 'The required area is to the right of a.'),
      s(
        'Standardize both sides',
        '=P\\left(\\frac{X-\\mu}{\\sigma}>\\frac{a-\\mu}{\\sigma}\\right)',
        'Subtract μ and divide by the positive σ, keeping the greater-than signs.',
      ),
      s(
        'Use the standard normal variable',
        '=P\\left(Z>\\frac{a-\\mu}{\\sigma}\\right)',
        'Replace (X−μ)/σ by Z.',
      ),
      s(
        'Subtract the left area from one',
        '=1-\\varphi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
        'A continuous distribution has zero probability at the bound. The right and left areas therefore add to one.',
      ),
    ],
  },
  {
    id: 'normal-between',
    lecture: 1,
    topic: 'Normal distribution · Remark iii',
    title: 'Normal probability between two bounds',
    pages: [11, 15],
    kind: 'derivation',
    assumptions: normal,
    notation: normalNotation,
    scope:
      'The event transformations follow Remark iii on page 11. Its final subtraction contains a printed error; the worked example on page 15 uses the lower argument correctly.',
    steps: [
      s(
        'Start with both bounds',
        'P(a<X<b)',
        'Keep the lower bound a and upper bound b in their original order.',
      ),
      s(
        'Transform all three terms',
        '=P\\left(\\frac{a-\\mu}{\\sigma}<\\frac{X-\\mu}{\\sigma}<\\frac{b-\\mu}{\\sigma}\\right)',
        'Subtract μ from all three terms, then divide all three by σ>0. Both inequality directions remain unchanged.',
      ),
      s(
        'Change X to Z',
        '=P\\left(\\frac{a-\\mu}{\\sigma}<Z<\\frac{b-\\mu}{\\sigma}\\right)',
        'Only the middle term is replaced by Z; the standardized endpoints stay in place.',
      ),
      s(
        'Final line as printed on page 11',
        '=\\varphi\\left(\\frac{b-\\mu}{\\sigma}\\right)-\\varphi\\left(\\frac{b-\\mu}{\\sigma}\\right)',
        'The slide repeats b in the subtracted term. This is a source transcription, not a valid interval-probability identity.',
      ),
    ],
    review: {
      text: 'Editorial correction: subtract the cumulative probability at the lower bound a, not b. Page 15(b) confirms the intended sequence with φ(3)−φ(−2). The source PDF remains unchanged.',
      corrected:
        'P(a<X<b)=\\varphi\\left(\\frac{b-\\mu}{\\sigma}\\right)-\\varphi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
    },
  },
  {
    id: 'inverse-left',
    lecture: 1,
    topic: 'Find an unknown normal bound · Example a',
    title: 'Solving for a lower-tail normal bound',
    pages: [20],
    kind: 'worked',
    assumptions: 'The example specifies X~N(12,9), so μ=12 and σ=3; P(X<k)=0.9875.',
    notation: normalNotation,
    scope:
      'A worked algebraic application, not a general proof of the inverse normal distribution. The Notebook’s inverse-function notation summarizes this example.',
    steps: [
      s(
        'Standardize the unknown bound',
        'P(X<k)=P\\left(\\frac{X-\\mu}{\\sigma}<\\frac{k-12}{3}\\right)',
        'Substitute the given population mean 12 and standard deviation 3.',
      ),
      s(
        'Write the cumulative probability',
        '=P\\left(Z<\\frac{k-12}{3}\\right)=\\varphi\\left(\\frac{k-12}{3}\\right)=0.9875',
        'The standardized upper endpoint is the table argument whose left probability is 0.9875.',
      ),
      s(
        'Use the lecturer’s table value',
        '\\frac{k-12}{3}=2.24',
        'Page 20 reads 2.24 from the standard normal table; this is rounded table work.',
      ),
      s('Multiply by 3', 'k-12=6.72', 'Multiplying both sides by 3 removes the denominator.'),
      s('Add 12', 'k=18.72', 'Adding the population mean isolates the requested bound.'),
    ],
  },
  {
    id: 'inverse-right',
    lecture: 1,
    topic: 'Find an unknown normal bound · Example b',
    title: 'Converting a right-tail probability before solving',
    pages: [20],
    kind: 'worked',
    assumptions: 'The same example has X~N(12,9) and asks for P(X>k)=0.25.',
    notation: normalNotation,
    scope:
      'The slide works through the right-tail complement and table lookup, then contains an inconsistent mean in its final algebra.',
    steps: [
      s(
        'Standardize the upper event',
        'P(X>k)=P\\left(\\frac{X-\\mu}{\\sigma}>\\frac{k-12}{3}\\right)=P\\left(Z>\\frac{k-12}{3}\\right)',
        'The original mean remains 12 and standard deviation remains 3.',
      ),
      s(
        'Use the complement',
        '1-\\varphi\\left(\\frac{k-12}{3}\\right)=0.25',
        'The right-tail area is one minus the left cumulative area.',
      ),
      s(
        'Isolate the cumulative area',
        '\\varphi\\left(\\frac{k-12}{3}\\right)=0.75',
        'Rearrange 1−φ=0.25 to obtain φ=0.75.',
      ),
      s(
        'Read the printed table value',
        '\\frac{k-12}{3}=0.675',
        'The lecturer uses the rounded standard normal argument 0.675.',
      ),
      s(
        'Final algebra as printed',
        'k-8=2.025\\quad\\Longrightarrow\\quad k=10.025',
        'The printed line changes 12 to 8. This is inconsistent with the preceding line and is retained only as source evidence.',
      ),
    ],
    review: {
      text: 'Editorial correction using the lecturer’s rounded 0.675: multiplying by 3 must give k−12=2.025, and adding 12 gives k=14.025. This is separate from the source’s printed answer; full-precision calculation is available in Statistical Solver.',
      corrected: 'k-12=2.025\\quad\\Longrightarrow\\quad k=14.025',
    },
  },
  {
    id: 'normal-bands',
    lecture: 1,
    topic: 'Normal distribution · Symbolic example',
    title: 'Canceling σ in normal interval bounds',
    pages: [19],
    kind: 'worked',
    assumptions: 'X~N(8,σ²), with σ>0. The two intervals are 8−σ to 8+σ, and 8−2σ to 8+3σ.',
    notation: normalNotation,
    scope:
      'Two worked symbolic applications of the interval rule. This is not a proof of all three empirical-rule percentages.',
    steps: [
      s(
        'Standardize the first interval',
        'P(8-\\sigma<X<8+\\sigma)=P\\left(\\frac{(8-\\sigma)-8}{\\sigma}<\\frac{X-\\mu}{\\sigma}<\\frac{(8+\\sigma)-8}{\\sigma}\\right)',
        'Subtract the mean 8 and divide every term by σ.',
      ),
      s(
        'Cancel the endpoint factors',
        '=P(-1<Z<1)',
        'The lower numerator is −σ and the upper numerator is σ; dividing by σ gives −1 and 1.',
      ),
      s(
        'Subtract table probabilities',
        '=\\varphi(1)-\\varphi(-1)=0.8413-0.1587=0.6826',
        'The lecturer uses four-decimal table values.',
      ),
      s(
        'Standardize the second interval',
        'P(8-2\\sigma<X<8+3\\sigma)=P\\left(\\frac{(8-2\\sigma)-8}{\\sigma}<\\frac{X-\\mu}{\\sigma}<\\frac{(8+3\\sigma)-8}{\\sigma}\\right)',
        'Apply exactly the same transformation to the asymmetric endpoints.',
      ),
      s(
        'Cancel σ and subtract the table entries',
        '=P(-2<Z<3)=\\varphi(3)-\\varphi(-2)=0.9987-0.0228=0.9759',
        'The new standardized endpoints are −2 and 3; the same cumulative subtraction applies.',
      ),
    ],
  },
  {
    id: 'variance-expectation',
    lecture: 3,
    topic: 'Sampling distribution of the variance · Remark',
    title: 'Expectation of the sample variance',
    pages: [2],
    kind: 'derivation',
    assumptions: sampleVariance,
    notation:
      'The lecturer uses s² for sample variance, E for expectation, V for variance, and χ² with n−1 degrees of freedom.',
    scope:
      'The derivation starts from the stated chi-square sampling law and its stated mean. Neither underlying theorem is proved in these PDFs.',
    steps: [
      s(
        'Use the stated chi-square mean',
        'E\\left(\\frac{(n-1)s^2}{\\sigma^2}\\right)=n-1',
        'The slide first states (n−1)s²/σ²~χ²(n−1). The mean of χ² with n−1 degrees of freedom is n−1, as stated in Lecture 2, page 6.',
      ),
      s(
        'Move the constant outside expectation',
        '\\frac{n-1}{\\sigma^2}E(s^2)=n-1',
        'n and σ² are fixed constants. Expectation scales by the same constant.',
      ),
      s(
        'Divide by the positive constant',
        'E(s^2)=\\frac{\\sigma^2}{n-1}(n-1)',
        'Multiply both sides by σ²/(n−1). This intermediate algebra expands the arrow on the slide.',
        true,
      ),
      s(
        'Cancel n−1',
        'E(s^2)=\\sigma^2',
        'Since n>1, the common factor n−1 cancels. The sample variance is unbiased under the stated assumptions.',
      ),
    ],
  },
  {
    id: 'variance-variance',
    lecture: 3,
    topic: 'Sampling distribution of the variance · Remark',
    title: 'Variance of the sample variance',
    pages: [2],
    kind: 'derivation',
    assumptions: sampleVariance,
    notation:
      'V(s²) is the variance of the statistic s²; σ⁴=(σ²)². V(cY)=c²V(Y) is used in the lecturer’s second arrow chain.',
    scope:
      'The lecturer uses the stated chi-square variance 2(n−1), without deriving the chi-square distribution itself.',
    steps: [
      s(
        'Use the stated chi-square variance',
        'V\\left(\\frac{(n-1)s^2}{\\sigma^2}\\right)=2(n-1)',
        'The transformed sample variance has n−1 degrees of freedom, so its variance is 2(n−1); Lecture 2, page 6 states V(χ²)=2k.',
      ),
      s(
        'Square the fixed multiplier',
        '\\frac{(n-1)^2}{\\sigma^4}V(s^2)=2(n-1)',
        'Variance scales by the square of (n−1)/σ², giving (n−1)²/σ⁴ rather than the unsquared multiplier.',
      ),
      s(
        'Isolate V(s²)',
        'V(s^2)=\\frac{2(n-1)\\sigma^4}{(n-1)^2}',
        'Multiply both sides by σ⁴/(n−1)². This expands the slide’s final arrow.',
        true,
      ),
      s(
        'Cancel one factor n−1',
        'V(s^2)=\\frac{2\\sigma^4}{n-1}',
        'There are two factors n−1 in the denominator and one in the numerator; cancel one, using n>1.',
      ),
    ],
  },
  {
    id: 'known-mean-interval',
    lecture: 4,
    topic: 'Interval estimation form the population mean (μ)',
    title: 'Confidence interval for the population mean · known variance',
    pages: [4, 5],
    kind: 'derivation',
    assumptions:
      'A random sample of size n, population mean μ, known population variance σ²>0. Page 5 requires a normally distributed population or n≥30. The latter is the lecturer’s large-sample normal approximation; 0<α<1.',
    notation:
      'X̄ is the sample mean. z_{α/2} is the positive upper-tail standard normal critical value, leaving α/2 in each tail. Page 5 calls the coverage (1−α)100%.',
    scope:
      'This is the full inequality rearrangement on pages 4–5, in the printed order. It takes the normal pivot as given. Unknown-variance interval derivations are assigned on page 5, not supplied.',
    steps: [
      s(
        'Start from the stated pivot',
        'Z=\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}\\sim N(0,1)',
        'The denominator is the positive standard error σ/√n. For non-normal populations with large n, read the normal law approximately.',
      ),
      s(
        'Choose the central normal area',
        'P(-z_{\\alpha/2}<Z<z_{\\alpha/2})=1-\\alpha',
        'The two tails each contain α/2, leaving the central probability 1−α.',
      ),
      s(
        'Substitute for Z',
        'P\\left(-z_{\\alpha/2}<\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}<z_{\\alpha/2}\\right)=1-\\alpha',
        'Replace the middle variable with the stated standardized sample mean.',
      ),
      s(
        'Multiply all three terms by σ/√n',
        'P\\left(-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}<\\bar X-\\mu<z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}\\right)=1-\\alpha',
        'The denominator is positive, so multiplication removes it without reversing either inequality.',
      ),
      s(
        'Subtract X̄ from all three terms',
        'P\\left(-\\bar X-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}<-\\mu<-\\bar X+z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}\\right)=1-\\alpha',
        'The center X̄−μ becomes −μ; both outer expressions also lose X̄.',
      ),
      s(
        'Multiply by −1 and reverse both inequalities',
        'P\\left(\\bar X+z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}>\\mu>\\bar X-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}\\right)=1-\\alpha',
        'Negation changes < to > in both places. This descending form is the last line on page 4.',
      ),
      s(
        'Write the limits in increasing order',
        '\\bar X-z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}<\\mu<\\bar X+z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}',
        'Page 5 writes the lower confidence limit first and upper confidence limit last. These random limits form the (1−α)100% confidence interval; μ is a fixed population parameter.',
      ),
    ],
  },
  {
    id: 'summary-example',
    lecture: 4,
    topic: 'Interval estimation · Summary-statistics example',
    title: 'Using sums to calculate mean and sample variance',
    pages: [10],
    kind: 'worked',
    assumptions:
      'The given random sample has n=40, Σxᵢ=280 and Σxᵢ²=2100. The large-sample interval uses the estimated standard deviation s.',
    notation:
      'The slide writes X̄, S² and s. Its working rounds the variance to 3.59 and standard deviation to 1.89.',
    scope:
      'The sample mean and computational variance identities are applied without proof. This entry reproduces the worked substitution, not an invented derivation of those identities.',
    steps: [
      s(
        'Determine the normal critical value',
        '1-\\alpha=0.95\\Rightarrow\\alpha=0.05\\Rightarrow\\alpha/2=0.025\\Rightarrow Z_{0.025}=1.96',
        'The page begins with a 95% confidence level and the standard normal table.',
      ),
      s(
        'Calculate the sample mean',
        '\\bar X=\\frac{\\sum_{i=1}^{40}x_i}{n}=\\frac{280}{40}=7',
        'Divide the supplied sum by the sample size.',
      ),
      s(
        'Substitute into the stated variance identity',
        'S^2=\\frac{1}{n-1}\\left[\\sum_{i=1}^{40}x_i^2-\\frac{(\\sum_{i=1}^{40}x_i)^2}{n}\\right]=\\frac{1}{40-1}\\left[2100-\\frac{280^2}{40}\\right]',
        'Square the total 280, divide it by 40, subtract from the sum of squares, then divide by 39.',
      ),
      s(
        'Evaluate the subtraction before dividing',
        'S^2=\\frac{2100-1960}{39}=\\frac{140}{39}\\approx3.59',
        'This arithmetic expands the substitution line; no sample observations are inferred.',
        true,
      ),
      s(
        'Take the square root',
        's=\\sqrt{S^2}\\approx1.89',
        'The slide uses 1.89 for subsequent table-based arithmetic.',
      ),
      s(
        'Insert the sample estimates into the interval',
        '7-1.96\\frac{1.89}{\\sqrt{40}}<\\mu<7+1.96\\frac{1.89}{\\sqrt{40}}',
        'Use the large-sample unknown-variance interval stated on page 6.',
      ),
      s(
        'Report the printed rounded limits',
        '6.41<\\mu<7.59',
        'These are the slide’s rounded limits; Statistical Solver keeps intermediate numerical precision.',
      ),
    ],
  },
  {
    id: 'sample-size-example',
    lecture: 4,
    topic: 'Very Important Remark · Sample size',
    title: 'Rearranging the error bound to find sample size',
    pages: [14, 15],
    kind: 'worked',
    assumptions:
      'The example has X̄=2.6, s=0.3 and e=0.05 at 95% confidence. Page 14 uses the unknown-variance z rule for n≥30.',
    notation:
      'Page 14 calls the confidence half-width “standard error” and writes SE. This terminology is preserved here; it differs from sampling SE=s/√n. Page 15 prints σ in the general line but substitutes the supplied s=0.3.',
    scope:
      'A worked rearrangement is supplied; the general squared expression and ceiling in Formula Notebook are application notation, not a printed lecture proof. The slide’s final squaring is erroneous.',
    steps: [
      s(
        'Select the critical value',
        '1-\\alpha=0.95\\Rightarrow\\alpha=0.05\\Rightarrow\\alpha/2=0.025\\Rightarrow Z_{0.025}=1.96',
        'Follow the lecture’s confidence-level and table sequence.',
      ),
      s(
        'Use the printed SE expression and substitute',
        'SE=z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}\\quad\\Longrightarrow\\quad0.05=1.96\\frac{0.3}{\\sqrt n}',
        'The general line is transcribed with σ as printed. The numeric line uses the problem’s sample standard deviation s=0.3.',
      ),
      s(
        'Multiply by √n and divide by 0.05',
        '\\sqrt n=\\frac{1.96(0.3)}{0.05}=11.76',
        'Multiplication gives 0.05√n=1.96×0.3, and division by 0.05 isolates √n. This explains the slide’s next arrow.',
      ),
      s(
        'Final numerical line as printed',
        'n=132.3\\simeq132',
        'The slide prints this after √n=11.76, but it is not the square of 11.76.',
      ),
    ],
    review: {
      text: 'Editorial correction, separate from the lecture: 11.76²=138.2976. An integer sample size must be rounded up to meet the error bound, giving n=139, not 132. The Notebook ceiling is this application safeguard; the lecturer does not print it.',
      corrected:
        'n\\geq\\left(\\frac{1.96(0.3)}{0.05}\\right)^2=138.2976\\quad\\Longrightarrow\\quad n_{\\min}=139',
    },
  },
];

type CoverageKind = 'derivation' | 'stated' | 'worked' | 'assignment';
interface CoverageRule {
  pages: number[];
  note: string;
  kind?: CoverageKind;
  proofs?: string[];
}
const rule = (
  pages: number[],
  note: string,
  kind: CoverageKind = 'stated',
  proofs: string[] = [],
): CoverageRule => ({ pages, note, kind, proofs });
// One audit record per existing Notebook formula; no inferred lecture proofs.
const coverage: Record<string, CoverageRule[]> = {
  normal: [
    rule([5], 'The density is stated. No density derivation or normalization proof is provided.'),
    rule(
      [7, 8, 19],
      'The three empirical percentages are stated. Page 19 works a one-σ interval and an asymmetric interval, not a proof of all three percentages.',
      'worked',
      ['normal-bands'],
    ),
  ],
  'standard-normal': [
    rule(
      [9, 10, 11],
      'N(0,1) and the table convention for φ are stated; no distribution proof is given.',
    ),
    rule(
      [11, 16],
      'Symmetry and φ(0)=0.5 are stated, not proved. Remark iv prints φ(−a)=1−φ(−a), an apparent typo. Page 16 uses φ(−1.4)=1−φ(1.4). The Notebook uses the corrected identity.',
    ),
    rule(
      [11, 15],
      'Remark iii supplies the interval transformation; its final repeated upper argument is flagged in the derivation.',
      'derivation',
      ['normal-between'],
    ),
  ],
  'z-score': [
    rule(
      [10],
      'The normal standardization law is stated without a proof of the transformed distribution. Page 11 uses it to transform probabilities.',
    ),
    rule(
      [11],
      'Remarks i and ii give the lower- and upper-tail transformation chains.',
      'derivation',
      ['normal-lower', 'normal-upper'],
    ),
    rule(
      [11, 15],
      'Remark iii transforms both endpoints. The printed subtraction error is preserved and identified.',
      'derivation',
      ['normal-between'],
    ),
  ],
  inverse: [
    rule(
      [20],
      'Unknown bounds are solved by table lookup and algebra in examples, not a general inverse-function proof. φ⁻¹ is Notebook notation.',
      'worked',
      ['inverse-left', 'inverse-right'],
    ),
    rule(
      [20],
      'The right-tail example converts 0.25 to the cumulative probability 0.75.',
      'worked',
      ['inverse-right'],
    ),
  ],
  'student-t': [
    rule(
      [2, 13],
      'Page 2 gives usage conditions; page 13 states the t statistic and T(n−1) law without proof: unknown variance, approximately normal population and n<30.',
    ),
    rule(
      [3, 5],
      'Degrees of freedom are described and n−1 is calculated in an example; no general derivation is supplied.',
    ),
  ],
  'chi-square': [
    rule(
      [6],
      'The sum of independent squared standard normal variables defines χ². No distribution derivation is supplied.',
    ),
    rule(
      [6],
      'E(χ²)=k and V(χ²)=2k are stated without proof. Lecture 3 uses these stated moments.',
    ),
  ],
  'f-distribution': [
    rule(
      [8],
      'The ratio of independent chi-square variables divided by their respective degrees of freedom is a definition, without a distribution proof.',
    ),
    rule(
      [8],
      'The mean is stated without proof. The Notebook adds d₂>2 as a mathematical existence restriction; that restriction is not printed on the slide.',
    ),
    rule(
      [8],
      'The variance is stated without proof. The Notebook adds d₂>4 as a mathematical existence restriction; that restriction is not printed on the slide.',
    ),
  ],
  'sampling-foundations': [
    rule([10], 'This is a population/sample notation table, not a derived formula.'),
  ],
  'sampling-mean': [
    rule(
      [11],
      'The sampling mean and variance are stated. There is no expectation/variance calculation proving them.',
    ),
    rule(
      [12, 13],
      'The normal-population theorem and known-variance normal pivot are stated without proof. Page 13 also permits the large-sample n≥30 approximation.',
    ),
    rule(
      [13],
      'The unknown-variance large-sample z rule is stated for n≥30, not derived. The Notebook marks its approximate nature.',
    ),
    rule(
      [13],
      'The small-sample t rule is stated for unknown variance, approximately normal population and n<30, without proof.',
    ),
  ],
  'standard-error': [
    rule([11], 'The standard error σ/√n is stated in a Remark, without a displayed derivation.'),
    rule(
      [13],
      's/√n appears in the stated unknown-variance statistics. The Notebook’s estimated-SE notation is an application label, not a separate lecture derivation.',
    ),
  ],
  clt: [
    rule(
      [12, 13],
      'The Central limit theorem is stated, not proved. Page 12 says approximately normal for a large enough sample; page 13 uses n≥30.',
    ),
  ],
  'sampling-variance': [
    rule(
      [2],
      'The χ²(n−1) sampling law for normal populations is stated without proof; the following Remark uses it.',
    ),
    rule(
      [2],
      'The Remark derives both E(s²) and V(s²) by scaling the stated chi-square moments.',
      'derivation',
      ['variance-expectation', 'variance-variance'],
    ),
    rule(
      [2, 3],
      'The upper-tail subtraction identity is stated in the Remark and applied on page 3. No separate proof is provided.',
    ),
  ],
  proportion: [
    rule([6], 'P̂=X/n and its range are definitions, not proved results.'),
    rule(
      [7],
      'Expectation and variance of P̂ are stated without proof; numerical examples apply them.',
    ),
    rule([7], 'The standardized proportion and normal approximation are stated without proof.'),
    rule(
      [7],
      'The lecturer’s thresholds np≥5 and n(1−p)≥5 are stated conditions, not a proved error bound.',
    ),
  ],
  'point-estimation': [
    rule(
      [2],
      'These are illustrative point-estimate values; no observations or derivation are supplied.',
    ),
    rule(
      [10],
      'The identities are applied to given summary statistics, not derived from deviations.',
      'worked',
      ['summary-example'],
    ),
  ],
  'interval-estimation': [
    rule([2], 'These are interval illustrations, without data or a derivation.'),
    rule(
      [4],
      'The pivotal inequality is part of the displayed known-variance interval derivation.',
      'derivation',
      ['known-mean-interval'],
    ),
    rule([4, 5], 'Pages 4–5 rearrange the pivotal inequality to isolate μ.', 'derivation', [
      'known-mean-interval',
    ]),
  ],
  'confidence-level': [
    rule(
      [3],
      'This defines confidence coverage using random interval endpoints A and B, not a proved theorem.',
    ),
    rule([3], 'LCL, UCL and width B−A are definitions; no proof is needed or supplied.'),
  ],
  'ci-known': [
    rule(
      [4, 5, 6],
      'The full known-variance derivation is supplied on pages 4–5, then summarized on page 6.',
      'derivation',
      ['known-mean-interval'],
    ),
  ],
  'ci-large': [
    rule(
      [5, 6, 9],
      'Page 5 assigns this derivation. Page 6 states the interval and page 9 applies it; the algebraic proof is not supplied.',
      'assignment',
    ),
  ],
  'ci-t': [
    rule(
      [5, 6, 11, 12],
      'Page 5 assigns this derivation. Page 6 states the t interval; pages 11–12 are numerical applications, not its proof.',
      'assignment',
    ),
  ],
  'ci-summary': [
    rule(
      [10],
      'The mean identity is applied to the supplied sum and sample size, without a general proof.',
      'worked',
      ['summary-example'],
    ),
    rule(
      [10],
      'The computational variance identity is substituted into, not derived from the sum of centered squares.',
      'worked',
      ['summary-example'],
    ),
    rule(
      [6, 10],
      'The large-sample interval is applied to summary estimates. Its unknown-variance derivation is assigned, not supplied.',
      'assignment',
      ['summary-example'],
    ),
  ],
  'sample-size': [
    rule(
      [14],
      'The lecturer calls this confidence half-width “standard error” and writes SE. It is stated without derivation.',
    ),
    rule(
      [14, 15],
      'The SE expression is stated; page 15 numerically rearranges it to find a sample size.',
      'worked',
      ['sample-size-example'],
    ),
    rule(
      [14],
      'The t half-width is stated for an approximately normal population, unknown variance and n<30; no derivation is supplied.',
    ),
    rule(
      [15],
      'Page 15 rearranges a numeric error bound, but does not print a general squared/ceiling formula. The ceiling is an application safeguard.',
      'worked',
      ['sample-size-example'],
    ),
  ],
};
export const coverageLabels: Record<CoverageKind, string> = {
  derivation: 'Lecture derivation provided',
  stated: 'No lecture derivation provided',
  worked: 'Worked application · no general proof',
  assignment: 'Derivation assigned · not provided',
};
export const formulaCoverage = topics.flatMap((topic) =>
  topic.formulas.map((formula, index) => {
    const entry = coverage[topic.id]?.[index];
    if (!entry) throw new Error(`Missing lecture audit for ${topic.id}:${index}`);
    return {
      ...entry,
      kind: entry.kind ?? ('stated' as CoverageKind),
      proofs: entry.proofs ?? [],
      key: `${topic.id}:${index}`,
      topic,
      formula,
    };
  }),
);
export const coverageFor = (topicId: string, index: number) =>
  formulaCoverage.find((c) => c.key === `${topicId}:${index}`)!;
export const derivationsUrl = (key?: string) =>
  `#/formulas?view=proofs${key ? `&entry=${encodeURIComponent(key)}` : ''}`;
export const notebookUrl = (key: string) => `#/formulas?entry=${encodeURIComponent(key)}`;
