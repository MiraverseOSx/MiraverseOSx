import React, { useEffect, useState } from 'react';
import { loadCitizenRefs, type CitizenRecordRef } from '../integration/citizenBridge';
export default function TraceWorkspaceApp(){
 const [people,setPeople]=useState<CitizenRecordRef[]>([]);
 useEffect(()=>{const refresh=()=>setPeople(loadCitizenRefs());const message=(e:MessageEvent)=>{if(e.origin===location.origin&&e.data?.source==='meridion-registry'&&e.data?.type==='citizens-changed')refresh()};refresh();window.addEventListener('message',message);window.addEventListener('focus',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('message',message);window.removeEventListener('focus',refresh);window.removeEventListener('storage',refresh)}},[]);
 return <div className="h-full overflow-auto bg-[#101420] p-5 text-[#E8E4F4]"><h2 className="text-lg font-semibold">TRACE · Forensic Workstation</h2><p className="mt-3 text-sm">Integration staging only. The DGAOS / TRACE backend remains separate and unchanged.</p><h3 className="mt-6 text-xs uppercase">Registry-linked citizens ({people.length})</h3>{people.map(p=><div className="mt-2 rounded border border-[#43415B] p-3 text-xs" key={p.id}><strong>{p.name}</strong><div>{p.id} · {p.species} · {p.home}</div></div>)}</div>;
}
