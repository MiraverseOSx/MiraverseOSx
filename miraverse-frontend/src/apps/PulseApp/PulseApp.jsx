import React, { useState } from 'react';
import {
  Radio, User, Heart, MessageSquare, Share2, Sparkles, Shield, UserPlus, CheckCircle2,
  TrendingUp, Lock, Send, Search, Bell, Tag, Globe, Hash
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

const HOUSE_TAGS = [
  { id: 'Vertex', label: 'Vertex House', desc: 'Strategy & Leadership', icon: '⚡' },
  { id: 'Vector', label: 'Vector House', desc: 'Cybernetics & Hackers', icon: '💻' },
  { id: 'Anchor', label: 'Anchor House', desc: 'Defense & Containment', icon: '🛡️' },
  { id: 'Pulse', label: 'Pulse House', desc: 'Net Weavers & Media', icon: '📡' },
];

export default function PulseApp() {
  const pulseProfile = useOSStore((s) => s.gameplay.pulseProfile);
  const createPulseProfile = useOSStore((s) => s.createPulseProfile);
  const addXP = useOSStore((s) => s.addXP);

  const [displayName, setDisplayName] = useState(pulseProfile.displayName || '');
  const [houseTag, setHouseTag] = useState(pulseProfile.houseTag || 'Vector');
  const [visibility, setVisibility] = useState(pulseProfile.visibility || 'Public');
  const [theme, setTheme] = useState(pulseProfile.theme || 'purple');

  // Feed State
  const [posts, setPosts] = useState([
    {
      id: 'p-1',
      author: 'Jeremie',
      handle: '@jeremie_code',
      avatar: '👨‍💻',
      content: 'Saw your profile go live. If you’re planning to look into the academy… be careful. Some systems don’t like new users.',
      time: '10m ago',
      likes: 12,
      replies: 3,
      liked: false,
      followed: false,
    },
    {
      id: 'p-2',
      author: 'Aelita',
      handle: '@aelita_veil',
      avatar: '🌸',
      content: 'Your signal feels… unusual. I don’t know where you came from, but I hope you’re safe in Aureline.',
      time: '18m ago',
      likes: 24,
      replies: 7,
      liked: false,
      followed: false,
    },
    {
      id: 'p-3',
      author: 'Odd',
      handle: '@odd_snacks',
      avatar: '🍕',
      content: 'HEY NEW PERSON! Welcome to the network. If you need shortcuts, rumors, or snacks, I got you.',
      time: '25m ago',
      likes: 45,
      replies: 12,
      liked: false,
      followed: false,
    },
    {
      id: 'p-4',
      author: 'Sissi',
      handle: '@sissi_glam',
      avatar: '👑',
      content: 'Another rookie joining Aureline Pulse. Try not to spam the feed with amateur posts.',
      time: '40m ago',
      likes: 8,
      replies: 2,
      liked: false,
      followed: false,
    },
    {
      id: 'p-5',
      author: 'Dr. Voss',
      handle: '@voss_security',
      avatar: '🛡️',
      content: 'SECURITY DISPATCH: PRISM frequency signatures detected near Sub-Conduit Sector 4. Citizens are advised to sanitize their terminal nodes.',
      time: '1h ago',
      likes: 89,
      replies: 19,
      liked: false,
      followed: false,
    },
  ]);

  const [newPostText, setNewPostText] = useState('');

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    createPulseProfile({
      displayName: displayName.trim(),
      houseTag,
      visibility,
      theme,
    });
  };

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleFollow = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, followed: !p.followed } : p))
    );
    addXP(10);
  };

  const handlePublishPost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newP = {
      id: `p-${Date.now()}`,
      author: pulseProfile.displayName || 'You',
      handle: `@${(pulseProfile.displayName || 'citizen').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: '⚡',
      content: newPostText.trim(),
      time: 'Just now',
      likes: 1,
      replies: 0,
      liked: true,
      followed: true,
    };

    setPosts([newP, ...posts]);
    setNewPostText('');
    addXP(20);
  };

  const hasProfile = Boolean(pulseProfile.displayName);

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#0f0926] via-[#070514] to-[#120a2e] text-purple-100 font-sans select-none overflow-hidden">
      {/* ── TOP PULSE BAR ── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-purple-500/20 bg-[#0d0724]/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.3)]">
            <Radio size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-200 font-serif tracking-wide">
              PULSE CITIZEN NETWORK
            </h1>
            <span className="text-[9px] font-mono text-purple-400/80 uppercase tracking-widest">
              AURELINE SOCIAL & SIGNAL BROADCAST
            </span>
          </div>
        </div>

        {hasProfile && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="rounded-full bg-pink-950/60 border border-pink-400/30 px-3 py-1 text-pink-200">
              {pulseProfile.displayName} ({pulseProfile.houseTag})
            </span>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT: PROFILE CREATOR OR LIVE FEED ── */}
      {!hasProfile ? (
        /* STEP 1: CREATE PULSE PROFILE SCREEN */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <form onSubmit={handleCreateProfile} className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#0d0724]/90 p-8 shadow-2xl space-y-6 text-left backdrop-blur-xl">
            <div className="border-b border-purple-500/20 pb-4">
              <h2 className="text-sm font-bold text-pink-200 font-serif flex items-center gap-2">
                <Sparkles size={16} className="text-pink-400" /> CREATE YOUR PULSE HANDLE
              </h2>
              <p className="text-[11px] text-purple-300/70 mt-1">
                Your Pulse profile broadcasts your civic signal across Aureline. Create your handle to follow citizens and unlock the Comms Portal.
              </p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-purple-200">Pulse Display Name / Handle:</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. NeoAura, Netweaver99, Seraph_Lover"
                className="w-full bg-[#170e38] border-purple-500/40 text-xs text-white placeholder-purple-400/60 rounded-xl px-4 py-2.5 outline-none focus:border-pink-400"
                required
              />
            </div>

            {/* House Tag Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200">Select House Tag Affiliation:</label>
              <div className="grid grid-cols-2 gap-2">
                {HOUSE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setHouseTag(tag.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      houseTag === tag.id
                        ? 'border-pink-400 bg-pink-950/40 text-white font-bold shadow-[0_0_15px_rgba(244,114,182,0.2)]'
                        : 'border-purple-500/20 bg-purple-950/20 text-purple-300 hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                    </div>
                    <p className="text-[10px] text-purple-300/60 mt-0.5">{tag.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="sm"
              variant="solid"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg rounded-xl flex items-center justify-center gap-2"
            >
              <span>Activate Pulse Profile & Join Network</span>
            </Button>
          </form>
        </div>
      ) : (
        /* STEP 2: LIVE PULSE SOCIAL FEED & COMPOSER */
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* LEFT SIDEBAR: TRENDS & FRIENDS */}
          <aside className="w-64 shrink-0 border-r border-purple-500/20 bg-[#0a061c]/80 p-4 space-y-5 overflow-y-auto">
            {/* User Badge */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-xs text-purple-100">{pulseProfile.displayName}</div>
                  <div className="text-[10px] font-mono text-purple-400">@{pulseProfile.displayName.toLowerCase().replace(/\s+/g, '_')}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 text-[10px] font-mono">
                <span className="text-pink-300">{pulseProfile.houseTag} House</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 font-serif">
                <TrendingUp size={14} className="text-pink-400" /> AURELINE TRENDS
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { tag: '#CycademyHackathon', posts: '1.2k posts' },
                  { tag: '#VeilwiltAlert', posts: '840 posts' },
                  { tag: '#OrynvellArchives', posts: '450 posts' },
                  { tag: '#AurelineSpells', posts: '310 posts' },
                ].map((t) => (
                  <div key={t.tag} className="rounded-xl border border-purple-500/15 bg-purple-950/20 p-2 hover:border-purple-400/30 transition cursor-pointer">
                    <div className="font-bold text-purple-200 text-[11px]">{t.tag}</div>
                    <div className="text-[9px] font-mono text-purple-400/70">{t.posts}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER FEED */}
          <main className="flex min-w-0 flex-1 flex-col bg-[#070514]/60 overflow-y-auto p-5 space-y-4">
            {/* Post Composer */}
            <form onSubmit={handlePublishPost} className="rounded-2xl border border-purple-500/30 bg-[#0d0724]/90 p-4 shadow-lg space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚡</span>
                <input
                  type="text"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share a safe signal update with Aureline..."
                  className="flex-1 bg-transparent text-xs text-purple-100 placeholder-purple-400/60 outline-none"
                />
              </div>
              <div className="flex items-center justify-between border-t border-purple-500/20 pt-2 text-xs">
                <span className="text-[10px] font-mono text-purple-400">Signal: Public Broadcast</span>
                <Button type="submit" size="sm" variant="solid" className="px-4 py-1.5 text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white rounded-lg">
                  Broadcast Signal
                </Button>
              </div>
            </form>

            {/* Posts List */}
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-purple-500/20 bg-[#0d0724]/80 p-4 shadow-md space-y-3 hover:border-purple-400/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-base">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-purple-100">{post.author}</span>
                          <span className="text-[10px] font-mono text-purple-400">{post.handle}</span>
                        </div>
                        <span className="text-[9px] text-purple-400/70 font-mono">{post.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollow(post.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                        post.followed
                          ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-300'
                          : 'border-pink-400/40 bg-pink-950/40 text-pink-200 hover:bg-pink-900/60'
                      }`}
                    >
                      {post.followed ? '✓ Following' : '+ Follow'}
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-purple-200/90 font-serif">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-6 border-t border-purple-500/15 pt-2.5 text-xs text-purple-300">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${post.liked ? 'text-pink-400 font-bold' : 'hover:text-white'}`}
                    >
                      <Heart size={14} className={post.liked ? 'fill-pink-400' : ''} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition">
                      <MessageSquare size={14} />
                      <span>{post.replies} Replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
