import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ApiResponseState, 
  Language, 
  PondState, 
  TelemetryValues 
} from './types';
import { PARAM_CONFIGS, UI_TRANSLATIONS } from './constants';
import { playAlertChime } from './utils/audio';
import { Navbar } from './components/Navbar';
import { PondHealthGauge } from './components/PondHealthGauge';
import { ParameterCard } from './components/ParameterCard';
import { InteractiveChart } from './components/InteractiveChart';
import { DigitalTwinPond } from './components/DigitalTwinPond';
import { AIAdvisoryChat } from './components/AIAdvisoryChat';
import { AlertFeed } from './components/AlertFeed';
import { SimulationStudio } from './components/SimulationStudio';
import { ShieldCheck, Sparkles, Layers, Activity } from 'lucide-react';

// Fallback initial state if backend is still starting
const INITIAL_DEMO_STATE: ApiResponseState = {
  latest: {
    label: '12:00',
    values: {
      temperature: 28.5,
      ph: 7.45,
      do: 6.2,
      turbidity: 32.0,
      ammonia: 0.12,
    },
    levels: {
      temperature: 0,
      ph: 0,
      do: 0,
      turbidity: 0,
      ammonia: 0,
    },
    anomaly: false,
    forecasts: [],
    advice: [
      {
        en: 'All five readings are inside the safe range.',
        te: 'ఐదు రీడింగ్‌లు సురక్షిత పరిధిలో ఉన్నాయి.',
        hi: 'पांचों रीडिंग सुरक्षित सीमा में हैं।',
      },
    ],
    score: 98,
    state: 'Safe',
  },
  history: Array.from({ length: 30 }, (_, i) => ({
    label: `${String(8 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
    values: {
      temperature: 27.5 + Math.sin(i / 5) * 1.5,
      ph: 7.4 + Math.cos(i / 4) * 0.2,
      do: 6.0 + Math.sin(i / 3) * 0.8,
      turbidity: 30 + (i % 5),
      ammonia: 0.1 + (i % 3) * 0.02,
    },
  })),
  alerts: [],
};

import { ClientPondSimulator } from './utils/clientSimulator';
import { LandingPage } from './components/LandingPage';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash === '#dashboard' || window.location.search.includes('dashboard') ? 'dashboard' : 'landing';
    }
    return 'landing';
  });

  const [data, setData] = useState<ApiResponseState>(INITIAL_DEMO_STATE);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isEdgeSimulator, setIsEdgeSimulator] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [refreshRate, setRefreshRate] = useState<number>(1500); // 1.5s default
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const prevStateRef = useRef<PondState>('Safe');
  const clientSimRef = useRef<ClientPondSimulator>(new ClientPondSimulator());

  // Listen to hash change for back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setViewMode('dashboard');
      } else if (window.location.hash === '' || window.location.hash === '#home') {
        setViewMode('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDashboard = () => {
    setViewMode('dashboard');
    window.location.hash = '#dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch telemetry state from backend or fallback to client simulator
  const fetchTelemetry = useCallback(async () => {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) throw new Error('State fetch failed');
      const json: ApiResponseState = await response.json();
      if (json && json.latest) {
        setData(json);
        setIsConnected(true);
        setIsEdgeSimulator(false);

        // Check if transition to danger occurred and play audio
        if (json.latest.state === 'Danger' && prevStateRef.current !== 'Danger' && isAudioEnabled) {
          playAlertChime('Danger');
        } else if (json.latest.state === 'Watch' && prevStateRef.current === 'Safe' && isAudioEnabled) {
          playAlertChime('Watch');
        }
        prevStateRef.current = json.latest.state;
      }
    } catch {
      // Offline or GitHub Pages: execute client-side biophysical simulation
      const fullState = clientSimRef.current.getState();
      clientSimRef.current.stepNext();
      setData({ ...fullState });
      setIsConnected(true);
      setIsEdgeSimulator(true);

      if (fullState.latest) {
        if (fullState.latest.state === 'Danger' && prevStateRef.current !== 'Danger' && isAudioEnabled) {
          playAlertChime('Danger');
        } else if (fullState.latest.state === 'Watch' && prevStateRef.current === 'Safe' && isAudioEnabled) {
          playAlertChime('Watch');
        }
        prevStateRef.current = fullState.latest.state;
      }
    }
  }, [isAudioEnabled]);

  const handleClientInject = (faultId: string) => {
    return clientSimRef.current.injectFault(faultId);
  };

  const handleClientIngest = (vals: TelemetryValues) => {
    clientSimRef.current.manualIngest(vals);
    setData(clientSimRef.current.getState());
  };

  // Polling loop
  useEffect(() => {
    fetchTelemetry();
    if (refreshRate === 0) return; // paused

    const interval = setInterval(() => {
      fetchTelemetry();
    }, refreshRate);

    return () => clearInterval(interval);
  }, [fetchTelemetry, refreshRate]);

  // Export Telemetry to CSV
  const handleExportData = () => {
    if (!data.history || data.history.length === 0) return;

    const headers = ['Time', 'Temperature (°C)', 'pH', 'Dissolved Oxygen (mg/L)', 'Turbidity (NTU)', 'Ammonia (mg/L)'];
    const rows = data.history.map((h) => [
      h.label,
      h.values.temperature,
      h.values.ph,
      h.values.do,
      h.values.turbidity,
      h.values.ammonia,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquasentinel_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latest = data.latest || INITIAL_DEMO_STATE.latest!;
  const t = UI_TRANSLATIONS[language];

  if (viewMode === 'landing') {
    return <LandingPage onEnterDashboard={navigateToDashboard} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060b13] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        isConnected={isConnected}
        isSimulating={true}
        currentTime={latest.label}
        refreshRate={refreshRate}
        onRefreshRateChange={setRefreshRate}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onManualRefresh={fetchTelemetry}
        onExportData={handleExportData}
        onReturnToLanding={navigateToLanding}
      />

      {/* Main Command Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Row 1: Pond Health Gauge and Summary Header */}
        <section aria-label="Pond Health Index">
          <PondHealthGauge
            score={latest.score}
            state={latest.state}
            anomaly={latest.anomaly}
            forecasts={latest.forecasts || []}
            adviceList={latest.advice || []}
            language={language}
            alertsCount={data.alerts.length}
          />
        </section>

        {/* Row 2: 5 Parameter Matrix Cards */}
        <section aria-label="Biophysical Parameter Cards">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Core Water-Quality Telemetry</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Auto-calibrated IoT Sensoring
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PARAM_CONFIGS.map((meta) => {
              const forecast = latest.forecasts?.find((f) => f.param === meta.key);
              return (
                <ParameterCard
                  key={meta.key}
                  meta={meta}
                  value={latest.values[meta.key]}
                  level={latest.levels[meta.key]}
                  forecast={forecast}
                  history={data.history}
                  language={language}
                />
              );
            })}
          </div>
        </section>

        {/* Row 3: Interactive Multi-Series Chart + Digital Twin Pond Cross-Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Telemetry & Digital Twin">
          <div className="lg:col-span-7">
            <InteractiveChart
              history={data.history}
              language={language}
            />
          </div>

          <div className="lg:col-span-5">
            <DigitalTwinPond
              values={latest.values}
              state={latest.state}
              timeLabel={latest.label}
              language={language}
            />
          </div>
        </section>

        {/* Row 4: AI Advisory Chat + Real-Time Alert Incident Log */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Advisory & Alerts">
          <div className="lg:col-span-7">
            <AIAdvisoryChat
              latest={latest}
              language={language}
            />
          </div>

          <div className="lg:col-span-5">
            <AlertFeed
              alerts={data.alerts}
              language={language}
            />
          </div>
        </section>

        {/* Row 5: Emergency Simulation Lab & Manual IoT Ingestion */}
        <section aria-label="Simulation Studio">
          <SimulationStudio
            currentValues={latest.values}
            language={language}
            onRefresh={fetchTelemetry}
            onInjectFallback={handleClientInject}
            onIngestFallback={handleClientIngest}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">AquaSentinel Full-Stack</span>
            <span>• Predictive Aquaculture Water-Quality & Health Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Model: Isolation Forest (Contamination=0.005)</span>
            <span>Diurnal Simulator: Diurnal Solar Sine Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
