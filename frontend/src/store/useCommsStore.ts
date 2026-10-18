import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_EMAILS,
  DEFAULT_PLAYER_EMAIL_ACCOUNTS,
  AUREMAIL_DIRECTORY,
  type AureMailAccount,
  type AureMailDirectoryContact,
  type EmailAttachment,
  type EmailItem,
} from '../data/commsData';

export interface ChannelItem {
  id: string;
  name: string;
  readOnly?: boolean;
  desc?: string;
  npcKey?: string;
  title?: string;
  req?: string;
}

export interface ChatMessage {
  id: string | number;
  user: string;
  team: string;
  text: string;
  time: string;
}

export interface EmailDraft {
  id: string;
  fromAddress: string;
  toAddress: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  threadId?: string;
  parentId?: string;
  updatedAt: string;
  attachments: EmailAttachment[];
}

export interface SendEmailPayload {
  fromAddress?: string;
  toAddress: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  parentId?: string;
  threadId?: string;
  playerClearance?: number;
  npcTrustMap?: Record<string, number>;
}

export interface SendEmailResult {
  ok: boolean;
  reason?: string;
  deliveryStatus: 'delivered' | 'sent' | 'blocked_clearance' | 'blocked_trust' | 'failed';
  sentMessage?: EmailItem;
  autoReplyMessage?: EmailItem;
}

function buildHybridReplyForContact(
  contact: AureMailDirectoryContact | undefined,
  recipientInput: string,
  subject: string,
  body: string,
  fromAccount: AureMailAccount,
  threadId: string,
  parentId: string
): EmailItem {
  const lowerBody = `${subject} ${body}`.toLowerCase();
  const replyId = `MSG-RPL-${Date.now().toString().slice(-5)}-${Math.floor(10 + Math.random() * 89)}`;
  const cleanSubj = subject.replace(/^re:\s*/i, '').trim();

  if (contact) {
    let replyBody = '';
    const attachments: EmailAttachment[] = [];

    if (contact.id === 'dir-cyacademy-reg' || contact.address === 'registrar@cyacademy.edu') {
      replyBody = `Automated & Clerk-Verified Response — Cyacademy Registration Office:

We have logged your transmission regarding "${cleanSubj}" from ${fromAccount.address} (${fromAccount.maid}).
${
  lowerBody.includes('transcript') || lowerBody.includes('schedule') || lowerBody.includes('enroll')
    ? 'Your provisional academic standing is active and synchronized with your Aura Passport. Course and seminar credits will automatically post to your scholarly transcript as you complete verified academic assignments.'
    : 'Your academic correspondence has been appended to your permanent student file under Directive 14-B.'
}

— Office of the Registrar (Seal #CYA-101)`;
    } else if (contact.id === 'dir-cyacademy-housing' || contact.address === 'housing@cyacademy.edu') {
      replyBody = `Cyacademy Residential Services — Unit 4B Operations Desk:

Your housing correspondence ("${cleanSubj}") has been recorded against Suite 4B.
${
  lowerBody.includes('upgrade') || lowerBody.includes('comfort') || lowerBody.includes('repair')
    ? 'Suite upgrades purchased in HOMECRAFT are permanently registered to your lease and increase your residential comfort rating.'
    : 'Your Unit 4B digital keycard remains active. Please maintain residential quiet hours during Sector 4 curfews.'
}

— Residential Services Dispatch`;
    } else if (contact.id === 'dir-civic-bureau' || contact.address === 'registry@orynvell.gov') {
      replyBody = `Aureline Civic Identity Bureau — Official Registry Receipt:

Citizen MAID: ${fromAccount.maid}
Sender Account: ${fromAccount.address}

Your filing regarding "${cleanSubj}" has been cryptographically signed and indexed in the Orynvell Population Registry. All linked institutional accounts (@auremail.aure, @cyacademy.edu, @worknet.aure, @dga.gov, @faithmed.aure) remain in verified standing.

— Orynvell Civic Identity Bureau`;
    } else if (contact.id === 'dir-faith-intake' || contact.address === 'intake@faithmed.aure' || contact.npcKey === 'ilyra') {
      replyBody = `Faith Medical Group — Clinical Triage & Telemetry Desk:

Thank you for contacting Faith Medical Group regarding "${cleanSubj}".
${
  lowerBody.includes('veilwilt') || lowerBody.includes('scan') || lowerBody.includes('aura') || lowerBody.includes('symptom')
    ? 'Dr. Miracle Jerome has reviewed your note. If you are experiencing Veilwilt symptoms or aura desynchronization, please complete a clinical diagnostic scan in the Faith Medical Portal and apply the prescribed treatment regimen.'
    : 'Your clinical correspondence has been linked to your MAID medical chart.'
}

— Dr. Miracle Jerome, Chief Aura Diagnostician (MAID-OR-00000002)`;
    } else if (contact.id === 'dir-dga-dispatch' || contact.address === 'dispatch@dga.gov' || contact.address === 'j.vance@dga.gov') {
      replyBody = `DGAOS / TRACE Forensic Intake Desk — Directive 14-B:

Field transmission "${cleanSubj}" received from ${fromAccount.address} and logged in the DGA evidentiary ledger.
${
  lowerBody.includes('case') || lowerBody.includes('evidence') || lowerBody.includes('anomaly') || lowerBody.includes('prism')
    ? 'Lead Investigator Dr. Julian Paul Vance has cross-referenced your report with active TRACE forensic files. Continue verifying primary evidence in DGAOS before executing field warrants.'
    : 'Continue monitoring sector anomalies and report any unauthorized PRISM signatures through DGAOS.'
}

— DGA Field Dispatch (Seal #DGA-105)`;
    } else if (contact.npcKey === 'aelita') {
      replyBody = `Hey! Thanks for writing back about "${cleanSubj}".

${
  lowerBody.includes('harmonic') || lowerBody.includes('lab') || lowerBody.includes('trace') || lowerBody.includes('frequency')
    ? 'I cross-checked the 88.2 MHz harmonic waveform with the subterranean relay—the signal definitely originates beneath the Old Factory Ward. Let’s keep comparing notes in SpellForge and Lab 4!'
    : 'I’m in the subterranean lab running resonance checks with Jeremie right now. Ping me anytime you find new archive fragments!'
}

— Aelita Schaeffer`;
    } else if (contact.npcKey === 'jeremie') {
      replyBody = `Got your email on "${cleanSubj}".

${
  lowerBody.includes('firewall') || lowerBody.includes('code') || lowerBody.includes('spellforge') || lowerBody.includes('mod')
    ? 'I just finished calibrating the compiler diagnostics in Lab 4. If you combine Firewall.mod or Routing.mod in SpellForge, watch the cooldown telemetry so the relay stays stable.'
    : 'System diagnostics look clean on my end. Let me know if you need a packet trace or decryption assist!'
}

— Jeremie Belpois (Cyacademy Lab 4)`;
    } else if (contact.npcKey === 'voss') {
      replyBody = `Colleague,

I reviewed your message concerning "${cleanSubj}". Maintain strict telemetry discipline when examining PRISM anomalies or Sub-Conduit bleed. Bring any verified spectral logs directly to the Research Division.

— Dr. Sharon Voss, Senior Researcher`;
    } else if (contact.npcKey === 'rook') {
      replyBody = `Scholar,

The Office of the Dean of Students acknowledges your message regarding "${cleanSubj}". Focus on your orientation objectives, respect campus curfew advisories, and report any OS irregularities immediately.

— Dean Cassian Rook`;
    } else {
      replyBody = `Hello,

Thank you for your message regarding "${cleanSubj}". I have received your correspondence at ${contact.address} (${contact.institution}) and updated our shared notes.

Best regards,
${contact.name}
${contact.role}`;
    }

    return {
      id: replyId,
      threadId,
      parentId,
      sender: contact.name,
      senderAddress: contact.address,
      senderMaid: contact.maid,
      recipient: fromAccount.label,
      recipientAddress: fromAccount.address,
      faction: contact.faction,
      subject: `Re: ${cleanSubj}`,
      time: 'JUST NOW',
      timestamp: new Date().toISOString(),
      read: false,
      folder: 'inbox',
      deliveryStatus: 'delivered',
      verifiedSender: contact.verified,
      institutionalSeal: contact.category === 'institution' ? `${contact.faction.toUpperCase()}-VERIFIED` : undefined,
      labels: [contact.category === 'institution' ? 'Official' : 'Personal', 'Reply'],
      npcKey: contact.npcKey,
      attachment: null,
      attachments,
      body: replyBody,
      auditLog: [`Verified reply from ${contact.address} (${contact.maid || 'Directory Verified'})`],
    };
  }

  return {
    id: replyId,
    threadId,
    parentId,
    sender: recipientInput,
    senderAddress: recipientInput.includes('@') ? recipientInput : `${recipientInput.toLowerCase().replace(/[^a-z0-9]/g, '.')}@auremail.aure`,
    recipient: fromAccount.label,
    recipientAddress: fromAccount.address,
    faction: 'AureMail Relay',
    subject: `Re: ${cleanSubj}`,
    time: 'JUST NOW',
    timestamp: new Date().toISOString(),
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    labels: ['Reply'],
    attachment: null,
    attachments: [],
    body: `AureMail Relay Delivery Confirmation & Response:

Your message regarding "${cleanSubj}" was delivered to ${recipientInput}. The recipient has acknowledged receipt via the Aureline Municipal Relay.`,
  };
}

export interface CommsState {
  emails: EmailItem[];
  playerAccounts: AureMailAccount[];
  activeAccountAddress: string; // 'ALL' or specific AureMailAccount.address
  selectedSenderAddress: string;
  starredEmailIds: string[];
  archivedEmailIds: string[];
  trashedEmailIds: string[];
  readEmailIds: string[];
  savedAttachmentIds: string[];
  submittedFormIds: string[];
  blockedAddresses: string[];
  reportedEmailIds: string[];
  drafts: EmailDraft[];
  sortOrder: 'newest' | 'oldest' | 'unread';

  tier0Channels: ChannelItem[];
  tier1Channels: ChannelItem[];
  tier2Channels: ChannelItem[];
  directs: ChannelItem[];
  lockedChannels: ChannelItem[];
  corruptedChannels: string[];
  investigationFlags: number;
  encryptionActive: boolean;
  messages: Record<string, ChatMessage[]>;

  addChatMessage: (key: string, entry: ChatMessage) => void;
  addEmail: (email: any) => void;
  toggleEncryption: () => void;
  incrementInvestigationFlags: () => void;
  purgeChannelCorruption: (channelId: string) => void;

  // AureMail Actions (Decisions 006-011)
  setActiveAccountAddress: (address: string) => void;
  setSelectedSenderAddress: (address: string) => void;
  updateAccountStatus: (address: string, status: 'active' | 'provisional' | 'suspended' | 'revoked') => void;
  issueInstitutionalAccount: (account: AureMailAccount) => void;
  toggleStarEmail: (id: string) => void;
  toggleArchiveEmail: (id: string) => void;
  moveToTrashEmail: (id: string) => void;
  restoreEmail: (id: string) => void;
  markEmailRead: (id: string, read?: boolean) => void;
  bulkUpdateEmails: (ids: string[], action: 'read' | 'unread' | 'star' | 'archive' | 'trash' | 'restore') => void;
  setSortOrder: (order: 'newest' | 'oldest' | 'unread') => void;
  saveDraft: (draft: Partial<EmailDraft> & { id?: string }) => EmailDraft;
  deleteDraft: (id: string) => void;
  sendEmail: (payload: SendEmailPayload) => SendEmailResult;
  replyToEmail: (
    parentId: string,
    body: string,
    options?: { replyAll?: boolean; fromAddress?: string; playerClearance?: number; npcTrustMap?: Record<string, number> }
  ) => SendEmailResult;
  forwardEmail: (
    parentId: string,
    toAddress: string,
    note: string,
    fromAddress?: string,
    playerClearance?: number
  ) => SendEmailResult;
  saveAttachmentToVault: (emailId: string, attId: string) => { ok: boolean; alreadySaved?: boolean; fileName?: string };
  submitAttachmentForm: (
    emailId: string,
    attId: string,
    responseNotes?: string
  ) => { ok: boolean; alreadySubmitted?: boolean; replyEmail?: EmailItem };
  toggleBlockAddress: (address: string) => void;
  reportSuspiciousEmail: (emailId: string) => void;
}

export const useCommsStore = create<CommsState>()(
  persist(
    (set, get) => ({
      // Seeded institutional & personal dispatches
      emails: INITIAL_EMAILS,
      playerAccounts: DEFAULT_PLAYER_EMAIL_ACCOUNTS,
      activeAccountAddress: 'ALL',
      selectedSenderAddress: DEFAULT_PLAYER_EMAIL_ACCOUNTS[0].address,
      starredEmailIds: [],
      archivedEmailIds: [],
      trashedEmailIds: [],
      readEmailIds: [],
      savedAttachmentIds: [],
      submittedFormIds: [],
      blockedAddresses: [],
      reportedEmailIds: [],
      drafts: [],
      sortOrder: 'newest',

      // ── Comms Portal Channel Tiers ──
      tier0Channels: [
        { id: 'city-alerts', name: 'Municipal Hazards & Curfew', readOnly: true, desc: 'City-wide broadcast feed for curfews and hazard warnings.' },
        { id: 'dga-bulletins', name: 'DGA Security Bulletins', readOnly: true, desc: 'Official DGA surveillance and enforcement broadcasts.' }
      ],

      tier1Channels: [
        { id: 'glassline-district', name: 'Glassline Resident Hub', desc: 'Civic forum for Glassline District residents.' },
        { id: 'cyacademy-core', name: 'Cyacademy Labs & Core', desc: 'Student discussion channel for tech & lab studies.' },
        { id: 'faith-medical-hub', name: 'Faith Medical Triage Network', desc: 'Patient telemetry and intake discussion.' }
      ],

      tier2Channels: [
        { id: 'squad-ops-ironspire', name: 'Operation Ironspire Squad', desc: 'Tactical channel for Commander Halvorn intel heist.' },
        { id: 'subconduit-sweep', name: 'Sub-Conduit Patrol Group', desc: 'Temporary network sweep channel for DGA ops.' }
      ],

      directs: [
        { id: 'dm:voss', name: 'Dr. Voss', npcKey: 'voss', title: 'Cyacademy Senior Researcher' },
        { id: 'dm:riven', name: 'Riven', npcKey: 'riven', title: 'Netrunner Specialist' },
        { id: 'dm:odd', name: 'Odd', npcKey: 'odd', title: 'Student Tactician' },
        { id: 'dm:aelita', name: 'Aelita', npcKey: 'aelita', title: 'Core Specialist' },
        { id: 'dm:jeremie', name: 'Jeremie', npcKey: 'jeremie', title: 'Systems Engineer' }
      ],

      lockedChannels: [
        { id: 'lock:black-market', name: 'Black Market Underground Relay', req: 'ACCESS DENIED: INSUFFICIENT CITIZEN TIER' },
        { id: 'lock:high-command', name: 'DGA High Command Subnet', req: 'ACCESS DENIED: LEVEL 3 OS CLEARANCE REQUIRED' },
        { id: 'lock:factory-ward', name: 'Old Factory Ward Bleed Channel', req: 'ACCESS DENIED: VEILWILT RESISTANCE REQUIRED' },
        { id: 'lock:oracle-main', name: 'ORACLE-9 Mainframe Core', req: 'ACCESS DENIED: REPUTATION TIER TOO LOW' }
      ],

      corruptedChannels: ['glassline-district'],
      investigationFlags: 0,
      encryptionActive: false,

      messages: {
        'city-alerts': [
          { id: 'ca-1', user: 'Municipal Warden', team: 'System', text: 'NOTICE: Sector 4 curfew active from 22:00 to 06:00. Maintain citizen clearance.', time: '08:00 AM' }
        ],
        'dga-bulletins': [
          { id: 'db-1', user: 'Director Vane', team: 'DGA', text: 'BULLETIN: Unregistered encrypted packets detected in Sub-Aureline. DGA wardens active.', time: '08:15 AM' }
        ],
        'glassline-district': [
          { id: 'gl-1', user: 'Resident-99', team: 'Citizen', text: 'D̶a̶t̶a̶ ̶b̶l̶e̶e̶d̶ detected near tram corridor! System noise glitching feeds.', time: '08:30 AM' }
        ],
        'cyacademy-core': [
          { id: 'c-1', user: 'Aelita', team: 'Students', text: 'Notice any energy fluctuations near Lab 4?', time: '09:15 AM' }
        ],
        'faith-medical-hub': [
          { id: 'fm-1', user: 'Dr. Ilyra Saint', team: 'Medical', text: 'Intake patients experiencing Veilwilt: report to Marlowe Springs immediately.', time: '08:45 AM' }
        ],
        'squad-ops-ironspire': [
          { id: 'so-1', user: 'Drift', team: 'Tactical', text: 'Squad ready for Ironspire intel extraction. Keep channel clear of warden bots.', time: '09:00 AM' }
        ],
        'subconduit-sweep': [
          { id: 'sc-1', user: 'Agent Vance', team: 'DGA', text: 'Sweeping conduit gateways. Report unauthorized PRISM signatures.', time: '09:05 AM' }
        ],
        'dm:voss': [ { id: 'dmv-1', user: 'Dr. Voss', team: 'Direct', text: 'Keep your relay sanitized. Report any PRISM anomalies immediately.', time: '09:22 AM' } ],
        'dm:riven': [ { id: 'dmr-1', user: 'Riven', team: 'Direct', text: 'Got a shortcut to the factory? Meet near Block C stairs.', time: '09:05 AM' } ],
        'dm:odd': [ { id: 'dmo-1', user: 'Odd', team: 'Direct', text: 'Heard a rumor: cafeteria pie heals +5 aura. Scientific.', time: '08:55 AM' } ],
        'dm:aelita': [ { id: 'dma-1', user: 'Aelita', team: 'Direct', text: 'I found a strange frequency trace in the subterranean lab. Can you analyze it?', time: '09:12 AM' } ],
        'dm:jeremie': [ { id: 'dmj-1', user: 'Jeremie', team: 'Direct', text: 'System diagnostics look stable for now. Let me know if you need code patches.', time: '09:18 AM' } ]
      },

      addChatMessage: (key, entry) => {
        const current = get().messages[key] || [];
        set({ messages: { ...get().messages, [key]: [...current, entry] } });
      },

      addEmail: (email) => {
        const current = get().emails || [];
        const normalized: EmailItem = {
          threadId: email.threadId || email.id || `THR-${Date.now()}`,
          folder: email.folder || 'inbox',
          deliveryStatus: email.deliveryStatus || 'delivered',
          read: Boolean(email.read),
          attachment: email.attachment ?? null,
          attachments: Array.isArray(email.attachments) ? email.attachments : [],
          ...email,
        };
        set({ emails: [normalized, ...current] });
      },

      toggleEncryption: () => set((s) => ({ encryptionActive: !s.encryptionActive })),

      incrementInvestigationFlags: () => set((s) => ({ investigationFlags: s.investigationFlags + 1 })),

      purgeChannelCorruption: (channelId) => set((s) => ({
        corruptedChannels: s.corruptedChannels.filter((c) => c !== channelId)
      })),

      setActiveAccountAddress: (address) => {
        const accounts = get().playerAccounts || DEFAULT_PLAYER_EMAIL_ACCOUNTS;
        const matched = accounts.find((a) => a.address.toLowerCase() === address.toLowerCase() && a.status === 'active');
        set({
          activeAccountAddress: address,
          selectedSenderAddress: matched ? matched.address : get().selectedSenderAddress,
        });
      },

      setSelectedSenderAddress: (address) => set({ selectedSenderAddress: address }),

      updateAccountStatus: (address, status) =>
        set((s) => ({
          playerAccounts: s.playerAccounts.map((acc) =>
            acc.address.toLowerCase() === address.toLowerCase() ? { ...acc, status } : acc
          ),
        })),

      issueInstitutionalAccount: (account) =>
        set((s) => {
          const exists = s.playerAccounts.some((a) => a.address.toLowerCase() === account.address.toLowerCase());
          if (exists) {
            return {
              playerAccounts: s.playerAccounts.map((a) =>
                a.address.toLowerCase() === account.address.toLowerCase() ? { ...a, ...account, status: 'active', verified: true } : a
              ),
            };
          }
          return { playerAccounts: [...s.playerAccounts, { ...account, verified: true }] };
        }),

      toggleStarEmail: (id) =>
        set((s) => ({
          starredEmailIds: s.starredEmailIds.includes(id)
            ? s.starredEmailIds.filter((item) => item !== id)
            : [...s.starredEmailIds, id],
        })),

      toggleArchiveEmail: (id) =>
        set((s) => {
          const isArchived = s.archivedEmailIds.includes(id);
          return {
            archivedEmailIds: isArchived
              ? s.archivedEmailIds.filter((item) => item !== id)
              : [...s.archivedEmailIds, id],
            trashedEmailIds: s.trashedEmailIds.filter((item) => item !== id),
          };
        }),

      moveToTrashEmail: (id) =>
        set((s) => ({
          trashedEmailIds: s.trashedEmailIds.includes(id) ? s.trashedEmailIds : [...s.trashedEmailIds, id],
          archivedEmailIds: s.archivedEmailIds.filter((item) => item !== id),
        })),

      restoreEmail: (id) =>
        set((s) => ({
          trashedEmailIds: s.trashedEmailIds.filter((item) => item !== id),
          archivedEmailIds: s.archivedEmailIds.filter((item) => item !== id),
        })),

      markEmailRead: (id, read = true) =>
        set((s) => ({
          readEmailIds: read
            ? Array.from(new Set([...s.readEmailIds, id]))
            : s.readEmailIds.filter((item) => item !== id),
          emails: s.emails.map((m) => (m.id === id ? { ...m, read } : m)),
        })),

      bulkUpdateEmails: (ids, action) =>
        set((s) => {
          const idSet = new Set(ids);
          if (action === 'read') {
            return {
              readEmailIds: Array.from(new Set([...s.readEmailIds, ...ids])),
              emails: s.emails.map((m) => (idSet.has(m.id) ? { ...m, read: true } : m)),
            };
          }
          if (action === 'unread') {
            return {
              readEmailIds: s.readEmailIds.filter((id) => !idSet.has(id)),
              emails: s.emails.map((m) => (idSet.has(m.id) ? { ...m, read: false } : m)),
            };
          }
          if (action === 'star') {
            return {
              starredEmailIds: Array.from(new Set([...s.starredEmailIds, ...ids])),
            };
          }
          if (action === 'archive') {
            return {
              archivedEmailIds: Array.from(new Set([...s.archivedEmailIds, ...ids])),
              trashedEmailIds: s.trashedEmailIds.filter((id) => !idSet.has(id)),
            };
          }
          if (action === 'trash') {
            return {
              trashedEmailIds: Array.from(new Set([...s.trashedEmailIds, ...ids])),
              archivedEmailIds: s.archivedEmailIds.filter((id) => !idSet.has(id)),
            };
          }
          if (action === 'restore') {
            return {
              trashedEmailIds: s.trashedEmailIds.filter((id) => !idSet.has(id)),
              archivedEmailIds: s.archivedEmailIds.filter((id) => !idSet.has(id)),
            };
          }
          return s;
        }),

      setSortOrder: (order) => set({ sortOrder: order }),

      saveDraft: (draftInput) => {
        const state = get();
        const id = draftInput.id || `DRF-${Date.now().toString().slice(-5)}`;
        const existing = state.drafts.find((d) => d.id === id);
        const saved: EmailDraft = {
          id,
          fromAddress: draftInput.fromAddress || existing?.fromAddress || state.selectedSenderAddress,
          toAddress: draftInput.toAddress ?? existing?.toAddress ?? '',
          cc: draftInput.cc ?? existing?.cc ?? '',
          bcc: draftInput.bcc ?? existing?.bcc ?? '',
          subject: draftInput.subject ?? existing?.subject ?? '',
          body: draftInput.body ?? existing?.body ?? '',
          threadId: draftInput.threadId ?? existing?.threadId,
          parentId: draftInput.parentId ?? existing?.parentId,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: draftInput.attachments ?? existing?.attachments ?? [],
        };
        set({
          drafts: existing
            ? state.drafts.map((d) => (d.id === id ? saved : d))
            : [saved, ...state.drafts],
        });
        return saved;
      },

      deleteDraft: (id) =>
        set((s) => ({
          drafts: s.drafts.filter((d) => d.id !== id),
        })),

      sendEmail: (payload) => {
        const state = get();
        const accounts = state.playerAccounts || DEFAULT_PLAYER_EMAIL_ACCOUNTS;
        const fromAccount =
          accounts.find((a) => a.address.toLowerCase() === (payload.fromAddress || state.selectedSenderAddress).toLowerCase()) ||
          accounts[0];

        if (!fromAccount || fromAccount.status !== 'active') {
          return {
            ok: false,
            deliveryStatus: 'failed',
            reason: `Sender account ${fromAccount?.address || 'unknown'} is currently ${fromAccount?.status || 'unavailable'}.`,
          };
        }

        const rawTo = (payload.toAddress || '').trim();
        const cleanSubj = (payload.subject || '').trim();
        const cleanBody = (payload.body || '').trim();
        if (!rawTo || !cleanSubj || !cleanBody) {
          return {
            ok: false,
            deliveryStatus: 'failed',
            reason: 'Recipient, subject, and message body are required.',
          };
        }

        // Directory lookup by address, name, or MAID
        const lowerTo = rawTo.toLowerCase();
        const matchedContact = AUREMAIL_DIRECTORY.find(
          (c) =>
            c.address.toLowerCase() === lowerTo ||
            c.name.toLowerCase() === lowerTo ||
            (c.maid && c.maid.toLowerCase() === lowerTo) ||
            c.name.toLowerCase().includes(lowerTo)
        );

        const resolvedToAddress = matchedContact
          ? matchedContact.address
          : rawTo.includes('@')
          ? rawTo
          : `${rawTo.toLowerCase().replace(/[^a-z0-9]/g, '.')}@auremail.aure`;
        const resolvedToName = matchedContact ? matchedContact.name : rawTo;

        const clearance = payload.playerClearance ?? 1;
        if (matchedContact && matchedContact.requiredClearance > clearance) {
          const blockedMsg: EmailItem = {
            id: `MSG-OUT-${Date.now().toString().slice(-5)}`,
            threadId: payload.threadId || `THR-${Date.now().toString().slice(-5)}`,
            parentId: payload.parentId,
            sender: `${fromAccount.label} (${fromAccount.address})`,
            senderAddress: fromAccount.address,
            senderMaid: fromAccount.maid,
            recipient: resolvedToName,
            recipientAddress: resolvedToAddress,
            faction: fromAccount.institution,
            subject: cleanSubj,
            time: 'OUTBOX · HELD',
            timestamp: new Date().toISOString(),
            read: true,
            folder: 'outbox',
            deliveryStatus: 'blocked_clearance',
            verifiedSender: true,
            labels: ['Outbox', 'Clearance Held'],
            attachment: null,
            attachments: payload.attachments || [],
            body: cleanBody,
            auditLog: [
              `Delivery held: Recipient ${resolvedToName} (${resolvedToAddress}) requires Level ${matchedContact.requiredClearance} OS Clearance (Current: Level ${clearance}).`,
            ],
          };
          set({
            emails: [blockedMsg, ...state.emails],
            readEmailIds: Array.from(new Set([...state.readEmailIds, blockedMsg.id])),
          });
          return {
            ok: false,
            deliveryStatus: 'blocked_clearance',
            reason: `Delivery held in Outbox: ${resolvedToName} requires Level ${matchedContact.requiredClearance} Clearance.`,
            sentMessage: blockedMsg,
          };
        }

        if (matchedContact?.requiredTrust && payload.npcTrustMap && matchedContact.npcKey) {
          const currentTrust = payload.npcTrustMap[matchedContact.npcKey] ?? 50;
          if (currentTrust < matchedContact.requiredTrust) {
            const blockedTrustMsg: EmailItem = {
              id: `MSG-OUT-${Date.now().toString().slice(-5)}`,
              threadId: payload.threadId || `THR-${Date.now().toString().slice(-5)}`,
              parentId: payload.parentId,
              sender: `${fromAccount.label} (${fromAccount.address})`,
              senderAddress: fromAccount.address,
              senderMaid: fromAccount.maid,
              recipient: resolvedToName,
              recipientAddress: resolvedToAddress,
              faction: fromAccount.institution,
              subject: cleanSubj,
              time: 'OUTBOX · HELD',
              timestamp: new Date().toISOString(),
              read: true,
              folder: 'outbox',
              deliveryStatus: 'blocked_trust',
              verifiedSender: true,
              labels: ['Outbox', 'Trust Gate'],
              attachment: null,
              attachments: payload.attachments || [],
              body: cleanBody,
              auditLog: [
                `Delivery held: ${resolvedToName} requires ${matchedContact.requiredTrust} Trust standing before accepting direct mail.`,
              ],
            };
            set({
              emails: [blockedTrustMsg, ...state.emails],
              readEmailIds: Array.from(new Set([...state.readEmailIds, blockedTrustMsg.id])),
            });
            return {
              ok: false,
              deliveryStatus: 'blocked_trust',
              reason: `Delivery held in Outbox: ${resolvedToName} requires ${matchedContact.requiredTrust} Trust standing.`,
              sentMessage: blockedTrustMsg,
            };
          }
        }

        const threadId = payload.threadId || `THR-${Date.now().toString().slice(-5)}`;
        const sentId = `MSG-SNT-${Date.now().toString().slice(-5)}-${Math.floor(10 + Math.random() * 89)}`;

        // Sanitize outgoing attachments: outgoing files are never claimable rewards
        const safeAttachments: EmailAttachment[] = (payload.attachments || []).map((att, idx) => ({
          ...att,
          id: att.id || `att-out-${idx}`,
          isReward: false,
          amount: 0,
          xp: 0,
          claimed: false,
        }));

        const sentMessage: EmailItem = {
          id: sentId,
          threadId,
          parentId: payload.parentId,
          sender: `${fromAccount.label}`,
          senderAddress: fromAccount.address,
          senderMaid: fromAccount.maid,
          recipient: resolvedToName,
          recipientAddress: resolvedToAddress,
          cc: payload.cc?.filter(Boolean),
          bcc: payload.bcc?.filter(Boolean),
          faction: fromAccount.institution,
          subject: cleanSubj,
          time: 'JUST NOW',
          timestamp: new Date().toISOString(),
          read: true,
          folder: 'sent',
          deliveryStatus: 'sent',
          verifiedSender: true,
          labels: ['Sent', fromAccount.accountType.toUpperCase()],
          attachment: null,
          attachments: safeAttachments,
          body: fromAccount.signature ? `${cleanBody}\n\n--\n${fromAccount.signature}` : cleanBody,
          auditLog: [
            `Transmitted from ${fromAccount.address} (${fromAccount.maid}) to ${resolvedToAddress} at ${new Date().toISOString()}`,
          ],
        };

        const autoReplyMessage = buildHybridReplyForContact(
          matchedContact,
          rawTo,
          cleanSubj,
          cleanBody,
          fromAccount,
          threadId,
          sentId
        );

        set({
          emails: [autoReplyMessage, sentMessage, ...state.emails],
          readEmailIds: Array.from(new Set([...state.readEmailIds, sentId])),
        });

        return {
          ok: true,
          deliveryStatus: 'delivered',
          sentMessage,
          autoReplyMessage,
        };
      },

      replyToEmail: (parentId, body, options) => {
        const state = get();
        const parent = state.emails.find((m) => m.id === parentId);
        if (!parent) {
          return {
            ok: false,
            deliveryStatus: 'failed',
            reason: 'Original message not found for reply.',
          };
        }
        const replyToAddress = parent.senderAddress || parent.sender;
        const replySubject = parent.subject.toLowerCase().startsWith('re:')
          ? parent.subject
          : `Re: ${parent.subject}`;
        const fromAddress =
          options?.fromAddress ||
          (parent.recipientAddress &&
          state.playerAccounts.some((a) => a.address.toLowerCase() === parent.recipientAddress!.toLowerCase())
            ? parent.recipientAddress
            : state.selectedSenderAddress);

        return get().sendEmail({
          fromAddress,
          toAddress: replyToAddress,
          cc: options?.replyAll ? parent.cc : undefined,
          subject: replySubject,
          body,
          parentId: parent.id,
          threadId: parent.threadId || parent.id,
          playerClearance: options?.playerClearance,
          npcTrustMap: options?.npcTrustMap,
        });
      },

      forwardEmail: (parentId, toAddress, note, fromAddress, playerClearance) => {
        const state = get();
        const parent = state.emails.find((m) => m.id === parentId);
        if (!parent) {
          return {
            ok: false,
            deliveryStatus: 'failed',
            reason: 'Original message not found for forwarding.',
          };
        }
        const fwdSubject = parent.subject.toLowerCase().startsWith('fwd:')
          ? parent.subject
          : `Fwd: ${parent.subject}`;
        const fwdBody = `${note ? `${note.trim()}\n\n` : ''}---------- Forwarded Message ----------\nFrom: ${parent.sender} <${parent.senderAddress || 'verified@auremail.aure'}>\nSubject: ${parent.subject}\n\n${parent.body}`;

        // Only forward non-reward file/record/form attachments so rewards cannot be duplicated
        const forwardedAttachments: EmailAttachment[] = (parent.attachments || [])
          .filter((att) => !att.isReward)
          .map((att) => ({
            ...att,
            id: `fwd-${att.id}`,
            isReward: false,
            amount: 0,
            xp: 0,
            claimed: false,
          }));

        return get().sendEmail({
          fromAddress: fromAddress || state.selectedSenderAddress,
          toAddress,
          subject: fwdSubject,
          body: fwdBody,
          attachments: forwardedAttachments,
          threadId: parent.threadId || parent.id,
          parentId: parent.id,
          playerClearance,
        });
      },

      saveAttachmentToVault: (emailId, attId) => {
        const state = get();
        const key = `${emailId}_${attId}`;
        const mail = state.emails.find((m) => m.id === emailId);
        const att = mail?.attachments?.find((a) => a.id === attId);
        if (state.savedAttachmentIds.includes(key)) {
          return { ok: false, alreadySaved: true, fileName: att?.name };
        }
        set({
          savedAttachmentIds: [...state.savedAttachmentIds, key],
        });
        return { ok: true, fileName: att?.name || 'Attachment' };
      },

      submitAttachmentForm: (emailId, attId, responseNotes) => {
        const state = get();
        const key = `${emailId}_${attId}`;
        if (state.submittedFormIds.includes(key)) {
          return { ok: false, alreadySubmitted: true };
        }
        const mail = state.emails.find((m) => m.id === emailId);
        const att = mail?.attachments?.find((a) => a.id === attId);
        if (!mail || !att) {
          return { ok: false };
        }

        const receiptEmail: EmailItem = {
          id: `MSG-FRM-${Date.now().toString().slice(-5)}`,
          threadId: mail.threadId || mail.id,
          parentId: mail.id,
          sender: mail.sender,
          senderAddress: mail.senderAddress || 'registry@orynvell.gov',
          senderMaid: mail.senderMaid,
          recipient: mail.recipient || 'Player Citizen',
          recipientAddress: mail.recipientAddress || state.selectedSenderAddress,
          faction: mail.faction,
          subject: `Form Filing Receipt: ${att.name}`,
          time: 'JUST NOW',
          timestamp: new Date().toISOString(),
          read: false,
          folder: 'inbox',
          deliveryStatus: 'delivered',
          verifiedSender: true,
          institutionalSeal: mail.institutionalSeal || 'CIVIC-FORM-VERIFIED',
          labels: ['Official', 'Form Receipt'],
          attachment: null,
          attachments: [],
          body: `Official Form Submission Receipt — ${mail.sender}:

Form Filed: ${att.name} (${att.version || 'v1.0'})
Citizen MAID: MAID-OR-00481926
Declaration Notes: ${responseNotes?.trim() || 'Standard Citizen Attestation Confirmed'}

Your completed form has been verified and recorded in the institutional registry.`,
        };

        set({
          submittedFormIds: [...state.submittedFormIds, key],
          emails: [receiptEmail, ...state.emails],
        });

        return { ok: true, replyEmail: receiptEmail };
      },

      toggleBlockAddress: (address) =>
        set((s) => {
          const lower = address.toLowerCase();
          return {
            blockedAddresses: s.blockedAddresses.includes(lower)
              ? s.blockedAddresses.filter((a) => a !== lower)
              : [...s.blockedAddresses, lower],
          };
        }),

      reportSuspiciousEmail: (emailId) =>
        set((s) => ({
          reportedEmailIds: s.reportedEmailIds.includes(emailId)
            ? s.reportedEmailIds
            : [...s.reportedEmailIds, emailId],
        })),
    }),
    {
      name: 'miraverse-comms',
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        if (!Array.isArray(merged.emails) || merged.emails.length === 0) {
          merged.emails = INITIAL_EMAILS;
        } else {
          // Ensure canonical initial emails carry upgraded multi-account and separated attachment metadata
          const initialById = new Map(INITIAL_EMAILS.map((m) => [m.id, m]));
          merged.emails = merged.emails.map((m: EmailItem) => {
            const canonical = initialById.get(m.id);
            return canonical ? { ...canonical, read: m.read ?? canonical.read } : m;
          });
        }
        if (!Array.isArray(merged.playerAccounts) || merged.playerAccounts.length === 0) {
          merged.playerAccounts = DEFAULT_PLAYER_EMAIL_ACCOUNTS;
        }
        return merged;
      },
    }
  )
);
