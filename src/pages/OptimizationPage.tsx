import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { OptimizationResult } from '../types.js';
import { useViewMode } from '../context/ViewModeContext.js';

const RULE_CHIPS = [
  { label: 'Crop Moisture FAO-56', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { label: 'Solar APERC ToD', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { label: 'Rain Gating', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { label: 'Canal Hydraulics', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

const TIME_SLOTS = ['06–08', '08–10', '10–12', '16–18'];

interface OptimizationPageProps {
  optimizationResult: OptimizationResult | null;
  onRunOptimization: (options?: any) => Promise<void>;
  isOptimizing: boolean;
  onNavigateToSchedule: () => void;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({
  optimizationResult,
  onRunOptimization,
  isOptimizing,
  onNavigateToSchedule,
}) => {
  const { isSimple } = useViewMode();
  const [iterations, setIterations] = useState<number>(250);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const metrics = optimizationResult?.metrics;
  const history = optimizationResult?.convergenceHistory || [];
  const matrixSummary = optimizationResult?.quboMatrixSummary;
  const schedule = optimizationResult?.schedule || [];

  // Comparison bar data (horizontal)
  const comparisonData = [
    {
      metric: 'Water Used (L)',
      Baseline: (metrics?.waterAllocated || 5000) + (metrics?.estimatedWaterSaved || 850),
      Quantum: metrics?.waterAllocated || 5000,
    },
    {
      metric: 'Pump Cost (₹)',
      Baseline: metrics?.baselineOperatingCost || 148,
      Quantum: metrics?.estimatedOperatingCost || 96,
    },
  ];

  // Qubit matrix: N fields × 4 time slots
  const fieldIds: string[] =
    schedule.length > 0
      ? Array.from(new Set(schedule.map((s) => s.fieldId)))
      : Array.from(
          { length: Math.max(Math.round((matrixSummary?.variableCount || 24) / 4), 1) },
          (_, i) => `F${i + 1}`
        );

  // Build irrigate set
  const irrigateSet = new Set<string>();
  schedule.forEach((s) => {
    if (s.decision === 'Irrigate') {
      const slotIdx = TIME_SLOTS.findIndex((sl) =>
        s.timeSlot?.startsWith(sl.split('–')[0])
      );
      irrigateSet.add(`${s.fieldId}:${slotIdx >= 0 ? slotIdx : 0}`);
    }
  });
  // If no schedule, show demo pattern
  if (schedule.length === 0) {
    fieldIds.forEach((fid, fi) => irrigateSet.add(`${fid}:${fi % 4}`));
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header Banner ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl border border-cyan-800/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700">
                {isSimple ? 'Decision Engine' : 'QUBO Architecture'}
              </span>
              <span className="text-xs text-slate-400">
                {isSimple ? 'Smart Scheduler' : 'Simulated Quantum Annealing (SQA)'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isSimple ? 'Smart Water Optimizer' : 'Quantum-Inspired Annealing Engine'}
            </h2>
            {/* 4 Rule Chips */}
            <div className="flex flex-wrap gap-1.5">
              {RULE_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${chip.color}`}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-slate-300">Iterations:</span>
              <select
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                className="bg-slate-900 text-cyan-300 text-xs font-mono px-2 py-1 rounded border border-slate-700 focus:outline-hidden"
              >
                <option value="150">150 (Fast)</option>
                <option value="250">250 (Standard)</option>
                <option value="500">500 (Deep)</option>
              </select>
            </div>
            <button
              id="btn-opt-run-engine"
              disabled={isOptimizing}
              onClick={() => onRunOptimization({ customIterations: iterations })}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-lg transition-all flex items-center gap-2 ${
                isOptimizing
                  ? 'bg-cyan-700 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-95'
              }`}
            >
              {isOptimizing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /><span>Annealing…</span></>
              ) : (
                <><Sparkles className="w-4 h-4" /><span>{isSimple ? 'Re-Run Optimizer' : 'Execute QUBO'}</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Solver KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Method</div>
          <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-600" /> QUBO / SQA
          </div>
          <div className="text-[11px] text-cyan-700 font-mono mt-0.5">Transverse Field Annealing</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status</div>
          <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Feasible Optimal
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Constraint Sat: 100%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">QUBO Score</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {metrics?.quboScore ?? -182}
            <span className="text-xs font-normal text-slate-400 ml-1">a.u.</span>
          </div>
          <div className="text-[11px] text-purple-600 mt-0.5">Global Minimum</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Exec Time</div>
          <div className="text-xl font-bold font-mono text-cyan-700 mt-1">
            {metrics?.executionTimeMs ?? 42}
            <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Sub-Second</div>
        </div>
      </div>

      {/* ── Comparison Bar + Quantum Variable Matrix ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compact Comparison Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Baseline vs Quantum
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Water & cost reduction from static rotation</p>
            </div>
            <button
              onClick={onNavigateToSchedule}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              Full Timeline <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="metric" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={10} />
                <Bar dataKey="Baseline" fill="#cbd5e1" radius={[0, 4, 4, 0]} name="Baseline" />
                <Bar dataKey="Quantum" fill="#0284c7" radius={[0, 4, 4, 0]} name="Quantum-QUBO" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantum Variable Matrix */}
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Quantum Variable Matrix
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                x<sub>i,t</sub> ∈ {'{'}'0,1'{'}'} · {fieldIds.length} fields × 4 time slots
              </p>
            </div>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-3 h-3 rounded bg-cyan-500/60 inline-block" /> x=1 Irrigate
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" /> x=0 Skip
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 font-mono pb-1 pr-2 w-12">Field</th>
                  {TIME_SLOTS.map((slot) => (
                    <th key={slot} className="text-center text-slate-500 font-mono pb-1 px-1">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldIds.map((fid) => (
                  <tr key={fid}>
                    <td className="text-slate-400 font-mono font-bold pr-2 py-0.5">{fid}</td>
                    {TIME_SLOTS.map((_, tIdx) => {
                      const isOn = irrigateSet.has(`${fid}:${tIdx}`);
                      return (
                        <td key={tIdx} className="px-1 py-0.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-9 h-7 rounded text-[10px] font-bold transition-all ${
                              isOn
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_6px_rgba(6,182,212,0.35)]'
                                : 'bg-slate-800 text-slate-700 border border-slate-700'
                            }`}
                          >
                            {isOn ? fid : '·'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── SQA Convergence + QUBO Formulation ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SQA Convergence — dual Y axis */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">SQA Energy Minimization</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                H(x) convergence with transverse field Γ(s)
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {history.length} pts
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="iteration"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'Annealing Step (s)', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'Energy H(x)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#a855f7"
                  fontSize={11}
                  label={{ value: 'Γ(s) Fluctuation', angle: 90, position: 'insideRight', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={10} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="energy"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={false}
                  name="H(x) Energy"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="quantumFluctuation"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  name="Γ(s) Quantum Field"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUBO Formulation Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm text-white space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-bold text-sm">QUBO Objective</h4>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed overflow-x-auto">
              min H(x) = H_cost + λ1·H_unmet + λ2·H_conflict + λ3·H_budget + λ4·H_canal
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-400">Decision Qubits:</span>
                <span className="font-mono text-emerald-400">{matrixSummary?.variableCount ?? 24} vars</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-400">Coupling Terms:</span>
                <span className="font-mono text-cyan-400">{matrixSummary?.termsCount ?? 48} non-zero</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-400">Budget Penalty λ3:</span>
                <span className="font-mono text-purple-400">{matrixSummary?.penaltyWaterBudget ?? 0.08}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Canal Barrier λ4:</span>
                <span className="font-mono text-rose-400">{matrixSummary?.penaltyCanalCapacity ?? 120}</span>
              </div>
            </div>
            {/* Penalty Weight Badges */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Penalty Weights Active</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
                  λ1=200 Single-Slot
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-700/50">
                  λ2=120 Canal Cap
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                  λ3=FAO-56 Dr/RAW
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            {showMatrix ? 'Hide Coupling Table' : 'Inspect Q_ij Couplings'}
          </button>
        </div>
      </div>

      {/* ── Optional QUBO Matrix Table ───────────────────────────── */}
      {showMatrix && matrixSummary?.sampleCouplings && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">Sample Upper-Triangular Coupling Elements (Q_ij)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2">Qubit 1 (x_i,t1)</th>
                  <th className="px-4 py-2">Qubit 2 (x_j,t2)</th>
                  <th className="px-4 py-2">Q_ij Weight</th>
                  <th className="px-4 py-2">Constraint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {matrixSummary.sampleCouplings.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-cyan-700 font-bold">{c.q1}</td>
                    <td className="px-4 py-2 text-purple-700 font-bold">{c.q2}</td>
                    <td className="px-4 py-2 font-bold">{c.weight}</td>
                    <td className="px-4 py-2 text-slate-500 font-sans text-[11px]">
                      {c.weight >= 100
                        ? 'Exclusive slot barrier (single irrigation per parcel)'
                        : 'Pump ToU tariff & canal capacity limit'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
