import React, { useState } from 'react';
import { X, Search, BookOpen, HelpCircle } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermItem {
  term: string;
  simpleMeaning: string;
  example: string;
  category: 'Irrigation & Water' | 'AI & Quantum' | 'Andhra Pradesh Context';
}

const GLOSSARY_ITEMS: TermItem[] = [
  {
    term: 'ET0 (Reference Evapotranspiration)',
    simpleMeaning: 'How thirsty the atmosphere is today. A measurement of how much water plants and soil naturally lose to the heat and air.',
    example: 'On a 34°C dry sunny day in Vijayawada, ET0 might be 5.8 mm/day, meaning crops lose water quickly.',
    category: 'Irrigation & Water',
  },
  {
    term: 'Root-Zone Soil Moisture Deficit',
    simpleMeaning: 'How dry the dirt is right now around the plant roots compared to ideal wetness.',
    example: 'If soil moisture is 35% and ideal is 70%, the deficit is 35%—meaning the crop needs water soon.',
    category: 'Irrigation & Water',
  },
  {
    term: 'Crop Coefficient (Kc)',
    simpleMeaning: 'A multiplier reflecting how much water a specific crop drinks at its current stage of growth.',
    example: 'Flowering tomato has Kc = 1.15 (drinks a lot), while vegetative groundnut has Kc = 0.70.',
    category: 'Irrigation & Water',
  },
  {
    term: 'QUBO (Quadratic Unconstrained Binary Optimization)',
    simpleMeaning: 'A mathematical way to turn real-world decision problems into simple YES/NO switches (0 or 1) that can be solved at ultra-fast speeds.',
    example: 'Variable x(F1, 6AM) = 1 means "Turn ON water for Tomato Field F1 at 6:00 AM".',
    category: 'AI & Quantum',
  },
  {
    term: 'Simulated Quantum Annealing (SQA)',
    simpleMeaning: 'A smart computer algorithm that copies how quantum physics behaves (using simulated tunneling) to jump through difficult barriers and find the best schedule without getting stuck.',
    example: 'Finds the optimal pumping plan among millions of possibilities in 42 milliseconds.',
    category: 'AI & Quantum',
  },
  {
    term: 'Hamiltonian / Energy Function H(x)',
    simpleMeaning: 'The master score of the schedule. Lower energy means a better schedule with lower power bills, zero water waste, and happy crops.',
    example: 'A schedule with no conflicts and 0 wasted drops gets a low, winning energy score.',
    category: 'AI & Quantum',
  },
  {
    term: 'Prakasam Barrage',
    simpleMeaning: 'A major water barrier built across the Krishna River in Vijayawada that regulates water supply to Guntur and Krishna district canals.',
    example: 'Supplies water to over 1.3 million acres of paddy, cotton, and horticulture.',
    category: 'Andhra Pradesh Context',
  },
  {
    term: 'Sir Arthur Cotton Barrage',
    simpleMeaning: 'A historic barrage across the Godavari River at Dowleswaram (near Rajahmundry) that supplies irrigation to East and West Godavari command areas.',
    example: 'Provides irrigation through eastern and central delta canal networks.',
    category: 'Andhra Pradesh Context',
  },
  {
    term: 'Tail-End Parcel Deficit',
    simpleMeaning: 'The common unfair situation where farms near the start of the canal get plenty of water, but farms at the very end receive barely any.',
    example: 'Our algorithm reserves guaranteed canal flow quotas so tail-end farmers are never left dry.',
    category: 'Andhra Pradesh Context',
  },
  {
    term: 'Off-Peak / Solar Pump Window',
    simpleMeaning: 'The early morning hours (06:00 - 08:00) when sunlight powers solar pumps for free and the air is cool so water doesn’t evaporate quickly.',
    example: 'Watering at 6 AM costs ₹0 electricity and saves hundreds of liters from evaporating in the noon sun.',
    category: 'Irrigation & Water',
  },
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');

  if (!isOpen) return null;

  const filtered = GLOSSARY_ITEMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleMeaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Jargon Buster: Plain English Guide</h3>
              <p className="text-xs text-slate-500">Every technical term explained simply in one sentence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search any term (e.g., QUBO, ET0, Barrage, Deficit)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-xs">
            {['All', 'Irrigation & Water', 'AI & Quantum', 'Andhra Pradesh Context'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1.5 hover:border-cyan-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{item.term}</h4>
                  <span className="text-[10px] font-semibold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.simpleMeaning}
                </p>
                <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 italic">
                  💡 <strong>Example:</strong> {item.example}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching terms found. Try searching for &quot;water&quot; or &quot;QUBO&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Need more details? Switch to <strong>Scientist &amp; Engineer Mode</strong> in the top bar.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
