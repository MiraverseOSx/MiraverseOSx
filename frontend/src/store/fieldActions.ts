import type { OSStoreState } from './useOSStore';
import { FIELD_MISSION, restoreFieldSession, interactField, fieldReady } from '../gameplay/FieldOperations';
import { nextWorkStage } from '../gameplay/ActivityEngine';

export function createFieldActions(set: any, get: () => OSStoreState) {
  const active = () => {
    const state = get(), order = state.gameplay.player.worknetOrders?.[FIELD_MISSION];
    return state.isLoggedIn && order?.status === 'active' && order.briefingReadAt && !order.remediationRequired ? order : null;
  };
  return {
    fieldAction: (action: 'move' | 'interact' | 'record', payload: any) => {
      const order = active();
      if (!order) return { ok: false, message: 'Accept the assignment and read its briefing in WORKNET first. Resolve any equipment incident before continuing.' };
      const session = restoreFieldSession(order.fieldSession);
      if (action === 'record') {
        if (!fieldReady(session) || !session.sealed) return { ok: false, message: 'Complete the investigation and containment first.' };
        // Submit canonical stage outputs through the existing validators and receipt system.
        for (const id of ['inspect', 'contain']) {
          const current = get().gameplay.player.worknetOrders[FIELD_MISSION];
          const stage = nextWorkStage(current, get().gameplay.player.taskResults || {});
          if (stage?.id !== id) continue;
          const result = get().submitWorknetStage(FIELD_MISSION, id, id === 'inspect'
            ? { pid: '512', frequency: '88.2' } : { team: 'Hazmat-01 and Patrol-12', seal: 'SealLockCrypt' });
          if (!result.ok) return result;
        }
        return { ok: true, message: 'Field findings recorded in WORKNET. Write your containment report, then finalize the assignment.' };
      }
      let next = session, message = 'Position saved.';
      if (action === 'move') {
        if (!Number.isFinite(payload?.x) || !Number.isFinite(payload?.y)) return { ok: false, message: 'Invalid position.' };
        next = restoreFieldSession({ ...session, x: payload.x, y: payload.y });
      } else if (action === 'interact') {
        const result = interactField(session, payload?.id);
        if (!result.ok) return { ok: false, message: result.message };
        next = result.session; message = result.message;
      } else return { ok: false, message: 'Unknown field action.' };
      set((state: OSStoreState) => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player,
        worknetOrders: { ...state.gameplay.player.worknetOrders, [FIELD_MISSION]: { ...state.gameplay.player.worknetOrders[FIELD_MISSION], fieldSession: next } } } } }));
      return { ok: true, message };
    },
  };
}
