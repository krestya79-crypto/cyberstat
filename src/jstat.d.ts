declare module 'jstat' {
  interface Distribution {
    pdf(x: number, a: number, b?: number): number;
    cdf(x: number, a: number, b?: number): number;
    inv(p: number, a: number, b?: number): number;
  }
  export const jStat: {
    normal: Distribution;
    studentt: Distribution;
    chisquare: Distribution;
    centralF: Distribution;
  };
}
