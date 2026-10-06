import React from 'react';
import { 
  Activity, 
  Clock, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Download, 
  Radio, 
  Globe, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset 
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isConnected: boolean;
  isSimulating: boolean;
  currentTime: string;
  refreshRate: number;
  onRefreshRateChange: (rate: number) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onManualRefresh: () => void;
  onExportData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isConnected,
  isSimulating,
  currentTime,
  refreshRate,
  onRefreshRateChange,
  isAudioEnabled,
  onToggleAudio,
  onManualRefresh,
  onExportData,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Calculate diurnal solar phase based on current time label (e.g. "14:20")
  const getSolarPhase = (timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0] || '12', 10);
    if (hour >= 5 && hour < 9) {
      return { label: t.diurnalDawn, icon: Sunrise, color: 'text-amber-400' };
    } else if (hour >= 9 && hour < 17) {
      return { label: t.diurnalNoon, icon: Sun, color: 'text-yellow-400' };
    } else if (hour >= 17 && hour < 20) {
      return { label: t.diurnalDusk, icon: Sunset, color: 'text-orange-400' };
    } else {
      return { label: t.diurnalNight, icon: Moon, color: 'text-indigo-400' };
    }
  };

  const solar = getSolarPhase(currentTime);
  const SolarIcon = solar.icon;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#081220] rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#060b13] animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#060b13]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-white bg-clip-text text-transparent">
                {t.systemTitle}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                v2.4 IoT
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.systemTagline}
            </p>
          </div>
        </div>

        {/* Center: Pond Clock & Diurnal Phase */}
        <div className="flex items-center gap-4 px-4 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SolarIcon className={`w-4 h-4 ${solar.color} animate-spin-slow`} />
            <span className="text-xs text-slate-300 hidden md:inline font-medium">
              {solar.label.split('(')[0].trim()}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1.5 font-mono text-cyan-300 text-sm font-semibold tracking-wider">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '08:00'}</span>
            <span className="text-[10px] text-slate-400 font-normal uppercase">Pond Time</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Connection Pill */}
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs font-medium text-slate-300">
              {isConnected ? t.connected : t.reconnecting}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Refresh cadence selector */}
          <div className="flex items-center text-xs bg-slate-900/80 border border-slate-700/60 rounded-lg p-0.5">
            <button
              onClick={() => onRefreshRateChange(1500)}
              title="1.5s live polling"
              className={`px-2 py-1 rounded-md transition-colors ${
                refreshRate === 1500 ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1.5s
            </button>
            <button
              onClick={() => onRefreshRateChange(3000)}
              title="3s polling"
              className={`px-2 py-1 rounded-md transition-colors ${
                refreshRate === 3000 ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3s
            </button>
            <button
              onClick={() => onRefreshRateChange(0)}
              title="Pause auto-polling"
              className={`px-2 py-1 rounded-md transition-colors ${
                refreshRate === 0 ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pause
            </button>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioEnabled ? 'Mute alert chimes' : 'Enable alert sound'}
            className={`p-2 rounded-lg border transition-all ${
              isAudioEnabled 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50' 
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onManualRefresh}
            title={t.refresh}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export Report */}
          <button
            onClick={onExportData}
            title={t.exportReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 hover:border-cyan-500/40 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">{t.exportReport}</span>
          </button>

          {/* Language Switcher */}
          <div className="relative flex items-center bg-slate-900/80 border border-slate-700 rounded-lg p-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(['en', 'te', 'hi'] as Language[]).map((langKey) => (
              <button
                key={langKey}
                onClick={() => onLanguageChange(langKey)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  language === langKey
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {langKey === 'en' ? 'EN' : langKey === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
