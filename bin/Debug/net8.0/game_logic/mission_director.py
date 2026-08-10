"""
Mission Director for MiraverseOSx
Procedurally generates events, field missions, anomalies, and bounties.
"""

import random
import uuid

class MissionDirector:
    def __init__(self):
        self.mission_types = ["Infiltration", "Aether Purification", "Data Retrieval", "PRISM Defense", "Rune Calibration"]
        self.regions = ["Aureline Core", "Orynvell Shallows", "Versenet Verge", "Shadow Grid"]
        self.factions = ["DGA High Command", "Aureline Academy", "Shadow Guild", "Faith Medical Network"]
        self.rewards = ["Aura Credits", "Elemental Runes", "Encrypted Data Core", "PRISM Stabilizer"]

    def generate_mission(self, player_level=1, region=None):
        m_id = f"MIS-{uuid.uuid4().hex[:6].upper()}"
        m_type = random.choice(self.mission_types)
        m_region = region if region in self.regions else random.choice(self.regions)
        m_faction = random.choice(self.factions)
        
        difficulty = random.choice(["Novice", "Adept", "Master", "Overclocked"])
        xp_reward = player_level * random.randint(150, 400)
        credit_reward = player_level * random.randint(250, 800)
        item_reward = random.choice(self.rewards)

        titles = {
            "Infiltration": f"Operation Glass Shadow in {m_region}",
            "Aether Purification": f"Purify corrupted aether node in {m_region}",
            "Data Retrieval": f"Extract cipher manifest from {m_faction}",
            "PRISM Defense": f"Defend Aureline grid array in {m_region}",
            "Rune Calibration": f"Harmonize regional rune matrix for {m_faction}"
        }

        descriptions = {
            "Infiltration": "Bypass security firewalls, intercept encrypted telemetry, and return without triggering PRISM alarms.",
            "Aether Purification": "Use SpellForge elemental protocols to purge corruption spores infecting the regional node.",
            "Data Retrieval": "Locate lost citizen archives and decrypt sealed biometric manifests.",
            "PRISM Defense": "Repel PRISM integrity spikes threatening to destabilize local district shields.",
            "Rune Calibration": "Synthesize a balanced elemental glyph chain to stabilize high-frequency magical currents."
        }

        return {
            "id": m_id,
            "title": titles.get(m_type, "Field Operation"),
            "type": m_type,
            "region": m_region,
            "faction": m_faction,
            "difficulty": difficulty,
            "description": descriptions.get(m_type, "Standard tactical objective."),
            "rewards": {
                "xp": xp_reward,
                "credits": credit_reward,
                "item": item_reward
            },
            "status": "Available"
        }

director_instance = MissionDirector()

def create_procedural_mission(player_level=1, region=None):
    return director_instance.generate_mission(player_level, region)
