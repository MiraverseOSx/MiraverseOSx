import { NPCProfile } from '@/lib/dga-types';

export function updateNpcRelationship(
  npc: NPCProfile,
  deltas: {
    trust?: number;
    familiarity?: number;
    respect?: number;
    tension?: number;
  },
  revealedKnowledge?: string
): NPCProfile {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));

  const updatedKnowledge = revealedKnowledge && !npc.knowledge.includes(revealedKnowledge)
    ? [...npc.knowledge, revealedKnowledge]
    : npc.knowledge;

  return {
    ...npc,
    relationship: {
      trust: clamp(npc.relationship.trust + (deltas.trust || 0)),
      familiarity: clamp(npc.relationship.familiarity + (deltas.familiarity || 0)),
      respect: clamp(npc.relationship.respect + (deltas.respect || 0)),
      tension: clamp(npc.relationship.tension + (deltas.tension || 0))
    },
    knowledge: updatedKnowledge,
    lastInteraction: new Date().toISOString()
  };
}

export function formatNpcGreeting(npc: NPCProfile, agentName: string): string {
  const isHighTrust = npc.relationship.trust >= 75;
  const isHighTension = npc.relationship.tension >= 70;

  switch (npc.communicationStyle) {
    case 'clinical_scientific':
      return isHighTension
        ? `Agent Jerome, we have critical time constraints in the ICU.`
        : `Agent Jerome, Dr. Thorne here. I am reviewing the biohazard specimen metrics.`;
    case 'formal_diplomatic':
      return isHighTrust
        ? `Miracle, good to connect directly. The situation on this end is delicate.`
        : `Special Agent Jerome, Station Geneva transmits diplomatic greetings.`;
    case 'blunt_tactical':
      return isHighTension
        ? `Jerome, heads up. We have an operational breach.`
        : `Agent, Chen on the line. Cyber boundary dump ready.`;
    case 'bureaucratic':
      return `Agent Jerome, this communication is logged under Directorate Protocol 44.`;
    case 'covert_guarded':
      return `I am speaking under secure carrier only. Keep this off the open cables.`;
    default:
      return `Agent Jerome, regarding the ongoing assignment:`;
  }
}
