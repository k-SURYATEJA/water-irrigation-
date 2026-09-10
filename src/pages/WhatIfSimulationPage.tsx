import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  CloudRain,
  Sun,
  Waves,
  RefreshCw,
  Database,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Droplets,
  Zap,
} from 'lucide-react';
import { runSimulation } from '../services/api.js';
import { useDataset } from '../context/DatasetContext.js';

interface WhatIfSimulationPageProps {
  onApplySimulationResult: (result: any) => void;
}

export const WhatIfSimulationPage: React.FC<WhatIfSimulationPageProps> = ({
  onApplySimulationResult,
}) => {
  const { currentSegmentId, setSegment, segments } = useDataset();
  const [scenarioName, setScenarioName] = useState<string>('Normal');
  const [waterOverride, setWaterOverride] = useState<number>(12500);
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [canalMultiplier, setCanalMultiplier] = useState<number>(1.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const presets = [
    {
      name: 'Normal',
      label: 'Normal Baseline',
      desc: 'Standard seasonal monsoon & nominal barrage storage',
      water: 12500,
      rain: 1.0,
      demand: 1.0,
      canal: 1.0,
    },
    {
      name: 'Drought',
      label: 'Drought Stress (-50%)',
      desc: 'Severe heatwave, high evaporative demand, storage deficit',
      water: 6000,
      rain: 0.1,
      demand: 1.3,
      canal: 0.8,
    },
    {
      name: 'Heavy Rainfall',
      label: 'Heavy Rainfall',
      desc: 'Monsoon burst, pause irrigation to prevent flood & save dam water',
      water: 12500,
      rain: 3.0,
      demand: 0.6,
      canal: 1.0,
    },
    {
      name: 'Low Reservoir',
      label: 'Low Barrage Storage',
      desc: 'Critical upstream storage drawdown, strict rationing',
      water: 4000,
      rain: 0.5,
      demand: 1.0,
      canal: 0.6,
    },
    {
      name: 'High Crop Demand',
      label: 'Summer Peak (+50%)',
      desc: 'Flowering / grain filling stage under elevated solar radiation',
      water: 12500,
      rain: 0.8,
      demand: 1.5,
      canal: 1.0,
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setScenarioName(p.name);
    setWaterOverride(p.water);
    setRainMultiplier(p.rain);
    setDemandMultiplier(p.demand);
    setCanalMultiplier(p.canal);
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({
        scenarioName,
        availableWater: waterOverride,
        rainfallMultiplier: rainMultiplier,
        cropDemandMultiplier: demandMultiplier,
        canalCapacityMultiplier: canalMultiplier,
        segment: currentSegmentId !== 'all' ? currentSegmentId : undefined,
      });
      setSimResult(res);
      onApplySimulationResult(res.after);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activePreset = presets.find((p) => p.name === scenarioName);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-600" />
            Interactive What-If Scenario Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Simulate drought, sudden rainfall, and reservoir drawdown to evaluate real-time QUBO adaptive re-allocation.
          </p>
        </div>

        {/* Dataset Segment Selector for Simulation */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-600">Simulating:</span>
          <select
            value={currentSegmentId}
            onChange={(e) => setSegment(e.target.value as any)}
            className="bg-white font-bold text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
          >
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name} ({seg.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Climate & Water Scenarios
          </span>
          {activePreset && (
            <span className="text-xs text-slate-500 italic">
              {activePreset.desc}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const isActive = scenarioName === p.name;
            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 shadow-sm border border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Fine-Tune Scenario Parameters</h3>
          <span className="text-xs text-slate-400 font-mono">Live QUBO Input</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Slider 1: Available Water */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                Available Barrage Water Storage
              </span>
              <span className="font-mono font-bold text-cyan-700">{waterOverride.toLocaleString()} L</span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={waterOverride}
              onChange={(e) => {
                setWaterOverride(parseInt(e.target.value));
                setScenarioName('Custom');
              }}
              className="w-full accent-cyan-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2,000 L (Severe Drought)</span>
              <span>12,500 L (Normal)</span>
              <span>20,000 L (Surplus)</span>
            </div>
          </div>

          {/* Slider 2: Rainfall Multiplier */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                Rainfall Precipitation Multiplier
              </span>
              <span className="font-mono font-bold text-blue-700">{rainMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="4.0"
              step="0.2"
              value={rainMultiplier}
              onChange={(e) => {
                setRainMultiplier(parseFloat(e.target.value));
                setScenarioName('Custom');
              }}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0x (Zero Rain)</span>
              <span>1.0x (Standard)</span>
              <span>4.0x (Downpour)</span>
            </div>
          </div>

          {/* Slider 3: Crop Demand Multiplier */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Crop Water Demand Multiplier
              </span>
              <span className="font-mono font-bold text-amber-700">{demandMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={demandMultiplier}
              onChange={(e) => {
                setDemandMultiplier(parseFloat(e.target.value));
                setScenarioName('Custom');
              }}
              className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x (Cool Weather)</span>
              <span>1.0x (Nominal)</span>
              <span>2.5x (Severe Heatwave)</span>
            </div>
          </div>

          {/* Slider 4: Canal Capacity Multiplier */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-purple-600" />
                Canal Conveyance Flow Factor
              </span>
              <span className="font-mono font-bold text-purple-700">{canalMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={canalMultiplier}
              onChange={(e) => {
                setCanalMultiplier(parseFloat(e.target.value));
                setScenarioName('Custom');
              }}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.3x (Choked / Breach)</span>
              <span>1.0x (Nominal)</span>
              <span>1.5x (Desilted Fast Flow)</span>
            </div>
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            id="btn-run-simulation"
            disabled={loading}
            onClick={handleRunSimulation}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Solving Simulated QUBO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Scenario Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {simResult && (
        <div className="space-y-4">
          {/* Delta Impact Cards */}
          {(() => {
            const before = simResult.before.metrics;
            const after = simResult.after.metrics;
            const deltaWater = after.waterAllocated - before.waterAllocated;
            const deltaCost = after.estimatedOperatingCost - before.estimatedOperatingCost;
            const deltaFields = after.fieldsRecommendedForIrrigation - before.fieldsRecommendedForIrrigation;
            const deltaShortage = after.waterShortage - before.waterShortage;

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">? Water Allocated</div>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-1 flex items-center gap-1">
                    {deltaWater >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                    )}
                    {deltaWater >= 0 ? `+${deltaWater.toLocaleString()}` : deltaWater.toLocaleString()} L
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Before: {before.waterAllocated.toLocaleString()} ? After: {after.waterAllocated.toLocaleString()} L
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">? Operating Cost</div>
                  <div className="text-xl font-bold font-mono text-purple-700 mt-1 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-purple-500" />
                    {deltaCost >= 0 ? `+?${deltaCost}` : `-?${Math.abs(deltaCost)}`}
                  </div>
                  <div className="text-[10px] text-purple-600 mt-0.5">
                    {after.costSavingsPercent}% saved with solar
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">? Fields Irrigated</div>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                    {after.fieldsRecommendedForIrrigation} / {after.totalFields} fields
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {deltaFields >= 0 ? `+${deltaFields}` : deltaFields} change vs baseline
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Shortage Status</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${after.waterShortage > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {after.waterShortage.toLocaleString()} L
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {after.waterShortage === 0 ? 'Zero critical deficit' : `${deltaShortage >= 0 ? '+' : ''}${deltaShortage} L shortage`}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-xs uppercase text-slate-500">Baseline / Previous State</span>
                <span className="text-xs font-mono text-slate-400">Fixed Timers</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Allocated:</span>
                  <strong className="text-slate-800 font-mono">{simResult.before.metrics.waterAllocated.toLocaleString()} L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Shortage:</span>
                  <strong className="text-slate-800 font-mono">{simResult.before.metrics.waterShortage.toLocaleString()} L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pumping Cost:</span>
                  <strong className="text-slate-800 font-mono">?{simResult.before.metrics.estimatedOperatingCost}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fields Irrigated:</span>
                  <strong className="text-slate-800 font-mono">{simResult.before.metrics.fieldsRecommendedForIrrigation}</strong>
                </div>
              </div>
            </div>

            {/* After Box */}
            <div className="p-4 rounded-xl border border-cyan-300 bg-cyan-50/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-cyan-200">
                <span className="font-bold text-xs uppercase text-cyan-800">QUBO Optimized Scenario State</span>
                <span className="text-xs font-mono bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">
                  {simResult.scenarioName}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Allocated:</span>
                  <strong className="text-cyan-900 font-mono font-bold">{simResult.after.metrics.waterAllocated.toLocaleString()} L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Shortage:</span>
                  <strong className={`font-mono font-bold ${simResult.after.metrics.waterShortage > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {simResult.after.metrics.waterShortage.toLocaleString()} L
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pumping Cost:</span>
                  <strong className="text-purple-800 font-mono font-bold">
                    ?{simResult.after.metrics.estimatedOperatingCost} (-{simResult.after.metrics.costSavingsPercent}%)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fields Irrigated / Delayed:</span>
                  <strong className="text-slate-800 font-mono">
                    {simResult.after.metrics.fieldsRecommendedForIrrigation} / {simResult.after.metrics.fieldsRecommendedForDelay}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Dispatch Schedule Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wide text-slate-700">
                Simulated Irrigation Schedule ({simResult.after.schedule.length} parcels)
              </span>
              <span className="text-slate-400 font-mono">QUBO Solved in {simResult.after.metrics.executionTimeMs} ms</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Crop</th>
                    <th className="px-3 py-2">Slot</th>
                    <th className="px-3 py-2">Allocated</th>
                    <th className="px-3 py-2">Decision</th>
                    <th className="px-3 py-2">Simulation Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simResult.after.schedule.map((item: any) => {
                    const isIrrigate = item.decision === 'Irrigate';
                    return (
                      <tr key={item.id} className={isIrrigate ? 'hover:bg-slate-50' : 'bg-slate-50/30 text-slate-400'}>
                        <td className="px-3 py-2 font-bold font-mono text-slate-800">{item.fieldId}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-700">{item.crop}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{item.timeSlot}</td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          {isIrrigate ? `${item.waterLiters.toLocaleString()} L` : '0 L'}
                        </td>
                        <td className="px-3 py-2">
                          {isIrrigate ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Irrigate
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                              Delay
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600 max-w-sm">{item.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
