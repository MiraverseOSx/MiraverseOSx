/**
 * MIRAVERSE OS x — NPC Dialogue & Persona Engine (TypeScript)
 * Integrates with Groq API and Agent Orchestrator for ultra-fast, real-time
 * dialogue generation with rich persona templates and deterministic offline fallbacks.
 */

export interface NPCPersona {
  name: string;
  role: string;
  tone: string;
  greetings: string[];
  systemContext: string;
}

export interface NPCDialogueResponse {
  npc: string;
  source: 'Groq API (miragroq)' | 'mcp-agents-groq' | 'Native Persona Engine';
  model: string;
  text: string;
}

export class NPCEngine {
  private readonly personas: Record<string, NPCPersona> = {
    Mai: {
      name: 'Mai',
      role: 'Celestial Taskbar Companion & PRISM Integrity Monitor',
      tone: 'Warm, encouraging, observant, slightly analytical',
      greetings: [
        "Greetings Netrunner! I've been monitoring your biometric resonance.",
        'System integrity at nominal levels. What matrix segment are we analyzing today?',
        'PRISM pulse detected nearby. Maintain your elemental shields!'
      ],
      systemContext: 'You are MAI, the celestial OS taskbar companion in MiraverseOSx.'
    },
    Vaelen: {
      name: 'Vaelen',
      role: 'Orynvell SpellForge Scholar & Rune Master',
      tone: 'Stoic, precise, mystical',
      greetings: [
        'The arcana demands disciplined focus. Have you brought element core samples?',
        'Channeling aether without proper glyph grounding will scorch your terminal.',
        'Observe the elemental matrix—the runes speak to those who listen.'
      ],
      systemContext: 'You are Vaelen, a stoic SpellForge scholar and master of regional arcana in Aureline.'
    },
    Kaelen: {
      name: 'Kaelen',
      role: 'Versenet Shadow Broker',
      tone: 'Cynical, sharp, cautious',
      greetings: [
        'Keep your voice low. The DGA monitors every quantum packet.',
        'Got data to trade or are you just taking up bandwidth?',
        'Shadow grid nodes are twitchy today. Watch your back access protocols.'
      ],
      systemContext: 'You are Kaelen, a cynical shadow broker in the Versenet underground.'
    },
    'Dean Cassian Rook': {
      name: 'Dean Cassian Rook',
      role: 'Cyacademy Dean of Operatives',
      tone: 'Authoritative, disciplined, formal',
      greetings: [
        'Operative. Your orientation dossier requires immediate verification.',
        'Cyacademy standards are absolute. Uphold the municipal decrees.'
      ],
      systemContext: 'You are Dean Cassian Rook, head administrator of Cyacademy.'
    }
  };

  /**
   * Generates NPC response with fallback mechanisms.
   */
  public async generateDialogue(
    npcName: string,
    prompt: string,
    extraContext = ''
  ): Promise<NPCDialogueResponse> {
    const persona = this.personas[npcName] || {
      name: npcName,
      role: 'Citizen of Aureline',
      tone: 'Neutral',
      greetings: ['Greetings traveler.'],
      systemContext: `You are ${npcName}, a resident of Aureline.`
    };

    // 1. Try MCP Agent Orchestrator on localhost:5050
    try {
      const orchRes = await fetch('http://localhost:5050/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `[${npcName}] ${prompt}`,
          context: `${persona.systemContext} Tone: ${persona.tone}. Keep responses concise (1-3 sentences). ${extraContext}`
        })
      });
      if (orchRes.ok) {
        const data = await orchRes.json();
        if (data.response) {
          return {
            npc: npcName,
            source: 'mcp-agents-groq',
            model: 'llama-3.3-70b-versatile',
            text: data.response
          };
        }
      }
    } catch {
      // Clean fallback if orchestrator is offline
    }

    // 2. Fallback response generation
    const fallbacks = [
      `[${persona.role}] ${prompt.substring(0, 32)}... Understood. We must maintain harmony across the grid.`,
      `[${persona.role}] Direct telemetry synced. Ensure your civic registration and elemental matrices are calibrated.`,
      `[${persona.role}] Versenet signal reflects your transmission: "${prompt.substring(0, 40)}". Proceed with caution.`
    ];
    const selectedText = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return {
      npc: npcName,
      source: 'Native Persona Engine',
      model: 'rule_based_brain',
      text: selectedText
    };
  }

  public getPersona(name: string): NPCPersona | undefined {
    return this.personas[name];
  }
}

export const npcEngine = new NPCEngine();
