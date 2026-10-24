import React, { useEffect, useRef, useState } from "react";
import { useOSStore } from "../../store/useOSStore";
import { useCommsStore } from '../../store/useCommsStore';
import { LEGACY_DIRECT_CONTACTS } from '../../integration/phoneMessages';
import { OPPORTUNITIES, getOpportunity } from '../../gameplay/AssignmentFlow';
import {
  INITIAL_VOICEMAILS,
  INITIAL_EVIDENCE_ITEMS,
} from "../../data/phoneData";
import {
  MessageSquare,
  Camera,
  AlertOctagon,
  Pin,
  ChevronLeft,
  ChevronRight,
  Settings,
  Home,
  Sparkles,
  ShieldCheck,
  Search,
  Music,
  UserCheck,
  Flame,
  Phone,
  Volume2,
  Play,
  Pause,
  Send,
  X,
} from "lucide-react";
import {
  PhoneAppButton,
  PhoneButton,
  PhonePanel,
  PhoneStatusBar,
  PhoneSurface,
  PhoneThemePicker,
} from "../phone/PhonePrimitives";

type PhoneScreen =
  | "home"
  | "settings"
  | "messages"
  | "phone"
  | "passport"
  | "missions"
  | "spellforge"
  | "evidence"
  | "media"
  | "emergency";
const phoneApps = [
  { id: "messages", color: "blue", label: "Messages", icon: MessageSquare },
  { id: "phone", color: "blue", label: "Phone", icon: Phone },
  { id: "passport", color: "jade", label: "Citizen Hub", icon: UserCheck },
  { id: "missions", color: "jade", label: "Missions", icon: ShieldCheck },
  { id: "spellforge", color: "violet", label: "Cyacademy", icon: Flame },
  { id: "evidence", color: "sand", label: "Evidence", icon: Pin },
  { id: "media", color: "slate", label: "Media", icon: Music },
  { id: "emergency", color: "rose", label: "Emergency", icon: AlertOctagon },
] as const;

export default function PhoneWidget({ onClose }: { onClose?: () => void }) {
  const [activeScreen, setActiveScreen] = useState<PhoneScreen>("home");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVm, setPlayingVm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const smsThreads = useCommsStore(s => s.phoneThreads);
  const phoneRequest = useCommsStore(s => s.phoneRequest);
  useEffect(() => { useCommsStore.getState().migratePersonalThreads(); }, []);
  useEffect(() => {
    if (!phoneRequest) return;
    setActiveScreen('messages');
    setActiveSmsContact(phoneRequest.contact && Object.hasOwn(useCommsStore.getState().phoneThreads, phoneRequest.contact) ? phoneRequest.contact : null);
    useCommsStore.getState().consumePhoneRequest(phoneRequest.token);
  }, [phoneRequest]);
  const [activeSmsContact, setActiveSmsContact] = useState<string | null>(null);
  useEffect(() => { if (activeScreen === 'messages' && activeSmsContact) useCommsStore.getState().markPhoneThreadRead(activeSmsContact); }, [activeScreen, activeSmsContact, smsThreads]);
  const conversationRef = useRef<HTMLDivElement>(null);
  const screenHeadingRef = useRef<HTMLHeadingElement>(null);
  const smsDrafts = useCommsStore(s => s.phoneDrafts);
  const smsInput = activeSmsContact ? smsDrafts[activeSmsContact] || "" : "";
  const setSmsInput = (value: string) => {
    if (activeSmsContact) useCommsStore.getState().setPhoneDraft(activeSmsContact, value);
  };
  const [evidenceItems, setEvidenceItems] = useState(INITIAL_EVIDENCE_ITEMS);
  const [notice, setNotice] = useState("");
  const player = useOSStore((state) => state.gameplay.player);
  const calls = Object.entries(player.assignmentJournal?.dispatches || {}).filter(([, dispatch]: [string, any]) => dispatch.channel === 'phone').map(([id, dispatch]: [string, any]) => ({ id, ...dispatch, opportunity: getOpportunity(id) })).filter(call => call.opportunity);
  const incomingCalls = calls.filter(call => !call.heardAt);
  const phoneOpportunities = OPPORTUNITIES.filter(item => player.worknetOrders?.[item.id]?.status === 'active' || player.assignmentJournal?.started?.[item.id]);
  const addCredits = useOSStore((state) => state.addCredits);
  const addXP = useOSStore((state) => state.addXP);

  function sendSms(text: string) {
    if (!text.trim() || !activeSmsContact) return;
    useCommsStore.getState().sendPhoneMessage(activeSmsContact, text);
    setSmsInput("");
  }

  function quickReply(vector: "trust" | "sync", text: string) {
    if (!activeSmsContact) return;
    const npcKey = activeSmsContact.toLowerCase().split(" ")[0];
    useOSStore
      .getState()
      .updateNPCVector(npcKey === "dr." ? "voss" : npcKey, vector, 10);
    sendSms(text);
  }

  function legacyDialogue(cooperative: boolean) {
    if (!activeSmsContact) return;
    const channel = Object.entries(LEGACY_DIRECT_CONTACTS).find(([, name]) => name === activeSmsContact)?.[0];
    if (!channel) return;
    const npc = channel.slice(3);
    const os = useOSStore.getState();
    os.updateNPCVector(npc, 'trust', cooperative ? 10 : 5);
    os.updateNPCVector(npc, cooperative ? 'sync' : 'rivalry', 10);
    sendSms(cooperative ? 'I agree, let us coordinate security protocols.' : 'I am running independent diagnostic scans.');
    useCommsStore.getState().sendPhoneMessage(activeSmsContact, cooperative ? 'Excellent choice. I have logged your authorization.' : 'Proceed with caution. The lower conduits are erratic.', activeSmsContact);
  }

  function captureEvidence() {
    setEvidenceItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: `Snapshot #${previous.length + 1}`,
        type: "photo",
        tag: "Aura Lens",
        note: "Captured via Camera Lens",
      },
    ]);
    addCredits(50);
    addXP(25);
    setNotice("Snapshot pinned to Evidence. +50 credits, +25 XP.");
  }


  const activeApp = phoneApps.find((app) => app.id === activeScreen);
  const filteredApps = phoneApps.filter((app) =>
    `${app.label} ${app.id === 'phone' ? 'calls voicemail' : ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [activeSmsContact, smsThreads]);

  useEffect(() => {
    screenHeadingRef.current?.focus();
  }, [activeScreen, activeSmsContact]);

  function goHome() {
    setActiveScreen("home");
    setActiveSmsContact(null);
    setSearchQuery("");
    setNotice("");
  }

  function openPhoneApp(screen: PhoneScreen) {
    setActiveScreen(screen);
    setNotice("");
  }

  const searching = Boolean(searchQuery.trim());
  const conversationOpen = activeScreen === "messages" && activeSmsContact !== null;

  return (
    <PhoneSurface device aria-label="Personal phone" data-phone-color={activeApp?.color}>
      <PhoneStatusBar />
      <header className="phone-device-header">
        <h2>Phone<span> / Aureline</span></h2>
        <div className="phone-header-actions">
          <PhoneButton aria-label="Phone appearance" aria-pressed={activeScreen === "settings"} onClick={() => openPhoneApp("settings")}>
            <Settings size={18} />
          </PhoneButton>
          {onClose && <PhoneButton aria-label="Close phone" onClick={onClose}><X size={18} /></PhoneButton>}
        </div>
      </header>
      <div className="phone-screen">
        {activeScreen === "home" ? (
          <div className="phone-screen-scroll phone-home">
            <div className="phone-home-intro">
              <h3 ref={screenHeadingRef} tabIndex={-1}>Your apps</h3>
            </div>
            {incomingCalls.length > 0 && <PhonePanel className="phone-incoming phone-stack" data-phone-color="jade"><span className="phone-overline">Incoming work call</span><strong>{incomingCalls[0].opportunity.title}</strong><PhoneButton tone="primary" onClick={() => openPhoneApp('phone')}><Phone size={16} /> View call{incomingCalls.length > 1 ? `s (${incomingCalls.length})` : ''}</PhoneButton></PhonePanel>}
            <div className="phone-search">
              <Search size={18} aria-hidden="true" />
              <input className="phone-input" type="search" aria-label="Search phone apps" placeholder="Find an app" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
            </div>
            {!searching && <nav className="phone-primary-apps" aria-label="Communication apps">
              {phoneApps.slice(0, 2).map(app => <button key={app.id} className="phone-launch-row" data-phone-color={app.color} aria-label={`Open ${app.label}`} onClick={() => openPhoneApp(app.id)}>
                <span className="phone-launch-icon"><app.icon size={21} strokeWidth={1.7} /></span>
                <span><strong>{app.label === 'Phone' ? 'Calls' : app.label}</strong><small>{app.id === 'messages' ? 'Conversations & quick replies' : `${incomingCalls.length ? `${incomingCalls.length} incoming · ` : ''}${INITIAL_VOICEMAILS.length} voicemails`}</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>)}
            </nav>}
            <div className="phone-section-label">{searching ? 'Search results' : 'Essentials'}</div>
            <nav className="phone-app-grid" aria-label="Phone apps">
              {(searching ? filteredApps : phoneApps.slice(2)).map(app => <PhoneAppButton key={app.id} icon={app.icon} label={app.label} color={app.color} badge={app.id === 'phone' ? incomingCalls.length : undefined} danger={app.id === 'emergency'} onClick={() => openPhoneApp(app.id)} />)}
            </nav>
            {!filteredApps.length && <p className="phone-empty">No apps match this search.</p>}
          </div>
        ) : (
          <>
            <div className="phone-screen-heading">
              <PhoneButton aria-label={conversationOpen ? "Back to messages" : "Back to phone home"} onClick={() => conversationOpen ? setActiveSmsContact(null) : goHome()}><ChevronLeft size={20} /></PhoneButton>
              <div><span className="phone-overline">{conversationOpen ? 'Messages' : 'Your phone'}</span><h3 ref={screenHeadingRef} tabIndex={-1}>{conversationOpen ? activeSmsContact : activeScreen === 'settings' ? 'Appearance' : activeScreen === 'phone' ? 'Calls' : activeApp?.label}</h3></div>
            </div>
            {activeScreen === "messages" ? (
              activeSmsContact === null ? (
                <nav className="phone-screen-scroll phone-inbox" aria-label="Message contacts">
                  {Object.entries(smsThreads).map(([contact, messages]) => {
                    const latest = messages.at(-1);
                    return <button key={contact} className="phone-inbox-row" aria-label={`Read messages from ${contact}`} onClick={() => setActiveSmsContact(contact)}>
                      <span className="phone-contact-avatar" aria-hidden="true">{contact.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
                      <span className="phone-inbox-copy"><span className="phone-inbox-title"><strong>{contact}</strong><time>{latest?.time}</time></span><span className="phone-inbox-preview">{latest?.sender === 'You' ? 'You: ' : ''}{latest?.text || 'Start a conversation'}</span></span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </button>;
                  })}
                </nav>
              ) : <div className="phone-messages">
                <div
                  className="phone-screen-scroll phone-stack"
                  ref={conversationRef}
                  aria-label="Message conversation"
                  role="log"
                >
                  {(smsThreads[activeSmsContact] || []).map((message) => (
                    <PhonePanel
                      key={message.id}
                      className={`phone-message ${message.sender === "You" ? "phone-message--self" : ""}`}
                    >
                      <div className="phone-row">
                        <strong>{message.sender}</strong>
                        <span>{message.time}</span>
                      </div>
                      <p>{message.text}</p>
                    </PhonePanel>
                  ))}
                </div>
                <details className="phone-quick-replies">
                  <summary>Quick replies</summary>
                  <div className="phone-replies">
                  <PhoneButton
                    onClick={() =>
                      quickReply("trust", "Understood. On my way.")
                    }
                  >
                    +Trust · On my way
                  </PhoneButton>
                  <PhoneButton
                    onClick={() =>
                      quickReply("sync", "Ready to sync frequencies!")
                    }
                  >
                    +Sync · Ready to sync
                  </PhoneButton>
                  {Object.values(LEGACY_DIRECT_CONTACTS).includes(activeSmsContact) && <><PhoneButton onClick={() => legacyDialogue(true)}>Coordinate protocols · +Trust, +Sync</PhoneButton><PhoneButton onClick={() => legacyDialogue(false)}>Independent approach · +Rivalry</PhoneButton></>}
                </div>
                </details>
                <form
                  className="phone-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendSms(smsInput);
                  }}
                >
                  <input
                    className="phone-input"
                    aria-label={`Message ${activeSmsContact}`}
                    placeholder={`Message ${activeSmsContact}…`}
                    value={smsInput}
                    onChange={(event) => setSmsInput(event.target.value)}
                  />
                  <PhoneButton
                    type="submit"
                    tone="primary"
                    aria-label="Send message"
                    disabled={!smsInput.trim()}
                  >
                    <Send size={16} />
                  </PhoneButton>
                </form>
              </div>
            ) : (
              <div key={activeScreen} className="phone-screen-scroll phone-stack">
                {activeScreen === "settings" && <div className="phone-settings phone-stack"><p className="phone-muted">Choose the colors for your phone.</p><PhoneThemePicker /><p className="phone-muted">Your choice is saved on this device.</p></div>}
                {activeScreen === 'phone' && calls.map(call => <PhonePanel key={call.id} className="phone-stack"><strong>{call.opportunity.institution}</strong><small className="phone-muted">{call.heardAt ? 'Answered work call' : 'Incoming work call'}</small><h3>{call.opportunity.title}</h3>{call.heardAt ? <><p>“{call.opportunity.description} Your briefing and assignments are ready in WorkNet. Review the work before accepting.”</p><small className="phone-muted">In-world call transcript · simulated audio</small><PhoneButton tone="primary" onClick={() => { useOSStore.getState().openAssignment(call.id); onClose?.(); }}>Review call assignment</PhoneButton></> : <><PhoneButton tone="primary" onClick={() => useOSStore.getState().answerAssignmentCall(call.id)}><Phone size={15} /> Answer work call</PhoneButton><small className="phone-muted">The call stays here if you want to answer later.</small></>}</PhonePanel>)}
                {activeScreen === "phone" && <h4 className="phone-section-label">Voicemail · {INITIAL_VOICEMAILS.length}</h4>}
                {activeScreen === "phone" &&
                  INITIAL_VOICEMAILS.map((voicemail) => (
                    <details key={voicemail.id} className="phone-voicemail">
                      <summary>
                        <span className="phone-launch-icon"><Phone size={18} /></span>
                        <span>
                        <strong>{voicemail.sender}</strong>
                        <p className="phone-muted">
                          {voicemail.time} · {voicemail.duration}
                        </p>
                        </span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </summary>
                      <div className="phone-stack phone-voicemail-body">
                      <p>{voicemail.text}</p>
                      <PhoneButton
                        aria-pressed={playingVm === voicemail.id}
                        onClick={() =>
                          setPlayingVm(
                            playingVm === voicemail.id ? null : voicemail.id,
                          )
                        }
                      >
                        <Volume2 size={16} />
                        {playingVm === voicemail.id
                          ? "Stop preview"
                          : "Preview voicemail"}
                      </PhoneButton>
                      {playingVm === voicemail.id && (
                        <small className="phone-muted">
                          Transcript preview · audio is simulated
                        </small>
                      )}
                      </div>
                    </details>
                  ))}
                {activeScreen === "passport" && (
                  <>
                    <PhonePanel>
                      <dl className="phone-record">
                        <dt>Citizen</dt>
                        <dd>{player.name}</dd>
                        <dt>Local citizen ID</dt>
                        <dd>{useOSStore.getState().gameplay.identity.citizenId || 'Not issued'}</dd>
                        <dt>Level</dt>
                        <dd>
                          {player.level} · {player.xp} XP
                        </dd>
                        <dt>Credits</dt>
                        <dd>{player.credits.toLocaleString()} ₡</dd>
                      </dl>
                    </PhonePanel>
                    <div className="phone-code">
                      {useOSStore.getState().gameplay.identity.barcode || 'No credential barcode issued'}
                    </div>
                    <PhoneButton onClick={() => { useOSStore.getState().openAppWorkspace('passport'); onClose?.(); }}>Open Citizen Hub</PhoneButton>
                  </>
                )}
                {activeScreen === "missions" && (
                  <>
                    {(phoneOpportunities.length ? phoneOpportunities : OPPORTUNITIES.slice(0, 3)).map(item => <PhonePanel key={item.id} className="phone-stack"><small className="phone-muted">{item.kind}</small><h3>{item.title}</h3><p>{item.description}</p><PhoneButton onClick={() => { useOSStore.getState().openAssignment(item.id); onClose?.(); }}>Open in WorkNet</PhoneButton></PhonePanel>)}
                  </>
                )}
                {activeScreen === "spellforge" && <PhonePanel className="phone-stack"><h3>Cyacademy magic practice</h3><p>Continue your magical learning and workbench practice in the academy workspace.</p><PhoneButton tone="primary" onClick={() => { useOSStore.getState().openAppWorkspace('campus', 'magic'); onClose?.(); }}>Open magic practice</PhoneButton></PhonePanel>}
                {activeScreen === "evidence" && (
                  <>
                    {evidenceItems.map((item) => (
                      <PhonePanel key={item.id} className="phone-stack">
                        <div className="phone-row">
                          <strong>{item.title}</strong>
                          <span className="phone-accent">{item.tag}</span>
                        </div>
                        <p>{item.note}</p>
                      </PhonePanel>
                    ))}
                    <PhoneButton tone="primary" onClick={captureEvidence}>
                      <Camera size={16} />
                      Capture evidence
                    </PhoneButton>
                  </>
                )}
                {activeScreen === "media" && (
                  <div className="phone-media">
                    <span className="phone-music-art">
                      <Music size={26} />
                    </span>
                    <h3>Twilight Dusk Synth Stream</h3>
                    <PhoneButton
                      tone="primary"
                      aria-pressed={isPlaying}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isPlaying ? "Pause radio stream" : "Play radio stream"}
                    </PhoneButton>
                  </div>
                )}
                {activeScreen === "emergency" && (
                  <>
                    <p className="phone-muted">Meridion response channels</p>
                    <PhoneButton
                      tone="danger"
                      onClick={() =>
                        setNotice(
                          "Emergency call dispatched to Faith Medical Group.",
                        )
                      }
                    >
                      <AlertOctagon size={17} />
                      Faith Medical Emergency
                    </PhoneButton>
                    <PhoneButton
                      tone="danger"
                      onClick={() =>
                        setNotice(
                          "Tactical lockdown dispatched to the DGA response unit.",
                        )
                      }
                    >
                      <ShieldCheck size={17} />
                      DGA Response Unit
                    </PhoneButton>
                  </>
                )}
                {notice && (
                  <p className="phone-feedback" role="status">
                    {notice}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <button
        className="phone-home-indicator"
        aria-label="Return to phone home"
        onClick={goHome}
      >
        <Home size={16} />
        <span>Home</span>
      </button>
    </PhoneSurface>
  );
}
