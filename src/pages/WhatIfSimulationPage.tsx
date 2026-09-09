import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CloudRain,
  Sun,
  Waves,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { runSimulation } from '../services/api.js';

interface WhatIfSimulationPageProps {
  onApplySimulationResult: (result: any) => void;
}

export const WhatIfSimulationPage: React.FC<WhatIfSimulationPageProps> = ({
  onApplySimulationResult,
}) => {
  const [scenarioName, setScenarioName] = useState<string>('Normal');
  const [waterOverride, setWaterOverride] = useState<number>(12500);
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [canalMultiplier, setCanalMultiplier] = useState<number>(1.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const applyPreset = (name: string) => {
    setScenarioName(name);
    if (name === 'Normal') {
      setWaterOverride(12500);
      setRainMultiplier(1.0);
      setDemandMultiplier(1.0);
      setCanalMultiplier(1.0);
    } else if (name === 'Drought') {
      setWaterOverride(6000); // 50% cut
      setRainMultiplier(0.1);
      setDemandMultiplier(1.3);
      setCanalMultiplier(0.8);
    } else if (name === 'Heavy Rainfall') {
      setWaterOverride(12500);
      setRainMultiplier(3.0);
      setDemandMultiplier(0.6);
      setCanalMultiplier(1.0);
    } else if (name === 'Low Reservoir') {
      setWaterOverride(4000); // severe reservoir drawdown
      setRainMultiplier(0.5);
      setDemandMultiplier(1.0);
      setCanalMultiplier(0.6);
    } else if (name === 'High Crop Demand') {
      setWaterOverride(12500);
      setRainMultiplier(0.8);
      setDemandMultiplier(1.5); // 50% more demand
      setCanalMultiplier(1.0);
    }
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
      });
      setSimResult(res);
      onApplySimulationResult(res.after);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-600" />
          Interactive What-If Scenario Simulator
        </h2>
        <p className="text-xs text-slate-500">
          Simulate climate extremes, reservoir drawdowns, and unexpected precipitation bursts to observe QUBO dynamic re-allocation.
        </p>
      </div>

      {/* Presets Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Standard Command Scenarios &amp; Climate Stress Tests
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            id="preset-normal"
            onClick={() => applyPreset('Normal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              scenarioName === 'Normal'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal Baseline</span>
          </button>

          <button
            id="preset-drought"
            onClick={() => applyPreset('Drought')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              scenarioName === 'Drought'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Drought Stress (-50% Water)</span>
          </button>

          <button
            id="preset-heavy-rain"
            onClick={() => applyPreset('Heavy Rainfall')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              scenarioName === 'Heavy Rainfall'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Heavy Rainfall (Conserve Storage)</span>
          </button>

          <button
            id="preset-low-res"
            onClick={() => applyPreset('Low Reservoir')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              scenarioName === 'Low Reservoir'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Barrage Storage</span>
          </button>

          <button
            id="preset-high-demand"
            onClick={() => applyPreset('High Crop Demand')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              scenarioName === 'High Crop Demand'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Summer Peak Crop Demand (+50%)</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 text-base">Fine-Tune Scenario Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Available Water */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Available Irrigation Water Storage</span>
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
                setScenarioName('Custom Scenario');
              }}
              className="w-full accent-cyan-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>2,000 L (Severe Drought)</span>
              <span>12,500 L (Normal)</span>
              <span>20,000 L (Surplus)</span>
            </div>
          </div>

          {/* Slider 2: Rainfall Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Rainfall Precipitation Multiplier</span>
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
                setScenarioName('Custom Scenario');
              }}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0x (Zero Rain)</span>
              <span>1.0x (Normal)</span>
              <span>4.0x (Monsoon Downpour)</span>
            </div>
          </div>

          {/* Slider 3: Crop Demand Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Crop Water Demand Multiplier</span>
              <span className="font-mono font-bold text-emerald-700">{demandMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={demandMultiplier}
              onChange={(e) => {
                setDemandMultiplier(parseFloat(e.target.value));
                setScenarioName('Custom Scenario');
              }}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0.5x (Mild Climate)</span>
              <span>1.0x (Standard)</span>
              <span>2.5x (Heatwave)</span>
            </div>
          </div>

          {/* Slider 4: Canal Capacity Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Canal Conveyance Flow Factor</span>
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
                setScenarioName('Custom Scenario');
              }}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0.3x (Silt Choke/Breach)</span>
              <span>1.0x (Nominal)</span>
              <span>1.5x (Desilted High Flow)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="btn-run-simulation"
            disabled={loading}
            onClick={handleRunSimulation}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating QUBO Response...</span>
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

      {/* Before vs After Simulation Results (Mandatory Requirement) */}
      {simResult && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                Scenario: {simResult.scenarioName}
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-1">
                Before vs After Optimization Impact Analysis
              </h3>
            </div>
            <span className="text-xs text-slate-400">Simulation Complete</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Box */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-xs uppercase text-slate-500">Baseline / Previous State</span>
                <span className="text-xs font-mono text-slate-400">Fixed Rotation</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Allocated:</span>
                  <strong className="text-slate-800 font-mono">
                    {simResult.before.metrics.waterAllocated.toLocaleString()} L
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Shortage:</span>
                  <strong className="text-slate-800 font-mono">
                    {simResult.before.metrics.waterShortage.toLocaleString()} L
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pumping Energy Cost:</span>
                  <strong className="text-slate-800 font-mono">
                    ₹{simResult.before.metrics.estimatedOperatingCost}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fields Irrigated:</span>
                  <strong className="text-slate-800 font-mono">
                    {simResult.before.metrics.fieldsRecommendedForIrrigation}
                  </strong>
                </div>
              </div>
            </div>

            {/* After Box */}
            <div className="p-5 rounded-xl border border-cyan-300 bg-cyan-50/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-cyan-200">
                <span className="font-bold text-xs uppercase text-cyan-800">Quantum-Inspired Optimization State</span>
                <span className="text-xs font-mono bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">
                  Simulated
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Water Allocated:</span>
                  <div className="flex items-center space-x-2">
                    <strong className="text-cyan-900 font-mono font-bold">
                      {simResult.after.metrics.waterAllocated.toLocaleString()} L
                    </strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {simResult.delta.waterDeltaLiters >= 0
                        ? `+${simResult.delta.waterDeltaLiters} L`
                        : `${simResult.delta.waterDeltaLiters} L`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Water Shortage:</span>
                  <strong className={`font-mono font-bold ${simResult.after.metrics.waterShortage > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {simResult.after.metrics.waterShortage.toLocaleString()} L
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Pumping Cost Savings:</span>
                  <strong className="text-purple-800 font-mono font-bold">
                    ₹{simResult.after.metrics.estimatedOperatingCost} (-{simResult.after.metrics.costSavingsPercent}%)
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Fields Irrigated / Delayed:</span>
                  <strong className="text-slate-800 font-mono">
                    {simResult.after.metrics.fieldsRecommendedForIrrigation} Irrigated / {simResult.after.metrics.fieldsRecommendedForDelay} Delayed
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
