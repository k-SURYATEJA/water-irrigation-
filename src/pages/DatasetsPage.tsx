import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  CloudRain,
  Wheat,
  Mountain,
  Waves,
  Zap,
  Radio,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext.js';
import { fetchDatasetTelemetry, fetchWeatherTimeseries } from '../services/api.js';
import { HourlyWeatherPoint } from '../types.js';

interface DatasetTab {
  id: 'segments' | 'weather' | 'crops' | 'soils' | 'infrastructure' | 'tariffs' | 'telemetry';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

export const DatasetsPage: React.FC = () => {
  const { currentSegment, currentSegmentId, setSegment, segments, explorerData, loading: datasetLoading } = useDataset();
  const [activeTab, setActiveTab] = useState<'segments' | 'weather' | 'crops' | 'soils' | 'infrastructure' | 'tariffs' | 'telemetry'>('segments');
  const [telemetryRows, setTelemetryRows] = useState<any[]>([]);
  const [weatherPoints, setWeatherPoints] = useState<HourlyWeatherPoint[]>([]);
  const [weatherZone, setWeatherZone] = useState<string>('Krishna_Delta_Vijayawada');
  const [telemetryLoading, setTelemetryLoading] = useState<boolean>(false);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'telemetry') {
      setTelemetryLoading(true);
      fetchDatasetTelemetry(currentSegmentId !== 'all' ? currentSegmentId : undefined)
        .then((data) => setTelemetryRows(data || []))
        .catch((err) => console.error('Failed to load telemetry:', err))
        .finally(() => setTelemetryLoading(false));
    }
  }, [activeTab, currentSegmentId]);

  useEffect(() => {
    if (activeTab === 'weather') {
      setWeatherLoading(true);
      fetchWeatherTimeseries(weatherZone)
        .then((data) => setWeatherPoints(data || []))
        .catch((err) => console.error('Failed to load weather timeseries:', err))
        .finally(() => setWeatherLoading(false));
    }
  }, [activeTab, weatherZone]);

  const tabs: DatasetTab[] = [
    { id: 'segments', label: 'Agro-Climatic Segments', icon: Layers, count: segments.length },
    { id: 'weather', label: '1. Open-Meteo Climate', icon: CloudRain, badge: '7-Day Hourly' },
    { id: 'crops', label: '2. FAO-56 Crop Models', icon: Wheat, count: explorerData?.tables?.faoCrops?.length ?? 5 },
    { id: 'soils', label: '3. ISRIC Soil Hydrology', icon: Mountain, count: explorerData?.tables?.soilProfiles?.length ?? 4 },
    { id: 'infrastructure', label: '4. WRIS Water Infrastructure', icon: Waves, badge: 'Canals & Barrages' },
    { id: 'tariffs', label: '5. APERC Pumps & Tariffs', icon: Zap, badge: 'ToD Tariffs' },
    { id: 'telemetry', label: '6. IoT Sensor Telemetry', icon: Radio, badge: '0-100cm In-Situ' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-300">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Dataset Segmentation &amp; Telemetry Hub
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    Verified AP Datasets
                  </span>
                </h1>
                <p className="text-sm text-blue-200/80">
                  Real-world Andhra Pradesh Krishna-Godavari agro-climatic datasets driving quantum water optimization, FAO-56 soil depletion, and APERC tariff models.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700/60 backdrop-blur-md">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-2">Active Segment:</span>
            {segments.map((seg) => {
              const active = currentSegmentId === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setSegment(seg.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                  {seg.name.replace('Zone ', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Segment Key Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">District &amp; Basin</span>
            <span className="text-xs font-semibold text-white truncate block">{currentSegment.district || currentSegment.zone}</span>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">Coordinates</span>
            <span className="text-xs font-semibold text-cyan-300 block font-mono">{currentSegment.coordinates}</span>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">Dominant Soil</span>
            <span className="text-xs font-semibold text-amber-300 block">{currentSegment.soilProfile || currentSegment.soilType}</span>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">Key Crops</span>
            <span className="text-xs font-semibold text-emerald-300 block">{(currentSegment.crops || currentSegment.primaryCrops || []).join(', ')}</span>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">Water Sources</span>
            <span className="text-xs font-semibold text-blue-300 block truncate">{currentSegment.waterSource || 'Canal Network'}</span>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">Fields &amp; Assets</span>
            <span className="text-xs font-semibold text-purple-300 block">
              {currentSegment.fieldIds.length} Fields · {currentSegment.canalIds.length} Canals · {currentSegment.pumpIds.length} Pumps
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. AGRO-CLIMATIC SEGMENTS */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Dataset Segmentation Architecture
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              The command basin is segmented into 3 distinct agro-climatic sub-regions plus the unified river command basin.
              Selecting a segment filters all live telemetry, soil hydration physics, canal hydraulics, and quantum QUBO optimization matrices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {segments.map((seg) => {
                const isSelected = currentSegmentId === seg.id;
                return (
                  <div
                    key={seg.id}
                    onClick={() => setSegment(seg.id)}
                    className={`cursor-pointer rounded-xl p-5 transition-all border relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-blue-950/70 to-slate-900 border-cyan-500 shadow-xl ring-2 ring-cyan-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">{seg.district || seg.zone}</span>
                      <h3 className="text-base font-bold text-white mt-1">{seg.name}</h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{seg.description}</p>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Coordinates:</span>
                          <span className="text-slate-200 font-mono">{seg.coordinates}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Soil Classification:</span>
                          <span className="text-amber-300 font-medium">{seg.soilProfile || seg.soilType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Primary Crops:</span>
                          <span className="text-emerald-300 font-medium">{(seg.crops || seg.primaryCrops || []).join(', ')}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Water Network:</span>
                          <span className="text-blue-300 font-medium truncate max-w-[140px] block">{seg.waterSource || 'Canals'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {seg.fieldIds.length} fields · {seg.canalIds.length} canal
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSegment(seg.id);
                        }}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                          isSelected
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Switch to Zone'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. OPEN-METEO CLIMATE */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-400" />
                  Open-Meteo 7-Day Hourly Climate Dataset
                </h2>
                <p className="text-sm text-slate-400">
                  Hourly records of temperature (°C), relative humidity (%), precipitation probability (%), solar irradiance (W/m²), and evapotranspiration (mm/h).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Climate Zone:</span>
                <select
                  value={weatherZone}
                  onChange={(e) => setWeatherZone(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="Krishna_Delta_Vijayawada">Zone A - Krishna Delta (16.51°N, 80.64°E)</option>
                  <option value="Godavari_Delta_Rajahmundry">Zone B - Godavari Lowlands (16.98°N, 81.78°E)</option>
                  <option value="Guntur_Uplands">Zone C - Guntur Uplands (16.30°N, 80.44°E)</option>
                </select>
              </div>
            </div>

            {weatherLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
                Loading hourly climate observations...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Temp (°C)</th>
                      <th className="py-3 px-4">Humidity (%)</th>
                      <th className="py-3 px-4">Rain Prob (%)</th>
                      <th className="py-3 px-4">Solar Rad (W/m²)</th>
                      <th className="py-3 px-4">ET0 (mm/h)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {weatherPoints.slice(0, 36).map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-4 font-mono text-slate-200">{pt.time}</td>
                        <td className="py-2.5 px-4 font-semibold text-amber-300">{pt.temperatureC}°C</td>
                        <td className="py-2.5 px-4 text-cyan-300">{pt.humidityPercent}%</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            pt.rainProbabilityPercent > 40
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {pt.rainProbabilityPercent}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-yellow-200">{pt.solarIrradianceWm2} W/m²</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-300">{pt.et0Mm} mm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-3">
              Showing 36-hour window. Source: Open-Meteo High-Resolution Weather API for Andhra Pradesh agro-climatic stations.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. FAO-56 CROP COEFFICIENTS */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-400" />
              FAO-56 Crop Evapotranspiration &amp; Moisture Depletion Dataset
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              FAO Irrigation and Drainage Paper No. 56 coefficients used to calibrate crop water requirement (ETc = Kc × ET0) and allowable depletion fraction (p).
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Crop</th>
                    <th className="py-3 px-4">Kc (Initial)</th>
                    <th className="py-3 px-4">Kc (Mid-Season)</th>
                    <th className="py-3 px-4">Kc (End-Season)</th>
                    <th className="py-3 px-4">Max Root Depth</th>
                    <th className="py-3 px-4">Depletion Fraction (p)</th>
                    <th className="py-3 px-4">Yield Response (Ky)</th>
                    <th className="py-3 px-4">Critical Moisture Phase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(explorerData?.tables?.faoCrops || []).map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-emerald-300 text-sm">{c.common_name || c.crop}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{c.kc_initial || c.kc_ini}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold">{c.kc_mid_stage || c.kc_mid}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{c.kc_end_stage || c.kc_end}</td>
                      <td className="py-3 px-4 text-slate-200">{c.root_depth_max_m} m</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold font-mono">
                          {c.allowable_depletion_fraction_p || c.depletion_fraction_p}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300">{c.yield_response_factor_ky}</td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{c.critical_growth_stage || c.critical_stages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Quantum Integration Note
              </div>
              <p>
                When root zone soil water depletion exceeds readily available water (RAW = p × TAW), the crop enters moisture stress.
                The simulated annealer incorporates this via the non-linear penalty factor Wi = max(0.8, min(1.8, Dr / RAW)), weighting moisture-stressed fields higher in the objective Hamiltonian.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. ISRIC SOIL HYDROLOGY */}
      {activeTab === 'soils' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Mountain className="w-5 h-5 text-amber-400" />
              ISRIC SoilGrids 250m Soil Hydraulic Properties
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Empirical soil hydraulic parameters for Andhra Pradesh command areas: Field Capacity (θ_FC), Permanent Wilting Point (θ_PWP), and Available Water Capacity (AWC).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(explorerData?.tables?.soilProfiles || []).map((s: any, idx: number) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{s.predominant_regions}</span>
                      <h3 className="text-base font-bold text-white">{s.soil_type}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {s.infiltration_rate_mm_hr} mm/hr
                    </span>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Texture Fractions:</span>
                      <span className="text-slate-200">Clay {s.clay_content_pct}%, Sand {s.sand_content_pct}%, Silt {s.silt_content_pct}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Field Capacity (FC):</span>
                      <span className="text-emerald-400 font-mono font-semibold">{s.field_capacity_vol_pct}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Permanent Wilting Point (PWP):</span>
                      <span className="text-red-400 font-mono font-semibold">{s.wilting_point_vol_pct}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Available Water Capacity (AWC):</span>
                      <span className="text-cyan-400 font-mono font-bold">{s.available_water_capacity_mm_per_m} mm/m</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Bulk Density:</span>
                      <span className="text-slate-200 font-mono">{s.bulk_density_g_cm3} g/cm³</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. WRIS WATER INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Barrages & Reservoirs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-400" />
                India-WRIS Barrages &amp; Reservoirs
              </h2>
              <div className="space-y-3">
                {(explorerData?.tables?.barrages || []).map((r: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-blue-400">{r.river_basin}</span>
                        <h4 className="text-sm font-bold text-white">{r.facility_name}</h4>
                        <span className="text-xs text-slate-400">ID: {r.facility_id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                        {r.status || 'Adequate'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/40 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Gross Storage</span>
                        <span className="font-mono text-slate-200">{r.gross_storage_capacity_tmc} TMC</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Current Storage</span>
                        <span className="font-mono text-cyan-400 font-semibold">{r.current_storage_liters_scaled} L</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Live Capacity</span>
                        <span className="font-mono text-emerald-400 font-bold">{r.live_capacity_liters_scaled} L</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canals */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-400" />
                Canal Network &amp; Conveyance Efficiencies
              </h2>
              <div className="space-y-3">
                {(explorerData?.tables?.canals || []).map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-cyan-400">ID: {c.canal_id}</span>
                        <h4 className="text-sm font-bold text-white">{c.canal_name}</h4>
                        <span className="text-xs text-slate-400">Connected: {c.connected_parcels}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                        {c.conveyance_efficiency_pct}% Efficiency
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/40 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Discharge</span>
                        <span className="font-mono text-slate-200">{c.design_discharge_cusecs} cusecs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Flow Rate</span>
                        <span className="font-mono text-cyan-400">{c.current_flow_liters_per_day} L/d</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reach Type</span>
                        <span className="font-mono text-amber-300 text-[11px]">{c.reach_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. APERC PUMPS & TARIFFS */}
      {activeTab === 'tariffs' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              APERC Agricultural Energy Tariffs &amp; Pump Fleet Specifications
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Andhra Pradesh Electricity Regulatory Commission (APERC) Time-of-Day (ToD) tariff schedules and agricultural pump ratings.
            </p>

            {/* Tariffs table */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">APERC Time-of-Day (ToD) Tariff Slots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(explorerData?.tables?.tariffs || []).map((t: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
                    <span className="text-[10px] font-mono text-cyan-400">{t.slot_id} · {t.time_window}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{t.tariff_category}</h4>
                    <div className="mt-2 pt-2 border-t border-slate-700/40 text-xs flex justify-between">
                      <span className="text-slate-400">Tariff:</span>
                      <span className="font-mono font-bold text-emerald-400">₹{t.grid_tariff_inr_per_kwh}/kWh</span>
                    </div>
                    <div className="text-[11px] flex justify-between text-slate-400 mt-1">
                      <span>Solar Avail:</span>
                      <span className="text-amber-300 font-mono">{t.solar_availability_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pumps table */}
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Command Fleet Pump Specifications</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Pump ID</th>
                    <th className="py-3 px-4">Station Model</th>
                    <th className="py-3 px-4">Rating (HP)</th>
                    <th className="py-3 px-4">Discharge (L/h)</th>
                    <th className="py-3 px-4">Energy Source</th>
                    <th className="py-3 px-4">Operating Cost</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(explorerData?.tables?.pumps || []).map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{p.pump_id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{p.pump_model}</td>
                      <td className="py-3 px-4 font-mono text-slate-200">{p.power_rating_hp} HP</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">{p.capacity_liters_per_hour} L/h</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {p.energy_source}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-300">₹{p.operating_cost_inr_per_hour}/hr</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. IOT SENSOR TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  Capacitive Moisture FMCW Probe Telemetry Records
                </h2>
                <p className="text-sm text-slate-400">
                  Live in-situ IoT telemetry log streams reporting multi-depth volumetric soil water content, battery level, and signal quality.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filtered for:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700">
                  {currentSegment.name}
                </span>
              </div>
            </div>

            {telemetryLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
                Fetching sensor telemetry stream...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp (IST)</th>
                      <th className="py-3 px-4">Field</th>
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4">Sensor / Probe</th>
                      <th className="py-3 px-4">Soil Moisture (VWC %)</th>
                      <th className="py-3 px-4">Soil Temp (°C)</th>
                      <th className="py-3 px-4">Ambient Humidity</th>
                      <th className="py-3 px-4">Battery</th>
                      <th className="py-3 px-4">Valve Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {telemetryRows.slice(0, 30).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-4 font-mono text-slate-300">{row.timestamp_ist || row.timestamp}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-cyan-300">{row.field_id}</td>
                        <td className="py-2.5 px-4 font-semibold text-white">{row.crop || 'Crop'}</td>
                        <td className="py-2.5 px-4 text-slate-300 text-[11px]">{row.sensor_type || 'Capacitive FMCW'}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{row.soil_moisture_pct ?? row.moisture_percent}%</td>
                        <td className="py-2.5 px-4 font-mono text-amber-300">{row.soil_temperature_c ?? row.temperature_c}°C</td>
                        <td className="py-2.5 px-4 font-mono text-slate-300">{row.ambient_humidity_pct ? `${row.ambient_humidity_pct}%` : (row.electrical_conductivity_ds_m ? `${row.electrical_conductivity_ds_m} dS/m` : '-')}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-200">{row.battery_level_pct ?? row.battery_level_percent}%</td>
                        <td className="py-2.5 px-4 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (row.irrigation_solenoid_valve_status || '').toUpperCase() === 'OPEN'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {row.irrigation_solenoid_valve_status || (row.signal_strength_dbm ? `${row.signal_strength_dbm} dBm` : 'STANDBY')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-3">
              Telemetry continuously synchronizes with the Quantum Water Scheduler to determine real-time soil water depletion (Dr).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

