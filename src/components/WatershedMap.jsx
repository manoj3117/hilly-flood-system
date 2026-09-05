import React from 'react';
import { MapPin, Mountain, Zap } from 'lucide-react';

export default function WatershedMap({ nodes, selectedNodeId, onSelectNode, regionInfo }) {
  const getRiskColor = (tier) => {
    switch (tier) {
      case 'Critical': return { fill: '#ef4444', stroke: '#fca5a5', bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.8)]' };
      case 'Warning':  return { fill: '#f97316', stroke: '#fdba74', bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_16px_rgba(249,115,22,0.7)]' };
      case 'Watch':    return { fill: '#f59e0b', stroke: '#fde047', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]' };
      default:         return { fill: '#10b981', stroke: '#6ee7b7', bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-950/70 border border-orange-800/40 text-orange-400">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
              {regionInfo?.name || "India Hilly Watershed Sensor Topology Grid"}
            </h2>
            <p className="text-[11px] text-orange-300/80 font-mono">
              {regionInfo?.river || "RIVER BASIN TOPOLOGY & ELEVATION MARKERS"}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Watch
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Warning
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span> Critical
          </div>
        </div>
      </div>

      {/* SVG Topological Map Container */}
      <div className="relative flex-1 min-h-[380px] w-full rounded-xl bg-[#090d16] border border-gray-800/80 overflow-hidden group">
        
        {/* Topographic Background Contour Grid SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Elevation Topo Contour Lines */}
          <path d="M -50 80 Q 200 40 500 110 T 1100 90" fill="none" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M -50 180 Q 250 140 600 210 T 1100 170" fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M -50 280 Q 300 240 650 310 T 1100 270" fill="none" stroke="rgba(249, 115, 22, 0.06)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Primary River Flow Paths */}
          <path d="M 25% 20% C 30% 32%, 36% 40%, 48% 55%" fill="none" stroke="url(#riverGrad)" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
          <path d="M 75% 22% C 62% 32%, 52% 40%, 48% 55%" fill="none" stroke="url(#riverGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 48% 55% C 50% 70%, 51% 80%, 52% 90%" fill="none" stroke="url(#riverGrad)" strokeWidth="7" strokeLinecap="round" />

          <circle cx="48%" cy="55%" r="4" fill="#38bdf8" className="animate-ping" />
        </svg>

        {/* Altitude Zone Labels */}
        <div className="absolute left-3 top-3 text-[10px] font-mono text-orange-400/80 border-l-2 border-orange-500/40 pl-2 pointer-events-none">
          <div>UPPER MOUNTAIN CATCHMENT</div>
          <div className="text-[9px] text-gray-400">Headwaters & Glacial Streams</div>
        </div>

        <div className="absolute right-3 bottom-4 text-[10px] font-mono text-cyan-400/80 border-r-2 border-cyan-500/40 pr-2 text-right pointer-events-none">
          <div>VALLEY CONFLUENCE & OUTFLOW</div>
          <div className="text-[9px] text-gray-400">River Basin & Reservoir Outflow</div>
        </div>

        {/* Node Markers Rendered over SVG */}
        {nodes && nodes.map((node) => {
          const colors = getRiskColor(node.risk_tier);
          const isSelected = node.node_id === selectedNodeId;
          const isCritical = node.risk_tier === 'Critical';

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectNode(node.node_id)}
              style={{ left: `${node.grid_pos.x}%`, top: `${node.grid_pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 transform hover:scale-125 ${
                isSelected ? 'scale-125 z-30' : ''
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full ${colors.bg} opacity-40 ${
                  isCritical ? 'animate-ping-slow' : 'animate-pulse'
                }`}
                style={{ margin: '-10px', padding: '10px' }}
              ></div>

              <div
                className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-900 border-2 ${
                  isSelected ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-gray-700'
                } ${colors.glow} shadow-lg`}
              >
                <div
                  className="w-4 h-4 rounded-full transition-all"
                  style={{ backgroundColor: colors.fill }}
                ></div>
                {isCritical && (
                  <Zap className="w-3 h-3 absolute text-white animate-pulse" />
                )}
              </div>

              {/* Tooltip Card */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-950/95 border border-gray-800 rounded-lg px-2.5 py-1.5 shadow-xl text-center pointer-events-none z-30 backdrop-blur-md">
                <div className="text-xs font-bold text-gray-100 flex items-center justify-center gap-1">
                  <span>{node.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono mt-0.5">
                  <span className="text-cyan-400">{node.rainfall_mm_hr} mm/h</span>
                  <span className="text-gray-600">|</span>
                  <span className={colors.text}>{node.risk_tier}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          <span>Click Indian station marker for live GPS & risk analysis.</span>
        </div>
        <span className="text-gray-500">Datum: India WGS84 GPS</span>
      </div>
    </div>
  );
}
