import React, { useState } from 'react';
import GlassContainer from '../components/GlassContainer';
import TabBar from './browser/TabBar';
import AddressBar from './browser/AddressBar';
import ContentFrame from './browser/ContentFrame';

export default function BrowserApp() {
  const [tabs, setTabs] = useState([
    { id: 1, url: 'https://search.aure', title: 'New Tab' }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);
  const [addressInput, setAddressInput] = useState('');

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Sync address input when active tab changes
  React.useEffect(() => {
    if (activeTab) {
      setAddressInput(activeTab.url);
    }
  }, [activeTabId, activeTab?.url]);

  const openTab = (url, title) => {
    const existing = tabs.find(t => t.url === url);
    if (existing) { setActiveTabId(existing.id); return; }
    if (tabs.length >= 6) return;
    const newTab = { id: nextTabId, url, title };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(prev => prev + 1);
  };

  const closeTab = (id) => {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    if (id === activeTabId) {
      setActiveTabId(newTabs[Math.min(idx, newTabs.length - 1)].id);
    }
    setTabs(newTabs);
  };

  const navigateTab = (url, title = 'Browsing') => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: formattedUrl, title } : t));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (addressInput.trim()) {
      navigateTab(addressInput.trim());
    }
  };
  const renderContent = () => (
    <ContentFrame url={activeTab?.url} openTab={openTab} navigateTab={navigateTab} />
  );

  return (
    <GlassContainer className="flex h-full w-full flex-col overflow-hidden select-none">
      {/* DARK CHROME: Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitch={setActiveTabId}
        onClose={closeTab}
        onNew={() => openTab('https://search.aure', 'New Tab')}
      />

      {/* DARK CHROME: Address Bar */}
      <AddressBar
        value={addressInput}
        onChange={setAddressInput}
        onSubmit={handleAddressSubmit}
      />

      {/* LIGHT CONTENT AREA */}
      <div className="flex-1 overflow-auto bg-white text-slate-800">
        {renderContent()}
      </div>
    </GlassContainer>
  );
}
// Legacy inline portal and search components were extracted to files under ./browser.
<main className="flex-1 p-8 max-w-5xl mx-auto w-full">
  {activeTab === 'overview' && (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
        <h2 className="text-3xl font-light text-emerald-900 mb-4">Pioneering Aura Health in Aureline.</h2>
        <p className="text-emerald-700 text-lg leading-relaxed max-w-3xl">
          Faith Medical Group is the premier healthcare provider dedicated to treating Aether-burns, Veilwilt, and other elemental exposure conditions. Our state-of-the-art facilities blend traditional medical science with advanced bio-etheric resonance therapies.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { title: 'Emergency Trauma', desc: '24/7 care for acute elemental surges and combat-related injuries.' },
          { title: 'Aura Rehabilitation', desc: 'Long-term care for Veilwilt and chronic magic strain.' },
          { title: 'Cybernetics Clinic', desc: 'Integration and maintenance of neural links and prosthetics.' }
        ].map((s, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
            <Activity size={24} className="text-emerald-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
            <p className="text-slate-600 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )}

  {activeTab === 'providers' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Specialists</h2>
      <div className="grid grid-cols-2 gap-6">
        {NPCS.filter(n => n.faction === 'Faith Medical').map((npc, i) => (
          <div key={i} className="flex border border-slate-200 rounded-xl p-4 items-center">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4 shrink-0">
              <User size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{npc.name}</h3>
              <p className="text-emerald-700 text-sm mb-1">{npc.role}</p>
              <p className="text-slate-500 text-xs">{npc.region}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {activeTab === 'services' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Treatments</h2>
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-xl p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Complete Intake Scan & Detox</h3>
            <p className="text-slate-600 text-sm max-w-xl mt-1">Full diagnosis of etheric imbalances, removal of acute magical conditions (Veilwilt, Sunspire Fever), and minor aura healing.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleIntakeScan}>Initiate Scan</Button>
        </div>
        <div className="border border-slate-200 rounded-xl p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Routine Checkup</h3>
            <p className="text-slate-600 text-sm max-w-xl mt-1">Standard medical evaluation.</p>
          </div>
          <Button variant="outline" onClick={() => { setScheduled(true); alert("Appointment scheduled."); }}>
            {scheduled ? 'Scheduled' : 'Book Appointment'}
          </Button>
        </div>
      </div>
    </div>
  )}

  {activeTab === 'portal' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto mt-12">
      {!loggedIn ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Portal</h2>
          <p className="text-slate-500 text-sm mb-6">Log in with your secure Miraverse ID to access your medical records.</p>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setLoggedIn(true)}>Authenticate via Neural Link</Button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
            <h2 className="text-xl font-bold text-emerald-900">Patient Dashboard</h2>
            <Button variant="ghost" size="sm" onClick={() => setLoggedIn(false)} className="text-emerald-700 hover:bg-emerald-100">Log Out</Button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Patient Name</span>
              <div className="text-lg font-medium text-slate-800">{player.name || 'Anonymous User'}</div>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Aura Health Status</span>
              <div className="flex items-center mt-1">
                <div className="w-full bg-slate-200 rounded-full h-2.5 mr-3">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${player.auraHealth}%` }}></div>
                </div>
                <span className="text-sm font-medium text-emerald-800">{player.auraHealth}%</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Active Conditions</span>
              {player.conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {player.conditions.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium">{c}</span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600 text-sm mt-1 flex items-center"><CheckCircle2 size={16} className="text-emerald-500 mr-1" /> Clean bill of health</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</main>
    </div >
  );
}

function CycademyPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-full bg-white flex flex-col">
      <header className="bg-indigo-900 text-white p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building size={32} className="text-indigo-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cycademy of Sciences</h1>
            <p className="text-indigo-200 text-sm">Veritas et Aether</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-indigo-950/50 rounded-lg p-1">
          {['overview', 'programs', 'faculty', 'portal'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-indigo-800'}`}
            >
              {tab === 'portal' ? 'Student Portal' : tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 text-center">
              <Sparkles size={48} className="text-indigo-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-indigo-900 mb-4">Pushing the Boundaries of Known Aether</h2>
              <p className="text-indigo-700 text-lg max-w-3xl mx-auto">
                For over a century, the Cycademy has been the beacon of intellectual pursuit in Aureline, blending traditional academia with rigorous study of elemental manipulation and Aethercore dynamics.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="animate-in fade-in grid grid-cols-2 gap-6">
            {[
              { title: 'Aetheric Engineering', desc: 'Design and maintain the city\'s core infrastructure.' },
              { title: 'Theoretical Spellcraft', desc: 'Advanced study of spell matrices and Veil physics.' },
              { title: 'Historical Archives', desc: 'Preservation of pre-Collapse knowledge.' },
              { title: 'Bio-Etherics', desc: 'Intersection of biology and magical resonance.' }
            ].map((p, i) => (
              <div key={i} className="border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                <BookOpen size={24} className="text-indigo-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">{p.title}</h3>
                <p className="text-slate-600 mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Distinguished Faculty</h2>
            <div className="grid grid-cols-2 gap-6">
              {NPCS.filter(n => n.faction.includes('Faculty') || n.faction.includes('Admin') || n.faction.includes('Cycademy')).map((npc, i) => (
                <div key={i} className="flex border border-slate-200 rounded-xl p-4 items-center">
                  <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{npc.name}</h3>
                    <p className="text-indigo-700 text-sm">{npc.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portal' && (
          <div className="animate-in fade-in max-w-md mx-auto mt-12">
            {!loggedIn ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                <LogIn size={48} className="text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Student / Faculty Portal</h2>
                <p className="text-slate-500 text-sm mb-6">Enter your Cycademy credentials.</p>
                <div className="space-y-4">
                  <Input placeholder="Student/Faculty ID" />
                  <Input type="password" placeholder="Passcode" />
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setLoggedIn(true)}>Log In</Button>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-600">Your account lacks the necessary clearance to view current term schedules. Please contact administration.</p>
                <Button variant="outline" className="mt-6" onClick={() => setLoggedIn(false)}>Sign Out</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DGAPortal({ navigateTab }) {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="min-h-full bg-white flex flex-col">
      <header className="bg-slate-900 text-white p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield size={32} className="text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Digital Governance Agency</h1>
            <p className="text-blue-200 text-sm">Order. Security. Progress.</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {['overview', 'advisories', 'services'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-slate-100 rounded-2xl p-8 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Maintaining the Balance</h2>
              <p className="text-slate-700">The DGA is responsible for overseeing cyber-infrastructure, public safety, and aetheric regulation across Aureline. By decree of the High Council, all citizens must comply with DGA mandates.</p>
            </div>
          </div>
        )}
        {activeTab === 'advisories' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Public Advisories</h2>
            {[
              { id: 'ADV-892', type: 'Security', text: 'Increased PRISM Cult activity detected in the Lower Wards. Avoid unmarked mesh nodes.', date: 'Today' },
              { id: 'ADV-891', type: 'Maintenance', text: 'Aethercore pressure venting scheduled for sector 4. Minor tremors expected.', date: 'Yesterday' }
            ].map(a => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-4 flex">
                <AlertTriangle size={24} className={`mr-4 ${a.type === 'Security' ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <h3 className="font-bold text-slate-800">{a.id} - {a.type}</h3>
                  <p className="text-slate-600 text-sm">{a.text}</p>
                  <p className="text-slate-400 text-xs mt-2">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'services' && (
          <div className="text-center p-12 border border-slate-200 rounded-xl bg-slate-50">
            <Shield size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Citizen Portal Redirect</h3>
            <p className="text-slate-600 mb-6">For civic records, tax filings, and archival access, please use the Central Library portal.</p>
            <Button onClick={() => navigateTab('https://library.aure')}>Go to Library Portal</Button>
          </div>
        )}
      </main>
    </div>
  );
}

function LibraryPortal() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-full bg-[#fdfbf7] flex flex-col">
      <header className="bg-amber-900 text-[#fdfbf7] p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen size={32} className="text-amber-400" />
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">Central Library & Archives</h1>
            <p className="text-amber-200/80 text-sm font-serif italic">Preserving the past. Informing the future.</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-amber-950/50 rounded-lg p-1">
          {['catalog', 'manuscripts', 'vault'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-[#fdfbf7] text-amber-900 shadow-sm' : 'text-amber-100 hover:bg-amber-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {activeTab === 'catalog' && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-950 mb-6 border-b border-amber-200 pb-2">Public Catalog</h2>
            <div className="space-y-6">
              {SAMPLE_ARCHIVES.map(arc => (
                <div key={arc.id} className="bg-white p-6 border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-amber-900 font-serif">{arc.title}</h3>
                    <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded">{arc.id}</span>
                  </div>
                  <p className="text-sm text-amber-900/60 font-mono mb-4">{arc.address}</p>
                  <p className="text-slate-700 leading-relaxed">"{arc.excerpt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'manuscripts' && (
          <div className="text-center p-12">
            <FileText size={48} className="text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-amber-900 mb-2">Digital Manuscripts Offline</h3>
            <p className="text-amber-800/70">The high-resolution manuscript viewer is currently undergoing maintenance. Please visit the physical archives in the Upper Ward for viewings.</p>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="max-w-xl mx-auto mt-8">
            {!loggedIn ? (
              <div className="bg-white border border-amber-200 rounded-xl p-8 shadow-sm text-center">
                <Key size={48} className="text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-amber-950 mb-2">Restricted Vault Access</h2>
                <p className="text-amber-800/70 text-sm mb-6">Level 4 DGA or Archival clearance required.</p>
                <div className="space-y-4">
                  <Input type="password" placeholder="Access Code" className="border-amber-200 focus:ring-amber-500" />
                  <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white" onClick={() => setLoggedIn(true)}>Authenticate</Button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-900 text-amber-50 rounded-xl p-8 font-mono border border-amber-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Shield size={120} /></div>
                <h2 className="text-xl font-bold text-amber-400 mb-4 border-b border-amber-800 pb-2 flex items-center">
                  <Unlock size={20} className="mr-2" /> DECRYPTED: LIGHTBORN LINEAGE
                </h2>
                <div className="space-y-4 text-sm z-10 relative">
                  <p>SUBJECT: Hereditary Veil Sensitivity</p>
                  <p className="text-amber-200/60">CLASSIFICATION: TOP SECRET // OMEGA</p>
                  <div className="bg-black/50 p-4 rounded border border-amber-900/50">
                    <p>Analysis confirms that individuals displaying spontaneous Aetheric generation without cybernetic augmentation are direct descendants of the original Pre-Collapse architects.</p>
                    <br />
                    <p>Recommendation: Continued monitoring by DGA operatives. Do not alert Cycademy faculty.</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-8 border-amber-700 text-amber-400 hover:bg-amber-900/50" onClick={() => setLoggedIn(false)}>Purge Cache & Exit</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Small helper icon since we didn't import Unlock
const Unlock = (props) => <Key {...props} />;


function VectorNetPortal() {
  const [activeTab, setActiveTab] = useState('forums');

  return (
    <div className="min-h-full bg-[#0a0f14] text-cyan-500 font-mono flex flex-col selection:bg-cyan-900 selection:text-cyan-100">
      <header className="border-b border-cyan-900/50 p-4 flex items-center justify-between bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Radio className="text-cyan-400 animate-pulse" size={24} />
          <h1 className="text-xl font-bold tracking-widest text-cyan-400 glow-text">v e c t o r / / n e t</h1>
        </div>
        <div className="flex space-x-4 text-xs">
          {['forums', 'leaks', 'exploits', 'mesh'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`uppercase tracking-wider hover:text-cyan-300 transition-colors ${activeTab === tab ? 'text-cyan-300 border-b border-cyan-400 pb-1' : 'text-cyan-700'}`}
            >
              [{tab}]
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {activeTab === 'forums' && (
          <div className="space-y-4">
            <div className="border border-cyan-900/30 bg-black/20 p-4 rounded">
              <div className="flex justify-between text-xs text-cyan-700 mb-2 border-b border-cyan-900/30 pb-2">
                <span>THREAD</span>
                <span>AUTHOR / REPLIES</span>
              </div>
              {[
                { title: 'Bypassing DGA Sector 4 Checkpoints', author: 'null_pointer', replies: 142 },
                { title: 'Anyone seen the new FaithMed cybernetics?', author: 'chrome_doc', replies: 89 },
                { title: 'WARNING: PRISM signatures in the lower mesh', author: 'ghost_in_the_wire', replies: 304 },
                { title: 'Selling slightly used Aethercore batteries (no questions asked)', author: 'scrap_king', replies: 12 }
              ].map((t, i) => (
                <div key={i} className="flex justify-between items-center py-3 hover:bg-cyan-900/10 cursor-pointer">
                  <div className="font-bold text-cyan-300 hover:underline">{t.title}</div>
                  <div className="text-xs text-cyan-600 text-right">
                    <div>@{t.author}</div>
                    <div>{t.replies} msgs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaks' && (
          <div className="space-y-6">
            <div className="bg-red-900/10 border border-red-900/30 p-6 rounded">
              <h3 className="text-red-500 font-bold mb-4 flex items-center"><AlertTriangle size={16} className="mr-2" /> PRISM INTELLIGENCE DOSSIER</h3>
              <div className="text-sm text-cyan-600/80 space-y-2">
                <p>FILE: <span className="text-cyan-400">#88-A-CULT</span></p>
                <p>Intercepted comms indicate PRISM is planning a coordinated strike on the <span className="bg-cyan-900/50 text-cyan-100 px-1">REDACTED</span> facility in the Upper Wards.</p>
                <p>Objective appears to be the acquisition of <span className="bg-cyan-900/50 text-cyan-100 px-1">REDACTED</span> for ritualistic Aether consumption.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exploits' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Zero-Day: Cycademy Login Bypass', status: 'PATCHED', risk: 'HIGH' },
              { name: 'FaithMed Database Dumper v2.1', status: 'ACTIVE', risk: 'CRITICAL' },
              { name: 'DGA Drone Spoofing Script', status: 'ACTIVE', risk: 'MEDIUM' }
            ].map((e, i) => (
              <div key={i} className="border border-cyan-900/40 p-4 rounded bg-black/30">
                <div className="text-cyan-300 font-bold mb-2">{e.name}</div>
                <div className="flex space-x-4 text-xs">
                  <span className={`px-2 py-1 rounded ${e.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>{e.status}</span>
                  <span className="px-2 py-1 bg-cyan-900/20 text-cyan-600 border border-cyan-900/30 rounded">RISK: {e.risk}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mesh' && (
          <div className="border border-cyan-900/50 rounded h-[400px] flex flex-col bg-black/40">
            <div className="p-2 border-b border-cyan-900/50 text-xs text-cyan-600 text-center">ENCRYPTED P2P CONNECTION ESTABLISHED</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-sm"><span className="text-cyan-600">@sysadmin:</span> Anyone online? The network is lagging bad today.</div>
              <div className="text-sm"><span className="text-green-500">@runner_99:</span> Yeah, DGA is running sweeps in sector 7. Routing everything through the old factory proxies.</div>
              <div className="text-sm"><span className="text-cyan-600">@sysadmin:</span> Copy that. Stay frosty.</div>
            </div>
            <div className="p-2 border-t border-cyan-900/50 flex">
              <span className="text-cyan-600 mr-2">{'>'}</span>
              <input type="text" className="bg-transparent flex-1 outline-none text-cyan-300" placeholder="Type message..." disabled />
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .glow-text { text-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
      `}} />
    </div>
  );
}


function AurelineDailyPortal() {
  const [activeTab, setActiveTab] = useState('headlines');

  return (
    <div className="min-h-full bg-[#fcf9f2] text-slate-900 font-serif flex flex-col">
      <header className="border-b-4 border-slate-900 p-6 text-center relative bg-white">
        <div className="absolute left-6 top-6 text-xs text-slate-500 font-sans tracking-widest uppercase">
          Vol. CXIV — No. 42
        </div>
        <div className="absolute right-6 top-6 text-xs text-slate-500 font-sans tracking-widest uppercase">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <h1 className="text-6xl font-bold tracking-tighter mt-4 mb-2">AURELINE DAILY</h1>
        <p className="text-sm italic text-slate-600 border-t border-slate-300 pt-2 w-1/3 mx-auto">"The Truth, Unveiled from the Aether"</p>

        <nav className="flex justify-center space-x-8 mt-8 text-sm font-bold uppercase tracking-widest font-sans border-t border-b border-slate-200 py-3">
          {['headlines', 'politics', 'science', 'crime', 'opinion'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`hover:text-red-700 transition-colors ${activeTab === tab ? 'text-red-700' : 'text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {activeTab === 'headlines' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              <div className="bg-red-700 text-white text-xs font-bold font-sans uppercase tracking-widest px-3 py-1 inline-block mb-3">Breaking News</div>
              <h2 className="text-5xl font-bold leading-tight mb-4 hover:text-red-800 cursor-pointer transition-colors">PRISM Cult Claims Responsibility for Sector 4 Power Surge</h2>
              <p className="text-xl text-slate-700 leading-relaxed mb-4">
                In a brazen broadcast intercepted by DGA monitors early this morning, leadership elements of the notorious PRISM cult have stated they intentionally caused the massive Aethercore feedback loop that left three wards in darkness.
              </p>
              <div className="flex items-center text-sm font-sans text-slate-500 border-b border-slate-200 pb-6 mb-6">
                <span className="font-bold text-slate-800 mr-2">By Elias Thorne</span> | 2 hours ago
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" alt="Cycademy" className="w-full h-48 object-cover mb-3 sepia-[.3]" />
                  <h3 className="text-2xl font-bold mb-2 leading-tight">Cycademy Unveils New Resonance Damper</h3>
                  <p className="text-sm text-slate-600">Faculty members demonstrate prototype device promising to reduce Veilwilt symptoms in high-magic areas.</p>
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=600&q=80" alt="FaithMed" className="w-full h-48 object-cover mb-3 sepia-[.3]" />
                  <h3 className="text-2xl font-bold mb-2 leading-tight">FaithMed Reports Record Number of Aura Scans</h3>
                  <p className="text-sm text-slate-600">Following the power surge, clinics across the city see influx of citizens seeking bio-etheric stabilization.</p>
                </div>
              </div>
            </div>

            <div className="col-span-4 border-l border-slate-300 pl-8">
              <h3 className="text-lg font-black font-sans uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-6">Latest Briefs</h3>
              <div className="space-y-6">
                {[
                  { title: "DGA Increases Patrols in Old Factory Ward", time: "1 hr ago" },
                  { title: "Library Archives Temporarily Offline for Scheduled Purge", time: "3 hrs ago" },
                  { title: "Market Watch: Aether Battery Prices Surge 15%", time: "5 hrs ago" },
                  { title: "Opinion: Are We Relying Too Heavily on Pre-Collapse Tech?", time: "6 hrs ago" },
                ].map((news, i) => (
                  <div key={i} className="group cursor-pointer">
                    <h4 className="text-lg font-bold leading-tight group-hover:text-red-700 transition-colors">{news.title}</h4>
                    <p className="text-xs font-sans text-slate-500 mt-1">{news.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'headlines' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 capitalize border-b-2 border-slate-900 pb-4">{activeTab}</h2>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex border-b border-slate-200 pb-8 last:border-0 cursor-pointer group">
                  <div className="flex-1 pr-8">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-red-700 transition-colors">Sample {activeTab} Article {i}: Lorem Ipsum Dolor Sit Amet</h3>
                    <p className="text-slate-600 leading-relaxed mb-3">Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <div className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">Staff Writer • {i * 2} hours ago</div>
                  </div>
                  <div className="w-48 h-32 bg-slate-200 shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
