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

export async function fetchFields(): Promise<Field[]> {
  const res = await fetch('/api/fields');
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

export async function fetchWaterResources(): Promise<WaterResource[]> {
  const res = await fetch('/api/water-resources');
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

export async function fetchCanals(): Promise<Canal[]> {
  const res = await fetch('/api/canals');
  if (!res.ok) throw new Error('Failed to fetch canals');
  return res.json();
}

export async function fetchPumps(): Promise<Pump[]> {
  const res = await fetch('/api/pumps');
  if (!res.ok) throw new Error('Failed to fetch pumps');
  return res.json();
}

export async function fetchWeather(): Promise<Record<string, WeatherData>> {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function fetchSoilData(): Promise<any[]> {
  const res = await fetch('/api/soil-data');
  if (!res.ok) throw new Error('Failed to fetch soil data');
  return res.json();
}

export async function fetchDemandEstimation(): Promise<WaterDemandEstimation[]> {
  const res = await fetch('/api/demand-estimation');
  if (!res.ok) throw new Error('Failed to fetch demand estimation');
  return res.json();
}

export async function runOptimization(options: {
  availableWaterOverride?: number;
  rainfallMultiplier?: number;
  cropDemandMultiplier?: number;
  canalCapacityMultiplier?: number;
  customIterations?: number;
} = {}): Promise<OptimizationResult> {
  const res = await fetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) throw new Error('Failed to run optimization');
  return res.json();
}

export async function fetchSchedule(): Promise<{
  schedule: any[];
  baselineSchedule: any[];
  metrics: any;
  timestamp: string;
}> {
  const res = await fetch('/api/schedule');
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function runSimulation(payload: {
  scenarioName: string;
  availableWater?: number;
  rainfallMultiplier?: number;
  cropDemandMultiplier?: number;
  canalCapacityMultiplier?: number;
}) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch('/api/analytics');
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
