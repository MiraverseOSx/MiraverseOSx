# cython: language_level=3
"""
Cython Harmony Math for MiraverseOSx
C-accelerated math for spell resolution and sigmoid hacking probability.
"""

from libc.math cimport exp
import random
import json

cdef class CythonHarmonyMath:
    cdef public dict element_matrix

    def __init__(self):
        self.element_matrix = {
            "Fire": {"Water": 0.5, "Nature": 1.5, "Air": 1.2, "Earth": 0.8},
            "Water": {"Fire": 1.5, "Nature": 0.8, "Air": 0.8, "Earth": 1.2},
            "Nature": {"Fire": 0.8, "Water": 1.2, "Air": 0.5, "Earth": 1.5},
            "Air": {"Fire": 1.2, "Water": 1.2, "Nature": 1.5, "Earth": 0.5},
            "Earth": {"Fire": 1.2, "Water": 0.8, "Nature": 0.5, "Air": 1.5},
            "Aether": {"Fire": 1.0, "Water": 1.0, "Nature": 1.0, "Air": 1.0, "Earth": 1.0}
        }

    cpdef dict calculate_spell_power(self, str element, double utility_power, int rune_modifier, int player_level=1, double corruption_penalty=0.0):
        cdef double base_power = utility_power * (1.0 + (player_level * 0.05))
        cdef double modifier_mult = 1.0 + (rune_modifier * 0.1)
        cdef double corruption_mult = max(0.2, 1.0 - (corruption_penalty / 100.0))
        cdef double final_power = base_power * modifier_mult * corruption_mult
        cdef int is_critical = 1 if random.random() < 0.15 else 0

        if is_critical == 1:
            final_power *= 1.5

        return {
            "engine": "Cython_C_Extension",
            "element": element,
            "final_power": round(final_power, 2),
            "is_critical": bool(is_critical),
            "efficiency": round(corruption_mult * 100, 1)
        }

    cpdef dict calculate_hack_success(self, double player_hacking_skill, double node_security_level, int encrypted_layers=1):
        cdef double diff = player_hacking_skill - (node_security_level * 10) - (encrypted_layers * 5)
        # Fast C exp sigmoid calculation
        cdef double probability = 1.0 / (1.0 + exp(-diff / 15.0))
        cdef double roll = random.random()
        cdef int success = 1 if roll < probability else 0

        return {
            "engine": "Cython_C_Extension",
            "success": bool(success),
            "probability_percent": round(probability * 100, 1),
            "roll": round(roll * 100, 1),
            "traced": bool(success == 0 and roll > (probability + 0.3))
        }

cdef CythonHarmonyMath cy_math_instance = CythonHarmonyMath()

def resolve_spell_cy(str element, double power, int rune_level, int player_level=1, double corruption=0.0):
    return json.dumps(cy_math_instance.calculate_spell_power(element, power, rune_level, player_level, corruption))

def resolve_hack_cy(double skill, double node_level, int layers=1):
    return json.dumps(cy_math_instance.calculate_hack_success(skill, node_level, layers))
