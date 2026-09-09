import React from 'react';
import {
  Waves,
  ArrowDownToLine,
  TrendingUp,
  AlertCircle,
  Zap,
  Sun,
  Fuel,
  Info,
} from 'lucide-react';
import { WaterResource, Canal, Pump } from '../types.js';

interface WaterResourcesPageProps {
  resources: WaterResource[];
  canals: Canal[];
  pumps: Pump[];
}

export const WaterResourcesPage: React.FC<WaterResourcesPageProps> = ({
  resources,
  canals,
  pumps,
}) => {
  const totalCapacity = resources.reduce((sum, r) => sum + r.capacityLiters, 0);
  const totalCurrent = resources.reduce((sum, r) => sum + r.currentStorageLiters, 0);
  const totalAvailable = resources.reduce((sum, r) => sum + r.availableIrrigationLiters, 0);
  const totalInflow = resources.reduce((sum, r) => sum + r.expectedInflowLiters, 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-600" />
          Water Resources &amp; Hydraulic Conveyance Infrastructure
        </h2>
        <p className="text-xs text-slate-500">
          Barrage storage quotas, distribution canal conveyance capacities, and solar/grid pumping stations in the Krishna-Godavari command network.
        </p>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Reservoir Capacity</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{totalCapacity.toLocaleString()} L</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Hydraulic Barrage Volume</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Current Impounded Storage</div>
          <div className="text-xl font-bold text-cyan-700 mt-1">
            {totalCurrent.toLocaleString()} L{' '}
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({Math.round((totalCurrent / totalCapacity) * 100)}%)
            </span>
          </div>
          <div className="text-[11px] text-cyan-600 mt-0.5">Live Storage Gauge</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs bg-emerald-50/20">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Available for Irrigation</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{totalAvailable.toLocaleString()} L</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Net of Buffer Reserves</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Expected River Inflow</div>
          <div className="text-xl font-bold text-blue-600 mt-1">+{totalInflow.toLocaleString()} L/day</div>
          <div className="text-[11px] text-blue-500 mt-0.5">Upstream Catchment Runoff</div>
        </div>
      </div>

      {/* Primary Reservoirs Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-600" />
          Primary Barrages &amp; Balancing Tanks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((res) => {
            const fillPct = Math.round((res.currentStorageLiters / res.capacityLiters) * 100);
            const minBufferPct = Math.round((res.minRequiredStorageLiters / res.capacityLiters) * 100);
            const availablePct = Math.round((res.availableIrrigationLiters / res.capacityLiters) * 100);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-semibold">
                      {res.id} • {res.type.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{res.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    {res.status}
                  </span>
                </div>

                {/* Animated Tank Visualizer */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Current Storage Level</span>
                    <span className="font-mono font-bold text-cyan-800 text-sm">{fillPct}%</span>
                  </div>

                  {/* Multi-layered progress bar */}
                  <div className="relative w-full bg-slate-200 h-6 rounded-lg overflow-hidden border border-slate-300">
                    {/* Minimum buffer line indicator */}
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 z-10"
                      style={{ left: `${minBufferPct}%` }}
                      title={`Minimum Required Storage Buffer: ${res.minRequiredStorageLiters} L`}
                    />
                    <div
                      className="bg-gradient-to-r from-cyan-600 via-blue-500 to-teal-400 h-full transition-all duration-700 relative"
                      style={{ width: `${fillPct}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>0 L</span>
                    <span className="text-rose-600 font-medium">Min Buffer: {res.minRequiredStorageLiters} L</span>
                    <span className="font-semibold">{res.capacityLiters.toLocaleString()} L (Max)</span>
                  </div>
                </div>

                {/* Metric breakdown grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">Available for Irrigation</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">
                      {res.availableIrrigationLiters.toLocaleString()} L
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">Expected 24h Inflow</div>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">
                      +{res.expectedInflowLiters.toLocaleString()} L
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution Canals Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-cyan-600" />
          Canal Conveyance Network
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {canals.map((canal) => {
            const flowPct = Math.round((canal.currentFlowLitersPerDay / canal.capacityLitersPerDay) * 100);
            return (
              <div
                key={canal.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-800">{canal.id}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">{canal.name}</h4>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                    {flowPct}% Flow
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Flow: <strong>{canal.currentFlowLitersPerDay.toLocaleString()} L/d</strong></span>
                    <span>Cap: <strong>{canal.capacityLitersPerDay.toLocaleString()} L/d</strong></span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        flowPct > 85 ? 'bg-rose-500' : flowPct > 65 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${flowPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Connected Command Parcels:</span>
                  <div className="flex gap-1">
                    {canal.connectedFields.map((f) => (
                      <span key={f} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 font-mono rounded font-semibold border border-cyan-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pumping Stations Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Pumping Stations &amp; Energy Tariffs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pumps.map((pump) => {
            const getIcon = () => {
              if (pump.energySource === 'Solar') return <Sun className="w-4 h-4 text-amber-500" />;
              if (pump.energySource === 'Grid Electric') return <Zap className="w-4 h-4 text-blue-500" />;
              return <Fuel className="w-4 h-4 text-rose-500" />;
            };

            return (
              <div
                key={pump.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getIcon()}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">{pump.id}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{pump.name}</h4>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      pump.status === 'Operational'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pump.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Throughput Capacity:</span>
                    <strong className="text-slate-800 font-mono">{pump.capacityLitersPerHour.toLocaleString()} L/hour</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Power Supply Source:</span>
                    <strong className="text-slate-800">{pump.energySource}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Operating Energy Tariff:</span>
                    <strong className="text-purple-700 font-mono">₹{pump.operatingCostPerHour}/hour</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  {pump.energySource === 'Solar'
                    ? 'Preferred by QUBO engine during morning 06:00-10:00 slots for zero marginal carbon.'
                    : 'Dispatched during emergency deficits or off-peak grid billing hours.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
