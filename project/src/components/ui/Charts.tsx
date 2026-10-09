interface DonutChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export function DonutChart({
  value,
  size = 160,
  strokeWidth = 14,
  label,
  sublabel,
  color = '#4f46e5',
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-3xl font-bold text-slate-800">{label}</span>}
        {sublabel && <span className="text-sm text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  max?: number;
  height?: number;
}

export function BarChart({ data, max = 100, height = 200 }: BarChartProps) {
  return (
    <div className="flex items-end justify-around gap-3" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = (d.value / max) * (height - 30);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{d.value}%</span>
            <div
              className="w-full max-w-[50px] rounded-t-lg transition-all duration-700 ease-out"
              style={{
                height: `${barHeight}px`,
                backgroundColor: d.color || '#6366f1',
                minHeight: '4px',
              }}
            />
            <span className="text-[10px] text-center text-slate-500 leading-tight">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface RadarChartProps {
  data: { label: string; value: number }[];
  max?: number;
  size?: number;
}

export function RadarChart({ data, max = 100, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / max) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const polygonPoints = data.map((d, i) => {
    const p = getPoint(d.value, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size}>
      {gridLevels.map((level, gi) => {
        const gridPoints = data.map((_, i) => {
          const p = getPoint(level * max, i);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={gi}
            points={gridPoints}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        );
      })}
      {data.map((_, i) => {
        const p = getPoint(max, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={polygonPoints}
        fill="rgba(99, 102, 241, 0.2)"
        stroke="#6366f1"
        strokeWidth="2"
      />
      {data.map((d, i) => {
        const p = getPoint(d.value, i);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4f46e5" />;
      })}
      {data.map((d, i) => {
        const p = getPoint(max * 1.15, i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = '#6366f1' }: LineChartProps) {
  const width = 400;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values) + 10;
  const minVal = Math.min(...values) - 10;

  const xStep = chartW / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[11px] fill-slate-600 font-semibold">
            {p.value}%
          </text>
          <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-400">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
