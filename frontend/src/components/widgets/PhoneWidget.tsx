import React, { useState } from "react";
import { useOSStore } from "../../store/useOSStore";
import {
  INITIAL_SMS_THREADS,
  INITIAL_VOICEMAILS,
  INITIAL_EVIDENCE_ITEMS,
} from "../../data/phoneData";
import {
  MessageSquare,
  Camera,
  AlertOctagon,
  Pin,
  ChevronLeft,
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
  | "messages"
  | "phone"
  | "passport"
  | "missions"
  | "spellforge"
  | "evidence"
  | "media"
  | "emergency";
const phoneApps = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "passport", label: "Passport", icon: UserCheck },
  { id: "missions", label: "Missions", icon: ShieldCheck },
  { id: "spellforge", label: "SpellForge", icon: Flame },
  { id: "evidence", label: "Evidence", icon: Pin },
  { id: "media", label: "Media", icon: Music },
  { id: "emergency", label: "Emergency", icon: AlertOctagon },
] as const;

export default function PhoneWidget({ onClose }: { onClose?: () => void }) {
  const [activeScreen, setActiveScreen] = useState<PhoneScreen>("home");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVm, setPlayingVm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [smsThreads, setSmsThreads] = useState(INITIAL_SMS_THREADS);
  const [activeSmsContact, setActiveSmsContact] = useState("Aelita");
  const [smsInput, setSmsInput] = useState("");
  const [evidenceItems, setEvidenceItems] = useState(INITIAL_EVIDENCE_ITEMS);
  const [spellElement, setSpellElement] = useState<string | null>(null);
  const [spellUtility, setSpellUtility] = useState<string | null>(null);
  const [spellResult, setSpellResult] = useState("");
  const [notice, setNotice] = useState("");
  const player = useOSStore((state) => state.gameplay.player);
  const addCredits = useOSStore((state) => state.addCredits);
  const addXP = useOSStore((state) => state.addXP);
  const purgePrismCorruption = useOSStore(
    (state) => state.purgePrismCorruption,
  );

  function sendSms(text: string) {
    if (!text.trim()) return;
    setSmsThreads((previous) => ({
      ...previous,
      [activeSmsContact]: [
        ...(previous[activeSmsContact] || []),
        { id: Date.now(), sender: "You", text: text.trim(), time: "Just now" },
      ],
    }));
    setSmsInput("");
  }

  function quickReply(vector: "trust" | "sync", text: string) {
    const npcKey = activeSmsContact.toLowerCase().split(" ")[0];
    useOSStore
      .getState()
      .updateNPCVector(npcKey === "dr." ? "voss" : npcKey, vector, 10);
    sendSms(text);
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

  function synthesizeSpell() {
    if (!spellElement || !spellUtility) {
      setSpellResult("Select one element and one utility.");
      return;
    }
    addCredits(75);
    addXP(40);
    purgePrismCorruption(1.5);
    setSpellResult(
      `Synthesized ${spellElement} ${spellUtility}. +75 credits, +40 XP.`,
    );
    setSpellElement(null);
    setSpellUtility(null);
  }

  const activeApp = phoneApps.find((app) => app.id === activeScreen);
  const filteredApps = phoneApps.filter((app) =>
    app.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <PhoneSurface device aria-label="Personal phone">
      <PhoneStatusBar />
      <header className="phone-device-header">
        <h2>My signal</h2>
        <PhoneThemePicker />
        {onClose && (
          <PhoneButton aria-label="Close phone" onClick={onClose}>
            <X size={16} />
          </PhoneButton>
        )}
      </header>
      <div className="phone-screen">
        {activeScreen === "home" ? (
          <div className="phone-screen-scroll phone-home">
            <PhonePanel>
              <div className="phone-track">
                <span className="phone-music-art">
                  <Music size={23} />
                </span>
                <div>
                  <strong>Twilight Dusk #04</strong>
                  <small>
                    Cycademy lo-fi · {isPlaying ? "Playing" : "Paused"}
                  </small>
                </div>
                <PhoneButton
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                  aria-pressed={isPlaying}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </PhoneButton>
              </div>
              <div className="phone-progress" aria-hidden="true">
                <span />
              </div>
            </PhonePanel>
            <div className="phone-widgets">
              <PhonePanel>
                <strong>
                  {new Date().toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
                <span>Aureline · Dusk</span>
              </PhonePanel>
              <PhonePanel>
                <strong className="phone-success">
                  Aura: 100% <Sparkles size={12} className="inline" />
                </strong>
                <span>Signal in harmony</span>
              </PhonePanel>
            </div>
            <div className="phone-search">
              <Search size={18} className="phone-accent" />
              <input
                className="phone-input"
                type="search"
                aria-label="Search phone apps"
                placeholder="Find an app…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <nav className="phone-app-grid" aria-label="Phone apps">
              {filteredApps.map((app) => (
                <PhoneAppButton
                  key={app.id}
                  icon={app.icon}
                  label={app.label}
                  badge={
                    app.id === "phone"
                      ? INITIAL_VOICEMAILS.length
                      : app.id === "evidence"
                        ? evidenceItems.length
                        : undefined
                  }
                  danger={app.id === "emergency"}
                  onClick={() => {
                    setActiveScreen(app.id);
                    setNotice("");
                  }}
                />
              ))}
            </nav>
            {!filteredApps.length && (
              <p className="phone-empty">No apps match this search.</p>
            )}
            <PhonePanel className="phone-home-dock">
              {phoneApps
                .filter((app) =>
                  ["messages", "phone", "passport", "spellforge"].includes(
                    app.id,
                  ),
                )
                .map((app) => (
                  <PhoneButton
                    key={app.id}
                    aria-label={`Go to ${app.label}`}
                    onClick={() => setActiveScreen(app.id)}
                  >
                    <app.icon size={18} />
                  </PhoneButton>
                ))}
            </PhonePanel>
          </div>
        ) : (
          <>
            <div className="phone-screen-heading">
              <PhoneButton
                aria-label="Back to phone home"
                onClick={() => setActiveScreen("home")}
              >
                <ChevronLeft size={18} />
              </PhoneButton>
              <h3>{activeApp?.label}</h3>
            </div>
            {activeScreen === "messages" ? (
              <div className="phone-messages">
                <nav
                  className="phone-thread-list"
                  aria-label="Message contacts"
                >
                  {Object.keys(smsThreads).map((contact) => (
                    <PhoneButton
                      key={contact}
                      aria-pressed={activeSmsContact === contact}
                      onClick={() => setActiveSmsContact(contact)}
                    >
                      {contact}
                    </PhoneButton>
                  ))}
                </nav>
                <div
                  className="phone-screen-scroll phone-stack"
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
                </div>
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
              <div className="phone-screen-scroll phone-stack">
                {activeScreen === "phone" &&
                  INITIAL_VOICEMAILS.map((voicemail) => (
                    <PhonePanel key={voicemail.id} className="phone-stack">
                      <div>
                        <strong>{voicemail.sender}</strong>
                        <p className="phone-muted">
                          {voicemail.time} · {voicemail.duration}
                        </p>
                      </div>
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
                    </PhonePanel>
                  ))}
                {activeScreen === "passport" && (
                  <>
                    <PhonePanel>
                      <dl className="phone-record">
                        <dt>Citizen</dt>
                        <dd>{player.name}</dd>
                        <dt>Aura serial</dt>
                        <dd>CY-9021-X9</dd>
                        <dt>Level</dt>
                        <dd>
                          {player.level} · {player.xp} XP
                        </dd>
                        <dt>Credits</dt>
                        <dd>{player.credits.toLocaleString()} ₡</dd>
                      </dl>
                    </PhonePanel>
                    <div className="phone-code">
                      ||| | |||| ||| |||| | ||||| CY-9021
                    </div>
                  </>
                )}
                {activeScreen === "missions" && (
                  <>
                    <PhonePanel className="phone-stack">
                      <h3>Sector 7 Subnet Patrol</h3>
                      <p>Scan perimeter net nodes for PRISM corruption.</p>
                      <p className="phone-success">+200 credits · +100 XP</p>
                    </PhonePanel>
                    <PhonePanel className="phone-stack">
                      <h3>Faith Medical Intake Scan</h3>
                      <p>Verify student aura health records.</p>
                      <p className="phone-success">+150 credits · +75 XP</p>
                    </PhonePanel>
                  </>
                )}
                {activeScreen === "spellforge" && (
                  <>
                    <p className="phone-muted">Select an element</p>
                    <div className="phone-choice-grid">
                      {["Firewall", "Cryo", "Encryption"].map((element) => (
                        <PhoneButton
                          key={element}
                          aria-pressed={spellElement === element}
                          onClick={() => setSpellElement(element)}
                        >
                          {element}
                        </PhoneButton>
                      ))}
                    </div>
                    <p className="phone-muted">Select a utility</p>
                    <div className="phone-choice-grid">
                      {["Routing", "Anchor", "Pulse"].map((utility) => (
                        <PhoneButton
                          key={utility}
                          aria-pressed={spellUtility === utility}
                          onClick={() => setSpellUtility(utility)}
                        >
                          {utility}
                        </PhoneButton>
                      ))}
                    </div>
                    <PhoneButton tone="primary" onClick={synthesizeSpell}>
                      <Sparkles size={16} />
                      Synthesize spell
                    </PhoneButton>
                    <p className="phone-feedback" role="status">
                      {spellResult}
                    </p>
                  </>
                )}
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
        onClick={() => setActiveScreen("home")}
      >
        <span />
      </button>
    </PhoneSurface>
  );
}
