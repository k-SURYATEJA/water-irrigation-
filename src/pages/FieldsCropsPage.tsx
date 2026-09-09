import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  Droplets,
  Layers,
  MapPin,
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

export const FieldsCropsPage: React.FC<FieldsCropsPageProps> = ({
  fields,
  onAddField,
  onEditField,
  onDeleteField,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredFields = fields.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'ALL' || f.crop === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600 border border-slate-200">LOW</span>;
    }
  };

  const getMoistureColor = (pct: number) => {
    if (pct < 40) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (pct < 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Agricultural Fields &amp; Crop Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry of Krishna-Godavari command parcels, root-zone moisture, and growth stages.
          </p>
        </div>

        <button
          id="btn-add-field"
          onClick={onAddField}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/10 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Field</span>
        </button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, crop, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Crops ({fields.length})</option>
              <option value="Tomato">Tomato</option>
              <option value="Paddy">Paddy</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Chillies">Chillies</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'cards' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cards View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFields.map((field) => {
            const isDry = field.currentSoilMoisture < 40;
            return (
              <div
                key={field.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center font-bold text-cyan-800 text-sm">
                        {field.id}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{field.name}</h4>
                        <div className="flex items-center text-[11px] text-slate-500 gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[170px]">{field.location}</span>
                        </div>
                      </div>
                    </div>
                    {getPriorityBadge(field.priority)}
                  </div>

                  {/* Crop & Stage tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                      {field.crop}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                      Stage: {field.cropGrowthStage}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-mono bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      {field.areaHectares} ha
                    </span>
                  </div>

                  {/* Soil Moisture Bar */}
                  <div className="space-y-1.5 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                        Soil Moisture
                      </span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] border ${getMoistureColor(field.currentSoilMoisture)}`}>
                        {field.currentSoilMoisture}% {isDry ? '(Critical)' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          field.currentSoilMoisture < 40
                            ? 'bg-rose-500'
                            : field.currentSoilMoisture < 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${field.currentSoilMoisture}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Soil: {field.soilType}</span>
                      <span>ETc: {field.cropWaterRequirementMm} mm/d</span>
                    </div>
                  </div>

                  {/* Infrastructure Links */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-2">
                    <div className="bg-slate-100 px-2 py-1 rounded-md">
                      Canal: <strong className="text-slate-800">{field.canalId}</strong>
                    </div>
                    <div className="bg-slate-100 px-2 py-1 rounded-md">
                      Pump: <strong className="text-slate-800">{field.pumpId}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Last: {field.lastIrrigatedHoursAgo}h ago
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditField(field)}
                      className="p-1 text-slate-400 hover:text-cyan-600 rounded transition-colors"
                      title="Edit Field"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteField(field.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Field ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Moisture</th>
                  <th className="px-4 py-3">Soil Type</th>
                  <th className="px-4 py-3">Canal/Pump</th>
                  <th className="px-4 py-3">Last Irrigated</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{field.id}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{field.location}</td>
                    <td className="px-4 py-3 font-mono">{field.areaHectares} ha</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{field.crop}</td>
                    <td className="px-4 py-3 text-slate-600">{field.cropGrowthStage}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border ${getMoistureColor(field.currentSoilMoisture)}`}>
                        {field.currentSoilMoisture}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{field.soilType}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{field.canalId} / {field.pumpId}</td>
                    <td className="px-4 py-3 text-slate-500">{field.lastIrrigatedHoursAgo}h ago</td>
                    <td className="px-4 py-3">{getPriorityBadge(field.priority)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onEditField(field)}
                        className="text-slate-400 hover:text-cyan-600 p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => onDeleteField(field.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
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
