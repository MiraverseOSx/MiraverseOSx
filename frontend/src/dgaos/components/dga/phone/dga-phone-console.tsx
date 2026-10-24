"use client";

import React, { useState } from "react";
import {
  PhoneSurface,
  PhonePanel,
  PhoneButton,
  PhoneTabs,
  PhoneThemePicker,
} from "../../../../components/phone/PhonePrimitives";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Users,
  Clock,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  X,
} from "lucide-react";
import {
  DIALOGUE_TREES,
  PhoneContact,
  VoicemailRecord,
  CallLogEntry,
  DialogueNode,
  normalizeContactStatus,
} from "@/lib/phone-data";
import { loadComms } from "@/lib/comms-client";
import type { DirectoryContact } from "@/lib/comms-client";
import { playDtmfTone, playRadioChirp } from "@/lib/phone-audio";
import {
  getDGAState,
  emitDgaEvent,
  recordVoicemailListened,
} from "@/lib/dga-store";
import { subscribeDgaEvent } from "@/lib/dga-events";

interface DgaPhoneConsoleProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
  activeContactIdOverride?: string | null;
}

export function DgaPhoneConsole({
  onOpenCase,
  onNavigateTab,
  activeContactIdOverride,
}: DgaPhoneConsoleProps) {
  const [subTab, setSubTab] = useState<
    "dialer" | "contacts" | "voicemail" | "history"
  >("contacts");
  const [dialNumber, setDialNumber] = useState("");
  const [activeCall, setActiveCall] = useState<{
    contact: PhoneContact;
    currentNode: DialogueNode;
    dialogueHistory: Array<{ speaker: string; text: string }>;
  } | null>(null);

  const [voicemails, setVoicemails] = useState<VoicemailRecord[]>([]);
  const [playingVmId, setPlayingVmId] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    void loadComms()
      .then((snapshot) => {
        // Both the connected API and the local simulator supply this directory.
        setContacts(
          snapshot.contacts.map((entry) => {
            const contact = entry as DirectoryContact & Partial<PhoneContact>;
            return {
              id: contact.id,
              name: contact.name,
              title: contact.title,
              department: contact.department,
              phoneExtension: contact.extension || contact.phoneExtension || "",
              status: contact.status as PhoneContact["status"],
              avatarInitials:
                contact.avatar ||
                contact.avatarInitials ||
                contact.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join(""),
              directDialable:
                contact.dialable ?? contact.directDialable ?? false,
              priorityLine: contact.priorityLine,
            };
          }),
        );
        setVoicemails(
          snapshot.messages
            .filter((item) => item.kind === "voicemail")
            .map((item) => ({
              id: item.id,
              contactId: item.contactId || "",
              callerName: item.senderName,
              callerTitle: item.recipient,
              timestamp: item.createdAt,
              duration: "0:30",
              durationSeconds: 30,
              isNew: !item.read,
              subject: item.subject,
              transcript: item.body,
              caseId: item.caseId,
            })),
        );
        setCallLogs(
          snapshot.messages
            .filter((item) => item.kind === "call")
            .map((item) => ({
              id: item.id,
              contactId: item.contactId || "",
              callerName: item.senderName,
              direction: item.folder === "sent" ? "outgoing" : "incoming",
              timestamp: item.createdAt,
              duration: "logged",
              caseId: item.caseId,
              summary: item.subject,
            })),
        );
      })
      .catch(() =>
        setActionNotice(
          "The contact directory could not be loaded from the database.",
        ),
      );

    // Dynamic listen for new voicemails generated from missed calls
    const unsubVm = subscribeDgaEvent("VOICEMAIL_RECEIVED", (evt) => {
      if (evt.payload) {
        setVoicemails((prev) => [
          evt.payload,
          ...prev.filter((v) => v.id !== evt.payload.id),
        ]);
      }
    });

    return () => {
      unsubVm();
    };
  }, []);

  // Auto-initiate call if activeContactIdOverride is supplied
  React.useEffect(() => {
    if (activeContactIdOverride) {
      const contact = contacts.find((c) => c.id === activeContactIdOverride);
      if (contact) {
        startCallWithContact(contact);
      }
    }
  }, [activeContactIdOverride, contacts]);

  const handleDialKeyPress = (key: string) => {
    playDtmfTone(key);
    setDialNumber((prev) => prev + key);
  };

  const handleClearDial = () => {
    setDialNumber("");
  };

  const startCallWithContact = (contact?: PhoneContact) => {
    if (!contact) {
      setActionNotice(
        "No matching extension is available. Choose a contact from the directory.",
      );
      return;
    }
    playRadioChirp();
    const tree = DIALOGUE_TREES[contact.id] || DIALOGUE_TREES["CONT-YUMI"];
    const rootNode = tree.root;

    setActiveCall({
      contact,
      currentNode: rootNode,
      dialogueHistory: [{ speaker: contact.name, text: rootNode.speakerText }],
    });

    // Add to call log
    setCallLogs((prev) => [
      {
        id: `CL-${Date.now()}`,
        contactId: contact.id,
        callerName: contact.name,
        direction: "outgoing",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: "Active",
        summary: `Connected with ${contact.name}`,
      },
      ...prev,
    ]);
  };

  const handleSelectDialogueOption = (option: DialogueNode["options"][0]) => {
    if (!activeCall) return;
    playRadioChirp();

    const contactId = activeCall.contact.id;
    const tree = DIALOGUE_TREES[contactId] || DIALOGUE_TREES["CONT-YUMI"];

    // Append player's choice to dialogue history
    const updatedHistory = [
      ...activeCall.dialogueHistory,
      { speaker: "Special Agent Jerome", text: option.text },
    ];

    // Execute option action if any
    if (option.action === "add_evidence" && option.actionPayload) {
      const state = getDGAState();
      const targetCase = state.cases.find(
        (c) => c.id === (option.actionPayload?.caseId || "INV-2026-0417"),
      );
      if (targetCase) {
        targetCase.evidence.unshift({
          id: `EV-CALL-${Date.now()}`,
          title: option.actionPayload.evidenceTitle || "CCTV Lead Item",
          category:
            (option.actionPayload.evidenceCategory as any) || "Digital Media",
          description:
            option.actionPayload.evidenceDesc ||
            "Evidence recovered via telephone debrief.",
          locationFound: "Embassy North Service Gate",
          dateRecovered: "2026-09-29 08:10 UTC",
          custodyStatus: "In DGA Custody",
        });
      }
      setActionNotice(
        option.actionPayload.message || "Evidence added to Evidence Vault!",
      );
      setTimeout(() => setActionNotice(null), 6000);
    } else if (option.action === "hang_up") {
      endActiveCall();
      return;
    }

    if (option.nextNodeId && tree[option.nextNodeId]) {
      const nextNode = tree[option.nextNodeId];
      updatedHistory.push({
        speaker: activeCall.contact.name,
        text: nextNode.speakerText,
      });

      setActiveCall({
        ...activeCall,
        currentNode: nextNode,
        dialogueHistory: updatedHistory,
      });
    } else {
      endActiveCall();
    }
  };

  const endActiveCall = () => {
    playRadioChirp();
    setActiveCall(null);
  };

  const handleTogglePlayVoicemail = (vm: VoicemailRecord) => {
    if (playingVmId === vm.id) {
      setPlayingVmId(null);
    } else {
      playDtmfTone("*");
      setPlayingVmId(vm.id);
      // Mark as read
      setVoicemails((prev) =>
        prev.map((item) =>
          item.id === vm.id ? { ...item, isNew: false } : item,
        ),
      );

      // Step 6: Listen to voicemail -> task created in active case
      void recordVoicemailListened(vm).then((createdTask) => {
        if (createdTask) {
          setActionNotice(
            `Directive derived from voicemail: "${createdTask.title}" created in Docket ${vm.caseId}!`,
          );
        }
      });
    }
  };

  return (
    <PhoneSurface aria-label="Agency phone console" className="agency-phone">
      <header className="agency-phone-header">
        <div>
          <span className="phone-overline">DGA · Secure voice / NODE 04</span>
          <h2>Agency phone</h2>
          <p>
            Encrypted communications · {contacts.length} registered extensions
          </p>
        </div>
        <PhoneThemePicker />
        {onNavigateTab && (
          <PhoneButton onClick={() => onNavigateTab("dashboard")}>
            Back to agency
          </PhoneButton>
        )}
      </header>
      <PhoneTabs
        value={subTab}
        onChange={(id) => setSubTab(id as any)}
        label="Agency phone sections"
        items={[
          { id: "contacts", label: "Directory", icon: Users },
          { id: "dialer", label: "Keypad", icon: Phone },
          {
            id: "voicemail",
            label: `Voicemail (${voicemails.filter((item) => item.isNew).length})`,
            icon: Voicemail,
          },
          { id: "history", label: "Call Log", icon: Clock },
        ]}
      />

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div
          role="status"
          className="agency-phone-notice bg-[var(--phone-surface-raised)] border-b border-[var(--phone-border)] px-4 py-2 text-xs text-[color:var(--phone-accent)]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[color:var(--phone-success)] shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          {onNavigateTab && (
            <PhoneButton
              onClick={() => onNavigateTab("investigation")}
              className="px-2 py-0.5 bg-[var(--phone-accent)] hover:brightness-110 text-[color:var(--phone-on-accent)] rounded text-[11px] font-bold cursor-pointer"
              tone="primary"
            >
              Open Evidence Vault →
            </PhoneButton>
          )}
          <PhoneButton
            aria-label="Dismiss phone notice"
            onClick={() => setActionNotice(null)}
          >
            <X size={16} />
          </PhoneButton>
        </div>
      )}

      {/* 2. ACTIVE CALL OVERLAY OR TAB CONTENT */}
      {activeCall ? (
        <PhonePanel className="agency-active-call flex flex-col phone-stack">
          {/* Active Call Header */}
          <div className="agency-call-header pb-4 border-b border-[var(--phone-border)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--phone-surface-raised)] border border-[var(--phone-accent)] flex items-center justify-center text-[color:var(--phone-accent)] font-bold text-base shadow-sm animate-pulse">
                {activeCall.contact.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[color:var(--phone-text)]">
                    {activeCall.contact.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--phone-success-soft)] text-[color:var(--phone-success)] border border-[var(--phone-success)] font-bold">
                    CONNECTED ENCRYPTED
                  </span>
                </div>
                <div className="text-xs text-[color:var(--phone-muted)]">
                  {activeCall.contact.title} •{" "}
                  {activeCall.contact.phoneExtension}
                </div>
              </div>
            </div>

            <PhoneButton
              onClick={endActiveCall}
              className="px-4 py-2 bg-[var(--phone-danger)] hover:bg-[var(--phone-danger)] text-[color:var(--phone-on-accent)] rounded text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              tone="danger"
            >
              <PhoneOff className="w-4 h-4" />
              <span>TERMINATE CALL</span>
            </PhoneButton>
          </div>

          {/* Dialogue Transcript Stream */}
          <div className="agency-call-transcript my-4 space-y-3 p-3 bg-[var(--phone-canvas)] border border-[var(--phone-border)] rounded">
            {activeCall.dialogueHistory.map((item, idx) => {
              const isAgent = item.speaker !== activeCall.contact.name;
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-mono text-[color:var(--phone-muted)] mb-1">
                    {item.speaker}
                  </span>
                  <div
                    className={`max-w-xl p-3 rounded text-xs leading-relaxed ${
                      isAgent
                        ? "bg-[var(--phone-surface-raised)] text-[color:var(--phone-text)] border border-[var(--phone-border)] font-medium"
                        : "bg-[var(--phone-surface)] text-[color:var(--phone-text)] border border-[var(--phone-border)] shadow-2xs"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Player Choices */}
          <div className="pt-2 border-t border-[var(--phone-border)] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--phone-accent)]">
              AVAILABLE RESPONSE OPTIONS:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {activeCall.currentNode.options.map((opt, i) => (
                <PhoneButton
                  key={i}
                  onClick={() => handleSelectDialogueOption(opt)}
                  className="w-full text-left p-3 rounded bg-[var(--phone-surface)] hover:bg-[var(--phone-surface-raised)] border border-[var(--phone-border)] hover:border-[var(--phone-accent)] text-xs text-[color:var(--phone-text)] flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="font-medium group-hover:text-[color:var(--phone-accent)]">
                    {opt.text}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[color:var(--phone-accent)] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </PhoneButton>
              ))}
            </div>
          </div>
        </PhonePanel>
      ) : (
        /* TAB CONTENT WHEN NOT IN AN ACTIVE CALL */
        <div className="agency-phone-content">
          {/* TAB: CONTACT DIRECTORY */}
          {subTab === "contacts" && (
            <div className="space-y-4">
              <div className="agency-directory-summary pb-2 border-b border-[var(--phone-border)]">
                <div className="text-xs text-[color:var(--phone-muted)]">
                  Click to initiate direct secure voice communication with
                  agency specialists and investigating officers.
                </div>
                <span className="text-xs font-mono font-bold text-[color:var(--phone-accent)]">
                  {contacts.length} Registered Extensions
                </span>
              </div>

              <div className="phone-contact-grid">
                {contacts.map((contact) => (
                  <PhonePanel key={contact.id} className="agency-contact">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--phone-surface-raised)] border border-[var(--phone-border)] flex items-center justify-center text-[color:var(--phone-accent)] font-bold text-xs shrink-0">
                        {contact.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[color:var(--phone-text)] truncate">
                            {contact.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--phone-surface-raised)] text-[color:var(--phone-accent)] border border-[var(--phone-border)] font-semibold">
                            {contact.phoneExtension}
                          </span>
                        </div>
                        <div className="text-xs text-[color:var(--phone-muted)] truncate">
                          {contact.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] mt-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              normalizeContactStatus(contact.status) ===
                              "AVAILABLE"
                                ? "bg-[var(--phone-success)]"
                                : normalizeContactStatus(contact.status) ===
                                    "BUSY"
                                  ? "bg-[var(--phone-warning)]"
                                  : normalizeContactStatus(contact.status) ===
                                      "IN FIELD"
                                    ? "bg-[var(--phone-accent)] animate-pulse"
                                    : normalizeContactStatus(contact.status) ===
                                        "OFF DUTY"
                                      ? "bg-[var(--phone-muted)]"
                                      : "bg-[var(--phone-danger)]"
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              normalizeContactStatus(contact.status) ===
                              "AVAILABLE"
                                ? "text-[color:var(--phone-success)]"
                                : normalizeContactStatus(contact.status) ===
                                    "BUSY"
                                  ? "text-[color:var(--phone-warning)]"
                                  : normalizeContactStatus(contact.status) ===
                                      "IN FIELD"
                                    ? "text-[color:var(--phone-accent)]"
                                    : normalizeContactStatus(contact.status) ===
                                        "OFF DUTY"
                                      ? "text-[color:var(--phone-muted)]"
                                      : "text-[color:var(--phone-danger)]"
                            }`}
                          >
                            {normalizeContactStatus(contact.status)}
                          </span>
                          <span className="text-[color:var(--phone-muted)]">
                            •
                          </span>
                          <span className="text-[color:var(--phone-muted)]">
                            {contact.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    <PhoneButton
                      onClick={() => startCallWithContact(contact)}
                      className="px-3 py-1.5 bg-[var(--phone-accent)] hover:brightness-110 text-[color:var(--phone-on-accent)] rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      tone="primary"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>CALL</span>
                    </PhoneButton>
                  </PhonePanel>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KEYPAD DIALER */}
          {subTab === "dialer" && (
            <div className="max-w-xs mx-auto py-6 space-y-4">
              {/* Dial Display Screen */}
              <div className="bg-[var(--phone-surface)] border border-[var(--phone-border)] rounded p-3 text-center space-y-1 shadow-2xs">
                <div className="text-[10px] font-mono text-[color:var(--phone-muted)] uppercase font-bold">
                  FEDERAL SECURE DIALER
                </div>
                <div className="text-2xl font-mono font-bold text-[color:var(--phone-text)] tracking-widest h-8 flex items-center justify-center">
                  {dialNumber || "ENTER EXT"}
                </div>
              </div>

              {/* 12-Key Pad */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "*",
                  "0",
                  "#",
                ].map((key) => (
                  <PhoneButton
                    key={key}
                    onClick={() => handleDialKeyPress(key)}
                    className="h-12 bg-[var(--phone-surface)] hover:bg-[var(--phone-surface-raised)] active:bg-[var(--phone-surface-hover)] border border-[var(--phone-border)] text-[color:var(--phone-text)] rounded font-mono font-bold text-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    {key}
                  </PhoneButton>
                ))}
              </div>

              {/* Call / Clear Buttons */}
              <div className="flex gap-2">
                <PhoneButton
                  onClick={handleClearDial}
                  className="flex-1 py-2.5 bg-[var(--phone-canvas)] hover:bg-[var(--phone-border)] border border-[var(--phone-border)] text-[color:var(--phone-muted)] rounded font-semibold text-xs cursor-pointer"
                >
                  CLEAR
                </PhoneButton>
                <PhoneButton
                  onClick={() => {
                    // Try to match dialed extension with contact
                    const matched = contacts.find(
                      (c) => c.phoneExtension.replace("x", "") === dialNumber,
                    );
                    startCallWithContact(matched);
                  }}
                  className="flex-1 py-2.5 bg-[var(--phone-success)] hover:bg-[var(--phone-success)] border border-[var(--phone-success)] text-[color:var(--phone-on-accent)] rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  tone="success"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>DIAL EXT</span>
                </PhoneButton>
              </div>
            </div>
          )}

          {/* TAB: VOICEMAIL INBOX */}
          {subTab === "voicemail" && (
            <div className="space-y-3">
              <div className="text-xs text-[color:var(--phone-muted)] pb-2 border-b border-[var(--phone-border)]">
                Archived audio recordings and automatic neural speech-to-text
                transcripts.
              </div>
              {!voicemails.length && (
                <p className="phone-empty">No voicemails yet.</p>
              )}

              {voicemails.map((vm) => {
                const isPlaying = playingVmId === vm.id;
                return (
                  <div
                    key={vm.id}
                    className={`bg-[var(--phone-surface)] border rounded p-4 space-y-3 transition-colors shadow-2xs ${
                      vm.isNew
                        ? "border-[var(--phone-accent)] bg-[var(--phone-accent-soft)]"
                        : "border-[var(--phone-border)]"
                    }`}
                  >
                    <div className="agency-voicemail-header">
                      <div className="flex items-center gap-2">
                        <Voicemail className="w-4 h-4 text-[color:var(--phone-accent)]" />
                        <span className="text-sm font-bold text-[color:var(--phone-text)]">
                          {vm.callerName}
                        </span>
                        {vm.isNew && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--phone-accent-soft)] text-[color:var(--phone-accent)] border border-[var(--phone-accent)]">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[color:var(--phone-muted)] font-mono">
                        {vm.timestamp} • Duration: {vm.duration}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-[color:var(--phone-accent)]">
                      {vm.subject}
                    </div>

                    {/* Audio Player Controls */}
                    <div className="agency-voicemail-controls bg-[var(--phone-canvas)] border border-[var(--phone-border)] rounded p-2.5">
                      <PhoneButton
                        onClick={() => handleTogglePlayVoicemail(vm)}
                        className="px-3 py-1 bg-[var(--phone-accent)] hover:brightness-110 text-[color:var(--phone-on-accent)] rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        tone="primary"
                      >
                        {isPlaying ? (
                          <Square className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{isPlaying ? "PAUSE" : "PLAY AUDIO"}</span>
                      </PhoneButton>

                      {/* Simulated Audio Waveform Bars */}
                      <div className="flex items-center gap-1">
                        {[
                          12, 24, 18, 36, 28, 44, 20, 32, 14, 26, 40, 16, 22,
                        ].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded-full ${
                              isPlaying
                                ? "bg-[var(--phone-accent)] animate-pulse"
                                : "bg-[var(--phone-border)]"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-[11px] font-mono text-[color:var(--phone-accent)] font-semibold">
                        {isPlaying ? "PLAYING 44.1kHz PCM" : vm.duration}
                      </div>
                    </div>

                    {/* Neural Speech-To-Text Transcript */}
                    <div className="bg-[var(--phone-canvas)] p-3 rounded border border-[var(--phone-border)] text-xs text-[color:var(--phone-text)] leading-relaxed">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--phone-accent)] block mb-1">
                        TRANSCRIPTION:
                      </span>
                      {vm.transcript}
                    </div>

                    {/* Quick Call Back Button */}
                    <div className="agency-voicemail-footer phone-row pt-1">
                      {vm.caseId && (
                        <span className="text-[10px] font-mono text-[color:var(--phone-muted)]">
                          Linked Docket: {vm.caseId}
                        </span>
                      )}
                      <PhoneButton
                        onClick={() => {
                          const contact = contacts.find(
                            (c) => c.id === vm.contactId,
                          );
                          startCallWithContact(contact);
                        }}
                        className="px-2.5 py-1 bg-[var(--phone-surface-raised)] hover:bg-[var(--phone-surface-hover)] border border-[var(--phone-border)] text-[color:var(--phone-accent)] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <PhoneCall className="w-3 h-3 text-[color:var(--phone-accent)]" />
                        <span>CALL BACK NOW</span>
                      </PhoneButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: CALL HISTORY LOG */}
          {subTab === "history" && (
            <div
              className="agency-history bg-[var(--phone-surface)] border border-[var(--phone-border)] rounded shadow-2xs"
              role="region"
              aria-label="Call history"
              tabIndex={0}
            >
              <table className="phone-table w-full text-left text-xs">
                <thead className="bg-[var(--phone-canvas)] text-[color:var(--phone-muted)] text-[10px] font-bold uppercase border-b border-[var(--phone-border)]">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Call Brief & Notes</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--phone-border)] text-[color:var(--phone-text)]">
                  {callLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--phone-canvas)]">
                      <td className="p-3">
                        {log.direction === "missed" ? (
                          <span className="text-[color:var(--phone-danger)] flex items-center gap-1 font-bold">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>MISSED</span>
                          </span>
                        ) : log.direction === "incoming" ? (
                          <span className="text-[color:var(--phone-success)] flex items-center gap-1 font-bold">
                            <PhoneIncoming className="w-3.5 h-3.5" />
                            <span>ANSWERED</span>
                          </span>
                        ) : (
                          <span className="text-[color:var(--phone-accent)] flex items-center gap-1 font-bold">
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                            <span>OUTGOING</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-[color:var(--phone-text)]">
                        {log.callerName}
                      </td>
                      <td className="p-3 font-mono text-[color:var(--phone-muted)]">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-mono">{log.duration}</td>
                      <td className="p-3 text-[color:var(--phone-text)]">
                        {log.summary}
                      </td>
                      <td className="p-3 text-right">
                        <PhoneButton
                          onClick={() => {
                            const c = contacts.find(
                              (item) => item.id === log.contactId,
                            );
                            startCallWithContact(c);
                          }}
                          className="px-2 py-1 bg-[var(--phone-surface-raised)] hover:bg-[var(--phone-surface-hover)] text-[color:var(--phone-accent)] rounded text-[11px] font-semibold cursor-pointer border border-[var(--phone-border)]"
                        >
                          Redial
                        </PhoneButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PhoneSurface>
  );
}
