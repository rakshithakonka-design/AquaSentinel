import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Cpu, 
  TrendingUp, 
  BellRing,
  Sparkles,
  Info
} from 'lucide-react';
import { Language, PondState, ForecastItem, MultilingualText } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface PondHealthGaugeProps {
  score: number;
  state: PondState;
  anomaly: boolean;
  forecasts: ForecastItem[];
  adviceList: MultilingualText[];
  language: Language;
  alertsCount: number;
}

export const PondHealthGauge: React.FC<PondHealthGaugeProps> = ({
  score,
  state,
  anomaly,
  forecasts,
  adviceList,
  language,
  alertsCount,
}) => {
  const t = UI_TRANSLATIONS[language];

  // SVG Gauge calculations
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(Math.max(score, 0), 100)) / 100;

  // Status-dependent palette
  const getStatusDetails = () => {
    switch (state) {
      case 'Danger':
        return {
          colorClass: 'text-rose-400',
          bgBorder: 'border-rose-500/40 bg-rose-950/20 glow-rose',
          statusText: t.statusDanger,
          icon: AlertOctagon,
          strokeGradient: 'url(#gradient-danger)',
          subText: 'Immediate intervention needed to prevent biomass mortality',
        };
      case 'Watch':
        return {
          colorClass: 'text-amber-400',
          bgBorder: 'border-amber-500/40 bg-amber-950/20 glow-amber',
          statusText: t.statusWatch,
          icon: AlertTriangle,
          strokeGradient: 'url(#gradient-watch)',
          subText: 'Parameters trending toward threshold boundaries',
        };
      case 'Safe':
      default:
        return {
          colorClass: 'text-emerald-400',
          bgBorder: 'border-emerald-500/40 bg-emerald-950/20 glow-emerald',
          statusText: t.statusSafe,
          icon: ShieldCheck,
          strokeGradient: 'url(#gradient-safe)',
          subText: 'All biophysical parameters within ideal aquatic limits',
        };
    }
  };

  const status = getStatusDetails();
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-2xl glass-panel p-5 lg:p-6 transition-all duration-500 border ${status.bgBorder} flex flex-col justify-between relative overflow-hidden`}>
      {/* Decorative ambient background blur */}
      <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
        state === 'Danger' ? 'bg-rose-500' : state === 'Watch' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
              {t.healthScore}
            </h2>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.livePond}
          </p>
        </div>

        {/* State Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide uppercase shadow-sm ${
          state === 'Danger' 
            ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-bounce' 
            : state === 'Watch'
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
            : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
        }`}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.statusText}</span>
        </div>
      </div>

      {/* Main Body: Gauge and Core Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radial SVG Circular Progress Meter */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-135" viewBox={`0 0 ${size} ${size}`}>
              <defs>
                <linearGradient id="gradient-safe" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradient-watch" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              {/* Background Track Arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(30, 41, 59, 0.7)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />

              {/* Active Progress Arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={status.strokeGradient}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Score Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl lg:text-5xl font-extrabold font-mono tracking-tight ${status.colorClass}`}>
                {score}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                / 100 Index
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-slate-400 mt-1 max-w-[220px]">
            {status.subText}
          </p>
        </div>

        {/* Intelligence Badges and AI Anomaly Analysis */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* Isolation Forest ML Detector Pill */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
            anomaly 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
          }`}>
            <div className={`p-2 rounded-lg ${anomaly ? 'bg-rose-900/60 text-rose-300' : 'bg-cyan-950/60 text-cyan-400'}`}>
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t.isolationForest}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  anomaly ? 'bg-rose-500 text-white' : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                }`}>
                  {anomaly ? 'ANOMALY FLAGGED' : 'NOMINAL MATRIX'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed text-slate-300">
                {anomaly ? t.mlAnomaly : t.mlNominal}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/50 text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Early Forecasts</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {forecasts.length} {forecasts.length === 1 ? 'Trend' : 'Trends'} Active
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Incident Events</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {alertsCount} Recorded
                </span>
              </div>
            </div>
          </div>

          {/* High Priority Advice Snippet (if any) */}
          {adviceList.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-200 leading-relaxed">
                <span className="font-semibold text-cyan-300">Agronomist Advisory: </span>
                {adviceList[0][language] || adviceList[0].en}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
