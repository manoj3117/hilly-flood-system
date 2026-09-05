"""
Pydantic Schema Models for API Requests, Responses, and Telemetry Data
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PredictionRequest(BaseModel):
    rainfall_rate: float = Field(..., description="Current rainfall intensity in mm/hr", ge=0.0, le=300.0)
    soil_moisture: float = Field(..., description="Soil moisture saturation %", ge=0.0, le=100.0)
    river_discharge: float = Field(..., description="River discharge rate in m3/s", ge=0.0, le=1000.0)
    water_level: Optional[float] = Field(default=2.5, description="Current river stage height in meters")
    slope_angle: Optional[float] = Field(default=25.0, description="Average terrain slope in degrees")
    node_id: Optional[str] = Field(default="custom", description="Target sensor node ID")

class RiskFactorBreakdown(BaseModel):
    rainfall_contribution: float
    soil_saturation_contribution: float
    discharge_contribution: float
    slope_amplification: float

class PredictionResponse(BaseModel):
    node_id: str
    risk_tier: str  # Safe, Watch, Warning, Critical
    risk_score: float  # 0 to 100
    lead_time_minutes: int
    primary_threat: str
    recommendations: List[str]
    factors: RiskFactorBreakdown
    timestamp: str

class NodeTelemetry(BaseModel):
    node_id: str
    name: str
    zone: str
    elevation_m: int
    slope_deg: float
    grid_pos: Dict[str, float]
    rainfall_mm_hr: float
    soil_moisture_pct: float
    river_discharge_m3s: float
    water_level_m: float
    risk_tier: str
    risk_score: float
    timestamp: str

class TelemetryHistoryPoint(BaseModel):
    timestamp: str
    rainfall_mm_hr: float
    soil_moisture_pct: float
    river_discharge_m3s: float
    water_level_m: float

class SimulationUpdateRequest(BaseModel):
    rainfall_intensity: Optional[float] = Field(None, ge=0.0, le=250.0)
    soil_saturation_override: Optional[float] = Field(None, ge=0.0, le=100.0)
    active_preset: Optional[str] = None

class SimulationStateResponse(BaseModel):
    rainfall_intensity: float
    soil_saturation_override: Optional[float]
    active_preset: str
    updated_at: str

class AlertEntry(BaseModel):
    id: str
    node_id: str
    node_name: str
    severity: str  # Watch, Warning, Critical
    parameter: str  # Rainfall, Soil Moisture, River Discharge
    value: float
    threshold: float
    unit: str
    message: str
    timestamp: str
