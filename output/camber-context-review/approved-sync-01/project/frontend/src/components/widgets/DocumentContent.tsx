import React, { useState } from 'react';

export default function DocumentContent({ file }: { file: any }) {
  const [node, setNode] = useState<string | null>(null);
  const sections = file.content.sections;
  if (file.kind === 'map' && file.content.mapData) {
    const map = file.content.mapData;
    const selected = map.nodes.find(n => n.id === node);
    return <section className="document-map"><h3>{map.district}</h3><div className="document-map-grid" aria-label={`${map.district} map`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={map.nodes.map(n => `${n.x},${n.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 1" /></svg>
      {map.nodes.map(n => <button key={n.id} aria-pressed={node === n.id} onClick={() => setNode(n.id)} style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.name}</button>)}
      </div><p role="status">{selected ? `${selected.name} · ${selected.type} · Grid ${selected.x}, ${selected.y}` : 'Select a location to inspect its grid reference.'}</p></section>;
  }
  if (file.kind === 'log' || file.kind === 'code') return <section className={`document-${file.kind}`} aria-label={file.kind === 'log' ? 'System log reader' : 'Module specifications'}><div className="document-format-label">{file.kind === 'log' ? 'EVENT STREAM / READ ONLY' : 'SPECIFICATIONS / READ ONLY'}</div><ol>{file.content.bodyText.split('\n').map((line, index) => <li key={index}><code>{line || ' '}</code></li>)}</ol></section>;
  return <article className={`document-sheet document-sheet--${file.kind}`}>
    <span className="document-format-label">{({ note: 'PERSONAL NOTE', clinical: 'CLINICAL RECORD', archive: 'ARCHIVAL TRANSCRIPT', form: 'FILLABLE FORM', alert: 'INTEGRITY REVIEW', document: 'DOCUMENT' })[file.kind] || 'RECORD'}</span>
    {sections.length ? sections.map((section, index) => <section key={index}><h3>{section.title}</h3><p>{section.body}</p></section>) : <p>{file.content.bodyText || 'This file has no readable text content.'}</p>}
  </article>;
}
