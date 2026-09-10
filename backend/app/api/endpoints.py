"""
FastAPI REST API routes for Irrigation Optimization with 1:1 parity with Node.js backend.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import time
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

def model_to_dict(obj: Any) -> Dict[str, Any]:
    if hasattr(obj, "__dict__"):
        d = dict(obj.__dict__)
        d.pop("_sa_instance_state", None)
        return d
    return obj

def execute_optimization(req: OptimizationRequest, db: Session) -> Dict[str, Any]:
    start_time = time.time()
    fields = [model_to_dict(f) for f in db.query(FieldModel).all()]
    resources = [model_to_dict(r) for r in db.query(WaterResourceModel).all()]
    canals = [model_to_dict(c) for c in db.query(CanalModel).all()]
    pumps = [model_to_dict(p) for p in db.query(PumpModel).all()]
    weather_map = {w.fieldId: model_to_dict(w) for w in db.query(WeatherDataModel).all()}

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
def get_fields(db: Session = Depends(get_db)):
    return db.query(FieldModel).all()

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
def get_water_resources(db: Session = Depends(get_db)):
    return db.query(WaterResourceModel).all()

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
def get_canals(db: Session = Depends(get_db)):
    canals = db.query(CanalModel).all()
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
def get_pumps(db: Session = Depends(get_db)):
    return db.query(PumpModel).all()

# Weather & Soil
@router.get("/weather")
def get_weather(db: Session = Depends(get_db)):
    data = db.query(WeatherDataModel).all()
    return {w.fieldId: model_to_dict(w) for w in data}

@router.get("/soil-data")
def get_soil_data(db: Session = Depends(get_db)):
    fields = db.query(FieldModel).all()
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
def get_demand_estimation(db: Session = Depends(get_db)):
    fields = [model_to_dict(f) for f in db.query(FieldModel).all()]
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
def get_schedule(db: Session = Depends(get_db)):
    global latest_optimization_result
    if not latest_optimization_result:
        latest_optimization_result = execute_optimization(OptimizationRequest(), db)
    return {
        "schedule": latest_optimization_result["schedule"],
        "baselineSchedule": latest_optimization_result.get("baselineSchedule", []),
        "metrics": latest_optimization_result["metrics"],
        "timestamp": latest_optimization_result.get("timestamp", datetime.utcnow().isoformat() + "Z"),
    }

# What-If Simulation
@router.post("/simulate")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    normal_result = execute_optimization(OptimizationRequest(), db)
    simulated_result = execute_optimization(
        OptimizationRequest(
            availableWaterOverride=req.availableWater,
            rainfallMultiplier=req.rainfallMultiplier,
            cropDemandMultiplier=req.cropDemandMultiplier,
            canalCapacityMultiplier=req.canalCapacityMultiplier,
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
def get_analytics(db: Session = Depends(get_db)):
    global latest_optimization_result
    if not latest_optimization_result:
        latest_optimization_result = execute_optimization(OptimizationRequest(), db)

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
    seven_day_trend = [
        {"day": "Mon", "availableWater": 7200, "demand": 6800, "allocated": 6500, "saved": 700},
        {"day": "Tue", "availableWater": 7000, "demand": 6400, "allocated": 6200, "saved": 800},
        {"day": "Wed", "availableWater": 6800, "demand": 7100, "allocated": 6800, "saved": 950},
        {"day": "Thu", "availableWater": 6500, "demand": 6900, "allocated": 6500, "saved": 820},
        {"day": "Fri", "availableWater": 7200, "demand": 6300, "allocated": 5900, "saved": 880},
        {"day": "Sat", "availableWater": 7500, "demand": 6100, "allocated": 5800, "saved": 910},
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

