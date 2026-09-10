"""
FastAPI REST API routes for Irrigation Optimization with 1:1 parity with Node.js backend.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import csv
import time
from pathlib import Path
from datetime import datetime

from ..database.db import get_db
from ..models.models import FieldModel, WaterResourceModel, CanalModel, PumpModel, WeatherDataModel, AlertModel
from ..schemas.schemas import (
    OptimizationRequest,
    SimulationRequest,
    FieldCreateOrUpdate,
    WaterResourceUpdate,
    AlertAcknowledgeRequest,
)
from ..services.demand_service import calculate_water_demand
from ..optimization.qubo_solver import QuantumInspiredQUBOSolver, TIME_SLOTS
from ..seed.demo_data import reset_database

router = APIRouter()

latest_optimization_result: Optional[Dict[str, Any]] = None

DATASETS_DIR = Path(__file__).resolve().parents[3] / "datasets"

SEGMENT_FIELD_MAP = {
    "zone-a-krishna": ["F1", "F3"],
    "zone-b-godavari": ["F2", "F6"],
    "zone-c-guntur": ["F4", "F5"],
}
SEGMENT_RESOURCE_MAP = {
    "zone-a-krishna": ["R1"],
    "zone-b-godavari": ["R2"],
    "zone-c-guntur": ["R3"],
}
SEGMENT_CANAL_MAP = {
    "zone-a-krishna": ["C1"],
    "zone-b-godavari": ["C2"],
    "zone-c-guntur": ["C3"],
}
SEGMENT_PUMP_MAP = {
    "zone-a-krishna": ["P1"],
    "zone-b-godavari": ["P2"],
    "zone-c-guntur": ["P3"],
}

DATASET_SEGMENTS = [
    {
        "id": "all",
        "name": "Unified Command Area (All Zones)",
        "district": "Krishna & Godavari Basins",
        "soilProfile": "Mixed Alluvial, Sandy Loam & Vertisol",
        "crops": ["Paddy", "Cotton", "Maize", "Chilli", "Groundnut", "Tomato"],
        "waterSource": "Prakasam Barrage, Sir Arthur Cotton Barrage & Krishna-Godavari Canal Network",
        "coordinates": {"lat": 16.5062, "lng": 80.6480},
        "fieldCount": 6,
        "keyTelemetryHighlight": "Full multi-basin telemetry synchronization active",
    },
    {
        "id": "zone-a-krishna",
        "name": "Zone A: Krishna Delta North",
        "district": "Krishna & NTR Districts",
        "soilProfile": "Red Sandy Loam (Alfisol) - Rapid Drainage",
        "crops": ["Tomato", "Groundnut"],
        "waterSource": "Prakasam Barrage & Krishna Main Canal",
        "coordinates": {"lat": 16.5062, "lng": 80.6480},
        "fieldCount": 2,
        "keyTelemetryHighlight": "Open-Meteo Vijayawada station: 37.5% FMCW moisture, 33.8°C soil temp",
    },
    {
        "id": "zone-b-godavari",
        "name": "Zone B: Godavari Lowlands",
        "district": "East Godavari & Konaseema",
        "soilProfile": "Clay Loam / Alluvial (Inceptisol) - High Water Retention",
        "crops": ["Paddy", "Chillies"],
        "waterSource": "Sir Arthur Cotton Barrage & Godavari Eastern Canal",
        "coordinates": {"lat": 16.9891, "lng": 81.7840},
        "fieldCount": 2,
        "keyTelemetryHighlight": "Heavy monsoon inflow: 65% moisture, convective rain alert, high ET0",
    },
    {
        "id": "zone-c-guntur",
        "name": "Zone C: Guntur Uplands",
        "district": "Guntur & Palnadu Districts",
        "soilProfile": "Black Cotton Soil (Vertisol) - High Swell-Shrink",
        "crops": ["Cotton", "Maize"],
        "waterSource": "Western Distributary Link & Rayanapadu Distributary",
        "coordinates": {"lat": 16.3067, "lng": 80.4365},
        "fieldCount": 2,
        "keyTelemetryHighlight": "High moisture deficit: 22% moisture, 36.2°C ambient, peak daytime solar tariff",
    },
]

def load_csv(rel_path: str) -> List[Dict[str, Any]]:
    p = DATASETS_DIR / rel_path
    if not p.exists():
        return []
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def load_json(rel_path: str) -> Any:
    p = DATASETS_DIR / rel_path
    if not p.exists():
        return {}
    with open(p, mode="r", encoding="utf-8") as f:
        return json.load(f)

def model_to_dict(obj: Any) -> Dict[str, Any]:
    if hasattr(obj, "__dict__"):
        d = dict(obj.__dict__)
        d.pop("_sa_instance_state", None)
        return d
    return obj

def execute_optimization(req: OptimizationRequest, db: Session) -> Dict[str, Any]:
    start_time = time.time()
    all_fields = [model_to_dict(f) for f in db.query(FieldModel).all()]
    all_resources = [model_to_dict(r) for r in db.query(WaterResourceModel).all()]
    all_canals = [model_to_dict(c) for c in db.query(CanalModel).all()]
    all_pumps = [model_to_dict(p) for p in db.query(PumpModel).all()]
    weather_map = {w.fieldId: model_to_dict(w) for w in db.query(WeatherDataModel).all()}

    seg = req.segment
    if seg and seg in SEGMENT_FIELD_MAP:
        allowed_fields = set(SEGMENT_FIELD_MAP[seg])
        fields = [f for f in all_fields if f["id"] in allowed_fields]
        allowed_res = set(SEGMENT_RESOURCE_MAP.get(seg, []))
        resources = [r for r in all_resources if r["id"] in allowed_res]
        allowed_canals = set(SEGMENT_CANAL_MAP.get(seg, []))
        canals = [c for c in all_canals if c["id"] in allowed_canals]
        allowed_pumps = set(SEGMENT_PUMP_MAP.get(seg, []))
        pumps = [p for p in all_pumps if p["id"] in allowed_pumps]
    else:
        fields = all_fields
        resources = all_resources
        canals = all_canals
        pumps = all_pumps

    # 1. Demand Estimation
    demands = [
        calculate_water_demand(
            f, 
            weather_map.get(f["id"], {}), 
            req.cropDemandMultiplier or 1.0, 
            req.rainfallMultiplier or 1.0
        ) for f in fields
    ]

    total_avail = req.availableWaterOverride if req.availableWaterOverride is not None else sum(r.get("availableIrrigationLiters", 0) for r in resources)
    total_demand = sum(d["estimatedNeedLiters"] for d in demands)

    # 2. Quantum-Inspired QUBO Optimization
    solver = QuantumInspiredQUBOSolver(
        fields, demands, total_avail, canals, pumps, iterations=req.customIterations or 250
    )
    best_state, best_energy, convergence = solver.solve()
    qubo_matrix_summary = solver.get_summary()

    # 3. Build Schedule
    schedule = []
    water_allocated = 0.0
    total_optimized_operating_cost = 0.0
    pump_map = {p["id"]: p for p in pumps}
    canal_map = {c["id"]: c for c in canals}

    for i, field in enumerate(fields):
        demand = demands[i]
        canal = canal_map.get(field.get("canalId"), canals[0] if canals else {})
        pump = pump_map.get(field.get("pumpId"), pumps[0] if pumps else {})
        
        assigned_slot_idx = -1
        for t in range(solver.T):
            if best_state[solver._var_idx(i, t)] == 1:
                assigned_slot_idx = t
                break

        if assigned_slot_idx != -1 and demand["recommendation"] != "Delay" and water_allocated + demand["recommendedAmountLiters"] <= total_avail * 1.05:
            slot = TIME_SLOTS[assigned_slot_idx]
            water_amt = demand["recommendedAmountLiters"]
            cost = round(2.0 * pump.get("operatingCostPerHour", 25.0) * slot["cost_multiplier"])
            co2 = 0 if pump.get("energySource") == "Solar" else (420 if pump.get("energySource") == "Grid Electric" else 750)

            water_allocated += water_amt
            total_optimized_operating_cost += cost

            schedule.append({
                "id": f"SCH-{field['id']}",
                "timeSlot": slot["label"],
                "fieldId": field["id"],
                "fieldName": field["name"],
                "crop": field["crop"],
                "waterLiters": water_amt,
                "canalName": canal.get("name", "Canal 1"),
                "pumpName": pump.get("name", "Pump 1"),
                "priority": demand["priority"],
                "decision": "Irrigate",
                "reason": demand["reasons"][0] if demand["reasons"] else f"Quantum QUBO scheduled during {slot['name']} for optimal pump efficiency.",
                "energyCost": cost,
                "co2Grams": co2
            })
        else:
            schedule.append({
                "id": f"SCH-{field['id']}",
                "timeSlot": "—",
                "fieldId": field["id"],
                "fieldName": field["name"],
                "crop": field["crop"],
                "waterLiters": 0,
                "canalName": canal.get("name", "Canal 1"),
                "pumpName": pump.get("name", "Pump 1"),
                "priority": demand["priority"],
                "decision": "Delay",
                "reason": (demand["reasons"][0] if demand["reasons"] else "Soil moisture high and rainfall forecast makes irrigation unnecessary.")
                    if demand["recommendation"] == "Delay"
                    else "Depleted reservoir quota prioritized for critical vegetative fields in Zone A.",
                "energyCost": 0,
                "co2Grams": 0
            })

    # 4. Construct Classical Baseline Schedule
    baseline_schedule = []
    baseline_allocated = 0.0
    baseline_cost = 0.0

    for idx, f in enumerate(fields):
        slot = TIME_SLOTS[idx % len(TIME_SLOTS)]
        canal = canal_map.get(f.get("canalId"), canals[0] if canals else {})
        pump = pump_map.get(f.get("pumpId"), pumps[0] if pumps else {})
        fixed_water = round(f.get("areaHectares", 2.0) * 350)
        cost = round(2.0 * pump.get("operatingCostPerHour", 25.0) * 1.25)

        baseline_allocated += fixed_water
        baseline_cost += cost

        baseline_schedule.append({
            "id": f"BASE-{f['id']}",
            "timeSlot": slot["label"],
            "fieldId": f["id"],
            "fieldName": f["name"],
            "crop": f["crop"],
            "waterLiters": fixed_water,
            "canalName": canal.get("name", "Canal 1"),
            "pumpName": pump.get("name", "Pump 1"),
            "priority": f.get("priority", "MEDIUM"),
            "decision": "Irrigate",
            "reason": "Fixed unoptimized daily schedule (static rule of thumb)",
            "energyCost": cost,
            "co2Grams": 0 if pump.get("energySource") == "Solar" else 580
        })

    # 5. Calculate Metrics (Counting ONLY active irrigation demand to avoid false shortages)
    active_irrigation_demand = sum(d["recommendedAmountLiters"] for d in demands if d["recommendation"] == "Irrigate")
    water_shortage = max(0.0, active_irrigation_demand - water_allocated)
    water_saved = max(0.0, baseline_allocated - water_allocated)
    cost_savings = max(0.0, baseline_cost - total_optimized_operating_cost)
    cost_savings_pct = round((cost_savings / baseline_cost) * 100) if baseline_cost > 0 else 0
    irrigated_count = len([s for s in schedule if s["decision"] == "Irrigate"])
    delayed_count = len([s for s in schedule if s["decision"] == "Delay"])

    efficiency_pct = (
        min(98, round(((water_allocated - min(water_allocated * 0.08, 150)) / (water_allocated or 1)) * 100))
        if total_demand > 0
        else 92
    )

    metrics = {
        "totalAvailableWater": total_avail,
        "totalWaterDemand": total_demand,
        "waterAllocated": water_allocated,
        "waterShortage": water_shortage,
        "estimatedWaterSaved": water_saved,
        "estimatedOperatingCost": total_optimized_operating_cost,
        "baselineOperatingCost": baseline_cost,
        "costSavingsPercent": cost_savings_pct,
        "totalFields": len(fields),
        "fieldsRecommendedForIrrigation": irrigated_count,
        "fieldsRecommendedForDelay": delayed_count,
        "irrigationEfficiencyPercent": efficiency_pct,
        "quboScore": round(best_energy, 2),
        "executionTimeMs": round((time.time() - start_time) * 1000),
        "solverType": "Quantum-Inspired QUBO (Simulated Quantum Annealing)"
    }

    result = {
        "id": f"opt-{int(time.time() * 1000)}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "Optimal",
        "solverMethod": "Quantum-Inspired QUBO (Simulated Quantum Annealing)",
        "metrics": metrics,
        "schedule": schedule,
        "baselineSchedule": baseline_schedule,
        "quboMatrixSummary": qubo_matrix_summary,
        "convergenceHistory": convergence
    }

    return result

# ===================== REST API ROUTES =====================

@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "service": "Quantum-Inspired Irrigation & Water Allocation Optimization System (FastAPI)",
        "version": "1.0.0-hackathon",
        "sqliteStatus": "Connected",
    }

# Fields
@router.get("/fields")
def get_fields(segment: Optional[str] = None, db: Session = Depends(get_db)):
    fields = db.query(FieldModel).all()
    if segment and segment in SEGMENT_FIELD_MAP:
        allowed = set(SEGMENT_FIELD_MAP[segment])
        return [f for f in fields if f.id in allowed]
    return fields

@router.post("/fields")
def create_field(field_in: FieldCreateOrUpdate, db: Session = Depends(get_db)):
    field_id = field_in.id or f"F{db.query(FieldModel).count() + 1}"
    existing = db.query(FieldModel).filter(FieldModel.id == field_id).first()
    if existing:
        for k, v in field_in.dict().items():
            if v is not None and hasattr(existing, k):
                setattr(existing, k, v)
        field_obj = existing
    else:
        field_data = field_in.dict()
        field_data["id"] = field_id
        field_obj = FieldModel(**field_data)
        db.add(field_obj)
        
        # Add default weather if not exists
        w_exist = db.query(WeatherDataModel).filter(WeatherDataModel.fieldId == field_id).first()
        if not w_exist:
            db.add(WeatherDataModel(
                fieldId=field_id,
                temperatureC=32.0,
                humidityPercent=60.0,
                currentRainfallMm=0.0,
                expectedRainfallMm=4.0,
                rainProbabilityPercent=20.0,
                et0Mm=5.0,
                windSpeedKmh=12.0,
                forecastSummary="Partly cloudy, standard humidity"
            ))
    db.commit()
    return {"message": "Field created/updated successfully", "field": model_to_dict(field_obj)}

@router.put("/fields/{field_id}")
def update_field(field_id: str, field_in: FieldCreateOrUpdate, db: Session = Depends(get_db)):
    f = db.query(FieldModel).filter(FieldModel.id == field_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")
    for k, v in field_in.dict().items():
        if v is not None and hasattr(f, k) and k != "id":
            setattr(f, k, v)
    db.commit()
    return {"message": "Field updated successfully"}

@router.delete("/fields/{field_id}")
def delete_field(field_id: str, db: Session = Depends(get_db)):
    f = db.query(FieldModel).filter(FieldModel.id == field_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(f)
    
    # Delete associated weather data
    db.query(WeatherDataModel).filter(WeatherDataModel.fieldId == field_id).delete()
    
    # Clean canal associations
    canals = db.query(CanalModel).all()
    for canal in canals:
        try:
            connected = json.loads(canal.connectedFields) if isinstance(canal.connectedFields, str) else []
            if field_id in connected:
                connected = [fid for fid in connected if fid != field_id]
                canal.connectedFields = json.dumps(connected)
        except Exception:
            pass
    db.commit()
    return {"message": f"Field {field_id} deleted and associations cleaned"}

# Water Resources
@router.get("/water-resources")
def get_water_resources(segment: Optional[str] = None, db: Session = Depends(get_db)):
    resources = db.query(WaterResourceModel).all()
    if segment and segment in SEGMENT_RESOURCE_MAP:
        allowed = set(SEGMENT_RESOURCE_MAP[segment])
        return [r for r in resources if r.id in allowed]
    return resources

@router.put("/water-resources/{resource_id}")
def update_water_resource(resource_id: str, res_in: WaterResourceUpdate, db: Session = Depends(get_db)):
    r = db.query(WaterResourceModel).filter(WaterResourceModel.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    for k, v in res_in.dict().items():
        if v is not None and hasattr(r, k):
            setattr(r, k, v)
    db.commit()
    return {"message": "Water resource updated"}

# Canals & Pumps
@router.get("/canals")
def get_canals(segment: Optional[str] = None, db: Session = Depends(get_db)):
    canals = db.query(CanalModel).all()
    if segment and segment in SEGMENT_CANAL_MAP:
        allowed = set(SEGMENT_CANAL_MAP[segment])
        canals = [c for c in canals if c.id in allowed]

    results = []
    for c in canals:
        d = model_to_dict(c)
        if isinstance(d.get("connectedFields"), str):
            try:
                d["connectedFields"] = json.loads(d["connectedFields"])
            except Exception:
                d["connectedFields"] = []
        results.append(d)
    return results

@router.get("/pumps")
def get_pumps(segment: Optional[str] = None, db: Session = Depends(get_db)):
    pumps = db.query(PumpModel).all()
    if segment and segment in SEGMENT_PUMP_MAP:
        allowed = set(SEGMENT_PUMP_MAP[segment])
        return [p for p in pumps if p.id in allowed]
    return pumps

# Weather & Soil
@router.get("/weather")
def get_weather(segment: Optional[str] = None, db: Session = Depends(get_db)):
    data = db.query(WeatherDataModel).all()
    if segment and segment in SEGMENT_FIELD_MAP:
        allowed = set(SEGMENT_FIELD_MAP[segment])
        data = [w for w in data if w.fieldId in allowed]
    return {w.fieldId: model_to_dict(w) for w in data}

@router.get("/soil-data")
def get_soil_data(segment: Optional[str] = None, db: Session = Depends(get_db)):
    fields = db.query(FieldModel).all()
    if segment and segment in SEGMENT_FIELD_MAP:
        allowed = set(SEGMENT_FIELD_MAP[segment])
        fields = [f for f in fields if f.id in allowed]

    weather_map = {w.fieldId: w for w in db.query(WeatherDataModel).all()}
    result = []
    for f in fields:
        w = weather_map.get(f.id)
        result.append({
            "fieldId": f.id,
            "fieldName": f.name,
            "crop": f.crop,
            "soilMoisturePercent": f.currentSoilMoisture,
            "soilType": f.soilType,
            "temperatureC": getattr(w, "temperatureC", 32.0),
            "humidityPercent": getattr(w, "humidityPercent", 60.0),
            "currentRainMm": getattr(w, "currentRainfallMm", 0.0),
            "expectedRainMm": getattr(w, "expectedRainfallMm", 0.0),
            "rainProbabilityPercent": getattr(w, "rainProbabilityPercent", 15.0),
            "evapotranspirationEt0": getattr(w, "et0Mm", 5.0),
            "deficitStatus": "Severe Deficit" if f.currentSoilMoisture < 40 else "Moderate" if f.currentSoilMoisture < 60 else "Optimal/Saturated"
        })
    return result

# Demand Estimation
@router.get("/demand-estimation")
def get_demand_estimation(segment: Optional[str] = None, db: Session = Depends(get_db)):
    fields = [model_to_dict(f) for f in db.query(FieldModel).all()]
    if segment and segment in SEGMENT_FIELD_MAP:
        allowed = set(SEGMENT_FIELD_MAP[segment])
        fields = [f for f in fields if f["id"] in allowed]

    weather_map = {w.fieldId: model_to_dict(w) for w in db.query(WeatherDataModel).all()}
    results = []
    for f in fields:
        w = weather_map.get(f["id"], {
            "fieldId": f["id"],
            "temperatureC": 32.0,
            "humidityPercent": 60.0,
            "currentRainfallMm": 0.0,
            "expectedRainfallMm": 0.0,
            "rainProbabilityPercent": 10.0,
            "et0Mm": 5.0,
            "windSpeedKmh": 12.0,
            "forecastSummary": "Normal"
        })
        results.append(calculate_water_demand(f, w))
    return results

# Optimization Execution
@router.post("/optimize")
def run_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    global latest_optimization_result
    result = execute_optimization(req, db)
    latest_optimization_result = result
    return result

# Irrigation Schedule
@router.get("/schedule")
def get_schedule(segment: Optional[str] = None, db: Session = Depends(get_db)):
    global latest_optimization_result
    if not latest_optimization_result or (segment and latest_optimization_result.get("segment") != segment):
        latest_optimization_result = execute_optimization(OptimizationRequest(segment=segment), db)
    return {
        "schedule": latest_optimization_result["schedule"],
        "baselineSchedule": latest_optimization_result.get("baselineSchedule", []),
        "metrics": latest_optimization_result["metrics"],
        "timestamp": latest_optimization_result.get("timestamp", datetime.utcnow().isoformat() + "Z"),
    }

# What-If Simulation
@router.post("/simulate")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    normal_result = execute_optimization(OptimizationRequest(segment=req.segment), db)
    simulated_result = execute_optimization(
        OptimizationRequest(
            availableWaterOverride=req.availableWater,
            rainfallMultiplier=req.rainfallMultiplier,
            cropDemandMultiplier=req.cropDemandMultiplier,
            canalCapacityMultiplier=req.canalCapacityMultiplier,
            segment=req.segment,
        ),
        db
    )

    # Trigger dynamic alert if severe shortage
    if simulated_result["metrics"]["waterShortage"] > 500:
        alert = AlertModel(
            id=f"sim-{int(time.time() * 1000)}",
            severity="CRITICAL",
            title=f"Simulation Alert: Severe Water Shortage under \"{req.scenarioName or 'Custom'}\"",
            message=f"Water deficit of {simulated_result['metrics']['waterShortage']}L detected. {simulated_result['metrics']['fieldsRecommendedForDelay']} fields forced to delay irrigation.",
            source="What-If Scenario Engine",
            timestamp="Just now",
            acknowledged=False,
            actionRequired="Implement rotational canal rationing across Krishna-Godavari branches.",
            fieldId=None
        )
        db.add(alert)
        db.commit()

    return {
        "scenarioName": req.scenarioName or "Custom Simulation",
        "before": normal_result,
        "after": simulated_result,
        "comparison": {
            "waterAvailableDelta": simulated_result["metrics"]["totalAvailableWater"] - normal_result["metrics"]["totalAvailableWater"],
            "waterAllocatedDelta": simulated_result["metrics"]["waterAllocated"] - normal_result["metrics"]["waterAllocated"],
            "waterSavedDelta": simulated_result["metrics"]["estimatedWaterSaved"] - normal_result["metrics"]["estimatedWaterSaved"],
            "fieldsIrrigatedDelta": simulated_result["metrics"]["fieldsRecommendedForIrrigation"] - normal_result["metrics"]["fieldsRecommendedForIrrigation"],
            "operatingCostDelta": simulated_result["metrics"]["estimatedOperatingCost"] - normal_result["metrics"]["estimatedOperatingCost"],
        }
    }

# Analytics
@router.get("/analytics")
def get_analytics(segment: Optional[str] = None, db: Session = Depends(get_db)):
    global latest_optimization_result
    if not latest_optimization_result or (segment and latest_optimization_result.get("segment") != segment):
        latest_optimization_result = execute_optimization(OptimizationRequest(segment=segment), db)

    latest = latest_optimization_result
    sched = latest["schedule"]

    # Crop-wise allocation
    crop_map: Dict[str, Dict[str, Any]] = {}
    for item in sched:
        c = item["crop"]
        if c not in crop_map:
            crop_map[c] = {"crop": c, "allocatedLiters": 0, "count": 0}
        crop_map[c]["allocatedLiters"] += item["waterLiters"]
        crop_map[c]["count"] += 1

    # Field-wise allocation vs baseline
    base_map = {b["fieldId"]: b for b in latest.get("baselineSchedule", [])}
    field_comparison = []
    for s in sched:
        base = base_map.get(s["fieldId"], {})
        base_water = base.get("waterLiters", 0)
        field_comparison.append({
            "fieldId": s["fieldId"],
            "crop": s["crop"],
            "optimizedWater": s["waterLiters"],
            "baselineWater": base_water,
            "savedWater": max(0.0, base_water - s["waterLiters"]),
            "decision": s["decision"]
        })

    # 7-day trend
    mult = 0.35 if segment in ["zone-a-krishna", "zone-b-godavari", "zone-c-guntur"] else 1.0
    seven_day_trend = [
        {"day": "Mon", "availableWater": round(7200 * mult), "demand": round(6800 * mult), "allocated": round(6500 * mult), "saved": round(700 * mult)},
        {"day": "Tue", "availableWater": round(7000 * mult), "demand": round(6400 * mult), "allocated": round(6200 * mult), "saved": round(800 * mult)},
        {"day": "Wed", "availableWater": round(6800 * mult), "demand": round(7100 * mult), "allocated": round(6800 * mult), "saved": round(950 * mult)},
        {"day": "Thu", "availableWater": round(6500 * mult), "demand": round(6900 * mult), "allocated": round(6500 * mult), "saved": round(820 * mult)},
        {"day": "Fri", "availableWater": round(7200 * mult), "demand": round(6300 * mult), "allocated": round(5900 * mult), "saved": round(880 * mult)},
        {"day": "Sat", "availableWater": round(7500 * mult), "demand": round(6100 * mult), "allocated": round(5800 * mult), "saved": round(910 * mult)},
        {"day": "Sun (Today)", "availableWater": latest["metrics"]["totalAvailableWater"], "demand": latest["metrics"]["totalWaterDemand"], "allocated": latest["metrics"]["waterAllocated"], "saved": latest["metrics"]["estimatedWaterSaved"]}
    ]

    return {
        "metrics": latest["metrics"],
        "cropAllocation": list(crop_map.values()),
        "fieldAllocationComparison": field_comparison,
        "sevenDayTrend": seven_day_trend,
        "quboConvergence": latest["convergenceHistory"],
        "quboMatrixSummary": latest["quboMatrixSummary"],
    }

# ===================== DATASET EXPLORER ENDPOINTS =====================

@router.get("/datasets/segments")
def get_dataset_segments():
    return DATASET_SEGMENTS

@router.get("/datasets/explorer")
def get_dataset_explorer():
    weather = load_json("1_weather_and_climate/andhra_pradesh_agro_weather_7day.json")
    fao_crops = load_csv("2_crop_coefficients_fao56/fao56_crop_coefficients.csv")
    soil_profiles = load_csv("3_soil_hydrology/krishna_godavari_soil_profiles.csv")
    canals = load_csv("4_water_resources_and_canals/canal_network_conveyance.csv")
    barrages = load_csv("4_water_resources_and_canals/prakasam_arthur_cotton_barrages.csv")
    pumps = load_csv("5_pumps_and_energy_tariffs/agricultural_pumps_specifications.csv")
    tariffs = load_csv("5_pumps_and_energy_tariffs/ap_time_of_day_electricity_tariffs.csv")
    iot_sensors = load_csv("6_iot_sensor_telemetry/field_soil_moisture_sensor_timeseries.csv")

    return {
        "segments": DATASET_SEGMENTS,
        "datasetCounts": {
            "weatherStations": len(weather),
            "faoCropProfiles": len(fao_crops),
            "soilHydraulicProfiles": len(soil_profiles),
            "canalSegments": len(canals),
            "barrages": len(barrages),
            "pumpSpecifications": len(pumps),
            "timeOfDayTariffs": len(tariffs),
            "iotSensorObservations": len(iot_sensors),
        },
        "tables": {
            "faoCrops": fao_crops,
            "soilProfiles": soil_profiles,
            "canals": canals,
            "barrages": barrages,
            "pumps": pumps,
            "tariffs": tariffs,
            "iotSensors": iot_sensors[:40],
        },
        "weatherRegions": [
            {
                "key": k,
                "latitude": v.get("latitude"),
                "longitude": v.get("longitude"),
                "elevation": v.get("elevation"),
                "hourlyCount": len(v.get("hourly", {}).get("time", [])),
                "sampleHourly": {
                    "times": v.get("hourly", {}).get("time", [])[:24],
                    "temperatures": v.get("hourly", {}).get("temperature_2m", [])[:24],
                    "humidity": v.get("hourly", {}).get("relative_humidity_2m", [])[:24],
                    "precipitationProb": v.get("hourly", {}).get("precipitation_probability", [])[:24],
                    "et0": v.get("hourly", {}).get("et0_fao_evapotranspiration", [])[:24],
                    "solarIrradiance": v.get("hourly", {}).get("direct_normal_irradiance", [])[:24],
                }
            }
            for k, v in weather.items()
        ]
    }

@router.get("/datasets/telemetry")
def get_dataset_telemetry(segment: Optional[str] = None, limit: Optional[int] = 50):
    rows = load_csv("6_iot_sensor_telemetry/field_soil_moisture_sensor_timeseries.csv")
    if segment and segment in SEGMENT_FIELD_MAP:
        allowed = set(SEGMENT_FIELD_MAP[segment])
        rows = [r for r in rows if r.get("field_id") in allowed]
    return rows[:limit] if limit else rows

@router.get("/datasets/weather-timeseries")
def get_weather_timeseries(zone: Optional[str] = "Krishna_Delta_Vijayawada"):
    weather = load_json("1_weather_and_climate/andhra_pradesh_agro_weather_7day.json")
    zone_data = weather.get(zone) or weather.get("Krishna_Delta_Vijayawada") or {}
    hourly = zone_data.get("hourly", {})
    times = hourly.get("time", [])
    temps = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    rain_prob = hourly.get("precipitation_probability", [])
    et0 = hourly.get("et0_fao_evapotranspiration", [])
    solar = hourly.get("direct_normal_irradiance", [])

    results = []
    for i in range(min(48, len(times))):
        results.append({
            "time": times[i].replace("2026-09-", "Sep ").replace("T", " "),
            "temperatureC": temps[i] if i < len(temps) else 32.0,
            "humidityPercent": humidity[i] if i < len(humidity) else 60.0,
            "rainProbabilityPercent": rain_prob[i] if i < len(rain_prob) else 10.0,
            "et0Mm": et0[i] if i < len(et0) else 5.0,
            "solarIrradianceWm2": solar[i] if i < len(solar) else 450.0,
        })
    return results

# Alerts
@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(AlertModel).all()

@router.post("/alerts/acknowledge")
def acknowledge_alerts(req: Optional[AlertAcknowledgeRequest] = None, db: Session = Depends(get_db)):
    if req and req.id:
        alert = db.query(AlertModel).filter(AlertModel.id == req.id).first()
        if alert:
            alert.acknowledged = True
    else:
        for a in db.query(AlertModel).all():
            a.acknowledged = True
    db.commit()
    return {"message": "Alerts updated"}

# Reset to demo initial state
@router.post("/reset")
def reset_system(db: Session = Depends(get_db)):
    global latest_optimization_result
    reset_database(db)
    latest_optimization_result = execute_optimization(OptimizationRequest(), db)
    return {
        "message": "Database reset to initial Krishna-Godavari demo dataset",
        "result": latest_optimization_result
    }

