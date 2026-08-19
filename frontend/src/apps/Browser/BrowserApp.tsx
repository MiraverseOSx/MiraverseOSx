import React, { useState, useEffect } from 'react';
import SearchHome from './SearchHome';
import SearchResults from './SearchResults';
import AureSuiteApp from './AureSuiteApp';
import {
    FaithMedPortal, DGAPortal, CyacademyPortal, OrynvellRecordsPortal,
    BankPortal, ShippingPortal, DarkWebOnionPortal,
    CivinetPortal, QuestNoticePortal, RoyalHistoryPortal
} from './Portals';
import { MaiSpacePortal } from './MaiSpacePortal';
import { useOSStore } from '../../store/useOSStore';
import {
    X, Plus, ChevronLeft, ChevronRight, RotateCw, Lock, Globe, Home
} from 'lucide-react';

function ContentFrame({ url, openTab, navigateTab }: any) {
    if (!url) return <SearchHome navigateTab={navigateTab} openTab={openTab} />;
    
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';

    if (domain === 'versenet.aure' || domain === 'versenet' || domain === 'search.aure' || domain === '') {
        if (path.startsWith('/find?')) {
            const query = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('q') ?? '';
            return <SearchResults query={query} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }

    if (domain === 'civinet.mer' || domain === 'civinet.aure' || domain === 'civinet') return <CivinetPortal />;
    if (domain === 'questnotice.mer' || domain === 'questnotice.aure' || domain === 'questnotice') return <QuestNoticePortal />;
    if (domain === 'royalhistory.mer' || domain === 'royalhistory.aure' || domain === 'royalhistory') return <RoyalHistoryPortal />;
    if (domain === 'faithmed.aure') return <FaithMedPortal />;
    if (domain === 'dga.gov' || domain === 'dga.gov.aure') return <DGAPortal />;
    if (domain === 'cyacademy.edu' || domain === 'cyacademy.edu.aure' || domain === 'cyacademy.aure') return <CyacademyPortal />;
    if (domain === 'records.orynvell.gov') return <OrynvellRecordsPortal />;
    if (domain === 'bank.aure' || domain === 'finance.oryn.gov' || domain === 'finance.mer') return <BankPortal />;
    if (domain === 'shipping.aure' || domain === 'cargotrack.aure') return <ShippingPortal />;
    if (domain.endsWith('.onion') || domain === 'vectornet.aure') return <DarkWebOnionPortal />;
    if (domain === 'auresuite.aure') return <AureSuiteApp />;
    if (domain === 'mai.space' || domain === 'mai.space.aure' || domain === 'maispace.aure' || domain === 'social.aure') return <MaiSpacePortal />;

    return (
        <div className="flex h-full flex-col items-center justify-center bg-[#FAFBFD] text-slate-800 p-6 text-center select-none font-sans">
            <Globe className="h-14 w-14 mb-3 text-emerald-600 animate-pulse" />
            <h2 className="text-base font-bold mb-1 text-slate-900">Connecting to {domain}...</h2>
            <p className="text-xs text-slate-500 font-mono">Secure Versenet Gateway // {url}</p>
            <button
                onClick={() => navigateTab('https://versenet.aure')}
                className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
            >
                Return to Search Home
            </button>
        </div>
    );
}

export default function BrowserApp() {
    const { tabs, activeTabId, historyMap } = useOSStore((s) => s.browserState);
    const openTab = useOSStore((s) => s.openBrowserTab);
    const closeTab = useOSStore((s) => s.closeBrowserTab);
    const setActiveTabId = useOSStore((s) => s.setActiveBrowserTab);
    const navigateTab = useOSStore((s) => s.navigateBrowserTab);
    const goBack = useOSStore((s) => s.goBrowserBack);
    const goForward = useOSStore((s) => s.goBrowserForward);

    const [addressInput, setAddressInput] = useState('');
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

    useEffect(() => {
        setAddressInput(activeTab?.url || 'https://versenet.aure');
    }, [activeTab?.url]);

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = addressInput.trim();
        if (!trimmed) return;

        if (trimmed.includes('.') && !trimmed.includes(' ')) {
            const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
            navigateTab(url);
        } else {
            navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(trimmed)}`);
        }
    };

    const canBack = (() => {
        const h = historyMap[activeTabId];
        return !!(h && h.index > 0);
    })();

    const canForward = (() => {
        const h = historyMap[activeTabId];
        return !!(h && h.index < h.stack.length - 1);
    })();

    const refresh = () => {
        if (!activeTab?.url) return;
        navigateTab(activeTab.url, activeTab.title || 'Browsing');
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFBFD] overflow-hidden select-none font-sans text-xs">
            
            {/* 1. NATIVE LIGHT TAB STRIP (NO DUPLICATE WINDOW CONTROLS) */}
            <div className="flex items-center h-10 px-2 bg-slate-100 border-b border-slate-200 gap-1 select-none">
                <div className="flex items-center space-x-1 overflow-x-auto flex-1 scrollbar-none">
                    {tabs.map((tab) => {
                        const isActive = activeTabId === tab.id;
                        const label = tab.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Tab';

                        return (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition-all text-xs cursor-pointer max-w-[200px] min-w-[110px] group ${
                                    isActive
                                        ? 'bg-white text-slate-900 font-bold border-t border-x border-slate-200 shadow-xs'
                                        : 'bg-transparent text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                }`}
                            >
                                <span className="truncate flex-1 font-mono text-[11px]">{label}</span>
                                {tabs.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTab(tab.id);
                                        }}
                                        className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Close Tab"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => openTab('https://versenet.aure', 'New Tab')}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
                        disabled={tabs.length >= 8}
                        title="Open New Tab"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* 2. CLEAN BROWSER NAVIGATION & ADDRESS BAR */}
            <div className="flex items-center h-11 px-3 bg-white border-b border-slate-200 gap-2">
                <div className="flex items-center space-x-1 text-slate-600">
                    <button
                        onClick={goBack}
                        disabled={!canBack}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Back"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goForward}
                        disabled={!canForward}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Forward"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={refresh}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Refresh"
                    >
                        <RotateCw size={14} />
                    </button>
                    <button
                        onClick={() => navigateTab('https://versenet.aure')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Home"
                    >
                        <Home size={15} />
                    </button>
                </div>

                {/* URL Input Form */}
                <form
                    onSubmit={handleAddressSubmit}
                    className="flex-1 flex items-center bg-slate-50 hover:bg-white border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 rounded-xl px-3 py-1 transition shadow-xs"
                >
                    <Lock size={12} className="text-emerald-600 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full text-xs font-mono text-slate-800 outline-none bg-transparent"
                        placeholder="Search Versenet or enter URL..."
                        spellCheck={false}
                    />
                    <button
                        type="submit"
                        className="ml-2 px-3 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer"
                    >
                        Go
                    </button>
                </form>
            </div>

            {/* 3. BROWSER CONTENT CANVAS */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-[#FAFBFD] text-slate-800">
                <ContentFrame
                    url={activeTab?.url}
                    openTab={openTab}
                    navigateTab={navigateTab}
                />
            </div>
        </div>
    );
}
