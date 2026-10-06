import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertOctagon, CheckCircle, Filter, Trash2 } from 'lucide-react';
import { AlertItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface AlertFeedProps {
  alerts: AlertItem[];
  language: Language;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [filter, setFilter] = useState<'all' | 'Danger' | 'Watch'>('all');
  const [acknowledgedTimes, setAcknowledgedTimes] = useState<Set<string>>(new Set());

  const filteredAlerts = alerts
    .filter((a) => !acknowledgedTimes.has(a.time))
    .filter((a) => (filter === 'all' ? true : a.level === filter));

  const handleAcknowledge = (time: string) => {
    setAcknowledgedTimes((prev) => new Set([...prev, time]));
  };

  const handleClearAll = () => {
    setAcknowledgedTimes(new Set(alerts.map((a) => a.time)));
  };

  return (
    <div className="rounded-2xl glass-panel p-5 lg:p-6 border border-cyan-500/20 flex flex-col h-[460px] justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-300">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>{t.alertAudit}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {filteredAlerts.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Audited chronological pond safety infractions
              </p>
            </div>
          </div>

          {filteredAlerts.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Acknowledge all alerts"
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.filter((a) => !acknowledgedTimes.has(a.time)).length})
          </button>
          <button
            onClick={() => setFilter('Danger')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filter === 'Danger'
                ? 'bg-rose-900 text-rose-200 border border-rose-500/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            Danger
          </button>
          <button
            onClick={() => setFilter('Watch')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filter === 'Watch'
                ? 'bg-amber-900 text-amber-200 border border-amber-500/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Watch
          </button>
        </div>
      </div>

      {/* Alert items list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500/60 mb-2" />
            <p className="text-xs font-medium">{t.noAlerts}</p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const isDanger = alert.level === 'Danger';
            const LevelIcon = isDanger ? AlertOctagon : AlertTriangle;
            return (
              <div
                key={`${alert.time}-${idx}`}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                  isDanger
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isDanger ? 'bg-rose-900/80 text-rose-300' : 'bg-amber-900/80 text-amber-300'
                    }`}
                  >
                    <LevelIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold tracking-wider opacity-80">
                        {alert.time}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isDanger ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-slate-200 leading-snug">
                      {alert.text[language] || alert.text.en}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAcknowledge(alert.time)}
                  title="Acknowledge alert"
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900/80 border border-slate-700/60 shrink-0 transition-colors"
                >
                  Ack
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
        Telemetry audit stored in server memory (Last 40 events)
      </div>
    </div>
  );
};
