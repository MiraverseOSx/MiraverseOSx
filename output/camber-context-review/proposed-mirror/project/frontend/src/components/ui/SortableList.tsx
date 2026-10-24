import React from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './sortable-list.css';

interface Item { id: string; label: string }
function SortableRow({ item, onSelect }: { item: Item; onSelect?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 5 : undefined }}><button ref={setActivatorNodeRef} type="button" className="mira-sort-handle" {...attributes} {...listeners} aria-label={`Reorder ${item.label}`}>⠿</button>{onSelect ? <button type="button" className="mira-sort-label" onClick={() => onSelect(item.id)}>{item.label}</button> : <span>{item.label}</span>}</li>;
}
export default function SortableList({ items, onReorder, onSelect, label }: { items: Item[]; onReorder: (ids: string[]) => void; onSelect?: (id: string) => void; label: string }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  return <div className="mira-sortable"><p className="mira-sort-help">Drag a handle, or focus it and press Space, arrow keys, then Space to drop. Escape cancels.</p><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => { if (!over || active.id === over.id) return; const from = items.findIndex(item => item.id === active.id), to = items.findIndex(item => item.id === over.id); if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to).map(item => item.id)); }}><SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}><ul aria-label={label}>{items.map(item => <SortableRow key={item.id} item={item} onSelect={onSelect}/>)}</ul></SortableContext></DndContext></div>;
}
