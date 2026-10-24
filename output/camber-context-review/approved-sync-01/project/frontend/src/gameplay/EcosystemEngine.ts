/**
 * MIRAVERSE OS x — Ecosystem Simulation Engine (TypeScript)
 * Calculates world simulation ticks, corruption spread, resource flows,
 * astral phases, and dynamic weather patterns across Aureline districts.
 */

export interface WorldState {
  corruption_level: number;
  prism_harmonic: number;
  aether_density: number;
  astral_phase: string;
  weather_condition: string;
  active_anomalies: number;
  regional_health: Record<string, number>;
}

export interface TickResult {
  tick: number;
  timestamp: number;
  engine: 'TypeScript_Native';
  state: WorldState;
}

export class EcosystemEngine {
  private tickCount = 0;
  private worldState: WorldState = {
    corruption_level: 12.4,
    prism_harmonic: 88.5,
    aether_density: 1024.0,
    astral_phase: 'Solstice Alignment',
    weather_condition: 'Aureline Clear',
    active_anomalies: 2,
    regional_health: {
      'Aureline Core': 94.2,
      'Orynvell Shallows': 76.5,
      'Versenet Verge': 63.8,
      'Shadow Grid': 31.0
    }
  };

  private readonly WEATHER_TYPES = [
    'Aureline Clear',
    'Aether Surge',
    'Prism Drift',
    'Shadow Mist',
    'Ion Cloud'
  ];

  /**
   * Advances the world simulation state by one tick cycle.
   */
  public processTick(deltaTime = 1.0): TickResult {
    this.tickCount += 1;

    // Harmonic wave fluctuations
    const harmonicDelta = Math.sin(this.tickCount * 0.1) * 0.5 * deltaTime;
    this.worldState.prism_harmonic = Math.round(
      Math.max(0.0, Math.min(100.0, this.worldState.prism_harmonic + harmonicDelta)) * 100
    ) / 100;

    // Dynamic corruption drift
    const corruptionDrift = (this.worldState.active_anomalies * 0.05 - this.worldState.prism_harmonic * 0.001) * deltaTime;
    this.worldState.corruption_level = Math.round(
      Math.max(0.0, Math.min(100.0, this.worldState.corruption_level + corruptionDrift)) * 100
    ) / 100;

    // Periodic weather shift every 30 ticks
    if (this.tickCount % 30 === 0) {
      const idx = Math.floor(Math.random() * this.WEATHER_TYPES.length);
      this.worldState.weather_condition = this.WEATHER_TYPES[idx];
    }

    // Regional health degradation / regeneration
    const health = { ...this.worldState.regional_health };
    for (const region of Object.keys(health)) {
      const decay = (this.worldState.corruption_level / 100.0) * 0.1 * deltaTime;
      const regen = (this.worldState.prism_harmonic / 100.0) * 0.08 * deltaTime;
      const newVal = health[region] - decay + regen;
      health[region] = Math.round(Math.max(0.0, Math.min(100.0, newVal)) * 100) / 100;
    }
    this.worldState.regional_health = health;

    return {
      tick: this.tickCount,
      timestamp: Date.now(),
      engine: 'TypeScript_Native',
      state: { ...this.worldState }
    };
  }

  public getState(): WorldState {
    return { ...this.worldState };
  }

  public setAnomalyCount(count: number): void {
    this.worldState.active_anomalies = Math.max(0, count);
  }
}

export const ecosystemEngine = new EcosystemEngine();
