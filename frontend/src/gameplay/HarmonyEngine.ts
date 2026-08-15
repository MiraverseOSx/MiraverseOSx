/**
 * MIRAVERSE OS x — Harmony & Elemental Matrix Engine (TypeScript)
 * Handles spell synthesis resolution, elemental synergy scaling,
 * hacking probabilities (Sigmoid distribution), and combat checks.
 */

export type ElementType = 'Fire' | 'Water' | 'Nature' | 'Air' | 'Earth' | 'Aether' | 'Ignis' | 'Aqua' | 'Terra' | 'Aer' | 'Lux' | 'Umbra';

export interface SpellPowerResult {
  engine: 'TypeScript_Native';
  element: string;
  final_power: number;
  is_critical: boolean;
  efficiency: number;
  resonance_multiplier: number;
}

export interface HackResult {
  engine: 'TypeScript_Native';
  success: boolean;
  probability_percent: number;
  roll: number;
  traced: boolean;
}

export class HarmonyEngine {
  private static readonly ELEMENT_AFFINITIES: Record<string, Record<string, number>> = {
    Fire: { Water: 0.5, Nature: 1.5, Air: 1.2, Earth: 0.8 },
    Ignis: { Aqua: 0.5, Terra: 1.5, Aer: 1.2, Umbra: 0.8 },
    Water: { Fire: 1.5, Nature: 0.8, Air: 0.8, Earth: 1.2 },
    Aqua: { Ignis: 1.5, Terra: 0.8, Aer: 0.8, Lux: 1.2 },
    Nature: { Fire: 0.8, Water: 1.2, Air: 0.5, Earth: 1.5 },
    Terra: { Ignis: 0.8, Aqua: 1.2, Aer: 0.5, Umbra: 1.5 },
    Air: { Fire: 1.2, Water: 1.2, Nature: 1.5, Earth: 0.5 },
    Aer: { Ignis: 1.2, Aqua: 1.2, Terra: 1.5, Lux: 0.5 },
    Earth: { Fire: 1.2, Water: 0.8, Nature: 0.5, Air: 1.5 },
    Lux: { Umbra: 2.0, Ignis: 1.0, Aqua: 1.0, Terra: 1.0 },
    Umbra: { Lux: 2.0, Ignis: 1.0, Aqua: 1.0, Terra: 1.0 },
    Aether: { Fire: 1.0, Water: 1.0, Nature: 1.0, Air: 1.0, Earth: 1.0 }
  };

  /**
   * Calculates dynamic spell matrix power and rune amplification with critical roll.
   */
  public calculateSpellPower(
    element: string,
    utilityPower: number,
    runeModifierLevel: number,
    playerLevel = 1,
    corruptionPenalty = 0.0
  ): SpellPowerResult {
    const basePower = utilityPower * (1.0 + playerLevel * 0.05);
    const modifierMultiplier = 1.0 + runeModifierLevel * 0.12;
    const corruptionMultiplier = Math.max(0.2, 1.0 - corruptionPenalty / 100.0);

    let finalPower = Math.round(basePower * modifierMultiplier * corruptionMultiplier * 100) / 100;
    const isCritical = Math.random() < 0.18; // 18% critical resonance

    if (isCritical) {
      finalPower = Math.round(finalPower * 1.5 * 100) / 100;
    }

    return {
      engine: 'TypeScript_Native',
      element,
      final_power: finalPower,
      is_critical: isCritical,
      efficiency: Math.round(corruptionMultiplier * 1000) / 10,
      resonance_multiplier: Math.round(modifierMultiplier * 100) / 100
    };
  }

  /**
   * Calculates subnetwork hacking probability along a Sigmoid curve.
   */
  public calculateHackSuccess(
    playerHackingSkill: number,
    nodeSecurityLevel: number,
    encryptedLayers = 1
  ): HackResult {
    const diff = playerHackingSkill - nodeSecurityLevel * 10 - encryptedLayers * 5;
    const probability = 1.0 / (1.0 + Math.exp(-diff / 15.0));
    const roll = Math.random();
    const success = roll < probability;

    return {
      engine: 'TypeScript_Native',
      success,
      probability_percent: Math.round(probability * 1000) / 10,
      roll: Math.round(roll * 1000) / 10,
      traced: !success && roll > probability + 0.25
    };
  }

  /**
   * Retrieves affinity multiplier between attacker and defender elements.
   */
  public getAffinityMultiplier(attacker: string, defender: string): number {
    return HarmonyEngine.ELEMENT_AFFINITIES[attacker]?.[defender] ?? 1.0;
  }
}

export const harmonyEngine = new HarmonyEngine();
