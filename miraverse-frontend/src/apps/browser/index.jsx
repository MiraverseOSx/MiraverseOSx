import React, { useState } from 'react';
import GlassContainer from '../../components/GlassContainer';
import TabBar from './TabBar';
import AddressBar from './AddressBar';
import ContentFrame from './ContentFrame';
import { PORTALS } from './constants';
import '../../styles/apps/BrowserApp.css';

export default function BrowserApp({ onTabBarPointerDown }) {
    const [tabs, setTabs] = useState([
        { id: 1, url: 'https://search.aure', title: 'New Tab' }
    ]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [nextTabId, setNextTabId] = useState(2);
    const [addressInput, setAddressInput] = useState('');
    const [historyMap, setHistoryMap] = useState({ 1: { stack: ['https://search.aure'], index: 0 } });

    const activeTab = tabs.find(t => t.id === activeTabId);

    React.useEffect(() => {
        if (activeTab) setAddressInput(activeTab.url);
    }, [activeTabId, activeTab?.url]);

    const isHome = React.useMemo(() => {
        if (!activeTab?.url) return false;
        const stripped = activeTab.url.replace(/^https?:\/\//, '');
        const domain = stripped.split('/')[0] || '';
        const path = stripped.substring(domain.length) || '/';
        return domain === 'search.aure' && !path.startsWith('/find');
    }, [activeTab?.url]);

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
        <GlassContainer className="flex h-full flex-col overflow-hidden select-none">
            <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onSwitch={setActiveTabId}
                onClose={closeTab}
                onNew={() => openTab('https://search.aure', 'New Tab')}
                onPointerDown={onTabBarPointerDown}
            />

            <AddressBar
                value={addressInput}
                onChange={setAddressInput}
                onSubmit={handleAddressSubmit}
                onBack={goBack}
                onForward={goForward}
                onRefresh={refresh}
                canBack={canBack}
                canForward={canForward}
            />

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

            <div className="flex-1 flex flex-col overflow-auto bg-white/60 text-slate-800">
                <ContentFrame url={activeTab?.url} openTab={openTab} navigateTab={navigateTab} />
            </div>
        </GlassContainer>
    );
}
