import React from 'react';
import { 
  Waves, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Droplets,
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertOctagon, 
  Info,
  Clock
} from 'lucide-react';
import { ParameterMeta, Language, ForecastItem, HistoryPoint } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface ParameterCardProps {
  meta: ParameterMeta;
  value: number;
  level: 0 | 1 | 2; // 0: Normal, 1: Watch, 2: Danger
  forecast?: ForecastItem;
  history: HistoryPoint[];
  language: Language;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  meta,
  value,
  level,
  forecast,
  history,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Dynamic icon mapping
  const renderIcon = () => {
    const props = { className: 'w-5 h-5 text-white' };
    switch (meta.icon) {
      case 'Waves': return <Waves {...props} />;
      case 'Thermometer': return <Thermometer {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'AlertTriangle': return <AlertTriangle {...props} />;
      case 'Droplets': default: return <Droplets {...props} />;
    }
  };

  // Level classification details
  const getLevelDetails = () => {
    switch (level) {
      case 2:
        return {
          label: t.statusDanger,
          badgeBg: 'bg-rose-950/80 border-rose-500/70 text-rose-300',
          glow: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.18)]',
          valueColor: 'text-rose-400',
          statusIcon: AlertOctagon,
        };
      case 1:
        return {
          label: t.statusWatch,
          badgeBg: 'bg-amber-950/80 border-amber-500/70 text-amber-300',
          glow: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          valueColor: 'text-amber-400',
          statusIcon: AlertTriangle,
        };
      case 0:
      default:
        return {
          label: t.statusSafe,
          badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          glow: 'border-cyan-500/20 hover:border-cyan-500/40',
          valueColor: 'text-slate-100',
          statusIcon: CheckCircle2,
        };
    }
  };

  const levelInfo = getLevelDetails();
  const LevelIcon = levelInfo.statusIcon;

  // Calculate percentage along minDisplay to maxDisplay for visual track
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const totalRange = meta.maxDisplay - meta.minDisplay;
  const currentPct = clamp(((value - meta.minDisplay) / totalRange) * 100, 0, 100);

  // Safe zone bounds percentage
  const safeLeftPct = clamp(((meta.safeMin - meta.minDisplay) / totalRange) * 100, 0, 100);
  const safeRightPct = clamp(((meta.safeMax - meta.minDisplay) / totalRange) * 100, 0, 100);
  const safeWidthPct = Math.max(safeRightPct - safeLeftPct, 2);

  // Sparkline calculation from historical readings
  const recentHistory = history.slice(-20);
  const sparklinePoints = recentHistory.map((h, i) => {
    const v = h.values[meta.key] ?? value;
    const x = (i / Math.max(recentHistory.length - 1, 1)) * 120;
    const y = 36 - clamp(((v - meta.minDisplay) / totalRange) * 32, 2, 34);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`rounded-2xl glass-panel p-5 transition-all duration-300 flex flex-col justify-between border ${levelInfo.glow} relative overflow-hidden group hover:translate-y-[-2px]`}>
      {/* Background soft gradient based on parameter accent */}
      <div 
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 pointer-events-none blur-2xl transition-opacity group-hover:opacity-25"
        style={{ backgroundColor: meta.accentHex }}
      />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className={`p-2 rounded-xl bg-gradient-to-br ${meta.color} shadow-md shadow-cyan-500/10`}
            >
              {renderIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 tracking-tight leading-tight">
                {meta.name[language]}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {meta.key.toUpperCase()}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${levelInfo.badgeBg}`}>
            <LevelIcon className="w-3.5 h-3.5" />
            <span>{levelInfo.label}</span>
          </div>
        </div>

        {/* Value and Sparkline Display */}
        <div className="flex items-baseline justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${levelInfo.valueColor}`}>
              {value.toFixed(meta.key === 'ammonia' ? 3 : meta.key === 'ph' ? 2 : 1)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {meta.unit}
            </span>
          </div>

          {/* SVG Mini Sparkline */}
          {recentHistory.length > 2 && (
            <div className="w-28 h-9 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 120 36">
                <polyline
                  fill="none"
                  stroke={meta.accentHex}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                  className="opacity-80"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Visual Target Range Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
            <span>{meta.minDisplay} {meta.unit}</span>
            <span className="text-emerald-400/90 font-medium">
              Target: {meta.safeMin}{meta.safeMax < 900 ? ` - ${meta.safeMax}` : '+'} {meta.unit}
            </span>
            <span>{meta.maxDisplay} {meta.unit}</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800/90 relative overflow-hidden border border-slate-700/60">
            {/* Safe Zone Highlight Band */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400/40"
              style={{ left: `${safeLeftPct}%`, width: `${safeWidthPct}%` }}
              title={`Safe Target: ${meta.safeMin} - ${meta.safeMax} ${meta.unit}`}
            />

            {/* Current Value Needle / Marker */}
            <div 
              className="absolute top-0 bottom-0 w-2 rounded-full transition-all duration-700 shadow-sm -ml-1"
              style={{ 
                left: `${currentPct}%`, 
                backgroundColor: level === 2 ? '#f43f5e' : level === 1 ? '#f59e0b' : '#38bdf8' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Predictive Forecast ETA or Parameter Explanation */}
      <div className="mt-4 pt-3 border-t border-slate-800/70">
        {forecast ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin-slow" />
            <div className="leading-tight">
              <span className="font-semibold">{t.predictedTrend}: </span>
              Crossing <span className="font-mono">{forecast.target}</span> in ~{forecast.eta_min} min
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {meta.description[language]}
          </p>
        )}
      </div>
    </div>
  );
};
