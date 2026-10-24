import React, { useState } from 'react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { Card, CardBody, CardHeader } from '../components/ui/card';
import SortableList from '../components/ui/SortableList';
export default { title: 'Miraverse/Foundations' };
export const Controls = { render: () => <div style={{ maxWidth: 620 }}><h1>Shared controls</h1><div className="mira-toolbar"><Button variant="solid">Save report</Button><Button>Secondary action</Button><Button variant="outline">Open source</Button><Button disabled>Unavailable</Button></div><label htmlFor="story-title">Document title</label><Input id="story-title" defaultValue="Broad Street notes"/><Card><CardHeader>Reading panel</CardHeader><CardBody><p className="mira-prose">Times New Roman body text. Shared controls remain sans-serif, and technical records retain their own typography.</p><code>CASE-2026-002 / RECORD</code></CardBody></Card></div> };
export const WindowChrome = { render: () => <div className="mira-desktop" style={{ minHeight: 420 }}><section className="os-window" data-app="preview" data-active="true" style={{ position: 'relative', width: '100%', height: 360 }}><header className="os-window__titlebar"><div className="os-window__name"><strong>Document preview</strong><small>VAULT / COMPONENT PREVIEW</small></div><div className="os-window__controls"><button title="Minimize">−</button><button title="Maximize">□</button><button title="Close">×</button></div></header><div className="os-window__body"><p className="mira-prose" style={{ padding: 16 }}>A preview of shared window chrome. These sample controls do not operate real game windows.</p></div></section></div> };
function SortableExample() {
  const [items, setItems] = useState([{ id: 'about', label: 'About me' }, { id: 'music', label: 'Profile music' }, { id: 'friends', label: 'Top Friends' }]);
  return <div style={{ maxWidth: 420 }}><h1>Keyboard and pointer sorting</h1><SortableList label="Example module order" items={items} onReorder={ids => setItems(ids.map(id => items.find(item => item.id === id)!))}/></div>;
}
export const SortableModules = { render: () => <SortableExample/> };
