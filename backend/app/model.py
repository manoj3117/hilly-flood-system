"""
Hydrological Flash Flood Risk Evaluation Engine
Combines rainfall intensity, soil moisture saturation, slope factors, and river discharge.
"""

from datetime import datetime
from typing import Dict, Any, Tuple
from app.config import THRESHOLDS
from app.schemas import PredictionRequest, PredictionResponse, RiskFactorBreakdown

def evaluate_flash_flood_risk(req: PredictionRequest) -> PredictionResponse:
    """
    Evaluates risk score (0-100) and assigns tier (Safe, Watch, Warning, Critical).
    Incorporates physical characteristics of hilly watersheds:
    - Steep slope accelerates runoff.
    - Saturated soil prevents infiltration (Rational Runoff Coefficient increases sharply).
    - High discharge reduces river channel remaining capacity.
    """
    # 1. Base Score Components (Normalized 0 to 100)
    # Rainfall: 0 to 80 mm/hr maps to 0 to 40 points
    rain_score = min(40.0, (req.rainfall_rate / 80.0) * 40.0)
    
    # Soil Moisture: 0 to 100% maps to 0 to 30 points (nonlinear curve above 70%)
    if req.soil_moisture > 70.0:
        soil_score = 15.0 + ((req.soil_moisture - 70.0) / 30.0) * 15.0
    else:
        soil_score = (req.soil_moisture / 70.0) * 15.0
        
    # River Discharge: 0 to 160 m3/s maps to 0 to 30 points
    discharge_score = min(30.0, (req.river_discharge / 160.0) * 30.0)
    
    # Slope multiplier: 10° to 45° slope scaling (1.0x to 1.3x)
    slope_multiplier = 1.0 + min(0.3, max(0.0, (req.slope_angle - 15.0) / 100.0))
    
    # Calculate composite index
    raw_risk_score = (rain_score + soil_score + discharge_score) * slope_multiplier
    
    # Soil saturation compound factor: If soil moisture > 80%, rainfall impact is doubled
    if req.soil_moisture >= 80.0 and req.rainfall_rate >= 30.0:
        raw_risk_score += (req.rainfall_rate - 30.0) * 0.4

    final_risk_score = round(min(100.0, max(0.0, raw_risk_score)), 1)
    
    # 2. Risk Tier Classification
    # Check explicit critical conditions first
    is_cloudburst = req.rainfall_rate >= THRESHOLDS["rainfall"]["critical"]
    is_extreme_soil_saturation = req.soil_moisture >= THRESHOLDS["soil_moisture"]["critical"] and req.rainfall_rate >= THRESHOLDS["rainfall"]["warning"]
    is_severe_discharge = req.river_discharge >= THRESHOLDS["discharge"]["critical"]
    
    if final_risk_score >= 75.0 or is_cloudburst or is_extreme_soil_saturation or is_severe_discharge:
        risk_tier = "Critical"
    elif final_risk_score >= 50.0 or req.rainfall_rate >= THRESHOLDS["rainfall"]["warning"] or req.river_discharge >= THRESHOLDS["discharge"]["warning"]:
        risk_tier = "Warning"
    elif final_risk_score >= 25.0 or req.rainfall_rate >= THRESHOLDS["rainfall"]["watch"] or req.soil_moisture >= THRESHOLDS["soil_moisture"]["watch"]:
        risk_tier = "Watch"
    else:
        risk_tier = "Safe"
        
    # 3. Estimated Lead Time to Peak Flood (minutes)
    # Hilly watersheds have rapid hydrograph response times (15 - 90 minutes)
    if risk_tier == "Critical":
        lead_time = max(12, int(45 - (req.rainfall_rate * 0.3) - (req.slope_angle * 0.2)))
    elif risk_tier == "Warning":
        lead_time = max(25, int(75 - (req.rainfall_rate * 0.4)))
    elif risk_tier == "Watch":
        lead_time = max(60, int(120 - (req.rainfall_rate * 0.5)))
    else:
        lead_time = 180  # Safe window
        
    # 4. Primary Threat Identification
    if is_cloudburst:
        primary_threat = "Active Torrential Cloudburst in Upper Watershed"
    elif req.soil_moisture >= 80.0:
        primary_threat = "Soil Saturation Limit Reached (High Landslide & Surface Runoff Hazard)"
    elif req.river_discharge >= THRESHOLDS["discharge"]["warning"]:
        primary_threat = "River Channel Overflow & Debris Flow Risk"
    elif req.rainfall_rate >= THRESHOLDS["rainfall"]["watch"]:
        primary_threat = "Persistent Intense Rainfall Over Steep Slopes"
    else:
        primary_threat = "Normal Hydrological Conditions"
        
    # 5. Dynamic Mitigation Recommendations
    recommendations = []
    if risk_tier == "Critical":
        recommendations.append("🚨 IMMEDIATE EVACUATION ORDER: Sound emergency sirens for downstream low-lying settlements.")
        recommendations.append("⚠️ Dispatch emergency response teams to mountain pass bridges and culverts.")
        recommendations.append("🚧 Close mountain highway passes subject to flash washouts and landslides.")
    elif risk_tier == "Warning":
        recommendations.append("⚠️ Issue High-Level Flood Watch alert to valley communities.")
        recommendations.append("📢 Activate local siren network and SMS emergency broad warning system.")
        recommendations.append("👀 Continuous automated monitoring of river gauge stations every 2 minutes.")
    elif risk_tier == "Watch":
        recommendations.append("🔍 Increase sensor telemetry logging frequency.")
        recommendations.append("ℹ️ Notify disaster management personnel to standby for escalation.")
        recommendations.append("📻 Inform mountain tourists and campers to evacuate riverside banks.")
    else:
        recommendations.append("✅ All telemetry metrics within normal operational bounds.")
        recommendations.append("🔄 Regular background hydrometric logging active.")

    factors = RiskFactorBreakdown(
        rainfall_contribution=round(rain_score, 1),
        soil_saturation_contribution=round(soil_score, 1),
        discharge_contribution=round(discharge_score, 1),
        slope_amplification=round(slope_multiplier, 2)
    )

    return PredictionResponse(
        node_id=req.node_id or "custom",
        risk_tier=risk_tier,
        risk_score=final_risk_score,
        lead_time_minutes=lead_time,
        primary_threat=primary_threat,
        recommendations=recommendations,
        factors=factors,
        timestamp=datetime.now().strftime("%H:%M:%S")
    )
