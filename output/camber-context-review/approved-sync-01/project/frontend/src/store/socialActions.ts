import { changeSocial, restoreSocial, type SocialAction, type SocialWorld } from '../apps/social/socialModel';
export interface SocialActions { socialAction: (action: SocialAction) => { ok: boolean; message: string }; }
export function createSocialActions(set: any, get: any): SocialActions {
  return { socialAction(action) {
    const state = get(), player = state.gameplay.player;
    const social = restoreSocial(player.maiSpaceWorld, player.maiSpaceProfile);
    const result = changeSocial(social, action, state.gameplay.timeCycleCount || 0, `social:${crypto.randomUUID()}`);
    if (!result.ok) return result;
    // Keep the established MAI.SPACE-004 welcome reward once, never per friend.
    const welcome = action.type === 'friend' && !social.friends.includes('jeremie') && result.state.friends.includes('jeremie') && !state.gameplay.starterCompletedLoops?.includes('mai_space') && !(player.maiSpaceProfile?.acceptedFriends?.length);
    set((s: any) => ({ gameplay: { ...s.gameplay, starterCompletedLoops: welcome ? [...(s.gameplay.starterCompletedLoops || []), 'mai_space'] : s.gameplay.starterCompletedLoops, player: { ...s.gameplay.player, ...(welcome ? { credits: s.gameplay.player.credits + 100, xp: s.gameplay.player.xp + 75, level: Math.floor((s.gameplay.player.xp + 75) / 100) + 1 } : {}), maiSpaceWorld: result.state, maiSpaceProfile: { ...s.gameplay.player.maiSpaceProfile, acceptedFriends: result.state.friends } } } }));
    return { ok: result.ok, message: result.message };
  } };
}
