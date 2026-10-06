# 🌊 AquaSentinel: Predictive Water-Quality & Fish-Health Intelligence

Predictive biophysical water-quality and fish-welfare monitoring platform for sustainable aquaculture (freshwater tilapia, shrimp, and biofloc ponds).

🌐 **Live GitHub Pages Application**: [https://rakshithakonka-design.github.io/AquaSentinel/](https://rakshithakonka-design.github.io/AquaSentinel/)

---

## 🌟 Key Features

1. **Top Command Center & Diurnal Solar Engine**:
   - Diurnal cycle clock (Dawn, Midday Solar Peak, Dusk, Night Watch) contextualizing photosynthetic oxygen production vs night respiration.
   - Live telemetry cadence toggle (`1.5s`, `3s`, `Pause`) and procedural Web Audio alert chimes.
   - **Trilingual Localization**: Instant switching between **English (EN)**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
   - One-click CSV telemetry exporter.

2. **Pond Health Index & ML Anomaly Detection**:
   - Radial animated SVG gauge (0–100 Pond Health Score).
   - Real-time indicator for **Isolation Forest Unsupervised Machine Learning Anomaly Detection**.
   - Trend forecasts counter (e.g. *DO may breach safe levels in ~20 min*).

3. **Core Biophysical Parameters Matrix**:
   - Individual cards for **Dissolved Oxygen (DO)**, **Water Temperature**, **pH**, **Un-ionized Ammonia ($NH_3$)**, and **Turbidity**.
   - Real-time SVG sparklines, safe target range progress bars, and predictive ETA alarm indicators.

4. **Interactive Multi-Series Telemetry Chart**:
   - High-precision SVG cubic bezier curves with interactive crosshairs and parameter toggles.

5. **Pond Digital Twin Cross-Section**:
   - Underwater simulation profile reflecting water clarity, swimming fish dynamics, and aerator paddlewheel states in response to telemetry.

6. **AI Advisory Copilot & Alert Audit**:
   - Integrated aquaculture copilot with prompt recommendations for water remediation, aeration, and feeding adjustments.
   - Audited chronological incident log with severity filtering (`Danger`, `Watch`, `All`) and one-click acknowledgment.

7. **Emergency Simulation Lab & IoT Sensor Ingestion**:
   - 1-click incident stress testing: **Oxygen Depletion**, **Ammonia Spike**, **Heatwave**, **pH Crash**, and **Turbidity Surge**.
   - Manual IoT Gateway testing station to post custom telemetry directly to `/api/ingest`.

---

## 🚀 Running Locally in Visual Studio Code

### Step 1: One-Click Launch
- **Windows**: Double-click `run_all.bat`.
- **Mac / Linux**: Run `bash run_all.sh` in the terminal.
- **Or via VS Code Debugger (F5)**: Select **"Full-Stack (Backend + Frontend)"** and press **F5**.

Both backend (`http://localhost:5000`) and frontend (`http://localhost:3000`) will launch automatically.

---

## 🛠 Manual Execution

### Terminal 1: Python Flask Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Backend runs at: `http://localhost:5000`*

### Terminal 2: React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:3000`*

---

## 📡 Sensor Ingestion API
POST sensor data from ESP32, Raspberry Pi, or LoRaWAN gateways:
```bash
curl -X POST http://localhost:5000/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: aquasentinel-secret-key" \
  -d '{
    "temperature": 28.5,
    "ph": 7.4,
    "do": 5.8,
    "turbidity": 32.0,
    "ammonia": 0.12
  }'
```

---

## 🌐 GitHub Pages Deployment
The repository includes automated GitHub Actions deployment ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
Whenever changes are pushed to `main`, GitHub Pages automatically builds and publishes the production application.
In standalone/GitHub Pages mode, the client-side biophysical simulation engine activates seamlessly in the browser.
