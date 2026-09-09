# AI + Quantum-Inspired Irrigation and Water Resource Allocation Optimization

An intelligent decision-support system designed for agricultural water managers in Andhra Pradesh's **Krishna-Godavari command areas**.

---

## 🌟 Core Problem & Mission

Agricultural water availability in river basins and reservoir networks is strictly constrained by season, inflows, and canal capacities. Traditional systems use static, fixed-schedule rotations that waste water during precipitation and stress critical crops during dry spells.

This system answers 7 vital operational questions dynamically:
1. **Which fields** should receive irrigation today?
2. **When** (which optimal time slot) should each field be irrigated to leverage solar power and off-peak tariffs?
3. **How much water** should be allocated based on FAO-56 soil moisture deficit and crop coefficients?
4. **How to minimize water wastage** when natural rainfall is forecast?
5. **How to minimize pumping and energy operating costs**?
6. **How to satisfy crop water requirements** at critical stages (e.g. flowering/boll formation)?
7. **How to distribute limited canal water fairly** under drought stress?

---

## 🔬 Mathematical Formulation: Quantum-Inspired QUBO

We formulate irrigation scheduling as a **Quadratic Unconstrained Binary Optimization (QUBO)** problem:

$$\min_{x \in \{0, 1\}^{N \times T}} H(x) = H_{\text{cost}} + \lambda_1 H_{\text{unmet}} + \lambda_2 H_{\text{conflict}} + \lambda_3 H_{\text{water\_budget}} + \lambda_4 H_{\text{canal}}$$

### Decision Variables:
$$x_{i, t} \in \{0, 1\}$$
where $i \in \{1 \dots N\}$ indexes agricultural fields and $t \in \{1 \dots T\}$ indexes 2-hour irrigation time slots.

### Hamiltonian Terms:
1. **Operating & Energy Cost ($H_{\text{cost}}$):**
   $$H_{\text{cost}} = \sum_{i, t} x_{i, t} \cdot \left(C_{\text{pump}}(i) \times \text{Tariff}(t)\right)$$
   Encourages scheduling during early morning solar hours ($\approx 06:00 - 08:00$) when solar submersible pumps run at zero grid cost and minimal evaporative loss.

2. **Unmet Crop Demand Penalty ($H_{\text{unmet}}$):**
   $$H_{\text{unmet}} = \sum_i P_i \cdot \left(1 - \sum_t x_{i, t}\right)^2$$
   Severely penalizes omitting fields with high crop sensitivity ($P_i$) and depleted root-zone moisture.

3. **Slot Conflict Constraint ($H_{\text{conflict}}$):**
   $$H_{\text{conflict}} = \sum_i \sum_{t_1 < t_2} x_{i, t_1} x_{i, t_2}$$
   Guarantees each field is scheduled at most once per daily cycle.

4. **Reservoir Water Budget ($H_{\text{water\_budget}}$):**
   $$H_{\text{water\_budget}} = \max\left(0, \sum_{i, t} x_{i, t} D_i - W_{\text{available}}\right)^2$$
   Quadratic penalty preventing allocations beyond reservoir storage capacity.

5. **Canal Throughput Limits ($H_{\text{canal}}$):**
   $$H_{\text{canal}} = \sum_{c, t} \max\left(0, \sum_{i \in \text{Canal}_c} x_{i, t} D_i - \text{Capacity}_c(t)\right)^2$$

### Quantum-Inspired Simulated Annealing (QSA) Solver:
Unlike classical local hill-climbing algorithms that get trapped in local energy minima, our solver models **quantum tunneling** through high-cost penalty barriers using a transverse-field Hamiltonian:
$$H(s) = (1 - s) H_{\text{transverse}} + s H_{\text{problem}}$$
The transverse field $\Gamma(s) = \Gamma_0 (1 - s)^2$ decays gradually, allowing quantum tunneling transitions across narrow constraint walls.

---

## 🏗️ System Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts for responsive visualizations.
- **Full-Stack Ingress Server (AI Studio):** Node.js + Express on port 3000 + Vite SPA middleware + SQLite persistence layer.
- **Python Backend (FastAPI):** Complete standalone Python FastAPI service in `backend/` with SQLAlchemy ORM, Pydantic schemas, and NumPy/SciPy optimization solver.
- **Database:** SQLite (persisted locally with schema for fields, water resources, canals, pumps, weather, alerts, and optimization runs).

---

## 🚀 Running the Application

### Option A: Standard Full-Stack Web Application (Port 3000)
```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Standalone Python FastAPI Backend (Port 8000)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
FastAPI Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎯 Complete Hackathon Demonstration Flow

1. **Dashboard:** Review live water stress indicator, reservoir capacity, and baseline vs optimized KPIs.
2. **Fields & Crops:** View real Krishna-Godavari demo plots (F1 Tomato, F2 Paddy, F3 Groundnut, F4 Cotton, F5 Maize, F6 Chillies). Add or edit demo fields.
3. **Water Resources:** Inspect Prakasam Barrage and Sir Arthur Cotton Head Tanks alongside Canal capacities (C1, C2, C3).
4. **Weather & Soil:** Observe real-time soil moisture telemetry and incoming convective rain radar.
5. **Run Quantum Optimization:** Trigger the Quantum-Inspired QUBO solver; watch convergence energy landscape and qubit coupling matrix.
6. **Irrigation Schedule:** Inspect explainable recommendations (e.g., F1 irrigated early morning via solar pump; F2 delayed because soil moisture is 78% and rainfall is expected).
7. **What-If Simulation:** Select the "Drought" preset (water reduced by 50%). Run simulation to see how the optimizer reallocates water strictly to high-priority flowering crops while generating emergency alerts.
