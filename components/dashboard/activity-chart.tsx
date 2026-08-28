"use client";

import type { DayCount } from "@/lib/dashboard/queries";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 8;

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

export function ActivityChart({ data }: { data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (WIDTH - PADDING * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PADDING + i * stepX,
    y: HEIGHT - PADDING - (d.count / max) * (HEIGHT - PADDING * 2),
  }));

  const linePath = buildPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? PADDING} ${HEIGHT} L ${points[0]?.x ?? PADDING} ${HEIGHT} Z`;

  return (
    <div className="glass-surface rounded-2xl p-4">
      <p className="mb-3 font-heading text-sm font-semibold text-foreground">
        Applications by day
      </p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill="url(#activity-fill)"
          className="animate-in fade-in-0 duration-700"
        />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          style={{
            strokeDasharray: 100,
            strokeDashoffset: 100,
            animation: "activity-draw 900ms var(--ease-spring) forwards",
          }}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--primary)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.date}>
            {new Date(d.date).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes activity-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
