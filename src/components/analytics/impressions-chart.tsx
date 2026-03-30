"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { DailyMetric } from "@/types/analytics";

// ─── Chart theme tokens (hex — recharts can't read CSS vars) ─────────────────
const GRID_COLOR   = "#1e2d47";
const AXIS_COLOR   = "#6b7fa3";
const COLOR_IMPR   = "#3b82f6"; // blue-500
const COLOR_REACH  = "#818cf8"; // indigo-400

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1e2d47] bg-[#0e1828] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-medium text-[#6b7fa3]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: entry.color }}
          />
          <span className="text-[#cbd5e1]">{entry.name}:</span>
          <span className="font-semibold text-white">
            {Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ImpressionsChartProps {
  data: DailyMetric[];
}

// Thin the x-axis labels for large datasets
function tickInterval(count: number): number {
  if (count <= 14) return 0;
  if (count <= 31) return 2;
  return 6;
}

export function ImpressionsChart({ data }: ImpressionsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5">
        <h3 className="font-semibold text-foreground">Daily Impressions & Reach</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How many times your content was displayed (impressions) and seen by unique accounts (reach)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2} barCategoryGap="20%">
          <defs>
            <linearGradient id="imprGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_IMPR} stopOpacity={1} />
              <stop offset="100%" stopColor={COLOR_IMPR} stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_REACH} stopOpacity={1} />
              <stop offset="100%" stopColor={COLOR_REACH} stopOpacity={0.6} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke={GRID_COLOR}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval(data.length)}
          />
          <YAxis
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
            }
            width={40}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: GRID_COLOR, radius: 4 }} />
          <Legend
            iconType="square"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: AXIS_COLOR, paddingTop: 12 }}
          />

          <Bar
            dataKey="impressions"
            name="Impressions"
            fill="url(#imprGrad)"
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="reach"
            name="Reach"
            fill="url(#reachGrad)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ImpressionsChartSkeleton() {
  return (
    <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card" />
  );
}
