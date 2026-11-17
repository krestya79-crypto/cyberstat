import type { Curve, Solution } from '../types';
export interface Point {
  x: number;
  y: number;
}
export type StatisticalPlot =
  | {
      kind: 'descriptive';
      data: number[];
      mean: number;
      median: number;
      q1: number;
      q3: number;
      whiskerLow: number;
      whiskerHigh: number;
      bins: { low: number; high: number; count: number }[];
    }
  | {
      kind: 'bars';
      labels: string[];
      values: number[];
      comparison?: number[];
      yLabel: string;
      caption: string;
    }
  | { kind: 'discrete'; points: { x: number; y: number; selected: boolean }[]; caption: string }
  | { kind: 'tree'; pa: number; givenA: number; givenNotA: number; leaves: number[] }
  | {
      kind: 'line';
      points: Point[];
      xLabel: string;
      yLabel: string;
      caption: string;
      target?: number;
      observed?: Point;
    }
  | {
      kind: 'scatter';
      points: (Point & { predicted: number; residual: number })[];
      slope: number;
      intercept: number;
      rSquared?: number;
    }
  | {
      kind: 'test';
      curve: Curve;
      statistic: number;
      pValue: number;
      alpha: number;
      tail: 'two' | 'left' | 'right';
      criticalLow: number;
      criticalHigh: number;
      symbol: string;
      counts?: { observed: number[]; expected: number[] };
    };
export interface StatisticalSolution extends Solution {
  plot?: StatisticalPlot;
  graphReason?: string;
}
