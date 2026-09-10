import React from 'react';
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  BookOpen,
  Sprout,
  Cpu,
  Database,
} from 'lucide-react';
import { SystemStatus, OptimizationMetrics } from '../types.js';
import { useViewMode } from '../context/ViewModeContext.js';
import { useDataset } from '../context/DatasetContext.js';

interface HeaderProps {
  systemStatus: SystemStatus;
  metrics: OptimizationMetrics | null;
  onRunOptimization: () => void;
  onResetData: () => void;
  isOptimizing: boolean;
  sectionTitle: string;
  onOpenHowItWorks: () => void;
  onOpenGlossary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  metrics: _metrics,
  onRunOptimization,
  onResetData,
  isOptimizing,
  sectionTitle,
  onOpenHowItWorks: _onOpenHowItWorks,
  onOpenGlossary,
}) => {
  const { setViewMode, isSimple } = useViewMode();
  const { currentSegmentId, setSegment, segments } = useDataset();

  const statusBadge = {
    Normal: (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>{isSimple ? 'Supply OK' : 'Normal'}</span>
      </div>
    ),
    'Water Stress': (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>{isSimple ? 'Low Water' : 'Water Stress'}</span>
      </div>
    ),
    Critical: (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-bounce">
        <AlertOctagon className="w-3 h-3 text-rose-600" />
        <span>{isSimple ? 'Drought Alert' : 'Critical'}</span>
      </div>
    ),
  } as const;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 gap-3 shrink-0">
      {/* Left: title + status */}
      <div className="flex items-center gap-2.5 shrink-0 min-w-0">
        <h2 className="text-base font-bold text-slate-800 tracking-tight truncate">{sectionTitle}</h2>
        {statusBadge[systemStatus]}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Zone segment selector */}
        <div
          className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-xs"
          title="Filter by agro-climatic zone"
        >
          <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-blue-800 font-medium hidden sm:inline">Zone:</span>
          <select
            id="dataset-segment-select"
            value={currentSegmentId}
            onChange={(e) => setSegment(e.target.value as any)}
            className="bg-transparent font-bold text-blue-900 focus:outline-none cursor-pointer text-xs"
          >
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name.replace('Zone ', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Simple / Technical toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            id="btn-mode-simple"
            onClick={() => setViewMode('simple')}
            title="Plain language mode"
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
              isSimple ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simple</span>
          </button>
          <button
            id="btn-mode-tech"
            onClick={() => setViewMode('technical')}
            title="Technical equations mode"
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
              !isSimple ? 'bg-slate-900 text-cyan-300 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Technical</span>
          </button>
        </div>

        {/* Glossary / Jargon Buster */}
        <button
          id="btn-glossary"
          onClick={onOpenGlossary}
          title="Look up terms: ET0, QUBO, Barrages..."
          className="p-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">Glossary</span>
        </button>

        {/* Reset */}
        <button
          id="btn-reset-demo"
          onClick={onResetData}
          title="Reset to demo seed data"
          className="p-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Run Quantum Opt */}
        <button
          id="btn-run-quantum-opt"
          disabled={isOptimizing}
          onClick={onRunOptimization}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-md flex items-center gap-1.5 shrink-0 ${
            isOptimizing
              ? 'bg-cyan-700 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 shadow-cyan-900/20'
          }`}
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isSimple ? 'Optimising...' : 'Tunneling...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>{isSimple ? 'Plan Water' : 'Run Quantum Opt'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
