"""
Configuration and Domain Definitions for Indian Hilly Watershed Flood Prediction
"""

INDIAN_REGIONS = {
    "uttarakhand": {
        "id": "uttarakhand",
        "name": "Uttarakhand Garhwal Himalaya",
        "state": "Uttarakhand",
        "river": "Mandakini & Alaknanda Rivers (Ganga Basin)",
        "description": "High-altitude cloudburst prone terrain featuring Kedarnath headwaters and Chamoli Joshimath gorge pass.",
        "nodes": [
            {
                "id": "uk-node-1",
                "name": "Kedarnath Headwaters",
                "zone": "Upper Glacial Catchment",
                "lat": 30.7346,
                "lon": 79.0669,
                "elevation_m": 2680,
                "slope_deg": 42.0,
                "soil_type": "Moraine & Weathered Rock",
                "drainage_area_km2": 16.5,
                "grid_pos": {"x": 25, "y": 20},
                "connected_to": ["uk-node-3"]
            },
            {
                "id": "uk-node-2",
                "name": "Chamoli / Joshimath Pass",
                "zone": "Upper Catchment Gorge",
                "lat": 30.5562,
                "lon": 79.5638,
                "elevation_m": 2050,
                "slope_deg": 36.5,
                "soil_type": "Schist Outcrop & Scree",
                "drainage_area_km2": 24.0,
                "grid_pos": {"x": 75, "y": 22},
                "connected_to": ["uk-node-3"]
            },
            {
                "id": "uk-node-3",
                "name": "Rudraprayag Confluence",
                "zone": "Mid Basin Junction",
                "lat": 30.2858,
                "lon": 78.9811,
                "elevation_m": 895,
                "slope_deg": 24.0,
                "soil_type": "Silty Alluvium",
                "drainage_area_km2": 48.0,
                "grid_pos": {"x": 48, "y": 55},
                "connected_to": ["uk-node-4"]
            },
            {
                "id": "uk-node-4",
                "name": "Rishikesh Valley Outlet",
                "zone": "Lower Foothills Outlet",
                "lat": 30.0869,
                "lon": 78.2676,
                "elevation_m": 340,
                "slope_deg": 11.5,
                "soil_type": "Deep Boulder Alluvium",
                "drainage_area_km2": 95.0,
                "grid_pos": {"x": 52, "y": 90},
                "connected_to": []
            }
        ]
    },

    "himachal": {
        "id": "himachal",
        "name": "Himachal Pradesh Beas Basin",
        "state": "Himachal Pradesh",
        "river": "Beas River Basin",
        "description": "Monsoon downpour corridor covering Solang Valley, Manali, Kullu, and Pandoh Dam outflow.",
        "nodes": [
            {
                "id": "hp-node-1",
                "name": "Solang / Manali Peak",
                "zone": "Upper Alpine Basin",
                "lat": 32.2432,
                "lon": 77.1892,
                "elevation_m": 2050,
                "slope_deg": 35.0,
                "soil_type": "Pine Forest Loam",
                "drainage_area_km2": 18.2,
                "grid_pos": {"x": 30, "y": 22},
                "connected_to": ["hp-node-2"]
            },
            {
                "id": "hp-node-2",
                "name": "Kullu Valley Pass",
                "zone": "Mid River Basin",
                "lat": 31.9579,
                "lon": 77.1095,
                "elevation_m": 1279,
                "slope_deg": 22.0,
                "soil_type": "River Terrace Alluvium",
                "drainage_area_km2": 42.0,
                "grid_pos": {"x": 50, "y": 55},
                "connected_to": ["hp-node-3"]
            },
            {
                "id": "hp-node-3",
                "name": "Pandoh Dam Reservoir Outflow",
                "zone": "Hydel Reservoir Outflow",
                "lat": 31.6705,
                "lon": 76.9856,
                "elevation_m": 850,
                "slope_deg": 14.0,
                "soil_type": "Deep Reservoir Bed Silt",
                "drainage_area_km2": 78.5,
                "grid_pos": {"x": 55, "y": 88},
                "connected_to": []
            }
        ]
    },

    "kerala_gts": {
        "id": "kerala_gts",
        "name": "Western Ghats (Kerala)",
        "state": "Kerala",
        "river": "Kabini & Periyar Rivers",
        "description": "Tropical monsoon watershed featuring Wayanad Vythiri hills and Idukki Hydroelectric Reservoir.",
        "nodes": [
            {
                "id": "kl-node-1",
                "name": "Wayanad Vythiri Peak",
                "zone": "Western Ghats Ridge",
                "lat": 11.5524,
                "lon": 76.0375,
                "elevation_m": 1300,
                "slope_deg": 31.0,
                "soil_type": "Laterite Forest Soil",
                "drainage_area_km2": 22.0,
                "grid_pos": {"x": 35, "y": 25},
                "connected_to": ["kl-node-2"]
            },
            {
                "id": "kl-node-2",
                "name": "Idukki Reservoir Pass",
                "zone": "Reservoir Catchment",
                "lat": 9.8496,
                "lon": 76.9806,
                "elevation_m": 750,
                "slope_deg": 19.5,
                "soil_type": "Red Clay Loam",
                "drainage_area_km2": 64.0,
                "grid_pos": {"x": 60, "y": 75},
                "connected_to": []
            }
        ]
    },

    "meghalaya": {
        "id": "meghalaya",
        "name": "Meghalaya Sohra/Cherrapunji",
        "state": "Meghalaya",
        "river": "Umiam & Umngot Rivers",
        "description": "High precipitation plateau with steep escarpments and intense flash rainfall.",
        "nodes": [
            {
                "id": "mg-node-1",
                "name": "Sohra / Cherrapunji Plateau",
                "zone": "High Rain Escarpment",
                "lat": 25.2986,
                "lon": 91.7332,
                "elevation_m": 1430,
                "slope_deg": 28.0,
                "soil_type": "Sandstone Outcrop & Shallow Soil",
                "drainage_area_km2": 19.0,
                "grid_pos": {"x": 30, "y": 25},
                "connected_to": ["mg-node-2"]
            },
            {
                "id": "mg-node-2",
                "name": "Dawki River Pass Outlet",
                "zone": "Border Gorge Outlet",
                "lat": 25.1844,
                "lon": 92.0163,
                "elevation_m": 110,
                "slope_deg": 12.0,
                "soil_type": "Sandy Gravel Bed",
                "drainage_area_km2": 52.0,
                "grid_pos": {"x": 65, "y": 80},
                "connected_to": []
            }
        ]
    }
}

# Backward compatibility WATERSHED_NODES default set to Uttarakhand
WATERSHED_NODES = INDIAN_REGIONS["uttarakhand"]["nodes"]

# Risk Threshold Constants
THRESHOLDS = {
    "rainfall": {
        "watch": 15.0,     # mm/hr
        "warning": 35.0,   # mm/hr
        "critical": 65.0   # mm/hr
    },
    "soil_moisture": {
        "watch": 55.0,     # % saturation
        "warning": 72.0,   # % saturation
        "critical": 85.0   # % saturation
    },
    "discharge": {
        "watch": 45.0,     # m3/s
        "warning": 85.0,   # m3/s
        "critical": 140.0  # m3/s
    }
}

DEFAULT_SIMULATION_STATE = {
    "mode": "live_india",  # "live_india" or "simulation"
    "active_region": "uttarakhand",
    "rainfall_intensity": 22.5,
    "soil_saturation_override": None,
    "active_preset": "Live Weather Feed"
}
