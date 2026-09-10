"""
Pydantic schemas for request/response serialization.
"""
from typing import List, Optional
from pydantic import BaseModel

class FieldBase(BaseModel):
    id: str
    name: str
    location: str
    zone: str
    areaHectares: float
    crop: str
    cropGrowthStage: str
    cropWaterRequirementMm: float
    currentSoilMoisture: float
    soilType: str
    lastIrrigatedHoursAgo: int
    priority: str
    canalId: str
    pumpId: str

class WaterResourceBase(BaseModel):
    id: str
    name: str
    type: str
    capacityLiters: float
    currentStorageLiters: float
    availableIrrigationLiters: float
    expectedInflowLiters: float
    minRequiredStorageLiters: float
    status: str

class CanalBase(BaseModel):
    id: str
    name: str
    capacityLitersPerDay: float
    currentFlowLitersPerDay: float
    connectedFields: List[str]

class PumpBase(BaseModel):
    id: str
    name: str
    capacityLitersPerHour: float
    energySource: str
    operatingCostPerHour: float
    status: str

class WeatherDataBase(BaseModel):
    fieldId: str
    temperatureC: float
    humidityPercent: float
    currentRainfallMm: float
    expectedRainfallMm: float
    rainProbabilityPercent: float
    et0Mm: float
    windSpeedKmh: float
    forecastSummary: str

class ScheduleItemSchema(BaseModel):
    id: str
    timeSlot: str
    fieldId: str
    fieldName: str
    crop: str
    waterLiters: float
    canalName: str
    pumpName: str
    priority: str
    decision: str
    reason: str
    energyCost: float
    co2Grams: float

class OptimizationRequest(BaseModel):
    availableWaterOverride: Optional[float] = None
    rainfallMultiplier: Optional[float] = 1.0
    cropDemandMultiplier: Optional[float] = 1.0
    canalCapacityMultiplier: Optional[float] = 1.0
    customIterations: Optional[int] = 200
    segment: Optional[str] = None

class SimulationRequest(BaseModel):
    scenarioName: Optional[str] = "Custom"
    availableWater: Optional[float] = None
    rainfallMultiplier: Optional[float] = 1.0
    cropDemandMultiplier: Optional[float] = 1.0
    canalCapacityMultiplier: Optional[float] = 1.0
    segment: Optional[str] = None

class FieldCreateOrUpdate(BaseModel):
    id: Optional[str] = None
    name: str
    location: Optional[str] = "Krishna-Godavari Command Area"
    zone: Optional[str] = "Zone A"
    areaHectares: float = 2.0
    crop: str
    cropGrowthStage: Optional[str] = "Vegetative"
    cropWaterRequirementMm: Optional[float] = 5.0
    currentSoilMoisture: Optional[float] = 50.0
    soilType: Optional[str] = "Alluvial"
    lastIrrigatedHoursAgo: Optional[int] = 24
    priority: Optional[str] = "MEDIUM"
    canalId: Optional[str] = "C1"
    pumpId: Optional[str] = "P1"

class WaterResourceUpdate(BaseModel):
    currentStorageLiters: Optional[float] = None
    availableIrrigationLiters: Optional[float] = None
    expectedInflowLiters: Optional[float] = None
    status: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    id: Optional[str] = None

