'use client';
import {Plus,X} from 'lucide-react';
import {useState} from 'react';

const AVAILABLE_TAGS=['urgent','high-priority','reference-material','suspect-item','sealed','compromised','glass','fiber','textile','liquid','powder','digital','document','photo','biological','drug-test','toxicology','trace','dna'];

export function TagsEditor({tags=[],onAdd,onRemove,disabled=false}:{tags?:string[];onAdd:(tag:string)=>void;onRemove:(tag:string)=>void;disabled?:boolean}){
 const [showDropdown,setShowDropdown]=useState(false);const [filter,setFilter]=useState('');
 const availableToAdd=AVAILABLE_TAGS.filter(t=>!tags.includes(t)&&t.includes(filter.toLowerCase()));
 return <section className="panel panel-padding"><h2>Tags &amp; categorization</h2><div className="tags-container">{tags?.map(tag=><span key={tag} className="tag"><span>{tag}</span><button type="button" disabled={disabled} onClick={()=>onRemove(tag)} aria-label={`Remove tag ${tag}`}><X size={14}/></button></span>)}</div><div className="tag-input-group"><input type="text" placeholder="Search or add tags…" value={filter} onChange={e=>setFilter(e.target.value)} onFocus={()=>setShowDropdown(true)}/><button type="button" disabled={disabled||!filter.trim()||tags.includes(filter.toLowerCase())} onClick={()=>{if(filter.trim()){onAdd(filter.toLowerCase());setFilter('')}}}><Plus size={16}/>Add</button></div>{showDropdown&&availableToAdd.length>0&&<div className="tag-dropdown">{availableToAdd.slice(0,8).map(tag=><button key={tag} type="button" onClick={()=>{onAdd(tag);setFilter('')}} className="tag-option">{tag}</button>)}</div>}<button type="button" className="text-button" onClick={()=>setShowDropdown(false)}>Done</button></section>
}
