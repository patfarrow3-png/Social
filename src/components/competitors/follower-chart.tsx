"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { formatFollowers } from "@/types/competitors";

interface FollowerChartProps {
  data:     number[];
  positive: boolean;
}

function CustomTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-foreground font-medium">{formatFollowers(Number(payload[0].value))}</p>
      <p className="text-muted-foreground">{payload[0].payload.label}</p>
    </div>
  );
}

export function FollowerChart({ data, positive }: FollowerChartProps) {
  const stroke = positive ? "#10b981" : "#f87171";
  const fill   = positive ? "#10b981" : "#f87171";

  const chartData = data.map((v, i) => ({
    day: i,
    label: i === data.length - 1 ? "Today" : `${data.length - 1 - i}d ago`,
    value: v,
  }));

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={fill} stopOpacity={0.2} />
              <stop offset="95%" stopColor={fill} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="day" hide />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={v => formatFollowers(v)}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={CustomTooltip} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.75}
            fill="url(#followerGrad)"
            dot={false}
            activeDot={{ r: 3, fill: stroke, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
