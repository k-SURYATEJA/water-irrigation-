import React from 'react';
import {
  Info,
  Cpu,
  Droplets,
  BookOpen,
  Terminal,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-cyan-800/60 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-700">
            College Hackathon Prototype
          </span>
          <span className="text-xs text-slate-300">Andhra Pradesh Water Resources Department Context</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI + Quantum-Inspired Irrigation and Water Resource Allocation Optimization
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          An intelligent decision-support system formulating agricultural water allocation as a Quadratic Unconstrained Binary Optimization (QUBO) problem, resolved via Simulated Quantum Annealing with transverse field tunneling.
        </p>
      </div>

      {/* Krishna-Godavari Command Area Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-600" />
          Relevance to Andhra Pradesh: Krishna-Godavari Command Areas
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Krishna and Godavari delta networks (serviced by the <strong>Prakasam Barrage</strong> in Vijayawada and the <strong>Sir Arthur Cotton Barrage</strong> in Dowleswaram) irrigate millions of acres of paddy, chillies, cotton, and horticulture. Water managers face strict volumetric constraints during rabi seasons:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800 block mb-1">Prakasam Barrage Network</strong>
            <p className="text-slate-600">
              Krishna Main Canal (Eastern &amp; Western deltas) regulating water to Guntur, Krishna, and Bapatla command zones.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800 block mb-1">Sir Arthur Cotton Barrage</strong>
            <p className="text-slate-600">
              Godavari delta system serving East &amp; West Godavari command areas with complex seasonal flash inflows.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800 block mb-1">Tail-End Parcel Deficits</strong>
            <p className="text-slate-600">
              Head-reach fields often over-irrigate while tail-end distributaries suffer severe water starvation.
            </p>
          </div>
        </div>
      </div>

      {/* The 7 Core Operational Questions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-600" />
          The 7 Core Operational Decisions Solved
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">1. Which fields to irrigate:</strong>
              <p className="text-slate-600 mt-0.5">Determined dynamically based on root-zone moisture deficit and crop critical growth stage.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">2. When to irrigate:</strong>
              <p className="text-slate-600 mt-0.5">Allocates 2-hour slots matching early-morning solar pump windows (06:00-08:00) to minimize evaporative loss.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">3. How much water to allocate:</strong>
              <p className="text-slate-600 mt-0.5">Calculated using FAO-56 Penman-Monteith ET0, crop coefficient (Kc), and soil moisture capacity.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">4. Minimizing water wastage:</strong>
              <p className="text-slate-600 mt-0.5">Delays irrigation when Doppler rainfall probability &gt; 50%, saving thousands of liters.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">5. Minimizing operating costs:</strong>
              <p className="text-slate-600 mt-0.5">Reduces high-tariff grid pumping by prioritizing solar submersible stations.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">6. Satisfying crop water requirements:</strong>
              <p className="text-slate-600 mt-0.5">Prioritizes water-sensitive flowering and fruit formation stages over dormant vegetative stages.</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 flex items-start space-x-2 md:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-950">7. Distributing limited water fairly:</strong>
              <p className="text-slate-600 mt-0.5">Enforces canal conveyance thresholds so tail-end fields receive guaranteed rotational quotas under drought.</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUBO Mathematical Formulation */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-white space-y-4">
        <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Quantum-Inspired Hamiltonian Formulation
        </h3>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
          min H(x) = H_cost + λ1·H_unmet + λ2·H_conflict + λ3·H_budget + λ4·H_canal
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <strong className="text-white">1. Pumping Operating Cost:</strong>
            <p className="text-slate-400 mt-0.5">
              H_cost = ∑(i, t) x_(i,t) · (C_pump(i) · Tariff(t))
            </p>
          </div>
          <div>
            <strong className="text-white">2. Unmet Crop Demand Penalty:</strong>
            <p className="text-slate-400 mt-0.5">
              H_unmet = ∑(i) Priority(i) · (1 - ∑(t) x_(i,t))²
            </p>
          </div>
          <div>
            <strong className="text-white">3. Slot Conflict Penalty (Single Irrigation per Parcel):</strong>
            <p className="text-slate-400 mt-0.5">
              H_conflict = ∑(i) ∑(t1 &lt; t2) x_(i,t1) · x_(i,t2)
            </p>
          </div>
          <div>
            <strong className="text-white">4. Reservoir Storage Constraint:</strong>
            <p className="text-slate-400 mt-0.5">
              H_budget = max(0, ∑(i,t) x_(i,t)·D_i - W_available)²
            </p>
          </div>
          <div>
            <strong className="text-white">5. Simulated Quantum Annealing (Transverse Field):</strong>
            <p className="text-slate-400 mt-0.5">
              H(s) = (1 - s) H_transverse + s H_problem, where Γ(s) = Γ_0 · (1 - s)² allows tunneling through tall barrier penalties.
            </p>
          </div>
        </div>
      </div>

      {/* Python Backend & Local Setup Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Terminal className="w-5 h-5 text-slate-700" />
          Standalone Python FastAPI Backend Architecture
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          While this web application executes the full QUBO Simulated Quantum Annealing engine directly via its integrated Node.js/SQLite server on port 3000, we have also supplied an identical, modular <strong>Python / FastAPI</strong> service inside the <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded">backend/</code> directory.
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-1.5 overflow-x-auto">
          <div className="text-slate-400"># To run the Python FastAPI backend locally:</div>
          <div>cd backend</div>
          <div>pip install -r requirements.txt</div>
          <div>uvicorn app.main:app --reload --port 8000</div>
          <div className="text-emerald-400 mt-2"># Interactive Swagger documentation will be available at http://localhost:8000/docs</div>
        </div>
      </div>
    </div>
  );
};
