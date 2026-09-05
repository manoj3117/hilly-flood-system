/**
 * API & WebSocket Service Layer for India Flash Flood Early Warning System
 */

const API_BASE = "/api";

export async function fetchIndianRegions() {
  const res = await fetch(`${API_BASE}/india/regions`);
  if (!res.ok) throw new Error("Failed to fetch Indian regions");
  return res.json();
}

export async function fetchLiveWeather(lat, lon) {
  const res = await fetch(`${API_BASE}/india/live-weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch live weather");
  return res.json();
}

export async function fetchNodes() {
  const res = await fetch(`${API_BASE}/nodes`);
  if (!res.ok) throw new Error("Failed to fetch node telemetry");
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/telemetry/history`);
  if (!res.ok) throw new Error("Failed to fetch telemetry history");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alert logs");
  return res.json();
}

export async function updateSimulation(data) {
  const res = await fetch(`${API_BASE}/simulation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update simulation configuration");
  return res.json();
}

export async function predictRisk(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Risk prediction request failed");
  return res.json();
}

export function connectTelemetryWebSocket(onMessage, onError, onClose) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
  
  let socket = null;
  try {
    socket = new WebSocket(wsUrl);
  } catch (err) {
    if (onError) onError(err);
    return null;
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (e) {
      console.error("Failed to parse WebSocket message", e);
    }
  };

  socket.onerror = (err) => {
    console.warn("WebSocket connection error:", err);
    if (onError) onError(err);
  };

  socket.onclose = () => {
    if (onClose) onClose();
  };

  return socket;
}
