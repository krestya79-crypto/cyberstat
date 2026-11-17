import { useState, useId } from 'react';
import type { Curve, Solution } from '../types';
import { chartDomain, density } from '../math/distributions';
import { format } from '../math/engine';
export function DistributionChart({ curve, compact = false }: { curve: Curve; compact?: boolean }) {
  const titleId = useId();
  const [inspect, setInspect] = useState(50);
  const [lo, hi] = chartDomain(curve);
  const width = 600,
    height = 270,
    left = 58,
    right = 22,
    top = 25,
    bottom = 48,
    plotW = width - left - right,
    plotH = height - top - bottom;
  const points = Array.from({ length: 401 }, (_, i) => {
    const x = lo + ((hi - lo) * i) / 400;
    return { x, y: density(curve, x) };
  });
  const maxY = Math.max(...points.map((p) => (Number.isFinite(p.y) ? p.y : 0))) * 1.12 || 1;
  const sx = (x: number) => left + ((x - lo) / (hi - lo)) * plotW,
    sy = (y: number) => height - bottom - (Math.min(y, maxY) / maxY) * plotH;
  const path = points
    .filter((p) => Number.isFinite(p.y))
    .map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`)
    .join(' ');
  const selected = points.filter(
    (p) => p.x >= curve.lower && p.x <= curve.upper && Number.isFinite(p.y),
  );
  const area = selected.length
    ? `M${sx(selected[0].x)},${height - bottom} ` +
      selected.map((p) => `L${sx(p.x)},${sy(p.y)}`).join(' ') +
      ` L${sx(selected[selected.length - 1].x)},${height - bottom}Z`
    : '';
  const ix = lo + ((hi - lo) * inspect) / 100,
    iy = density(curve, ix);
  const lower = Math.max(lo, curve.lower),
    upper = Math.min(hi, curve.upper);
  return (
    <figure className={`distribution-chart ${compact ? 'compact' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {curve.family} probability density. Shaded region:{' '}
          {Number.isFinite(curve.lower) ? format(curve.lower) : 'negative infinity'} to{' '}
          {Number.isFinite(curve.upper) ? format(curve.upper) : 'positive infinity'}.
        </title>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              className="chart-grid"
              x1={left}
              y1={sy(maxY * t)}
              x2={width - right}
              y2={sy(maxY * t)}
            />
            <text x={left - 10} y={sy(maxY * t) + 4} textAnchor="end">
              {format(maxY * t, 3)}
            </text>
          </g>
        ))}
        <path d={area} fill="var(--chart-fill)" />
        <path d={path} fill="none" stroke="var(--blue)" strokeWidth="2.8" />
        {[...new Set([lower, upper].filter((x) => x > lo && x < hi))].map((x) => (
          <line
            key={x}
            x1={sx(x)}
            x2={sx(x)}
            y1={height - bottom}
            y2={sy(density(curve, x))}
            stroke="var(--blue)"
            strokeDasharray="4 4"
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const x = lo + ((hi - lo) * i) / 6;
          return (
            <g key={i}>
              <line
                x1={sx(x)}
                x2={sx(x)}
                y1={height - bottom}
                y2={height - bottom + 5}
                stroke="#a4b2c5"
              />
              <text x={sx(x)} y={height - bottom + 21} textAnchor="middle">
                {format(x, 2)}
              </text>
            </g>
          );
        })}
        <text x={left} y={15}>
          Probability density
        </text>
        <text x={(width + left - right) / 2} y={height - 5} textAnchor="middle">
          {curve.axis}
        </text>
        {!compact && Number.isFinite(iy) && (
          <>
            <line
              x1={sx(ix)}
              x2={sx(ix)}
              y1={top}
              y2={height - bottom}
              stroke="#7e9488"
              strokeDasharray="3 4"
            />
            <circle cx={sx(ix)} cy={sy(iy)} r="4" fill="#426955" />
          </>
        )}
      </svg>
      {!compact && (
        <>
          <figcaption>
            <span className="legend-dot" /> Shaded area represents the requested probability.{' '}
            <span className="muted">
              Plot: {format(lo, 2)} to {format(hi, 2)}; calculations include the full tails.
            </span>
          </figcaption>
          <label className="curve-inspect">
            Inspect the curve{' '}
            <output>
              x={format(ix, 3)} · density={format(iy, 5)}
            </output>
            <input
              aria-label="Inspect curve position"
              type="range"
              min="0"
              max="100"
              step=".25"
              value={inspect}
              onChange={(e) => setInspect(Number(e.target.value))}
            />
          </label>
        </>
      )}
    </figure>
  );
}
export function IntervalChart({ interval }: { interval: NonNullable<Solution['interval']> }) {
  const { lower, upper, center } = interval;
  const width = 600,
    pad = 60,
    span = upper - lower,
    lo = lower - span * 0.25,
    hi = upper + span * 0.25;
  const x = (v: number) => pad + ((v - lo) / (hi - lo)) * (width - 2 * pad);
  return (
    <figure className="interval-chart">
      <svg
        viewBox="0 0 600 160"
        role="img"
        aria-label={`Interval from ${format(lower)} to ${format(upper)}, midpoint ${format(center)}. Horizontal axis: parameter value.`}
      >
        <line x1={pad} x2={width - pad} y1="70" y2="70" stroke="#dfe5ed" strokeWidth="2" />
        <line
          x1={x(lower)}
          x2={x(upper)}
          y1="70"
          y2="70"
          stroke="#3766a4"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {[
          { v: lower, label: 'Lower limit' },
          { v: upper, label: 'Upper limit' },
        ].map((p) => (
          <g key={p.label}>
            <line x1={x(p.v)} x2={x(p.v)} y1="56" y2="84" stroke="#3766a4" strokeWidth="3" />
            <text x={x(p.v)} y="111" textAnchor="middle">
              {format(p.v, 4)}
            </text>
            <text x={x(p.v)} y="133" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
        <circle cx={x(center)} cy="70" r="7" fill="#426955" stroke="white" strokeWidth="2" />
        <text x={x(center)} y="35" textAnchor="middle">
          Center {format(center, 4)}
        </text>
        <text x="300" y="157" textAnchor="middle">
          Parameter value
        </text>
      </svg>
      <figcaption>Blue segment: interval limits. Sage point: interval midpoint.</figcaption>
    </figure>
  );
}
