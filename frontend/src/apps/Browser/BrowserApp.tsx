import React, { useState, useEffect } from 'react';
import SearchHome from './SearchHome';
import { BROWSER_HOME, MAX_BROWSER_TABS, resolveBrowserInput } from './browserModel';
import { externalWebUrl, SERVICE_DIRECTORY } from './externalWeb';
import ExternalWebPage from './ExternalWebPage';
import ServiceDirectory from './ServiceDirectory';
import '../../styles/apps/versenet-browser.css';
import WebContentPage from './WebContentPage';
import UniversalSearch, { IndexedArchivePage } from './UniversalSearch';
import InteractiveSite from './InteractiveSite';
import { INTERACTIVE_SITES } from './interactiveSites';
import AssignmentBoard from '../AssignmentBoard';
import AureSuiteApp from './AureSuiteApp';
import {
    FaithMedPortal, DGAPortal, CyacademyPortal, OrynvellRecordsPortal,
    BankPortal, ShippingPortal, DarkWebOnionPortal,
    CivinetPortal, QuestNoticePortal, RoyalHistoryPortal
} from './Portals';
import { MaiSpacePortal } from './MaiSpacePortal';
import { useOSStore } from '../../store/useOSStore';
import {
    X, Plus, ChevronLeft, ChevronRight, RotateCw, Globe, Home, Star, History, Bookmark, Search, Grid2X2
} from 'lucide-react';

function ContentFrame({ url, openTab, navigateTab, openService }: any) {
    if (!url) return <SearchHome navigateTab={navigateTab} openTab={openTab} />;
    if (new URL(url).hostname === 'services.aure') return <ServiceDirectory navigateTab={openService}/>;
    if (externalWebUrl(url)) return <ExternalWebPage url={url}/>;
    
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';
    const site = INTERACTIVE_SITES.find(site => site.domain === domain);
    if (site) return <InteractiveSite site={site} path={path} navigateTab={navigateTab}/>;

    if (domain === 'versenet.aure' || domain === 'versenet' || domain === 'search.aure' || domain === '') {
        if (path === '/jobs' || path.startsWith('/jobs?')) return <AssignmentBoard />;
        if (path.startsWith('/find?')) {
            const query = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('q') ?? '';
            const view = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('view') || 'All';
            return <UniversalSearch query={query} view={view} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }
    if (domain === 'worknet.aure') return <AssignmentBoard />;
    if (domain === 'fieldnotes.aure') {
        if (path.startsWith('/archive/')) return <IndexedArchivePage id={path.split('?')[0].split('/')[2]} navigateTab={navigateTab}/>;
        return <WebContentPage url={url} navigateTab={navigateTab}/>;
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
            <Globe className="h-14 w-14 mb-3 text-[#39234f]" />
            <h2 className="text-base font-bold mb-1 text-slate-900">This address is not on Versenet</h2>
            <p className="text-xs text-slate-500 font-mono">{domain} has no published page in the current network. Try searching the site directory.</p>
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
    const state = useOSStore(s => s.browserState);
    const { tabs, activeTabId, historyMap, bookmarks, visits } = state;
    const openTab = useOSStore(s => s.openBrowserTab);
    const openService = useOSStore(s => s.setBrowserUrl);
    const workspaceRequest = useOSStore(s => s.workspaceRequests.browser);
    useEffect(() => {
        if (!workspaceRequest) return;
        if (workspaceRequest.section === 'services') openService(SERVICE_DIRECTORY);
        useOSStore.getState().consumeWorkspaceRequest('browser', workspaceRequest.revision);
    }, [workspaceRequest, openService]);
    const closeTab = useOSStore(s => s.closeBrowserTab);
    const activate = useOSStore(s => s.setActiveBrowserTab);
    const navigateTab = useOSStore(s => s.navigateBrowserTab);
    const goBack = useOSStore(s => s.goBrowserBack);
    const goForward = useOSStore(s => s.goBrowserForward);
    const toggleBookmark = useOSStore(s => s.toggleBrowserBookmark);
    const removeBookmark = useOSStore(s => s.removeBrowserBookmark);
    const clearHistory = useOSStore(s => s.clearBrowserHistory);
    const [addressInput, setAddressInput] = useState('');
    const [panel, setPanel] = useState<'history' | 'bookmarks' | null>(null);
    const [filter, setFilter] = useState('');
    const [reload, setReload] = useState(0);
    const pageRef = React.useRef<HTMLElement>(null);
    const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
    useEffect(() => { setAddressInput(activeTab.url); }, [activeTab.url, activeTab.id]);
    useEffect(() => { pageRef.current?.scrollTo(0, 0); }, [activeTab.url, activeTab.id, reload]);
    const history = historyMap[activeTabId];
    const saved = bookmarks.some(item => item.url === activeTab.url);
    const entries = (panel === 'history' ? visits : bookmarks).filter(item => `${item.title} ${item.url}`.toLowerCase().includes(filter.toLowerCase()));
    const togglePanel = (next: 'history' | 'bookmarks') => { setPanel(panel === next ? null : next); setFilter(''); };
    return <div className="versenet-browser">
        <div className="vn-tabs" role="tablist" aria-label="Browser tabs">
            {tabs.map(tab => <div className={`vn-tab ${tab.id === activeTabId ? 'is-active' : ''}`} key={tab.id}>
                <button role="tab" aria-selected={tab.id === activeTabId} aria-controls="vn-page" id={`vn-tab-${tab.id}`} onClick={() => activate(tab.id)} title={tab.url}><Globe size={13}/><span>{tab.title}</span></button>
                {tabs.length > 1 && <button className="vn-close" aria-label={`Close ${tab.title} tab`} onClick={() => closeTab(tab.id)}><X size={13}/></button>}
            </div>)}
            <button className="vn-icon" onClick={() => openTab(BROWSER_HOME)} disabled={tabs.length >= MAX_BROWSER_TABS} aria-label="New tab" title={`New tab (${tabs.length}/${MAX_BROWSER_TABS})`}><Plus size={16}/></button>
        </div>
        <div className="vn-toolbar">
            <button className="vn-icon" onClick={goBack} disabled={!history || history.index === 0} aria-label="Back"><ChevronLeft size={17}/></button>
            <button className="vn-icon" onClick={goForward} disabled={!history || history.index >= history.stack.length - 1} aria-label="Forward"><ChevronRight size={17}/></button>
            <button className="vn-icon" onClick={() => setReload(value => value + 1)} aria-label="Reload page"><RotateCw size={15}/></button>
            <button className="vn-icon vn-home" onClick={() => navigateTab(BROWSER_HOME)} aria-label="Home"><Home size={16}/></button>
            <form className="vn-address" onSubmit={event => { event.preventDefault(); if (addressInput.trim()) navigateTab(resolveBrowserInput(addressInput)); }}>
                <Globe size={14}/><input aria-label="Search VerseNet or enter a web address" value={addressInput} onChange={event => setAddressInput(event.target.value)} onFocus={event => event.target.select()} spellCheck={false}/>
                <button type="button" className={`vn-icon ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove current bookmark' : 'Bookmark this page'} aria-pressed={saved} onClick={toggleBookmark}><Star size={15} fill={saved ? 'currentColor' : 'none'}/></button>
                <button type="submit" className="vn-icon" aria-label="Go to address"><Search size={15}/></button>
            </form>
            <button className="vn-icon" aria-label="Service Directory" title="Service Directory" onClick={() => navigateTab(SERVICE_DIRECTORY)}><Grid2X2 size={16}/></button>
            <button className="vn-icon" aria-label="Bookmarks" aria-expanded={panel === 'bookmarks'} onClick={() => togglePanel('bookmarks')}><Bookmark size={16}/></button>
            <button className="vn-icon" aria-label="Browsing history" aria-expanded={panel === 'history'} onClick={() => togglePanel('history')}><History size={17}/></button>
        </div>
        <div className="vn-body">
            <main ref={pageRef} id="vn-page" role="tabpanel" aria-labelledby={`vn-tab-${activeTabId}`} className="vn-page">
                <ContentFrame key={`${activeTabId}:${activeTab.url}:${reload}`} url={activeTab.url} openTab={openTab} openService={openService} navigateTab={navigateTab}/>
            </main>
            {panel && <aside className="vn-library" aria-label={panel === 'history' ? 'Browsing history panel' : 'Bookmarks panel'}>
                <header><h2>{panel === 'history' ? 'History' : 'Bookmarks'}</h2><button className="vn-icon" aria-label="Close browser library" onClick={() => setPanel(null)}><X size={16}/></button></header>
                <p>{panel === 'history' ? 'Recently visited · saved on this device' : 'Your saved corners of the network'}</p>
                <input aria-label="Filter browser library" placeholder="Find a page…" value={filter} onChange={event => setFilter(event.target.value)}/>
                {panel === 'history' && visits.length > 0 && <button className="vn-text-button" onClick={clearHistory}>Clear browsing history</button>}
                <div className="vn-library-list">{entries.map(item => <div className="vn-library-item" key={item.url}>
                    <button onClick={() => navigateTab(item.url)}><strong>{item.title}</strong><small>{item.url.replace(/^https?:\/\//, '')}</small>{'visitedAt' in item && <time>{new Date(Number(item.visitedAt)).toLocaleDateString()}</time>}</button>
                    {panel === 'bookmarks' && <button className="vn-icon" aria-label={`Remove bookmark ${item.title}`} onClick={() => removeBookmark(item.url)}><X size={13}/></button>}
                </div>)}</div>
                {!entries.length && <p role="status">{filter ? 'No matching pages.' : panel === 'history' ? 'Your next visit will appear here.' : 'Use the star beside an address to save a page.'}</p>}
            </aside>}
        </div>
        <footer className="vn-status"><span>VERSENET</span><span>{externalWebUrl(activeTab.url) || activeTab.url.startsWith(SERVICE_DIRECTORY) ? 'External Internet gateway' : 'Fictional network'} · {tabs.length} / {MAX_BROWSER_TABS} tabs</span></footer>
    </div>;
}
