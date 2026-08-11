"""
NPC Brain for MiraverseOSx
Integrates with Groq API (miragroq key) for ultra-fast, real-time AI inference
and mcp-agents-groq Agent Orchestrator with seamless fallback responses.
"""

import json
import os
import urllib.request
import urllib.error

class NPCBrain:
    def __init__(self, groq_api_key=None, default_model="llama-3.3-70b-versatile", orchestrator_url="http://localhost:5050/api/agent"):
        self.groq_api_key = groq_api_key or os.environ.get("GROQ_API_KEY", "miragroq")
        self.default_model = default_model
        self.orchestrator_url = orchestrator_url
        
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

        # 1. Try MCP Agent Orchestrator endpoint first
        try:
            orch_payload = {
                "prompt": f"[{npc_name}] {prompt}",
                "context": system_instruction
            }
            req = urllib.request.Request(
                self.orchestrator_url,
                data=json.dumps(orch_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("response"):
                    return {
                        "npc": npc_name,
                        "source": "mcp-agents-groq",
                        "model": self.default_model,
                        "text": data["response"]
                    }
        except Exception:
            pass

        # 2. Try Direct Groq API endpoint with miragroq key
        if self.groq_api_key:
            groq_payload = {
                "model": self.default_model,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.6,
                "max_tokens": 150
            }
            try:
                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=json.dumps(groq_payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.groq_api_key}"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=2) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    if text:
                        return {
                            "npc": npc_name,
                            "source": "Groq API (miragroq)",
                            "model": self.default_model,
                            "text": text
                        }
            except Exception:
                pass

        # 3. Fallback response generation
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

