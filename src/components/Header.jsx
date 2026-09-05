import React, { useState, useEffect } from 'react';
import { ShieldAlert, Volume2, VolumeX, Radio, Mountain, MapPin, CloudSun, RefreshCw } from 'lucide-react';

export default function Header({
  highestRiskTier,
  connectionStatus,
  audioEnabled,
  toggleAudio,
  onRefresh,
  activeRegion,
  onSelectRegion,
  mode
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskBadge = (tier) => {
    switch (tier) {
      case 'Critical':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            CRITICAL FLOOD ALERT
          </span>
        );
      case 'Warning':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            HIGH FLOOD WARNING
          </span>
        );
      case 'Watch':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            ELEVATED WATCH
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            NORMAL OPERATIONS
          </span>
        );
    }
  };

  return (
    <header className="glass-panel sticky top-0 z-40 px-6 py-3 border-b border-gray-800 bg-[#0b0f19]/95">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400 shadow-lg shadow-orange-950/50">
            <Mountain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-wider uppercase bg-gradient-to-r from-orange-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
                INDIA HILLY WATERSHED EARLY WARNING SYSTEM
              </h1>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-orange-950/60 border border-orange-700/50 text-orange-300">
                INDIA LIVE API
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              REAL-TIME IMD / OPEN-METEO HYDRO-METEOROLOGICAL MONITORING
            </p>
          </div>
        </div>

        {/* Controls, Region Selector & Live Source Badge */}
        <div className="flex items-center flex-wrap justify-center lg:justify-end gap-3">
          {/* India Regional Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-900/90 border border-orange-800/50 rounded-xl px-2.5 py-1 text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={activeRegion}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-transparent text-orange-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="uttarakhand" className="bg-gray-900 text-gray-100">Uttarakhand Garhwal Himalaya</option>
              <option value="himachal" className="bg-gray-900 text-gray-100">Himachal Pradesh Beas Basin</option>
              <option value="kerala_gts" className="bg-gray-900 text-gray-100">Western Ghats (Kerala)</option>
              <option value="meghalaya" className="bg-gray-900 text-gray-100">Meghalaya Sohra Plateau</option>
            </select>
          </div>

          {/* Data Source Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
            <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mode === 'live_india' ? 'SOURCE: OPEN-METEO / IMD' : 'MODE: SIMULATION'}</span>
          </div>

          {getRiskBadge(highestRiskTier)}

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${connectionStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-gray-300">
              {connectionStatus === 'connected' ? 'LIVE' : 'POLL'}
            </span>
          </div>

          {/* Audio Siren Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              audioEnabled
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80'
                : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
            }`}
            title={audioEnabled ? "Emergency Sirens Active" : "Emergency Sirens Muted"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            <span className="hidden sm:inline font-mono">{audioEnabled ? 'SIREN ON' : 'MUTED'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
            title="Refresh Telemetry Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Clock */}
          <div className="px-3 py-1 rounded-lg bg-black/60 border border-gray-800 font-mono text-sm text-cyan-400 font-bold tracking-wider">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
}
