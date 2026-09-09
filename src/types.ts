export type IrrigationDecision = 'Irrigate' | 'Delay' | 'Monitor';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SystemStatus = 'Normal' | 'Water Stress' | 'Critical';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Field {
  id: string;
  name: string;
  location: string;
  zone: string;
  areaHectares: number;
  crop: string;
  cropGrowthStage: 'Initial' | 'Vegetative' | 'Flowering' | 'Yield Formation' | 'Ripening';
  cropWaterRequirementMm: number;
  currentSoilMoisture: number; // percentage 0-100
  soilType: 'Alluvial' | 'Black Cotton' | 'Red Sandy' | 'Clay Loam';
  lastIrrigatedHoursAgo: number;
  priority: PriorityLevel;
  canalId: string;
  pumpId: string;
}

export interface CropInfo {
  id: string;
  name: string;
  kc: number; // Crop coefficient
  optimalMoistureMin: number;
  optimalMoistureMax: number;
  criticalStage: string;
  waterSensitivity: 'High' | 'Medium' | 'Low';
}

export interface WaterResource {
  id: string;
  name: string;
  type: 'reservoir' | 'tank';
  capacityLiters: number;
  currentStorageLiters: number;
  availableIrrigationLiters: number;
  expectedInflowLiters: number;
  minRequiredStorageLiters: number;
  status: 'Adequate' | 'Depleted' | 'Critical';
}

export interface Canal {
  id: string;
  name: string;
  capacityLitersPerDay: number;
  currentFlowLitersPerDay: number;
  connectedFields: string[];
}

export interface Pump {
  id: string;
  name: string;
  capacityLitersPerHour: number;
  energySource: 'Solar' | 'Grid Electric' | 'Diesel Backup';
  operatingCostPerHour: number; // in INR
  status: 'Operational' | 'Standby' | 'Maintenance';
}

export interface WeatherData {
  fieldId: string;
  temperatureC: number;
  humidityPercent: number;
  currentRainfallMm: number;
  expectedRainfallMm: number;
  rainProbabilityPercent: number;
  et0Mm: number; // Reference evapotranspiration
  windSpeedKmh: number;
  forecastSummary: string;
}

export interface WaterDemandEstimation {
  fieldId: string;
  fieldName: string;
  crop: string;
  estimatedNeedLiters: number;
  waterDeficitPercent: number;
  recommendedAmountLiters: number;
  priority: PriorityLevel;
  recommendation: IrrigationDecision;
  reasons: string[];
  calculations: {
    et0: number;
    kc: number;
    cropEvapotranspiration: number;
    soilMoistureDeficit: number;
    effectiveRainfall: number;
  };
}

export interface ScheduleItem {
  id: string;
  timeSlot: string; // e.g. "06:00 - 08:00"
  fieldId: string;
  fieldName: string;
  crop: string;
  waterLiters: number;
  canalName: string;
  pumpName: string;
  priority: PriorityLevel;
  decision: IrrigationDecision;
  reason: string;
  energyCost: number;
  co2Grams: number;
}

export interface OptimizationMetrics {
  totalAvailableWater: number;
  totalWaterDemand: number;
  waterAllocated: number;
  waterShortage: number;
  estimatedWaterSaved: number;
  estimatedOperatingCost: number;
  baselineOperatingCost: number;
  costSavingsPercent: number;
  totalFields: number;
  fieldsRecommendedForIrrigation: number;
  fieldsRecommendedForDelay: number;
  irrigationEfficiencyPercent: number;
  quboScore: number;
  executionTimeMs: number;
  solverType: string;
}

export interface OptimizationResult {
  id: string;
  timestamp: string;
  status: 'Completed' | 'Optimal' | 'Feasible';
  solverMethod: 'Quantum-Inspired QUBO (Simulated Quantum Annealing)' | 'Classical Greedy Baseline';
  metrics: OptimizationMetrics;
  schedule: ScheduleItem[];
  baselineSchedule: ScheduleItem[];
  quboMatrixSummary: {
    variableCount: number;
    termsCount: number;
    penaltyWaterBudget: number;
    penaltyUnmetDemand: number;
    penaltyCanalCapacity: number;
    sampleCouplings: Array<{ q1: string; q2: string; weight: number }>;
  };
  convergenceHistory: Array<{ iteration: number; energy: number; quantumFluctuation: number }>;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  availableWaterMultiplier: number;
  rainfallMultiplier: number;
  cropDemandMultiplier: number;
  canalCapacityMultiplier: number;
  icon: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired?: string;
}
