import { useId } from 'react';
import type { StatisticalPlot, Point } from '../math/statisticsTypes';
import { format } from '../math/engine';
import { chartDomain, density } from '../math/distributions';

const W = 600,
  H = 300,
  L = 65,
  R = 24,
  T = 30,
  B = 60;
function bounds(values: number[], zero = false): [number, number] {
  let lo = Math.min(...values, zero ? 0 : Infinity),
    hi = Math.max(...values, zero ? 0 : -Infinity);
  if (lo === hi) {
    lo -= 0.5;
    hi += 0.5;
  }
  if (zero && lo >= 0) return [0, hi * 1.08 || 1];
  if (zero && hi <= 0) return [lo * 1.08 || -1, 0];
  const padding = (hi - lo) * 0.08;
  return [lo - padding, hi + padding];
}
function scales(xs: number[], ys: number[], zero = false) {
  const [x0, x1] = bounds(xs),
    [y0, y1] = bounds(ys, zero);
  return {
    x: (v: number) => L + ((v - x0) / (x1 - x0)) * (W - L - R),
    y: (v: number) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B),
    x0,
    x1,
    y0,
    y1,
  };
}
function Axes({
  s,
  xLabel,
  yLabel,
  categorical = false,
}: {
  s: ReturnType<typeof scales>;
  xLabel: string;
  yLabel: string;
  categorical?: boolean;
}) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const x = s.x0 + ((s.x1 - s.x0) * i) / 4,
          y = s.y0 + ((s.y1 - s.y0) * i) / 4;
        return (
          <g key={i}>
            <line className="chart-grid" x1={L} x2={W - R} y1={s.y(y)} y2={s.y(y)} />
            <text x={L - 9} y={s.y(y) + 4} textAnchor="end">
              {format(y, 3)}
            </text>
            {!categorical && (
              <text x={s.x(x)} y={H - B + 25} textAnchor="middle">
                {format(x, 3)}
              </text>
            )}
          </g>
        );
      })}
      <text x={L} y={16}>
        {yLabel}
      </text>
      <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle">
        {xLabel}
      </text>
    </>
  );
}
function Svg({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={id}>
      <title id={id}>{title}</title>
      {children}
    </svg>
  );
}
function DataTable({ headers, rows }: { headers: string[]; rows: (number | string)[][] }) {
  return (
    <details className="plot-data">
      <summary>View the plotted values</summary>
      <div className="plot-table">
        <table>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{typeof cell === 'number' ? format(cell) : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
function Bars({
  labels,
  values,
  comparison,
  yLabel,
  caption,
}: Extract<StatisticalPlot, { kind: 'bars' }>) {
  const range = bounds([...values, ...(comparison ?? [])], true),
    s = scales([0, labels.length], range, true),
    bw = (W - L - R) / labels.length;
  return (
    <figure className="stat-graph">
      <Svg title={caption}>
        <Axes s={s} xLabel="Category" yLabel={yLabel} categorical />
        {values.map((v, i) => (
          <g key={i}>
            <rect
              x={L + i * bw + bw * 0.15}
              y={Math.min(s.y(v), s.y(0))}
              width={bw * (comparison ? 0.3 : 0.7)}
              height={Math.max(1, Math.abs(s.y(v) - s.y(0)))}
              fill="var(--blue)"
            />
            {comparison && (
              <rect
                x={L + i * bw + bw * 0.5}
                y={Math.min(s.y(comparison[i]), s.y(0))}
                width={bw * 0.3}
                height={Math.max(1, Math.abs(s.y(comparison[i]) - s.y(0)))}
                fill="#7b9c88"
              />
            )}
            {(labels.length <= 6 || i % Math.ceil(labels.length / 6) === 0) && (
              <text x={L + (i + 0.5) * bw} y={H - B + 25} textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        ))}
      </Svg>
      <figcaption>
        {caption}
        {comparison && ' Blue: observed; sage: expected.'}
      </figcaption>
      <DataTable
        headers={comparison ? ['Category', 'Observed', 'Expected'] : ['Category', yLabel]}
        rows={labels.map((label, i) =>
          comparison ? [label, values[i], comparison[i]] : [label, values[i]],
        )}
      />
    </figure>
  );
}
function Descriptive(plot: Extract<StatisticalPlot, { kind: 'descriptive' }>) {
  const edges = plot.bins.flatMap((b) => [b.low, b.high]),
    s = scales(
      edges,
      plot.bins.map((b) => b.count),
      true,
    );
  const [lo, hi] = bounds(plot.data);
  const bx = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  return (
    <div className="stat-graph">
      <h4>Histogram · actual frequencies</h4>
      <Svg title={`Histogram of ${plot.data.length} observations, with mean ${format(plot.mean)}.`}>
        <Axes s={s} xLabel="Observed value" yLabel="Frequency" />
        {plot.bins.map((bin, i) => (
          <rect
            key={i}
            x={s.x(bin.low) + 1}
            y={s.y(bin.count)}
            width={Math.max(1, s.x(bin.high) - s.x(bin.low) - 2)}
            height={s.y(0) - s.y(bin.count)}
            fill="#8baacd"
          />
        ))}
        <line
          x1={s.x(plot.mean)}
          x2={s.x(plot.mean)}
          y1={T}
          y2={H - B}
          stroke="#426955"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      </Svg>
      <p className="plot-caption">
        Bars count the supplied values. Sage dashed line: mean {format(plot.mean)}.
      </p>
      <h4>Box plot · observed spread</h4>
      <svg
        viewBox="0 0 600 160"
        role="img"
        aria-label={`Box plot. First quartile ${plot.q1}, median ${plot.median}, third quartile ${plot.q3}.`}
      >
        <line
          x1={bx(plot.whiskerLow)}
          x2={bx(plot.whiskerHigh)}
          y1="60"
          y2="60"
          stroke="var(--blue)"
          strokeWidth="2"
        />
        {[plot.whiskerLow, plot.whiskerHigh].map((v, i) => (
          <line
            key={i}
            x1={bx(v)}
            x2={bx(v)}
            y1="43"
            y2="77"
            stroke="var(--blue)"
            strokeWidth="2"
          />
        ))}
        <rect
          x={bx(plot.q1)}
          y="35"
          width={Math.max(1, bx(plot.q3) - bx(plot.q1))}
          height="50"
          fill="var(--chart-fill)"
          stroke="var(--blue)"
        />
        <line
          x1={bx(plot.median)}
          x2={bx(plot.median)}
          y1="35"
          y2="85"
          stroke="#426955"
          strokeWidth="3"
        />
        {plot.data
          .filter((v) => v < plot.whiskerLow || v > plot.whiskerHigh)
          .map((v, i) => (
            <circle key={i} cx={bx(v)} cy="60" r="4" fill="#986544" />
          ))}
        {[
          { v: plot.q1, label: 'Q1' },
          { v: plot.q3, label: 'Q3' },
        ].map(({ v, label }) => (
          <g key={label}>
            <text x={bx(v)} y="113" textAnchor="middle">
              {label}: {format(v, 3)}
            </text>
          </g>
        ))}
        <text x={bx(plot.median)} y="20" textAnchor="middle">
          Median {format(plot.median, 3)}
        </text>
        <text x="300" y="151" textAnchor="middle">
          Observed value
        </text>
      </svg>
      <p className="plot-caption">
        Box: Q1–Q3. Sage line: median. Whiskers: observed values within 1.5×IQR. Brown points:
        outliers. Equal-position values may overlap.
      </p>
      <DataTable
        headers={['Bin lower limit', 'Bin upper limit', 'Frequency']}
        rows={plot.bins.map((b) => [b.low, b.high, b.count])}
      />
    </div>
  );
}
function Discrete(plot: Extract<StatisticalPlot, { kind: 'discrete' }>) {
  const s = scales(
      plot.points.map((p) => p.x),
      plot.points.map((p) => p.y),
      true,
    ),
    bw = (s.x(1) - s.x(0)) * 0.8;
  return (
    <figure className="stat-graph">
      <Svg title="Probability mass function with the requested event highlighted">
        <Axes s={s} xLabel="Event count · X" yLabel="Probability mass" categorical />
        {[
          ...new Set(
            Array.from({ length: 5 }, (_, i) =>
              Math.round((plot.points[plot.points.length - 1].x * i) / 4),
            ),
          ),
        ].map((x) => (
          <text key={x} x={s.x(x)} y={H - B + 25} textAnchor="middle">
            {x}
          </text>
        ))}
        {plot.points.map((p) => (
          <rect
            key={p.x}
            x={s.x(p.x) - bw / 2}
            y={s.y(p.y)}
            width={Math.max(1, bw)}
            height={Math.max(0, s.y(0) - s.y(p.y))}
            fill={p.selected ? '#3766a4' : '#cbd5e1'}
          />
        ))}
      </Svg>
      <figcaption>{plot.caption} Grey bars: remaining counts.</figcaption>
      <DataTable
        headers={['Count', 'Probability mass', 'Selected event']}
        rows={plot.points.map((p) => [p.x, p.y, p.selected ? 'Yes' : 'No'])}
      />
    </figure>
  );
}
function Tree(plot: Extract<StatisticalPlot, { kind: 'tree' }>) {
  const ys = [52, 112, 192, 252];
  return (
    <figure className="stat-graph">
      <Svg title="Two-stage probability tree with conditional branch and joint leaf probabilities">
        <text x="22" y="155">
          Start
        </text>
        {[
          { label: 'A', p: plot.pa, y: 82 },
          { label: 'Not A', p: 1 - plot.pa, y: 222 },
        ].map((b, i) => (
          <g key={b.label}>
            <line x1="70" y1="150" x2="230" y2={b.y} stroke="#a5b8d1" strokeWidth="2" />
            <text x="125" y={i ? 207 : 83}>
              {b.label}: {format(b.p, 3)}
            </text>
            {[0, 1].map((j) => {
              const k = i * 2 + j,
                conditional = i ? plot.givenNotA : plot.givenA;
              return (
                <g key={j}>
                  <line x1="230" y1={b.y} x2="405" y2={ys[k]} stroke="#a5b8d1" strokeWidth="2" />
                  <text x="275" y={ys[k] - 10}>
                    {j ? 'Not B' : 'B'}: {format(j ? 1 - conditional : conditional, 3)}
                  </text>
                  <text x="420" y={ys[k] + 5}>
                    Joint: {format(plot.leaves[k], 4)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </Svg>
      <figcaption>
        Multiply along each branch to obtain a joint leaf probability. Add the two B leaves to
        obtain P(B).
      </figcaption>
      <DataTable
        headers={['Joint event', 'Probability']}
        rows={['A and B', 'A and not B', 'Not A and B', 'Neither A nor B'].map((label, i) => [
          label,
          plot.leaves[i],
        ])}
      />
    </figure>
  );
}
function Line(plot: Extract<StatisticalPlot, { kind: 'line' }>) {
  const s = scales(
    plot.points.map((p) => p.x),
    [...plot.points.map((p) => p.y), ...(plot.target !== undefined ? [plot.target] : [])],
    true,
  );
  return (
    <figure className="stat-graph">
      <Svg title={plot.caption}>
        <Axes s={s} xLabel={plot.xLabel} yLabel={plot.yLabel} />
        <polyline
          points={plot.points.map((p) => `${s.x(p.x)},${s.y(p.y)}`).join(' ')}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2.5"
        />
        {plot.points.map((p, i) => (
          <circle key={i} cx={s.x(p.x)} cy={s.y(p.y)} r="3" fill="var(--blue)" />
        ))}
        {plot.target !== undefined && (
          <line
            x1={L}
            x2={W - R}
            y1={s.y(plot.target)}
            y2={s.y(plot.target)}
            stroke="#986544"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        )}
        {plot.observed && (
          <circle cx={s.x(plot.observed.x)} cy={s.y(plot.observed.y)} r="6" fill="#426955" />
        )}
      </Svg>
      <figcaption>
        {plot.caption} Lines connect computed points as a visual guide. Sage: selected result.
        {plot.target !== undefined ? ` Brown dashed line: target ${format(plot.target)}.` : ''}
      </figcaption>
      <DataTable headers={[plot.xLabel, plot.yLabel]} rows={plot.points.map((p) => [p.x, p.y])} />
    </figure>
  );
}
function Scatter(plot: Extract<StatisticalPlot, { kind: 'scatter' }>) {
  const xs = plot.points.map((p) => p.x),
    ys = plot.points.map((p) => p.y),
    s = scales(xs, [...ys, ...plot.points.map((p) => p.predicted)]),
    low = Math.min(...xs),
    high = Math.max(...xs),
    r = scales(
      xs,
      plot.points.map((p) => p.residual),
      true,
    );
  return (
    <div className="stat-graph">
      <h4>Scatter plot and least-squares line</h4>
      <Svg title="Observed X,Y pairs and their fitted least-squares regression line">
        <Axes s={s} xLabel="X observation" yLabel="Y observation" />
        <line
          x1={s.x(low)}
          x2={s.x(high)}
          y1={s.y(plot.intercept + plot.slope * low)}
          y2={s.y(plot.intercept + plot.slope * high)}
          stroke="#426955"
          strokeWidth="2.5"
        />
        {plot.points.map((p, i) => (
          <circle key={i} cx={s.x(p.x)} cy={s.y(p.y)} r="4" fill="var(--blue)" opacity=".8" />
        ))}
      </Svg>
      <p className="plot-caption">
        Blue: original paired observations. Sage: the fitted line. Repeated points overlap; no
        jitter or random observations are added.
      </p>
      <h4>Residuals versus X</h4>
      <Svg title="Residuals y minus predicted y for each observed X">
        <Axes s={r} xLabel="X observation" yLabel="Residual · y − ŷ" />
        <line x1={L} x2={W - R} y1={r.y(0)} y2={r.y(0)} stroke="#7b9c88" strokeDasharray="5 4" />
        {plot.points.map((p, i) => (
          <circle key={i} cx={r.x(p.x)} cy={r.y(p.residual)} r="4" fill="var(--blue)" />
        ))}
      </Svg>
      <DataTable
        headers={['X', 'Y', 'Predicted Y', 'Residual']}
        rows={plot.points.map((p) => [p.x, p.y, p.predicted, p.residual])}
      />
    </div>
  );
}
function Hypothesis(plot: Extract<StatisticalPlot, { kind: 'test' }>) {
  const base = chartDomain(plot.curve),
    extent =
      plot.curve.family === 'chi'
        ? base[1]
        : Math.max(
            4,
            Math.min(
              12,
              Math.max(
                Math.abs(plot.statistic),
                Math.abs(Number.isFinite(plot.criticalHigh) ? plot.criticalHigh : plot.criticalLow),
              ) * 1.15,
            ),
          );
  const lo = plot.curve.family === 'chi' ? (plot.curve.df === 1 ? 0.001 : 0) : -extent,
    hi = extent;
  const points = Array.from({ length: 601 }, (_, i) => ({
    x: lo + ((hi - lo) * i) / 600,
    y: density(plot.curve, lo + ((hi - lo) * i) / 600),
  }));
  const max = Math.max(...points.map((p) => (Number.isFinite(p.y) ? p.y : 0))) * 1.1 || 1;
  const s = {
    x: (x: number) => L + ((x - lo) / (hi - lo)) * (W - L - R),
    y: (y: number) => H - B - (y / max) * (H - T - B),
    x0: lo,
    x1: hi,
    y0: 0,
    y1: max,
  };
  const shade = (predicate: (x: number) => boolean) => {
    let segment: Point[] = [];
    const paths: string[] = [];
    const flush = () => {
      if (segment.length)
        paths.push(
          `M${s.x(segment[0].x)},${s.y(0)} ` +
            segment.map((p) => `L${s.x(p.x)},${s.y(p.y)}`).join(' ') +
            ` L${s.x(segment[segment.length - 1].x)},${s.y(0)}Z`,
        );
      segment = [];
    };
    for (const p of points) {
      if (predicate(p.x)) segment.push(p);
      else flush();
    }
    flush();
    return paths.join(' ');
  };
  const px = Math.max(lo, Math.min(hi, plot.statistic));
  return (
    <div className="stat-graph hypothesis-graph">
      <Svg
        title={`Null distribution. Observed ${plot.symbol}=${format(plot.statistic)}. P-value ${format(plot.pValue)}; significance ${plot.alpha}.`}
      >
        <Axes s={s} xLabel={`Null-model ${plot.symbol} statistic`} yLabel="Probability density" />
        <path
          d={shade((x) => x <= plot.criticalLow || x >= plot.criticalHigh)}
          fill="#c9a66e"
          opacity=".5"
        />
        <path
          d={shade((x) =>
            plot.tail === 'two'
              ? Math.abs(x) >= Math.abs(plot.statistic)
              : plot.tail === 'left'
                ? x <= plot.statistic
                : x >= plot.statistic,
          )}
          fill="#86abd5"
          opacity=".7"
        />
        <polyline
          points={points.map((p) => `${s.x(p.x)},${s.y(p.y)}`).join(' ')}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2.5"
        />
        <line
          x1={s.x(px)}
          x2={s.x(px)}
          y1={T}
          y2={H - B}
          stroke="#426955"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        {[plot.criticalLow, plot.criticalHigh]
          .filter((v) => Number.isFinite(v) && v > lo && v < hi)
          .map((v, i) => (
            <line
              key={i}
              x1={s.x(v)}
              x2={s.x(v)}
              y1={T}
              y2={H - B}
              stroke="#986544"
              strokeDasharray="4 5"
            />
          ))}
      </Svg>
      <p className="plot-caption">
        <span className="plot-key p-value-key" /> Blue shading: p-value region.{' '}
        <span className="plot-key critical-key" /> Amber shading: rejection region at α=
        {format(plot.alpha)}. Sage line: observed {plot.symbol}={format(plot.statistic)}. Regions
        can overlap.
      </p>
      <p className="plot-caption">
        Critical bounds:{' '}
        {Number.isFinite(plot.criticalLow) ? format(plot.criticalLow) : 'no lower rejection bound'};{' '}
        {Number.isFinite(plot.criticalHigh)
          ? format(plot.criticalHigh)
          : 'no upper rejection bound'}
        . The displayed density is truncated; probabilities use the full distribution.
        {plot.statistic < lo || plot.statistic > hi
          ? ' The observed statistic is outside this plot and is indicated at its nearest edge.'
          : ''}
        {plot.curve.family === 'chi' && plot.curve.df === 1
          ? ' For one degree of freedom the density diverges at zero; the plot starts at 0.001.'
          : ''}
      </p>
      {plot.counts && (
        <Bars
          kind="bars"
          labels={plot.counts.observed.map((_, i) => `C${i + 1}`)}
          values={plot.counts.observed}
          comparison={plot.counts.expected}
          yLabel="Category count"
          caption="Observed and null-model expected counts"
        />
      )}
    </div>
  );
}
export function StatisticalPlots({ plot }: { plot: StatisticalPlot }) {
  switch (plot.kind) {
    case 'descriptive':
      return <Descriptive {...plot} />;
    case 'bars':
      return <Bars {...plot} />;
    case 'discrete':
      return <Discrete {...plot} />;
    case 'tree':
      return <Tree {...plot} />;
    case 'line':
      return <Line {...plot} />;
    case 'scatter':
      return <Scatter {...plot} />;
    case 'test':
      return <Hypothesis {...plot} />;
  }
}
