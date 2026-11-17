export type Method =
  | 'normal'
  | 'inverse'
  | 't'
  | 'chi'
  | 'f'
  | 'mean-known'
  | 'mean-large'
  | 'mean-t'
  | 'variance'
  | 'proportion'
  | 'proportion-moments'
  | 'ci-known'
  | 'ci-large'
  | 'ci-t'
  | 'ci-summary'
  | 'size-known'
  | 'size-large'
  | 'size-t'
  | 'bounds';
export type Values = Record<string, string>;
export type Inputs = Record<string, number | string | boolean>;
export interface Formula {
  name: string;
  tex: string;
}
export interface Topic {
  id: string;
  lecture: number;
  pages: string;
  title: string;
  short: string;
  intro: string;
  notes: string[];
  formulas: Formula[];
  conditions: string[];
  symbols: string;
  methods: Method[];
  related: string[];
  review?: string;
  assignment?: string;
}
export interface Example {
  id: string;
  lecture: number;
  page: number;
  topic: string;
  title: string;
  part: string;
  question: string;
  method?: Method;
  values: Values;
  sourceAnswer: string;
  review?: string;
  exercise?: boolean;
  symbolic?: boolean;
  expected?: number;
  tolerance?: number;
}
export interface Step {
  title: string;
  text: string;
  tex?: string;
}
export interface Curve {
  family: 'normal' | 't' | 'chi' | 'f';
  center: number;
  scale: number;
  df: number;
  df2: number;
  lower: number;
  upper: number;
  axis: string;
  domain?: [number, number];
}
export interface Solution {
  title: string;
  given: string;
  formula: string;
  steps: Step[];
  answer: string;
  answerTex: string;
  interpretation: string;
  value: number;
  metrics: { label: string; value: string }[];
  curve?: Curve;
  interval?: { lower: number; upper: number; center: number };
  notes: string[];
}
