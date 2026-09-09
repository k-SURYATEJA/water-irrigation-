"""
FastAPI REST API routes for Irrigation Optimization.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from ..database.db import get_db
from ..models.models import FieldModel, WaterResourceModel, CanalModel, PumpModel, WeatherDataModel, AlertModel
from ..schemas.schemas import OptimizationRequest, SimulationRequest
from ..services.demand_service import calculate_water_demand
from ..optimization.qubo_solver import QuantumInspiredQUBOSolver, TIME_SLOTS

router = APIRouter()

@router.get("/fields")
def get_fields(db: Session = Depends(get_db)):
    return db.query(FieldModel).all()

@router.get("/water-resources")
def get_water_resources(db: Session = Depends(get_db)):
    return db.query(WaterResourceModel).all()

@router.get("/weather")
def get_weather(db: Session = Depends(get_db)):
    data = db.query(WeatherDataModel).all()
    return {w.fieldId: w for w in data}

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
            "rainProbabilityPercent": getattr(w, "rainProbabilityPercent", 15.0),
            "deficitStatus": "Severe Deficit" if f.currentSoilMoisture < 40 else "Moderate" if f.currentSoilMoisture < 60 else "Optimal"
        })
    return result

@router.post("/optimize")
def run_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    fields = [f.__dict__ for f in db.query(FieldModel).all()]
    resources = [r.__dict__ for r in db.query(WaterResourceModel).all()]
    canals = [c.__dict__ for c in db.query(CanalModel).all()]
    pumps = [p.__dict__ for p in db.query(PumpModel).all()]
    weather_map = {w.fieldId: w.__dict__ for w in db.query(WeatherDataModel).all()}

    # 1. Demand Estimation
    demands = [
        calculate_water_demand(
            f, 
            weather_map.get(f["id"], {}), 
            req.cropDemandMultiplier or 1.0, 
            req.rainfallMultiplier or 1.0
        ) for f in fields
    ]

    total_avail = req.availableWaterOverride or sum(r.get("availableIrrigationLiters", 0) for r in resources)
    total_demand = sum(d["estimatedNeedLiters"] for d in demands)

    # 2. Quantum-Inspired QUBO Optimization
    solver = QuantumInspiredQUBOSolver(
        fields, demands, total_avail, canals, pumps, iterations=req.customIterations or 200
    )
    best_state, best_energy, convergence = solver.solve()

    # 3. Build Schedule
    schedule = []
    water_allocated = 0.0
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
            water_allocated += water_amt
            cost = round(2.0 * pump.get("operatingCostPerHour", 25.0) * slot["cost_multiplier"])

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
                "reason": demand["reasons"][0] if demand["reasons"] else "Optimal quantum QUBO schedule",
                "energyCost": cost,
                "co2Grams": 0 if pump.get("energySource") == "Solar" else 420
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
                "reason": demand["reasons"][0] if demand["reasons"] else "Irrigation delayed to conserve reservoir storage",
                "energyCost": 0,
                "co2Grams": 0
            })

    return {
        "status": "Optimal",
        "solverMethod": "Quantum-Inspired QUBO (Simulated Quantum Annealing)",
        "metrics": {
            "totalAvailableWater": total_avail,
            "totalWaterDemand": total_demand,
            "waterAllocated": water_allocated,
            "waterShortage": max(0.0, total_demand - water_allocated),
            "estimatedWaterSaved": max(0.0, 5200.0 - water_allocated),
            "estimatedOperatingCost": sum(s["energyCost"] for s in schedule),
            "quboScore": round(best_energy, 2),
            "fieldsRecommendedForIrrigation": len([s for s in schedule if s["decision"] == "Irrigate"]),
            "fieldsRecommendedForDelay": len([s for s in schedule if s["decision"] == "Delay"])
        },
        "schedule": schedule,
        "convergenceHistory": convergence
    }

@router.get("/schedule")
def get_schedule(db: Session = Depends(get_db)):
    req = OptimizationRequest()
    return run_optimization(req, db)

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(AlertModel).all()
