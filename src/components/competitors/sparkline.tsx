interface SparklineProps {
  data:   number[];
  /** Width in px */
  width?: number;
  /** Height in px */
  height?: number;
  positive: boolean;
}

export function Sparkline({ data, width = 72, height = 28, positive }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const stroke = positive ? "#10b981" : "#f87171";
  const fill   = positive ? "rgba(16,185,129,0.08)" : "rgba(248,113,113,0.08)";

  // Build area path: polyline + close back along bottom
  const last  = pts[pts.length - 1].split(",");
  const first = pts[0].split(",");
  const area  = `M ${pts.join(" L ")} L ${last[0]},${height} L ${first[0]},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden
    >
      {/* Filled area */}
      <path d={area} fill={fill} />
      {/* Line */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={last[0]}
        cy={last[1]}
        r="2.5"
        fill={stroke}
      />
    </svg>
  );
}
