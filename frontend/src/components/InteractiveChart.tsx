import React, { useState } from 'react';
import { HistoryPoint, Language, TelemetryValues } from '../types';
import { PARAM_CONFIGS, UI_TRANSLATIONS } from '../constants';
import { LineChart, Sliders, Eye, EyeOff } from 'lucide-react';

interface InteractiveChartProps {
  history: HistoryPoint[];
  language: Language;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  history,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Selected parameters to plot
  const [selectedParams, setSelectedParams] = useState<Record<keyof TelemetryValues, boolean>>({
    do: true,
    temperature: true,
    ph: true,
    turbidity: false,
    ammonia: false,
  });

  // Range depth (number of recent readings)
  const [pointsLimit, setPointsLimit] = useState<number>(40);

  // Hover state for tooltip
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleParam = (key: keyof TelemetryValues) => {
    setSelectedParams((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const chartData = history.slice(-pointsLimit);

  // SVG dimensions
  const svgWidth = 860;
  const svgHeight = 280;
  const paddingLeft = 40;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Render SVG Path for a given parameter
  const renderLinePath = (paramKey: keyof TelemetryValues, color: string) => {
    const meta = PARAM_CONFIGS.find((p) => p.key === paramKey);
    if (!meta || chartData.length < 2) return null;

    const totalRange = meta.maxDisplay - meta.minDisplay;

    const points = chartData.map((d, index) => {
      const val = d.values[paramKey] ?? meta.minDisplay;
      const x = paddingLeft + (index / (chartData.length - 1)) * plotWidth;
      const normalizedY = (val - meta.minDisplay) / totalRange;
      const y = paddingTop + plotHeight - normalizedY * plotHeight;
      return { x, y, val };
    });

    const pathString = points.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier curve control points
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }, '');

    return (
      <g key={paramKey}>
        {/* Glow backdrop path */}
        <path
          d={pathString}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20 blur-sm pointer-events-none"
        />
        {/* Main visible line */}
        <path
          d={pathString}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
      </g>
    );
  };

  // Currently hovered item
  const hoveredItem = hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null;

  return (
    <div className="rounded-2xl glass-panel p-5 lg:p-6 border border-cyan-500/20 flex flex-col justify-between">
      {/* Chart Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              {t.historicalTrends}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive telemetry stream & diurnal cycles
            </p>
          </div>
        </div>

        {/* Limit Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 p-1 rounded-xl text-xs">
          {[20, 40, 60, 80].map((limit) => (
            <button
              key={limit}
              onClick={() => setPointsLimit(limit)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                pointsLimit === limit
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {limit} pts
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Toggle Pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {PARAM_CONFIGS.map((meta) => {
          const isSelected = selectedParams[meta.key];
          return (
            <button
              key={meta.key}
              onClick={() => toggleParam(meta.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900/90 shadow-md border-opacity-60 text-slate-100'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: isSelected ? meta.accentHex : undefined,
              }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: isSelected ? meta.accentHex : '#64748b' }} 
              />
              <span>{meta.name[language]}</span>
              {isSelected ? <Eye className="w-3 h-3 text-slate-400 ml-1" /> : <EyeOff className="w-3 h-3 text-slate-600 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Main SVG Graph */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Subtle Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + plotHeight * pct;
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="rgba(51, 65, 85, 0.4)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Time axis ticks */}
          {chartData.map((d, index) => {
            // Draw every 5th or 8th label
            const step = Math.ceil(chartData.length / 8);
            if (index % step !== 0 && index !== chartData.length - 1) return null;
            const x = paddingLeft + (index / (chartData.length - 1)) * plotWidth;
            return (
              <text
                key={index}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                className="font-mono"
              >
                {d.label}
              </text>
            );
          })}

          {/* Render Lines for Active Parameters */}
          {PARAM_CONFIGS.map((meta) => {
            if (!selectedParams[meta.key]) return null;
            return renderLinePath(meta.key, meta.accentHex);
          })}

          {/* Interactive Hover Crosshair overlay zones */}
          {chartData.map((d, index) => {
            const x = paddingLeft + (index / (chartData.length - 1)) * plotWidth;
            const colWidth = plotWidth / Math.max(chartData.length - 1, 1);
            return (
              <rect
                key={index}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
          })}

          {/* Hover Crosshair vertical bar */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <g>
              <line
                x1={paddingLeft + (hoveredIndex / (chartData.length - 1)) * plotWidth}
                y1={paddingTop}
                x2={paddingLeft + (hoveredIndex / (chartData.length - 1)) * plotWidth}
                y2={paddingTop + plotHeight}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={paddingLeft + (hoveredIndex / (chartData.length - 1)) * plotWidth}
                cy={paddingTop}
                r="4"
                fill="#38bdf8"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredItem && hoveredIndex !== null && (
          <div 
            className="absolute z-20 pointer-events-none top-2 right-4 p-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-xl text-xs space-y-1.5"
          >
            <div className="font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
              <span>Timestamp</span>
              <span>{hoveredItem.label}</span>
            </div>
            {PARAM_CONFIGS.map((meta) => {
              if (!selectedParams[meta.key]) return null;
              const val = hoveredItem.values[meta.key];
              return (
                <div key={meta.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: meta.accentHex }} 
                    />
                    <span className="text-slate-300">{meta.name[language]}:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100">
                    {val?.toFixed(meta.key === 'ammonia' ? 3 : meta.key === 'ph' ? 2 : 1)} {meta.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
