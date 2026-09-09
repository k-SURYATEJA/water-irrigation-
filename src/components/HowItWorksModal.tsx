import React, { useState } from 'react';
import {
  X,
  Lightbulb,
  CloudRain,
  Cpu,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Droplets,
  Sun,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartUsing: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStartUsing,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'The Real-World Problem in Andhra Pradesh',
      subtitle: 'Why traditional watering schedules fail',
      icon: <Droplets className="w-8 h-8 text-rose-500" />,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: 'Step 1 • The Challenge',
      content: (
        <div className="space-y-4 text-slate-700 text-sm">
          <p className="leading-relaxed">
            Along the <strong>Krishna and Godavari river basins</strong> (Prakasam Barrage and Sir Arthur Cotton Barrage), water is precious. In standard farming:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-xs">💧 Tail-End Water Starvation</span>
              <p className="text-xs text-slate-600">
                Farms near the canal start take too much water, leaving farms at the far end completely dry.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-xs">🌧️ Wasted Water When It Rains</span>
              <p className="text-xs text-slate-600">
                Fields are often watered right before a heavy storm, washing away fertilizer and wasting reservoir supply.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-xs">⚡ Expensive Electricity Bills</span>
              <p className="text-xs text-slate-600">
                Running high-power electric pumps during evening peak tariff hours costs 3x more than free solar daytime.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'What Information We Collect (Inputs)',
      subtitle: 'Listening to soil sensors, weather forecasts, and river dams',
      icon: <CloudRain className="w-8 h-8 text-cyan-600" />,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      badge: 'Step 2 • Live Data',
      content: (
        <div className="space-y-4 text-slate-700 text-sm">
          <p className="leading-relaxed">
            Instead of guessing, our system checks live field data every morning:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-xl flex items-start space-x-3">
              <span className="text-xl">🌱</span>
              <div>
                <strong className="text-cyan-950 block text-xs">Soil Moisture Sensors</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tells us exactly how wet or dry the dirt is right at the plant root zone (e.g. 35% moisture vs 70%).
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-xl flex items-start space-x-3">
              <span className="text-xl">🌤️</span>
              <div>
                <strong className="text-cyan-950 block text-xs">Weather Radar & Rain Forecast</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calculates air heat (evaporation) and checks if rain is likely within the next 12 hours.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-xl flex items-start space-x-3">
              <span className="text-xl">🌾</span>
              <div>
                <strong className="text-cyan-950 block text-xs">Crop Growth Stage</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Chillies at flowering need water urgently, whereas harvested or dormant crops can easily wait.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-xl flex items-start space-x-3">
              <span className="text-xl">🌊</span>
              <div>
                <strong className="text-cyan-950 block text-xs">Dam Water & Canal Capacities</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Knows the maximum liters each canal branch can safely carry without overflowing.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'How The Smart Brain Solves It',
      subtitle: 'Finding the optimal schedule in 50 milliseconds',
      icon: <Cpu className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Step 3 • Smart Optimization',
      content: (
        <div className="space-y-4 text-slate-700 text-sm">
          <p className="leading-relaxed">
            With 6 fields, 3 canals, 3 pumps, and 12 time slots, there are <strong>billions of possible combinations</strong>. A human water officer cannot calculate this by hand.
          </p>
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2.5">
            <span className="text-xs font-bold text-purple-900 uppercase block tracking-wider">
              The 5 Smart Rules Followed Automatically:
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Rule 1 (Sun First):</strong> Prioritize solar-powered pumps in the cool morning (06:00 - 08:00) to cut electricity costs to ₹0.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Rule 2 (Critical Needs):</strong> Highly sensitive crops (flowering chillies/paddy) receive guaranteed water first.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Rule 3 (Rain Smart):</strong> If Doppler rain probability is &gt; 50%, pause watering and let nature do the work.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Rule 4 (No Pipe Overload):</strong> Ensures two pumps never flood the same canal simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Rule 5 (Fair Share):</strong> Guarantees tail-end parcels get their fair share even during drought.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'What You Get: Clear Hourly Action Plan',
      subtitle: 'Zero guesswork for farmers, gate operators, and engineers',
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Step 4 • The Outcome',
      content: (
        <div className="space-y-4 text-slate-700 text-sm">
          <p className="leading-relaxed">
            The result is an intuitive <strong>Daily Irrigation Timetable</strong> showing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
              <span className="text-2xl font-bold text-emerald-700 block">+20%</span>
              <span className="text-xs font-semibold text-slate-800 block">Water Conserved</span>
              <p className="text-[11px] text-slate-600">Saved by not over-irrigating wet or rainy fields.</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-1">
              <span className="text-2xl font-bold text-purple-700 block">-35%</span>
              <span className="text-xs font-semibold text-slate-800 block">Electricity Costs</span>
              <p className="text-[11px] text-slate-600">Shifting heavy pumping to solar morning hours.</p>
            </div>
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-center space-y-1">
              <span className="text-2xl font-bold text-cyan-700 block">100%</span>
              <span className="text-xs font-semibold text-slate-800 block">Fair Distribution</span>
              <p className="text-[11px] text-slate-600">Tail-end farmers never left stranded with zero water.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
            <span>💡 <strong>Tip:</strong> You can toggle between <em>"Farmer View (Simple)"</em> and <em>"Engineering View (Math & Physics)"</em> anytime at the top right.</span>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">How This System Works in Plain English</h3>
              <p className="text-xs text-slate-500">A quick 1-minute visual guide for everyone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="px-6 pt-4 pb-2 flex gap-2 border-b border-slate-100 bg-white">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                activeStep === idx
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${current.color}`}>
              {current.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {activeStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
              {current.icon}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{current.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <div className="pt-2">{current.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartUsing();
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Explore the Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
