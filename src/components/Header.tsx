import React from 'react';
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Droplet,
  Lightbulb,
  BookOpen,
  Sprout,
  Cpu,
} from 'lucide-react';
import { SystemStatus, OptimizationMetrics } from '../types.js';
import { useViewMode } from '../context/ViewModeContext.js';

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
  metrics,
  onRunOptimization,
  onResetData,
  isOptimizing,
  sectionTitle,
  onOpenHowItWorks,
  onOpenGlossary,
}) => {
  const { viewMode, setViewMode, isSimple } = useViewMode();

  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'Normal':
        return (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSimple ? 'Water Supply Plentiful' : 'Normal Supply'}</span>
          </div>
        );
      case 'Water Stress':
        return (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{isSimple ? 'Low Water Alert' : 'Water Stress'}</span>
          </div>
        );
      case 'Critical':
        return (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-bounce">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{isSimple ? 'Severe Drought Emergency' : 'Critical Deficit'}</span>
          </div>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 gap-4">
      <div className="flex items-center space-x-3 shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">{sectionTitle}</h2>
        {getStatusBadge()}
        {metrics && (
          <div className="hidden xl:flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-slate-600">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Droplet className="w-3.5 h-3.5 text-cyan-600" />
              {isSimple ? 'Dam Water:' : 'Available:'}{' '}
              <strong className="text-slate-900">{metrics.totalAvailableWater.toLocaleString()} L</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              {isSimple ? 'Crop Thirst:' : 'Demand:'}{' '}
              <strong className="text-slate-900">{metrics.totalWaterDemand.toLocaleString()} L</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium">
              {isSimple ? 'Saved Today:' : 'Saved:'}{' '}
              <strong>+{metrics.estimatedWaterSaved.toLocaleString()} L</strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Mode Selector Toggle */}
        <div
          className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs"
          title="Switch between plain language and technical equations"
        >
          <button
            id="btn-mode-simple"
            onClick={() => setViewMode('simple')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              isSimple
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simple</span>
            <span className="sm:hidden">Easy</span>
          </button>
          <button
            id="btn-mode-tech"
            onClick={() => setViewMode('technical')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              !isSimple
                ? 'bg-slate-900 text-cyan-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Technical</span>
            <span className="sm:hidden">Tech</span>
          </button>
        </div>

        {/* How It Works Guide Button */}
        <button
          id="btn-how-it-works"
          onClick={onOpenHowItWorks}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors flex items-center space-x-1"
          title="Learn how this smart water system works in 1 minute"
        >
          <Lightbulb className="w-3.5 h-3.5 text-cyan-600" />
          <span className="hidden md:inline">How It Works</span>
        </button>

        {/* Jargon Buster Button */}
        <button
          id="btn-glossary"
          onClick={onOpenGlossary}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
          title="Look up definitions for ET0, QUBO, Barrages, etc."
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">Jargon Buster</span>
        </button>

        {/* Reset Demo Button */}
        <button
          id="btn-reset-demo"
          onClick={onResetData}
          title="Reset database to demo seed values"
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Optimize Trigger Button */}
        <button
          id="btn-run-quantum-opt"
          disabled={isOptimizing}
          onClick={onRunOptimization}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-md flex items-center space-x-1.5 shrink-0 ${
            isOptimizing
              ? 'bg-cyan-700 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 shadow-cyan-900/20'
          }`}
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{isSimple ? 'Finding Best Plan...' : 'Tunneling Qubits...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{isSimple ? 'Plan Today’s Water' : 'Run Quantum Opt'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
