"""
Unit tests for India Flash Flood Early Warning System API
"""
from fastapi.testclient import TestClient
from app.main import app
from app.model import evaluate_flash_flood_risk
from app.schemas import PredictionRequest
from app.weather_service import fetch_live_india_weather

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "active"
    assert "data_source" in response.json()

def test_indian_regions_endpoint():
    response = client.get("/api/india/regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 4
    region_ids = [r["id"] for r in regions]
    assert "uttarakhand" in region_ids
    assert "himachal" in region_ids

def test_open_meteo_live_weather_service():
    # Test Kedarnath GPS coordinates (30.7346, 79.0669)
    result = fetch_live_india_weather(30.7346, 79.0669)
    assert result["status"] in ["success", "fallback"]
    assert "precipitation_mm_hr" in result
    assert "soil_moisture_pct" in result

def test_predict_critical_cloudburst():
    req = PredictionRequest(
        rainfall_rate=75.0,
        soil_moisture=80.0,
        river_discharge=110.0,
        water_level=4.5,
        slope_angle=35.0
    )
    result = evaluate_flash_flood_risk(req)
    assert result.risk_tier == "Critical"
    assert result.risk_score >= 75.0

def test_api_nodes_endpoint():
    response = client.get("/api/nodes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert "risk_tier" in data[0]
