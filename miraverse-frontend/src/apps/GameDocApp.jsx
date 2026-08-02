import React, { useMemo, useState } from 'react';
import data from '../data/gameDevDoc.json';

export default function GameDocApp() {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const sections = data?.sections ?? [];

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter((s) =>
      s.title?.toLowerCase().includes(q) ||
      (Array.isArray(s.content) && s.content.join(' ').toLowerCase().includes(q))
    );
  }, [sections, query]);

  const active = filtered[activeIndex] || filtered[0] || null;

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar: Sections list */}
      <aside className="w-56 border-r border-slate-200 bg-slate-50 p-3 text-xs">
        <div className="mb-2 text-[10px] font-bold tracking-widest text-slate-500">GAME DOC SECTIONS</div>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
          className="mb-2 w-full rounded border border-slate-300 bg-white px-2 py-1 text-[11px] outline-none"
          placeholder="Search title or text"
        />
        <div className="max-h-[calc(100vh-200px)] overflow-auto pr-1">
          {filtered.map((s, i) => (
            <button
              key={`${s.title}-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`mb-1 w-full truncate rounded px-2 py-1 text-left ${i===activeIndex? 'bg-purple-100 text-purple-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'}`}
              title={s.title}
            >
              {s.title || `Section ${i+1}`}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-2 text-slate-500">No sections match.</div>
          )}
        </div>
      </aside>

      {/* Main: Section content */}
      <section className="flex-1 overflow-auto p-5">
        <header className="mb-3 border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-800">{active?.title || 'No section selected'}</h2>
          <p className="mt-1 text-[11px] text-slate-500">{data?.title}</p>
        </header>
        <div className="prose prose-sm max-w-none">
          {active?.content?.map((p, idx) => (
            <p key={idx} className="my-2 leading-relaxed text-slate-700">{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
