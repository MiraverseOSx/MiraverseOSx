import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music2, Upload, Download, Trash2 } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { useSystemStore } from '../../store/useSystemStore';
import { storeMedia, getMedia, removeMedia, exportMedia, importMedia } from '../../apps/social/socialMedia';

const MusicContext=createContext<any>(null);
export function DesktopMusicProvider({children}:{children:React.ReactNode}) {
 const tracks=useOSStore(s=>s.desktopPreferences.music), volume=useOSStore(s=>s.desktopPreferences.volume),sound=useSystemStore(s=>s.soundEnabled);
 const audio=useRef<HTMLAudioElement>(null);const [index,setIndex]=useState(0);const [playing,setPlaying]=useState(false);const [position,setPosition]=useState(0);const [duration,setDuration]=useState(0);const [error,setError]=useState('');const [revision,setRevision]=useState(0);const resume=useRef(false);const current=tracks[index];
 const select=(next:number)=>{resume.current=playing;setIndex((next+tracks.length)%Math.max(1,tracks.length));setRevision(v=>v+1);};
 useEffect(()=>{let live=true,url='';audio.current?.pause();setPlaying(false);setPosition(0);setDuration(0);setError('');
   if(!current){if(audio.current){audio.current.removeAttribute('src');audio.current.load();}if(index)setIndex(0);return;}
   getMedia(current.id).then(blob=>{if(!live)return;if(!blob){setError('This audio file is missing. Restore your music backup or add the file again.');return;}url=URL.createObjectURL(blob);audio.current!.src=url;audio.current!.load();if(resume.current){resume.current=false;audio.current!.play().catch(()=>setError('Playback could not start. Press Play to try again.'));}}).catch(()=>{if(live)setError('Audio storage is unavailable.');});
   return()=>{live=false;audio.current?.pause();if(url)URL.revokeObjectURL(url);};
 },[current?.id,revision]);
 useEffect(()=>{if(audio.current){audio.current.volume=volume;audio.current.muted=!sound;}},[volume,sound]);
 const toggle=async()=>{if(!audio.current?.getAttribute('src')||error)return;if(playing)audio.current.pause();else try{await audio.current.play();}catch{setError('This audio format could not be played. Choose another track.');}};
 const value={tracks,current,index,playing,position,duration,error,select,toggle,reload:()=>setRevision(v=>v+1),seek:(n:number)=>{if(audio.current&&Number.isFinite(n))audio.current.currentTime=n;}};
 return <MusicContext.Provider value={value}>{children}<audio ref={audio} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={()=>setPosition(audio.current?.currentTime||0)} onLoadedMetadata={()=>setDuration(Number.isFinite(audio.current?.duration)?audio.current!.duration:0)} onError={()=>setError('This audio could not be loaded. Restore the file or choose another track.')} onEnded={()=>{resume.current=true;select(index+1);resume.current=true;}}/></MusicContext.Provider>;
}
export function DesktopMusicWidget() {
 const m=useContext(MusicContext);const p=useOSStore(s=>s.desktopPreferences);const action=useOSStore(s=>s.desktopAction);const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 const perform=async(fn:()=>Promise<any>)=>{setBusy(true);setNotice('');try{await fn();}catch(e){setNotice(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
 const upload=async(files:FileList|null)=>{if(!files)return;await perform(async()=>{for(const file of Array.from(files)){if(!file.type.startsWith('audio/'))throw new Error('Choose an audio file.');const state=useOSStore.getState();const social=state.gameplay.player.maiSpaceWorld?.assets||[];const bytes=[...state.desktopPreferences.music,...social].reduce((n,a)=>n+a.size,0);const asset=await storeMedia(file,bytes);action({type:'music-add',asset});}});};
 const time=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
 return <div className="desktop-music"><div className="desktop-track"><Music2 size={28}/><div><strong>{m.current?.name||'Your music'}</strong><small>{m.playing?'Playing':m.current?'Paused':'Add audio to begin'}</small></div></div>
  <div className="desktop-media-buttons"><button aria-label="Previous track" disabled={!m.tracks.length} onClick={()=>m.select(m.index-1)}><SkipBack size={17}/></button><button aria-label={m.playing?'Pause music':'Play music'} disabled={!m.current||!!m.error} onClick={m.toggle}>{m.playing?<Pause size={22}/>:<Play size={22}/>}</button><button aria-label="Next track" disabled={!m.tracks.length} onClick={()=>m.select(m.index+1)}><SkipForward size={17}/></button></div>
  <input type="range" aria-label="Music position" min={0} max={m.duration||1} step=".1" value={Math.min(m.position,m.duration||1)} disabled={!m.duration} onChange={e=>m.seek(Number(e.target.value))}/><div className="desktop-tiny">{time(m.position)} / {time(m.duration)}</div>
  <label className="desktop-volume">Volume<input type="range" aria-label="Music volume" min="0" max="1" step=".05" value={p.volume} onChange={e=>action({type:'volume',value:Number(e.target.value)})}/></label>
  <label className="desktop-action-file"><Upload size={13}/> Add music<input aria-label="Add desktop music" type="file" accept="audio/*" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value='';}}/></label>
  {m.error&&<p role="status">{m.error}</p>}{notice&&<p role="status">{notice}</p>}
  <details><summary>Playlist & backups ({m.tracks.length})</summary>{m.tracks.map((a,i)=><div key={a.id} className="desktop-playlist-row"><button onClick={()=>m.select(i)} aria-pressed={i===m.index}>{a.name}</button><button aria-label={`Remove music ${a.name}`} onClick={()=>perform(async()=>{await removeMedia(a.id);action({type:'music-remove',id:a.id});})}><Trash2 size={13}/></button></div>)}<button disabled={busy||!m.tracks.length} onClick={()=>perform(()=>exportMedia(m.tracks,'desktop-music-backup.json'))}><Download size={13}/> Back up music</button><label className="desktop-action-file">Restore music<input aria-label="Restore desktop music" type="file" accept="application/json" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void perform(async()=>{const count=await importMedia(file,m.tracks);m.reload();setNotice(`Restored ${count} audio files.`);});e.target.value='';}}/></label><p className="desktop-tiny">Audio stays on this device. World backups save playlist details; back up the audio separately.</p></details>
 </div>;
}
