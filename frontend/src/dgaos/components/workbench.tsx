'use client';
import {useEffect,useState,type SyntheticEvent,type ReactNode} from 'react';
import {Plus,ArrowUpRight,ArrowRight,ArrowLeft,FolderOpen,Package,FlaskConical,FileText,Microscope,Search,Check,Clock,ShieldCheck,Download,BookOpen,RefreshCw,Tag,Printer,Sparkles,CheckCircle2} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from '@/components/ui/table';
import {AttachmentsPanel} from '@/components/ui/attachments-panel';
import {TagsEditor} from '@/components/ui/tags-editor';
import {TemplateSelector} from '@/components/ui/template-selector';
import {EvidenceLabel} from '@/components/ui/evidence-label';
import {ReportDocument} from '@/components/ui/report-document';
import {BenchSheet} from '@/components/ui/bench-sheet';
import {ComparisonMicroscope} from '@/components/ui/comparison-microscope';
import {SpotTestPlate} from '@/components/ui/spot-test-plate';
import {DynamicWorksheet} from '@/components/ui/dynamic-worksheet';
import {QaChecklist} from '@/components/ui/qa-checklist';
import {AnalysisSuggestions} from '@/components/ui/analysis-suggestions';
import {OpenLab} from '@/components/ui/open-lab';
import {EvidenceRoom} from '@/components/ui/evidence-room';
import {QualityAssurance} from '@/components/ui/quality-assurance';
import DetectiveDesk from '@/components/ui/detective-desk';
import CrimeScene from '@/components/ui/crime-scene';
import InterrogationRoom from '@/components/ui/interrogation-room';
import Morgue from '@/components/ui/morgue';
import {CyberTerminal} from '@/components/ui/cyber-terminal';
import {LegalDesk} from '@/components/ui/legal-desk';
import {CitizenRegistry} from '@/components/ui/citizen-registry';
import {CommsCenter} from '@/components/ui/comms-center';
import CourtroomTrial from '@/components/ui/courtroom-trial';
import {modules} from '@/lib/modules';
import type {LabRecord,Kind} from '@/lib/records';
import {acceptAndSignTraceCase} from '@/lib/case-store';

const moduleName=(id:string)=>modules.find(m=>m.id===id)?.name||id;
const date=(value:string)=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
function Badge({children}:{children:ReactNode}){const s=typeof children==='string'||typeof children==='number'?String(children):'';return <span className={'badge '+(['Completed','Issued','Intact','Approved'].includes(s)?'green':s==='Priority'||s==='In review'||s==='Awaiting Acceptance'?'amber':'')}>{children}</span>}
function Choice({label,value,options,onChange}:{label:string;value:string;options:{value:string;label:string}[];onChange:(s:string)=>void}){return <label className="field">{label}<Select value={value} onValueChange={v=>onChange(String(v))}><SelectTrigger aria-label={label}><SelectValue>{options.find(o=>o.value===value)?.label||'Choose…'}</SelectValue></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></label>}
function Field({label,name,value,onChange,area=false,required=true}:{label:string;name:string;value:string;onChange:(s:string)=>void;area?:boolean;required?:boolean}){return <label className="field">{label}{area?<textarea name={name} required={required} maxLength={12000} value={value||''} onChange={e=>onChange(e.target.value)} rows={4}/>:<input name={name} required={required} maxLength={300} value={value||''} onChange={e=>onChange(e.target.value)}/>}</label>}

export default function Workbench({
  view,
  navigate,
  selectedId,
  onSelectRecord,
}: {
  view: string;
  navigate: (s: string) => void;
  selectedId?: string | null;
  onSelectRecord?: (id: string | null) => void;
}) {
 const [records,setRecords]=useState<LabRecord[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [internalSelected,setInternalSelected]=useState<string|null>(null);
 const selected = selectedId !== undefined ? selectedId : internalSelected;
 const setSelected = (id: string | null) => {
   setInternalSelected(id);
   onSelectRecord?.(id);
 };
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('All'),[modal,setModal]=useState<{type:string;record?:LabRecord;caseId?:string}|null>(null),[draft,setDraft]=useState<Record<string,string>>({}),[step,setStep]=useState(1),[labelRecord,setLabelRecord]=useState<LabRecord|null>(null),[reportDocument,setReportDocument]=useState<LabRecord|null>(null),[benchSheetRecord,setBenchSheetRecord]=useState<LabRecord|null>(null);
 const [activeInstrument,setActiveInstrument]=useState<'microscope'|'spot_plate'|'none'>('microscope'),[worksheetValues,setWorksheetValues]=useState<Record<string,string>>({}),[selectedTemplateId,setSelectedTemplateId]=useState<string>(''),[labSubView,setLabSubView]=useState<'bench'|'directory'>('bench'),[mountedBenchEvidenceId,setMountedBenchEvidenceId]=useState<string>('');
 const [dashboardCaseFilter,setDashboardCaseFilter]=useState<'All'|'Active'|'Awaiting Acceptance'|'Priority'|'Closed'>('All');
 const [workbenchSignName, setWorkbenchSignName] = useState('Miracle Jerome, Senior Special Agent');
 const [workbenchSignature, setWorkbenchSignature] = useState('/s/ Miracle Jerome, Lead Investigator');
 const [workbenchAffirmation, setWorkbenchAffirmation] = useState(false);
 const [prevView,setPrevView]=useState(view);
 if(prevView!==view){
   setPrevView(view);
   if (selectedId === undefined) {
     setInternalSelected(null);
     onSelectRecord?.(null);
   }
   setQuery('');
   setFilter('All');
 }

 const cases=records.filter(r=>r.kind==='case'),evidence=records.filter(r=>r.kind==='evidence'),exams=records.filter(r=>r.kind==='examination'),reports=records.filter(r=>r.kind==='report');
 const current=records.find(r=>r.id===selected);const linked=(id:string,kind:Kind)=>records.filter(r=>r.caseId===id&&r.kind===kind);

 function reload(){
   setLoading(true);
   setError('');
   fetch('/api/records')
     .then(r=>r.json() as Promise<LabRecord[] & {error?:string}>)
     .then(j=>{setRecords(j);setError('')})
     .catch(e=>setError(e instanceof Error?e.message:'Unable to load records.'))
     .finally(()=>setLoading(false));
 }

 useEffect(()=>{
   let ignore=false;
   fetch('/api/records')
     .then(r=>r.json() as Promise<LabRecord[] & {error?:string}>)
     .then(j=>{if(!ignore){setRecords(j);setError('')}})
     .catch(e=>{if(!ignore)setError(e instanceof Error?e.message:'Unable to load records.')})
     .finally(()=>{if(!ignore)setLoading(false)});
   return ()=>{ignore=true};
 },[]);

 useEffect(()=>{
    if(modal?.type==='examine'&&modal.record?.id&&typeof window!=='undefined'){
      try {
        localStorage.setItem(`trace_exam_draft_${modal.record.id}`, JSON.stringify({ draft, worksheetValues }));
      } catch {}
    }
  },[modal, draft, worksheetValues]);

 async function save(body:Record<string,unknown>):Promise<LabRecord|undefined>{setBusy(true);setError('');try{const r=await fetch('/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json() as LabRecord & {error?:string};if(!r.ok)throw Error(j.error);setRecords(prev=>[j,...prev.filter(x=>x.id!==j.id)]);setNotice('Saved to your laboratory.');setModal(null);return j}catch(e){setError(e instanceof Error?e.message:'Unable to save.')}finally{setBusy(false)}}

 function open(type:string,record?:LabRecord,caseId?:string,module?:string,evidenceId?:string){
   setError('');setStep(1);setModal({type,record,caseId});
   if(type==='examine'&&record){
     const isTox=record.data.module==='toxicology'||record.data.method?.toLowerCase().includes('screen');
     setActiveInstrument(isTox?'spot_plate':'microscope');
     setSelectedTemplateId(record.data.templateId||(isTox?'tpl-substance-1':'tpl-glass-1'));
     let initialWorksheet = record.data.worksheetValues || {};
     let initialDraft = {
       observations: record.data.observations || '',
       conclusion: record.data.conclusion || '',
       limitations: record.data.limitations || '',
       status: record.data.status === 'Planned' ? 'In progress' : record.data.status
     };
     if(typeof window !== 'undefined'){
       try {
         const savedDraft = localStorage.getItem(`trace_exam_draft_${record.id}`);
         if(savedDraft){
           const parsed = JSON.parse(savedDraft);
           if(parsed.draft) initialDraft = { ...initialDraft, ...parsed.draft };
           if(parsed.worksheetValues) initialWorksheet = parsed.worksheetValues;
           setNotice('Recovered unsaved draft from your local session.');
         }
       } catch {}
     }
     setWorksheetValues(initialWorksheet);
     setDraft(initialDraft);
   } else {
     setDraft(type==='case'?{title:'',summary:'',submitter:'Lab analyst',category:'General examination',priority:'Routine',module:module||'trace'}:type==='evidence'?{title:'',caseId:caseId||cases.find(c=>c.data.status==='Active')?.id||'',type:'Glass',seal:'Intact',location:'Secure storage',custodian:'Lab analyst',from:'Submitting party',description:''}:type==='examination'?{title:'',caseId:caseId||cases.find(c=>c.data.status==='Active')?.id||'',evidenceId:evidenceId||'',module:module||'trace',method:modules.find(m=>m.id===(module||'trace'))!.methods[0],analyst:'Lab analyst'}:type==='report'?{title:'Laboratory examination report',caseId:caseId||cases.find(c=>c.data.status==='Active')?.id||'',examinationId:'',author:'Lab analyst',summary:'',limitations:''}:type==='transfer'?{to:'',location:record!.data.location,reason:'',seal:record!.data.seal}:type==='edit-report'?{summary:record!.data.summary,limitations:record!.data.limitations}:{status:record!.data.status==='Draft'?'In review':record!.data.status==='In review'?'Approved':'Issued',reviewer:record!.data.status==='In review'?'Technical Reviewer':'',note:''});
   }
 }

 const set=(key:string)=>(s:string)=>setDraft(d=>({...d,[key]:s}));

 async function submit(e?:SyntheticEvent){
   e?.preventDefault();
   if(modal?.type==='case'&&step===1){setStep(2);return}
   if(!modal)return;
   const creating=['case','evidence','examination','report'].includes(modal.type);
   const dataToSave = modal.type === 'examine'
     ? { ...draft, worksheetValues, templateId: selectedTemplateId }
     : draft;
   const r=await save(creating?{action:'create',kind:modal.type,caseId:draft.caseId,data:dataToSave}:{action:modal.type==='transition'?'report':modal.type,id:modal.record?.id,revision:modal.record?.revision,data:dataToSave});
   if(r&&creating){setSelected(r.id)}
   if(modal.type==='examine'&&modal.record?.id&&typeof window!=='undefined'){
     try{localStorage.removeItem(`trace_exam_draft_${modal.record.id}`)}catch{}
   }
 }

 function show(r:LabRecord){setSelected(r.id);setNotice('')}

 function list(items:LabRecord[],compact=false){
   const filtered=items.filter(r=>(filter==='All'||r.data.status===filter||r.data.module===filter)&&[r.id,r.data.title,moduleName(r.data.module||'')].join(' ').toLowerCase().includes(query.toLowerCase()));
   return <>
     {!compact&&<div className="list-tools"><label className="search"><Search size={16}/><input aria-label="Search records" placeholder="Search records by name or reference…" value={query} onChange={e=>setQuery(e.target.value)}/></label><Choice label="Status" value={filter} options={['All',...Array.from(new Set(items.map(r=>r.data.status).filter(Boolean)))].map(x=>({value:x,label:x==='All'?'All statuses':x}))} onChange={setFilter}/></div>}
     <Table><TableHeader><TableRow><TableHead>Reference / title</TableHead>{!compact&&<TableHead>Case / discipline</TableHead>}<TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader><TableBody>{filtered.map(r=><TableRow key={r.id}><TableCell><button className="record-link" onClick={()=>show(r)}><span className="reference">{r.id}</span><strong>{r.data.title}</strong></button></TableCell>{!compact&&<TableCell><span className="subtext">{r.kind==='case'?moduleName(r.data.module):r.caseId}</span></TableCell>}<TableCell><Badge>{r.data.status||r.data.seal||'Received'}</Badge></TableCell><TableCell className="subtext">{date(r.created)}</TableCell><TableCell><div style={{display:'flex',alignItems:'center',gap:'4px'}}>{r.kind==='evidence'&&<button className="icon-button" title="Print evidence label" aria-label="Print label" onClick={(e)=>{e.stopPropagation();setLabelRecord(r)}}><Tag size={15}/></button>}{r.kind==='examination'&&<><button className="icon-button" title="View Bench Sheet" aria-label="View Bench Sheet" onClick={(e)=>{e.stopPropagation();setBenchSheetRecord(r)}}><FileText size={15}/></button>{r.data.status!=='Completed'&&<button className="icon-button" title="Launch Protocol Wizard" aria-label="Record findings" onClick={(e)=>{e.stopPropagation();open('examine',r)}}><Microscope size={15}/></button>}</>}{r.kind==='report'&&<button className="icon-button" title="Certificate of analysis" aria-label="View report" onClick={(e)=>{e.stopPropagation();setReportDocument(r)}}><Printer size={15}/></button>}<button className="icon-button" aria-label={'Open '+r.data.title} onClick={()=>show(r)}><ArrowUpRight size={17}/></button></div></TableCell></TableRow>)}</TableBody></Table>
     {filtered.length===0&&<div className="empty"><FolderOpen/><h3>No records here yet</h3><p>{query||filter!=='All'?'Try another search or status.':'Create a record to begin your scientific work.'}</p></div>}
   </>
 }

  function reportDownload(r:LabRecord){
    const historyList = (r.data.history || []) as { at: string; status: string; reviewer: string; note: string }[];
    const text=['TRACE — SIMULATION REPORT','For educational use; not a validated forensic conclusion.',r.id,r.data.title,'Case: '+r.caseId,'Status: '+r.data.status,'Author: '+r.data.author,'Examination: '+r.data.examinationId,'','FINDINGS',r.data.summary,'','LIMITATIONS',r.data.limitations,'','REVIEW HISTORY',...historyList.map((h)=>`${h.at} | ${h.status} | ${h.reviewer} | ${h.note}`)].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
    const a=document.createElement('a');a.href=url;a.download=r.id+'.txt';a.click();URL.revokeObjectURL(url);
  }

  const title=current?current.data.title:view==='Dashboard'?'Laboratory overview':view==='Case Builder'?'Create your next case':view;

  return <div className="workbench-root w-full">
   <div className="page-title">
     <div>
       <div className="flex items-center gap-2 mb-1">
         <div className="eyebrow">{current?current.id:view==='Dashboard'?'YOUR LABORATORY, AT A GLANCE':'FORENSIC SCIENCE WORKSPACE'}</div>
         {view==='Dashboard'&&!current&&(
           <div className="flex items-center gap-1.5 ml-2">
             <span className="live-dot"/>
             <span className="overview-glitter-pill">
               <Sparkles size={10} className="sparkle-hint-icon mr-0.5"/> LIVE WORKSTATION ACTIVE
             </span>
           </div>
         )}
       </div>
       <h1>{title}</h1>
        <p>{current?'Document observations. Preserve context. Communicate limitations.':view==='Dashboard'?'A clear view of your cases, evidence, and scientific work.':({Cases:'Organize the questions your laboratory is working to answer.',Evidence:'Every item accounted for, from receipt to examination.',Laboratory:'Specialist disciplines. One connected laboratory.',Examinations:'Turn observations into documented scientific findings.',Reports:'A considered conclusion, with a traceable review history.',Quality:'Review completeness and maintain good laboratory practice.',Training:'Practice the process without levels, scores, or time pressure.','Case Builder':'Start with a scientific question and build a scenario around it.',Library:'Practical guidance for this forensic laboratory station.',Administration:'Your laboratory configuration.',Profile:'Your place in the laboratory.','Detective Desk':'Connect clues, validate alibis, and correlate physical and digital evidence.','Crime Scene (CSI)':'Tactical spatial floorplan, evidence discovery points, and point-of-entry diagrams.','Interrogation Room':'Custodial suspect interrogation, biometric stress analysis, and evidence confrontation.','Forensic Morgue':'Chief Medical Examiner post-mortem trauma documentation and toxicological screening.','Courtroom Trial':'Adversarial federal prosecution, witness cross-examination, and evidentiary contradiction injection.'} as Record<string,string>)[view] || 'Specialist forensic intelligence operations.'}</p>
     </div>
     {!current&&view==='Dashboard'?(
       <div className="flex items-center gap-2">
         <button type="button" className="secondary flex items-center gap-1.5 font-semibold" onClick={()=>navigate('Cases')}>
           <FolderOpen size={16}/> View all cases
         </button>
         <button className="primary" disabled={loading} onClick={()=>open('case')}>
           <Plus size={17}/> New case
         </button>
       </div>
     ):!current&&['Cases','Case Builder'].includes(view)?(
       <button className="primary" disabled={loading} onClick={()=>open('case')}>
         <Plus size={17}/> New case
       </button>
     ):!current&&['Evidence','Examinations','Reports'].includes(view)?(
       <button className="primary" disabled={!cases.some(c=>c.data.status==='Active')||loading} onClick={()=>open(view==='Evidence'?'evidence':view==='Examinations'?'examination':'report')}>
         <Plus size={17}/> {view==='Evidence'?'Receive evidence':view==='Reports'?'Draft report':'New examination'}
       </button>
     ):null}
   </div>

   {error&&<div className="error" role="alert">{error} {!modal&&<button onClick={reload}>Retry / refresh</button>}</div>}
   {notice&&<output className="notice"><Check size={16}/>{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></output>}

   {loading?<div className="empty"><RefreshCw className="spin"/><p>Opening your laboratory…</p></div>:current?<>
     <button className="back" onClick={()=>setSelected(null)}><ArrowLeft size={15}/> Back to {view}</button>
     <div className="detail-meta"><Badge>{current.data.status||current.data.seal}</Badge><span>Created {date(current.created)}</span>{current.data.sample&&<span>Sample case</span>}<span>Revision {current.revision}</span></div>

     {current.kind==='case'?<>
       <div className="flex flex-col lg:flex-row items-start gap-5">
         <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
           <section className="panel panel-padding">
             <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#a89bc2]/40">
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Dossier</span>
               <span className="badge amber">{current.data.priority||'Routine'}</span>
             </div>
             <h2 className="text-base font-bold text-[#0f0d1a] mb-2">{current.data.title}</h2>
             <p className="text-sm text-slate-700 leading-relaxed mb-4">{current.data.summary}</p>
             <dl>
               <dt>Submitting party</dt><dd>{current.data.submitter}</dd>
               <dt>Primary discipline</dt><dd>{moduleName(current.data.module)}</dd>
               <dt>Status</dt><dd><Badge>{current.data.status}</Badge></dd>
             </dl>
           </section>
           {current.data.status === 'Awaiting Acceptance' && (
             <section className="panel panel-padding border-2 border-amber-500 bg-amber-50/80 text-slate-900 space-y-3">
               <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                 <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-950">
                   <ShieldCheck size={16} className="text-amber-700" />
                   <span>DOCKET ACCEPTANCE REQUIRED</span>
                 </div>
                 <span className="badge amber">SIGNATURE MANDATE</span>
               </div>

               <p className="text-xs text-amber-900 leading-relaxed">
                 This forensic docket is pending formal acceptance. Analytical examinations, evidence handling, and lab reports are locked until you review the case facts and sign this docket as the Primary Investigator.
               </p>

               <div className="space-y-2 pt-1 text-xs">
                 <div>
                   <label className="block text-[10.5px] font-bold text-amber-950 uppercase mb-0.5">
                     PRIMARY INVESTIGATOR
                   </label>
                   <input
                     type="text"
                     value={workbenchSignName}
                     onChange={(e) => setWorkbenchSignName(e.target.value)}
                     placeholder="e.g. Miracle Jerome, Senior Special Agent"
                     className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-600"
                   />
                 </div>

                 <div>
                   <label className="block text-[10.5px] font-bold text-amber-950 uppercase mb-0.5">
                     CRYPTOGRAPHIC SIGNATURE LINE
                   </label>
                   <input
                     type="text"
                     value={workbenchSignature}
                     onChange={(e) => setWorkbenchSignature(e.target.value)}
                     placeholder="/s/ Call Sign or Legal Name"
                     className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                   />
                 </div>

                 <label className="flex items-start gap-2 pt-1 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={workbenchAffirmation}
                     onChange={(e) => setWorkbenchAffirmation(e.target.checked)}
                     className="mt-0.5 rounded border-amber-400 text-indigo-600 cursor-pointer"
                   />
                   <span className="text-[11px] text-amber-950 leading-tight">
                     I solemnly affirm jurisdiction, assume primary investigative oversight, and certify chain-of-custody integrity for this docket.
                   </span>
                 </label>

                 <button
                   type="button"
                   disabled={!workbenchAffirmation || !workbenchSignature.trim() || busy}
                   onClick={async () => {
                     await save({
                       action: 'sign-case',
                       id: current.id,
                       revision: current.revision,
                       data: {
                         status: 'Active',
                         primaryInvestigator: workbenchSignName.trim(),
                         primaryInvestigatorSignature: workbenchSignature.trim(),
                         acceptedAt: new Date().toISOString()
                       }
                     });
                     try {
                       acceptAndSignTraceCase('CASE-2026-002', workbenchSignName.trim(), workbenchSignature.trim());
                     } catch {}
                   }}
                   className="w-full py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm mt-2"
                 >
                   <CheckCircle2 size={14} />
                   <span>SIGN &amp; ACCEPT CASE AS PRIMARY INVESTIGATOR</span>
                 </button>
               </div>
             </section>
           )}

           {current.data.status === 'Active' && current.data.primaryInvestigatorSignature && (
             <section className="panel panel-padding border border-emerald-300 bg-emerald-50/70 text-slate-900">
               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-emerald-200 text-emerald-950">
                 <ShieldCheck size={16} className="text-emerald-700" />
                 <span className="text-xs font-bold uppercase tracking-wider">VERIFIED INVESTIGATOR DOCKET</span>
               </div>
               <div className="text-xs space-y-1 text-emerald-950">
                 <div><strong>Primary Investigator:</strong> {current.data.primaryInvestigator || 'Miracle Jerome'}</div>
                 <div className="font-mono text-[11px] text-emerald-800">
                   <strong>Signature:</strong> {current.data.primaryInvestigatorSignature}
                 </div>
                 {current.data.acceptedAt && (
                   <div className="text-[10.5px] text-emerald-700">
                     <strong>Accepted:</strong> {new Date(current.data.acceptedAt).toLocaleString()}
                   </div>
                 )}
               </div>
             </section>
           )}

           <section className="panel panel-padding">
             <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Case Actions</h2>
             <div className="action-stack">
               {current.data.status === 'Awaiting Acceptance' ? (
                 <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                   <p className="font-semibold mb-1">Actions Restricted</p>
                   <p className="text-[11px] text-amber-800 leading-relaxed">
                     Please sign and accept the docket above as Primary Investigator to unlock evidence intake, analytical examinations, and laboratory reports.
                   </p>
                 </div>
               ) : current.data.status === 'Active' ? (
                 <>
                   <button className="secondary" onClick={()=>open('evidence',undefined,current.id)}>
                     <Package size={15}/> Receive evidence
                   </button>
                   <button className="secondary" onClick={()=>open('examination',undefined,current.id,current.data.module)}>
                     <FlaskConical size={15}/> Plan examination
                   </button>
                   <button className="secondary" onClick={()=>open('report',undefined,current.id)}>
                     <FileText size={15}/> Draft report
                   </button>
                 </>
               ) : null}
               <button
                 className="text-button"
                 disabled={busy || current.data.status === 'Awaiting Acceptance'}
                 onClick={()=>save({action:'case-status',id:current.id,revision:current.revision,data:{status:current.data.status==='Closed'?'Active':'Closed'}})}
               >
                 {current.data.status==='Closed'?'Reopen case':'Close completed case'}
               </button>
             </div>
           </section>
           <TagsEditor tags={current.data.tags} onAdd={(tag)=>{void save({action:'add-tag',id:current.id,revision:current.revision,data:{tag}})}} onRemove={(tag)=>{void save({action:'remove-tag',id:current.id,revision:current.revision,data:{tag}})}} disabled={busy}/>
         </aside>
         <div className="flex-1 min-w-0 w-full space-y-4">
           <Tabs defaultValue="evidence"><TabsList variant="line"><TabsTrigger value="evidence">Evidence ({linked(current.id,'evidence').length})</TabsTrigger><TabsTrigger value="examination">Examinations ({linked(current.id,'examination').length})</TabsTrigger><TabsTrigger value="report">Reports ({linked(current.id,'report').length})</TabsTrigger></TabsList>{(['evidence','examination','report'] as Kind[]).map(k=><TabsContent key={k} value={k}><section className="panel">{list(linked(current.id,k),true)}</section></TabsContent>)}</Tabs>
         </div>
       </div>
     </>:current.kind==='evidence'?<>
       <div className="flex flex-col lg:flex-row items-start gap-5">
         <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
           <section className="panel panel-padding">
             <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#a89bc2]/40">
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidence Record</span>
               <Badge>{current.data.seal||'Intact'}</Badge>
             </div>
             <h2 className="text-base font-bold text-[#0f0d1a] mb-2">{current.data.title}</h2>
             <p className="text-sm text-slate-700 leading-relaxed mb-4">{current.data.description}</p>
             <dl>
               <dt>Case</dt><dd>{current.caseId}</dd>
               <dt>Material</dt><dd>{current.data.type}</dd>
               <dt>Current custodian</dt><dd>{current.data.custodian}</dd>
               <dt>Location</dt><dd>{current.data.location}</dd>
             </dl>
           </section>
           <section className="panel panel-padding">
             <div className="flex items-center gap-2 mb-2">
               <ShieldCheck className="purple" size={17}/>
               <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Continuity & Identification</h2>
             </div>
             <p className="text-xs text-slate-600 mb-3">Transfers append a dated entry. Generate printable barcode tags for packaging.</p>
             <div className="button-row">
               <button className="primary" onClick={()=>open('transfer',current)}>Record transfer</button>
               <button className="secondary" onClick={()=>setLabelRecord(current)}><Tag size={15}/> Evidence label</button>
             </div>
           </section>
           <TagsEditor tags={current.data.tags} onAdd={(tag)=>{void save({action:'add-tag',id:current.id,revision:current.revision,data:{tag}})}} onRemove={(tag)=>{void save({action:'remove-tag',id:current.id,revision:current.revision,data:{tag}})}} disabled={busy}/>
         </aside>
         <div className="flex-1 min-w-0 w-full space-y-4">
           <section className="panel">
             <div className="panel-title">
               <h2>Chain of custody</h2>
               <Badge>{current.data.custody.length} entries</Badge>
             </div>
             <div className="timeline">
               {([...(current.data.custody || [])].reverse() as {from:string;to:string;reason:string;location:string;at:string;seal:string}[]).map((c,i:number)=><div className="timeline-item" key={i}><span className="timeline-dot"/><div><strong>{c.from} <ArrowRight size={13}/> {c.to}</strong><p>{c.reason} · {c.location}</p><small>{new Date(c.at).toLocaleString()} · Seal: {c.seal}</small></div></div>)}
             </div>
           </section>
           <AttachmentsPanel recordId={current.id} attachments={current.data.attachments} onUpload={async(f)=>{const reader=new FileReader();reader.onload=(e)=>{const data=e.target?.result as string;if(data)void save({action:'upload-attachment',recordId:current.id,filename:f.name,mimeType:f.type,data:data})};reader.readAsDataURL(f)}} onDelete={async(id)=>{await save({action:'delete-attachment',recordId:current.id,attachmentId:id})}} disabled={busy}/>
         </div>
       </div>
      </>:current.kind==='examination'?(()=>{
        const linkedCase=cases.find(c=>c.id===current.caseId);
        const linkedEvidence=evidence.find(e=>e.id===current.data.evidenceId);
        const linkedReport=reports.find(r=>r.data.examinationId===current.id);
        const isCompleted=current.data.status==='Completed';
        return <div className="exam-detail-grid">
          <div>
            <section className="panel panel-padding">
              <div className="panel-title plain">
                <div>
                  <h2>{moduleName(current.data.module)} / {current.data.method}</h2>
                  <span className="subtext">{current.data.templateId?`Standard protocol template: ${current.data.templateId}`:'Standard forensic examination protocol'}</span>
                </div>
                <Badge>{current.data.status}</Badge>
              </div>

              <div className="exam-context-cards">
                <button
                  type="button"
                  className="exam-context-card"
                  onClick={()=>linkedCase&&show(linkedCase)}
                  title={linkedCase?`Open case ${linkedCase.id}`:undefined}
                >
                  <div className="context-card-header">
                    <span>Target Case Reference</span>
                    <ArrowRight size={12}/>
                  </div>
                  <div className="context-card-title">
                    <FolderOpen size={15} className="purple"/>
                    <span>{current.caseId}</span>
                  </div>
                  <div className="context-card-meta">
                    <span>{linkedCase?.data.title||'Case record'}</span>
                    {linkedCase?.data.priority&&<span>· Priority: {linkedCase.data.priority}</span>}
                  </div>
                </button>

                <button
                  type="button"
                  className="exam-context-card"
                  onClick={()=>linkedEvidence&&show(linkedEvidence)}
                  title={linkedEvidence?`Open evidence item ${linkedEvidence.id}`:undefined}
                >
                  <div className="context-card-header">
                    <span>Examined Physical Item</span>
                    <ArrowRight size={12}/>
                  </div>
                  <div className="context-card-title">
                    <Package size={15} className="purple"/>
                    <span>{current.data.evidenceId}</span>
                  </div>
                  <div className="context-card-meta">
                    <span>{linkedEvidence?.data.title||'Evidence item'}</span>
                    {linkedEvidence?.data.type&&<span>· {linkedEvidence.data.type}</span>}
                    {linkedEvidence?.data.seal&&<span>· Seal: {linkedEvidence.data.seal}</span>}
                  </div>
                </button>
              </div>

              <dl>
                <dt>Primary Analyst</dt>
                <dd>{current.data.analyst||'Lab analyst'}</dd>
                <dt>Instrument / Method</dt>
                <dd>{modules.find(m=>m.id===current.data.module)?.instrument||'Benchtop instrumentation'}</dd>
                <dt>Storage Location</dt>
                <dd>{linkedEvidence?.data.location||'Secure storage'}</dd>
                {linkedReport&&(
                  <>
                    <dt>Linked Report</dt>
                    <dd>
                      <button
                        type="button"
                        className="text-button"
                        onClick={()=>show(linkedReport)}
                      >
                        <FileText size={13}/> {linkedReport.id} ({linkedReport.data.status})
                      </button>
                    </dd>
                  </>
                )}
              </dl>

              <div className="exam-findings-portfolio">
                <div className="exam-finding-block accent">
                  <div className="finding-block-header">
                    <div className="finding-block-title">
                      <Microscope size={16} className="purple"/>
                      <span>1. Observations & Instrument Readings</span>
                    </div>
                    <span className={`finding-badge-status ${current.data.observations?'recorded':'pending'}`}>
                      {current.data.observations?'Documented':'Pending'}
                    </span>
                  </div>
                  <div className={`finding-body-text ${!current.data.observations?'empty':''}`}>
                    {current.data.observations||'No examination observations documented yet. Open the Protocol Wizard to record instrument data and notes.'}
                  </div>
                </div>

                <div className="exam-finding-block conclusion-accent">
                  <div className="finding-block-header">
                    <div className="finding-block-title">
                      <Check size={16} style={{color:'#2563eb'}}/>
                      <span>2. Interpretation & Analytical Conclusion</span>
                    </div>
                    <span className={`finding-badge-status ${current.data.conclusion?'recorded':'pending'}`}>
                      {current.data.conclusion?'Formulated':'Pending'}
                    </span>
                  </div>
                  <div className={`finding-body-text ${!current.data.conclusion?'empty':''}`}>
                    {current.data.conclusion||'No evaluative conclusion formulated yet. Complete the interpretation in the Protocol Wizard.'}
                  </div>
                </div>

                <div className="exam-finding-block limitations-accent">
                  <div className="finding-block-header">
                    <div className="finding-block-title">
                      <ShieldCheck size={16} style={{color:'#d97706'}}/>
                      <span>3. Limitations & Method Boundaries</span>
                    </div>
                    <span className={`finding-badge-status ${current.data.limitations?'recorded':'pending'}`}>
                      {current.data.limitations?'Declared':'Pending'}
                    </span>
                  </div>
                  <div className={`finding-body-text ${!current.data.limitations?'empty':''}`}>
                    {current.data.limitations||'Explicit analytical limitations and method constraints must be defined prior to report issue.'}
                  </div>
                </div>
              </div>

              {current.data.suggestions && current.data.suggestions.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <AnalysisSuggestions suggestions={current.data.suggestions} />
                </div>
              )}

              {current.data.history && current.data.history.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    Revision & Reopening History
                  </h3>
                  <div className="timeline">
                    {(current.data.history as { at: string; action: string; reason: string; reopenedBy: string }[]).map((h, i: number) => (
                      <div className="timeline-item" key={i}>
                        <span className="timeline-dot" />
                        <div>
                          <strong>{h.reopenedBy || 'Lab analyst'} · {h.action === 'reopened' ? 'Reopened for additional review' : h.action}</strong>
                          <p>{h.reason}</p>
                          <small>{new Date(h.at).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div>
            <section className="panel panel-padding">
              <h2>Bench Actions</h2>
              <div className="workflow-status-tracker">
                <div className="workflow-steps-pill">
                  <span className={`workflow-dot ${current.data.status==='Planned'?'active':'completed'}`}/>
                  <span>Planned</span>
                  <span>&rarr;</span>
                  <span className={`workflow-dot ${current.data.status==='In progress'?'active':isCompleted?'completed':''}`}/>
                  <span>In progress</span>
                  <span>&rarr;</span>
                  <span className={`workflow-dot ${isCompleted?'completed':''}`}/>
                  <span>Completed</span>
                </div>
              </div>

              <div className="bench-action-stack">
                {!isCompleted?(
                  <button type="button" className="primary" onClick={()=>open('examine',current)}>
                    <Microscope size={16}/> Launch Protocol Wizard
                  </button>
                ):(
                  <>
                    <button
                      type="button"
                      className="primary"
                      onClick={()=>open('report',undefined,current.caseId||undefined)}
                    >
                      <FileText size={16}/> Draft Certificate of Analysis
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      disabled={busy}
                      onClick={()=>{
                        const reason = window.prompt('Enter reason for reopening this completed examination:','Reopened for additional analytical review');
                        if(reason === null) return;
                        void save({
                          action:'reopen-examination',
                          id:current.id,
                          revision:current.revision,
                          data:{
                            status:'In progress',
                            reason: reason || 'Reopened for additional analytical review',
                            reopenedBy: 'Lab analyst'
                          }
                        });
                      }}
                    >
                      Reopen examination for editing
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="secondary"
                  onClick={()=>setBenchSheetRecord(current)}
                >
                  <Printer size={16}/> View Bench Sheet
                </button>

                {!isCompleted&&(
                  <p className="footnote">
                    The Protocol Wizard provides split-screen comparison microscopy, chemical spot test plate simulation, and dynamic worksheet syncing.
                  </p>
                )}
              </div>
            </section>

            <div style={{marginTop:'20px'}}>
              <QaChecklist
                module={current.data.module}
                method={current.data.method}
                observations={current.data.observations}
                conclusion={current.data.conclusion}
                limitations={current.data.limitations}
              />
            </div>
          </div>
        </div>;
      })():current.kind==='report'?(()=>{
        const linkedCase=cases.find(c=>c.id===current.caseId);
        const linkedExam=exams.find(e=>e.id===current.data.examinationId);
        const linkedEvidence=linkedExam?evidence.find(e=>e.id===linkedExam.data.evidenceId):null;
        return <section className="panel panel-padding">
          <div className="panel-title plain">
            <div>
              <h2>{current.data.title||'Laboratory report'}</h2>
              <span className="subtext">{current.id} · Official Forensic Certificate of Analysis</span>
            </div>
            <div className="button-row">
              <button className="primary" onClick={()=>setReportDocument(current)}><FileText size={16}/> Certificate of analysis <Sparkles size={12} className="sparkle-hint-icon"/></button>
              <button className="secondary" onClick={()=>reportDownload(current)}><Download size={16}/> Text backup</button>
              {current.data.status==='Draft'&&<button className="secondary" onClick={()=>open('edit-report',current)}>Edit draft</button>}
              {current.data.status!=='Issued'&&<button className="secondary" onClick={()=>open('transition',current)}>{current.data.status==='Draft'?'Submit for review':current.data.status==='In review'?'Review report':'Issue report'}</button>}
            </div>
          </div>

          <div className="exam-context-cards" style={{marginTop:'14px',marginBottom:'16px'}}>
            {linkedCase&&(
              <button
                type="button"
                className="exam-context-card"
                onClick={()=>show(linkedCase)}
                title={`Open case ${linkedCase.id}`}
              >
                <div className="context-card-header">
                  <span>Target Case Reference</span>
                  <ArrowRight size={12}/>
                </div>
                <div className="context-card-title">
                  <FolderOpen size={15} className="purple"/>
                  <span>{linkedCase.id}</span>
                </div>
                <div className="context-card-meta">
                  <span>{linkedCase.data.title}</span>
                  {linkedCase.data.priority&&<span>· Priority: {linkedCase.data.priority}</span>}
                </div>
              </button>
            )}

            {linkedExam&&(
              <button
                type="button"
                className="exam-context-card"
                onClick={()=>show(linkedExam)}
                title={`Open source examination ${linkedExam.id}`}
              >
                <div className="context-card-header">
                  <span>Source Laboratory Examination</span>
                  <ArrowRight size={12}/>
                </div>
                <div className="context-card-title">
                  <FlaskConical size={15} className="purple"/>
                  <span>{linkedExam.id}</span>
                </div>
                <div className="context-card-meta">
                  <span>{linkedExam.data.title}</span>
                  <span>· {linkedExam.data.method}</span>
                </div>
              </button>
            )}
          </div>

          <p className="footnote">SIMULATION REPORT · Educational forensic science sandbox</p>
          <dl>
            <dt>Authoring Analyst</dt><dd>{current.data.author}</dd>
            <dt>Primary Discipline</dt><dd>{moduleName(linkedCase?.data.module||linkedExam?.data.module||'')}</dd>
            <dt>Examined Item</dt><dd>{linkedEvidence?`${linkedEvidence.id} · ${linkedEvidence.data.title} (${linkedEvidence.data.type})`:(linkedExam?.data.evidenceId||'Evidence item')}</dd>
            <dt>Original Examination</dt><dd>{linkedExam?`${linkedExam.id} · ${linkedExam.data.title} (${linkedExam.data.method})`:(current.data.examinationId||'Examination record')}</dd>
            <dt>Quality Checklist</dt><dd>{linkedExam?.data.qaVerified?'Verified and recorded':'Incomplete / pending verification'}</dd>
          </dl>
          <div className="finding"><h3>Findings</h3><p>{current.data.summary}</p></div>
          <div className="finding"><h3>Limitations</h3><p>{current.data.limitations}</p></div>
          <h2>Review history</h2>
          {current.data.history?.length?(current.data.history as {status:string;reviewer:string;at:string;note:string}[]).map((h,i:number)=><div className="review-entry" key={i}><Badge>{h.status}</Badge><strong>{h.reviewer}</strong><small>{new Date(h.at).toLocaleString()}</small><p>{h.note}</p></div>):<p>This draft has not yet been submitted for review.</p>}
        </section>;
      })():null}
    </>:view==='Dashboard'?<>
      <button type="button" onClick={()=>navigate('Communications')} className="panel panel-padding mb-4 w-full text-left cursor-pointer hover:border-[#4338ca]">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4b465c]">Operations Administration</div>
        <div className="mt-1 text-[15px] font-semibold text-[#0f0d1a]">Your incident report is missing the disposition field.</div>
        <p className="mt-1 text-[13px] text-[#4b465c]">Returned this morning. Mark it Released, Retained, or Consumed in analysis before the 15:00 records sweep. Open laboratory mail for the rest of the desk: scheduling, a returned form, and a meeting at 08:15.</p>
      </button>
      <div className="stats">{[{name:'Active cases',count:cases.filter(c=>c.data.status==='Active').length,icon:FolderOpen,hint:'Across your laboratory',target:'Cases'},{name:'Evidence items',count:evidence.length,icon:Package,hint:'Documented and traceable',target:'Evidence'},{name:'Pending examinations',count:exams.filter(e=>e.data.status!=='Completed').length,icon:FlaskConical,hint:'Ready for your next step',target:'Examinations'},{name:'Reports in review',count:reports.filter(r=>r.data.status==='In review').length,icon:FileText,hint:'Awaiting technical review',target:'Reports'}].map(s=><button className="stat" key={s.name} onClick={()=>navigate(s.target)}><div>{s.name}<s.icon/></div><strong>{s.count.toString().padStart(2,'0')}</strong><small>{s.hint}</small></button>)}</div>
      <div className="dashboard-grid"><div><section className="panel"><div className="panel-title"><div><h2>Recent cases</h2><p>Your current scientific questions</p></div><button className="text-button flex items-center gap-1 font-bold text-[#4338ca] hover:text-[#312e81]" onClick={()=>navigate('Cases')}>View all <ArrowRight size={14}/></button></div><div className="flex items-center gap-1.5 px-4 pt-2 pb-2.5 border-b border-[#a89bc2]/30 flex-wrap bg-[#fcfbfe]"><span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>{(['All', 'Active', 'Awaiting Acceptance', 'Priority', 'Closed'] as const).map((st) => { const isAct = dashboardCaseFilter === st; const cnt = st === 'All' ? cases.length : cases.filter(c => st === 'Priority' ? (c.data.priority === 'Priority' || c.data.priority === 'High') : c.data.status === st).length; return (<button key={st} type="button" onClick={() => setDashboardCaseFilter(st)} className={`px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${isAct ? 'bg-[#4338ca] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>{st === 'Awaiting Acceptance' ? 'Waiting Acceptance' : st} ({cnt})</button>); }) }</div>{list(cases.filter(c => dashboardCaseFilter === 'All' ? true : dashboardCaseFilter === 'Priority' ? (c.data.priority === 'Priority' || c.data.priority === 'High') : c.data.status === dashboardCaseFilter).slice(0, 5), true)}</section><section className="panel next-panel"><div className="panel-title"><h2>Laboratory disciplines</h2><button className="text-button" onClick={()=>navigate('Laboratory')}>Explore laboratory <ArrowRight size={14}/></button></div><div className="discipline-strip">{modules.slice(0,4).map(m=><button key={m.id} onClick={()=>{navigate('Laboratory')}}><span>{m.short}</span><strong>{m.name}</strong><small>{exams.filter(e=>e.data.module===m.id&&e.data.status!=='Completed').length} examinations pending</small></button>)}</div></section></div><aside><section className="panel"><div className="panel-title"><h2>Next in your queue</h2><Clock size={17} className="purple"/></div><div className="queue">{exams.filter(e=>e.data.status!=='Completed').slice(0,3).map(e=><button key={e.id} onClick={()=>show(e)}><span className="queue-icon"><FlaskConical size={19}/></span><div><small>{e.id}</small><strong>{e.data.title}</strong><span>{e.data.status} <ArrowUpRight size={13}/></span></div></button>)}{!exams.some(e=>e.data.status!=='Completed')&&<p>No pending examinations.</p>}</div><div className="queue-footer"><span className="live-dot"/> Work at your own pace</div></section><section className="practice-card"><BookOpen size={22}/><h2>Good science starts<br/>with good records.</h2><p>Keep observations separate from interpretation, and make limitations explicit.</p><button className="text-button" onClick={()=>navigate('Library')}>Open the library <ArrowRight size={15}/></button></section></aside></div>
    </>:view==='Examinations'?<>
      <div className="exam-pipeline-summary">
        <div className="pipeline-stat-card">
          <div className="pipeline-stat-icon amber">
            <FlaskConical size={20}/>
          </div>
          <div className="pipeline-stat-info">
            <span className="pipeline-stat-count">
              {exams.filter(e=>e.data.status!=='Completed').length}
            </span>
            <span className="pipeline-stat-label">In Progress / Active</span>
            <span className="pipeline-stat-subtext">Awaiting examination notes</span>
          </div>
        </div>

        <div className="pipeline-stat-card">
          <div className="pipeline-stat-icon green">
            <Check size={20}/>
          </div>
          <div className="pipeline-stat-info">
            <span className="pipeline-stat-count">
              {exams.filter(e=>e.data.status==='Completed').length}
            </span>
            <span className="pipeline-stat-label flex items-center gap-1">
              Completed &amp; Locked
            </span>
            <span className="pipeline-stat-subtext">Ready for report drafting</span>
          </div>
        </div>

        <div className="pipeline-stat-card">
          <div className="pipeline-stat-icon">
            <Microscope size={20}/>
          </div>
          <div className="pipeline-stat-info">
            <span className="pipeline-stat-count">
              {new Set(exams.map(e=>e.data.module).filter(Boolean)).size}
            </span>
            <span className="pipeline-stat-label">Active Disciplines</span>
            <span className="pipeline-stat-subtext">Across laboratory cases</span>
          </div>
        </div>
      </div>
      <section className="panel">{list(exams)}</section>
    </>:view==='Detective Desk'?<DetectiveDesk
      cases={cases}
      evidence={evidence}
      exams={exams}
      onOpenRecord={show}
      navigate={navigate}
    />:view==='Crime Scene (CSI)'?<CrimeScene
      navigate={navigate}
    />:view==='Interrogation Room'?<InterrogationRoom
      navigate={navigate}
    />:view==='Forensic Morgue'?<Morgue
      navigate={navigate}
    />:view==='Cyber Lab'?<CyberTerminal
      records={records}
      cases={cases}
      evidence={evidence}
      onOpenRecord={show}
      navigate={navigate}
      onLogFindingToBench={()=>{
        setNotice('Cyber finding logged to contemporaneous notes.');
      }}
    />:view==='Legal & Warrants'?<LegalDesk
      cases={cases}
      evidence={evidence}
      exams={exams}
      reports={reports}
      onOpenRecord={show}
      navigate={navigate}
    />:view==='Courtroom Trial'?<CourtroomTrial
      navigate={navigate}
    />:view==='Citizen Registry'?<CitizenRegistry
      cases={cases}
      evidence={evidence}
      navigate={navigate}
      onOpenRecord={show}
    />:view==='Communications'?<CommsCenter
      cases={cases}
      evidence={evidence}
      navigate={navigate}
      onOpenRecord={show}
      onLogFindingToBench={(note)=>{
        setNotice(note);
      }}
    />:view==='Evidence'?<EvidenceRoom
      evidence={evidence}
      cases={cases}
      exams={exams}
      onOpenRecord={show}
      onMountOnBench={(item)=>{
        setMountedBenchEvidenceId(item.id);
        navigate('Laboratory');
        setLabSubView('bench');
      }}
      onPrintLabel={(item)=>setLabelRecord(item)}
      onTransferCustody={(item)=>open('transfer',item)}
      onPlanExamination={(item)=>open('examination',undefined,item.caseId || undefined,cases.find(c=>c.id===item.caseId)?.data.module,item.id)}
      onReceiveEvidence={()=>open('evidence')}
    />:['Cases','Reports'].includes(view)?<section className="panel">{list(view==='Cases'?cases:reports)}</section>:view==='Laboratory'?<>
      <div className="lab-subnav-container">
        <button
          type="button"
          className={`lab-subnav-pill ${labSubView==='bench'?'active':''}`}
          onClick={()=>setLabSubView('bench')}
        >
          <Microscope size={15}/>
          <span>Interactive Instrument Bench</span>
          <Sparkles size={12} className="sparkle-hint-icon" />
        </button>
        <button
          type="button"
          className={`lab-subnav-pill ${labSubView==='directory'?'active':''}`}
          onClick={()=>setLabSubView('directory')}
        >
          <FlaskConical size={15}/>
          <span>Discipline Directory & SOPs</span>
        </button>
      </div>

      {labSubView==='bench'?(
        <OpenLab
          records={records}
          initialMountedEvidenceId={mountedBenchEvidenceId}
          onSave={save}
          onOpenExamine={(r)=>open('examine',r)}
          onOpenBenchSheet={(r)=>setBenchSheetRecord(r)}
          navigate={navigate}
        />
      ):(
        <>
          <div className="info-strip"><FlaskConical size={20}/><span>Documentation modules are available in every discipline. Standard operating procedures and methods can be accessed below.</span></div>
          <div className="module-grid">{modules.map(m=><section className="panel module-card" key={m.id}><div className="module-top"><span className="module-symbol">{m.short}</span><Badge>Available</Badge></div><h2>{m.name}</h2><p>{m.description}</p><div className="method-list">{m.methods.map(s=><span key={s}><Check size={12}/>{s}</span>)}</div><div className="module-bottom"><small>{m.instrument}</small><button className="text-button" disabled={!cases.length} onClick={()=>open('examination',undefined,undefined,m.id)}>Open module <ArrowRight size={15}/></button></div></section>)}</div>
        </>
      )}
    </>:view==='Case Builder'?<div className="builder-layout">
     <section className="panel panel-padding"><span className="module-symbol"><FolderOpen/></span><h2>Build a case from a scientific question</h2><p>Define the context and discipline, then add evidence, plan examinations, and document your findings.</p><ol className="builder-steps"><li><span>01</span><div><strong>Set the context</strong><p>Name the case and describe what needs to be examined.</p></div></li><li><span>02</span><div><strong>Receive the evidence</strong><p>Register items with their packaging and initial custody.</p></div></li><li><span>03</span><div><strong>Examine and report</strong><p>Record observations, limitations, and review decisions.</p></div></li></ol><button className="primary" onClick={()=>open('case')}><Plus size={16}/> Create a blank case</button></section>
     <section className="panel panel-padding"><h2>Start with a discipline</h2><p>All cases remain open sandboxes. There are no levels or unlocks.</p>{modules.map(m=><button className="builder-module" key={m.id} onClick={()=>open('case',undefined,undefined,m.id)}><span>{m.short}</span>{m.name}<ArrowRight size={15}/></button>)}</section>
    </div>:view==='Quality'?<QualityAssurance
      records={records}
      cases={cases}
      evidence={evidence}
      exams={exams}
      reports={reports}
      onOpenRecord={show}
      navigate={navigate}
    />:view==='Training'||view==='Library'?<div className="module-grid">
     {[{title:'Evidence continuity',text:'Record the submitting party, seal condition, custodian, and storage location at receipt. Add a transfer every time custody changes.',action:'Evidence'},{title:'Observation and interpretation',text:'Describe what you observed before stating what it may mean. A similarity alone does not establish a unique source.',action:'Examinations'},{title:'Limits of the examination',text:'Record sample constraints, method limitations, and alternative explanations. Avoid conclusions stronger than the available observations.',action:'Reports'},{title:'Technical review',text:'Submit a complete draft and identify a reviewer other than the author. Reviewers can return a draft with comments or approve it for issue.',action:'Reports'},{title:'A practice scenario',text:'Open “The conservatory window” sample case. Review its glass evidence, document an examination, then draft a report from your completed findings.',action:'Cases'},{title:'Building your own scenario',text:'Use the Case Builder to define the question. Add simulated evidence and work through a complete laboratory record at your own pace.',action:'Case Builder'}].map(g=><section className="panel module-card" key={g.title}><BookOpen className="purple"/><h2>{g.title}</h2><p>{g.text}</p><button className="text-button" onClick={()=>navigate(g.action)}>Open {g.action.toLowerCase()} <ArrowRight size={15}/></button></section>)}
   </div>:<section className="panel panel-padding">
     <h2>{view==='Profile'?'Lab analyst':'TRACE personal laboratory'}</h2>
     <dl><dt>Workspace</dt><dd>Persistent forensic science sandbox</dd><dt>Record storage</dt><dd>Saved to the laboratory database</dd><dt>Disciplines</dt><dd>{modules.length} documentation modules</dd><dt>Analyst attribution</dt><dd>Enter the analyst or reviewer name on each examination and review.</dd></dl>
     <p>Analyst names are simulation labels. They are not verified identities or electronic signatures.</p>
     <button className="secondary" onClick={reload}><RefreshCw size={15}/> Refresh laboratory records</button>
   </section>}

   <Dialog open={!!modal} onOpenChange={v=>{if(!v&&!busy){setModal(null);setError('')}}}>
     <DialogContent className={'trace-dialog ' + (modal?.type==='examine'?'protocol-wizard-dialog':'')}>
       <DialogHeader>
          <DialogTitle>{modal?({case:step===1?'Create a new case':'Review your case',evidence:'Receive evidence',examination:'Plan an examination',report:'Draft a report',transfer:'Record custody transfer',examine:modal.record?`Examination ${modal.record.id} · ${modal.record.data.title}`:'Record examination findings',transition:'Report workflow','edit-report':'Edit report draft'} as Record<string,string>)[modal.type]:''}</DialogTitle>
          <DialogDescription>{modal?.type==='examine'?`Case ${modal.record?.caseId || ''} · ${moduleName(modal.record?.data?.module)} / ${modal.record?.data?.method} · Protocol Step ${step} of 3`:modal?.type==='case'?`Step ${step} of 2 · Define the scientific question.`:'All changes are saved to your laboratory records.'}</DialogDescription>
       </DialogHeader>

      {error&&<div role="alert" className="error">{error}</div>}

      {modal&&<form onSubmit={submit} className="record-form">
        {modal.type==='case'?(step===1?<>
          <Field label="Case title" name="title" value={draft.title} onChange={set('title')}/>
          <Field label="Scientific question / scenario" name="summary" value={draft.summary} onChange={set('summary')} area/>
          <div className="form-grid">
            <Choice label="Primary discipline" value={draft.module} options={modules.map(m=>({value:m.id,label:m.name}))} onChange={set('module')}/>
            <Choice label="Priority" value={draft.priority} options={['Routine','Priority'].map(x=>({value:x,label:x}))} onChange={set('priority')}/>
          </div>
          <Field label="Submitting party" name="submitter" value={draft.submitter} onChange={set('submitter')}/>
        </>:<div className="review-summary">
          <h2>{draft.title}</h2>
          <p>{draft.summary}</p>
          <dl><dt>Discipline</dt><dd>{moduleName(draft.module)}</dd><dt>Priority</dt><dd>{draft.priority}</dd><dt>Submitted by</dt><dd>{draft.submitter}</dd></dl>
          <p>A case reference will be assigned when you save. You can then receive evidence and plan examinations.</p>
        </div>):null}

        {['evidence','examination','report'].includes(modal.type)&&<>
          <Choice label="Case" value={draft.caseId} options={cases.filter(c=>c.data.status==='Active').map(c=>({value:c.id,label:c.id+' · '+c.data.title}))} onChange={s=>setDraft(d=>({...d,caseId:s,evidenceId:'',examinationId:''}))}/>
          <Field label="Title" name="title" value={draft.title} onChange={set('title')}/>
        </>}

        {modal.type==='evidence'&&<>
          <Field label="Material / item type" name="type" value={draft.type} onChange={set('type')}/>
          <Field label="Description and packaging" name="description" value={draft.description} onChange={set('description')} area/>
          <div className="form-grid">
            <Field label="Received from" name="from" value={draft.from} onChange={set('from')}/>
            <Field label="Receiving custodian" name="custodian" value={draft.custodian} onChange={set('custodian')}/>
          </div>
          <Field label="Storage location" name="location" value={draft.location} onChange={set('location')}/>
        </>}

        {['evidence','transfer'].includes(modal.type)&&<Choice label="Seal condition" value={draft.seal} options={['Intact','Opened for examination','Compromised'].map(x=>({value:x,label:x}))} onChange={set('seal')}/>}

        {modal.type==='transfer'&&<>
          <Field label="Transfer to" name="to" value={draft.to} onChange={set('to')}/>
          <Field label="New location" name="location" value={draft.location} onChange={set('location')}/>
          <Field label="Reason for transfer" name="reason" value={draft.reason} onChange={set('reason')} area/>
          <p className="footnote">From {modal.record?.data.custodian}. The date and time are recorded automatically.</p>
        </>}

        {modal.type==='examination'&&<>
          <Choice label="Evidence item" value={draft.evidenceId} options={evidence.filter(e=>e.caseId===draft.caseId).map(e=>({value:e.id,label:e.id+' · '+e.data.title}))} onChange={set('evidenceId')}/>
          {!evidence.some(e=>e.caseId===draft.caseId)&&<p>Receive evidence in this case before planning an examination.</p>}
          <Choice label="Discipline" value={draft.module} options={modules.map(m=>({value:m.id,label:m.name}))} onChange={s=>setDraft(d=>({...d,module:s,method:modules.find(m=>m.id===s)!.methods[0]}))}/>
          <Choice label="Method" value={draft.method} options={(modules.find(m=>m.id===draft.module)?.methods||[]).map(x=>({value:x,label:x}))} onChange={set('method')}/>
          <Field label="Analyst" name="analyst" value={draft.analyst} onChange={set('analyst')}/>
          <TemplateSelector module={draft.module} method={draft.method} selectedTemplateId={draft.templateId} onSelect={set('templateId')} disabled={busy}/>
        </>}

        {modal.type==='examine'&&<>
          <div className="protocol-stepper">
            <button
              type="button"
              className={`protocol-step-tab ${step===1?'active':''} ${step>1?'completed':''}`}
              onClick={()=>setStep(1)}
            >
              <span className="step-indicator">1</span>
              <div className="step-details">
                <span className="step-title">Instrument Bench</span>
                <span className="step-subtitle">Interactive simulation</span>
              </div>
            </button>
            <button
              type="button"
              className={`protocol-step-tab ${step===2?'active':''} ${step>2?'completed':''}`}
              onClick={()=>setStep(2)}
            >
              <span className="step-indicator">2</span>
              <div className="step-details">
                <span className="step-title">Template Worksheet</span>
                <span className="step-subtitle">Structured observations log</span>
              </div>
            </button>
            <button
              type="button"
              className={`protocol-step-tab ${step===3?'active':''}`}
              onClick={()=>setStep(3)}
            >
              <span className="step-indicator">3</span>
              <div className="step-details">
                <span className="step-title">Conclusions & QA Review</span>
                <span className="step-subtitle">ISO/IEC 17025 verification</span>
              </div>
            </button>
          </div>

          <div className="protocol-wizard-body-scroll">
            {step===1&&(
              <div>
                <div className="instrument-switcher-bar">
                  <span>Instrument Bench Configuration</span>
                  <div className="instrument-switcher-actions">
                    <button
                      type="button"
                      className={`instrument-switch-btn ${activeInstrument==='microscope'?'active':''}`}
                      onClick={()=>setActiveInstrument('microscope')}
                    >
                      <Microscope size={14}/> Comparison Microscope
                    </button>
                    <button
                      type="button"
                      className={`instrument-switch-btn ${activeInstrument==='spot_plate'?'active':''}`}
                      onClick={()=>setActiveInstrument('spot_plate')}
                    >
                      <FlaskConical size={14}/> Chemical Spot Plate
                    </button>
                    <button
                      type="button"
                      className="instrument-switch-btn"
                      onClick={()=>setStep(2)}
                    >
                      Skip to Worksheet <ArrowRight size={14}/>
                    </button>
                  </div>
                </div>

                {activeInstrument==='microscope'?(
                  <ComparisonMicroscope
                    evidenceType={evidence.find(e=>e.id===modal.record?.data.evidenceId)?.data?.type?.toLowerCase().includes('fiber')?'fiber':'glass'}
                    evidenceTitle={evidence.find(e=>e.id===modal.record?.data.evidenceId)?.data?.title||'Questioned Specimen'}
                    onLogFindings={(findings)=>{
                      const stamp=new Date().toLocaleTimeString('en-US',{hour12:false});
                      const entry=`[${stamp} Optical Comparison Microscopy (${findings.magnification})]
${findings.observationText}
Lighting: ${findings.lighting} | Focus: ${findings.focusStatus} | Reticle reading: ${findings.reticleReading}`;
                      setDraft(d=>{
                        const prev=(d.observations||'').trim();
                        return {...d,observations:prev?`${prev}\n\n${entry}`:entry};
                      });
                      setNotice('Microscope findings appended to observations.');
                    }}
                  />
                ):activeInstrument==='spot_plate'?(
                  <SpotTestPlate
                    onLogReaction={(log)=>{
                      const stamp=new Date().toLocaleTimeString('en-US',{hour12:false});
                      const entry=`[${stamp} Chemical Spot Screening - ${log.reagent}]
${log.observationText}
Well: ${log.well} | Reaction time: ${log.reactionTime} | QC Blank verified: ${log.qcVerified?'Yes (Negative control valid)':'Pending'} | Presumptive result: ${log.presumptiveResult}`;
                      setDraft(d=>{
                        const prev=(d.observations||'').trim();
                        return {...d,observations:prev?`${prev}\n\n${entry}`:entry};
                      });
                      setWorksheetValues(v=>({
                        ...v,
                        reagent: log.reagent,
                        color_change: log.observationText,
                        presumptive_result: log.presumptiveResult.toLowerCase().includes('positive')?'Positive':'Negative',
                      }));
                      setNotice('Spot test reaction logged to worksheet & observations.');
                    }}
                  />
                ):null}
              </div>
            )}

            {step===2&&(
              <DynamicWorksheet
                templateId={selectedTemplateId}
                module={modal.record?.data.module||'trace'}
                method={modal.record?.data.method||'Stereomicroscopy'}
                values={worksheetValues}
                observations={draft.observations||''}
                onChange={(newValues)=>{
                  setWorksheetValues(newValues);
                }}
                onObservationsChange={(newObs)=>{
                  setDraft(d=>({...d,observations:newObs}));
                }}
              />
            )}

            {step===3&&(
              <div className="protocol-conclusions-grid">
                <div>
                  <Field
                    label="Official observations narrative"
                    name="observations"
                    value={draft.observations}
                    onChange={set('observations')}
                    area
                  />
                  <Field
                    label="Interpretation / conclusion"
                    name="conclusion"
                    value={draft.conclusion}
                    onChange={set('conclusion')}
                    required={draft.status==='Completed'}
                    area
                  />
                  <Field
                    label="Limitations"
                    name="limitations"
                    value={draft.limitations}
                    onChange={set('limitations')}
                    required={draft.status==='Completed'}
                    area
                  />
                  <Choice
                    label="Examination status"
                    value={draft.status}
                    options={['In progress','Completed'].map(x=>({value:x,label:x}))}
                    onChange={set('status')}
                  />
                  {draft.status==='Completed'&&(
                    <p className="footnote">
                      Completing this examination locks its findings. Additional work requires a new examination.
                    </p>
                  )}
                </div>
                <div>
                  <QaChecklist
                    module={modal.record?.data.module}
                    method={modal.record?.data.method}
                    observations={draft.observations}
                    conclusion={draft.conclusion}
                    limitations={draft.limitations}
                    worksheetValues={worksheetValues}
                  />
                </div>
              </div>
            )}
          </div>
        </>}

        {modal.type==='report'&&<>
          <Choice label="Completed examination" value={draft.examinationId} options={exams.filter(e=>e.caseId===draft.caseId&&e.data.status==='Completed').map(e=>({value:e.id,label:e.id+' · '+e.data.title}))} onChange={s=>{const ex=exams.find(e=>e.id===s)!;setDraft(d=>({...d,examinationId:s,summary:ex.data.conclusion,limitations:ex.data.limitations}))}}/>
          {!exams.some(e=>e.caseId===draft.caseId&&e.data.status==='Completed')&&<p>Complete an examination in this case before drafting a report.</p>}
          <Field label="Report author" name="author" value={draft.author} onChange={set('author')}/>
        </>}

        {['report','edit-report'].includes(modal.type)&&<>
          <Field label="Findings summary" name="summary" value={draft.summary} onChange={set('summary')} area/>
          <Field label="Limitations" name="limitations" value={draft.limitations} onChange={set('limitations')} area/>
        </>}

        {modal.type==='transition'&&<>
          <Choice label="Next status" value={draft.status} options={(modal.record?.data.status==='Draft'?['In review']:modal.record?.data.status==='In review'?['Approved','Draft']:['Issued']).map(x=>({value:x,label:x==='Draft'?'Return to draft':x}))} onChange={set('status')}/>
          <Field label="Reviewer / acting analyst" name="reviewer" value={draft.reviewer} onChange={set('reviewer')}/>
          {modal.record?.data.status==='In review'&&(
            <div style={{display:'flex',gap:'6px',alignItems:'center',fontSize:'11px',marginTop:'-6px',marginBottom:'8px',flexWrap:'wrap'}}>
              <span style={{color:'#6b7280'}}>Suggested reviewers:</span>
              {['Technical Reviewer','Quality Manager','Senior Forensic Analyst'].map(r=>(
                <button
                  key={r}
                  type="button"
                  className="text-button"
                  style={{fontSize:'11px',padding:'2px 6px',background:'#f4effb',borderRadius:'4px'}}
                  onClick={()=>setDraft(d=>({...d,reviewer:r}))}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          <Field label="Review or issue note" name="note" value={draft.note} onChange={set('note')} area/>
          <p className="footnote">Approval requires an independent reviewer different from author ({modal.record?.data.author||'Author'}). Simulation names are not verified signatures.</p>
        </>}

        <div className="form-footer">
          {modal.type==='examine'?(
            <>
              <div>
                {step>1?(
                  <button type="button" className="secondary" onClick={()=>setStep(s=>s-1)}>
                    <ArrowLeft size={14}/> Previous step
                  </button>
                ):(
                  <button type="button" className="secondary" disabled={busy} onClick={()=>{setModal(null);setError('')}}>
                    Cancel
                  </button>
                )}
              </div>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                {step<3?(
                  <>
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={(e)=>submit(e)}
                    >
                      Save progress
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={()=>setStep(s=>s+1)}
                    >
                      Next: {step===1?'Protocol Worksheet':'Conclusions & QA Review'} <ArrowRight size={14}/>
                    </button>
                  </>
                ):(
                  <button
                    className="primary"
                    disabled={busy||!draft.observations?.trim()||(draft.status==='Completed'&&(!draft.conclusion?.trim()||!draft.limitations?.trim()))}
                  >
                    {busy?'Saving…':draft.status==='Completed'?'Complete & Lock Examination':'Save Examination'} <ArrowRight size={15}/>
                  </button>
                )}
              </div>
            </>
          ):modal.type==='case'&&step===2?(
            <button type="button" className="secondary" onClick={()=>setStep(1)}>Back</button>
          ):(
            <button type="button" className="secondary" disabled={busy} onClick={()=>{setModal(null);setError('')}}>Cancel</button>
          )}

          {modal.type!=='examine'&&(
            <button
              className="primary"
              disabled={busy||(modal.type==='examination'&&!draft.evidenceId)||(modal.type==='report'&&!draft.examinationId)}
            >
              {busy?'Saving…':modal.type==='case'&&step===1?'Review case':modal.type==='case'?'Create case':'Save record'}
              <ArrowRight size={15}/>
            </button>
          )}
        </div>
      </form>}
    </DialogContent>
  </Dialog>

  <EvidenceLabel record={labelRecord} onClose={()=>setLabelRecord(null)}/>
  <ReportDocument report={reportDocument} records={records} onClose={()=>setReportDocument(null)}/>
  <BenchSheet examination={benchSheetRecord} records={records} onClose={()=>setBenchSheetRecord(null)} onLaunchWizard={()=>{if(benchSheetRecord)open('examine',benchSheetRecord)}}/>
 </div>
}
