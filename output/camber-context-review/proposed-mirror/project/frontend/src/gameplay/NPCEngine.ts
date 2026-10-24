/**
 * MIRAVERSE OS x — NPC Dialogue & Persona Engine (TypeScript)
 * Integrates with the C# Backend AI Controller (/api/ai/chat) powered by
 * Google Gemini + OpenAI with persistent SQLite NPC memories, cost limits,
 * and deterministic offline fallbacks.
 */

import { useOSStore } from '../store/useOSStore';
import { worldEventEngine } from './WorldEventEngine';

export interface NPCPersona {
  name: string;
  role: string;
  tone: string;
  greetings: string[];
  systemContext: string;
}

export interface NPCDialogueResponse {
  npc: string;
  source: 'Google Gemini' | 'OpenAI' | 'Native Persona Engine' | string;
  model: string;
  text: string;
  narrativeContext?: string;
  tokens?: { prompt: number; completion: number; total: number };
  estimatedCostUsd?: number;
  memoriesUsed?: string[];
  cached?: boolean;
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
    Jeremie: {
      name: 'Jeremie',
      role: 'Hardware & Terminal Architecture Engineer',
      tone: 'Thoughtful, focused, technical, enthusiastic',
      greetings: [
        'Hey! Just reviewing the sub-Aureline signal bus ^_^',
        'Check out these circuit schematics when you get a chance.',
        'Logic gates are looking clean today.'
      ],
      systemContext: 'You are Jeremie Belpois, a brilliant hardware and software systems engineer.'
    },
    Aelita: {
      name: 'Aelita',
      role: 'Harmonic Synthesizer & Botanical Analyst',
      tone: 'Gentle, intuitive, melodic, peaceful',
      greetings: [
        'Hello ✿ the garden air feels especially clear today.',
        'Listening to the subtle resonance in the quiet hours ♡',
        'Have you noticed the gentle melody along the fountain path?'
      ],
      systemContext: 'You are Aelita Schaeffer, an intuitive synthesizer artist and botanist.'
    },
    Sissi: {
      name: 'Sissi',
      role: 'Aureline Socialite & Trends Editor',
      tone: 'Chic, confident, trendy, playful',
      greetings: [
        'Hey there! Love the look of your profile today ~ xoxo',
        'Have you checked the latest updates on the social feed?',
        'We need to coordinate plans for the weekend soon ♡'
      ],
      systemContext: 'You are Elisabeth Delmas (Sissi), high-society style curator and trendsetter.'
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
   * Generates NPC response enriched with shared WorldEventEngine narrative memory,
   * persistent SQLite NPC memories, and C# controller budgeting.
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

    const gameplayState = useOSStore.getState()?.gameplay;
    const narrative = worldEventEngine.buildNarrativeContextForNPC(npcName, gameplayState);
    const combinedContext = `${persona.systemContext} Tone: ${persona.tone}. Shared World Memory: ${narrative.summaryText} ${extraContext}`.trim();

    // 1. Query the C# Backend AI Subsystem (/api/ai/chat)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npc: npcName,
          prompt,
          activeApp: 'dialogue',
          context: combinedContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          const providerLabel =
            data.provider === 'google-gemini'
              ? 'Google Gemini'
              : data.provider === 'openai'
              ? 'OpenAI'
              : 'Native Persona Engine';

          return {
            npc: npcName,
            source: providerLabel,
            model: data.model || 'csharp-controller',
            text: data.text,
            narrativeContext: narrative.summaryText,
            tokens: data.tokens,
            estimatedCostUsd: data.estimatedCostUsd,
            memoriesUsed: data.memoriesUsed,
            cached: data.cached
          };
        }
      }
    } catch {
      // Clean fallback if backend is offline or starting
    }

    // 2. Context-aware deterministic persona response incorporating world events & player history
    const selectedText = `[${persona.role}] Re: "${prompt.substring(0, 40)}" — ${narrative.contextualReply}`;

    return {
      npc: npcName,
      source: 'Native Persona Engine',
      model: 'narrative_memory_brain',
      text: selectedText,
      narrativeContext: narrative.summaryText
    };
  }

  public getPersona(name: string): NPCPersona | undefined {
    return this.personas[name];
  }
}

export const npcEngine = new NPCEngine();
