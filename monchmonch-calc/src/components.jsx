import { C, fmt, fmtN } from "./constants.js";

export const glassCard = {
  background: `linear-gradient(135deg, ${C.card} 0%, rgba(19,17,28,0.8) 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "20px 24px",
  backdropFilter: "blur(12px)",
};
export const inputStyle = {
  background: "rgba(139,92,246,0.08)",
  border: `1px solid ${C.borderBright}`,
  borderRadius: 8,
  color: C.purple,
  padding: "6px 10px",
  fontSize: 14,
  fontWeight: 600,
  width: 90,
  textAlign: "right",
  outline: "none",
  fontFamily: "inherit",
};
export const labelStyle = { color: C.textMuted, fontSize: 12, fontWeight: 500, letterSpacing: 0.3 };
export const h2Style = { color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", letterSpacing: -0.3 };
export const h3Style = { color: C.textMuted, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 12px 0" };

export function MiniBar({ data, maxVal, color, label, height = 18 }) {
  const w = maxVal > 0 ? Math.max((data / maxVal) * 100, 1) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: C.textMuted, width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 4, height, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, width: 60, textAlign: "right", flexShrink: 0 }}>{fmt(data, 2)}</span>
    </div>
  );
}

export function Sparkline({ data, width = 200, height = 50, color = C.violet, showArea = true }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 8) - 4,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {showArea && <path d={area} fill={`${color}18`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke={C.card} strokeWidth={2} />
      ))}
    </svg>
  );
}

export function PLChart({ years }) {
  const maxRev = Math.max(...years.map((y) => y.netRev));
  const maxLoss = Math.max(...years.map((y) => Math.abs(y.ebitda)));
  const maxVal = Math.max(maxRev, maxLoss);
  const chartH = 200;
  const barW = 48;
  const gap = 32;
  const totalW = years.length * (barW + gap);
  return (
    <div style={{ overflowX: "auto", padding: "10px 0" }}>
      <svg width={totalW + 40} height={chartH + 50} style={{ display: "block" }}>
        <line x1={20} y1={chartH / 2 + 10} x2={totalW + 30} y2={chartH / 2 + 10} stroke={C.border} strokeWidth={1} strokeDasharray="4,4" />
        {years.map((y, i) => {
          const x = 20 + i * (barW + gap);
          const revH = (y.netRev / maxVal) * (chartH / 2 - 10);
          const ebitdaH = (Math.abs(y.ebitda) / maxVal) * (chartH / 2 - 10);
          const isPos = y.ebitda >= 0;
          return (
            <g key={i}>
              <rect x={x} y={chartH / 2 + 10 - revH} width={barW / 2 - 2} height={revH} fill={C.violet} rx={4} opacity={0.85} />
              <rect x={x + barW / 2 + 2} y={isPos ? chartH / 2 + 10 - ebitdaH : chartH / 2 + 10} width={barW / 2 - 2} height={ebitdaH} fill={isPos ? C.green : C.red} rx={4} opacity={0.85} />
              <text x={x + barW / 2} y={chartH + 30} textAnchor="middle" fill={C.textMuted} fontSize={11} fontFamily="inherit">Y{y.year}</text>
            </g>
          );
        })}
        <text x={totalW + 35} y={chartH / 2 - 15} textAnchor="end" fill={C.violet} fontSize={10} fontFamily="inherit">Revenue</text>
        <text x={totalW + 35} y={chartH / 2 + 35} textAnchor="end" fill={C.red} fontSize={10} fontFamily="inherit">EBITDA</text>
      </svg>
    </div>
  );
}

export function MetricCard({ label, value, sub, color = C.violet, icon }) {
  return (
    <div style={{
      ...glassCard,
      padding: "18px 20px",
      minWidth: 160,
      flex: "1 1 0",
      borderColor: `${color}30`,
      background: `linear-gradient(135deg, ${C.card} 0%, ${color}08 100%)`,
    }}>
      <div style={{ ...labelStyle, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function InputRow({ label, value, onChange, prefix = "$", suffix, step = 0.01, min = 0, max, tip }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}22` }}>
      <div style={{ flex: 1 }}>
        <span style={labelStyle}>{label}</span>
        {tip && <span style={{ fontSize: 10, color: C.textDim, marginLeft: 6 }}>{tip}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {prefix && <span style={{ color: C.textDim, fontSize: 12 }}>{prefix}</span>}
        <input
          type="number" value={value} step={step} min={min} max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
        {suffix && <span style={{ color: C.textDim, fontSize: 12 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function SliderInput({ label, value, onChange, min = 0, max = 1, step = 0.01, format = "pct" }) {
  const display = format === "pct" ? `${(value * 100).toFixed(0)}%` : format === "dollar" ? fmt(value, 2) : fmtN(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ color: C.purple, fontSize: 13, fontWeight: 700 }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.purple, height: 4 }}
      />
    </div>
  );
}
