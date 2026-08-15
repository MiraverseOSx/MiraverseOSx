/**
 * MIRAVERSE OS x — Gameplay & Simulation Core
 * Central exports for all native TypeScript game systems.
 */

export * from './HarmonyEngine';
export * from './EcosystemEngine';
export * from './MissionDirector';
export * from './NPCEngine';

import { harmonyEngine } from './HarmonyEngine';
import { ecosystemEngine } from './EcosystemEngine';
import { missionDirector } from './MissionDirector';
import { npcEngine } from './NPCEngine';

export const gameplayCore = {
  harmony: harmonyEngine,
  ecosystem: ecosystemEngine,
  missions: missionDirector,
  npc: npcEngine,
};

export default gameplayCore;
