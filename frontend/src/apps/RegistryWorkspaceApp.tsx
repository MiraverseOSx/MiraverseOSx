import React, { useEffect, useState } from 'react';
import { loadCitizenRefs, type CitizenRecordRef } from '../integration/citizenBridge';
export default function RegistryWorkspaceApp(){
 const [citizens,setCitizens]=useState<CitizenRecordRef[]>([]);
 useEffect(()=>{ const refresh=()=>setCitizens(loadCitizenRefs()); const message=(e:MessageEvent)=>{if(e.origin===location.origin&&e.data?.source==='meridion-registry'&&e.data?.type==='citizens-changed')refresh()};refresh();window.addEventListener('message',message);window.addEventListener('focus',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('message',message);window.removeEventListener('focus',refresh);window.removeEventListener('storage',refresh)}},[]);
 return <div className="flex h-full min-h-0 flex-col bg-[#F8F6FC] text-[#25283C]"><div className="flex justify-between bg-white border-b px-3 py-2 text-xs"><strong>AURA · Citizen Registry</strong><span>{citizens.length} saved citizens</span></div><iframe title="Citizen Registry" src="/registry.html" className="min-h-0 w-full flex-1 border-0"/></div>;
}
