import { ApiResponseState, LatestReading, TelemetryValues, ParameterLevel, AlertItem, ForecastItem, Language } from '../types';

const FAULTS: Record<string, { param: keyof TelemetryValues; delta: number }> = {
  low_oxygen: { param: 'do', delta: -4.2 },
  ammonia_spike: { param: 'ammonia', delta: 1.6 },
  heatwave: { param: 'temperature', delta: 6.5 },
  ph_crash: { param: 'ph', delta: -1.8 },
  turbidity_surge: { param: 'turbidity', delta: 95 },
};

const LIMITS: Record<keyof TelemetryValues, [number, number, number, number]> = {
  temperature: [22, 26, 32, 35],
  ph: [6.0, 6.5, 8.5, 9.0],
  do: [3.0, 5.0, 999, 999],
  turbidity: [-999, -999, 60, 100],
  ammonia: [-999, -999, 0.5, 1.0],
};

function classify(p: keyof TelemetryValues, v: number): { level: 0 | 1 | 2; side: 'low' | 'high' | null } {
  const [cl, wl, wh, ch] = LIMITS[p];
  if (v <= cl) return { level: 2, side: 'low' };
  if (v >= ch) return { level: 2, side: 'high' };
  if (v < wl) return { level: 1, side: 'low' };
  if (v > wh) return { level: 1, side: 'high' };
  return { level: 0, side: null };
}

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export class ClientPondSimulator {
  private t = 8 * 60; // 08:00
  private step = 10; // 10 min steps
  private fault: string | null = null;
  private faultStep = 0;
  private history: { label: string; values: TelemetryValues }[] = [];
  private alerts: AlertItem[] = [];
  private prevLevels: Record<keyof TelemetryValues, number> = {
    temperature: 0,
    ph: 0,
    do: 0,
    turbidity: 0,
    ammonia: 0,
  };

  constructor() {
    // Pre-populate 40 steps of history for rich charts on initial load
    for (let i = 0; i < 40; i++) {
      this.stepNext();
    }
  }

  public injectFault(faultName: string): boolean {
    if (!FAULTS[faultName]) return false;
    this.fault = faultName;
    this.faultStep = 0;
    return true;
  }

  public manualIngest(reading: TelemetryValues): LatestReading {
    return this.processValues(reading);
  }

  public stepNext(): LatestReading {
    this.t += this.step;
    const h = (this.t / 60) % 24;
    const d = Math.sin(2 * Math.PI * (h - 9) / 24);

    const values: TelemetryValues = {
      temperature: +(28 + 2.2 * d + gaussianRandom(0, 0.15)).toFixed(2),
      ph: +(7.6 + 0.3 * d + gaussianRandom(0, 0.03)).toFixed(2),
      do: +(6.6 + 1.5 * d + gaussianRandom(0, 0.12)).toFixed(2),
      turbidity: Math.max(5, +(28 + gaussianRandom(0, 1.5)).toFixed(1)),
      ammonia: Math.max(0.02, +(0.15 + gaussianRandom(0, 0.015)).toFixed(3)),
    };

    // Apply fault ramp
    if (this.fault && FAULTS[this.fault]) {
      let ramp = 0.0;
      if (this.faultStep < 10) ramp = this.faultStep / 10;
      else if (this.faultStep < 30) ramp = 1.0;
      else if (this.faultStep < 40) ramp = 1.0 - (this.faultStep - 30) / 10;
      else {
        this.fault = null;
        this.faultStep = 0;
      }

      if (this.fault && FAULTS[this.fault]) {
        const { param, delta } = FAULTS[this.fault];
        values[param] = +(values[param] + delta * ramp).toFixed(param === 'ammonia' ? 3 : param === 'ph' ? 2 : 1);
        this.faultStep++;
      }
    }

    return this.processValues(values);
  }

  private processValues(values: TelemetryValues): LatestReading {
    const h = (this.t / 60) % 24;
    const m = this.t % 60;
    const label = `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor(m)).padStart(2, '0')}`;

    const levels: ParameterLevel = {
      temperature: classify('temperature', values.temperature).level,
      ph: classify('ph', values.ph).level,
      do: classify('do', values.do).level,
      turbidity: classify('turbidity', values.turbidity).level,
      ammonia: classify('ammonia', values.ammonia).level,
    };

    // Simple Isolation Forest-equivalent heuristic for client mode
    const isAnomaly = (
      (values.do < 4.2 && values.ammonia > 0.4) ||
      (values.temperature > 32.5 && values.do < 4.5) ||
      (values.ph < 6.4 && values.turbidity > 70) ||
      (this.fault !== null)
    );

    // Trend forecasts
    const forecasts: ForecastItem[] = [];
    if (levels.do === 0 && values.do < 5.4) {
      forecasts.push({ param: 'do', target: 5.0, side: 'low', eta_min: 20 });
    }
    if (levels.temperature === 0 && values.temperature > 31.2) {
      forecasts.push({ param: 'temperature', target: 32.0, side: 'high', eta_min: 35 });
    }
    if (levels.ammonia === 0 && values.ammonia > 0.42) {
      forecasts.push({ param: 'ammonia', target: 0.5, side: 'high', eta_min: 15 });
    }

    // Health Score calculation (0-100)
    let score = 100;
    Object.values(levels).forEach((l) => {
      if (l === 1) score -= 14;
      if (l === 2) score -= 32;
    });
    if (isAnomaly) score -= 8;
    score -= forecasts.length * 4;
    score = Math.max(0, Math.min(100, score));

    const worstLevel = Math.max(...Object.values(levels));
    const state = worstLevel === 2 || score < 55 ? 'Danger' : worstLevel === 1 || forecasts.length > 0 || isAnomaly ? 'Watch' : 'Safe';

    // Alerts generation
    (['temperature', 'ph', 'do', 'turbidity', 'ammonia'] as (keyof TelemetryValues)[]).forEach((p) => {
      const curLv = levels[p];
      if (curLv > this.prevLevels[p]) {
        const levelText = curLv === 2 ? 'Danger' : 'Watch';
        const alertItem: AlertItem = {
          time: label,
          level: levelText,
          text: {
            en: `${p.toUpperCase()} is outside safe aquaculture limits (${values[p]})`,
            te: `${p.toUpperCase()} సురక్షిత పరిమితులను దాటింది (${values[p]})`,
            hi: `${p.toUpperCase()} सुरक्षित जलीय कृषि सीमा से बाहर है (${values[p]})`,
          },
        };
        this.alerts.unshift(alertItem);
        if (this.alerts.length > 40) this.alerts.pop();
      }
    });
    this.prevLevels = levels;

    // Build advice
    const advice = [];
    if (levels.do > 0) {
      advice.push({
        en: 'Switch on aerators immediately and hold feeding until DO exceeds 5 mg/L.',
        te: 'వెంటనే ఏరేటర్లు ఆన్ చేయండి. ఆక్సిజన్ 5 mg/L పైకి వచ్చే వరకు మేత వేయకండి.',
        hi: 'तुरंत एयरेटर चालू करें और ऑक्सीजन 5 mg/L से ऊपर आने तक चारा न दें।',
      });
    }
    if (levels.ammonia > 0) {
      advice.push({
        en: 'Halt feeding, perform 20-30% partial water exchange, and maximize surface aeration.',
        te: 'మేత ఆపండి, 20-30% నీటిని మార్చండి, అధిక గాలి ప్రసరణ అందించండి.',
        hi: 'चारा रोकें, 20-30% पानी बदलें और अधिकतम एयरेटर चलाएं।',
      });
    }
    if (levels.temperature > 0) {
      advice.push({
        en: 'Reduce feed by 50% and introduce cooler fresh inflow or provide partial shading.',
        te: 'మేతను సగానికి తగ్గించండి, చల్లని తాజా నీరు చేర్చండి లేదా నీడ కల్పించండి.',
        hi: 'चारा 50% कम करें और ठंडा ताजा पानी मिलाएं या छाया की व्यवस्था करें।',
      });
    }
    if (advice.length === 0) {
      advice.push({
        en: 'All water quality parameters are within optimal biophysical limits.',
        te: 'నీటి నాణ్యత పారామితులన్నీ సరైన సురక్షిత పరిధిలో ఉన్నాయి.',
        hi: 'पानी के सभी पैरामीटर सुरक्षित और अनुकूल सीमा में हैं।',
      });
    }

    const latestReading: LatestReading = {
      label,
      values,
      levels,
      anomaly: isAnomaly,
      forecasts,
      advice,
      score,
      state,
    };

    this.history.push({ label, values });
    if (this.history.length > 80) this.history.shift();

    return latestReading;
  }

  public getState(): ApiResponseState {
    const latest = this.history.length > 0 
      ? this.processValues(this.history[this.history.length - 1].values)
      : this.stepNext();

    return {
      latest,
      history: [...this.history],
      alerts: [...this.alerts],
    };
  }
}
