import React, { useState } from 'react';
import { Cat, Dog, Bird, Sprout, Utensils, House, TrainFront, CircuitBoard, BookOpen, HeartPulse, BriefcaseBusiness, Landmark, Orbit } from 'lucide-react';
import type { WebRecord } from './searchCatalog';

const SYMBOLS = { dog: Dog, cat: Cat, animals: Bird, plants: Sprout, food: Utensils, housing: House, travel: TrainFront, technology: CircuitBoard, education: BookOpen, health: HeartPulse, work: BriefcaseBusiness, history: Landmark, research: Orbit };
export function TopicArtwork({ topic, seed = 0 }: { topic?: string; seed?: number }) {
  const Symbol = SYMBOLS[topic || 'research'] || Orbit;
  const light = seed % 2 === 0;
  return <svg viewBox="0 0 600 360" className="vs-artwork" aria-hidden="true">
    <rect width="600" height="360" fill={light ? '#e9e5ee' : '#392a49'}/>
    <circle cx={seed % 2 ? 420 : 180} cy="160" r="135" fill={light ? '#d9d0e4' : '#645173'}/>
    <path d="M0 290 Q150 140 330 300 T650 180 V360 H0Z" fill={light ? '#c2b5cf' : '#24192f'}/>
    <g stroke={light ? '#9683a6' : '#c3afd2'} strokeWidth="1" fill="none" opacity=".55"><circle cx="300" cy="180" r="112"/><path d="M50 55h100M100 30v50M450 290h100M500 265v50"/></g>
    <Symbol x="220" y="100" width="160" height="160" color={light ? '#4a345f' : '#f1e9f6'} strokeWidth={.8}/>
  </svg>;
}
export function WebImage({ record }: { record: WebRecord }) {
  const [failed, setFailed] = useState(false);
  const photo = ['/images/versenet/labrador.jpg', '/images/versenet/sunflower.jpg'].includes(record.photo || '') ? record.photo : null;
  return <div className="vs-image-frame">
    {photo && !failed ? <img src={photo} alt={record.title} loading="lazy" onError={() => setFailed(true)}/> : <TopicArtwork topic={record.art} seed={record.seed}/>}
    {failed && <span className="vs-image-fallback">Photo unavailable · illustration shown</span>}
  </div>;
}
export function CityMap({ record, navigateTab, compact = false }: { record: WebRecord; navigateTab?: (url: string, title?: string) => void; compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const places = record.places || [];
  const place = places[selected];
  return <div className={`vs-city-map ${compact ? 'is-compact' : ''}`}>
    <div className="vs-map-surface" role="group" aria-label="Schematic public map of Aureline">
      <svg viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden="true"><rect width="600" height="360" fill="#eeedf1"/><path d="M0 70L600 210M0 260L600 70M150 0L360 360M450 0L220 360" stroke="#fff" strokeWidth="22"/><path d="M0 70L600 210M0 260L600 70M150 0L360 360M450 0L220 360" stroke="#cbc5d4" strokeWidth="1"/><path d="M470 0Q280 80 430 210T390 360" stroke="#bcb6d7" strokeWidth="30" fill="none"/><rect x="90" y="75" width="95" height="70" rx="20" fill="#d2cbdc"/><text x="20" y="340" fill="#81728c" fontSize="12" letterSpacing="3">AURELINE · SCHEMATIC</text></svg>
      {places.map((pin, index) => compact ? <span key={pin.name} className="vs-map-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>{index + 1}</span> : <button key={pin.name} className={`vs-map-pin ${selected === index ? 'is-selected' : ''}`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} aria-label={`Show ${pin.name}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>{index + 1}</button>)}
    </div>
    {!compact && <div className="vs-map-listings">{places.map((pin, index) => <button key={pin.name} aria-pressed={selected === index} onClick={() => setSelected(index)}>{index + 1}. {pin.name}</button>)}{place && <section aria-live="polite"><h3>{place.name}</h3><p>{place.description}</p><button className="vs-primary" onClick={() => navigateTab?.(place.url, place.name)}>Open public listing</button></section>}<small>Illustrative positions, not measured distances.</small></div>}
  </div>;
}
