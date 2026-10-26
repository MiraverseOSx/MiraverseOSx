import { getProfile as personasProfile } from '../game-content/characters/collections/personas';
/**
 * MIRAVERSE OS x — NPC Dialogue & Persona Engine (TypeScript)
 * Integrates with the C# Backend AI Controller (/api/ai/chat) powered by
 * Google Gemini + OpenAI with persistent SQLite NPC memories, cost limits,
 * and deterministic offline fallbacks.
 */

import { useOSStore } from '../store/useOSStore';
import { worldEventEngine } from './WorldEventEngine';
import { findCharactersByName, resolveCharacterReference } from '../game-content/characters/registry';

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
    Mai: personasProfile("Mai"),
    Jeremie: personasProfile("Jeremie"),
    Aelita: personasProfile("Aelita"),
    Sissi: personasProfile("Sissi"),
    Vaelen: personasProfile("Vaelen"),
    Kaelen: personasProfile("Kaelen"),
    'Dean Cassian Rook': personasProfile("Dean Cassian Rook")
  };

  private personaKey(name: string): string {
    if (Object.hasOwn(this.personas, name)) return name;
    const matches = findCharactersByName(name);
    if (matches.length !== 1) return name;
    return Object.keys(this.personas).find(key => resolveCharacterReference('personas', key)?.id === matches[0].id) || name;
  }

  /**
   * Generates NPC response enriched with shared WorldEventEngine narrative memory,
   * persistent SQLite NPC memories, and C# controller budgeting.
   */
  public async generateDialogue(
    npcName: string,
    prompt: string,
    extraContext = ''
  ): Promise<NPCDialogueResponse> {
    const stableNpcKey = this.personaKey(npcName);
    const persona = Object.hasOwn(this.personas, stableNpcKey) ? this.personas[stableNpcKey] : {
      name: npcName,
      role: 'Citizen of Aureline',
      tone: 'Neutral',
      greetings: ['Greetings traveler.'],
      systemContext: `You are ${npcName}, a resident of Aureline.`
    };

    const gameplayState = useOSStore.getState()?.gameplay;
    const narrative = worldEventEngine.buildNarrativeContextForNPC(stableNpcKey, gameplayState);
    const combinedContext = `${persona.systemContext} Tone: ${persona.tone}. Shared World Memory: ${narrative.summaryText} ${extraContext}`.trim();

    // 1. Query the C# Backend AI Subsystem (/api/ai/chat)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npc: stableNpcKey,
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
    const key = this.personaKey(name);
    return Object.hasOwn(this.personas, key) ? this.personas[key] : undefined;
  }
}

export const npcEngine = new NPCEngine();
