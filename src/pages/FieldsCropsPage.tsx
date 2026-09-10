import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  Droplets,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { Field, PriorityLevel } from '../types.js';

interface FieldsCropsPageProps {
  fields: Field[];
  onAddField: () => void;
  onEditField: (field: Field) => void;
  onDeleteField: (id: string) => Promise<void>;
}

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  HIGH:   'bg-rose-50  text-rose-700  border-rose-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW:    'bg-slate-100 text-slate-600 border-slate-200',
};

const moistureStyle = (pct: number) =>
  pct < 40  ? 'text-rose-600   bg-rose-50   border-rose-200'
: pct < 60  ? 'text-amber-600  bg-amber-50  border-amber-200'
:             'text-emerald-600 bg-emerald-50 border-emerald-200';

const moistureBarColor = (pct: number) =>
  pct < 40 ? 'bg-rose-500' : pct < 60 ? 'bg-amber-500' : 'bg-emerald-500';

const DepletionBadge: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct < 40) return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-200">Severe</span>;
  if (pct < 60) return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-700 border border-amber-200">Moderate</span>;
  return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 border border-emerald-200">Optimal</span>;
};

const CROP_OPTIONS = ['Tomato','Paddy','Groundnut','Cotton','Maize','Chillies'];

export const FieldsCropsPage: React.FC<FieldsCropsPageProps> = ({
  fields,
  onAddField,
  onEditField,
  onDeleteField,
}) => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [viewMode, setViewMode]         = useState<'cards' | 'table'>('cards');

  const filtered = fields.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      f.name.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.crop.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q);
    return matchSearch && (selectedCrop === 'ALL' || f.crop === selectedCrop);
  });

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Fields &amp; Crops</h2>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
            {filtered.length}/{fields.length}
          </span>
        </div>
        <button
          id="btn-add-field"
          onClick={onAddField}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow shadow-emerald-900/10 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Field
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-0 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ID, crop, zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Crops ({fields.length})</option>
            {CROP_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg ml-auto">
          {(['cards','table'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === m ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m === 'cards' ? 'Cards' : 'Table'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards View ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((field) => (
            <div
              key={field.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center font-bold text-cyan-800 text-xs shrink-0">
                    {field.id}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm leading-snug truncate">{field.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{field.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => onEditField(field)} className="p-1 text-slate-400 hover:text-cyan-600 rounded transition-colors" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDeleteField(field.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">{field.crop}</span>
                <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded border border-slate-200">{field.cropGrowthStage}</span>
                <span className="px-2 py-0.5 text-[11px] font-mono bg-blue-50 text-blue-700 rounded border border-blue-200">{field.areaHectares} ha</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${PRIORITY_STYLES[field.priority]}`}>{field.priority}</span>
              </div>

              {/* Soil Moisture */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    Soil Moisture
                  </span>
                  <div className="flex items-center gap-1">
                    <DepletionBadge pct={field.currentSoilMoisture} />
                    <span className={`font-bold font-mono text-[11px] px-1.5 py-0.5 rounded border ${moistureStyle(field.currentSoilMoisture)}`}>
                      {field.currentSoilMoisture}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${moistureBarColor(field.currentSoilMoisture)}`}
                    style={{ width: `${field.currentSoilMoisture}%` }}
                  />
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                  <span className="text-slate-400">Soil</span>{' '}
                  <strong className="text-slate-700">{field.soilType}</strong>
                </div>
                <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                  <span className="text-slate-400">ETc</span>{' '}
                  <strong className="text-slate-700 font-mono">{field.cropWaterRequirementMm} mm/d</strong>
                </div>
                <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                  <span className="text-slate-400">Canal</span>{' '}
                  <strong className="text-slate-700">{field.canalId}</strong>
                </div>
                <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-500">{field.lastIrrigatedHoursAgo}h ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
                <tr>
                  {['ID','Name','Crop','Area','Stage','Moisture','Soil','Canal/Pump','Last Irrig.','Priority',''].map((h) => (
                    <th key={h} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-900 font-mono">{field.id}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 max-w-[130px] truncate">{field.name}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{field.crop}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{field.areaHectares} ha</td>
                    <td className="px-3 py-2 text-slate-500">{field.cropGrowthStage}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${moistureBarColor(field.currentSoilMoisture)}`} style={{ width: `${field.currentSoilMoisture}%` }} />
                        </div>
                        <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${moistureStyle(field.currentSoilMoisture)}`}>
                          {field.currentSoilMoisture}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-500">{field.soilType}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{field.canalId}/{field.pumpId}</td>
                    <td className="px-3 py-2 text-slate-400">{field.lastIrrigatedHoursAgo}h ago</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${PRIORITY_STYLES[field.priority]}`}>
                        {field.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <button onClick={() => onEditField(field)} className="text-slate-400 hover:text-cyan-600 p-1 rounded">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDeleteField(field.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
