"""
FastAPI Server for Flash Flood Prediction System (India Live Weather Edition)
Emergency Command Center Backend API & Real-time WebSockets
"""

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from app.config import INDIAN_REGIONS, THRESHOLDS
from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    NodeTelemetry,
    AlertEntry
)
from app.model import evaluate_flash_flood_risk
from app.generator import simulation_engine
from app.weather_service import fetch_live_india_weather

app = FastAPI(
    title="India Hilly Watershed Flash Flood Early Warning System",
    description="Real-Time Live Weather API Integration (Open-Meteo / IMD Satellite Feeds) for Indian Mountain Basins",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "active",
        "system": "India Hilly Watershed Early Warning System API",
        "data_source": "Open-Meteo Weather API / IMD Satellite Model Feeds for India",
        "active_region": simulation_engine.state["active_region"],
        "mode": simulation_engine.state["mode"],
        "available_regions": list(INDIAN_REGIONS.keys())
    }

@app.get("/api/india/regions")
def get_indian_regions():
    """Returns list of preset Indian hilly basins with GPS metadata."""
    return list(INDIAN_REGIONS.values())

@app.get("/api/india/live-weather")
def get_live_weather(
    lat: float = Query(30.7346, description="Latitude in India"),
    lon: float = Query(79.0669, description="Longitude in India")
):
    """
    Queries real-time live weather telemetry (rainfall mm/hr, soil moisture %, temperature °C)
    for ANY location in India via Open-Meteo / IMD feeds.
    """
    return fetch_live_india_weather(lat, lon)

@app.post("/api/predict", response_model=PredictionResponse)
def predict_risk(req: PredictionRequest):
    """Evaluates Flash Flood Risk Tier (Safe, Watch, Warning, Critical)."""
    return evaluate_flash_flood_risk(req)

@app.get("/api/nodes", response_model=List[NodeTelemetry])
def get_nodes_status():
    """Returns current telemetry for nodes in the active Indian region."""
    return simulation_engine.generate_current_nodes_telemetry()

@app.get("/api/telemetry/history")
def get_telemetry_history():
    """Returns historical time-series data."""
    return simulation_engine.history_buffer

@app.get("/api/simulation")
def get_simulation_state():
    """Returns active simulation configuration and selected region."""
    from datetime import datetime
    return {
        "mode": simulation_engine.state.get("mode", "live_india"),
        "active_region": simulation_engine.state.get("active_region", "uttarakhand"),
        "rainfall_intensity": simulation_engine.state["rainfall_intensity"],
        "soil_saturation_override": simulation_engine.state["soil_saturation_override"],
        "active_preset": simulation_engine.state["active_preset"],
        "updated_at": datetime.now().strftime("%H:%M:%S")
    }

@app.post("/api/simulation")
def update_simulation_state(payload: Dict[str, Any]):
    """Adjusts region, mode (live_india / simulation), rain slider, or presets."""
    simulation_engine.update_simulation(
        rainfall_intensity=payload.get("rainfall_intensity"),
        soil_saturation=payload.get("soil_saturation_override"),
        preset=payload.get("active_preset"),
        mode=payload.get("mode"),
        region=payload.get("region")
    )
    return get_simulation_state()

@app.get("/api/alerts", response_model=List[AlertEntry])
def get_alerts():
    """Returns history of threshold breach alert events."""
    return simulation_engine.alerts_history

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            nodes_data = simulation_engine.generate_current_nodes_telemetry()
            history = simulation_engine.history_buffer
            alerts = simulation_engine.alerts_history[:10]
            sim_state = simulation_engine.state
            active_reg = INDIAN_REGIONS.get(sim_state["active_region"], INDIAN_REGIONS["uttarakhand"])

            payload = {
                "type": "TELEMETRY_UPDATE",
                "nodes": [n.model_dump() for n in nodes_data],
                "history": history,
                "alerts": alerts,
                "simulation": sim_state,
                "region_info": {
                    "id": active_reg["id"],
                    "name": active_reg["name"],
                    "state": active_reg["state"],
                    "river": active_reg["river"]
                }
            }
            await websocket.send_json(payload)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)
