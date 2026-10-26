import React, { useState } from 'react';
import { SERVICE_DIRECTORY } from './externalWeb';
import { 
  ArrowUpRight, Search, Folder, FolderOpen, ChevronDown, ChevronUp, Globe, 
  Sparkles, Landmark, Shield, Activity, Truck, Terminal, Building, FileText, BookOpen, UserCheck
} from 'lucide-react';
import { resolveBrowserInput, IN_GAME_PORTALS, type InGamePortal } from './browserModel';

export interface SearchHomeProps { 
  openTab?: (url: string, title?: string) => void; 
  navigateTab: (url: string, title?: string) => void; 
}

const PORTAL_ICONS: Record<string, React.ElementType> = {
  auresuite: Sparkles,
  bank: Landmark,
  dga: Shield,
  faithmed: Activity,
  shipping: Truck,
  vectornet: Terminal,
  cyacademy: Building,
  records: FileText,
  royalhistory: BookOpen,
  maispace: Globe,
  civinet: UserCheck
};

export default function SearchHome({ navigateTab, openTab }: SearchHomeProps) {
  const [query, setQuery] = useState('');
  const [isFolderOpen, setIsFolderOpen] = useState(true);

  return (
    <div className="vn-homepage overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
        
        {/* Search Engine Hero */}
        <section className="text-center space-y-4 max-w-xl mx-auto" aria-label="Versenet search">
          <h1 className="text-4xl font-extrabold tracking-tight font-display text-[#39234f]">
            versenet
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Meridion Civic & Institutional Digital Network
          </p>

          <form 
            onSubmit={event => { 
              event.preventDefault(); 
              if (query.trim()) navigateTab(resolveBrowserInput(query)); 
            }}
            className="flex items-center gap-2 p-1.5 pl-3.5 bg-white border border-slate-300 rounded-2xl shadow-xs focus-within:border-[#39234f] focus-within:ring-2 focus-within:ring-purple-100 transition"
          >
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              aria-label="Search the fictional network" 
              placeholder="Search lore, civil registries, or enter an address..." 
              value={query} 
              onChange={event => setQuery(event.target.value)} 
              spellCheck={false}
              className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-800 placeholder:text-slate-400 font-sans"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-[#39234f] hover:bg-[#4b3264] text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </section>

        {/* ── IN-GAME PORTALS FOLDER ── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all">
          <div 
            onClick={() => setIsFolderOpen(!isFolderOpen)}
            className="p-4 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200 flex items-center justify-between cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-[#39234f] flex items-center justify-center font-bold">
                {isFolderOpen ? <FolderOpen size={18} /> : <Folder size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>In-Game Web Portals</span>
                  <span className="px-2 py-0.2 rounded-full bg-purple-100 text-[#39234f] text-[10px] font-mono font-bold">
                    {IN_GAME_PORTALS.length} Sites Folder
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Canonical web applications and portals in the Miraverse network
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px] font-mono">{isFolderOpen ? 'Collapse Folder' : 'Expand Folder'}</span>
              {isFolderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {isFolderOpen && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#FAFBFD]">
              {IN_GAME_PORTALS.map((portal) => {
                const IconComponent = PORTAL_ICONS[portal.id] || Globe;
                
                const badgeStyle = 
                  portal.badge === 'SUITE' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  portal.badge === 'SECURE' || portal.badge === 'HEALTH' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  portal.badge === 'GOV' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  portal.badge === 'CARGO' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  portal.badge === 'ONION' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  portal.badge === 'ACADEMIC' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                  'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={portal.id}
                    onClick={() => navigateTab(portal.url, portal.name)}
                    className="group relative p-3.5 bg-white border border-slate-200 hover:border-purple-300 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-2.5 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-50 text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-700 flex items-center justify-center transition">
                          <IconComponent size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900 transition leading-tight">
                            {portal.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {portal.domain}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border shrink-0 ${badgeStyle}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {portal.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{portal.category}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTab?.(portal.url, portal.name);
                        }}
                        title="Open in new tab"
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                      >
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Directory Shortcut Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-slate-200">
          <span>Versenet Fictional Intranet Protocol v3.8</span>
          <button 
            onClick={() => navigateTab(SERVICE_DIRECTORY)}
            className="text-purple-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>External Internet & Service Directory</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
