import fs from 'fs';
import path from 'path';

export interface DatasetSegment {
  id: 'all' | 'zone-a-krishna' | 'zone-b-godavari' | 'zone-c-guntur';
  name: string;
  zone: string;
  fieldIds: string[];
  canalIds: string[];
  resourceIds: string[];
  pumpIds: string[];
  weatherRegionKey: string;
  soilType: string;
  description: string;
  coordinates: string;
  primaryCrops: string[];
  keyTelemetryHighlight: string;
}

export const DATASET_SEGMENTS: DatasetSegment[] = [
  {
    id: 'all',
    name: 'Unified Command Basin',
    zone: 'All Zones (Krishna-Godavari Inter-Basin)',
    fieldIds: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
    canalIds: ['C1', 'C2', 'C3'],
    resourceIds: ['R1', 'R2'],
    pumpIds: ['P1', 'P2', 'P3'],
    weatherRegionKey: 'Krishna_Delta_Vijayawada',
    soilType: 'Mixed Deltaic (Alfisol, Inceptisol, Vertisol)',
    description: 'Comprehensive inter-basin network spanning Krishna Delta, Godavari Lowlands, and Guntur Uplands with multi-barrage water balancing.',
    coordinates: '16.5062° N, 80.6480° E',
    primaryCrops: ['Tomato', 'Paddy', 'Groundnut', 'Cotton', 'Maize', 'Chillies'],
    keyTelemetryHighlight: '12,500 L Live Barrage Storage | 3 Main Canals | 6 parcels under active QUBO management',
  },
  {
    id: 'zone-a-krishna',
    name: 'Zone A - Krishna Delta North',
    zone: 'Zone A',
    fieldIds: ['F1', 'F3'],
    canalIds: ['C1'],
    resourceIds: ['R1'],
    pumpIds: ['P1'],
    weatherRegionKey: 'Krishna_Delta_Vijayawada',
    soilType: 'Red Sandy Loam (Alfisol)',
    description: 'High solar radiation delta reach served by Prakasam Barrage. High-value crops (Tomato & Groundnut) on well-drained sandy loam.',
    coordinates: '16.4851° N, 80.6571° E (Vijayawada)',
    primaryCrops: ['Tomato', 'Groundnut'],
    keyTelemetryHighlight: 'High thermal radiation (ET0 5.6 mm/d) | Free Solar Pump #1 Active | Low rain probability (10%)',
  },
  {
    id: 'zone-b-godavari',
    name: 'Zone B - Godavari Lowlands',
    zone: 'Zone B',
    fieldIds: ['F2', 'F6'],
    canalIds: ['C2'],
    resourceIds: ['R2'],
    pumpIds: ['P2'],
    weatherRegionKey: 'Godavari_Delta_Rajahmundry',
    soilType: 'Clay Loam (Inceptisol)',
    description: 'Monsoon-active lowlands fed by Sir Arthur Cotton Barrage. Water-intensive Paddy and high-yield Chillies with convective precipitation radar.',
    coordinates: '16.9891° N, 81.7840° E (Rajahmundry)',
    primaryCrops: ['Paddy', 'Chillies'],
    keyTelemetryHighlight: 'Convective thunderstorm incoming (28mm rain, 65% prob) | Smart Delay active saving ~1,330L water',
  },
  {
    id: 'zone-c-guntur',
    name: 'Zone C - Guntur-Amaravati Uplands',
    zone: 'Zone C',
    fieldIds: ['F4', 'F5'],
    canalIds: ['C3'],
    resourceIds: ['R1'],
    pumpIds: ['P3'],
    weatherRegionKey: 'Guntur_Uplands',
    soilType: 'Black Cotton Soil (Vertisol)',
    description: 'Tail-end distributary command area on deep Vertisol soils with high moisture retention. Cotton and Maize cultivation requiring precise drought rationing.',
    coordinates: '16.3067° N, 80.4365° E (Guntur)',
    primaryCrops: ['Cotton', 'Maize'],
    keyTelemetryHighlight: 'High soil water capacity (AWC 200 mm/m) | Tail-end canal reach (C3 capacity 1,500 L/d)',
  },
];

function parseCsv(content: string): Array<Record<string, any>> {
  const lines = content.trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const results: Array<Record<string, any>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        const num = Number(val);
        row[h] = !isNaN(num) && val.trim() !== '' ? num : val;
      });
      results.push(row);
    }
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export function loadWeather7Day(): Record<string, any> {
  const p = path.join(process.cwd(), 'datasets', '1_weather_and_climate', 'andhra_pradesh_agro_weather_7day.json');
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function loadFAOCropCoefficients(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '2_crop_coefficients_fao56', 'fao56_crop_coefficients.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadSoilHydrologyProfiles(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '3_soil_hydrology', 'krishna_godavari_soil_profiles.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadCanalConveyance(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '4_water_resources_and_canals', 'canal_network_conveyance.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadBarrages(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '4_water_resources_and_canals', 'prakasam_arthur_cotton_barrages.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadPumpSpecs(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '5_pumps_and_energy_tariffs', 'agricultural_pumps_specifications.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadTimeOfDayTariffs(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '5_pumps_and_energy_tariffs', 'ap_time_of_day_electricity_tariffs.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function loadIoTTimeseries(): Array<Record<string, any>> {
  const p = path.join(process.cwd(), 'datasets', '6_iot_sensor_telemetry', 'field_soil_moisture_sensor_timeseries.csv');
  if (fs.existsSync(p)) {
    try {
      return parseCsv(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function getDatasetExplorerData() {
  const weather = loadWeather7Day();
  const faoCrops = loadFAOCropCoefficients();
  const soilProfiles = loadSoilHydrologyProfiles();
  const canals = loadCanalConveyance();
  const barrages = loadBarrages();
  const pumps = loadPumpSpecs();
  const tariffs = loadTimeOfDayTariffs();
  const iotSensors = loadIoTTimeseries();

  return {
    segments: DATASET_SEGMENTS,
    datasetCounts: {
      weatherStations: Object.keys(weather).length,
      faoCropProfiles: faoCrops.length,
      soilHydraulicProfiles: soilProfiles.length,
      canalSegments: canals.length,
      barrages: barrages.length,
      pumpSpecifications: pumps.length,
      timeOfDayTariffs: tariffs.length,
      iotSensorObservations: iotSensors.length,
    },
    tables: {
      faoCrops,
      soilProfiles,
      canals,
      barrages,
      pumps,
      tariffs,
      iotSensors: iotSensors.slice(0, 40),
    },
    weatherRegions: Object.keys(weather).map((key) => ({
      key,
      latitude: weather[key].latitude,
      longitude: weather[key].longitude,
      elevation: weather[key].elevation,
      hourlyCount: weather[key].hourly?.time?.length || 0,
      sampleHourly: {
        times: (weather[key].hourly?.time || []).slice(0, 24),
        temperatures: (weather[key].hourly?.temperature_2m || []).slice(0, 24),
        humidity: (weather[key].hourly?.relative_humidity_2m || []).slice(0, 24),
        precipitationProb: (weather[key].hourly?.precipitation_probability || []).slice(0, 24),
        et0: (weather[key].hourly?.et0_fao_evapotranspiration || []).slice(0, 24),
        solarIrradiance: (weather[key].hourly?.direct_normal_irradiance || []).slice(0, 24),
      },
    })),
  };
}

export function getWeatherTimeseriesForZone(zoneKey: string) {
  const weather = loadWeather7Day();
  const data = weather[zoneKey] || weather['Krishna_Delta_Vijayawada'];
  if (!data || !data.hourly) return [];

  const times: string[] = data.hourly.time || [];
  const temps: number[] = data.hourly.temperature_2m || [];
  const humidity: number[] = data.hourly.relative_humidity_2m || [];
  const rainProb: number[] = data.hourly.precipitation_probability || [];
  const et0: number[] = data.hourly.et0_fao_evapotranspiration || [];
  const solar: number[] = data.hourly.direct_normal_irradiance || [];

  return times.slice(0, 48).map((t, idx) => ({
    time: t.replace('2026-09-', 'Sep ').replace('T', ' '),
    temperatureC: temps[idx] ?? 32,
    humidityPercent: humidity[idx] ?? 60,
    rainProbabilityPercent: rainProb[idx] ?? 10,
    et0Mm: et0[idx] ?? 5.0,
    solarIrradianceWm2: solar[idx] ?? 450,
  }));
}

