"""
FAO-56 Transparent Crop Water Demand & Explainability Engine.
"""
from typing import Dict, Any

CROPS_INFO = {
    "tomato": {"kc": 1.15, "min_moisture": 60, "max_moisture": 80, "critical": "Flowering & Fruit Set"},
    "paddy": {"kc": 1.25, "min_moisture": 70, "max_moisture": 90, "critical": "Panicle Initiation"},
    "groundnut": {"kc": 0.85, "min_moisture": 50, "max_moisture": 70, "critical": "Pegging & Pod Development"},
    "cotton": {"kc": 0.90, "min_moisture": 55, "max_moisture": 75, "critical": "Boll Formation"},
    "maize": {"kc": 1.05, "min_moisture": 60, "max_moisture": 75, "critical": "Tasseling & Silking"},
    "chillies": {"kc": 1.00, "min_moisture": 55, "max_moisture": 70, "critical": "Fruit Development"},
}

def calculate_water_demand(field: Dict[str, Any], weather: Dict[str, Any], 
                           crop_multiplier: float = 1.0, rain_multiplier: float = 1.0) -> Dict[str, Any]:
    crop_name = field.get("crop", "Tomato").lower()
    crop_info = CROPS_INFO.get(crop_name, {"kc": 1.0, "min_moisture": 60, "max_moisture": 75, "critical": "Growth"})

    stage = field.get("cropGrowthStage", "Vegetative")
    stage_factor = 1.0
    if stage == "Initial":
        stage_factor = 0.65
    elif stage == "Vegetative":
        stage_factor = 0.95
    elif stage in ["Flowering", "Yield Formation"]:
        stage_factor = 1.2
    elif stage == "Ripening":
        stage_factor = 0.75

    adjusted_kc = crop_info["kc"] * stage_factor * crop_multiplier
    et0 = weather.get("et0Mm", 5.0)
    crop_etc = et0 * adjusted_kc

    expected_rain = weather.get("expectedRainfallMm", 0.0) * rain_multiplier
    rain_prob = weather.get("rainProbabilityPercent", 10.0) / 100.0
    effective_rain = max(0.0, expected_rain * rain_prob * 0.85)

    soil_moisture = field.get("currentSoilMoisture", 50.0)
    optimal_mid = (crop_info["min_moisture"] + crop_info["max_moisture"]) / 2.0
    deficit_pct = max(0.0, optimal_mid - soil_moisture)

    refill_depth_mm = (deficit_pct / 100.0) * 15.0
    net_daily_mm = max(0.0, crop_etc + refill_depth_mm - effective_rain)

    area = field.get("areaHectares", 2.0)
    base_scale = 85.0
    raw_liters = round(area * net_daily_mm * base_scale)
    estimated_need_liters = max(0, raw_liters)

    reasons = []
    if soil_moisture >= crop_info["min_moisture"] and effective_rain > 5.0:
        recommendation = "Delay"
        priority = "LOW"
        reasons.append(f"Soil moisture is adequate at {soil_moisture}% (threshold: {crop_info['min_moisture']}%).")
        reasons.append(f"Expected rain of {expected_rain:.1f}mm ({weather.get('rainProbabilityPercent', 0)}% prob) will naturally replenish soil.")
    elif soil_moisture < crop_info["min_moisture"]:
        recommendation = "Irrigate"
        if soil_moisture < 40 or stage == "Flowering":
            priority = "HIGH"
            reasons.append(f"Soil moisture critically low at {soil_moisture}% during sensitive '{stage}' stage.")
            reasons.append(f"Rain probability is minimal ({weather.get('rainProbabilityPercent', 0)}%); immediate irrigation required.")
        else:
            priority = "MEDIUM"
            reasons.append(f"Soil moisture is moderate at {soil_moisture}%; deficit needs replenishment.")
    else:
        recommendation = "Monitor"
        priority = "LOW"
        reasons.append(f"Soil moisture within optimal zone ({crop_info['min_moisture']}% - {crop_info['max_moisture']}%).")

    recommended_liters = estimated_need_liters if recommendation == "Irrigate" else 0

    return {
        "fieldId": field.get("id"),
        "fieldName": field.get("name"),
        "crop": field.get("crop"),
        "estimatedNeedLiters": estimated_need_liters,
        "waterDeficitPercent": round(deficit_pct),
        "recommendedAmountLiters": recommended_liters,
        "priority": priority,
        "recommendation": recommendation,
        "reasons": reasons,
        "calculations": {
            "et0": et0,
            "kc": round(adjusted_kc, 2),
            "cropEvapotranspiration": round(crop_etc, 2),
            "effectiveRainfall": round(effective_rain, 2)
        }
    }
