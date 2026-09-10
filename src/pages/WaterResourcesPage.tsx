import React from 'react';
import {
  Waves,
  ArrowDownToLine,
  Zap,
  Sun,
  Fuel,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { WaterResource, Canal, Pump } from '../types.js';

interface WaterResourcesPageProps {
  resources: WaterResource[];
  canals: Canal[];
  pumps: Pump[];
}

const fillBarColor = (pct: number) =>
  pct < 30 ? 'bg-rose-500' : pct < 55 ? 'bg-amber-500' : 'bg-cyan-500';

const canalBarColor = (pct: number) =>
  pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-cyan-500';

const reservoirStatusCls = (status: string) =>
  status === 'Normal' || status === 'Operational'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : status === 'Low'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-rose-100 text-rose-800 border-rose-200';

const EnergyIcon: React.FC<{ source: string }> = ({ source }) => {
  if (source === 'Solar')         return <Sun  className="w-4 h-4 text-amber-500" />;
  if (source === 'Grid Electric') return <Zap  className="w-4 h-4 text-blue-500" />;
  return <Fuel className="w-4 h-4 text-rose-500" />;
};

export const WaterResourcesPage: React.FC<WaterResourcesPageProps> = ({
  resources,
  canals,
  pumps,
}) => {
  const totalCapacity  = resources.reduce((s, r) => s + r.capacityLiters, 0);
  const totalCurrent   = resources.reduce((s, r) => s + r.currentStorageLiters, 0);
  const totalAvailable = resources.reduce((s, r) => s + r.availableIrrigationLiters, 0);
  const totalInflow    = resources.reduce((s, r) => s + r.expectedInflowLiters, 0);
  const overallPct     = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { label: 'Total Capacity',   value: `${totalCapacity.toLocaleString()} L`,  sub: 'Barrage volume',   color: 'text-slate-800' },
          { label: 'Current Storage',  value: `${totalCurrent.toLocaleString()} L`,   sub: `${overallPct}% full`, color: 'text-cyan-700' },
          { label: 'For Irrigation',   value: `${totalAvailable.toLocaleString()} L`, sub: 'Net of buffer',    color: 'text-emerald-700' },
          { label: '24h River Inflow', value: `+${totalInflow.toLocaleString()} L`,   sub: 'Upstream runoff',  color: 'text-blue-600' },
        ] as const).map((k) => (
          <div key={k.label} className="bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-semibold uppercase text-slate-400">{k.label}</div>
            <div className={`text-lg font-bold mt-0.5 ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Section 1: Barrages / Reservoirs ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-600" />
          Barrages &amp; Balancing Tanks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => {
            const fillPct   = Math.round((res.currentStorageLiters       / res.capacityLiters) * 100);
            const bufferPct = Math.round((res.minRequiredStorageLiters   / res.capacityLiters) * 100);
            return (
              <div key={res.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                      {res.id}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">{res.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{res.type}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reservoirStatusCls(res.status)}`}>
                    {res.status}
                  </span>
                </div>

                {/* Fill gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Storage</span>
                    <span className="font-bold font-mono text-slate-800">{fillPct}%</span>
                  </div>
                  <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="absolute top-0 bottom-0 w-px bg-rose-400 z-10"
                      style={{ left: `${bufferPct}%` }}
                      title={`Min buffer: ${res.minRequiredStorageLiters.toLocaleString()} L`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${fillBarColor(fillPct)}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 L</span>
                    <span className="text-rose-500">Buffer: {res.minRequiredStorageLiters.toLocaleString()} L</span>
                    <span>{res.capacityLiters.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <div className="text-slate-400">Current</div>
                    <div className="font-bold text-slate-700 font-mono">{res.currentStorageLiters.toLocaleString()} L</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg px-2 py-1.5 border border-emerald-100">
                    <div className="text-emerald-600">Available</div>
                    <div className="font-bold text-emerald-700 font-mono">{res.availableIrrigationLiters.toLocaleString()} L</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-100">
                    <div className="text-blue-500">24h Inflow</div>
                    <div className="font-bold text-blue-700 font-mono">+{res.expectedInflowLiters.toLocaleString()} L</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: Canals ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-cyan-600" />
          Canal Conveyance Network
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                {['ID','Name','Flow Rate','Capacity','Util %','Connected Fields'].map((h) => (
                  <th key={h} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {canals.map((canal) => {
                const flowPct = Math.round((canal.currentFlowLitersPerDay / canal.capacityLitersPerDay) * 100);
                return (
                  <tr key={canal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2 font-bold text-cyan-700 font-mono">{canal.id}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{canal.name}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{canal.currentFlowLitersPerDay.toLocaleString()} L/d</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{canal.capacityLitersPerDay.toLocaleString()} L/d</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${canalBarColor(flowPct)}`} style={{ width: `${flowPct}%` }} />
                        </div>
                        <span className="font-mono font-bold text-slate-700">{flowPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {canal.connectedFields.map((f) => (
                          <span key={f} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 font-mono text-[10px] rounded border border-cyan-200 font-semibold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 3: Pumps ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Pumping Stations
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                {['ID','Name','Capacity','Energy Source','Cost / hr','Status'].map((h) => (
                  <th key={h} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pumps.map((pump) => {
                const isOK = pump.status === 'Operational';
                return (
                  <tr key={pump.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-500 font-mono">{pump.id}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{pump.name}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{pump.capacityLitersPerHour.toLocaleString()} L/h</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <EnergyIcon source={pump.energySource} />
                        <span className="text-slate-700">{pump.energySource}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-purple-700">Rs.{pump.operatingCostPerHour}/hr</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isOK
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50  text-amber-700  border-amber-200'
                      }`}>
                        {isOK
                          ? <CheckCircle2 className="w-3 h-3" />
                          : <AlertCircle  className="w-3 h-3" />}
                        {pump.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
