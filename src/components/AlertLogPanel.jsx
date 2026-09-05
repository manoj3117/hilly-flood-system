import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, Bell, Filter, Trash2, CheckCircle2 } from 'lucide-react';

export default function AlertLogPanel({ alerts }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredAlerts = (alerts || []).filter(alert => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity.toUpperCase() === filterSeverity.toUpperCase();
  });

  const getAlertBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/50 text-red-400 font-bold text-[11px] animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" />
            CRITICAL
          </div>
        );
      case 'Warning':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-950/80 border border-orange-500/50 text-orange-400 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold text-[11px]">
            <Info className="w-3.5 h-3.5" />
            WATCH
          </div>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-950/70 border border-red-800/40 text-red-400">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
              Live Threshold Alert Event Log
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              AUTOMATED RUNOFF & RAINFALL BREACH DETECTOR
            </p>
          </div>
        </div>

        {/* Severity Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono px-2.5 py-1 text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="WATCH">Watch Only</option>
          </select>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 font-mono text-xs text-center border border-dashed border-gray-800/80 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
            <p>No active threshold breach events registered.</p>
            <span className="text-[10px] text-gray-600 mt-1">Adjust rainfall intensity slider to simulate storm hazards.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all text-xs font-mono relative overflow-hidden ${
                alert.severity === 'Critical'
                  ? 'bg-red-950/20 border-red-900/60 text-red-200 hover:border-red-500/60'
                  : alert.severity === 'Warning'
                  ? 'bg-orange-950/20 border-orange-900/60 text-orange-200 hover:border-orange-500/60'
                  : 'bg-amber-950/20 border-amber-900/60 text-amber-200 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getAlertBadge(alert.severity)}
                  <span className="font-bold text-gray-100">{alert.node_name}</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-900/90 px-2 py-0.5 rounded border border-gray-800">
                  {alert.timestamp}
                </span>
              </div>

              <p className="text-gray-300 text-xs mb-2 pl-1 leading-relaxed">
                {alert.message}
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-800/60">
                <span>Trigger: <strong className="text-gray-200">{alert.parameter}</strong></span>
                <span>Measured: <strong className="text-cyan-400">{alert.value} {alert.unit}</strong> (Thresh: {alert.threshold})</span>
              </div>

              {/* Accent Left Bar */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'Warning' ? 'bg-orange-500' : 'bg-amber-500'
                }`}
              ></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
