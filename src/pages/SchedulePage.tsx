import React, { useState } from 'react';
import {
  CalendarClock,
  Droplets,
  Zap,
  Filter,
  Download,
  Sun,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ScheduleItem } from '../types.js';
import { useViewMode } from '../context/ViewModeContext.js';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  onExportCsv: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  schedule,
  onExportCsv,
}) => {
  const { isSimple } = useViewMode();
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'Irrigate' | 'Delay'>('ALL');
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');

  const filteredSchedule = schedule.filter((item) => {
    const matchesDecision = filterDecision === 'ALL' || item.decision === filterDecision;
    const matchesSlot = selectedSlot === 'ALL' || item.timeSlot === selectedSlot;
    return matchesDecision && matchesSlot;
  });

  const slots = [
    { time: '06:00 - 08:00', label: 'Solar Window', type: 'solar', badge: '100% Solar' },
    { time: '08:00 - 10:00', label: 'Morning Slot', type: 'morning', badge: 'Off-Peak' },
    { time: '10:00 - 12:00', label: 'Standard Slot', type: 'standard', badge: 'Standard' },
    { time: '16:00 - 18:00', label: 'Evening Slot', type: 'evening', badge: 'Off-Peak' },
  ];

  const irrigateItems = schedule.filter((s) => s.decision === 'Irrigate');
  const totalWater = irrigateItems.reduce((acc, s) => acc + s.waterLiters, 0);
  const totalCost = irrigateItems.reduce((acc, s) => acc + s.energyCost, 0);
  const totalCO2 = irrigateItems.reduce((acc, s) => acc + s.co2Grams, 0);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">MED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">LOW</span>;
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-cyan-600" />
            {isSimple ? "Today's Irrigation Plan & Timetable" : 'Optimized Irrigation Schedule & Dispatch Timeline'}
          </h2>
          <p className="text-xs text-slate-500">
            {isSimple
              ? 'Hour-by-hour pumping plan matching crops to solar windows and low-tariff hours.'
              : 'Quantum QUBO solution mapping parcel water demands to optimal conveyance time slots.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-schedule"
            onClick={onExportCsv}
            disabled={schedule.length === 0}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Time Slot Dispatch Visualizer Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const itemsInSlot = schedule.filter((s) => s.timeSlot === slot.time && s.decision === 'Irrigate');
          const totalSlotWater = itemsInSlot.reduce((sum, s) => sum + s.waterLiters, 0);
          const isSelected = selectedSlot === slot.time;

          return (
            <div
              key={slot.time}
              onClick={() => setSelectedSlot(isSelected ? 'ALL' : slot.time)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-cyan-50/90 border-cyan-500 ring-2 ring-cyan-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                  {slot.type === 'solar' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  {slot.time}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  slot.type === 'solar'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-cyan-100 text-cyan-800'
                }`}>
                  {slot.badge}
                </span>
              </div>

              <div className="text-base font-bold text-slate-900 font-mono">
                {totalSlotWater.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
              </div>

              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>
                  {itemsInSlot.length > 0 ? (
                    <span>Fields: <strong className="text-cyan-700">{itemsInSlot.map((i) => i.fieldId).join(', ')}</strong></span>
                  ) : (
                    <span className="text-slate-400 italic">No fields</span>
                  )}
                </span>
                {itemsInSlot.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    {itemsInSlot.length} active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'Irrigate', 'Delay'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterDecision(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filterDecision === mode
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode}
              </button>
            ))}
          </div>
        </div>

        {selectedSlot !== 'ALL' && (
          <div className="flex items-center gap-2 text-xs text-cyan-700 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
            <span>Slot: <strong>{selectedSlot}</strong></span>
            <button
              onClick={() => setSelectedSlot('ALL')}
              className="text-cyan-900 hover:underline font-semibold ml-1"
            >
              Clear
            </button>
          </div>
        )}

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredSchedule.length} of {schedule.length} parcels
        </div>
      </div>

      {/* Main Schedule Table */}
      {schedule.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-3.5 py-2.5">Time Slot</th>
                  <th className="px-3.5 py-2.5">Field</th>
                  <th className="px-3.5 py-2.5">Crop</th>
                  <th className="px-3.5 py-2.5">Water Allocated</th>
                  <th className="px-3.5 py-2.5">Canal</th>
                  <th className="px-3.5 py-2.5">Pump</th>
                  <th className="px-3.5 py-2.5">Priority</th>
                  <th className="px-3.5 py-2.5">Decision</th>
                  <th className="px-3.5 py-2.5">Reason</th>
                  <th className="px-3.5 py-2.5 text-right">Cost / CO2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedule.map((item) => {
                  const isIrrigate = item.decision === 'Irrigate';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isIrrigate
                          ? 'hover:bg-slate-50/80 border-l-4 border-emerald-500'
                          : 'bg-slate-50/40 text-slate-400 hover:bg-slate-50 border-l-4 border-slate-300'
                      }`}
                    >
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-800">
                        {item.timeSlot !== '�' ? item.timeSlot : <span className="text-slate-400 font-normal">�</span>}
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-[10px]">
                            {item.fieldId}
                          </span>
                          <span className="font-normal text-slate-600 text-xs truncate max-w-[100px]">
                            {item.fieldName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-emerald-700">{item.crop}</td>
                      <td className="px-3.5 py-2.5 font-mono">
                        {isIrrigate ? (
                          <span className="font-bold text-slate-900">
                            {item.waterLiters.toLocaleString()} L
                          </span>
                        ) : (
                          <span className="text-slate-400">0 L</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600">{item.canalName}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{item.pumpName}</td>
                      <td className="px-3.5 py-2.5">{getPriorityBadge(item.priority)}</td>
                      <td className="px-3.5 py-2.5">
                        {isIrrigate ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Irrigate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                            Delay
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                        {item.reason}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">
                        {isIrrigate ? (
                          <div>
                            <div className="font-bold text-purple-700">?{item.energyCost}</div>
                            <div className="text-[10px] text-slate-400">{item.co2Grams}g CO2</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">?0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Sticky Totals Footer */}
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-semibold text-slate-800">
                <tr>
                  <td className="px-3.5 py-2.5 font-mono text-xs uppercase" colSpan={3}>
                    Total Summary ({irrigateItems.length} irrigated, {schedule.length - irrigateItems.length} delayed)
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-700 text-xs">
                    {totalWater.toLocaleString()} L
                  </td>
                  <td colSpan={5}></td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-purple-700 text-xs">
                    ?{totalCost.toLocaleString()} ({totalCO2.toLocaleString()}g)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Irrigation Schedule Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Run the quantum-inspired optimizer to generate an hourly dispatch plan calibrated to real-world dataset segments.
          </p>
        </div>
      )}
    </div>
  );
};
