"""AquaSentinel Flask Server: Ingestion API, Isolation Forest Engine, Simulation & AI Advisory."""
import os, threading, time
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from engine import Monitor, PARAMS, LIMITS
from i18n import LANGS, NAMES, TPL
from simulator import Simulator, FAULTS

load_dotenv()
STEP = int(os.getenv("STEP_MINUTES", "10"))
TICK = float(os.getenv("TICK_SECONDS", "1.5"))
SIMULATE = os.getenv("SIMULATE", "1") == "1"
INGEST_KEY = os.getenv("INGEST_KEY", "")
API_KEY = os.getenv("ANTHROPIC_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
PORT = int(os.getenv("PORT", "5000"))
LANG_NAMES = {"en": "English", "te": "Telugu", "hi": "Hindi"}

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)
mon, sim, lock = Monitor(STEP), Simulator(STEP), threading.Lock()

def notify(alert):
    tok, chat = os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
    if not (tok and chat) or time.time() - getattr(notify, "last", 0) < 300:
        return
    notify.last = time.time()
    try:
        lang = os.getenv("NOTIFY_LANG", "en")
        text = alert.get("text", {}).get(lang, "Critical alert detected")
        requests.post(
            f"https://api.telegram.org/bot{tok}/sendMessage",
            json={"chat_id": chat, "text": f"AquaSentinel Alert: {text}"},
            timeout=5
        )
    except requests.RequestException:
        pass

mon.on_danger = notify

def loop():
    while True:
        with lock:
            mon.process(sim.next())
        time.sleep(TICK)

@app.get("/")
def index():
    if os.path.exists("../frontend/dist/index.html"):
        return send_from_directory("../frontend/dist", "index.html")
    return jsonify({
        "service": "AquaSentinel Full-Stack API Server",
        "status": "Online",
        "endpoints": {
            "state": "GET /api/state",
            "ingest": "POST /api/ingest",
            "inject": "POST /api/inject",
            "ask": "POST /api/ask"
        },
        "cors_enabled": True
    })

@app.get("/api/state")
def state():
    with lock:
        return jsonify(mon.state())

@app.post("/api/ingest")
def ingest():
    if INGEST_KEY and request.headers.get("X-API-Key") != INGEST_KEY:
        return jsonify(error="Missing or invalid X-API-Key header"), 401
    d = request.get_json(silent=True) or {}
    try:
        reading = {p: float(d[p]) for p in PARAMS}
    except (KeyError, TypeError, ValueError):
        return jsonify(error=f"Send valid numeric values for: {', '.join(PARAMS)}"), 400
    with lock:
        rec = mon.process(reading)
    return jsonify(state=rec["state"], score=rec["score"], label=rec["label"])

@app.post("/api/inject")
def inject():
    name = (request.get_json(silent=True) or {}).get("fault")
    with lock:
        ok = sim.inject(name)
    return (jsonify(ok=True) if ok else (jsonify(error=f"Choose one of: {', '.join(FAULTS)}"), 400))

@app.post("/api/ask")
def ask():
    d = request.get_json(silent=True) or {}
    q = str(d.get("question", "")).strip()[:500]
    lang = d.get("lang") if d.get("lang") in LANGS else "en"
    if not q:
        return jsonify(error="Type a question first"), 400
    with lock:
        L = mon.history[-1] if mon.history else None
    
    if not L:
        return jsonify(mode="offline", answer="Pond telemetry is initializing.")

    advice_text = " ".join(x[lang] for x in L.get("advice", [])[:3]) if L.get("advice") else TPL[lang]["allok"]
    return jsonify(mode="offline", answer=advice_text)

if SIMULATE:
    for _ in range(60):
        mon.process(sim.next())
    threading.Thread(target=loop, daemon=True).start()

if __name__ == "__main__":
    print(f">> AquaSentinel Server running at http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, threaded=True)
