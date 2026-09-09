"""
SQLAlchemy ORM models for Krishna-Godavari Command Area Irrigation Optimization.
"""
from sqlalchemy import Column, String, Float, Integer, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class FieldModel(Base):
    __tablename__ = "fields"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    areaHectares = Column(Float, nullable=False)
    crop = Column(String, nullable=False)
    cropGrowthStage = Column(String, nullable=False)
    cropWaterRequirementMm = Column(Float, nullable=False)
    currentSoilMoisture = Column(Float, nullable=False)
    soilType = Column(String, nullable=False)
    lastIrrigatedHoursAgo = Column(Integer, nullable=False)
    priority = Column(String, nullable=False)
    canalId = Column(String, nullable=False)
    pumpId = Column(String, nullable=False)

class WaterResourceModel(Base):
    __tablename__ = "water_resources"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    capacityLiters = Column(Float, nullable=False)
    currentStorageLiters = Column(Float, nullable=False)
    availableIrrigationLiters = Column(Float, nullable=False)
    expectedInflowLiters = Column(Float, nullable=False)
    minRequiredStorageLiters = Column(Float, nullable=False)
    status = Column(String, nullable=False)

class CanalModel(Base):
    __tablename__ = "canals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacityLitersPerDay = Column(Float, nullable=False)
    currentFlowLitersPerDay = Column(Float, nullable=False)
    connectedFields = Column(Text, nullable=False)

class PumpModel(Base):
    __tablename__ = "pumps"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacityLitersPerHour = Column(Float, nullable=False)
    energySource = Column(String, nullable=False)
    operatingCostPerHour = Column(Float, nullable=False)
    status = Column(String, nullable=False)

class WeatherDataModel(Base):
    __tablename__ = "weather_data"

    fieldId = Column(String, primary_key=True, index=True)
    temperatureC = Column(Float, nullable=False)
    humidityPercent = Column(Float, nullable=False)
    currentRainfallMm = Column(Float, nullable=False)
    expectedRainfallMm = Column(Float, nullable=False)
    rainProbabilityPercent = Column(Float, nullable=False)
    et0Mm = Column(Float, nullable=False)
    windSpeedKmh = Column(Float, nullable=False)
    forecastSummary = Column(String, nullable=False)

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    severity = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    acknowledged = Column(Boolean, default=False)
    actionRequired = Column(String, nullable=True)
