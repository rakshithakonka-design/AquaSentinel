"""Simulated pond sensors: daily temperature/oxygen/pH cycles + injectable faults."""
import math, random

FAULTS = {
    "low_oxygen": ("do", -4.2),
    "ammonia_spike": ("ammonia", 1.6),
    "heatwave": ("temperature", 6.5),
    "ph_crash": ("ph", -1.8),
    "turbidity_surge": ("turbidity", 95),
}

class Simulator:
    def __init__(self, step_min=10, seed=None):
        self.step, self.t = step_min, 8 * 60
        self.rng = random.Random(seed)
        self.fault, self.k = None, 0

    def inject(self, name):
        if name not in FAULTS:
            return False
        self.fault, self.k = name, 0
        return True

    def _ramp(self):
        if not self.fault:
            return 0.0
        k = self.k
        if k < 10:
            return k / 10
        if k < 30:
            return 1.0
        if k < 40:
            return 1 - (k - 30) / 10
        self.fault = None
        return 0.0

    def next(self):
        self.t += self.step
        h = (self.t / 60) % 24
        d = math.sin(2 * math.pi * (h - 9) / 24)
        g = self.rng.gauss
        v = {
            "temperature": 28 + 2.2 * d + g(0, .15),
            "ph": 7.6 + .3 * d + g(0, .03),
            "do": 6.6 + 1.5 * d + g(0, .12),
            "turbidity": 28 + g(0, 1.5),
            "ammonia": max(0.02, .15 + g(0, .015)),
        }
        ramp = self._ramp()
        if self.fault:
            p, delta = FAULTS[self.fault]
            v[p] += delta * ramp
            self.k += 1
        out = {p: round(x, 2) for p, x in v.items()}
        out["label"] = f"{int(h):02d}:{int(self.t % 60):02d}"
        return out
