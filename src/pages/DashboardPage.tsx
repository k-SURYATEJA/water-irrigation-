import React from 'react';
import {
  Droplets,
  TrendingDown,
  Sprout,
  Clock,
  Zap,
  Gauge,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Activity,
  Timer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  OptimizationResult,
  WaterResource,
  Field,
  SystemStatus,
} from '../types.js';
import { useViewMode } from '../context/ViewModeContext.js';
import { useDataset } from '../context/DatasetContext.js';

interface DashboardPageProps {
  optimizationResult: OptimizationResult | null;
  waterResources: WaterResource[];
  fields: Field[];
  systemStatus: SystemStatus;
  onNavigateToSchedule: () => void;
  onNavigateToSimulation: () => void;
  onRunOptimization: () => void;
  onOpenHowItWorks?: () => void;
}

const CROP_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  optimizationResult,
  waterResources,
  fields,
  systemStatus,
  onNavigateToSchedule,
  onNavigateToSimulation,
  onRunOptimization,
}) => {
  const { isSimple } = useViewMode();
  const { currentSegment, currentSegmentId, setSegment, segments } = useDataset();

  const metrics = optimizationResult?.metrics;
  const schedule = optimizationResult?.schedule || [];

  // Derived schedule lists
  const irrigateEntries = schedule.filter((s) => s.decision === 'Irrigate');
  const delayEntries = schedule.filter((s) => s.decision !== 'Irrigate');

  // Chart: Water Balance
  const waterBalanceData = [
    {
      name: isSimple ? "Today's Water (L)" : 'Water Balance (L)',
      [isSimple ? 'Available in Dams' : 'Available Storage']: metrics?.totalAvailableWater || 12500,
      [isSimple ? 'Crops Thirst (Demand)' : 'Crop Demand']: metrics?.totalWaterDemand || 6200,
      [isSimple ? 'Scheduled to Pump' : 'Optimized Allocation']: metrics?.waterAllocated || 5000,
    },
  ];

  // Chart: Field Allocation
  const fieldAllocationData = schedule.map((s) => ({
    field: s.fieldId,
    crop: s.crop,
    allocated: s.waterLiters,
    decision: s.decision,
  }));

  // Chart: Crop Pie
  const cropMap: Record<string, number> = {};
  schedule.forEach((s) => {
    if (s.decision === 'Irrigate') {
      cropMap[s.crop] = (cropMap[s.crop] || 0) + s.waterLiters;
    }
  });
  const cropPieData = Object.keys(cropMap).map((crop) => ({
    name: crop,
    value: cropMap[crop],
  }));

  // Chart: 7-day usage trend
  const usageTrendData = [
    { day: 'Mon', usage: 4800, baseline: 5600 },
    { day: 'Tue', usage: 5100, baseline: 5900 },
    { day: 'Wed', usage: 4700, baseline: 5800 },
    { day: 'Thu', usage: 5200, baseline: 6100 },
    { day: 'Fri', usage: 4900, baseline: 5800 },
    { day: 'Sat', usage: 4600, baseline: 5500 },
    {
      day: 'Today',
      usage: metrics?.waterAllocated || 5000,
      baseline: (metrics?.waterAllocated || 5000) + (metrics?.estimatedWaterSaved || 850),
    },
  ];

  const kpiCards = [
    {
      label: isSimple ? 'Dam Water' : 'Total Available',
      value: `${(metrics?.totalAvailableWater || 12500).toLocaleString()} L`,
      sub: '2 Reservoirs Active',
      icon: <Droplets className="w-4 h-4 text-cyan-500" />,
      accent: 'text-slate-800',
    },
    {
      label: isSimple ? 'Crop Thirst' : 'Crop Demand',
      value: `${(metrics?.totalWaterDemand || 6200).toLocaleString()} L`,
      sub: isSimple ? 'Actual crop need' : 'FAO-56 Penman ET₀',
      icon: <Sprout className="w-4 h-4 text-emerald-500" />,
      accent: 'text-slate-800',
    },
    {
      label: isSimple ? 'Scheduled' : 'Allocated',
      value: `${(metrics?.waterAllocated || 5000).toLocaleString()} L`,
      sub: isSimple ? 'Safe to pump today' : 'QUBO Optimal',
      icon: <Gauge className="w-4 h-4 text-blue-500" />,
      accent: 'text-slate-800',
    },
    {
      label: isSimple ? 'Deficit' : 'Shortage',
      value: `${(metrics?.waterShortage || 0).toLocaleString()} L`,
      sub: isSimple ? 'Unmet crop need' : 'Unmet Deficit',
      icon: <AlertTriangle className={`w-4 h-4 ${(metrics?.waterShortage || 0) > 0 ? 'text-amber-500' : 'text-slate-400'}`} />,
      accent: (metrics?.waterShortage || 0) > 0 ? 'text-amber-600' : 'text-slate-800',
    },
    {
      label: 'Water Saved',
      value: `+${(metrics?.estimatedWaterSaved || 850).toLocaleString()} L`,
      sub: isSimple ? 'vs blind watering' : 'vs Fixed Schedule',
      icon: <TrendingDown className="w-4 h-4 text-emerald-500" />,
      accent: 'text-emerald-700',
      highlight: true,
    },
    {
      label: isSimple ? 'Power Bill' : 'Pumping Cost',
      value: `₹${(metrics?.estimatedOperatingCost || 96).toLocaleString()}`,
      sub: `-${metrics?.costSavingsPercent || 35}% ${isSimple ? 'with solar' : 'energy saved'}`,
      icon: <Zap className="w-4 h-4 text-purple-500" />,
      accent: 'text-slate-800',
    },
  ];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl border border-cyan-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-300">
                {isSimple ? 'Smart Irrigation • Andhra Pradesh' : 'Decision Support System • Krishna-Godavari Basins'}
              </span>
              <span className="bg-cyan-900/80 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-700">
                Live Field Sensors
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isSimple ? 'Smart Water & Electricity Optimization' : 'AI + Quantum-Inspired Irrigation Dispatch'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {isSimple
                ? 'Decides which farm gets water, at what hour, from which canal. Cuts electricity bills via morning solar power.'
                : 'Optimizing reservoir withdrawals, canal flows, and solar pump schedules via QUBO Hamiltonian annealing.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToSimulation}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>{isSimple ? 'Drought Simulator' : 'What-If Scenarios'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRunOptimization}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSimple ? "Plan Today's Water" : 'Re-Optimize Schedule'}</span>
            </button>
          </div>
        </div>

        {/* Segment Switcher */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Dataset:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold font-mono">
              {currentSegment.name} ({currentSegment.district})
            </span>
            <span className="text-slate-400 hidden lg:inline">
              • Soil: <strong className="text-amber-300">{currentSegment.soilProfile}</strong>
            </span>
            <span className="text-slate-400 hidden lg:inline">
              • Water: <strong className="text-blue-300">{currentSegment.waterSource}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {segments.map((s) => (
              <button
                key={s.id}
                onClick={() => setSegment(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  currentSegmentId === s.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {s.name.replace('Zone ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className={`bg-white p-3.5 rounded-xl border shadow-xs hover:border-cyan-300 transition-colors relative ${
              card.highlight ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            <div className="absolute top-3 right-3">{card.icon}</div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1 pr-6">{card.label}</div>
            <div className={`text-lg font-bold ${card.accent} leading-tight`}>{card.value}</div>
            <div className={`text-[10px] mt-1 font-medium ${card.highlight ? 'text-emerald-600' : 'text-slate-400'}`}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Decision Card + Reservoir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Decision Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {isSimple ? "Today's Smart Irrigation Decision" : 'Latest Optimization Recommendation'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isSimple ? 'Automated from soil moisture & solar availability' : 'QUBO Hamiltonian Solver output'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full font-semibold">
              {systemStatus}
            </span>
          </div>

          {/* QUBO Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {metrics?.fieldsRecommendedForIrrigation ?? 0}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800">
                  {isSimple ? 'Fields Watering' : 'Irrigating'}
                </div>
                <div className="text-[10px] text-slate-500">Solar / off-peak slots</div>
              </div>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {metrics?.fieldsRecommendedForDelay ?? 0}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800">
                  {isSimple ? 'Fields Paused' : 'Delayed'}
                </div>
                <div className="text-[10px] text-slate-500">Moist soil / rain</div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">{metrics?.executionTimeMs ?? 42} ms</div>
                <div className="text-[10px] text-slate-500">{isSimple ? 'Solve time' : 'Execution time'}</div>
              </div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">{metrics?.irrigationEfficiencyPercent ?? 94}%</div>
                <div className="text-[10px] text-slate-500">{isSimple ? 'Efficiency' : 'QUBO efficiency'}</div>
              </div>
            </div>
          </div>

          {/* Dynamic Schedule Summary */}
          {schedule.length > 0 ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  {isSimple ? 'Field-by-Field Plan' : 'Schedule Dispatch Summary'}
                </span>
                <span className="text-[10px] text-slate-400">{schedule.length} fields</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                {/* Irrigate column */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Irrigate</span>
                  </div>
                  {irrigateEntries.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic">None scheduled</div>
                  )}
                  {irrigateEntries.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-slate-800 shrink-0">{s.fieldId}</span>
                      <span className="text-slate-400 font-mono text-[10px] truncate">{s.timeSlot}</span>
                      <span className="font-mono font-bold text-emerald-700 shrink-0">{s.waterLiters.toLocaleString()} L</span>
                    </div>
                  ))}
                </div>
                {/* Delay column */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Delayed</span>
                  </div>
                  {delayEntries.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic">None delayed</div>
                  )}
                  {delayEntries.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-slate-600 shrink-0">{s.fieldId}</span>
                      <span className="text-slate-400 text-[10px] truncate flex-1">{s.crop}</span>
                      <span className="text-[10px] text-slate-400 italic shrink-0">Paused</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-slate-300" />
              Run optimization to see today&apos;s irrigation schedule
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isSimple ? 'QUBO Score:' : 'QUBO Score:'}{' '}
              <strong className="text-slate-700">{metrics?.quboScore?.toFixed(2) ?? '—'}</strong>
              {' · '}Solver: <strong className="text-slate-700">{metrics?.solverType ?? 'Quantum-Inspired'}</strong>
            </span>
            <button
              id="btn-dash-view-schedule"
              onClick={onNavigateToSchedule}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              <span>{isSimple ? 'View Hourly Dispatch' : 'Inspect Schedule Table'}</span>
              <CalendarCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reservoir Levels */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" />
              {isSimple ? 'Dam & Tank Levels' : 'Reservoir & Tank Levels'}
            </h3>
            <span className="text-[11px] text-emerald-600 font-mono font-semibold">
              {metrics?.irrigationEfficiencyPercent ?? 94}% eff.
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {waterResources.map((res) => {
              const pct = Math.round((res.currentStorageLiters / res.capacityLiters) * 100);
              const gradient =
                pct > 60
                  ? 'from-cyan-500 to-blue-600'
                  : pct > 30
                  ? 'from-amber-400 to-orange-500'
                  : 'from-rose-500 to-red-600';
              return (
                <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">{res.name}</span>
                    <span className="text-cyan-700 font-mono text-[11px] font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{res.currentStorageLiters.toLocaleString()} / {res.capacityLiters.toLocaleString()} L</span>
                    <span className="text-emerald-600">+{res.expectedInflowLiters} L inflow</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Available for irrigation:</span>
            <span className="font-bold text-cyan-700">
              {waterResources.reduce((a, r) => a + r.availableIrrigationLiters, 0).toLocaleString()} L
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Water Balance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isSimple ? 'Water Balance: Dam vs Demand vs Pump' : 'Water Balance: Storage vs Demand vs Allocation'}
              </h4>
              <p className="text-[11px] text-slate-400">Comparing reservoir storage to crop requirements</p>
            </div>
            <span className="text-xs text-slate-400">L</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey={isSimple ? 'Available in Dams' : 'Available Storage'} fill="#0284c7" radius={[5, 5, 0, 0]} />
                <Bar dataKey={isSimple ? 'Crops Thirst (Demand)' : 'Crop Demand'} fill="#f59e0b" radius={[5, 5, 0, 0]} />
                <Bar dataKey={isSimple ? 'Scheduled to Pump' : 'Optimized Allocation'} fill="#10b981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 7-Day Trend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isSimple ? '7-Day Water Savings vs Fixed Schedule' : '7-Day Irrigation Trend: Optimized vs Baseline'}
              </h4>
              <p className="text-[11px] text-slate-400">Dashed = old fixed timers baseline</p>
            </div>
            <span className="text-xs text-emerald-600 font-semibold font-mono">−15–20%</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name={isSimple ? 'Old Schedule (L)' : 'Fixed Baseline (L)'} />
                <Line type="monotone" dataKey="usage" stroke="#0284c7" strokeWidth={2.5} name={isSimple ? 'Smart System (L)' : 'QUBO Optimized (L)'} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Field Allocation */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Water Allocation by Field</h4>
              <p className="text-[11px] text-slate-400">Teal = Irrigating · Gray = Paused</p>
            </div>
            <span className="text-xs text-slate-400">Liters (L)</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldAllocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="field" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                <Bar dataKey="allocated" radius={[5, 5, 0, 0]} name="Allocated (L)">
                  {fieldAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.decision === 'Irrigate' ? '#0d9488' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Crop Pie */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Crop-wise Water Distribution</h4>
              <p className="text-[11px] text-slate-400">Share of water dispatched per crop type today</p>
            </div>
            <span className="text-xs text-slate-400">Relative Share</span>
          </div>
          <div className="h-52 flex items-center justify-center">
            {cropPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {cropPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                No active crop allocations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
