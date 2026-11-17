import { jStat } from 'jstat';
import type { Curve } from '../types';
export const normalCDF = (x: number) => jStat.normal.cdf(x, 0, 1);
export const normalQuantile = (p: number) => jStat.normal.inv(p, 0, 1);
export const tCDF = (x: number, df: number) =>
  df === 1 ? 0.5 + Math.atan(x) / Math.PI : jStat.studentt.cdf(x, df);
export const tQuantile = (p: number, df: number) => jStat.studentt.inv(p, df);
export const chiCDF = (x: number, df: number) => (x <= 0 ? 0 : jStat.chisquare.cdf(x, df));
export const fCDF = (x: number, d1: number, d2: number) =>
  x <= 0
    ? 0
    : d1 === 1 && d2 === 1
      ? (2 / Math.PI) * Math.atan(Math.sqrt(x))
      : jStat.centralF.cdf(x, d1, d2);
export function density(curve: Curve, x: number): number {
  const z = (x - curve.center) / curve.scale;
  if (curve.family === 'normal') return jStat.normal.pdf(z, 0, 1) / curve.scale;
  if (curve.family === 't') return jStat.studentt.pdf(z, curve.df) / curve.scale;
  if (curve.family === 'chi') {
    if (z < 0) return 0;
    if (z === 0) return curve.df === 2 ? 0.5 / curve.scale : curve.df! < 2 ? Infinity : 0;
    return jStat.chisquare.pdf(z, curve.df) / curve.scale;
  }
  return z <= 0 ? 0 : jStat.centralF.pdf(z, curve.df, curve.df2) / curve.scale;
}
export function chartDomain(curve: Curve): [number, number] {
  if (curve.domain) return curve.domain;
  if (curve.family === 'normal')
    return [curve.center - 4 * curve.scale, curve.center + 4 * curve.scale];
  if (curve.family === 't') {
    const q = Math.min(12, Math.max(4, tQuantile(0.995, curve.df)));
    return [-q, q];
  }
  if (curve.family === 'chi') return [0, jStat.chisquare.inv(0.995, curve.df)];
  return [0, Math.min(50, jStat.centralF.inv(0.99, curve.df, curve.df2))];
}
