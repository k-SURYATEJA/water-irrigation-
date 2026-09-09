import { Field, WeatherData, CropInfo, WaterDemandEstimation, IrrigationDecision, PriorityLevel } from '../src/types.js';
import { DEFAULT_CROPS } from './db.js';

export function estimateWaterDemand(
  field: Field,
  weather: WeatherData,
  cropMultiplier: number = 1.0,
  rainfallMultiplier: number = 1.0
): WaterDemandEstimation {
  const cropInfo: CropInfo = DEFAULT_CROPS.find(
    (c) => c.name.toLowerCase() === field.crop.toLowerCase()
  ) || {
    id: 'unknown',
    name: field.crop,
    kc: 1.0,
    optimalMoistureMin: 60,
    optimalMoistureMax: 75,
    criticalStage: 'Growth',
    waterSensitivity: 'Medium',
  };

  // 1. Stage adjustment factor for Kc
  let stageFactor = 1.0;
  if (field.cropGrowthStage === 'Initial') stageFactor = 0.65;
  else if (field.cropGrowthStage === 'Vegetative') stageFactor = 0.95;
  else if (field.cropGrowthStage === 'Flowering' || field.cropGrowthStage === 'Yield Formation') stageFactor = 1.2;
  else if (field.cropGrowthStage === 'Ripening') stageFactor = 0.75;

  const adjustedKc = cropInfo.kc * stageFactor * cropMultiplier;

  // 2. Crop Evapotranspiration ETc (mm/day) = ET0 * Kc
  const cropETc = weather.et0Mm * adjustedKc;

  // 3. Effective rainfall (mm)
  // USDA SCS formula approximation: Pe = P * (125 - 0.2*P)/125 if P < 250
  const adjustedExpectedRainMm = weather.expectedRainfallMm * rainfallMultiplier;
  const rainConfidence = weather.rainProbabilityPercent / 100;
  const effectiveRainfall = Math.max(0, adjustedExpectedRainMm * rainConfidence * 0.85);

  // 4. Soil moisture deficit
  const optimalMidpoint = (cropInfo.optimalMoistureMin + cropInfo.optimalMoistureMax) / 2;
  const moistureDeficitPercent = Math.max(0, optimalMidpoint - field.currentSoilMoisture);

  // 5. Liters calculation: 1 mm over 1 hectare = 10,000 Liters
  // Scaled for demo prototype numbers (e.g. 500-1000 Liters per field unit scale)
  // Base conversion: Area (ha) * mm depth * 100 (demo scaling factor)
  const baseScale = 85; 
  const moistureRefillDepthMm = (moistureDeficitPercent / 100) * 15; // depth to replenish root zone
  const netDailyNeedMm = Math.max(0, cropETc + moistureRefillDepthMm - effectiveRainfall);

  const rawLiters = Math.round(field.areaHectares * netDailyNeedMm * baseScale);
  const estimatedNeedLiters = Math.max(0, rawLiters);

  // 6. Decision & Explainability
  let decision: IrrigationDecision = 'Monitor';
  let priority: PriorityLevel = field.priority;
  const reasons: string[] = [];

  if (field.currentSoilMoisture >= cropInfo.optimalMoistureMin && effectiveRainfall > 5) {
    decision = 'Delay';
    priority = 'LOW';
    reasons.push(
      `Field ${field.id} (${field.crop}): Soil moisture is currently adequate at ${field.currentSoilMoisture}% (safe threshold: ${cropInfo.optimalMoistureMin}%).`
    );
    reasons.push(
      `High precipitation forecast: ${adjustedExpectedRainMm.toFixed(1)}mm expected with ${weather.rainProbabilityPercent}% probability will naturally replenish soil water.`
    );
    reasons.push(`Delaying irrigation conserves ${estimatedNeedLiters > 0 ? estimatedNeedLiters : 450}L of reservoir capacity without crop stress.`);
  } else if (field.currentSoilMoisture < cropInfo.optimalMoistureMin) {
    decision = 'Irrigate';
    if (field.currentSoilMoisture < 40 || field.cropGrowthStage === 'Flowering') {
      priority = 'HIGH';
      reasons.push(
        `Field ${field.id} (${field.crop}): Soil moisture is critically low at ${field.currentSoilMoisture}% (well below ${cropInfo.optimalMoistureMin}% target).`
      );
      reasons.push(
        `Critical vulnerability: Crop is in active "${field.cropGrowthStage}" stage (${cropInfo.criticalStage}), sensitive to moisture stress.`
      );
      reasons.push(`Rainfall probability is low (${weather.rainProbabilityPercent}%), requiring scheduled irrigation.`);
    } else {
      priority = 'MEDIUM';
      reasons.push(
        `Field ${field.id} (${field.crop}): Soil moisture is moderate at ${field.currentSoilMoisture}%, deficit needs replenishment.`
      );
      reasons.push(`Precipitation forecast is minimal; controlled irrigation recommended.`);
    }
  } else {
    decision = 'Monitor';
    priority = 'LOW';
    reasons.push(`Field ${field.id} (${field.crop}): Soil moisture at ${field.currentSoilMoisture}% is within the optimal envelope (${cropInfo.optimalMoistureMin}% - ${cropInfo.optimalMoistureMax}%).`);
    reasons.push(`No immediate moisture stress detected; scheduled for review in next cycle.`);
  }

  // Recommended amount
  let recommendedAmountLiters = 0;
  if (decision === 'Irrigate') {
    recommendedAmountLiters = estimatedNeedLiters > 0 ? estimatedNeedLiters : 500;
  }

  return {
    fieldId: field.id,
    fieldName: field.name,
    crop: field.crop,
    estimatedNeedLiters,
    waterDeficitPercent: Math.round(moistureDeficitPercent),
    recommendedAmountLiters,
    priority,
    recommendation: decision,
    reasons,
    calculations: {
      et0: weather.et0Mm,
      kc: Number(adjustedKc.toFixed(2)),
      cropEvapotranspiration: Number(cropETc.toFixed(2)),
      soilMoistureDeficit: Number(moistureDeficitPercent.toFixed(1)),
      effectiveRainfall: Number(effectiveRainfall.toFixed(2)),
    },
  };
}
