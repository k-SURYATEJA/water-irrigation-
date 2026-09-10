# AquaQuantum Dataset Repository: Krishna-Godavari Command Areas (Andhra Pradesh)

This folder contains the complete real-world and benchmark datasets supporting the **AI + Quantum-Inspired Irrigation & Water Resource Allocation Optimization** project (Competition Solution Guide UC-033).

---

## 📂 Directory Structure

```
datasets/
├── 1_weather_and_climate/          # Live Open-Meteo API hourly agro-weather feeds
│   ├── krishna_delta_vijayawada_hourly.csv
│   ├── godavari_delta_rajahmundry_hourly.csv
│   ├── guntur_uplands_hourly.csv
│   └── andhra_pradesh_agro_weather_7day.json
│
├── 2_crop_coefficients_fao56/      # FAO-56 Gold-Standard Crop Water Requirements
│   ├── fao56_crop_coefficients.csv
│   └── fao56_crop_water_requirements.json
│
├── 3_soil_hydrology/               # Soil moisture retention & hydraulic conductivity
│   └── krishna_godavari_soil_profiles.csv
│
├── 4_water_resources_and_canals/   # Barrage storage, ayacut areas & canal capacities
│   ├── prakasam_arthur_cotton_barrages.csv
│   └── canal_network_conveyance.csv
│
├── 5_pumps_and_energy_tariffs/     # Pump specs (PM-KUSUM) & APERC Time-of-Day tariffs
│   ├── agricultural_pumps_specifications.csv
│   └── ap_time_of_day_electricity_tariffs.csv
│
└── 6_iot_sensor_telemetry/         # In-situ capacitive soil moisture 7-day time series
    └── field_soil_moisture_sensor_timeseries.csv
```

---

## 🔬 Dataset Details & Schemas

### 1. Weather and Climate Telemetry (`1_weather_and_climate/`)
- **Source:** Open-Meteo Agricultural API (Live 7-Day Forecast & Historical Telemetry)
- **Coordinates Sampled:**
  - Vijayawada / Krishna Delta North: `16.5062° N, 80.6480° E`
  - Rajahmundry / Godavari Lowlands: `16.9891° N, 81.7840° E`
  - Guntur / Upland Reach: `16.3067° N, 80.4365° E`
- **Key Columns:**
  - `timestamp_ist`: Hourly timestamp (Asia/Kolkata timezone)
  - `temperature_2m_c`: Ambient air temperature at 2m height (°C)
  - `relative_humidity_pct`: Atmospheric relative humidity (%)
  - `precipitation_probability_pct`: Doppler convective precipitation probability (0–100%)
  - `precipitation_mm`: Expected precipitation depth (mm)
  - `et0_fao_evapotranspiration_mm`: Reference Evapotranspiration calculated via FAO-56 Penman-Monteith equation
  - `soil_moisture_0_to_10cm_m3m3`: Volumetric topsoil water fraction ($m^3/m^3$)
  - `direct_solar_irradiance_wm2`: Direct beam solar radiation ($W/m^2$) for solar pump output estimation

---

### 2. FAO-56 Crop Coefficients & Agronomy Metrics (`2_crop_coefficients_fao56/`)
- **Source:** FAO Irrigation and Drainage Paper No. 56 (Rome, Italy) & ICAR-CRIDA
- **Crops Included:** Tomato, Paddy (Rice), Groundnut, Cotton, Maize, Chillies, Sugarcane
- **Key Columns:**
  - `crop_id` & `scientific_name`: Botanical taxonomy
  - `kc_initial`, `kc_mid_stage`, `kc_end_stage`: Crop coefficient multipliers across growth phases
  - `optimal_moisture_min_pct` & `optimal_moisture_max_pct`: Safe root-zone moisture envelope
  - `root_depth_min_m` / `root_depth_max_m`: Effective rooting depth for water extraction
  - `critical_growth_stage`: Growth phase sensitive to moisture stress (e.g. Flowering, Panicle Initiation)
  - `yield_response_factor_ky`: Sensitivity penalty ratio ($\Delta Y / Y$ per unit moisture deficit)
  - `allowable_depletion_fraction_p`: Readily Available Water (RAW) depletion threshold before crop stress

---

### 3. Soil Hydrology Profiles (`3_soil_hydrology/`)
- **Source:** ISRIC World Soil Information (SoilGrids 250m) & ICAR-NBSS&LUP
- **Soil Types Covered:**
  - Black Cotton Soil (Vertisol) – Guntur / Amaravati (High water retention, low infiltration)
  - Red Sandy Loam (Alfisol) – Krishna Delta North / Rayanapadu (Rapid drainage, low retention)
  - Clay Loam (Inceptisol) – Godavari Delta Lowlands (Balanced water retention)
  - Deltaic Alluvial Soil (Entisol) – Diviseema Reach (High organic content, good drainage)
- **Key Columns:**
  - `bulk_density_g_cm3`: Dry bulk density ($g/cm^3$)
  - `field_capacity_vol_pct`: Upper moisture limit after free drainage (FC %)
  - `wilting_point_vol_pct`: Permanent wilting point (PWP %)
  - `available_water_capacity_mm_per_m`: Total available water in root zone (mm/m soil depth)
  - `infiltration_rate_mm_hr`: Saturated infiltration rate

---

### 4. Barrages & Canal Conveyance (`4_water_resources_and_canals/`)
- **Source:** India-WRIS (Water Resources Information System) & APWRIMS (Andhra Pradesh Water Resources Department)
- **Infrastructure Covered:**
  - **Prakasam Barrage:** Gross storage 3.071 TMC, Krishna Main Canals, 1.3M acre ayacut.
  - **Sir Arthur Cotton Barrage:** Gross storage 2.93 TMC, Eastern/Central/Western delta canal branches, 1.01M acre ayacut.
  - **Canals C1, C2, C3:** Krishna Main Canal 1, Godavari Eastern Canal 2, Rayanapadu Distributary 3.
- **Key Columns:**
  - `design_discharge_cusecs`: Maximum rated hydraulic throughput in Cusecs
  - `conveyance_efficiency_pct`: Physical conveyance ratio accounting for seepage/evaporative canal losses
  - `reach_type`: Head-reach, middle-reach, or tail-end distributary

---

### 5. Pumps & Time-of-Day Electricity Tariffs (`5_pumps_and_energy_tariffs/`)
- **Source:** APERC (Andhra Pradesh Electricity Regulatory Commission) & PM-KUSUM Solar Scheme
- **Pumps Cataloged:**
  - 5.0 HP Solar Submersible Pump (Off-grid DC Controller, ₹0 grid power cost, 0g CO2)
  - 10.0 HP High-Head 3-Phase Grid Electric Submersible Pump (APCPDCL connection)
  - 8.0 HP Diesel Auxiliary Backup Engine
- **Tariff Slots Covered:**
  - `06:00 - 08:00`: Morning Solar Ramp-Up (Multiplier 0.80, ₹2.50/kWh, 75% Solar)
  - `08:00 - 10:00`: Mid-Morning Peak Solar (Multiplier 1.00, ₹3.20/kWh, 100% Solar)
  - `10:00 - 12:00`: Peak Grid/Evaporation (Multiplier 1.30, ₹4.80/kWh)
  - `16:00 - 18:00`: Evening Twilight Off-Peak (Multiplier 1.10, ₹3.80/kWh)

---

### 6. IoT Soil Moisture Telemetry (`6_iot_sensor_telemetry/`)
- **Source:** In-situ capacitive frequency-domain FMCW soil probe time series across 7 days (4 readings/day).
- **Records:** 168 sensor observations tracking moisture depletion curves, solar valve activations, and convective rain replenishment on Field F2.

---

## 💻 How to Use in Python

```python
import pandas as pd

# 1. Load live weather data for Vijayawada
weather_df = pd.read_csv("1_weather_and_climate/krishna_delta_vijayawada_hourly.csv")
print("Average 7-day ET0 (mm/day):", weather_df["et0_fao_evapotranspiration_mm"].mean())

# 2. Load FAO-56 crop coefficients
crops_df = pd.read_csv("2_crop_coefficients_fao56/fao56_crop_coefficients.csv")
print(crops_df[["common_name", "kc_mid_stage", "water_sensitivity"]])

# 3. Load Barrages and Canals
canals_df = pd.read_csv("4_water_resources_and_canals/canal_network_conveyance.csv")
print(canals_df[["canal_name", "scaled_capacity_liters_per_day", "conveyance_efficiency_pct"]])
```
