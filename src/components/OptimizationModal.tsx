import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Waves, ArrowRight } from 'lucide-react';
import { OptimizationResult } from '../types.js';

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OptimizationResult | null;
  onViewSchedule: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  result,
  onViewSchedule,
}) => {
  const [phase, setPhase] = useState<'initializing' | 'annealing' | 'tunneling' | 'completed'>('initializing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setPhase('initializing');
      return;
    }

    // Dynamic animation sequence simulating quantum annealing
    setPhase('initializing');
    setProgress(15);

    const t1 = setTimeout(() => {
      setPhase('annealing');
      setProgress(50);
    }, 400);

    const t2 = setTimeout(() => {
      setPhase('tunneling');
      setProgress(85);
    }, 900);

    const t3 = setTimeout(() => {
      setPhase('completed');
      setProgress(100);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Quantum Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide text-white">Quantum-Inspired Annealing</h3>
              <p className="text-xs text-cyan-400 font-mono">Transverse-Field QUBO Solver</p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-cyan-900/60 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-700">
            {phase}
          </span>
        </div>

        {/* Dynamic Visualizer */}
        <div className="p-6 space-y-6">
          {/* Progress Bar with glowing gradient */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Transverse Decay $\Gamma(s)$</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300 shadow-md shadow-cyan-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Annealing State Display */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Hamiltonian Formulation:</span>
              <span className="text-cyan-400">H(x) = H_cost + λ_unmet + λ_budget</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Decision Variables (x_i,t):</span>
              <span className="text-emerald-400">{result?.quboMatrixSummary.variableCount || 24} Binary Qubits</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Coupling Interactions:</span>
              <span className="text-slate-200">{result?.quboMatrixSummary.termsCount || 48} Constraint Edges</span>
            </div>
            {phase === 'completed' && (
              <div className="flex justify-between items-center text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                <span>Final Solution Energy:</span>
                <span>{result?.metrics.quboScore} arbitrary units</span>
              </div>
            )}
          </div>

          {/* Completed Metrics Summary */}
          {phase === 'completed' && result && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-cyan-400">Allocated</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {result.metrics.waterAllocated.toLocaleString()} L
                </div>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-emerald-400">Water Saved</div>
                <div className="text-base font-bold text-white mt-0.5">
                  +{result.metrics.estimatedWaterSaved.toLocaleString()} L
                </div>
              </div>
              <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-purple-400">Cost Savings</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {result.metrics.costSavingsPercent}%
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
            {phase === 'completed' && (
              <button
                id="btn-modal-view-schedule"
                onClick={() => {
                  onClose();
                  onViewSchedule();
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>View Full Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
