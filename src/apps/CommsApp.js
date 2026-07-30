import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { INITIAL_EMAILS, INITIAL_SHADOWCHAT_FEED } from '../data/commsData';
import { useOSStore } from '../store/useOSStore';

const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'secure', label: 'Secure chat' },
  { id: 'alerts', label: 'Alerts' },
];

export default function CommsApp() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('Select a channel to begin.');
  const [search, setSearch] = useState('');
  const [focusIndex, setFocusIndex] = useState(-1);

  const claimedComms = useOSStore((state) => state.gameplay.claimedComms);
  const claimCommsAttachment = useOSStore((state) => state.claimCommsAttachment);

  const openTab = (tab) => {
    setActiveTab(tab);
    setSelectedMessageId(null);
    setIsComposing(false);
    setSearch('');
    setFocusIndex(-1);
    setNotice(tab === 'secure' ? 'Secure relay connected.' : `${tab[0].toUpperCase()}${tab.slice(1)} channel active.`);
  };

  const messages = useMemo(() => {
    if (activeTab === 'secure') return [];
    const base = INITIAL_EMAILS;
    let filtered = base;
    if (activeTab === 'alerts') {
      filtered = base.filter((m) => /alert|notice|security|orientation|setup|activation/i.test(m.subject) || /System|Services|Dean|Medical|Bureau|Security/i.test(m.sender));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((m) =>
        m.subject.toLowerCase().includes(q) ||
        m.sender.toLowerCase().includes(q) ||
        (m.body || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [activeTab, search]);

  const selectedMessage = useMemo(() => messages.find((m) => m.id === selectedMessageId) || null, [messages, selectedMessageId]);
  const attachmentClaimed = selectedMessage?.attachment && claimedComms.includes(selectedMessage.id);

  const openMessage = (message) => {
    if (!message) return;
    setSelectedMessageId(message.id);
    setIsComposing(false);
    setNotice(`Transmission from ${message.sender} opened.`);
  };

  const claimAttachment = () => {
    if (!selectedMessage?.attachment || claimedComms.includes(selectedMessage.id)) return;
    claimCommsAttachment(selectedMessage.id, selectedMessage.attachment.amount, 50);
    setNotice(`${selectedMessage.attachment.name} claimed.`);
  };

  const sendDraft = () => {
    if (!draft.trim()) return;
    setDraft('');
    setIsComposing(false);
    setNotice('Reply queued through the secure relay.');
  };

  useEffect(() => {
    // Reset focus index when list changes
    setFocusIndex(messages.length ? 0 : -1);
  }, [messages]);

  const handleKey = (e) => {
    if (activeTab === 'secure') return;
    if (!messages.length) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      setFocusIndex((i) => Math.min(messages.length - 1, (i < 0 ? 0 : i + 1)));
    } else if (e.key === 'ArrowUp') {
      setFocusIndex((i) => Math.max(0, (i < 0 ? 0 : i - 1)));
    } else if (e.key === 'Enter') {
      const msg = messages[Math.max(0, focusIndex)];
      if (msg) openMessage(msg);
    } else if (e.key === 'Escape') {
      setSelectedMessageId(null);
    }
  };

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#240724]" aria-label="Comms portal" onKeyDown={handleKey} tabIndex={0}>
      {/* Base artwork remains untouched */}
      <img
        src="/comms_window.svg"
        alt="Comms portal artwork"
        draggable={false}
        className="pointer-events-none absolute inset-0 block h-full w-full select-none object-fill"
      />

      {/* Left Nav Hotspots (transparent, preserve art) */}
      <div className="absolute left-[1%] top-[11%] flex w-[21.5%] flex-col gap-[1.4%]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openTab(item.id)}
            className={`h-[8.2%] min-h-5 rounded-sm border text-left text-[clamp(7px,1vw,12px)] font-semibold uppercase tracking-[.12em] transition focus:outline-none focus:ring-2 focus:ring-white/80 ${
              activeTab === item.id ? 'border-white/70 bg-white/15 text-white/70' : 'border-transparent bg-transparent text-white/0 hover:border-white/35 hover:bg-white/5'
            }`}
            aria-pressed={activeTab === item.id}
          >
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Status pill */}
      <div className="absolute left-[26.5%] top-[4%] flex max-w-[65%] items-center gap-2 rounded-full border border-white/20 bg-[#240724]/35 px-3 py-1 text-[clamp(8px,1vw,12px)] text-white/90 backdrop-blur-[2px]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#b9f4d0] shadow-[0_0_8px_#b9f4d0]" />
        <span>{notice}</span>
      </div>

      {/* Search field (transparent glass) for Inbox/Alerts */}
      {activeTab !== 'secure' && (
        <div className="absolute left-[26.5%] top-[9%] flex w-[35%] items-center gap-2 rounded-full border border-white/15 bg-[#240724]/30 px-3 py-1 text-[clamp(8px,1vw,12px)] text-white/80 backdrop-blur-[2px]">
          <span className="text-white/60">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transmissions…"
            className="w-full bg-transparent outline-none placeholder:text-white/40"
          />
        </div>
      )}

      {/* List panel (left-center) and Details panel (right-center) */}
      {activeTab !== 'secure' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-[26.5%] top-[16%] h-[57%] w-[28%] overflow-hidden rounded-lg border border-white/15 bg-[#240724]/30 backdrop-blur-[2px]"
            aria-label="Message list"
          >
            <div className="h-full w-full overflow-auto p-2 pr-1">
              {messages.map((m, idx) => {
                const isFocused = idx === focusIndex;
                const isSelected = selectedMessageId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => openMessage(m)}
                    className={`mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[clamp(8px,1vw,12px)] transition ${
                      isSelected
                        ? 'border-white/50 bg-white/15 text-white'
                        : isFocused
                        ? 'border-white/30 bg-white/10 text-white/90'
                        : 'border-white/10 bg-transparent text-white/80 hover:border-white/25 hover:bg-white/5'
                    }`}
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{m.subject}</p>
                      <span className="shrink-0 text-white/50">{m.time}</span>
                    </div>
                    <p className="truncate text-white/60">{m.sender}</p>
                  </button>
                );
              })}
              {!messages.length && (
                <div className="mt-6 text-center text-white/60">No transmissions match.</div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedMessage && (
              <motion.article
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-[56%] top-[16%] h-[57%] w-[39%] overflow-hidden rounded-lg border border-white/20 bg-[#240724]/45 p-3 text-[clamp(8px,1vw,12px)] text-white backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{selectedMessage.subject}</p>
                    <p className="mt-0.5 text-white/65">{selectedMessage.sender} · {selectedMessage.time}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedMessageId(null)} className="rounded px-1 text-white/70 hover:bg-white/15 hover:text-white" aria-label="Close message">×</button>
                </div>
                <div className="mt-2 h-[68%] overflow-auto whitespace-pre-line leading-relaxed text-white/85 pr-1">
                  {selectedMessage.body}
                </div>
                {selectedMessage.attachment && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-white/70 text-[0.9em]">Attachment: <span className="font-semibold text-white">{selectedMessage.attachment.name}</span></div>
                    <button type="button" disabled={attachmentClaimed} onClick={claimAttachment} className="rounded border border-white/35 bg-white/10 px-2 py-1 text-[0.9em] font-semibold hover:bg-white/20 disabled:cursor-default disabled:opacity-60">
                      {attachmentClaimed ? 'Attachment claimed' : `Claim +₡${selectedMessage.attachment.amount}`}
                    </button>
                  </div>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Secure channel view: chat bubbles overlay keeping art visible */}
      {activeTab === 'secure' && !isComposing && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute left-[28%] top-[17%] h-[57%] w-[62%] overflow-hidden rounded-lg border border-white/15 bg-[#240724]/30 p-3 backdrop-blur-[2px]">
          <div className="flex h-full flex-col gap-2 overflow-auto pr-1 text-[clamp(8px,1vw,12px)] text-white/90">
            {INITIAL_SHADOWCHAT_FEED.map((message) => (
              <div key={message.id} className="max-w-[78%] rounded-lg border border-white/20 bg-white/10 px-2 py-1.5">
                <div className="mb-0.5 flex items-center justify-between text-white/70">
                  <span className="font-semibold text-white">{message.user}</span>
                  <span className="text-white/50">{message.time}</span>
                </div>
                <p className="leading-snug text-white/85">{message.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Compose hotspot along the bottom bar */}
      <button
        type="button"
        onClick={() => {
          setIsComposing(true);
          setSelectedMessageId(null);
          setNotice('Compose a secure reply.');
        }}
        className="absolute bottom-[10.5%] left-[27%] h-[8.5%] w-[65%] rounded-sm border border-transparent bg-transparent transition hover:border-white/45 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
        aria-label="Compose a message"
      />

      <AnimatePresence>
        {isComposing && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            onSubmit={(event) => { event.preventDefault(); sendDraft(); }}
            className="absolute left-[28%] bottom-[18%] w-[61%] rounded-lg border border-white/30 bg-[#240724]/55 p-3 text-[clamp(8px,1vw,12px)] text-white backdrop-blur-md"
          >
            <label className="block font-semibold">Secure reply</label>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus placeholder="Write a message…" className="mt-2 h-16 w-full resize-none rounded border border-white/25 bg-black/15 p-2 text-inherit outline-none placeholder:text-white/45 focus:border-white/60" />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setIsComposing(false)} className="rounded px-2 py-1 hover:bg-white/15">Cancel</button>
              <button type="submit" className="rounded border border-white/35 bg-white/15 px-2 py-1 font-semibold hover:bg-white/25">Send</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
