import React, { useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import {
  Globe, User, Heart, MessageSquare, Shield, Sparkles, Radio,
  Send, Users, Award, Bell, Flame, Activity, Lock, ArrowRight, CheckCircle2, UserCheck
} from 'lucide-react';
import Button from '../../components/ui/button';

export function MaiSpacePortal() {
  const player = useOSStore((s) => s.gameplay.player);
  const identity = useOSStore((s) => s.gameplay.identity);
  const timeCycleCount = useOSStore((s) => s.gameplay.timeCycleCount ?? 0);
  const worldEventLog = useOSStore((s) => s.gameplay.worldEventLog || []);
  const acceptMaiSpaceFriend = useOSStore((s) => s.acceptMaiSpaceFriend);
  const updateMaiSpaceProfile = useOSStore((s) => s.updateMaiSpaceProfile);
  const postMaiSpaceBulletin = useOSStore((s) => s.postMaiSpaceBulletin);
  const pingMaiSpaceFriend = useOSStore((s) => s.pingMaiSpaceFriend);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bulletin' | 'network' | 'reputation'
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [newPostText, setNewPostText] = useState('');

  const profile = player?.maiSpaceProfile || {
    handle: player?.name || 'Aureline_Netrunner',
    headerFont: 'Cookie',
    statusThought: 'Exploring the digital conduits of Aureline Central ✨',
    acceptedFriends: [],
    pingedFriendsCycle: {},
    bulletinPosts: []
  };

  const handle = profile.handle;
  const headerFont = profile.headerFont;
  const statusThought = profile.statusThought;
  const hasAcceptedJeremie = (profile.acceptedFriends || []).includes('jeremie');
  const bulletinPosts = profile.bulletinPosts || [];

  // Top 8 Friends
  const top8Friends = [
    { id: 'jeremie', name: 'Jeremie Belpois', role: 'Cyber-Architect', affinity: player?.npcVectors?.jeremie?.trust || 50, avatar: '💻' },
    { id: 'aelita', name: 'Aelita Schaeffer', role: 'Veil Resonator', affinity: player?.npcVectors?.aelita?.sync || 50, avatar: '🌸' },
    { id: 'odd', name: 'Odd Della Robbia', role: 'Netrunner Infiltrator', affinity: player?.npcVectors?.odd?.friendship || 50, avatar: '⚡' },
    { id: 'sissi', name: 'Elisabeth Delmas', role: 'Campus Influencer', affinity: player?.npcVectors?.sissi?.rivalry || 20, avatar: '👑' },
    { id: 'voss', name: 'Dr. Sharon Voss', role: 'Faith Medical Lead', affinity: player?.npcVectors?.voss?.trust || 45, avatar: '🩺' },
    { id: 'riven', name: 'Riven Asterwind', role: 'Aureline Enforcer', affinity: player?.npcVectors?.riven?.rivalry || 15, avatar: '⚔️' },
    { id: 'mara', name: 'Mara Thorne', role: 'DGA Bureau Analyst', affinity: player?.npcVectors?.mara?.trust || 40, avatar: '📂' },
    { id: 'rowan', name: 'Archivist Rowan', role: 'Library Keeper', affinity: player?.npcVectors?.rowan?.trust || 35, avatar: '📜' }
  ];

  const handleAcceptJeremie = () => {
    if (acceptMaiSpaceFriend) {
      acceptMaiSpaceFriend('jeremie');
    }
  };

  const handlePostBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    if (postMaiSpaceBulletin) {
      postMaiSpaceBulletin(newPostText.trim());
    }
    setNewPostText('');
  };

  const fontClass = headerFont === 'Cookie' ? 'font-signature' : headerFont === 'Yeseva One' ? 'font-display' : 'font-serif-y2k';

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#FAF8FC] via-[#F5F2F9] to-[#EFEBF4] text-[#1a233a] font-sans text-xs select-none overflow-y-auto">
      {/* ── TOP MAI.SPACE HEADER BAR (LIGHT THEME) ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-purple-200/80 bg-white/90 px-6 py-3 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold shadow-sm">
            <Globe size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-y2k text-base font-bold tracking-tight text-[#1b254f]">mai.space</span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-mono font-bold text-purple-700">v2.4 Light</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Aureline Municipal Public Social Grid</p>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1 bg-purple-50/70 border border-purple-200/80 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'profile' ? 'bg-[#1b254f] text-white shadow-xs' : 'text-slate-600 hover:bg-purple-100/50'
            }`}
          >
            👤 My Profile
          </button>
          <button
            onClick={() => setActiveTab('bulletin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bulletin' ? 'bg-[#1b254f] text-white shadow-xs' : 'text-slate-600 hover:bg-purple-100/50'
            }`}
          >
            📢 Bulletin ({bulletinPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'network' ? 'bg-[#1b254f] text-white shadow-xs' : 'text-slate-600 hover:bg-purple-100/50'
            }`}
          >
            🌐 Top 8 Network
          </button>
          <button
            onClick={() => setActiveTab('reputation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'reputation' ? 'bg-[#1b254f] text-white shadow-xs' : 'text-slate-600 hover:bg-purple-100/50'
            }`}
          >
            🏆 7 Ecosystems
          </button>
        </div>
      </header>

      {/* ── PENDING FRIEND REQUEST BANNER (JEREMIE BELPOIS) ── */}
      {!hasAcceptedJeremie && (
        <div className="mx-6 mt-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
              💻
            </div>
            <div>
              <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                <span>Friend Request: Jeremie Belpois</span>
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">Cyber-Architect</span>
              </div>
              <p className="text-[11px] text-slate-600">"Saw your signal in the terminal logs. Let's link up on Mai.space."</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptJeremie}
              className="px-4 py-2 bg-[#1b254f] hover:bg-[#25335f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} /> Accept (+15 Trust & +100 ₢)
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="p-6">
        {/* TAB 1: PROFILE PAGE (MYSPACE AESTHETIC, CLEAN LIGHT THEME) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Avatar, Status, Audio Player */}
            <div className="lg:col-span-4 space-y-4">
              {/* Profile Card */}
              <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm text-center space-y-3">
                <div className="mx-auto h-24 w-24 rounded-full border-4 border-purple-100 bg-gradient-to-tr from-purple-200 to-indigo-100 flex items-center justify-center shadow-inner text-purple-800 text-3xl">
                  👤
                </div>

                <div>
                  <h2 className={`${fontClass} text-2xl font-bold text-[#1b254f] leading-none`}>
                    {handle}
                  </h2>
                  <p className="text-[11px] text-purple-700 font-mono mt-1">
                    {identity?.declaredRegion || 'Aureline Central'}
                  </p>
                </div>

                <div className="border-t border-purple-100 pt-3 text-left space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Thought:</div>
                  <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-700 italic font-lore">
                    "{statusThought}"
                  </div>
                </div>

                {/* Edit Thought / Handle */}
                <div className="space-y-2 pt-2 border-t border-purple-100">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => updateMaiSpaceProfile({ handle: e.target.value })}
                    placeholder="Enter your handle..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 text-slate-800 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="text"
                    value={statusThought}
                    onChange={(e) => updateMaiSpaceProfile({ statusThought: e.target.value })}
                    placeholder="Update status thought..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 text-slate-800 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Audio Frequency Broadcast Player */}
              <div className="rounded-3xl border border-purple-200/80 bg-white p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#1b254f]">
                  <span className="flex items-center gap-1.5">
                    <Radio size={14} className="text-purple-600" /> 88.2 MHz • Sub-Aureline Ambient Synth
                  </span>
                  <button
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold"
                  >
                    {isPlayingMusic ? '⏸ Pause' : '▶ Play'}
                  </button>
                </div>
                <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`bg-purple-600 h-full ${isPlayingMusic ? 'animate-pulse w-3/4' : 'w-1/2'}`} />
                </div>
              </div>
            </div>

            {/* Right Column: Customization, Bio, Network Preview, World Stream */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header Typography Selector */}
              <div className="rounded-3xl border border-purple-200/80 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#1b254f]">Header Profile Font:</span>
                  <p className="text-[10px] text-slate-500">Personalize your page header aesthetic (Persisted to OS Profile)</p>
                </div>
                <div className="flex gap-1.5">
                  {(['Cookie', 'Yeseva One', 'Esteban'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateMaiSpaceProfile({ headerFont: f })}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        headerFont === f ? 'bg-[#1b254f] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top 8 Network Grid */}
              <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#1b254f] uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-purple-600" /> {handle}'s Top 8 Network
                  </h3>
                  <span className="text-[10px] font-mono text-purple-700">8 Connections</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {top8Friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="rounded-2xl border border-slate-100 bg-[#FAFAFC] hover:bg-purple-50/50 p-3 text-center transition shadow-2xs space-y-1.5"
                    >
                      <div className="mx-auto h-12 w-12 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-xl shadow-inner">
                        {friend.avatar}
                      </div>
                      <div className="font-bold text-[11px] text-[#1b254f] truncate">{friend.name}</div>
                      <div className="text-[9px] text-purple-700 font-mono truncate">{friend.role}</div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                        <div className="bg-purple-600 h-full" style={{ width: `${friend.affinity}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Institutional Echoes & World Event Stream */}
              <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#1b254f] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" /> Cross-Institution Resonance Feed
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-700">Shared Narrative Memory</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {worldEventLog.slice(0, 6).map((evt) => (
                    <div key={evt.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[11px] text-slate-900">[{evt.institution}] {evt.title}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">{evt.summary}</div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0 uppercase">
                        {evt.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBLIC BULLETIN & RUMORS */}
        {activeTab === 'bulletin' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Create Post Form */}
            <form onSubmit={handlePostBulletin} className="rounded-3xl border border-purple-200/80 bg-white p-4 shadow-sm space-y-3">
              <div className="font-bold text-xs text-[#1b254f] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-purple-600" /> Broadcast to Public Aureline Grid
              </div>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share a campus rumor, tech breakthrough, or district observation..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">Public broadcast visible to all districts & persisted in Mai.space</span>
                <Button type="submit" size="sm" variant="solid" className="px-4 py-1.5 font-bold">
                  <Send size={12} className="mr-1 inline" /> Post Bulletin (+5 Campus Rep & +2 Friendship)
                </Button>
              </div>
            </form>

            {/* Posts Feed */}
            <div className="space-y-3">
              {bulletinPosts.map((post) => (
                <div key={post.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1b254f]">{post.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{post.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{post.content}</p>
                  <div className="flex items-center gap-4 text-[10px] text-purple-700 font-mono pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-purple-900">
                      <Heart size={12} className="text-pink-500" /> {post.likes} Resonances
                    </span>
                    <span className="text-slate-400">• Municipal Node Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {top8Friends.map((f) => {
                const alreadyPinged = profile.pingedFriendsCycle?.[f.id] === timeCycleCount;
                return (
                  <div key={f.id} className="rounded-3xl border border-purple-200/80 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl">
                        {f.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#1b254f]">{f.name}</div>
                        <div className="text-[10px] text-purple-700 font-mono">{f.role}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Bond Affinity: {f.affinity}%</div>
                      </div>
                    </div>
                    <button
                      onClick={() => pingMaiSpaceFriend && pingMaiSpaceFriend(f.id)}
                      disabled={alreadyPinged}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 disabled:bg-slate-100 disabled:text-slate-400 text-purple-900 text-[10px] font-bold rounded-xl transition cursor-pointer"
                    >
                      {alreadyPinged ? '✓ Signal Synced' : '+ Ping Signal (+5 Friendship / +3 Trust)'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 7 REPUTATION ECOSYSTEMS */}
        {activeTab === 'reputation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'campus', name: 'Cyacademy Campus', desc: 'Academic status, club privileges, student respect.', val: player?.reputation?.campus || 50 },
              { key: 'dga', name: 'DGA Bureau', desc: 'Government compliance, clearance tiers, administrative trust.', val: player?.reputation?.dga || 40 },
              { key: 'faith', name: 'Faith Medical Group', desc: 'Medical diagnostics, aura treatment priority, research data.', val: player?.reputation?.faith || 50 },
              { key: 'archive', name: 'Archive Keepers', desc: 'Central Library access, historical codex unlocks, lineage files.', val: player?.reputation?.archive || 30 },
              { key: 'vector', name: 'Vector Collective', desc: 'Underground Netrunner syndicate, custom exploits, black market.', val: player?.reputation?.vector || 35 },
              { key: 'delegation', name: 'Regional Delegation', desc: 'Diplomatic relations across Fross, Lumia, Marlowe, Brisland, Kaji.', val: player?.reputation?.delegation || 25 },
              { key: 'orynvell', name: 'Orynvell Royal Authority', desc: 'High-court decrees, royal seals, crown sanctuary clearance.', val: player?.reputation?.orynvell || 10 }
            ].map((rep) => (
              <div key={rep.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center font-bold text-xs text-[#1b254f]">
                  <span>{rep.name}</span>
                  <span className="font-mono text-purple-700 font-bold">{rep.val}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full" style={{ width: `${rep.val}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 font-sans">{rep.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default MaiSpacePortal;

