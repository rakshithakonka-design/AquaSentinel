import React, { useState } from 'react';
import { 
  FlaskConical, 
  Wind, 
  AlertOctagon, 
  Flame, 
  ShieldAlert, 
  EyeOff, 
  Send, 
  CheckCircle2, 
  Radio, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Language, TelemetryValues } from '../types';
import { FAULT_DESCRIPTIONS, UI_TRANSLATIONS } from '../constants';

interface SimulationStudioProps {
  currentValues: TelemetryValues;
  language: Language;
  onRefresh: () => void;
  onInjectFallback?: (faultId: string) => boolean;
  onIngestFallback?: (values: TelemetryValues) => void;
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({
  currentValues,
  language,
  onRefresh,
  onInjectFallback,
  onIngestFallback,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [injectingFault, setInjectingFault] = useState<string | null>(null);
  const [injectFeedback, setInjectFeedback] = useState<string | null>(null);
  const [isManualExpanded, setIsManualExpanded] = useState<boolean>(false);

  // Manual IoT Ingestion form state
  const [manualForm, setManualForm] = useState<TelemetryValues>({
    temperature: currentValues.temperature || 28.5,
    ph: currentValues.ph || 7.4,
    do: currentValues.do || 5.8,
    turbidity: currentValues.turbidity || 32.0,
    ammonia: currentValues.ammonia || 0.12,
  });
  const [apiKey, setApiKey] = useState<string>('aquasentinel-secret-key');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const handleInject = async (faultId: string) => {
    setInjectingFault(faultId);
    setInjectFeedback(null);
    try {
      const response = await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fault: faultId }),
      });
      const data = await response.json();
      if (response.ok) {
        setInjectFeedback(`✓ Incident "${faultId}" dispatched to engine.`);
        onRefresh();
      } else {
        throw new Error(data.error || 'Failed to inject fault');
      }
    } catch {
      if (onInjectFallback) {
        onInjectFallback(faultId);
        setInjectFeedback(`✓ [Edge Mode] Incident "${faultId}" active. Simulating biophysical escalation in browser.`);
        onRefresh();
      } else {
        setInjectFeedback('⚠ Network error dispatching incident injection.');
      }
    } finally {
      setInjectingFault(null);
      setTimeout(() => setInjectFeedback(null), 5000);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(manualForm),
      });
      const data = await response.json();
      if (response.ok) {
        setIngestStatus(`✓ Telemetry ingested successfully! Engine State: ${data.state}, Health Score: ${data.score}`);
        onRefresh();
      } else {
        throw new Error(data.error || 'Check API key or numbers');
      }
    } catch {
      if (onIngestFallback) {
        onIngestFallback(manualForm);
        setIngestStatus('✓ [Edge Mode] Telemetry values ingested directly into client telemetry matrix!');
        onRefresh();
      } else {
        setIngestStatus('⚠ Connection failed when reaching ingestion gateway.');
      }
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestStatus(null), 6000);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 lg:p-6 border border-cyan-500/20 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                {t.simulationStudio}
              </h3>
              <p className="text-xs text-slate-400">
                Stress-test Isolation Forest detection & predictive alerts
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            DIURNAL STRESS LAB
          </span>
        </div>

        {/* Feedback message */}
        {injectFeedback && (
          <div className="my-2 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{injectFeedback}</span>
          </div>
        )}

        {/* 1-Click Fault Injection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
          {FAULT_DESCRIPTIONS.map((f) => {
            const isTarget = injectingFault === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleInject(f.id)}
                disabled={isTarget}
                className={`text-left p-3 rounded-xl border bg-slate-900/60 hover:bg-slate-800/80 transition-all group flex flex-col justify-between ${f.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/10">
                      {f.badge}
                    </span>
                    <span className="text-xs opacity-75 font-mono">{isTarget ? 'Ramping...' : 'Inject'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {f.title[language]}
                  </h4>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  {f.effect}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion: Manual IoT Gateway Ingestion Station */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsManualExpanded(!isManualExpanded)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 text-xs text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{t.manualIngest}</span>
          </div>
          {isManualExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isManualExpanded && (
          <form onSubmit={handleManualIngest} className="mt-3 space-y-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Temp (°C): {manualForm.temperature}</label>
                <input
                  type="range"
                  min="18"
                  max="38"
                  step="0.5"
                  value={manualForm.temperature}
                  onChange={(e) => setManualForm({ ...manualForm, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">DO (mg/L): {manualForm.do}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.2"
                  value={manualForm.do}
                  onChange={(e) => setManualForm({ ...manualForm, do: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">pH: {manualForm.ph}</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={manualForm.ph}
                  onChange={(e) => setManualForm({ ...manualForm, ph: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Turbidity: {manualForm.turbidity} NTU</label>
                <input
                  type="range"
                  min="10"
                  max="140"
                  step="2"
                  value={manualForm.turbidity}
                  onChange={(e) => setManualForm({ ...manualForm, turbidity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ammonia: {manualForm.ammonia} mg/L</label>
                <input
                  type="range"
                  min="0.01"
                  max="2.0"
                  step="0.05"
                  value={manualForm.ammonia}
                  onChange={(e) => setManualForm({ ...manualForm, ammonia: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">X-API-Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            {ingestStatus && (
              <div className="p-2 rounded-lg bg-slate-900 text-xs text-cyan-300 font-mono border border-slate-700">
                {ingestStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isIngesting ? t.submitting : 'POST Telemetry to /api/ingest'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
