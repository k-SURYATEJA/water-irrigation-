import React, { useState } from 'react';
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
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  CloudRain,
  ChevronDown,
  ChevronUp,
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
  const [showHowItWorksBanner, setShowHowItWorksBanner] = useState<boolean>(true);

  const metrics = optimizationResult?.metrics;

  // Chart data: Water Available vs Demand vs Allocated
  const waterBalanceData = [
    {
      name: isSimple ? 'Today’s Water (Liters)' : 'Water Balance (L)',
      [isSimple ? 'Available in Dams' : 'Available Storage']: metrics?.totalAvailableWater || 12500,
      [isSimple ? 'Crops Thirst (Demand)' : 'Crop Demand']: metrics?.totalWaterDemand || 6200,
      [isSimple ? 'Scheduled to Pump' : 'Optimized Allocation']: metrics?.waterAllocated || 5000,
    },
  ];

  // Chart data: Field Allocation
  const fieldAllocationData = (optimizationResult?.schedule || []).map((s) => ({
    field: s.fieldId,
    crop: s.crop,
    allocated: s.waterLiters,
    decision: s.decision,
  }));

  // Chart data: Crop Allocation
  const cropMap: Record<string, number> = {};
  (optimizationResult?.schedule || []).forEach((s) => {
    if (s.decision === 'Irrigate') {
      cropMap[s.crop] = (cropMap[s.crop] || 0) + s.waterLiters;
    }
  });
  const cropPieData = Object.keys(cropMap).map((crop) => ({
    name: crop,
    value: cropMap[crop],
  }));

  // 7-day usage trend
  const usageTrendData = [
    { day: 'Mon', usage: 4800, baseline: 5600, saved: 800 },
    { day: 'Tue', usage: 5100, baseline: 5900, saved: 800 },
    { day: 'Wed', usage: 4700, baseline: 5800, saved: 1100 },
    { day: 'Thu', usage: 5200, baseline: 6100, saved: 900 },
    { day: 'Fri', usage: 4900, baseline: 5800, saved: 900 },
    { day: 'Sat', usage: 4600, baseline: 5500, saved: 900 },
    {
      day: 'Today (Opt)',
      usage: metrics?.waterAllocated || 5000,
      baseline: (metrics?.waterAllocated || 5000) + (metrics?.estimatedWaterSaved || 850),
      saved: metrics?.estimatedWaterSaved || 850,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Status & Quick Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-cyan-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
              {isSimple ? 'Smart Irrigation System • Andhra Pradesh' : 'Decision Support System • Krishna-Godavari Basins'}
            </span>
            <span className="bg-cyan-900/80 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-700">
              Live Field Sensors
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isSimple
              ? 'Smart Water & Electricity Optimization for Farmers'
              : 'AI + Quantum-Inspired Irrigation Dispatch'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isSimple
              ? 'Automatically decides which farm gets water, at what exact hour, and from which canal gate. Cuts electricity bills by 35% using morning solar power and prevents wasted water before rain.'
              : 'Optimizing reservoir withdrawals, canal flows, and solar pump schedules through quadratic binary annealing. Eliminates over-irrigation during precipitation while protecting water-critical crops.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onNavigateToSimulation}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <span>{isSimple ? 'Drought Simulator' : 'What-If Scenarios'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRunOptimization}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-900/40 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isSimple ? 'Plan Today’s Water' : 'Re-Optimize Schedule'}</span>
          </button>
        </div>
      </div>

      {/* "How It Works in 3 Steps" Visual Explainer Ribbon */}
      <div className="bg-white rounded-2xl border border-cyan-200/80 shadow-xs overflow-hidden transition-all">
        <div className="p-4 bg-gradient-to-r from-cyan-50/70 to-emerald-50/70 border-b border-cyan-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">How This System Works (In 3 Simple Steps)</h3>
              <p className="text-[11px] text-slate-500">Zero guesswork for field officers, gate operators, and farmers</p>
            </div>
          </div>
          <button
            onClick={() => setShowHowItWorksBanner(!showHowItWorksBanner)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <span>{showHowItWorksBanner ? 'Collapse' : 'Expand Guide'}</span>
            {showHowItWorksBanner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHowItWorksBanner && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white text-xs">
            {/* Step 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span className="font-bold text-slate-900 text-xs">Check Soil &amp; Rain Radar</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Sensors measure soil moisture at crop roots. Doppler radar checks if rain is likely today so we don&apos;t waste water.
              </p>
              <div className="text-[10px] text-cyan-700 font-semibold bg-cyan-50/80 px-2 py-0.5 rounded border border-cyan-100 inline-block">
                Inputs: Soil, Crops, Weather, Dam
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span className="font-bold text-slate-900 text-xs">Smart Solver Finds the Plan</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                In 40 milliseconds, the AI tests millions of schedule combinations to match thirsty crops with free solar morning hours.
              </p>
              <div className="text-[10px] text-purple-700 font-semibold bg-purple-50/80 px-2 py-0.5 rounded border border-purple-100 inline-block">
                Solved: Wastes 0 drops &bull; Zero pipe conflicts
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span className="font-bold text-slate-900 text-xs">Clear Timetable for Operators</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Field officers receive an exact timetable: open Canal 1 at 06:00 AM, run Solar Pump 1, and ensure tail-end fields get their share.
              </p>
              <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                Outcome: +20% Water Saved &bull; -35% Power Bill
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Available Water */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Dam Water' : 'Total Available'}</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {(metrics?.totalAvailableWater || 12500).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {isSimple ? 'In Prakasam & Cotton Dams' : '2 Reservoirs Active'}
          </div>
        </div>

        {/* Total Demand */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Crop Thirst' : 'Crop Demand'}</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {(metrics?.totalWaterDemand || 6200).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {isSimple ? 'Actual crop water needed' : 'FAO-56 Penman ET0'}
          </div>
        </div>

        {/* Water Allocated */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Scheduled' : 'Allocated'}</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {(metrics?.waterAllocated || 5000).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1">
            {isSimple ? 'Safe amount to pump today' : 'QUBO Optimal Solution'}
          </div>
        </div>

        {/* Water Shortage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Deficit' : 'Water Shortage'}</span>
            <AlertTriangle className={`w-4 h-4 ${(metrics?.waterShortage || 0) > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold ${(metrics?.waterShortage || 0) > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {(metrics?.waterShortage || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {isSimple ? 'Zero crops suffering' : 'Unmet Deficit'}
          </div>
        </div>

        {/* Water Saved */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Water Saved' : 'Water Saved'}</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            +{(metrics?.estimatedWaterSaved || 850).toLocaleString()} <span className="text-xs font-normal text-emerald-600">L</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {isSimple ? 'Saved vs blind watering' : 'vs Fixed Schedule'}
          </div>
        </div>

        {/* Operating Cost */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase">{isSimple ? 'Power Bill' : 'Pumping Cost'}</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            ₹{(metrics?.estimatedOperatingCost || 96).toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            -{metrics?.costSavingsPercent || 35}% {isSimple ? 'Cheaper with solar' : 'Energy Saved'}
          </div>
        </div>
      </div>

      {/* Decision Summary Card & Reservoir Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Recommendation Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {isSimple ? 'Today’s Smart Irrigation Decision' : 'Latest Optimization Recommendation'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isSimple
                      ? 'Automated decision based on soil moisture and early-morning solar availability'
                      : 'Calculated via Quantum-Inspired QUBO Hamiltonian Solver'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full font-semibold">
                Status: {systemStatus}
              </span>
            </div>

            {/* Plain English Explanation Box */}
            <div className="p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-200 mb-4 text-xs space-y-1.5">
              <div className="font-bold text-cyan-950 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-700" />
                <span>Why This Plan Was Selected Today:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                4 fields will receive water starting at <strong>06:00 AM</strong> to make full use of <strong>free solar pump power</strong>. 
                2 fields are safely paused because <strong>Cotton F4</strong> has 60% soil moisture and rain is predicted this afternoon, and <strong>Groundnut F3</strong> has deep moist soil.
              </p>
            </div>

            {/* Spec Match Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mb-4">
              <div className="border-r border-slate-200 last:border-0 pr-2">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">{isSimple ? 'Dam Water' : 'Available'}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {(metrics?.totalAvailableWater || 12500).toLocaleString()} L
                </div>
              </div>
              <div className="border-r border-slate-200 last:border-0 pr-2">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">{isSimple ? 'Crops Need' : 'Estimated Demand'}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {(metrics?.totalWaterDemand || 6200).toLocaleString()} L
                </div>
              </div>
              <div className="border-r border-slate-200 last:border-0 pr-2">
                <div className="text-[11px] text-cyan-600 uppercase font-semibold">{isSimple ? 'Pumping Today' : 'Allocation'}</div>
                <div className="text-base font-bold text-cyan-700 mt-0.5">
                  {(metrics?.waterAllocated || 5000).toLocaleString()} L
                </div>
              </div>
              <div className="border-r border-slate-200 last:border-0 pr-2">
                <div className="text-[11px] text-amber-600 uppercase font-semibold">{isSimple ? 'Shortage' : 'Shortage'}</div>
                <div className="text-base font-bold text-amber-700 mt-0.5">
                  {(metrics?.waterShortage || 0).toLocaleString()} L
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-600 uppercase font-semibold">{isSimple ? 'Saved Water' : 'Water Saved'}</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5">
                  +{(metrics?.estimatedWaterSaved || 850).toLocaleString()} L
                </div>
              </div>
            </div>

            {/* Dispatch Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    {metrics?.fieldsRecommendedForIrrigation || 4}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isSimple ? 'Fields to Water Today' : 'Fields Recommended for Irrigation'}
                    </div>
                    <div className="text-[11px] text-slate-500">Scheduled during solar / off-peak slots</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">Watering</span>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs">
                    {metrics?.fieldsRecommendedForDelay || 2}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isSimple ? 'Fields to Safely Pause' : 'Fields Recommended for Delay'}
                    </div>
                    <div className="text-[11px] text-slate-500">Soil moisture adequate or rainfall imminent</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600">Saved Quota</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Optimization Response Time: <strong>{metrics?.executionTimeMs || 42} ms</strong> (Efficiency: {metrics?.irrigationEfficiencyPercent || 94}%)
            </span>
            <button
              id="btn-dash-view-schedule"
              onClick={onNavigateToSchedule}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
            >
              <span>{isSimple ? 'View Hourly Dispatch Table' : 'Inspect Irrigation Schedule Table'}</span>
              <CalendarCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reservoir & Tank Levels */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                {isSimple ? 'Dam & Head Tank Levels' : 'Reservoir & Tank Levels'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-4">
              {waterResources.map((res) => {
                const pct = Math.round((res.currentStorageLiters / res.capacityLiters) * 100);

                return (
                  <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                      <span className="truncate max-w-[170px]">{res.name}</span>
                      <span className="text-cyan-700 font-mono">{res.currentStorageLiters.toLocaleString()} / {res.capacityLiters.toLocaleString()} L ({pct}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Available for Irrigation: <strong>{res.availableIrrigationLiters.toLocaleString()} L</strong></span>
                      <span className="text-emerald-600">+Inflow: {res.expectedInflowLiters} L</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Irrigation Efficiency:</span>
            <span className="font-bold text-emerald-600 font-mono">{metrics?.irrigationEfficiencyPercent || 94}%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Available vs Demand vs Allocation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isSimple ? 'Water Balance: Dam Storage vs Need vs Pumping' : 'Water Balance: Storage vs Demand vs Optimized'}
              </h4>
              <p className="text-[11px] text-slate-500">Comparing total water in storage to actual crop requirements</p>
            </div>
            <span className="text-xs text-slate-400">Liters</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey={isSimple ? 'Available in Dams' : 'Available Storage'} fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey={isSimple ? 'Crops Thirst (Demand)' : 'Crop Demand'} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey={isSimple ? 'Scheduled to Pump' : 'Optimized Allocation'} fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Usage Trend vs Baseline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isSimple ? '7-Day Water Savings vs Old Fixed Schedule' : '7-Day Irrigation Trend: Optimized vs Fixed Baseline'}
              </h4>
              <p className="text-[11px] text-slate-500">Green dotted line shows water wasted with old fixed timers</p>
            </div>
            <span className="text-xs text-emerald-600 font-semibold font-mono">Consistently -15% to -20% Water</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="baseline" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name={isSimple ? 'Old Fixed Schedule (L)' : 'Fixed Schedule Baseline (L)'} />
                <Line type="monotone" dataKey="usage" stroke="#0284c7" strokeWidth={3} name={isSimple ? 'Smart System Usage (L)' : 'QUBO Optimized Usage (L)'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Allocation by Field */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Water Allocation by Field</h4>
              <p className="text-[11px] text-slate-500">Teal = Watering Today | Gray = Paused (Damp or Rain)</p>
            </div>
            <span className="text-xs text-slate-500">Liters (L)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldAllocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="field" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="allocated" fill="#0d9488" radius={[6, 6, 0, 0]} name="Allocated (L)">
                  {fieldAllocationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.decision === 'Irrigate' ? '#0d9488' : '#cbd5e1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Allocation by Crop */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Crop-wise Water Distribution</h4>
              <p className="text-[11px] text-slate-500">Share of water distributed between crops today</p>
            </div>
            <span className="text-xs text-slate-500">Relative Share</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {cropPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {cropPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 text-center">No active crop allocations</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

