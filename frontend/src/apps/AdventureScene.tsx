import React, { useState } from 'react';
import { ADVENTURE_SCENES } from '../gameplay/ProgressionEngine';
import { useOSStore } from '../store/useOSStore';

export default function AdventureScene({ adventureId }: { adventureId: string }) {
  const scene = ADVENTURE_SCENES.find(item => item.adventureId === adventureId);
  const [beat, setBeat] = useState(-1);
  const seen = useOSStore(state => state.gameplay.player.worldJournal?.scenesSeen || []);
  if (!scene) return null;
  return <section className="adventure-scene" aria-label="Adventure scene"><span className="workspace-kicker">Cinematic moment / playable prototype</span><h2>{scene.title}</h2>{beat < 0 ? <button onClick={() => setBeat(0)}>{seen.includes(scene.id) ? 'Revisit the scene' : 'Enter the scene'}</button> : <><p aria-live="polite">{scene.beats[beat]}</p><div><span>{beat + 1} / {scene.beats.length}</span><button onClick={() => { if (beat < scene.beats.length - 1) setBeat(current => current + 1); else { useOSStore.getState().finishAdventureScene(scene.id); setBeat(-1); } }}>{beat < scene.beats.length - 1 ? 'Continue' : 'Return to the Adventure'}</button><button onClick={() => setBeat(-1)}>Leave scene</button></div></>}</section>;
}
