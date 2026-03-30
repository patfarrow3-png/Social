"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { DailyMetric } from "@/types/analytics";

const GRID_COLOR = "#1e2d47";
const AXIS_COLOR = "#6b7fa3";
const LINE_COLOR = "#f59e0b"; // amber-400

function CustomTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value as number | undefined;
  return (
    <div className="rounded-lg border border-[#1e2d47] bg-[#0e1828] px-4 py-3 shadow-2xl">
      <p className="mb-1 text-xs font-medium text-[#6b7fa3]">{label}</p>
      <p className="text-sm font-semibold text-white">
        {val?.toFixed(2)}% engagement
      </p>
    </div>
  );
}

interface EngagementChartProps {
  data: DailyMetric[];
}

function tickInterval(count: number): number {
  if (count <= 14) return 0;
  if (count <= 31) return 2;
  return 6;
}

export function EngagementChart({ data }: EngagementChartProps) {
  const avg =
    data.length > 0
      ? data.reduce((s, d) => s + d.engagementRate, 0) / data.length
      : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1">
        <h3 className="font-semibold text-foreground">Engagement Rate</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Daily engagement rate — avg{" "}
          <span className="font-medium text-amber-400">{avg.toFixed(2)}%</span> this period
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="engGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.8} />
              <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
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
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            width={44}
            domain={["auto", "auto"]}
          />
          <Tooltip content={CustomTooltip} cursor={{ stroke: GRID_COLOR }} />

          {/* Average reference line */}
          <ReferenceLine
            y={avg}
            stroke={LINE_COLOR}
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />

          <Line
            type="monotone"
            dataKey="engagementRate"
            name="Engagement Rate"
            stroke="url(#engGrad)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: LINE_COLOR }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngagementChartSkeleton() {
  return (
    <div className="h-[320px] animate-pulse rounded-xl border border-border bg-card" />
  );
}
