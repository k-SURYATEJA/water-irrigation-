import {
  Field,
  WaterResource,
  Canal,
  Pump,
  WeatherData,
  OptimizationResult,
  Alert,
  WaterDemandEstimation,
} from '../types.js';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchFields(segment?: string): Promise<Field[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/fields${query}`);
  if (!res.ok) throw new Error('Failed to fetch fields');
  return res.json();
}

export async function saveField(field: Partial<Field>): Promise<{ message: string; field?: Field }> {
  const res = await fetch('/api/fields', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(field),
  });
  if (!res.ok) throw new Error('Failed to save field');
  return res.json();
}

export async function deleteField(id: string): Promise<void> {
  const res = await fetch(`/api/fields/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete field');
}

export async function fetchWaterResources(segment?: string): Promise<WaterResource[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/water-resources${query}`);
  if (!res.ok) throw new Error('Failed to fetch water resources');
  return res.json();
}

export async function updateWaterResource(id: string, updates: Partial<WaterResource>): Promise<void> {
  const res = await fetch(`/api/water-resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update water resource');
}

export async function fetchCanals(segment?: string): Promise<Canal[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/canals${query}`);
  if (!res.ok) throw new Error('Failed to fetch canals');
  return res.json();
}

export async function fetchPumps(segment?: string): Promise<Pump[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/pumps${query}`);
  if (!res.ok) throw new Error('Failed to fetch pumps');
  return res.json();
}

export async function fetchWeather(segment?: string): Promise<Record<string, WeatherData>> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/weather${query}`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function fetchSoilData(segment?: string): Promise<any[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/soil-data${query}`);
  if (!res.ok) throw new Error('Failed to fetch soil data');
  return res.json();
}

export async function fetchDemandEstimation(segment?: string): Promise<WaterDemandEstimation[]> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/demand-estimation${query}`);
  if (!res.ok) throw new Error('Failed to fetch demand estimation');
  return res.json();
}

export async function runOptimization(options: {
  availableWaterOverride?: number;
  rainfallMultiplier?: number;
  cropDemandMultiplier?: number;
  canalCapacityMultiplier?: number;
  customIterations?: number;
  segment?: string;
} = {}): Promise<OptimizationResult> {
  const res = await fetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) throw new Error('Failed to run optimization');
  return res.json();
}

export async function fetchSchedule(segment?: string): Promise<{
  schedule: any[];
  baselineSchedule: any[];
  metrics: any;
  timestamp: string;
}> {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/schedule${query}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function runSimulation(payload: {
  scenarioName: string;
  availableWater?: number;
  rainfallMultiplier?: number;
  cropDemandMultiplier?: number;
  canalCapacityMultiplier?: number;
  segment?: string;
}) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function fetchAnalytics(segment?: string) {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/analytics${query}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch('/api/alerts');
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlerts(id?: string): Promise<void> {
  const res = await fetch('/api/alerts/acknowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to acknowledge alerts');
}

export async function resetDemoData(): Promise<any> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}

export async function fetchDatasetSegments() {
  const res = await fetch('/api/datasets/segments');
  if (!res.ok) throw new Error('Failed to fetch dataset segments');
  return res.json();
}

export async function fetchDatasetExplorerData() {
  const res = await fetch('/api/datasets/explorer');
  if (!res.ok) throw new Error('Failed to fetch dataset explorer data');
  return res.json();
}

export async function fetchDatasetTelemetry(segment?: string) {
  const query = segment && segment !== 'all' ? `?segment=${segment}` : '';
  const res = await fetch(`/api/datasets/telemetry${query}`);
  if (!res.ok) throw new Error('Failed to fetch dataset telemetry');
  return res.json();
}

export async function fetchWeatherTimeseries(zoneKey?: string) {
  const query = zoneKey ? `?zone=${zoneKey}` : '';
  const res = await fetch(`/api/datasets/weather-timeseries${query}`);
  if (!res.ok) throw new Error('Failed to fetch weather timeseries');
  return res.json();
}

