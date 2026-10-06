import React from 'react';
import { TelemetryValues, Language, PondState } from '../types';
import { UI_TRANSLATIONS } from '../constants';
import { Waves, Wind, Sun, Moon, AlertTriangle } from 'lucide-react';

interface DigitalTwinPondProps {
  values: TelemetryValues;
  state: PondState;
  timeLabel: string;
  language: Language;
}

export const DigitalTwinPond: React.FC<DigitalTwinPondProps> = ({
  values,
  state,
  timeLabel,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Diurnal sun/moon detection
  const hour = parseInt(timeLabel.split(':')[0] || '12', 10);
  const isNight = hour < 6 || hour >= 19;

  // Turbidity factor (0 to 1)
  const turbidityFactor = Math.min(Math.max((values.turbidity - 20) / 100, 0), 1);
  // Low DO condition
  const isHypoxia = values.do < 4.5;
  // High Ammonia condition
  const isAmmoniaToxic = values.ammonia > 0.5;

  // Dynamic pond background gradient
  const getWaterGradient = () => {
    if (isAmmoniaToxic) {
      return 'linear-gradient(180deg, rgba(76, 29, 149, 0.4) 0%, rgba(136, 19, 55, 0.6) 50%, rgba(15, 23, 42, 0.95) 100%)';
    }
    if (turbidityFactor > 0.5) {
      return 'linear-gradient(180deg, rgba(101, 74, 30, 0.45) 0%, rgba(42, 59, 36, 0.7) 50%, rgba(15, 23, 42, 0.95) 100%)';
    }
    if (isHypoxia) {
      return 'linear-gradient(180deg, rgba(159, 18, 57, 0.35) 0%, rgba(30, 58, 138, 0.6) 50%, rgba(15, 23, 42, 0.95) 100%)';
    }
    if (isNight) {
      return 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(12, 74, 96, 0.7) 50%, rgba(6, 25, 44, 0.95) 100%)';
    }
    return 'linear-gradient(180deg, rgba(6, 182, 212, 0.3) 0%, rgba(13, 148, 136, 0.55) 50%, rgba(15, 23, 42, 0.95) 100%)';
  };

  return (
    <div className="rounded-2xl glass-panel p-5 lg:p-6 border border-cyan-500/20 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-950/70 border border-teal-500/30 text-teal-300">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              {t.digitalTwin}
            </h3>
            <p className="text-xs text-slate-400">
              Live biophysical pond depth profile & fish welfare
            </p>
          </div>
        </div>

        {/* Aerator Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
            isHypoxia 
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse' 
              : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
          }`}>
            <Wind className={`w-3.5 h-3.5 ${isHypoxia ? 'animate-spin' : ''}`} />
            <span>Aerators: {isHypoxia ? 'EMERGENCY 100%' : 'NOMINAL (Auto)'}</span>
          </div>
        </div>
      </div>

      {/* Cross-Section Pond Canvas Simulation */}
      <div 
        className="w-full h-64 rounded-xl border border-cyan-500/30 relative overflow-hidden transition-all duration-1000 shadow-inner"
        style={{ background: getWaterGradient() }}
      >
        {/* Sun / Moon Light Shafts */}
        <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none opacity-40 bg-gradient-to-b from-white/20 to-transparent" />
        
        {/* Sky / Surface Boundary */}
        <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-4 border-b border-cyan-400/20 bg-slate-950/30 backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
            <span>Water Surface Level</span>
            <span className="text-slate-400">• 1.65m Depth</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isNight ? (
              <span className="flex items-center gap-1 text-indigo-300">
                <Moon className="w-3.5 h-3.5" /> Night Respiration
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300">
                <Sun className="w-3.5 h-3.5" /> Solar Irradiation
              </span>
            )}
          </div>
        </div>

        {/* Aerator Paddlewheel Station on left */}
        <div className="absolute top-7 left-8 flex flex-col items-center pointer-events-none z-10">
          <div className="w-12 h-6 bg-slate-800 border border-slate-600 rounded-t-md shadow-md flex items-center justify-center">
            <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider">AER-01</span>
          </div>
          {/* Spinning paddlewheel */}
          <div className="relative w-10 h-10 -mt-2">
            <div 
              className={`w-full h-full rounded-full border-2 border-dashed border-cyan-400 ${
                isHypoxia ? 'animate-spin text-rose-400 border-rose-400' : 'animate-spin-slow'
              }`}
            />
            {/* Spray water droplets */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-200 animate-ping opacity-75" />
            </div>
          </div>
        </div>

        {/* Rising Oxygen Bubbles */}
        <div className="bubble w-3 h-3 left-14" style={{ animationDuration: '4.5s', animationDelay: '0.2s' }} />
        <div className="bubble w-2 h-2 left-20" style={{ animationDuration: '3.8s', animationDelay: '1.2s' }} />
        <div className="bubble w-4 h-4 left-16" style={{ animationDuration: '5.2s', animationDelay: '2.5s' }} />
        <div className="bubble w-2 h-2 left-28" style={{ animationDuration: '4.1s', animationDelay: '0.8s' }} />

        {/* Turbidity Particle Cloud (if turbid) */}
        {turbidityFactor > 0.3 && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-700"
            style={{ 
              backgroundColor: 'rgba(120, 113, 108, 0.45)',
              opacity: turbidityFactor 
            }}
          />
        )}

        {/* Swimming Fish Models */}
        {/* Fish 1: Upper Swimmer */}
        <div 
          className={`absolute animate-swim-1 pointer-events-none transition-all duration-700 ${
            isHypoxia ? 'top-10' : 'top-20'
          }`}
        >
          <div className="flex items-center">
            {/* Simple geometric fish SVG */}
            <svg width="42" height="22" viewBox="0 0 42 22" fill="none">
              <path
                d="M38 11C38 11 26 2 14 6C8 9 2 4 2 4C2 4 4 11 2 18C2 18 8 13 14 16C26 20 38 11 38 11Z"
                fill={isHypoxia ? '#fda4af' : '#67e8f9'}
                stroke="#0891b2"
                strokeWidth="1.2"
              />
              <circle cx="30" cy="9" r="1.5" fill="#0f172a" />
              <path d="M22 8L16 11L22 14" stroke="#0891b2" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Fish 2: Mid-Depth Swimmer */}
        <div 
          className={`absolute animate-swim-2 pointer-events-none transition-all duration-700 ${
            isHypoxia ? 'top-14' : 'top-32'
          }`}
        >
          <div className="flex items-center">
            <svg width="36" height="18" viewBox="0 0 42 22" fill="none">
              <path
                d="M38 11C38 11 26 2 14 6C8 9 2 4 2 4C2 4 4 11 2 18C2 18 8 13 14 16C26 20 38 11 38 11Z"
                fill={isHypoxia ? '#fda4af' : '#a7f3d0'}
                stroke="#059669"
                strokeWidth="1.2"
              />
              <circle cx="30" cy="9" r="1.5" fill="#0f172a" />
            </svg>
          </div>
        </div>

        {/* Fish 3: Reverse Swimmer */}
        <div 
          className={`absolute animate-swim-rev pointer-events-none transition-all duration-700 ${
            isHypoxia ? 'top-12' : 'bottom-10'
          }`}
        >
          <div className="flex items-center">
            <svg width="38" height="20" viewBox="0 0 42 22" fill="none">
              <path
                d="M38 11C38 11 26 2 14 6C8 9 2 4 2 4C2 4 4 11 2 18C2 18 8 13 14 16C26 20 38 11 38 11Z"
                fill={isHypoxia ? '#fda4af' : '#7dd3fc'}
                stroke="#0284c7"
                strokeWidth="1.2"
              />
              <circle cx="30" cy="9" r="1.5" fill="#0f172a" />
            </svg>
          </div>
        </div>

        {/* Benthic Sediment & Pond Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent border-t border-slate-700/40 flex items-center justify-between px-4">
          <span className="text-[10px] text-slate-500 font-mono">Benthic Clay Substrate</span>
          <span className="text-[10px] text-slate-500 font-mono">Sediment DO: {(values.do * 0.7).toFixed(1)} mg/L</span>
        </div>

        {/* Hypoxia Emergency Warning Banner inside pond */}
        {isHypoxia && (
          <div className="absolute top-10 right-4 px-3 py-1.5 rounded-lg bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>FISH GASPING AT SURFACE (HYPOXIA)</span>
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>DO Level: {values.do.toFixed(1)} mg/L</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Temp: {values.temperature.toFixed(1)} °C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Turbidity: {values.turbidity.toFixed(0)} NTU</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span>Ammonia: {values.ammonia.toFixed(2)} mg/L</span>
        </div>
      </div>
    </div>
  );
};
