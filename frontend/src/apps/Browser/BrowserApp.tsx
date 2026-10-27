import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import SearchHome from './SearchHome';
import { NEWS_SITE } from './news/newsSite';
import { BROWSER_HOME, MAX_BROWSER_TABS, resolveBrowserInput, IN_GAME_PORTALS } from './browserModel';
import { externalWebUrl, SERVICE_DIRECTORY } from './externalWeb';
import ExternalWebPage from './ExternalWebPage';
import ServiceDirectory from './ServiceDirectory';
import '../../styles/apps/versenet-browser.css';
import WebContentPage from './WebContentPage';
import UniversalSearch, { IndexedArchivePage } from './UniversalSearch';
import InteractiveSite from './InteractiveSite';
import { INTERACTIVE_SITES } from './interactiveSites';
import BroadStreetPublicPage from '../investigation/BroadStreetPublicPage';
import AureSuiteApp from './AureSuiteApp';
import {
    FaithMedPortal, DGAPortal, CyacademyPortal, OrynvellRecordsPortal,
    BankPortal, ShippingPortal, DarkWebOnionPortal,
    CivinetPortal, QuestNoticePortal, RoyalHistoryPortal
} from './Portals';
import { MaiSpacePortal } from './MaiSpacePortal';
import { useOSStore } from '../../store/useOSStore';
import {
    X, Plus, ChevronLeft, ChevronRight, RotateCw, Globe, Home, Star, History, Bookmark, Search, Grid2X2,
    ShieldCheck, Lock, Sparkles, Terminal, Shield, ArrowUpRight, Briefcase, Folder
} from 'lucide-react';

const DispatchNewsSite = lazy(() => import('./news/DispatchNewsSite'));

export const QUICK_NAVIGATION_TARGETS = IN_GAME_PORTALS.map(p => ({
    domain: p.domain,
    url: p.url,
    title: p.name,
    category: p.category
}));

function WorkNetAppNotice({ navigateTab }: { navigateTab: (url: string) => void }) {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-[#FAFBFD] text-slate-800 p-8 text-center select-none font-sans">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold mb-4 shadow-xs">
                <Briefcase size={32} />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold mb-2 uppercase">
                Installed OS Desktop Application
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">WorkNet is an Installed Application</h2>
            <p className="text-xs text-slate-600 font-mono max-w-md leading-relaxed mb-6">
                WorkNet operates as its own dedicated desktop application in MiraverseOSx, not an in-browser web page. All civic jobs, federal assignments, and work orders are managed through the WorkNet application.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => useOSStore.getState().openAppWorkspace('jobs')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                    <span>Launch WorkNet Desktop App</span>
                    <ArrowUpRight size={14} />
                </button>
                <button
                    onClick={() => navigateTab(BROWSER_HOME)}
                    className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                    Return to Versenet Home
                </button>
            </div>
        </div>
    );
}

function ContentFrame({ url, openTab, navigateTab, openService }: any) {
    if (!url) return <SearchHome navigateTab={navigateTab} openTab={openTab} />;
    if (new URL(url).hostname === NEWS_SITE.domain) return <Suspense fallback={<p role="status">Connecting to the Dispatch…</p>}><DispatchNewsSite url={url} navigateTab={navigateTab}/></Suspense>;
    if (new URL(url).hostname === 'firstfederal.aure' && new URL(url).pathname === '/maintenance') return <BroadStreetPublicPage />;
    if (new URL(url).hostname === 'services.aure') return <ServiceDirectory navigateTab={openService}/>;
    if (externalWebUrl(url)) return <ExternalWebPage url={url}/>;
    
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';
    const site = INTERACTIVE_SITES.find(site => site.domain === domain);
    if (site) return <InteractiveSite site={site} path={path} navigateTab={navigateTab}/>;

    // WorkNet is an installed application, NOT a web page
    if (domain === 'worknet.aure' || (domain === 'versenet.aure' && (path === '/jobs' || path.startsWith('/jobs?')))) {
        return <WorkNetAppNotice navigateTab={navigateTab} />;
    }

    if (domain === 'versenet.aure' || domain === 'versenet' || domain === 'search.aure' || domain === '') {
        if (path.startsWith('/find?')) {
            const query = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('q') ?? '';
            const view = new URLSearchParams(path.slice(path.indexOf('?') + 1)).get('view') || 'All';
            return <UniversalSearch query={query} view={view} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }

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
                onClick={() => navigateTab(BROWSER_HOME)}
                className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
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
    
    const closeTab = useOSStore(s => s.closeBrowserTab);
    const activate = useOSStore(s => s.setActiveBrowserTab);
    const navigateTab = useOSStore(s => s.navigateBrowserTab);
    const goBack = useOSStore(s => s.goBrowserBack);
    const goForward = useOSStore(s => s.goBrowserForward);
    const toggleBookmark = useOSStore(s => s.toggleBrowserBookmark);
    const removeBookmark = useOSStore(s => s.removeBrowserBookmark);
    const clearHistory = useOSStore(s => s.clearBrowserHistory);

    // Only explicit workspace requests change the current page. Consuming a
    // request must not erase an inter-app destination or the restored session.
    useEffect(() => {
        if (!workspaceRequest) return;
        if (workspaceRequest.section === 'home') {
            navigateTab(BROWSER_HOME, 'Versenet');
            useOSStore.getState().consumeWorkspaceRequest('browser', workspaceRequest.revision);
        } else if (workspaceRequest.section === 'services') {
            openService(SERVICE_DIRECTORY);
            useOSStore.getState().consumeWorkspaceRequest('browser', workspaceRequest.revision);
        } else if (/^https?:\/\//i.test(workspaceRequest.section)) {
            openService(workspaceRequest.section);
            useOSStore.getState().consumeWorkspaceRequest('browser', workspaceRequest.revision);
        }
    }, [workspaceRequest, openService, navigateTab]);

    const [addressInput, setAddressInput] = useState('');
    const [panel, setPanel] = useState<'history' | 'bookmarks' | null>(null);
    const [filter, setFilter] = useState('');
    const [reload, setReload] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const addressContainerRef = useRef<HTMLDivElement>(null);

    const pageRef = React.useRef<HTMLElement>(null);
    const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

    useEffect(() => { 
        setAddressInput(activeTab.url); 
    }, [activeTab.url, activeTab.id]);

    useEffect(() => { 
        pageRef.current?.scrollTo(0, 0); 
    }, [activeTab.url, activeTab.id, reload]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const history = historyMap[activeTabId];
    const saved = bookmarks.some(item => item.url === activeTab.url);
    const entries = (panel === 'history' ? visits : bookmarks).filter(item => `${item.title} ${item.url}`.toLowerCase().includes(filter.toLowerCase()));
    const togglePanel = (next: 'history' | 'bookmarks') => { setPanel(panel === next ? null : next); setFilter(''); };

    // Autocomplete filter
    const filteredSuggestions = QUICK_NAVIGATION_TARGETS.filter(target => {
        const query = addressInput.trim().toLowerCase().replace(/^https?:\/\//, '');
        return target.domain.includes(query) || target.title.toLowerCase().includes(query);
    });

    // Determine security badge for current URL
    const currentUrl = activeTab.url || '';
    const isAureSuite = currentUrl.includes('auresuite.aure');
    const isOnion = currentUrl.includes('.onion') || currentUrl.includes('vectornet.aure');
    const isVerifiedCivic = currentUrl.includes('.gov') || currentUrl.includes('bank.aure') || currentUrl.includes('faithmed.aure') || currentUrl.includes('cyacademy.edu');

    return (
        <div className="versenet-browser">
            <div className="vn-tabs" role="tablist" aria-label="Browser tabs">
                {tabs.map(tab => (
                    <div className={`vn-tab ${tab.id === activeTabId ? 'is-active' : ''}`} key={tab.id}>
                        <button role="tab" aria-selected={tab.id === activeTabId} aria-controls="vn-page" id={`vn-tab-${tab.id}`} onClick={() => activate(tab.id)} title={tab.url}>
                            <Globe size={13}/>
                            <span>{tab.title}</span>
                        </button>
                        {tabs.length > 1 && (
                            <button className="vn-close" aria-label={`Close ${tab.title} tab`} onClick={() => closeTab(tab.id)}>
                                <X size={13}/>
                            </button>
                        )}
                    </div>
                ))}
                <button className="vn-icon" onClick={() => openTab(BROWSER_HOME)} disabled={tabs.length >= MAX_BROWSER_TABS} aria-label="New tab" title={`New tab (${tabs.length}/${MAX_BROWSER_TABS})`}>
                    <Plus size={16}/>
                </button>
            </div>

            <div className="vn-toolbar">
                <button className="vn-icon" onClick={goBack} disabled={!history || history.index === 0} aria-label="Back">
                    <ChevronLeft size={17}/>
                </button>
                <button className="vn-icon" onClick={goForward} disabled={!history || history.index >= history.stack.length - 1} aria-label="Forward">
                    <ChevronRight size={17}/>
                </button>
                <button className="vn-icon" onClick={() => setReload(value => value + 1)} aria-label="Reload page">
                    <RotateCw size={15}/>
                </button>
                <button className="vn-icon vn-home" onClick={() => navigateTab(BROWSER_HOME)} aria-label="Home">
                    <Home size={16}/>
                </button>

                {/* Enhanced Omnibox with Security Badge & Autocomplete Dropdown */}
                <div ref={addressContainerRef} className="relative flex-1 flex">
                    <form 
                        className="vn-address w-full relative" 
                        onSubmit={event => { 
                            event.preventDefault(); 
                            setShowSuggestions(false);
                            if (addressInput.trim()) navigateTab(resolveBrowserInput(addressInput)); 
                        }}
                    >
                        {/* Dynamic Security Badge */}
                        <div className="flex items-center pl-1 shrink-0" title={isOnion ? 'Encrypted Onion Network' : isAureSuite ? 'AureSuite Cloud Productivity' : isVerifiedCivic ? 'Aureline Verified Civic Domain' : 'Versenet Network'}>
                            {isOnion ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                    <Terminal size={11} /> ONION
                                </span>
                            ) : isAureSuite ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    <Sparkles size={11} /> SUITE
                                </span>
                            ) : isVerifiedCivic ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    <ShieldCheck size={11} /> SECURE
                                </span>
                            ) : (
                                <Globe size={14} className="text-slate-500" />
                            )}
                        </div>

                        <input 
                            aria-label="Search VerseNet or enter a web address" 
                            value={addressInput} 
                            onChange={event => {
                                setAddressInput(event.target.value);
                                setShowSuggestions(true);
                            }} 
                            onFocus={event => {
                                event.target.select();
                                setShowSuggestions(true);
                            }} 
                            spellCheck={false}
                        />

                        <button type="button" className={`vn-icon ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove current bookmark' : 'Bookmark this page'} aria-pressed={saved} onClick={toggleBookmark}>
                            <Star size={15} fill={saved ? 'currentColor' : 'none'}/>
                        </button>
                        <button type="submit" className="vn-icon" aria-label="Go to address">
                            <Search size={15}/>
                        </button>
                    </form>

                    {/* Instant Omnibox Autocomplete Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-100 overflow-hidden font-sans">
                            <div className="p-2 bg-slate-50 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                                <span>Versenet Domain Suggestions</span>
                                <span>{filteredSuggestions.length} Results</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredSuggestions.map(target => (
                                    <button
                                        key={target.url}
                                        type="button"
                                        onClick={() => {
                                            navigateTab(target.url);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer text-xs"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                                <span>{target.title}</span>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                                                    {target.category}
                                                </span>
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-500 truncate">{target.url}</div>
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-400 ml-2 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button className="vn-icon" aria-label="Service Directory" title="Service Directory" onClick={() => navigateTab(SERVICE_DIRECTORY)}>
                    <Grid2X2 size={16}/>
                </button>
                <button className="vn-icon" aria-label="Bookmarks" aria-expanded={panel === 'bookmarks'} onClick={() => togglePanel('bookmarks')}>
                    <Bookmark size={16}/>
                </button>
                <button className="vn-icon" aria-label="Browsing history" aria-expanded={panel === 'history'} onClick={() => togglePanel('history')}>
                    <History size={17}/>
                </button>
            </div>

            <div className="vn-body">
                <main ref={pageRef} id="vn-page" role="tabpanel" aria-labelledby={`vn-tab-${activeTabId}`} className="vn-page">
                    <ContentFrame key={`${activeTabId}:${activeTab.url}:${reload}`} url={activeTab.url} openTab={openTab} openService={openService} navigateTab={navigateTab}/>
                </main>
                {panel && (
                    <aside className="vn-library" aria-label={panel === 'history' ? 'Browsing history panel' : 'Bookmarks panel'}>
                        <header>
                            <h2>{panel === 'history' ? 'History' : 'Bookmarks'}</h2>
                            <button className="vn-icon" aria-label="Close browser library" onClick={() => setPanel(null)}>
                                <X size={16}/>
                            </button>
                        </header>
                        <p>{panel === 'history' ? 'Recently visited · saved on this device' : 'Your saved corners of the network'}</p>
                        
                        {/* In-Game Portals folder inside bookmarks library */}
                        {panel === 'bookmarks' && (
                            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl mb-3">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950 mb-2">
                                    <Folder size={14} className="text-purple-700" />
                                    <span>VerseNet Directory</span>
                                </div>
                                <div className="space-y-1">
                                    {IN_GAME_PORTALS.map(portal => (
                                        <button
                                            key={portal.id}
                                            onClick={() => navigateTab(portal.url)}
                                            className="w-full text-left px-2 py-1 rounded hover:bg-purple-100/70 transition flex items-center justify-between text-[11px]"
                                        >
                                            <span className="font-semibold text-slate-800 truncate">{portal.name}</span>
                                            <span className="text-[9px] font-mono text-purple-700">{portal.domain}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input aria-label="Filter browser library" placeholder="Find a page…" value={filter} onChange={event => setFilter(event.target.value)}/>
                        {panel === 'history' && visits.length > 0 && (
                            <button className="vn-text-button" onClick={clearHistory}>Clear browsing history</button>
                        )}
                        <div className="vn-library-list">
                            {entries.map(item => (
                                <div className="vn-library-item" key={item.url}>
                                    <button onClick={() => navigateTab(item.url)}>
                                        <strong>{item.title}</strong>
                                        <small>{item.url.replace(/^https?:\/\//, '')}</small>
                                        {'visitedAt' in item && <time>{new Date(Number(item.visitedAt)).toLocaleDateString()}</time>}
                                    </button>
                                    {panel === 'bookmarks' && (
                                        <button className="vn-icon" aria-label={`Remove bookmark ${item.title}`} onClick={() => removeBookmark(item.url)}>
                                            <X size={13}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!entries.length && (
                            <p role="status">{filter ? 'No matching pages.' : panel === 'history' ? 'Your next visit will appear here.' : 'Use the star beside an address to save a page.'}</p>
                        )}
                    </aside>
                )}
            </div>
            <footer className="vn-status">
                <span>VERSENET</span>
                <span>{externalWebUrl(activeTab.url) || activeTab.url.startsWith(SERVICE_DIRECTORY) ? 'External Internet gateway' : 'VerseNet network'} · {tabs.length} / {MAX_BROWSER_TABS} tabs</span>
            </footer>
        </div>
    );
}
