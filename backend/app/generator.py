"""
Time-Series Hydrological Telemetry Engine for Indian Hilly Basins
Supports fetching real live weather telemetry from Open-Meteo API / IMD feeds
or running rainstorm simulations.
"""

import time
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.config import INDIAN_REGIONS, THRESHOLDS, DEFAULT_SIMULATION_STATE
from app.schemas import PredictionRequest, NodeTelemetry
from app.model import evaluate_flash_flood_risk
from app.weather_service import fetch_live_india_weather

class SimulationEngine:
    def __init__(self):
        self.state = dict(DEFAULT_SIMULATION_STATE)
        self.alerts_history: List[Dict[str, Any]] = []
        self.history_buffer: List[Dict[str, Any]] = []
        self._init_historical_data()

    def _init_historical_data(self):
        """Generates past telemetry points for historical charts."""
        now = datetime.now()
        for i in range(20, 0, -1):
            t_str = (now - timedelta(minutes=i*3)).strftime("%H:%M")
            sine_val = math.sin(i * 0.3)
            rain = max(3.0, self.state["rainfall_intensity"] + sine_val * 6.0 + random.uniform(-2, 2))
            soil = min(95.0, max(20.0, 48.0 + sine_val * 10.0 + (rain * 0.3)))
            discharge = max(10.0, 32.0 + sine_val * 20.0 + (rain * 1.1))
            level = max(0.8, 1.5 + (discharge / 40.0))
            
            point = {
                "timestamp": t_str,
                "rainfall_mm_hr": round(rain, 1),
                "soil_moisture_pct": round(soil, 1),
                "river_discharge_m3s": round(discharge, 1),
                "water_level_m": round(level, 2)
            }
            self.history_buffer.append(point)

    def set_region(self, region_id: str):
        if region_id in INDIAN_REGIONS:
            self.state["active_region"] = region_id

    def set_mode(self, mode: str):
        if mode in ["live_india", "simulation"]:
            self.state["mode"] = mode

    def update_simulation(self, rainfall_intensity: float = None, soil_saturation: float = None, preset: str = None, mode: str = None, region: str = None):
        if mode:
            self.state["mode"] = mode
        if region and region in INDIAN_REGIONS:
            self.state["active_region"] = region
        if rainfall_intensity is not None:
            self.state["rainfall_intensity"] = rainfall_intensity
            self.state["mode"] = "simulation"
        if soil_saturation is not None:
            self.state["soil_saturation_override"] = soil_saturation
            self.state["mode"] = "simulation"
        if preset:
            self.state["active_preset"] = preset
            if preset == "Live Weather Feed":
                self.state["mode"] = "live_india"
            else:
                self.state["mode"] = "simulation"
                if preset == "Normal Drizzle":
                    self.state["rainfall_intensity"] = 8.0
                    self.state["soil_saturation_override"] = 35.0
                elif preset == "Monsoon Downpour":
                    self.state["rainfall_intensity"] = 42.0
                    self.state["soil_saturation_override"] = 72.0
                elif preset == "Cloudburst Event":
                    self.state["rainfall_intensity"] = 78.0
                    self.state["soil_saturation_override"] = 88.0
                elif preset == "Flash Flood Hazard":
                    self.state["rainfall_intensity"] = 115.0
                    self.state["soil_saturation_override"] = 94.0

    def generate_current_nodes_telemetry(self) -> List[NodeTelemetry]:
        """
        Calculates telemetry for all nodes in the active Indian region.
        In 'live_india' mode, fetches real Open-Meteo weather data per node's GPS coordinates.
        In 'simulation' mode, uses rainstorm intensity slider values.
        """
        nodes_output = []
        region_id = self.state.get("active_region", "uttarakhand")
        region_data = INDIAN_REGIONS.get(region_id, INDIAN_REGIONS["uttarakhand"])
        nodes_def = region_data["nodes"]
        is_live_mode = self.state.get("mode", "live_india") == "live_india"
        now_str = datetime.now().strftime("%H:%M:%S")

        for idx, node in enumerate(nodes_def):
            if is_live_mode:
                # Fetch real live weather from Open-Meteo for this Indian station
                live_weather = fetch_live_india_weather(node["lat"], node["lon"])
                node_rain = live_weather["precipitation_mm_hr"]
                node_soil = live_weather["soil_moisture_pct"]
                base_discharge = live_weather["estimated_discharge_m3s"]
                
                # Flow accumulation factor for downstream nodes
                discharge_factor = 1.0 + (idx * 0.3)
                node_discharge = max(8.0, round(base_discharge * discharge_factor + random.uniform(-2, 2), 1))
                node_water_level = max(0.6, round(1.0 + (node_discharge / 35.0), 2))
            else:
                # Simulation Sandbox mode
                base_rain = self.state["rainfall_intensity"]
                override_soil = self.state["soil_saturation_override"]
                
                altitude_mult = 1.25 if idx == 0 else 0.95
                noise = random.uniform(-1.5, 1.5)
                node_rain = max(0.0, base_rain * altitude_mult + noise)

                if override_soil is not None:
                    node_soil = min(100.0, max(0.0, override_soil + random.uniform(-2, 2)))
                else:
                    node_soil = min(98.0, max(15.0, 42.0 + (node_rain * 0.6) + random.uniform(-3, 3)))

                discharge_factor = 1.0 + (idx * 0.35)
                node_discharge = max(5.0, (node_rain * 1.4 * discharge_factor) + (node_soil * 0.4) + random.uniform(-3, 3))
                node_water_level = max(0.5, round(1.0 + (node_discharge / 32.0), 2))

            # Risk Evaluation
            req = PredictionRequest(
                rainfall_rate=round(node_rain, 1),
                soil_moisture=round(node_soil, 1),
                river_discharge=round(node_discharge, 1),
                water_level=node_water_level,
                slope_angle=node["slope_deg"],
                node_id=node["id"]
            )
            prediction = evaluate_flash_flood_risk(req)

            # Register dynamic alerts
            self._check_and_register_alerts(node, prediction, node_rain, node_soil, node_discharge)

            telemetry = NodeTelemetry(
                node_id=node["id"],
                name=node["name"],
                zone=node["zone"],
                elevation_m=node["elevation_m"],
                slope_deg=node["slope_deg"],
                grid_pos=node["grid_pos"],
                rainfall_mm_hr=round(node_rain, 1),
                soil_moisture_pct=round(node_soil, 1),
                river_discharge_m3s=round(node_discharge, 1),
                water_level_m=node_water_level,
                risk_tier=prediction.risk_tier,
                risk_score=prediction.risk_score,
                timestamp=now_str
            )
            nodes_output.append(telemetry)

        # Update historical time series buffer
        avg_rain = sum(n.rainfall_mm_hr for n in nodes_output) / len(nodes_output)
        avg_soil = sum(n.soil_moisture_pct for n in nodes_output) / len(nodes_output)
        avg_discharge = sum(n.river_discharge_m3s for n in nodes_output) / len(nodes_output)
        avg_level = sum(n.water_level_m for n in nodes_output) / len(nodes_output)

        new_hist_point = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "rainfall_mm_hr": round(avg_rain, 1),
            "soil_moisture_pct": round(avg_soil, 1),
            "river_discharge_m3s": round(avg_discharge, 1),
            "water_level_m": round(avg_level, 2)
        }
        self.history_buffer.append(new_hist_point)
        if len(self.history_buffer) > 25:
            self.history_buffer.pop(0)

        return nodes_output

    def _check_and_register_alerts(self, node: dict, prediction, rain: float, soil: float, discharge: float):
        """Dynamic alert trigger."""
        now_str = datetime.now().strftime("%H:%M:%S")

        if prediction.risk_tier in ["Watch", "Warning", "Critical"]:
            if prediction.risk_tier == "Critical":
                msg = f"CRITICAL HAZARD: {node['name']} recorded severe storm/discharge ({rain:.1f} mm/hr)! Inundation risk."
                param = "Rainfall Rate"
                val = rain
                thresh = THRESHOLDS["rainfall"]["critical"]
                unit = "mm/hr"
            elif prediction.risk_tier == "Warning":
                msg = f"WARNING BREACH: High flood runoff at {node['name']} ({discharge:.1f} m³/s)."
                param = "River Discharge"
                val = discharge
                thresh = THRESHOLDS["discharge"]["warning"]
                unit = "m³/s"
            else:
                msg = f"ELEVATED WATCH: {node['name']} soil moisture saturation at {soil:.1f}%."
                param = "Soil Moisture Saturation"
                val = soil
                thresh = THRESHOLDS["soil_moisture"]["watch"]
                unit = "%"

            already_logged = any(a["node_id"] == node["id"] and a["severity"] == prediction.risk_tier and a["timestamp"] == now_str for a in self.alerts_history)
            if not already_logged:
                alert = {
                    "id": f"alert-{int(time.time()*1000)}-{random.randint(100,999)}",
                    "node_id": node["id"],
                    "node_name": node["name"],
                    "severity": prediction.risk_tier,
                    "parameter": param,
                    "value": round(val, 1),
                    "threshold": thresh,
                    "unit": unit,
                    "message": msg,
                    "timestamp": now_str
                }
                self.alerts_history.insert(0, alert)
                if len(self.alerts_history) > 50:
                    self.alerts_history.pop()

# Global Singleton
simulation_engine = SimulationEngine()
