"""
NPC Brain for MiraverseOSx
Integrates with local Ollama AI endpoint (http://localhost:11434/api/generate)
with seamless fallback responses for offline / non-Ollama environments.
"""

import json
import urllib.request
import urllib.error

class NPCBrain:
    def __init__(self, ollama_url="http://localhost:11434/api/generate", default_model="llama3"):
        self.ollama_url = ollama_url
        self.default_model = default_model
        
        self.personas = {
            "Mai": {
                "role": "Celestial Taskbar Companion & PRISM Integrity Monitor",
                "tone": "Warm, encouraging, observant, slightly analytical",
                "greetings": [
                    "Greetings Netrunner! I've been monitoring your biometric resonance.",
                    "System integrity at nominal levels. What matrix segment are we analyzing today?",
                    "PRISM pulse detected nearby. Maintain your elemental shields!"
                ]
            },
            "Vaelen": {
                "role": "Orynvell SpellForge Scholar & Rune Master",
                "tone": "Stoic, precise, mystical",
                "greetings": [
                    "The arcana demands disciplined focus. Have you brought element core samples?",
                    "Channeling aether without proper glyph grounding will scorch your terminal.",
                    "Observe the elemental matrix—the runes speak to those who listen."
                ]
            },
            "Kaelen": {
                "role": "Versenet Shadow Broker",
                "tone": "Cynical, sharp, cautious",
                "greetings": [
                    "Keep your voice low. The DGA monitors every quantum packet.",
                    "Got data to trade or are you just taking up bandwidth?",
                    "Shadow grid nodes are twitchy today. Watch your back access protocols."
                ]
            }
        }

    def generate_dialogue(self, npc_name, prompt, system_context=""):
        persona = self.personas.get(npc_name, {
            "role": "Citizen of Aureline",
            "tone": "Neutral",
            "greetings": ["Greetings traveler."]
        })

        system_instruction = (
            f"You are {npc_name}, a {persona['role']} in the cyberpunk/fantasy world of MiraverseOSx. "
            f"Tone: {persona['tone']}. Keep your responses concise (1-3 sentences max) and immersive. "
            f"{system_context}"
        )

        payload = {
            "model": self.default_model,
            "prompt": f"System: {system_instruction}\nUser: {prompt}\n{npc_name}:",
            "stream": False
        }

        try:
            req = urllib.request.Request(
                self.ollama_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                response_text = data.get("response", "").strip()
                if response_text:
                    return {
                        "npc": npc_name,
                        "source": "ollama",
                        "model": self.default_model,
                        "text": response_text
                    }
        except Exception:
            pass  # Fallback to persona template engine if Ollama endpoint is down

        # Fallback response generation
        fallback_templates = [
            f"[{persona['role']}] {prompt[:30]}... Understood. We must maintain harmony across the grid.",
            f"[{persona['role']}] Direct signal received. Ensure your civic registration and elemental matrix are synced.",
            f"[{persona['role']}] The Versenet telemetry reflects your query: '{prompt}'. Proceed with caution."
        ]
        import random
        selected_fallback = random.choice(fallback_templates)
        return {
            "npc": npc_name,
            "source": "fallback_engine",
            "model": "rule_based_brain",
            "text": selected_fallback
        }

brain_instance = NPCBrain()

def get_npc_response(npc_name, prompt, context=""):
    return json.dumps(brain_instance.generate_dialogue(npc_name, prompt, context))
