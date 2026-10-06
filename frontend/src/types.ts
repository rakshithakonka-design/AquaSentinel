export type Language = 'en' | 'te' | 'hi';

export type PondState = 'Safe' | 'Watch' | 'Danger';

export interface TelemetryValues {
  temperature: number;
  ph: number;
  do: number;
  turbidity: number;
  ammonia: number;
}

export interface ParameterLevel {
  temperature: 0 | 1 | 2;
  ph: 0 | 1 | 2;
  do: 0 | 1 | 2;
  turbidity: 0 | 1 | 2;
  ammonia: 0 | 1 | 2;
}

export interface ForecastItem {
  param: keyof TelemetryValues;
  target: number;
  side: 'low' | 'high';
  eta_min: number;
}

export interface MultilingualText {
  en: string;
  te: string;
  hi: string;
}

export interface LatestReading {
  label: string;
  values: TelemetryValues;
  levels: ParameterLevel;
  anomaly: boolean;
  forecasts: ForecastItem[];
  advice: MultilingualText[];
  score: number;
  state: PondState;
}

export interface HistoryPoint {
  label: string;
  values: TelemetryValues;
}

export interface AlertItem {
  time: string;
  level: 'Danger' | 'Watch';
  text: MultilingualText;
}

export interface ApiResponseState {
  latest: LatestReading | null;
  history: HistoryPoint[];
  alerts: AlertItem[];
}

export interface ParameterMeta {
  key: keyof TelemetryValues;
  name: Record<Language, string>;
  unit: string;
  minDisplay: number;
  maxDisplay: number;
  safeMin: number;
  safeMax: number;
  critLow: number;
  critHigh: number;
  color: string;
  accentHex: string;
  description: Record<Language, string>;
  icon: string;
}
