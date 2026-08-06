import React, { useState, useMemo, useEffect } from 'react';
import GlassContainer from '../../components/GlassContainer';
import SearchHome from './SearchHome';
import SearchResults from './SearchResults';
import { PORTALS } from './constants';
import { useOSStore } from '../../store/useOSStore';
import { 
    X, Plus, ChevronLeft, ChevronRight, RotateCw, Lock, Star, MoreHorizontal, Globe 
} from 'lucide-react';
import '../../styles/apps/BrowserApp.css';

// ==========================================
// 1. Inlined Sub-component: ContentFrame
// ==========================================
function ContentFrame({ url, openTab, navigateTab }) {
    if (!url) return null;
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';

    if (domain === 'search.aure' || domain === '') {
        if (path.startsWith('/find?q=')) {
            const query = decodeURIComponent(path.split('q=')[1] || '');
            return <SearchResults query={query} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }

    return (
        <div className="flex h-full flex-col items-center justify-center bg-white text-slate-800 p-6 text-center select-none font-sans">
            <Globe className="h-16 w-16 mb-4 text-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold mb-2">Connecting to {domain}...</h2>
            <p className="text-xs text-slate-500 font-mono">Secure Connection Established // Direct Access Link: {url}</p>
        </div>
    );
}

// ==========================================
// 2. Main Coordinator: BrowserApp
// ==========================================
export default function BrowserApp({ onTabBarPointerDown }) {
    const [tabs, setTabs] = useState([
        { id: 1, url: 'https://search.aure', title: 'New Tab' }
    ]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [nextTabId, setNextTabId] = useState(2);
    const [addressInput, setAddressInput] = useState('');
    const [historyMap, setHistoryMap] = useState({ 1: { stack: ['https://search.aure'], index: 0 } });

    const browserUrl = useOSStore((s) => s.browserUrl);
    const setBrowserUrl = useOSStore((s) => s.setBrowserUrl);
    const closeWindow = useOSStore((s) => s.closeWindow);
    const toggleMinimize = useOSStore((s) => s.toggleMinimize);
    const toggleMaximize = useOSStore((s) => s.toggleMaximize);

    useEffect(() => {
        if (browserUrl) {
            openTab(browserUrl, browserUrl.replace('https://', '').split('/')[0]);
            setBrowserUrl(null);
        }
    }, [browserUrl]);

    const activeTab = tabs.find(t => t.id === activeTabId);

    useEffect(() => {
        if (activeTab) setAddressInput(activeTab.url);
    }, [activeTabId, activeTab?.url]);

    const openTab = (url, title) => {
        const existing = tabs.find(t => t.url === url);
        if (existing) { setActiveTabId(existing.id); return; }
        if (tabs.length >= 6) return;
        const newTab = { id: nextTabId, url, title };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(nextTabId);
        setNextTabId(prev => prev + 1);
        setHistoryMap(prev => ({ ...prev, [nextTabId]: { stack: [url], index: 0 } }));
    };

    const closeTab = (id) => {
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex(t => t.id === id);
        const newTabs = tabs.filter(t => t.id !== id);
        if (id === activeTabId) setActiveTabId(newTabs[Math.min(idx, newTabs.length - 1)].id);
        setTabs(newTabs);
    };

    const navigateTab = (url, title = 'Browsing') => {
        let formattedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) formattedUrl = `https://${url}`;
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: formattedUrl, title } : t));
        setHistoryMap(prev => {
            const h = prev[activeTabId] || { stack: [], index: -1 };
            const newStack = h.stack.slice(0, h.index + 1).concat(formattedUrl);
            return { ...prev, [activeTabId]: { stack: newStack, index: newStack.length - 1 } };
        });
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (addressInput.trim()) navigateTab(addressInput.trim());
    };

    const canBack = (() => {
        const h = historyMap[activeTabId];
        return h && h.index > 0;
    })();
    const canForward = (() => {
        const h = historyMap[activeTabId];
        return h && h.index < h.stack.length - 1;
    })();
    const goBack = () => {
        setHistoryMap(prev => {
            const h = prev[activeTabId];
            if (!h || h.index <= 0) return prev;
            const idx = h.index - 1;
            const url = h.stack[idx];
            setTabs(t => t.map(tab => tab.id === activeTabId ? { ...tab, url } : tab));
            setAddressInput(url);
            return { ...prev, [activeTabId]: { stack: h.stack, index: idx } };
        });
    };
    const goForward = () => {
        setHistoryMap(prev => {
            const h = prev[activeTabId];
            if (!h || h.index >= h.stack.length - 1) return prev;
            const idx = h.index + 1;
            const url = h.stack[idx];
            setTabs(t => t.map(tab => tab.id === activeTabId ? { ...tab, url } : tab));
            setAddressInput(url);
            return { ...prev, [activeTabId]: { stack: h.stack, index: idx } };
        });
    };
    const refresh = () => { if (activeTab?.url) setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t } : t)); };

    return (
        <GlassContainer className="flex h-full w-full flex-col overflow-hidden select-none">
            {/* TabBar Section */}
            <div 
                onPointerDown={onTabBarPointerDown}
                className="flex items-center px-2 pt-2 bg-[#0d0724] border-b border-purple-500/20 max-w-full overflow-hidden shrink-0 select-none cursor-grab active:cursor-grabbing"
            >
                <div className="flex space-x-1 overflow-x-auto flex-1 hide-scrollbar">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex items-center group min-w-[120px] max-w-[200px] px-3 py-1.5 rounded-t-lg text-sm cursor-pointer transition-colors ${activeTabId === tab.id
                                    ? 'bg-[#130b2e] text-purple-200 border-t border-x border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                    : 'bg-transparent text-purple-400/60 hover:bg-purple-900/30'
                                }`}
                        >
                            <span className="truncate flex-1">
                                {tab.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Tab'}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                className="ml-2 p-0.5 rounded-full hover:bg-purple-500/20 text-purple-400/60 hover:text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={() => openTab('https://search.aure', 'New Tab')}
                    className="p-1.5 ml-2 rounded-full text-purple-400 hover:bg-purple-900/50 hover:text-purple-200 transition-colors"
                    disabled={tabs.length >= 6}
                >
                    <Plus size={18} />
                </button>

                {/* Integrated Browser Window Control Buttons */}
                <div className="flex items-center gap-3.5 ml-auto pl-4 pr-2 text-purple-400 font-bold text-xs select-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize('browser'); }}
                        className="hover:text-purple-200 transition-colors px-1 cursor-pointer"
                        title="Minimize"
                    >
                        _
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMaximize('browser'); }}
                        className="hover:text-purple-200 transition-colors px-1 cursor-pointer"
                        title="Maximize"
                    >
                        □
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow('browser'); }}
                        className="hover:text-red-400 transition-colors px-1 cursor-pointer"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* AddressBar Section */}
            <div className="flex items-center p-2 bg-[#130b2e] border-b border-purple-500/20 space-x-3 max-w-full shrink-0">
                <div className="flex items-center space-x-1 text-purple-400">
                    <button onClick={goBack} disabled={!canBack} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
                    <button onClick={goForward} disabled={!canForward} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                    <button onClick={refresh} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><RotateCw size={16} /></button>
                </div>

                <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center bg-[#0d0724] border border-purple-500/30 rounded-full px-4 py-1.5 focus-within:border-purple-400/60 transition-colors shadow-inner">
                    <Lock size={14} className="text-purple-500/60 mr-2" />
                    <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="flex-1 bg-transparent text-purple-100 placeholder-purple-700/50 outline-none text-sm font-medium"
                        placeholder="Search or enter web address"
                        spellCheck={false}
                    />
                </form>

                <div className="flex items-center space-x-1 text-purple-400">
                    <button className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><Star size={18} /></button>
                    <button className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><MoreHorizontal size={18} /></button>
                </div>
            </div>

            {/* Bookmarks Bar */}
            <div className="flex items-center px-4 py-1.5 bg-[#170e37] border-b border-purple-500/20 space-x-2 text-xs text-purple-300 overflow-x-auto hide-scrollbar">
                {Object.entries(PORTALS).map(([url, portal]) => {
                    const IconComp = portal.icon;
                    return (
                        <button
                            key={url}
                            onClick={() => navigateTab(`https://${url}`, portal.title)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d0724] border border-purple-500/20 text-purple-300 hover:text-purple-100 hover:bg-purple-900/40 hover:border-purple-400/40 transition-all font-sans font-semibold text-[11px] whitespace-nowrap"
                        >
                            <IconComp size={12} className="text-purple-400" />
                            <span>{portal.title}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-auto bg-white/60 text-slate-800">
                <ContentFrame url={activeTab?.url} openTab={openTab} navigateTab={navigateTab} />
            </div>
        </GlassContainer>
    );
}
