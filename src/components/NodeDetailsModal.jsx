import React, { useState } from 'react';
import { X, Mountain, ShieldAlert, MapPin, ArrowRight } from 'lucide-react';
import { predictRisk } from '../services/api';

export default function NodeDetailsModal({ node, onClose }) {
  if (!node) return null;

  const [testRain, setTestRain] = useState(node.rainfall_mm_hr);
  const [testSoil, setTestSoil] = useState(node.soil_moisture_pct);
  const [testDischarge, setTestDischarge] = useState(node.river_discharge_m3s);
  const [customPrediction, setCustomPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleRunPredict = async () => {
    setIsPredicting(true);
    try {
      const res = await predictRisk({
        rainfall_rate: parseFloat(testRain),
        soil_moisture: parseFloat(testSoil),
        river_discharge: parseFloat(testDischarge),
        slope_angle: node.slope_deg,
        node_id: node.node_id
      });
      setCustomPrediction(res);
    } catch (e) {
      console.error("Prediction failed", e);
    } finally {
      setIsPredicting(false);
    }
  };

  const currentTier = customPrediction ? customPrediction.risk_tier : node.risk_tier;
  const currentScore = customPrediction ? customPrediction.risk_score : node.risk_score;

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Warning':  return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Watch':    return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:         return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-gray-700 bg-[#0d1322] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-950/80 border border-orange-700/50 text-orange-400">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-100">{node.name}</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierColor(currentTier)}`}>
                  {currentTier.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                {node.zone} • Elevation: {node.elevation_m}m • Slope: {node.slope_deg}°
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-400 block mb-1">RAINFALL</span>
              <span className="text-lg font-black font-mono text-cyan-400">{node.rainfall_mm_hr}</span>
              <span className="text-[10px] text-gray-500 font-mono block">mm/hr</span>
            </div>

            <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-400 block mb-1">SOIL SATURATION</span>
              <span className="text-lg font-black font-mono text-blue-400">{node.soil_moisture_pct}%</span>
              <span className="text-[10px] text-gray-500 font-mono block">capacity</span>
            </div>

            <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-400 block mb-1">RIVER DISCHARGE</span>
              <span className="text-lg font-black font-mono text-indigo-400">{node.river_discharge_m3s}</span>
              <span className="text-[10px] text-gray-500 font-mono block">m³/s</span>
            </div>

            <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-400 block mb-1">RISK INDEX</span>
              <span className="text-lg font-black font-mono text-purple-400">{currentScore} / 100</span>
              <span className="text-[10px] text-gray-500 font-mono block">composite</span>
            </div>
          </div>

          {/* Prediction Sandbox */}
          <div className="bg-gray-950/70 p-4 rounded-xl border border-cyan-950">
            <h4 className="text-xs font-mono font-bold text-cyan-300 mb-3 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Node Risk Prediction Sandbox (/api/predict)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-1">Rainfall (mm/h)</label>
                <input
                  type="number"
                  value={testRain}
                  onChange={(e) => setTestRain(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-1">Soil Saturation (%)</label>
                <input
                  type="number"
                  value={testSoil}
                  onChange={(e) => setTestSoil(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-blue-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-1">Discharge (m³/s)</label>
                <input
                  type="number"
                  value={testDischarge}
                  onChange={(e) => setTestDischarge(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunPredict}
              disabled={isPredicting}
              className="w-full py-2 px-4 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-all flex items-center justify-center gap-2"
            >
              {isPredicting ? "Evaluating ML Risk Model..." : "Run Risk Evaluation Model (/api/predict)"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recommendations Output */}
          {customPrediction && (
            <div className="bg-gray-950/90 p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">Primary Threat:</span>
                <span className="font-bold text-amber-400">{customPrediction.primary_threat}</span>
              </div>

              <div className="text-[11px] font-mono text-gray-400 space-y-1">
                <span className="font-bold text-gray-300 block mb-1">Emergency Mitigation Protocols:</span>
                {customPrediction.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-gray-900/60 p-2 rounded border border-gray-800/60">
                    <span className="text-gray-200">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
