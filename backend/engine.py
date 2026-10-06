"""Safety rules + Isolation Forest anomaly detection + trend forecast + health score."""
import time
from collections import deque
import numpy as np
from sklearn.ensemble import IsolationForest
from simulator import Simulator
from i18n import LANGS, advice, say

PARAMS = ["temperature", "ph", "do", "turbidity", "ammonia"]
INF = float("inf")

LIMITS = {
    "temperature": (22, 26, 32, 35),
    "ph": (6.0, 6.5, 8.5, 9.0),
    "do": (3.0, 5.0, INF, INF),
    "turbidity": (-INF, -INF, 60, 100),
    "ammonia": (-INF, -INF, 0.5, 1.0),
}
SCALE = {"temperature": 6, "ph": 1.5, "do": 3, "turbidity": 40, "ammonia": 0.5}

def classify(p, v):
    cl, wl, wh, ch = LIMITS[p]
    if v <= cl: return 2, "low"
    if v >= ch: return 2, "high"
    if v < wl: return 1, "low"
    if v > wh: return 1, "high"
    return 0, None

class Detector:
    def __init__(self):
        sim = Simulator(seed=7)
        X = [[r[p] for p in PARAMS] for r in (sim.next() for _ in range(4000))]
        self.model = IsolationForest(n_estimators=150, contamination=0.005, random_state=7).fit(X)

    def is_anomaly(self, vals):
        return bool(self.model.predict([[vals[p] for p in PARAMS]])[0] == -1)

def forecast(history, p, step_min, n=8, horizon=18):
    ys = [r["values"][p] for r in list(history)[-n:]]
    if len(ys) < n: return None
    slope = np.polyfit(range(n), ys, 1)[0]
    cur = ys[-1]
    _, wl, wh, _ = LIMITS[p]
    if abs(slope) < 0.01 * SCALE[p]: return None
    if slope > 0 and wh != INF and cur <= wh: target, side = wh, "high"
    elif slope < 0 and wl != -INF and cur >= wl: target, side = wl, "low"
    else: return None
    ticks = (target - cur) / slope
    if ticks <= 0 or ticks > horizon: return None
    return {"param": p, "target": target, "side": side, "eta_min": round(ticks * step_min)}

class Monitor:
    def __init__(self, step_min=10):
        self.step, self.detector = step_min, Detector()
        self.history, self.alerts = deque(maxlen=720), deque(maxlen=40)
        self.prev, self.prev_fc, self.on_danger = {}, set(), None

    def _alert(self, label, level, text):
        a = {"time": label, "level": level, "text": text}
        self.alerts.appendleft(a)
        if level == "Danger" and self.on_danger: self.on_danger(a)

    def process(self, raw):
        vals = {p: float(raw[p]) for p in PARAMS}
        cls = {p: classify(p, v) for p, v in vals.items()}
        levels = {p: c[0] for p, c in cls.items()}
        anomaly = self.detector.is_anomaly(vals)
        rec = {"label": raw.get("label") or time.strftime("%H:%M:%S"),
               "values": vals, "levels": levels, "anomaly": anomaly}
        self.history.append(rec)
        fcs = [f for p in PARAMS if levels[p] == 0 and (f := forecast(self.history, p, self.step))]
        rec["forecasts"] = fcs

        adv = [advice(p, side) for p, (lv, side) in cls.items() if lv]
        for f in fcs:
            a, b = say("heads", f["param"], target=f["target"], eta=f["eta_min"]), advice(f["param"], f["side"])
            adv.append({l: a[l] + b[l] for l in LANGS})
        if anomaly and not adv:
            adv.append(say("unusual"))
        rec["advice"] = adv

        score = 100 - sum((0, 12, 30)[l] for l in levels.values()) - (8 if anomaly else 0) - 4 * len(fcs)
        rec["score"] = max(0, min(100, score))
        worst = max(levels.values())
        rec["state"] = ("Danger" if worst == 2 or rec["score"] < 55
                        else "Watch" if worst == 1 or fcs or anomaly else "Safe")

        for p in PARAMS:
            if levels[p] > self.prev.get(p, 0):
                self._alert(rec["label"], "Danger" if levels[p] == 2 else "Watch",
                            say("crit" if levels[p] == 2 else "out", p, v=vals[p]))
        for f in fcs:
            if f["param"] not in self.prev_fc:
                self._alert(rec["label"], "Watch", say("pred", f["param"], target=f["target"], eta=f["eta_min"]))
        self.prev, self.prev_fc = levels, {f["param"] for f in fcs}
        return rec

    def state(self, n=80):
        h = list(self.history)
        return {"latest": h[-1] if h else None,
                "history": [{"label": r["label"], "values": r["values"]} for r in h[-n:]],
                "alerts": list(self.alerts)}
