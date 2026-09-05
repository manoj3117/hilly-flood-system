import React from 'react';
import { CloudRain, Droplets, Waves, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function SummaryMetrics({ nodes, highestRiskTier }) {
  if (!nodes || nodes.length === 0) return null;

  const maxRain = Math.max(...nodes.map(n => n.rainfall_mm_hr));
  const maxSoil = Math.max(...nodes.map(n => n.soil_moisture_pct));
  const maxDischarge = Math.max(...nodes.map(n => n.river_discharge_m3s));
  const criticalCount = nodes.filter(n => n.risk_tier === 'Critical').length;
  const warningCount = nodes.filter(n => n.risk_tier === 'Warning').length;

  // Estimated lead time based on highest risk node
  let leadTimeText = "Safe (> 3 hrs)";
  if (criticalCount > 0) {
    leadTimeText = "⚡ 15 - 30 Mins (CRITICAL)";
  } else if (warningCount > 0) {
    leadTimeText = "⚠️ 45 - 60 Mins";
  } else if (nodes.some(n => n.risk_tier === 'Watch')) {
    leadTimeText = "ℹ️ 90 - 120 Mins";
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* Metric 1: Peak Rainfall */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-900/40 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-gray-400 text-xs font-mono mb-2">
          <span>PEAK RAINFALL</span>
          <CloudRain className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono tracking-tight text-cyan-300">
            {maxRain.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 font-mono">mm/hr</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-500 flex justify-between">
          <span>Threshold: 65 mm/h</span>
          <span className={maxRain >= 65 ? 'text-red-400 font-bold' : maxRain >= 35 ? 'text-orange-400' : 'text-emerald-400'}>
            {maxRain >= 65 ? 'EXTREME' : maxRain >= 35 ? 'HEAVY' : 'NORMAL'}
          </span>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
      </div>

      {/* Metric 2: Max Soil Saturation */}
      <div className="glass-panel p-4 rounded-xl border border-blue-900/40 relative overflow-hidden group hover:border-blue-500/50 transition-all">
        <div className="flex items-center justify-between text-gray-400 text-xs font-mono mb-2">
          <span>SOIL MOISTURE</span>
          <Droplets className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono tracking-tight text-blue-300">
            {maxSoil.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 font-mono">saturated</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-500 flex justify-between">
          <span>Capacity: 85%</span>
          <span className={maxSoil >= 85 ? 'text-red-400 font-bold' : maxSoil >= 70 ? 'text-amber-400' : 'text-emerald-400'}>
            {maxSoil >= 85 ? 'SATURATED' : maxSoil >= 70 ? 'ELEVATED' : 'STABLE'}
          </span>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
      </div>

      {/* Metric 3: Peak River Discharge */}
      <div className="glass-panel p-4 rounded-xl border border-indigo-900/40 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div className="flex items-center justify-between text-gray-400 text-xs font-mono mb-2">
          <span>RIVER DISCHARGE</span>
          <Waves className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono tracking-tight text-indigo-300">
            {maxDischarge.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 font-mono">m³/s</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-500 flex justify-between">
          <span>Flood Stage: 140</span>
          <span className={maxDischarge >= 140 ? 'text-red-400 font-bold' : maxDischarge >= 85 ? 'text-orange-400' : 'text-emerald-400'}>
            {maxDischarge >= 140 ? 'SPILLOVER' : maxDischarge >= 85 ? 'HIGH' : 'SAFE'}
          </span>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      </div>

      {/* Metric 4: Est. Lead Time */}
      <div className="glass-panel p-4 rounded-xl border border-purple-900/40 relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between text-gray-400 text-xs font-mono mb-2">
          <span>EST. FLOOD LEAD TIME</span>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-base font-bold font-mono tracking-tight text-purple-200 mt-1">
          {leadTimeText}
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-500 flex justify-between">
          <span>Time to valley peak</span>
          <span className="text-purple-400 font-bold">HYDROGRAPH</span>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
      </div>

      {/* Metric 5: Active Node Health */}
      <div className="glass-panel p-4 rounded-xl border border-emerald-900/40 relative overflow-hidden group hover:border-emerald-500/50 transition-all col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-gray-400 text-xs font-mono mb-2">
          <span>SENSOR NETWORK</span>
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono tracking-tight text-emerald-300">
            {nodes.length} / {nodes.length}
          </span>
          <span className="text-xs text-gray-400 font-mono">ONLINE</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-400 flex items-center justify-between">
          <span className="text-red-400 font-bold">{criticalCount} Critical</span>
          <span className="text-orange-400 font-bold">{warningCount} Warning</span>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      </div>
    </div>
  );
}
