import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMedia, illustratedPhoto, originalTrack } from './socialMedia';
import type { SocialAction, SocialWorld } from './socialModel';
import { useSystemStore } from '../../store/useSystemStore';
export const SocialContext = createContext<{ social: SocialWorld; player: any; cycle: number; act: (a: SocialAction) => boolean; visit: (id: string) => void; go: (section: string) => void }> (null!);
export const useSocial = () => useContext(SocialContext);
export function useMediaSource(id: string) {
  const [source, setSource] = useState('');
  useEffect(() => {
    let active = true, url = '';
    setSource('');
    if (!id) return;
    if (id.startsWith('builtin:') && !['builtin:stillwater', 'builtin:starlight'].includes(id)) { setSource(illustratedPhoto(id.slice(8))); return; }
    (async () => {
      const blob = id.startsWith('builtin:') ? originalTrack(id === 'builtin:starlight') : await getMedia(id);
      if (!active || !blob) return;
      url = URL.createObjectURL(blob); setSource(url);
    })().catch(() => { if (active) setSource(''); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return source;
}
export function SocialImage({ asset, alt, className = '' }: { asset: string; alt: string; className?: string }) {
  const src = useMediaSource(asset);
  return src ? <img className={className} src={src} alt={alt}/> : <span className={`ms-missing ${className}`}>{asset ? 'Image unavailable on this device. Restore your media backup.' : 'No image selected'}</span>;
}
export function MusicPlayer({ track }: { track: string }) {
  const { social } = useSocial();
  const soundEnabled = useSystemStore(s => s.soundEnabled);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [track]);
  const src = useMediaSource(track);
  const title = track === 'builtin:stillwater' ? 'Stillwater — original ambient loop' : track === 'builtin:starlight' ? 'Starlight — original synth loop' : social.assets.find(a => a.id === track)?.name || 'Profile track';
  return <div className="ms-player"><span>♫ ON THE TURNTABLE</span><strong>{title}</strong>{src && !failed ? <audio key={src} controls loop muted={!soundEnabled} preload="metadata" src={src} onPlay={e => { e.currentTarget.closest('.mai-space-root')?.querySelectorAll('audio').forEach(a => { if (a !== e.currentTarget) a.pause(); }); }} onError={() => setFailed(true)}/> : <p>Audio unavailable or unsupported. Import the saved media backup or select another track.</p>}<small>Press play to listen. No autoplay.{!soundEnabled && ' Desktop audio is muted.'}</small></div>;
}
