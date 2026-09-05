import React, { useState } from 'react';
import { Sliders, CloudRain, Zap, ShieldAlert, Radio, CloudSun, Flame } from 'lucide-react';

export default function SimulationControls({ simulationState, onUpdateSimulation }) {
  const isLiveMode = simulationState?.mode === 'live_india';
  const [rainfall, setRainfall] = useState(simulationState?.rainfall_intensity || 22.5);
  const [soilMoisture, setSoilMoisture] = useState(simulationState?.soil_saturation_override || 50);

  const toggleMode = (newMode) => {
    onUpdateSimulation({
      mode: newMode,
      active_preset: newMode === 'live_india' ? 'Live Weather Feed' : 'Monsoon Downpour'
    });
  };

  const handleRainfallChange = (e) => {
    const val = parseFloat(e.target.value);
    setRainfall(val);
    onUpdateSimulation({
      mode: 'simulation',
      rainfall_intensity: val,
      soil_saturation_override: soilMoisture
    });
  };

  const applyPreset = (presetName) => {
    let rainVal = 8.0;
    let soilVal = 35.0;
    if (presetName === "Live Weather Feed") {
      toggleMode('live_india');
      return;
    } else if (presetName === "Normal Drizzle") {
      rainVal = 8.0; soilVal = 35.0;
    } else if (presetName === "Monsoon Downpour") {
      rainVal = 42.0; soilVal = 72.0;
    } else if (presetName === "Cloudburst Event") {
      rainVal = 78.0; soilVal = 88.0;
    } else if (presetName === "Flash Flood Hazard") {
      rainVal = 115.0; soilVal = 95.0;
    }

    setRainfall(rainVal);
    setSoilMoisture(soilVal);
    onUpdateSimulation({
      mode: 'simulation',
      rainfall_intensity: rainVal,
      soil_saturation_override: soilVal,
      active_preset: presetName
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-orange-900/40 flex flex-col h-full bg-gradient-to-b from-[#0f172a]/90 to-[#0b0f19]/90">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-950/80 border border-orange-700/50 text-orange-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
              India Weather & Simulation Controller
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              TOGGLE LIVE IMD FEED OR SIMULATION
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector Toggle Switch */}
      <div className="mb-5 bg-gray-950/90 p-1.5 rounded-xl border border-gray-800 flex items-center justify-between gap-1">
        <button
          onClick={() => toggleMode('live_india')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            isLiveMode
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60 shadow-lg'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CloudSun className="w-4 h-4 text-cyan-400" />
          <span>LIVE INDIA WEATHER</span>
        </button>

        <button
          onClick={() => toggleMode('simulation')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            !isLiveMode
              ? 'bg-orange-950 text-orange-300 border border-orange-600/60 shadow-lg'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>STORM SIMULATOR</span>
        </button>
      </div>

      {/* Scenario Presets */}
      <div className="mb-5">
        <label className="text-[11px] font-mono text-gray-400 block mb-2">
          QUICK SCENARIO PRESETS:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset("Live Weather Feed")}
            className={`px-2 py-2 rounded-xl border text-xs font-mono transition-all text-center flex flex-col items-center gap-1 ${
              isLiveMode
                ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-gray-900/90 border-gray-800 text-gray-400 hover:border-cyan-500/50'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Live IMD Feed</span>
            <span className="text-[9px] text-cyan-400/80">Real API</span>
          </button>

          <button
            onClick={() => applyPreset("Monsoon Downpour")}
            className="px-2 py-2 rounded-xl bg-gray-900/90 border border-amber-900/50 text-amber-300 text-xs font-mono hover:bg-amber-950/60 hover:border-amber-500 transition-all text-center flex flex-col items-center gap-1"
          >
            <CloudRain className="w-4 h-4 text-amber-400" />
            <span>Monsoon</span>
            <span className="text-[9px] text-gray-500">42 mm/h</span>
          </button>

          <button
            onClick={() => applyPreset("Cloudburst Event")}
            className="px-2 py-2 rounded-xl bg-gray-900/90 border border-orange-900/50 text-orange-300 text-xs font-mono hover:bg-orange-950/60 hover:border-orange-500 transition-all text-center flex flex-col items-center gap-1"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Cloudburst</span>
            <span className="text-[9px] text-gray-500">78 mm/h</span>
          </button>

          <button
            onClick={() => applyPreset("Flash Flood Hazard")}
            className="px-2 py-2 rounded-xl bg-gray-900/90 border border-red-900/50 text-red-300 text-xs font-mono hover:bg-red-950/60 hover:border-red-500 transition-all text-center flex flex-col items-center gap-1"
          >
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Flash Flood</span>
            <span className="text-[9px] text-gray-500">115 mm/h</span>
          </button>
        </div>
      </div>

      {/* Main Slider: Rainfall Intensity (Active in Simulation mode) */}
      <div className={`p-4 rounded-xl border transition-all ${
        isLiveMode
          ? 'bg-gray-950/40 border-gray-800/40 opacity-60'
          : 'bg-gray-950/80 border-gray-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            SIMULATED RAINFALL SLIDER:
          </label>
          <span className="text-xl font-black font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-800/60">
            {rainfall.toFixed(1)} <span className="text-xs text-gray-400 font-normal">mm/hr</span>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="130"
          step="1"
          disabled={isLiveMode}
          value={rainfall}
          onChange={handleRainfallChange}
          className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all disabled:opacity-40"
        />

        <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
          <span>0 (Clear)</span>
          <span>15 (Watch)</span>
          <span>35 (Warning)</span>
          <span>65 (Critical Cloudburst)</span>
          <span>130 (Catastrophic)</span>
        </div>
      </div>
    </div>
  );
}
