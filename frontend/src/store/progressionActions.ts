import type { OSStoreState } from './useOSStore';
import { emptyWorldJournal, EXPLORATION_PLACES, availableDiscoveryPoints, dailyActivityPlan, ADVENTURE_CHOICES, ADVENTURE_SCENES, hasRelayKnowledge, type DiscoveryEntry, type WorldJournal } from '../gameplay/ProgressionEngine';
import { getOpportunity, opportunityStatus } from '../gameplay/AssignmentFlow';
import { useToastStore } from './useToastStore';

type Result = { ok: boolean; message: string };
export interface ProgressionActions {
  visitAurelinePlace: (id: string) => Result;
  observeDiscovery: (id: string) => Result;
  markDiscoveryRead: (id: string) => void;
  refreshContextualDiscoveries: () => void;
  performDailyActivity: (id: string, detail: string, completedSteps: number) => Result;
  chooseAdventureApproach: (id: string, choice: string) => Result;
  openWorldJournal: () => void;
  finishAdventureScene: (id: string) => Result;
}
export function createProgressionActions(set: (update: (state: OSStoreState) => Partial<OSStoreState>) => void, get: () => OSStoreState): ProgressionActions {
  const journal = (): WorldJournal => get().gameplay.player.worldJournal || emptyWorldJournal();
  const update = (change: (current: WorldJournal) => WorldJournal) => set(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, worldJournal: change(state.gameplay.player.worldJournal || emptyWorldJournal()) } } }));
  const record = (entry: DiscoveryEntry): Result => {
    if (journal().entries[entry.id]) return { ok: false, message: 'This observation is already in your journal.' };
    const opportunity = entry.opportunityId ? getOpportunity(entry.opportunityId) : undefined;
    const finished = opportunity && ['Completed', 'Collected'].includes(opportunityStatus(opportunity, get().gameplay.player, get().gameplay.timeCycleCount));
    const notify = entry.presentation !== 'clue' && !finished;
    update(current => ({ ...current, entries: { ...current.entries, [entry.id]: entry },
      revealedOpportunities: entry.opportunityId && !current.revealedOpportunities.includes(entry.opportunityId) ? [...current.revealedOpportunities, entry.opportunityId] : current.revealedOpportunities,
      explorationRewards: entry.reward && !current.explorationRewards.includes(entry.reward) ? [...current.explorationRewards, entry.reward] : current.explorationRewards,
      notifications: notify ? { ...current.notifications, [entry.id]: { title: entry.title, message: entry.text, presentation: entry.presentation, opportunityId: entry.opportunityId, read: false } } : current.notifications,
    }));
    if (notify && entry.presentation !== 'journal' && typeof window !== 'undefined') useToastStore.getState().pushToast({ title: entry.presentation === 'quest' ? 'Optional Quest available' : entry.presentation === 'adventure' ? 'Adventure invitation' : 'Place discovered', message: entry.title, tone: 'info' });
    get().refreshAssignmentDispatches();
    return { ok: true, message: entry.text };
  };
  return {
    visitAurelinePlace: id => {
      const place = EXPLORATION_PLACES.find(item => item.id === id);
      if (!place) return { ok: false, message: 'That place is not available.' };
      update(current => ({ ...current, currentPlace: id, visitedPlaces: current.visitedPlaces.includes(id) ? current.visitedPlaces : [...current.visitedPlaces, id] }));
      return { ok: true, message: place.description };
    },
    observeDiscovery: id => {
      const point = availableDiscoveryPoints(get().gameplay.player).find(item => item.id === id);
      if (!point) return { ok: false, message: 'There is nothing you can identify here yet.' };
      return record({ id, title: point.title, text: point.text, presentation: point.presentation, discoveredAt: new Date().toISOString(), opportunityId: point.opportunityId, reward: point.reward });
    },
    markDiscoveryRead: id => {
      if (!Object.hasOwn(journal().notifications, id) || journal().notifications[id].read) return;
      update(current => ({ ...current, notifications: { ...current.notifications, [id]: { ...current.notifications[id], read: true } } }));
    },
    refreshContextualDiscoveries: () => {
      const player = get().gameplay.player;
      const order = player.worknetOrders?.['ms-shift-04'];
      // Work and exploration can combine into an emergent invitation; neither silently starts it.
      if (journal().entries['platform-hum'] && hasRelayKnowledge(player) && order?.incidents?.length && !order.remediationRequired && order.resultIds?.some((id: string) => player.taskResults?.[id]?.stageId === 'report')) {
        record({ id: 'relay-response', title: 'Your field notes connect', text: 'The platform rhythm and the incident review point to a wider relay investigation. You can follow a new field-response Adventure, or leave the invitation for later.', presentation: 'adventure', discoveredAt: new Date().toISOString(), opportunityId: 'adventure-relay-response' });
      }
    },
    performDailyActivity: (id, detail, completedSteps) => {
      const plan = dailyActivityPlan(id, get().gameplay.player);
      if (!plan || !(plan.choices as readonly string[]).includes(detail) || completedSteps !== plan.steps.length) return { ok: false, message: 'Finish your chosen routine before recording it.' };
      const cycle = get().gameplay.timeCycleCount;
      const previousMinutes = journal().life.minutesSpent;
      update(current => ({ ...current, life: { ...current.life,
        familiarity: { ...current.life.familiarity, [id]: (current.life.familiarity[id] || 0) + 1 },
        minutesSpent: current.life.minutesSpent + plan.minutes,
        arrangement: id === 'decorate' ? detail : current.life.arrangement,
        history: [...current.life.history.slice(-19), { activity: id, detail, cycle, minutes: plan.minutes }],
      } }));
      const segments = Math.floor((previousMinutes + plan.minutes) / 360) - Math.floor(previousMinutes / 360);
      if (segments) set(state => ({ gameplay: { ...state.gameplay, timeSegmentIndex: ((state.gameplay.timeSegmentIndex || 0) + segments) % 4, timeCycleCount: state.gameplay.timeCycleCount + Math.floor(((state.gameplay.timeSegmentIndex || 0) + segments) / 4) } }));
      return { ok: true, message: `${detail} · ${plan.minutes} minutes spent. ${plan.familiar ? 'Your familiar routine takes fewer steps.' : 'You are becoming familiar with the routine.'}` };
    },
    chooseAdventureApproach: (id, choiceId) => {
      const opportunity = getOpportunity(id);
      const choice = ADVENTURE_CHOICES.find(item => item.id === choiceId);
      const assignmentJournal = get().gameplay.player.assignmentJournal;
      if (opportunity?.kind !== 'adventure' || !choice || !assignmentJournal?.started?.[id]) return { ok: false, message: 'Choose this Adventure before deciding your approach.' };
      if (assignmentJournal.claimed[id] || journal().branches[id]) return { ok: false, message: 'Your recorded approach remains part of this Adventure.' };
      update(current => ({ ...current, branches: { ...current.branches, [id]: { choice: choiceId, selectedAt: new Date().toISOString(), consequence: choice.consequence } }, flags: current.flags.includes(choice.flag) ? current.flags : [...current.flags, choice.flag] }));
      return { ok: true, message: choice.consequence };
    },
    openWorldJournal: () => {
      update(current => ({ ...current, openRequest: current.openRequest + 1 }));
      if (get().windows.some(window => window.id === 'lore')) get().focusWindow('lore');
      else get().toggleApp('lore');
    },
    finishAdventureScene: id => {
      const scene = ADVENTURE_SCENES.find(item => item.id === id);
      if (!scene || !get().gameplay.player.assignmentJournal?.started?.[scene.adventureId]) return { ok: false, message: 'Choose this Adventure before opening its scenes.' };
      if (journal().scenesSeen.includes(id)) return { ok: true, message: 'Scene revisited.' };
      update(current => ({ ...current, scenesSeen: [...current.scenesSeen, id] }));
      return { ok: true, message: 'Scene kept in your Adventure record.' };
    },
  };
}
