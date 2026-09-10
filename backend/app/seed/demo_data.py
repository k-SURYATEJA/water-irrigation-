"""
Demo seed data for Krishna-Godavari command areas.
"""
from sqlalchemy.orm import Session
from ..models.models import FieldModel, WaterResourceModel, CanalModel, PumpModel, WeatherDataModel, AlertModel

def seed_database(db: Session):
    # Only seed if empty
    if db.query(FieldModel).first():
        return

    fields = [
        FieldModel(id="F1", name="Field F1 - Tomato Plot", location="Zone A - Krishna Delta North", zone="Zone A", areaHectares=2.5, crop="Tomato", cropGrowthStage="Flowering", cropWaterRequirementMm=6.2, currentSoilMoisture=38.0, soilType="Red Sandy", lastIrrigatedHoursAgo=72, priority="HIGH", canalId="C1", pumpId="P1"),
        FieldModel(id="F2", name="Field F2 - Paddy Basin", location="Zone B - Godavari Lowlands", zone="Zone B", areaHectares=3.8, crop="Paddy", cropGrowthStage="Vegetative", cropWaterRequirementMm=7.5, currentSoilMoisture=78.0, soilType="Clay Loam", lastIrrigatedHoursAgo=16, priority="LOW", canalId="C2", pumpId="P2"),
        FieldModel(id="F3", name="Field F3 - Groundnut Field", location="Zone A - Rayanapadu Terraces", zone="Zone A", areaHectares=2.0, crop="Groundnut", cropGrowthStage="Yield Formation", cropWaterRequirementMm=4.8, currentSoilMoisture=45.0, soilType="Red Sandy", lastIrrigatedHoursAgo=60, priority="HIGH", canalId="C1", pumpId="P1"),
        FieldModel(id="F4", name="Field F4 - Cotton Plantation", location="Zone C - Guntur Upland Reach", zone="Zone C", areaHectares=3.0, crop="Cotton", cropGrowthStage="Yield Formation", cropWaterRequirementMm=5.4, currentSoilMoisture=52.0, soilType="Black Cotton", lastIrrigatedHoursAgo=48, priority="MEDIUM", canalId="C3", pumpId="P2"),
        FieldModel(id="F5", name="Field F5 - Maize Plot", location="Zone C - Tenali Command Branch", zone="Zone C", areaHectares=1.8, crop="Maize", cropGrowthStage="Initial", cropWaterRequirementMm=4.0, currentSoilMoisture=62.0, soilType="Alluvial", lastIrrigatedHoursAgo=36, priority="LOW", canalId="C3", pumpId="P3"),
        FieldModel(id="F6", name="Field F6 - Chillies Reach", location="Zone B - Amaravati Agricultural Belt", zone="Zone B", areaHectares=2.2, crop="Chillies", cropGrowthStage="Yield Formation", cropWaterRequirementMm=5.8, currentSoilMoisture=34.0, soilType="Clay Loam", lastIrrigatedHoursAgo=80, priority="HIGH", canalId="C2", pumpId="P1"),
    ]

    resources = [
        WaterResourceModel(id="R1", name="Prakasam Barrage Primary Head", type="reservoir", capacityLiters=15000, currentStorageLiters=11250, availableIrrigationLiters=7500, expectedInflowLiters=2000, minRequiredStorageLiters=3000, status="Adequate"),
        WaterResourceModel(id="R2", name="Sir Arthur Cotton Head Tank B", type="reservoir", capacityLiters=10000, currentStorageLiters=7500, availableIrrigationLiters=5000, expectedInflowLiters=1500, minRequiredStorageLiters=2000, status="Adequate"),
    ]

    canals = [
        CanalModel(id="C1", name="Krishna Main Canal 1", capacityLitersPerDay=3500, currentFlowLitersPerDay=2100, connectedFields='["F1", "F3"]'),
        CanalModel(id="C2", name="Godavari Eastern Canal 2", capacityLitersPerDay=2500, currentFlowLitersPerDay=1300, connectedFields='["F2", "F6"]'),
        CanalModel(id="C3", name="Rayanapadu Distributary 3", capacityLitersPerDay=1500, currentFlowLitersPerDay=900, connectedFields='["F4", "F5"]'),
    ]

    pumps = [
        PumpModel(id="P1", name="Solar Submersible Pump #1", capacityLitersPerHour=850, energySource="Solar", operatingCostPerHour=12, status="Operational"),
        PumpModel(id="P2", name="High-Head Grid Pump #2", capacityLitersPerHour=1300, energySource="Grid Electric", operatingCostPerHour=32, status="Operational"),
        PumpModel(id="P3", name="Auxiliary Diesel Pump #3", capacityLitersPerHour=1000, energySource="Diesel Backup", operatingCostPerHour=48, status="Standby"),
    ]

    weather = [
        WeatherDataModel(fieldId="F1", temperatureC=34, humidityPercent=55, currentRainfallMm=0, expectedRainfallMm=2, rainProbabilityPercent=10, et0Mm=5.6, windSpeedKmh=12, forecastSummary="Clear sky, high thermal radiation"),
        WeatherDataModel(fieldId="F2", temperatureC=29, humidityPercent=82, currentRainfallMm=14, expectedRainfallMm=28, rainProbabilityPercent=65, et0Mm=3.2, windSpeedKmh=18, forecastSummary="Convective thunderstorm incoming"),
        WeatherDataModel(fieldId="F3", temperatureC=33, humidityPercent=58, currentRainfallMm=0, expectedRainfallMm=3, rainProbabilityPercent=15, et0Mm=5.2, windSpeedKmh=10, forecastSummary="Warm breeze, dry topsoil"),
        WeatherDataModel(fieldId="F4", temperatureC=31, humidityPercent=64, currentRainfallMm=0, expectedRainfallMm=8, rainProbabilityPercent=30, et0Mm=4.8, windSpeedKmh=14, forecastSummary="Partly cloudy, moderate evaporation"),
        WeatherDataModel(fieldId="F5", temperatureC=30, humidityPercent=68, currentRainfallMm=2, expectedRainfallMm=12, rainProbabilityPercent=45, et0Mm=4.1, windSpeedKmh=15, forecastSummary="Scattered drizzle expected"),
        WeatherDataModel(fieldId="F6", temperatureC=35, humidityPercent=50, currentRainfallMm=0, expectedRainfallMm=1, rainProbabilityPercent=8, et0Mm=5.9, windSpeedKmh=11, forecastSummary="Intense heat, elevated crop transpiration"),
    ]

    alerts = [
        AlertModel(id="alt-1", severity="WARNING", title="Critically Low Soil Moisture in F1 & F6", message="Tomato (38%) and Chillies (34%) soil moisture levels have breached the 40% safety threshold.", source="Soil Moisture Telemetry", timestamp="10 mins ago", acknowledged=False, actionRequired="Prioritize for morning allocation in QUBO optimization.", fieldId="F1, F6"),
        AlertModel(id="alt-2", severity="INFO", title="Expected Rainfall Over Zone B Lowlands", message="Rain radar indicates 28mm incoming precipitation with 65% probability over Field F2 (Paddy).", source="Agro-Meteorological Radar", timestamp="25 mins ago", acknowledged=False, actionRequired="Optimizer recommends delaying irrigation to save ~700L reservoir water.", fieldId="F2"),
        AlertModel(id="alt-3", severity="INFO", title="Canal C3 Operating Near 60% Capacity", message="Rayanapadu Distributary current flow is 900 L/day (Max 1,500 L/day). Plenty of hydraulic headroom available.", source="Canal Flow Gauging Station", timestamp="1 hour ago", acknowledged=True, fieldId="C3"),
    ]

    db.add_all(fields)
    db.add_all(resources)
    db.add_all(canals)
    db.add_all(pumps)
    db.add_all(weather)
    db.add_all(alerts)
    db.commit()

def reset_database(db: Session):
    for model in [FieldModel, WaterResourceModel, CanalModel, PumpModel, WeatherDataModel, AlertModel]:
        db.query(model).delete()
    db.commit()
    seed_database(db)

