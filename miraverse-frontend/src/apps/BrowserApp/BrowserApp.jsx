// @CodeScene(disable:"Overall Code Complexity")
import React, { useState, useEffect } from 'react';
import OSWindow from '../../components/OSWindow';
import SearchHome from './SearchHome';
import SearchResults from './SearchResults';
import AureSuiteApp from './AureSuiteApp';
import {
    FaithMedPortal, DGAPortal, CyacademyPortal, OrynvellRecordsPortal,
    BankPortal, ShippingPortal, DarkWebOnionPortal
} from './Portals';
import { PORTALS } from './constants';
import { useOSStore } from '../../store/useOSStore';
import {
    X, Plus, ChevronLeft, ChevronRight, RotateCw, Lock, Star, MoreHorizontal, Globe, Folder, ChevronDown
} from 'lucide-react';
import '../../styles/apps/BrowserApp.css';

// ==========================================
// 1. Dynamic Content Resolver: ContentFrame
// ==========================================
function ContentFrame({ url, openTab, navigateTab }) {
    if (!url) return null;
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';

    // Versenet Search Engine
    if (domain === 'versenet.aure' || domain === 'versenet' || domain === 'search.aure' || domain === '') {
        if (path.startsWith('/find?')) {
            const query = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('q') ?? '';
            return <SearchResults query={query} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }

    // Faith Medical Intranet
    if (domain === 'faithmed.aure') {
        return <FaithMedPortal />;
    }

    // Department of Government Affairs
    if (domain === 'dga.gov' || domain === 'dga.gov.aure') {
        return <DGAPortal />;
    }

    // Cyacademy of Sciences
    if (domain === 'cyacademy.edu' || domain === 'cyacademy.edu.aure' || domain === 'cyacademy.aure') {
        return <CyacademyPortal />;
    }

    // Orynvell Public Records
    if (domain === 'records.orynvell.gov') {
        return <OrynvellRecordsPortal />;
    }

    // First Orynvell Bank
    if (domain === 'bank.aure') {
        return <BankPortal />;
    }

    // Cargo & Logistics Tracking
    if (domain === 'shipping.aure' || domain === 'cargotrack.aure') {
        return <ShippingPortal />;
    }

    // Darknet .onion Sites
    if (domain.endsWith('.onion') || domain === 'vectornet.aure') {
        return <DarkWebOnionPortal />;
    }

    // AureSuite Cloud Workspace Hub
    if (domain === 'auresuite.aure') {
        return <AureSuiteApp />;
    }

    // Fallback Generic Connected Page
    return (
        <div className="flex h-full flex-col items-center justify-center bg-white text-slate-800 p-6 text-center select-none font-sans">
            <Globe className="h-16 w-16 mb-4 text-indigo-600 animate-pulse" />
            <h2 className="text-lg font-bold mb-2">Connecting to {domain}...</h2>
            <p className="text-xs text-slate-500 font-mono">Secure Connection Established // Direct Access Link: {url}</p>
        </div>
    );
}

// ==========================================
// 2. Main Coordinator: BrowserApp
// ==========================================
export default function BrowserApp({ onTabBarPointerDown }) {
    const { tabs, activeTabId, historyMap } = useOSStore((s) => s.browserState);
    const openTab = useOSStore((s) => s.openBrowserTab);
    const closeTab = useOSStore((s) => s.closeBrowserTab);
    const setActiveTabId = useOSStore((s) => s.setActiveBrowserTab);
    const navigateTab = useOSStore((s) => s.navigateBrowserTab);
    const goBack = useOSStore((s) => s.goBrowserBack);
    const goForward = useOSStore((s) => s.goBrowserForward);

    const closeWindow = useOSStore((s) => s.closeWindow);
    const toggleMinimize = useOSStore((s) => s.toggleMinimize);
    const toggleMaximize = useOSStore((s) => s.toggleMaximize);

    const [addressInput, setAddressInput] = useState('');
    const [bookmarksOpen, setBookmarksOpen] = useState(false);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    useEffect(() => {
        if (activeTab) setAddressInput(activeTab.url);
    }, [activeTabId, activeTab?.url]);

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

    const refresh = () => {
        if (activeTab?.url) navigateTab(activeTab.url, activeTab.title);
    };

    return (
        <OSWindow>
            {/* TabBar Section */}
            <div
                onPointerDown={onTabBarPointerDown}
                className="tabbar max-w-full shrink-0 select-none cursor-grab active:cursor-grabbing bg-slate-800 text-slate-200 border-b border-slate-700"
            >
                <div className="flex space-x-1 overflow-x-auto flex-1 hide-scrollbar">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`tab flex items-center group min-w-[120px] max-w-[200px] text-xs font-semibold ${activeTabId === tab.id ? 'active bg-slate-900 text-white font-bold' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'}`}
                        >
                            <span className="truncate flex-1">
                                {tab.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Tab'}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                className="ml-2 p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => openTab('https://versenet.aure', 'New Tab')}
                    className="p-1.5 ml-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                    disabled={tabs.length >= 6}
                    title="Open New Tab"
                >
                    <Plus size={18} />
                </button>

                {/* Integrated Browser Window Control Buttons */}
                <div className="flex items-center gap-3.5 ml-auto pl-4 pr-2 text-slate-300 font-bold text-xs select-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize('browser'); }}
                        className="hover:text-white transition-colors px-1 cursor-pointer"
                        title="Minimize"
                    >
                        _
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMaximize('browser'); }}
                        className="hover:text-white transition-colors px-1 cursor-pointer"
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

            {/* AddressBar Section matching Blueprint UI */}
            <div className="addressbar relative max-w-full shrink-0 bg-slate-100 border-b border-slate-300 px-3 py-2 flex items-center gap-2">
                <div className="flex items-center space-x-1 text-slate-600">
                    <button onClick={goBack} disabled={!canBack} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft size={18} /></button>
                    <button onClick={goForward} disabled={!canForward} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronRight size={18} /></button>
                    <button onClick={refresh} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"><RotateCw size={16} /></button>
                </div>

                <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center bg-white border border-slate-300 rounded-full px-3 py-1 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
                    <Lock size={14} className="text-slate-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full text-xs font-mono text-slate-800 outline-none bg-transparent"
                        placeholder="Search or enter web address..."
                        spellCheck={false}
                    />
                    <button
                        type="submit"
                        className="ml-2 px-3 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-full transition cursor-pointer"
                    >
                        Go
                    </button>
                </form>

                <div className="flex items-center space-x-1 text-slate-500">
                    <button
                        onClick={() => setBookmarksOpen((open) => !open)}
                        className={`p-1.5 rounded transition cursor-pointer flex items-center gap-0.5 ${bookmarksOpen ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200 hover:text-slate-800'}`}
                        title="Starter bookmarks"
                        aria-expanded={bookmarksOpen}
                    >
                        <Folder size={18} />
                        <ChevronDown size={11} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-slate-200 hover:text-slate-800 cursor-pointer"><Star size={18} /></button>
                    <button className="p-1.5 rounded hover:bg-slate-200 hover:text-slate-800 cursor-pointer"><MoreHorizontal size={18} /></button>
                </div>

                {bookmarksOpen && (
                    <div className="absolute right-3 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <Folder size={13} /> Starter Bookmarks
                        </div>
                        <div className="max-h-80 overflow-y-auto p-1.5">
                            {Object.entries(PORTALS).map(([url, portal]) => {
                                const IconComp = portal.icon;
                                return (
                                    <button
                                        key={url}
                                        onClick={() => {
                                            navigateTab(`https://${url}`, portal.title);
                                            setBookmarksOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-indigo-50 transition"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-indigo-600">
                                            <IconComp size={15} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-semibold text-slate-800">{portal.title}</span>
                                            <span className="block truncate text-[10px] font-mono text-slate-400">{url}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Dynamic Portal Content Area */}
            <div className="flex-1 flex flex-col overflow-auto bg-white text-slate-800">
                <ContentFrame url={activeTab?.url} openTab={openTab} navigateTab={navigateTab} />
            </div>
        </OSWindow>
    );
}
