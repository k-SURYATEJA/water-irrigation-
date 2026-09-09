import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Check,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertSeverity } from '../types.js';

interface AlertsPageProps {
  alerts: Alert[];
  onAcknowledge: (id?: string) => Promise<void>;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAcknowledge,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-cyan-600 shrink-0" />;
    }
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">WARNING</span>;
      case 'INFO':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-100 text-cyan-800">INFO</span>;
    }
  };

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Operational Alerts &amp; Hydraulic Warnings
          </h2>
          <p className="text-xs text-slate-500">
            Automated notifications for root-zone moisture deficits, canal bottlenecks, and weather-triggered irrigation delays.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="btn-ack-all-alerts"
            onClick={() => onAcknowledge()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Acknowledge All ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Severity Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Severity:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filterSeverity === sev
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredAlerts.length} of {alerts.length} notifications
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                alert.acknowledged
                  ? 'bg-slate-50/60 border-slate-200 text-slate-500'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-50/60 border-rose-200 shadow-xs'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                  : 'bg-cyan-50/60 border-cyan-200 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                    {getSeverityBadge(alert.severity)}
                    {alert.fieldId && (
                      <span className="text-[10px] font-mono font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {alert.fieldId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                  <div className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</div>
                </div>
              </div>

              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-xs transition-colors shrink-0 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Alerts in this Category</h4>
            <p className="text-xs text-slate-500">All command parcels and canal conveyance networks are operating normally.</p>
          </div>
        )}
      </div>
    </div>
  );
};
