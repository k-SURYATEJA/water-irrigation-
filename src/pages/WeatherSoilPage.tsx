import React from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  Gauge,
  Info,
  Sprout,
  Compass,
} from 'lucide-react';
import { Field, WeatherData, WaterDemandEstimation } from '../types.js';

interface WeatherSoilPageProps {
  fields: Field[];
  weatherMap: Record<string, WeatherData>;
  demands: WaterDemandEstimation[];
}

export const WeatherSoilPage: React.FC<WeatherSoilPageProps> = ({
  fields,
  weatherMap,
  demands,
}) => {
  const demandMap = new Map<string, WaterDemandEstimation>(demands.map((d) => [d.fieldId, d]));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-amber-500" />
          Agro-Meteorological Telemetry &amp; Soil Hydrology
        </h2>
        <p className="text-xs text-slate-500">
          Field-level microclimate sensor feeds, FAO-56 Penman-Monteith reference evapotranspiration, and Doppler rainfall probabilities.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Command Temperature</div>
          <div className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-rose-500" />
            32.5°C
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Basin Average High</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Relative Humidity</div>
          <div className="text-xl font-bold text-blue-600 mt-1 flex items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            62%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Atmospheric Vapor Content</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Mean Reference ET0</div>
          <div className="text-xl font-bold text-amber-600 mt-1 flex items-center gap-1">
            <Gauge className="w-4 h-4 text-amber-500" />
            5.1 mm/day
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Evaporative Solar Demand</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Doppler Precipitation Radar</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <CloudRain className="w-4 h-4 text-emerald-500" />
            Zone B Active
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Thunderstorms Incoming</div>
        </div>
      </div>

      {/* Field Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => {
          const weather = weatherMap[field.id] || {
            fieldId: field.id,
            temperatureC: 32,
            humidityPercent: 60,
            currentRainfallMm: 0,
            expectedRainfallMm: 0,
            rainProbabilityPercent: 15,
            et0Mm: 5.0,
            windSpeedKmh: 12,
            forecastSummary: 'Standard weather conditions',
          };

          const demand = demandMap.get(field.id);
          const isCritical = field.currentSoilMoisture < 40;
          const hasRain = weather.rainProbabilityPercent >= 50;

          return (
            <div
              key={field.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-800 text-sm">
                    {field.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{field.name}</h4>
                    <p className="text-[11px] text-slate-500">{field.crop} • {field.location}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isCritical
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : hasRain
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isCritical ? 'Deficit' : hasRain ? 'Rainfall' : 'Normal'}
                </span>
              </div>

              {/* Weather Indicators Bar */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Temp</div>
                  <div className="font-bold text-slate-800 text-sm font-mono mt-0.5">
                    {weather.temperatureC}°C
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Humidity</div>
                  <div className="font-bold text-blue-700 text-sm font-mono mt-0.5">
                    {weather.humidityPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ET0 Rate</div>
                  <div className="font-bold text-amber-700 text-sm font-mono mt-0.5">
                    {weather.et0Mm} mm
                  </div>
                </div>
              </div>

              {/* Rain Forecast Box */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  hasRain
                    ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CloudRain className={`w-4 h-4 ${hasRain ? 'text-blue-600 animate-bounce' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold">Rainfall: {weather.expectedRainfallMm} mm</div>
                    <div className="text-[10px] text-slate-500">Probability: {weather.rainProbabilityPercent}%</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold">
                  {weather.forecastSummary}
                </span>
              </div>

              {/* Soil Moisture Hydrology Box */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Root-Zone Soil Moisture</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : field.currentSoilMoisture < 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {field.currentSoilMoisture}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      field.currentSoilMoisture < 40
                        ? 'bg-rose-500'
                        : field.currentSoilMoisture < 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${field.currentSoilMoisture}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Soil Classification: <strong>{field.soilType}</strong></span>
                  <span>Water Deficit: <strong>{demand?.waterDeficitPercent || 0}%</strong></span>
                </div>
              </div>

              {/* Demand Estimation & Explainability Tag */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Calculated Water Need:</span>
                <span className="font-bold text-slate-800 font-mono">
                  ~{demand?.estimatedNeedLiters.toLocaleString() || 500} L
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
