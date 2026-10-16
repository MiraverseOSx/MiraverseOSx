'use client';
import {useEffect,useState} from 'react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import type {Template} from '@/lib/records';

 export function TemplateSelector({module,method,selectedTemplateId,onSelect,disabled=false}:{module:string;method:string;selectedTemplateId?:string;onSelect:(templateId:string)=>void;disabled?:boolean}){
  const [templates,setTemplates]=useState<Template[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
   void fetch('/api/records?action=templates')
     .then(r=>r.json() as Promise<Template[]>)
     .then(t=>{
       const filtered=(t||[]).filter((tmpl:Template)=>tmpl.module===module&&tmpl.method===method);
       setTemplates(filtered);
     })
     .catch(()=>setTemplates([]))
     .finally(()=>setLoading(false));
  },[module,method]);
  if(loading||templates.length===0)return null;
  return <label className="field"><div>Lab result template</div><Select value={selectedTemplateId||''} onValueChange={(val)=>onSelect(String(val||''))} disabled={disabled}><SelectTrigger aria-label="Lab result template"><SelectValue>{templates.find(t=>t.id===selectedTemplateId)?.name||'Choose template…'}</SelectValue></SelectTrigger><SelectContent><SelectItem value="">No template</SelectItem>{templates.map(t=><SelectItem key={t.id} value={t.id}>{t.name}{t.isDefault?' (recommended)':''}</SelectItem>)}</SelectContent></Select>{templates.find(t=>t.id===selectedTemplateId)?.description&&<p className="footnote">{templates.find(t=>t.id===selectedTemplateId)?.description}</p>}</label>
 }
