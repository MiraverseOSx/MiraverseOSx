'use client';
import {Lightbulb} from 'lucide-react';

export function AnalysisSuggestions({suggestions=[]}:{suggestions?:string[]}){
 if(!suggestions||suggestions.length===0)return null;
 return <section className="panel panel-padding"><h2><Lightbulb size={18}/>Analysis guidance</h2><ul className="suggestions-list">{suggestions.map((suggestion,i)=><li key={i}>{suggestion}</li>)}</ul><p className="footnote">These are workflow suggestions based on the examination type. Use your professional judgment.</p></section>
}
