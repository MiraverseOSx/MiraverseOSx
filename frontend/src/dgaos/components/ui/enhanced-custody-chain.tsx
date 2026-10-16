'use client';
import {ChevronDown,ChevronUp,Shield} from 'lucide-react';
import {useState} from 'react';

export interface CustodyEntry {
  at: string;
  from: string;
  to: string;
  location: string;
  reason: string;
  seal: string;
}

export function EnhancedCustodyChain({custody=[]}:{custody?:CustodyEntry[]}){
 const [expanded,setExpanded]=useState(false);
 return <section className="panel panel-padding"><button type="button" className="section-toggle" onClick={()=>setExpanded(!expanded)}>{expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>}<h2>Chain of custody ({custody.length})</h2></button>{expanded&&<div className="custody-timeline">{custody.map((entry:CustodyEntry,i:number)=><div key={i} className="custody-entry"><div className="custody-marker"><Shield size={14}/></div><div className="custody-details"><strong>{entry.at.split('T')[0]}</strong> <span className="subtext">{entry.at.split('T')[1]?.slice(0,5)}</span><p><strong>From:</strong> {entry.from}</p><p><strong>To:</strong> {entry.to}</p><p><strong>Location:</strong> {entry.location}</p><p><strong>Reason:</strong> {entry.reason}</p><div className="seal-badge">Seal: <span className={entry.seal==='Intact'?'green':'amber'}>{entry.seal}</span></div></div></div>)}</div>}</section>
}
