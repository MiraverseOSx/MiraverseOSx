"""
Ecosystem Engine for MiraverseOSx
Calculates world simulation ticks, corruption spread, resource flows, and weather/astral cycles.
Supports Cython C-extension acceleration with seamless pure Python fallback.
"""

import math
import random
import time
import json

try:
    from .ecosystem_engine_cy import calculate_tick_cy
    HAS_CYTHON = True
except ImportError:
    HAS_CYTHON = False

class EcosystemEngine:
    def __init__(self):
        self.tick_count = 0
        self.world_state = {
            "corruption_level": 12.4,     # Percentage (0-100)
            "prism_harmonic": 88.5,       # Percentage (0-100)
            "aether_density": 1024.0,     # Micro-units
            "astral_phase": "Solstice Alignment",
            "weather_condition": "Aureline Clear",
            "active_anomalies": 2,
            "regional_health": {
                "Aureline Core": 94.2,
                "Orynvell Shallows": 76.5,
                "Versenet Verge": 63.8,
                "Shadow Grid": 31.0
            }
        }

    def process_tick(self, delta_time=1.0):
        self.tick_count += 1
        
        # Calculate subtle dynamic fluctuations
        harmonic_delta = math.sin(self.tick_count * 0.1) * 0.5
        self.world_state["prism_harmonic"] = round(max(0.0, min(100.0, self.world_state["prism_harmonic"] + harmonic_delta)), 2)
        
        # Micro corruption drift based on active anomalies
        corruption_drift = (self.world_state["active_anomalies"] * 0.05) - (self.world_state["prism_harmonic"] * 0.001)
        self.world_state["corruption_level"] = round(max(0.0, min(100.0, self.world_state["corruption_level"] + corruption_drift)), 2)
        
        # Dynamic weather shift
        weather_types = ["Aureline Clear", "Aether Surge", "Prism Drift", "Shadow Mist", "Ion Cloud"]
        if self.tick_count % 30 == 0:
            self.world_state["weather_condition"] = random.choice(weather_types)
            
        # Update regional health
        for region in self.world_state["regional_health"]:
            decay = (self.world_state["corruption_level"] / 100.0) * 0.1
            regen = (self.world_state["prism_harmonic"] / 100.0) * 0.08
            new_val = self.world_state["regional_health"][region] - decay + regen
            self.world_state["regional_health"][region] = round(max(0.0, min(100.0, new_val)), 2)

        return {
            "tick": self.tick_count,
            "timestamp": time.time(),
            "engine": "Python_Fallback",
            "state": self.world_state
        }

# Global singleton instance for easy invocation
engine_instance = EcosystemEngine()

def calculate_tick():
    if HAS_CYTHON:
        try:
            return calculate_tick_cy()
        except Exception:
            pass
    return json.dumps(engine_instance.process_tick())
