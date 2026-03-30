"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DailyMetric } from "@/types/analytics";

const GRID_COLOR  = "#1e2d47";
const AXIS_COLOR  = "#6b7fa3";
const COLOR_TOTAL = "#10b981"; // emerald-500
const COLOR_DAILY = "#34d399"; // emerald-400

type ViewMode = "total" | "daily";

function TotalTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1e2d47] bg-[#0e1828] px-4 py-3 shadow-2xl">
      <p className="mb-1 text-xs font-medium text-[#6b7fa3]">{label}</p>
      <p className="text-sm font-semibold text-white">
        {Number(payload[0]?.value).toLocaleString()} followers
      </p>
    </div>
  );
}

function DailyTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value as number;
  return (
    <div className="rounded-lg border border-[#1e2d47] bg-[#0e1828] px-4 py-3 shadow-2xl">
      <p className="mb-1 text-xs font-medium text-[#6b7fa3]">{label}</p>
      <p className="text-sm font-semibold text-white">
        {val >= 0 ? "+" : ""}{val} followers
      </p>
    </div>
  );
}

function tickInterval(count: number): number {
  if (count <= 14) return 0;
  if (count <= 31) return 2;
  return 6;
}

interface FollowerGrowthChartProps {
  data: DailyMetric[];
}

export function FollowerGrowthChart({ data }: FollowerGrowthChartProps) {
  const [view, setView] = useState<ViewMode>("total");
  const netGrowth = data.reduce((s, d) => s + d.followerGrowth, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">Follower Growth</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Net new followers:{" "}
            <span className={cn("font-medium", netGrowth >= 0 ? "text-emerald-400" : "text-red-400")}>
              {netGrowth >= 0 ? "+" : ""}{netGrowth.toLocaleString()}
            </span>{" "}
            this period
          </p>
        </div>

        {/* Total / Daily toggle */}
        <div className="flex items-center rounded-md border border-border p-0.5 text-xs">
          {(["total", "daily"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded px-2.5 py-1 capitalize transition-colors",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {view === "total" ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_TOTAL} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLOR_TOTAL} stopOpacity={0} />
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
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)
              }
              width={44}
              domain={["auto", "auto"]}
            />
            <Tooltip content={TotalTooltip} cursor={{ stroke: GRID_COLOR }} />
            <Area
              type="monotone"
              dataKey="followers"
              stroke={COLOR_TOTAL}
              strokeWidth={2.5}
              fill="url(#follGrad)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: COLOR_TOTAL }}
            />
          </AreaChart>
        ) : (
          <BarChart data={data}>
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
              width={32}
            />
            <Tooltip content={DailyTooltip} cursor={{ fill: GRID_COLOR }} />
            <Bar
              dataKey="followerGrowth"
              name="Daily Growth"
              fill={COLOR_DAILY}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function FollowerGrowthChartSkeleton() {
  return (
    <div className="h-[320px] animate-pulse rounded-xl border border-border bg-card" />
  );
}
