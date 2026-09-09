"""
Quantum-Inspired QUBO Optimization Module for Irrigation Scheduling.
Converts irrigation scheduling into a Quadratic Unconstrained Binary Optimization (QUBO) problem
and solves it via Simulated Quantum Annealing (SQA) with transverse field tunneling dynamics.
"""
import math
import random
import time
from typing import List, Dict, Any, Tuple

TIME_SLOTS = [
    {"id": "S1", "label": "06:00 - 08:00", "cost_multiplier": 0.8, "name": "Early Morning (Solar Active)"},
    {"id": "S2", "label": "08:00 - 10:00", "cost_multiplier": 1.0, "name": "Mid Morning (High Solar)"},
    {"id": "S3", "label": "10:00 - 12:00", "cost_multiplier": 1.3, "name": "Late Morning (Peak Evaporation)"},
    {"id": "S4", "label": "16:00 - 18:00", "cost_multiplier": 1.1, "name": "Evening Twilight (Off-Peak)"},
]

PRIORITY_WEIGHTS = {
    "HIGH": 80.0,
    "MEDIUM": 45.0,
    "LOW": 15.0,
}

class QuantumInspiredQUBOSolver:
    """
    Quantum-Inspired QUBO Solver.
    Uses Transverse-Field Simulated Quantum Annealing (SQA) to escape local minima
    via quantum tunneling probability through narrow high-cost energy barriers.
    """
    def __init__(self, fields: List[Dict[str, Any]], demands: List[Dict[str, Any]], 
                 total_available_water: float, canals: List[Dict[str, Any]], 
                 pumps: List[Dict[str, Any]], iterations: int = 250):
        self.fields = fields
        self.demands = demands
        self.total_available_water = total_available_water
        self.canals = canals
        self.pumps = pumps
        self.iterations = iterations
        
        self.N = len(fields)
        self.T = len(TIME_SLOTS)
        self.total_vars = self.N * self.T
        
        # Penalties
        self.lambda_conflict = 120.0
        self.lambda_water_budget = 0.08
        self.lambda_canal = 0.12
        
        self.Q = [[0.0 for _ in range(self.total_vars)] for _ in range(self.total_vars)]
        self._build_qubo_matrix()

    def _var_idx(self, i: int, t: int) -> int:
        return i * self.T + t

    def _build_qubo_matrix(self):
        """Constructs upper-triangular QUBO coupling matrix Q."""
        pump_map = {p["id"]: p for p in self.pumps}

        for i in range(self.N):
            field = self.fields[i]
            demand = self.demands[i]
            p_weight = PRIORITY_WEIGHTS.get(demand["priority"], 30.0)
            pump = pump_map.get(field.get("pumpId"), self.pumps[0] if self.pumps else {"operatingCostPerHour": 25.0})
            pump_cost = pump.get("operatingCostPerHour", 25.0)

            for t in range(self.T):
                idx = self._var_idx(i, t)
                slot = TIME_SLOTS[t]
                energy_cost = 2.0 * pump_cost * slot["cost_multiplier"]

                if demand["recommendation"] == "Irrigate":
                    # Negative linear term encourages irrigating high-priority fields
                    self.Q[idx][idx] += energy_cost - (p_weight * 1.5)
                elif demand["recommendation"] == "Delay":
                    # Positive penalty for irrigating saturated/rainy fields
                    self.Q[idx][idx] += energy_cost + 60.0
                else:
                    self.Q[idx][idx] += energy_cost + 15.0

                # Conflict constraint: At most one slot per field
                for t2 in range(t + 1, self.T):
                    idx2 = self._var_idx(i, t2)
                    self.Q[idx][idx2] += self.lambda_conflict

    def evaluate_energy(self, state: List[int]) -> float:
        """Calculates Hamiltonian energy H(x) = x^T Q x + Penalties."""
        energy = 0.0
        allocated_water = 0.0

        for i in range(self.total_vars):
            if state[i] == 1:
                energy += self.Q[i][i]
                field_idx = i // self.T
                allocated_water += self.demands[field_idx]["recommendedAmountLiters"]

                for j in range(i + 1, self.total_vars):
                    if state[j] == 1:
                        energy += self.Q[i][j]

        # Quadratic penalty for exceeding available reservoir water
        if allocated_water > self.total_available_water:
            excess = allocated_water - self.total_available_water
            energy += self.lambda_water_budget * (excess ** 2)

        # Canal capacity constraints per time slot
        for t in range(self.T):
            for canal in self.canals:
                slot_cap = (canal.get("capacityLitersPerDay", 2000.0)) / 2.5
                canal_flow = 0.0
                for i in range(self.N):
                    if self.fields[i].get("canalId") == canal["id"] and state[self._var_idx(i, t)] == 1:
                        canal_flow += self.demands[i]["recommendedAmountLiters"]
                if canal_flow > slot_cap:
                    excess_canal = canal_flow - slot_cap
                    energy += self.lambda_canal * (excess_canal ** 2)

        return energy

    def solve(self) -> Tuple[List[int], float, List[Dict[str, Any]]]:
        """
        Runs Simulated Quantum Annealing (SQA).
        Simulates transverse magnetic field decay Gamma(s) = Gamma_0 * (1 - s)^2
        providing quantum tunneling transitions.
        """
        gamma_0 = 40.0
        current_state = [1 if random.random() > 0.65 else 0 for _ in range(self.total_vars)]
        current_energy = self.evaluate_energy(current_state)
        
        best_state = list(current_state)
        best_energy = current_energy
        
        convergence_history = []

        for step in range(self.iterations):
            s = step / float(self.iterations)
            gamma = gamma_0 * ((1.0 - s) ** 2)  # Transverse tunneling field
            temp = max(0.01, 15.0 * (1.0 - s) + 0.1)

            # Single qubit spin flip
            flip_idx = random.randint(0, self.total_vars - 1)
            candidate_state = list(current_state)
            candidate_state[flip_idx] = 1 - candidate_state[flip_idx]

            cand_energy = self.evaluate_energy(candidate_state)
            delta_e = cand_energy - current_energy

            # Quantum tunneling probability boost
            tunneling_boost = (gamma / (gamma_0 + 1.0)) * 0.15
            classical_prob = math.exp(-max(-50.0, delta_e) / temp)
            transition_prob = min(1.0, classical_prob + tunneling_boost)

            if delta_e < 0 or random.random() < transition_prob:
                current_state = candidate_state
                current_energy = cand_energy
                if current_energy < best_energy:
                    best_energy = current_energy
                    best_state = list(candidate_state)

            if step % 10 == 0 or step == self.iterations - 1:
                convergence_history.append({
                    "iteration": step,
                    "energy": round(current_energy, 2),
                    "quantumFluctuation": round(gamma, 2)
                })

        return best_state, best_energy, convergence_history
