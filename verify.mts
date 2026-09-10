import { runQuantumOptimization } from './server/quantumOptimizer.js';
import { DEFAULT_FIELDS, DEFAULT_WATER_RESOURCES, DEFAULT_CANALS, DEFAULT_PUMPS, DEFAULT_WEATHER } from './server/db.js';

const counts: Record<string, number> = {};
const allocs: number[] = [], costs: number[] = [], saved: number[] = [], scores: number[] = [];
let zeroLitreIrrigate = 0;
const RUNS = 200;
for (let r = 0; r < RUNS; r++) {
  const res = runQuantumOptimization(DEFAULT_FIELDS, DEFAULT_WATER_RESOURCES, DEFAULT_CANALS, DEFAULT_PUMPS, DEFAULT_WEATHER);
  for (const s of res.schedule) {
    if (s.decision === 'Irrigate') {
      counts[s.fieldId] = (counts[s.fieldId] || 0) + 1;
      if (s.waterLiters === 0) zeroLitreIrrigate++;
    }
  }
  allocs.push(res.metrics.waterAllocated);
  costs.push(res.metrics.estimatedOperatingCost);
  saved.push(res.metrics.estimatedWaterSaved);
  scores.push(res.metrics.quboScore);
}
const st = (a: number[]) => `min ${Math.min(...a)}  mean ${(a.reduce((x,y)=>x+y,0)/a.length).toFixed(0)}  max ${Math.max(...a)}`;
console.log(`=== REAL runQuantumOptimization(), ${RUNS} runs on shipped demo data ===\n`);
console.log('Field irrigation frequency:');
for (const f of DEFAULT_FIELDS) {
  const c = counts[f.id] || 0;
  console.log(`  ${f.id} ${f.crop.padEnd(10)} pri=${f.priority.padEnd(6)} moisture=${String(f.currentSoilMoisture).padStart(2)}%  -> Irrigate in ${(c/RUNS*100).toFixed(1).padStart(5)}% of runs`);
}
console.log(`\nwaterAllocated      : ${st(allocs)}`);
console.log(`estimatedOperatingCost: ${st(costs)}`);
console.log(`estimatedWaterSaved : ${st(saved)}`);
console.log(`quboScore           : ${st(scores)}`);
console.log(`\nSchedule rows marked "Irrigate" that deliver 0 L: ${zeroLitreIrrigate}`);
const one = runQuantumOptimization(DEFAULT_FIELDS, DEFAULT_WATER_RESOURCES, DEFAULT_CANALS, DEFAULT_PUMPS, DEFAULT_WEATHER);
console.log(`\nSample run: status="${one.status}", metrics.waterShortage=${one.metrics.waterShortage}, efficiency=${one.metrics.irrigationEfficiencyPercent}%, costSavings=${one.metrics.costSavingsPercent}%`);
console.log('Sample schedule:');
for (const s of one.schedule) console.log(`  ${s.fieldId} ${s.decision.padEnd(9)} ${String(s.waterLiters).padStart(5)}L  slot=${s.timeSlot}  cost=${s.energyCost}`);
