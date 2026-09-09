import React, { useState, useEffect } from 'react';
import { X, Sprout, Save } from 'lucide-react';
import { Field, PriorityLevel } from '../types.js';

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Field) => Promise<void>;
  initialField?: Field | null;
}

export const FieldModal: React.FC<FieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialField,
}) => {
  const [formData, setFormData] = useState<Field>({
    id: '',
    name: '',
    location: 'Zone A - Krishna Delta North',
    zone: 'Zone A',
    areaHectares: 2.0,
    crop: 'Tomato',
    cropGrowthStage: 'Flowering',
    cropWaterRequirementMm: 5.5,
    currentSoilMoisture: 45,
    soilType: 'Red Sandy',
    lastIrrigatedHoursAgo: 48,
    priority: 'HIGH',
    canalId: 'C1',
    pumpId: 'P1',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialField) {
      setFormData(initialField);
    } else {
      setFormData({
        id: `F${Math.floor(Math.random() * 900) + 10}`,
        name: 'New Command Field',
        location: 'Zone A - Krishna Delta North',
        zone: 'Zone A',
        areaHectares: 2.5,
        crop: 'Tomato',
        cropGrowthStage: 'Vegetative',
        cropWaterRequirementMm: 5.8,
        currentSoilMoisture: 42,
        soilType: 'Alluvial',
        lastIrrigatedHoursAgo: 50,
        priority: 'MEDIUM',
        canalId: 'C1',
        pumpId: 'P1',
      });
    }
  }, [initialField, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {initialField ? `Edit Field ${initialField.id}` : 'Add New Agricultural Field'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field ID</label>
              <input
                type="text"
                required
                disabled={Boolean(initialField)}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="Tomato">Tomato</option>
                <option value="Paddy">Paddy</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize</option>
                <option value="Chillies">Chillies</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
              <select
                value={formData.cropGrowthStage}
                onChange={(e) => setFormData({ ...formData, cropGrowthStage: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="Initial">Initial (Seedling)</option>
                <option value="Vegetative">Vegetative (Active Foliage)</option>
                <option value="Flowering">Flowering (Critical Water Peak)</option>
                <option value="Yield Formation">Yield Formation (Fruiting)</option>
                <option value="Ripening">Ripening (Maturation)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Area (Hectares)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="25"
                required
                value={formData.areaHectares}
                onChange={(e) => setFormData({ ...formData, areaHectares: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Moisture (%)</label>
              <input
                type="number"
                min="10"
                max="95"
                required
                value={formData.currentSoilMoisture}
                onChange={(e) => setFormData({ ...formData, currentSoilMoisture: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="HIGH">HIGH (Urgent)</option>
                <option value="MEDIUM">MEDIUM (Standard)</option>
                <option value="LOW">LOW (Can Delay)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Basin Zone</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="Red Sandy">Red Sandy (Fast Drainage)</option>
                <option value="Clay Loam">Clay Loam (High Retention)</option>
                <option value="Black Cotton">Black Cotton (Deep Cracking)</option>
                <option value="Alluvial">Alluvial (Delta Fertile)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Connected Canal</label>
              <select
                value={formData.canalId}
                onChange={(e) => setFormData({ ...formData, canalId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="C1">Canal 1 - Krishna Main Canal (3,500 L/d)</option>
                <option value="C2">Canal 2 - Godavari Eastern Canal (2,500 L/d)</option>
                <option value="C3">Canal 3 - Rayanapadu Distributary (1,500 L/d)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pumping Station</label>
              <select
                value={formData.pumpId}
                onChange={(e) => setFormData({ ...formData, pumpId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="P1">Pump P1 - Solar Submersible (₹12/h)</option>
                <option value="P2">Pump P2 - High-Head Electric Grid (₹32/h)</option>
                <option value="P3">Pump P3 - Auxiliary Diesel (₹48/h)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-md transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Field'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
