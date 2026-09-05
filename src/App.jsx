import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SummaryMetrics from './components/SummaryMetrics';
import WatershedMap from './components/WatershedMap';
import TelemetryCharts from './components/TelemetryCharts';
import AlertLogPanel from './components/AlertLogPanel';
import SimulationControls from './components/SimulationControls';
import NodeDetailsModal from './components/NodeDetailsModal';

import {
  fetchNodes,
  fetchHistory,
  fetchAlerts,
  updateSimulation,
  connectTelemetryWebSocket
} from './services/api';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [simulationState, setSimulationState] = useState({
    mode: 'live_india',
    active_region: 'uttarakhand',
    rainfall_intensity: 22.5,
    soil_saturation_override: null
  });
  const [regionInfo, setRegionInfo] = useState({
    id: 'uttarakhand',
    name: 'Uttarakhand Garhwal Himalaya',
    river: 'Mandakini & Alaknanda Rivers'
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const prevCriticalCount = useRef(0);

  const playSirenPulse = (freq = 880) => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio synthesis unavailable", e);
    }
  };

  const loadRestData = async () => {
    try {
      const [nodesData, historyData, alertsData] = await Promise.all([
        fetchNodes(),
        fetchHistory(),
        fetchAlerts()
      ]);
      setNodes(nodesData);
      setHistory(historyData);
      setAlerts(alertsData);
      setConnectionStatus('rest_polling');
    } catch (e) {
      console.error("REST poll error:", e);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    let ws = null;
    let pollInterval = null;

    const setupWs = () => {
      ws = connectTelemetryWebSocket(
        (data) => {
          if (data.type === 'TELEMETRY_UPDATE') {
            setNodes(data.nodes);
            setHistory(data.history);
            setAlerts(data.alerts);
            if (data.simulation) setSimulationState(data.simulation);
            if (data.region_info) setRegionInfo(data.region_info);
            setConnectionStatus('connected');

            const criticals = data.nodes.filter(n => n.risk_tier === 'Critical').length;
            if (criticals > prevCriticalCount.current) {
              playSirenPulse(980);
            }
            prevCriticalCount.current = criticals;
          }
        },
        () => setConnectionStatus('rest_polling'),
        () => setConnectionStatus('rest_polling')
      );
    };

    setupWs();

    pollInterval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        loadRestData();
      }
    }, 3000);

    loadRestData();

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [audioEnabled]);

  const handleUpdateSimulation = async (updateData) => {
    try {
      const updated = await updateSimulation(updateData);
      setSimulationState(updated);
      loadRestData();
    } catch (e) {
      console.error("Failed to update simulation", e);
    }
  };

  const handleSelectRegion = (regionId) => {
    handleUpdateSimulation({
      region: regionId,
      mode: simulationState.mode
    });
  };

  const selectedNode = nodes.find(n => n.node_id === selectedNodeId);

  let highestRiskTier = 'Safe';
  if (nodes.some(n => n.risk_tier === 'Critical')) highestRiskTier = 'Critical';
  else if (nodes.some(n => n.risk_tier === 'Warning')) highestRiskTier = 'Warning';
  else if (nodes.some(n => n.risk_tier === 'Watch')) highestRiskTier = 'Watch';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-orange-500 selection:text-black">
      {/* Top Emergency Header */}
      <Header
        highestRiskTier={highestRiskTier}
        connectionStatus={connectionStatus}
        audioEnabled={audioEnabled}
        toggleAudio={() => setAudioEnabled(!audioEnabled)}
        onRefresh={loadRestData}
        activeRegion={simulationState.active_region}
        onSelectRegion={handleSelectRegion}
        mode={simulationState.mode}
      />

      {/* Main Dashboard Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Top Cards */}
        <SummaryMetrics nodes={nodes} highestRiskTier={highestRiskTier} />

        {/* Row 1: Interactive Watershed Map Grid & Simulation Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-full">
            <WatershedMap
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
              regionInfo={regionInfo}
            />
          </div>

          <div className="lg:col-span-5 h-full">
            <SimulationControls
              simulationState={simulationState}
              onUpdateSimulation={handleUpdateSimulation}
            />
          </div>
        </div>

        {/* Row 2: Real-time Telemetry Line Charts & Alert Log Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-full">
            <TelemetryCharts historyData={history} />
          </div>

          <div className="lg:col-span-5 h-full">
            <AlertLogPanel alerts={alerts} />
          </div>
        </div>
      </main>

      {/* Node Diagnostic Breakdown Modal */}
      {selectedNode && (
        <NodeDetailsModal
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#070a12] py-4 px-6 mt-8 text-center text-xs font-mono text-gray-600 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div>
          <span>INDIA HILLY WATERSHED FLASH FLOOD EARLY WARNING SYSTEM</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-4 text-gray-500">
          <span>FastAPI Engine</span>
          <span>•</span>
          <span>Open-Meteo / IMD Live API</span>
        </div>
      </footer>
    </div>
  );
}
