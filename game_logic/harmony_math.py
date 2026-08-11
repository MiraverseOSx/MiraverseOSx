"""
Harmony Math for MiraverseOSx
Handles complex resolution math: spell synthesis efficiency, hacking probability,
combat checks, and elemental harmony matrices.
Supports Cython C-extension acceleration with seamless pure Python fallback.
"""

import math
import random
import json

try:
    from .harmony_math_cy import resolve_spell_cy, resolve_hack_cy
    HAS_CYTHON_MATH = True
except ImportError:
    HAS_CYTHON_MATH = False

class HarmonyMath:
    def __init__(self):
        # Elemental affinities (multiplier matrix)
        self.element_matrix = {
            "Fire": {"Water": 0.5, "Nature": 1.5, "Air": 1.2, "Earth": 0.8},
            "Water": {"Fire": 1.5, "Nature": 0.8, "Air": 0.8, "Earth": 1.2},
            "Nature": {"Fire": 0.8, "Water": 1.2, "Air": 0.5, "Earth": 1.5},
            "Air": {"Fire": 1.2, "Water": 1.2, "Nature": 1.5, "Earth": 0.5},
            "Earth": {"Fire": 1.2, "Water": 0.8, "Nature": 0.5, "Air": 1.5},
            "Aether": {"Fire": 1.0, "Water": 1.0, "Nature": 1.0, "Air": 1.0, "Earth": 1.0}
        }

    def calculate_spell_power(self, element, utility_power, rune_modifier, player_level=1, corruption_penalty=0.0):
        base_power = utility_power * (1.0 + (player_level * 0.05))
        modifier_mult = 1.0 + (rune_modifier * 0.1)
        corruption_mult = max(0.2, 1.0 - (corruption_penalty / 100.0))
        
        final_power = round(base_power * modifier_mult * corruption_mult, 2)
        critical_strike = random.random() < 0.15
        
        if critical_strike:
            final_power = round(final_power * 1.5, 2)

        return {
            "engine": "Python_Fallback",
            "element": element,
            "final_power": final_power,
            "is_critical": critical_strike,
            "efficiency": round(corruption_mult * 100, 1)
        }

    def calculate_hack_success(self, player_hacking_skill, node_security_level, encrypted_layers=1):
        # Sigmoid curve for resolution calculation
        diff = player_hacking_skill - (node_security_level * 10) - (encrypted_layers * 5)
        probability = 1.0 / (1.0 + math.exp(-diff / 15.0))
        roll = random.random()
        success = roll < probability
        
        return {
            "engine": "Python_Fallback",
            "success": success,
            "probability_percent": round(probability * 100, 1),
            "roll": round(roll * 100, 1),
            "traced": not success and roll > (probability + 0.3)
        }

math_instance = HarmonyMath()

def resolve_spell(element, power, rune_level, player_level=1, corruption=0.0):
    if HAS_CYTHON_MATH:
        try:
            return resolve_spell_cy(element, float(power), int(rune_level), int(player_level), float(corruption))
        except Exception:
            pass
    return json.dumps(math_instance.calculate_spell_power(element, power, rune_level, player_level, corruption))

def resolve_hack(skill, node_level, layers=1):
    if HAS_CYTHON_MATH:
        try:
            return resolve_hack_cy(float(skill), float(node_level), int(layers))
        except Exception:
            pass
    return json.dumps(math_instance.calculate_hack_success(skill, node_level, layers))
