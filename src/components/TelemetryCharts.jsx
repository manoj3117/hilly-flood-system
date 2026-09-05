import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Activity, CloudRain, Waves, Sliders } from 'lucide-react';

export default function TelemetryCharts({ historyData }) {
  const [activeTab, setActiveTab] = useState('rainfall_soil');

  if (!historyData || historyData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-gray-800 flex items-center justify-center h-full text-gray-500 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Loading Telemetry Time Series...
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col h-full">
      {/* Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-800/40 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
              Real-Time Hydro-Meteorological Telemetry
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              CONTINUOUS WATERSHED TIME SERIES (UPDATES EVERY 2s)
            </p>
          </div>
        </div>

        {/* Chart Selector Tabs */}
        <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('rainfall_soil')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rainfall_soil'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainfall & Soil</span>
          </button>
          <button
            onClick={() => setActiveTab('river_discharge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'river_discharge'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Discharge & Stage</span>
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="flex-1 min-h-[300px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'rainfall_soil' ? (
            <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Rainfall (mm/h)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Soil Moisture (%)', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 10 }} />
              
              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1f2937', borderRadius: '0.75rem', fontSize: '12px', fontFamily: 'monospace' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />

              {/* Critical Warning Threshold Line */}
              <ReferenceLine yAxisId="left" y={65} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'CRITICAL RAIN (65 mm/h)', fill: '#ef4444', fontSize: 9, position: 'top' }} />

              <Area yAxisId="left" type="monotone" dataKey="rainfall_mm_hr" name="Rainfall (mm/h)" fill="url(#rainGrad)" stroke="#06b6d4" strokeWidth={2.5} />
              <Line yAxisId="right" type="monotone" dataKey="soil_moisture_pct" name="Soil Moisture (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
            <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#6366f1" tick={{ fill: '#6366f1', fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Discharge (m³/s)', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#a855f7" tick={{ fill: '#a855f7', fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Water Level Stage (m)', angle: 90, position: 'insideRight', fill: '#a855f7', fontSize: 10 }} />

              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1f2937', borderRadius: '0.75rem', fontSize: '12px', fontFamily: 'monospace' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />

              {/* Critical Discharge Threshold Line */}
              <ReferenceLine yAxisId="left" y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'FLOOD STAGE (140 m³/s)', fill: '#ef4444', fontSize: 9, position: 'top' }} />

              <Area yAxisId="left" type="monotone" dataKey="river_discharge_m3s" name="Discharge (m³/s)" fill="url(#dischargeGrad)" stroke="#6366f1" strokeWidth={2.5} />
              <Line yAxisId="right" type="monotone" dataKey="water_level_m" name="Stage Height (m)" stroke="#a855f7" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
