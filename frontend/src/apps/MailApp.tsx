import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Mail,
  Inbox,
  Star,
  Archive,
  Send,
  Paperclip,
  CheckCircle2,
  Shield,
  Sparkles,
  ExternalLink,
  FileText,
  X,
  Trash2,
  FileEdit,
  AlertTriangle,
  Users,
  Reply,
  Forward,
  FolderDown,
  Coins,
  CheckSquare,
  RotateCcw,
  Lock,
  BadgeCheck,
  Clock,
  Tag as PinLabel,
} from 'lucide-react';
import { MailProvider, useMailState } from './mail/MailContext';
import MailTools, { MailOrganizationBar } from './mail/MailTools';
import RichMailEditor, { RichMailBody } from './mail/RichMailEditor';
import { groupConversations, conversationMessageIds, isSnoozed } from './mail/mailOrganization';
import { escapeMailText } from './mail/richText';
import { CASE_MAIL } from '../gameplay/BroadStreetCase';
import '../styles/apps/auremail.css';
import { launchDesktopApp } from '../components/desktop/appDirectory';
import { useOSStore } from '../store/useOSStore';
import {
  AUREMAIL_DIRECTORY,
  type AureMailDirectoryContact,
  type EmailAttachment,
  type EmailItem,
} from '../data/commsData';
import { MaidIdentityService, type CanonicalPerson } from '../services/maidIdentityService';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import {
  AppShell,
  AppToolbar,
  AppSidebar,
  AppPane,
  EmptyState,
  SearchField,
  StatusBadge,
} from '../components/ui/app-shell';
import DocumentModal from '../components/widgets/DocumentModal';
import { MOCK_DOCUMENTS } from '../data/mockDocuments';
import { useToastStore } from '../store/useToastStore';
import CommunicationsAccessPanel from './CommunicationsAccessPanel';
import { senderAccess } from '../integration/communicationsAccess';

const VAULT_ATTACHABLE_FILES: EmailAttachment[] = [
  {
    id: 'vault-aura-log',
    name: 'AURA_BASELINE_TELEMETRY.log',
    kind: 'file',
    isReward: false,
    type: 'file',
    amount: 0,
    xp: 0,
    claimed: false,
    previewTitle: 'Citizen Aura Baseline Telemetry Log',
    previewText: 'Exported personal telemetry packet from Aura Passport.',
    version: 'v1.0',
    provenance: 'Exported by Citizen MAID-OR-00481926',
  },
  {
    id: 'vault-case-brief',
    name: 'SECTOR4_ANOMALY_NOTES.pdf',
    kind: 'record',
    isReward: false,
    type: 'document',
    amount: 0,
    xp: 0,
    claimed: false,
    previewTitle: 'Sector 4 Anomaly Field Observation Notes',
    previewText: 'Compiled citizen field notes regarding Sub-Conduit signal bleed.',
    version: 'v1.2',
    provenance: 'Signed by Citizen MAID-OR-00481926',
  },
];

export default function MailApp() { return <MailProvider><MailWorkspace /></MailProvider>; }

function MailWorkspace() {
  const [caseNotice, setCaseNotice] = useState('');
  const [accessOpen, setAccessOpen] = useState(false);
  const communicationsPlayer = useOSStore(s => s.gameplay.player);
  const organization = useMailState(s => s.mailOrganization);
  const organizeMail = useMailState(s => s.organizeMail);
  const processMailRules = useMailState(s => s.processMailRules);
  const [toolsView, setToolsView] = useState<'contacts' | 'settings' | null>(null);
  const [mobileView, setMobileView] = useState('list');
  const [now, setNow] = useState(Date.now);
  const mailRequest = useMailState(state => state.mailRequest);
  const pendingRequestedReader = useRef(false);
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [activeFaction, setActiveFaction] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedMailId, setSelectedMailId] = useState<string>('MSG-001');
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  // Reply & Forward state
  const [replyMode, setReplyMode] = useState<'reply' | 'replyAll' | 'forward'>('reply');
  const [replyText, setReplyText] = useState<string>('');
  const [forwardTo, setForwardTo] = useState<string>('');
  const [replyStatus, setReplyStatus] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState<string>('');

  // Document inspection modal
  const [openDocModal, setOpenDocModal] = useState<any>(null);

  // Composer state
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(undefined);
  const [composeFrom, setComposeFrom] = useState<string>('citizen@auremail.aure');
  const [composeRecipient, setComposeRecipient] = useState<string>('registrar@cyacademy.edu');
  const [composeCc, setComposeCc] = useState<string>('');
  const [composeBcc, setComposeBcc] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeHtml, setComposeHtml] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);

  // Canonical MAID Citizens loaded for Universal Directory
  const [canonicalPersons, setCanonicalPersons] = useState<CanonicalPerson[]>([]);

  useEffect(() => {
    MaidIdentityService.getAllPersons()
      .then((list) => setCanonicalPersons(list))
      .catch(() => {});
  }, []);

  // Persisted AureMail store state & actions
  const emails = useMailState((s) => s.emails);
  const playerAccounts = useMailState((s) => s.playerAccounts);
  const activeAccountAddress = useMailState((s) => s.activeAccountAddress);
  const selectedSenderAddress = useMailState((s) => s.selectedSenderAddress);
  const starredEmailIds = useMailState((s) => s.starredEmailIds);
  const archivedEmailIds = useMailState((s) => s.archivedEmailIds);
  const trashedEmailIds = useMailState((s) => s.trashedEmailIds);
  const readEmailIds = useMailState((s) => s.readEmailIds);
  const savedAttachmentIds = useMailState((s) => s.savedAttachmentIds);
  const submittedFormIds = useMailState((s) => s.submittedFormIds);
  const blockedAddresses = useMailState((s) => s.blockedAddresses);
  const reportedEmailIds = useMailState((s) => s.reportedEmailIds);
  const drafts = useMailState((s) => s.drafts);
  const sortOrder = useMailState((s) => s.sortOrder);

  const setActiveAccountAddress = useMailState((s) => s.setActiveAccountAddress);
  const setSelectedSenderAddress = useMailState((s) => s.setSelectedSenderAddress);
  useEffect(() => {
    const selected = playerAccounts.find(account => account.address === selectedSenderAddress);
    if (senderAccess(communicationsPlayer, selected)) return;
    const available = playerAccounts.find(account => senderAccess(communicationsPlayer, account));
    if (available) setSelectedSenderAddress(available.address);
  }, [playerAccounts, communicationsPlayer, selectedSenderAddress, setSelectedSenderAddress]);
  const toggleStarEmail = useMailState((s) => s.toggleStarEmail);
  const bulkUpdateEmails = useMailState((s) => s.bulkUpdateEmails);
  const setSortOrder = useMailState((s) => s.setSortOrder);
  const saveDraft = useMailState((s) => s.saveDraft);
  const deleteDraft = useMailState((s) => s.deleteDraft);
  const sendEmail = useMailState((s) => s.sendEmail);
  const replyToEmail = useMailState((s) => s.replyToEmail);
  const forwardEmail = useMailState((s) => s.forwardEmail);
  const saveAttachmentToVault = useMailState((s) => s.saveAttachmentToVault);
  const submitAttachmentForm = useMailState((s) => s.submitAttachmentForm);
  const toggleBlockAddress = useMailState((s) => s.toggleBlockAddress);
  const reportSuspiciousEmail = useMailState((s) => s.reportSuspiciousEmail);

  // OS Store progression & clearance
  const claimedComms = useOSStore((s) => s.gameplay.claimedComms);
  const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
  const playerClearance = useOSStore((s) => (s.gameplay.player as any)?.clearanceLevel || s.gameplay.appRanks?.clearance || 1);
  const npcVectors = useOSStore((s) => s.gameplay.npcVectors);
  const openWindow = (id: string) => launchDesktopApp(id === 'docstudio' ? 'documentStudio' : id);
  const pushToast = useToastStore((s) => s.pushToast);

  const npcTrustMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (npcVectors) {
      Object.entries(npcVectors).forEach(([k, v]: [string, any]) => {
        map[k] = v?.trust ?? 50;
      });
    }
    return map;
  }, [npcVectors]);

  // Combined Universal Directory (Static Institutional/NPC contacts + Canonical MAID Registry accounts)
  const directoryContacts = useMemo<AureMailDirectoryContact[]>(() => {
    const byAddress = new Map<string, AureMailDirectoryContact>();
    AUREMAIL_DIRECTORY.forEach((c) => byAddress.set(c.address.toLowerCase(), c));

    canonicalPersons.forEach((person) => {
      (person.emailAccounts || []).forEach((acc) => {
        const lower = acc.address.toLowerCase();
        if (!byAddress.has(lower)) {
          byAddress.set(lower, {
            id: `maid-${person.id}-${encodeURIComponent(lower)}`,
            name: person.name,
            address: acc.address,
            category: 'citizen',
            accountType: acc.accountType,
            role: acc.roleLabel || person.occupation || 'Registered Citizen',
            institution: acc.institution || person.affiliation || 'Orynvell Registry',
            faction: person.faction || person.affiliation || 'Civic',
            maid: person.maid || person.legacyRecord,
            requiredClearance: acc.requiredClearance || (person.isRestricted ? 3 : 1),
            verified: acc.verified,
            description: `${person.category} · ${person.residency || person.home}`,
          });
        }
      });
    });

    organization.contacts.forEach(contact => { if (!byAddress.has(contact.address)) byAddress.set(contact.address, { ...contact, category: 'citizen', accountType: 'personal', role: 'Personal contact', institution: 'Your address book', faction: 'Personal', requiredClearance: 1, verified: false }); });
    return Array.from(byAddress.values());
  }, [canonicalPersons, organization.contacts]);

  useEffect(() => { processMailRules(); }, [emails, processMailRules]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { setMobileView(pendingRequestedReader.current ? 'reader' : 'list'); pendingRequestedReader.current = false; setSelectedBulkIds([]); }, [activeFolder]);
  useEffect(() => { if (isComposing) setMobileView('reader'); }, [isComposing]);

  function dropMail(event: React.DragEvent, destination: string) {
    event.preventDefault();
    try {
      const requested = JSON.parse(event.dataTransfer.getData('application/x-auremail'));
      const ids = Array.isArray(requested) ? requested.filter(id => typeof id === 'string' && emails.some(mail => mail.id === id)) : [];
      if (!ids.length) return;
      if (destination.startsWith('label:')) organizeMail(ids, 'add-label', destination.slice(6));
      else if (destination === 'spam') organizeMail(ids, 'spam');
      else if (destination === 'archive' || destination === 'trash') bulkUpdateEmails(ids, destination === 'archive' ? 'archive' : 'trash');
      else if (destination === 'inbox' || destination.startsWith('folder:')) organizeMail(ids, 'folder', destination === 'inbox' ? '' : destination.slice(7));
    } catch { /* Foreign drag payloads do not modify mail. */ }
  }

  const isEmailRead = (mail: EmailItem) => Boolean(mail.read || readEmailIds.includes(mail.id));

  const matchesAccountFilter = (mail: EmailItem) => {
    if (!activeAccountAddress || activeAccountAddress === 'ALL') return true;
    const target = activeAccountAddress.toLowerCase();
    return (
      (mail.recipientAddress && mail.recipientAddress.toLowerCase() === target) ||
      (mail.senderAddress && mail.senderAddress.toLowerCase() === target)
    );
  };

  const filteredEmails = useMemo(() => {
    const list = emails.filter((mail) => {
      // Blocked sender check
      if (mail.senderAddress && blockedAddresses.includes(mail.senderAddress.toLowerCase()) && !['trash', 'spam'].includes(activeFolder)) {
        return false;
      }

      // Account mailbox filter (Combined vs specific account)
      if (!matchesAccountFilter(mail)) return false;

      const meta = organization.metadata[mail.id];
      if (activeFolder === 'spam' ? !meta?.spam : meta?.spam && activeFolder !== 'trash') return false;
      if (activeFolder === 'snoozed' ? !isSnoozed(meta, now) : isSnoozed(meta, now) && !['trash', 'spam'].includes(activeFolder)) return false;
      if (activeFolder.startsWith('folder:') ? meta?.folder !== activeFolder.slice(7) : meta?.folder && ['inbox', 'official'].includes(activeFolder)) return false;
      if (activeFolder.startsWith('label:') && !meta?.labels?.includes(activeFolder.slice(6))) return false;
      const isTrashed = trashedEmailIds.includes(mail.id) || mail.folder === 'trash';
      const isArchived = archivedEmailIds.includes(mail.id) || mail.folder === 'archive';
      const isSent = mail.folder === 'sent';
      const isOutbox = mail.folder === 'outbox';

      if (activeFolder === 'trash') {
        if (!isTrashed) return false;
      } else if (isTrashed) {
        return false;
      }

      if (activeFolder === 'archive') {
        if (!isArchived) return false;
      } else if (isArchived && !['starred', 'spam', 'snoozed'].includes(activeFolder) && !activeFolder.startsWith('label:')) {
        return false;
      }

      if (activeFolder === 'sent') {
        if (!isSent) return false;
      } else if (activeFolder === 'outbox') {
        if (!isOutbox) return false;
      } else if (activeFolder === 'inbox') {
        if (isSent || isOutbox) return false;
      }

      if (activeFolder === 'starred' && !starredEmailIds.includes(mail.id)) return false;
      if (
        activeFolder === 'official' &&
        !/DGA|Governance|Faith|Cyacademy|Bureau|Housing|Finance|Safety|Registrar|Services|Dean/i.test(
          `${mail.sender} ${mail.faction}`
        )
      ) {
        return false;
      }

      // Faction filter
      if (activeFaction !== 'all') {
        const fac = `${mail.faction || ''} ${(mail.labels || []).join(' ')}`.toLowerCase();
        if (!fac.includes(activeFaction.toLowerCase())) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          mail.subject.toLowerCase().includes(q) ||
          mail.sender.toLowerCase().includes(q) ||
          (mail.senderAddress || '').toLowerCase().includes(q) ||
          (mail.recipientAddress || '').toLowerCase().includes(q) ||
          (mail.senderMaid || '').toLowerCase().includes(q) ||
          mail.body.toLowerCase().includes(q)
        );
      }

      return true;
    });

    if (sortOrder === 'oldest') {
      return [...list].reverse();
    }
    if (sortOrder === 'unread') {
      return [...list].sort((a, b) => Number(isEmailRead(a)) - Number(isEmailRead(b)));
    }
    return list;
  }, [
    emails,
    activeFolder,
    activeFaction,
    activeAccountAddress,
    search,
    starredEmailIds,
    archivedEmailIds,
    trashedEmailIds,
    readEmailIds,
    blockedAddresses,
    sortOrder,
    organization,
    now,
  ]);

  const conversationRows = groupConversations(filteredEmails, organization.settings.conversations);

  const selectedMail = useMemo(() => {
    return filteredEmails.find((m) => m.id === selectedMailId) || filteredEmails[0] || null;
  }, [filteredEmails, selectedMailId]);

  // Conversation Thread messages for the currently selected email
  const threadMessages = useMemo(() => {
    if (!selectedMail) return [];
    const threadKey = selectedMail.threadId || selectedMail.id;
    return emails
      .filter((m) => (m.threadId || m.id) === threadKey && (activeFolder === 'trash' ? trashedEmailIds.includes(m.id) : !trashedEmailIds.includes(m.id)) && (activeFolder === 'spam' || !organization.metadata[m.id]?.spam) && matchesAccountFilter(m))
      .slice()
      .reverse();
  }, [emails, selectedMail, trashedEmailIds, activeFolder, organization, activeAccountAddress]);

  const selectedConversationIds = organization.settings.conversations ? threadMessages.map(mail => mail.id) : selectedMail ? [selectedMail.id] : [];
  useEffect(() => { setReplyText(''); setReplyStatus(null); setFormNotes(''); }, [selectedMail?.id]);
  useEffect(() => {
    if ((activeFolder.startsWith('folder:') && !organization.folders.includes(activeFolder.slice(7))) || (activeFolder.startsWith('label:') && !organization.labels.includes(activeFolder.slice(6)))) setActiveFolder('inbox');
  }, [activeFolder, organization.folders, organization.labels]);

  useEffect(() => {
    if (!mailRequest) return;
    const mail = emails.find(item => item.id === mailRequest.id);
    if (!mail) return;
    const meta = organization.metadata[mail.id];
    const folder = trashedEmailIds.includes(mail.id) || mail.folder === 'trash' ? 'trash' : meta?.spam ? 'spam' : isSnoozed(meta) ? 'snoozed' : archivedEmailIds.includes(mail.id) || mail.folder === 'archive' ? 'archive' : meta?.folder ? `folder:${meta.folder}` : mail.folder === 'sent' ? 'sent' : mail.folder === 'outbox' ? 'outbox' : 'inbox';
    if (organization.settings.autoRead) bulkUpdateEmails(conversationMessageIds(emails, [mail.id], organization.settings.conversations), 'read');
    pendingRequestedReader.current = activeFolder !== folder;
    setActiveFolder(folder); setSelectedMailId(mail.id); setSearch(''); setActiveFaction('all'); setActiveAccountAddress('ALL'); setIsComposing(false); setMobileView('reader');
  }, [mailRequest]);

  const getNormalizedAttachments = (mail: EmailItem | null): EmailAttachment[] => {
    if (!mail) return [];
    if (Array.isArray(mail.attachments) && mail.attachments.length > 0) {
      return mail.attachments;
    }
    if (mail.attachment) {
      return [
        {
          id: 'legacy-att-0',
          name: mail.attachment.name,
          kind: 'file',
          isReward: false,
          type: mail.attachment.type,
          amount: 0,
          xp: 0,
          claimed: false,
        },
      ];
    }
    return [];
  };

  const currentAttachments = getNormalizedAttachments(selectedMail);
  const documentAttachments = currentAttachments.filter((att) => !att.isReward);
  const rewardAttachments = currentAttachments.filter((att) => att.isReward && (att.amount > 0 || (att.xp && att.xp > 0)));

  const handleSelectMail = (mail: EmailItem) => {
    setSelectedMailId(mail.id);
    setMobileView('reader');
    if (organization.settings.autoRead) {
      const ids = organization.settings.conversations ? filteredEmails.filter(item => (item.threadId || item.id) === (mail.threadId || mail.id)).map(item => item.id) : [mail.id];
      bulkUpdateEmails(ids, 'read');
    }
    if (mail.recipientAddress && playerAccounts.some((a) => a.address.toLowerCase() === mail.recipientAddress!.toLowerCase())) {
      setSelectedSenderAddress(mail.recipientAddress);
    }
  };

  // Decision 011: Claiming is ONLY allowed on explicitly designated reward/grant/payment attachments
  const handleClaimVerifiedReward = (att: EmailAttachment) => {
    if (!selectedMail || !att.isReward) return;
    const claimId = `${selectedMail.id}_${att.id}`;
    if (claimedComms.includes(claimId)) return;
    const credits = typeof att.amount === 'number' && att.amount > 0 ? att.amount : 0;
    const xp = typeof att.xp === 'number' && att.xp > 0 ? att.xp : 0;
    if (credits <= 0 && xp <= 0) return;

    claimCommsAttachment(claimId, credits, xp);
    pushToast({
      title: 'Verified Disbursement Claimed',
      message: `Credited +₡${credits}${xp > 0 ? ` and +${xp} XP` : ''} (${att.name}).`,
      tone: 'success',
    });
  };

  // Decision 011: Opening a document NEVER awards credits or XP
  const handleOpenDocumentAttachment = (att: EmailAttachment) => {
    const mockKey = att.mockKey || 'dga-registration';
    const docDef = MOCK_DOCUMENTS[mockKey] || {
      id: att.id || 'doc',
      filename: att.name,
      name: att.name,
      extension: att.name.endsWith('.osform') ? '.osform' : '.pdf',
      category: att.kind === 'form' ? 'Interactive Civic Form' : 'Official Municipal Record',
      meta: {
        classification: selectedMail?.institutionalSeal || 'VERIFIED RECORD',
        author: selectedMail?.sender || 'Civic Bureau',
        timestamp: selectedMail?.time || 'TODAY',
        fileSize: '12.4 KB',
      },
      security: { isEncrypted: Boolean(selectedMail?.encrypted) },
      content: {
        title: att.previewTitle || att.name,
        subtitle: att.provenance || att.previewText || 'Verified AureMail Document Enclosure',
        bodyText: `${att.previewText || ''}\n\n---\nOriginal Message Context:\n${selectedMail?.body || ''}`,
      },
    };
    setOpenDocModal(docDef);
  };

  const handleSaveAttachmentToVault = (att: EmailAttachment) => {
    if (!selectedMail) return;
    const res = saveAttachmentToVault(selectedMail.id, att.id);
    if (res.alreadySaved) {
      pushToast({
        title: 'Already in File Explorer Vault',
        message: `${att.name} is already archived in your personal Vault.`,
        tone: 'info',
      });
      return;
    }
    if (!res.ok) { pushToast({ title: 'Attachment unavailable', message: 'This attachment cannot be saved.', tone: 'warning' }); return; }
    pushToast({
      title: 'Saved to File Explorer Vault',
      message: `${att.name} (${att.version || 'v1.0'}) archived with full provenance. No automatic currency awarded.`,
      tone: 'success',
    });
  };

  const handleSubmitFormAttachment = (att: EmailAttachment) => {
    if (!selectedMail) return;
    const res = submitAttachmentForm(selectedMail.id, att.id, formNotes);
    if (res.alreadySubmitted) {
      pushToast({
        title: 'Form Already Submitted',
        message: `${att.name} has already been filed with ${selectedMail.sender}.`,
        tone: 'info',
      });
      return;
    }
    if (!res.ok) { pushToast({ title: 'Form unavailable', message: 'Only valid form attachments can be submitted.', tone: 'warning' }); return; }
    setFormNotes('');
    pushToast({
      title: 'Official Form Submitted',
      message: `${att.name} filed with ${selectedMail.sender}. A confirmation receipt was added to this thread.`,
      tone: 'success',
    });
  };

  const handleSendNewDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient.trim() || !composeSubject.trim() || !composeBody.trim()) {
      pushToast({
        title: 'Incomplete Message',
        message: 'Please provide a recipient address, subject, and body.',
        tone: 'warning',
      });
      return;
    }

    const res = sendEmail({
      fromAddress: composeFrom || selectedSenderAddress,
      toAddress: composeRecipient.trim(),
      recipientContact: directoryContacts.find(contact => [contact.address, contact.name, contact.maid].some(value => value?.toLowerCase() === composeRecipient.trim().toLowerCase())),
      cc: composeCc ? composeCc.split(',').map((s) => s.trim()) : undefined,
      bcc: composeBcc ? composeBcc.split(',').map((s) => s.trim()) : undefined,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      bodyHtml: composeHtml,
      attachments: composeAttachments,
      playerClearance,
      npcTrustMap,
    });

    if (activeDraftId) {
      deleteDraft(activeDraftId);
      setActiveDraftId(undefined);
    }

    if (!res.ok) {
      pushToast({
        title: 'Delivery Held in Outbox',
        message: res.reason || 'Recipient requires higher clearance or trust.',
        tone: 'warning',
      });
      setActiveFolder('outbox');
      if (res.sentMessage) setSelectedMailId(res.sentMessage.id);
      setIsComposing(false);
      return;
    }

    if (res.autoReplyMessage) {
      setSelectedMailId(res.autoReplyMessage.id);
    } else if (res.sentMessage) {
      setSelectedMailId(res.sentMessage.id);
    }

    setIsComposing(false);
    setComposeSubject('');
    setComposeBody('');
    setComposeHtml('');
    setComposeCc('');
    setComposeBcc('');
    setComposeAttachments([]);

    pushToast({
      title: 'Message Sent & Reply Received',
      message: `Transmitted from ${composeFrom} to ${composeRecipient}.`,
      tone: 'success',
    });
  };

  const handleSaveDraftClick = () => {
    const saved = saveDraft({
      id: activeDraftId,
      fromAddress: composeFrom || selectedSenderAddress,
      toAddress: composeRecipient,
      cc: composeCc,
      bcc: composeBcc,
      subject: composeSubject || '(Untitled Draft)',
      body: composeBody,
      bodyHtml: composeHtml,
      attachments: composeAttachments,
    });
    setActiveDraftId(saved.id);
    pushToast({
      title: 'Draft Saved',
      message: `Saved "${saved.subject}" to Drafts.`,
      tone: 'info',
    });
  };

  const handleResumeDraft = (draftId: string) => {
    const d = drafts.find((item) => item.id === draftId);
    if (!d) return;
    setActiveDraftId(d.id);
    setComposeFrom(d.fromAddress);
    setComposeRecipient(d.toAddress);
    setComposeCc(d.cc);
    setComposeBcc(d.bcc);
    setComposeSubject(d.subject);
    setComposeBody(d.body);
    setComposeHtml(d.bodyHtml || `<div>${escapeMailText(d.body).replace(/\n/g, '<br>')}</div>`);
    setComposeAttachments(d.attachments || []);
    setIsComposing(true);
  };

  const handleSendReplyOrForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMail || !replyText.trim()) return;

    if (replyMode === 'forward') {
      if (!forwardTo.trim()) {
        pushToast({ title: 'Recipient Required', message: 'Specify an address to forward this message to.', tone: 'warning' });
        return;
      }
      const fwdRes = forwardEmail(selectedMail.id, forwardTo.trim(), replyText.trim(), selectedSenderAddress, playerClearance);
      if (!fwdRes.ok) {
        setReplyStatus(fwdRes.reason || 'Forward held in Outbox.');
        pushToast({ title: 'Forward Held in Outbox', message: fwdRes.reason || '', tone: 'warning' });
        return;
      }
      setReplyStatus(`Forwarded to ${forwardTo} via ${selectedSenderAddress}.`);
      pushToast({ title: 'Message Forwarded', message: `Forwarded "${selectedMail.subject}" to ${forwardTo}`, tone: 'success' });
      setReplyText('');
      setForwardTo('');
      return;
    }

    const res = replyToEmail(selectedMail.id, replyText.trim(), {
      replyAll: replyMode === 'replyAll',
      fromAddress: selectedSenderAddress,
      playerClearance,
      npcTrustMap,
    });

    if (!res.ok) {
      setReplyStatus(res.reason || 'Reply held in Outbox.');
      pushToast({ title: 'Reply Held in Outbox', message: res.reason || '', tone: 'warning' });
      return;
    }

    setReplyStatus(`Reply sent from ${selectedSenderAddress}. Response added to thread.`);
    pushToast({
      title: 'Reply Transmitted',
      message: `Replied to ${selectedMail.sender} (${selectedMail.subject})`,
      tone: 'success',
    });
    setReplyText('');
  };

  const toggleBulkSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBulkIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAction = (action: 'read' | 'unread' | 'star' | 'archive' | 'trash' | 'restore') => {
    if (selectedBulkIds.length === 0) return;
    const ids = conversationMessageIds(emails.filter(mail => matchesAccountFilter(mail) && (activeFolder === 'trash' || !trashedEmailIds.includes(mail.id))), selectedBulkIds, organization.settings.conversations);
    bulkUpdateEmails(ids, action);
    pushToast({
      title: 'Bulk Action Applied',
      message: `Updated ${selectedBulkIds.length} message(s): ${action.toUpperCase()}.`,
      tone: 'info',
    });
    setSelectedBulkIds([]);
  };

  const inInbox = (mail: EmailItem) => !trashedEmailIds.includes(mail.id) && !archivedEmailIds.includes(mail.id) && (!mail.folder || mail.folder === 'inbox') && !organization.metadata[mail.id]?.spam && !isSnoozed(organization.metadata[mail.id], now) && !organization.metadata[mail.id]?.folder && !blockedAddresses.includes(mail.senderAddress?.toLowerCase() || '');
  const unreadInboxCount = emails.filter(
    (m) =>
      inInbox(m) &&
      matchesAccountFilter(m) &&
      !isEmailRead(m)
  ).length;

  return (
    <AppShell className={`auremail-client mail-density-${organization.settings.density} mail-view-${mobileView}`}>
      {accessOpen && <CommunicationsAccessPanel onClose={() => setAccessOpen(false)}/>}
      <AppToolbar
        icon={Mail}
        title="AureMail"
        subtitle="Personal, academic & work mail · Fictional local relay"
        actions={
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by verified email account"
              value={activeAccountAddress}
              onChange={(e) => setActiveAccountAddress(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#1d2650] shadow-2xs"
            >
              <option value="ALL">All Accounts (Combined Inbox)</option>
              {playerAccounts.map((acc) => (
                <option key={acc.id} value={acc.address}>
                  {acc.address} ({acc.accountType.toUpperCase()})
                </option>
              ))}
            </select>

            <select
              aria-label="Sort messages"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="unread">Sort: Unread First</option>
            </select>

            <SearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search mail, address, MAID..."
              label="Search dispatches and notices"
              className="w-48"
            />
            <StatusBadge tone="info">{unreadInboxCount} unread</StatusBadge>
          </div>
        }
      />

      <nav className="mail-mobile-nav" aria-label="Mobile mailbox navigation"><select aria-label="Mailbox folder" value={activeFolder} onChange={event => setActiveFolder(event.target.value)}>{['inbox', 'starred', 'official', 'sent', 'drafts', 'outbox', 'archive', 'spam', 'snoozed', 'trash', 'directory', ...organization.folders.map(name => `folder:${name}`), ...organization.labels.map(name => `label:${name}`)].map(name => <option key={name} value={name}>{name.replace(/^(folder|label):/, '')}</option>)}</select><button onClick={() => setIsComposing(true)}>Compose</button><button onClick={() => setToolsView('contacts')}>Contacts</button><button onClick={() => setToolsView('settings')}>Settings</button><button onClick={() => setAccessOpen(true)}>Accounts & memberships</button></nav>
      {/* ── MAIN MAILBOX LAYOUT (3 PANES) ── */}
      <div className="mail-layout flex min-h-0 flex-1 overflow-hidden">
        {/* PANE 1: LEFT FOLDERS, ACCOUNTS & DIRECTORY */}
        <AppSidebar className="mail-folders w-[22%] min-w-48 max-w-56 shrink-0 p-3 space-y-4 overflow-y-auto" label="Mailbox folders and accounts">
          <div className="mail-sidebar-tools"><button onClick={() => setToolsView('contacts')}>Personal contacts</button><button onClick={() => setToolsView('settings')}>Settings & rules</button><button onClick={() => setAccessOpen(true)}>Accounts & memberships</button></div>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                setComposeFrom(selectedSenderAddress);
                setIsComposing((prev) => !prev);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17213f] to-[#3a497b] py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition"
            >
              <Sparkles size={14} className="text-purple-300" /> {isComposing ? 'Close Composer' : 'Compose Mail'}
            </button>
            <button
              onClick={() => setActiveFolder(activeFolder === 'directory' ? 'inbox' : 'directory')}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-bold transition ${
                activeFolder === 'directory'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users size={13} /> Universal Directory ({directoryContacts.length})
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 mb-1.5 px-2">
              Mailboxes
            </div>
            {[
              {
                id: 'inbox',
                label: 'Inbox',
                icon: Inbox,
                count: emails.filter(m => inInbox(m) && matchesAccountFilter(m)).length,
              },
              { id: 'starred', label: 'Starred', icon: Star, count: starredEmailIds.length },
              {
                id: 'official',
                label: 'Official Dispatches',
                icon: Shield,
                count: emails.filter(
                  (m) =>
                    !archivedEmailIds.includes(m.id) &&
                    !trashedEmailIds.includes(m.id) &&
                    /DGA|Faith|Cyacademy|Bureau|Housing|Registrar|Services|Dean/i.test(`${m.sender} ${m.faction}`)
                ).length,
              },
              {
                id: 'sent',
                label: 'Sent',
                icon: Send,
                count: emails.filter((m) => m.folder === 'sent' && !trashedEmailIds.includes(m.id)).length,
              },
              {
                id: 'drafts',
                label: 'Drafts',
                icon: FileEdit,
                count: drafts.length,
              },
              {
                id: 'outbox',
                label: 'Outbox / Held',
                icon: Clock,
                count: emails.filter((m) => m.folder === 'outbox' && !trashedEmailIds.includes(m.id)).length,
              },
              { id: 'archive', label: 'Archive', icon: Archive, count: archivedEmailIds.length },
              { id: 'trash', label: 'Trash', icon: Trash2, count: trashedEmailIds.length },
              { id: 'spam', label: 'Spam', icon: AlertTriangle, count: emails.filter(mail => organization.metadata[mail.id]?.spam && !trashedEmailIds.includes(mail.id) && matchesAccountFilter(mail)).length },
              { id: 'snoozed', label: 'Snoozed', icon: Clock, count: emails.filter(mail => isSnoozed(organization.metadata[mail.id], now) && !trashedEmailIds.includes(mail.id) && matchesAccountFilter(mail)).length },
              ...organization.folders.map(name => ({ id: `folder:${name}`, label: name, icon: Archive, count: emails.filter(mail => organization.metadata[mail.id]?.folder === name && !trashedEmailIds.includes(mail.id) && matchesAccountFilter(mail)).length })),
              ...organization.labels.map(name => ({ id: `label:${name}`, label: name, icon: PinLabel, count: emails.filter(mail => organization.metadata[mail.id]?.labels?.includes(name) && !trashedEmailIds.includes(mail.id) && matchesAccountFilter(mail)).length })),
            ].map((f) => {
              const IconComp = f.icon;
              return (
                <button
                  key={f.id}
                  onDragOver={event => event.preventDefault()}
                  onDrop={event => dropMail(event, f.id)}
                  onClick={() => setActiveFolder(f.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                    activeFolder === f.id
                      ? 'bg-[#e9ebf6] font-bold text-[#1d2650] shadow-2xs'
                      : 'text-slate-600 hover:bg-[#f2f3fb]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp size={14} className={activeFolder === f.id ? 'text-[#5f6ab0]' : 'text-slate-400'} />
                    <span>{f.label}</span>
                  </div>
                  {f.count > 0 && (
                    <span
                      className={`text-[10px] font-mono rounded px-1.5 py-0.2 ${
                        activeFolder === f.id ? 'bg-[#5f6ab0] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Verified Player Accounts Switcher */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 px-2">
              Verified Accounts
            </div>
            <button
              onClick={() => setActiveAccountAddress('ALL')}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] transition ${
                activeAccountAddress === 'ALL'
                  ? 'bg-indigo-100 font-bold text-indigo-950'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Combined Inbox ({playerAccounts.length} linked)
            </button>
            {playerAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setActiveAccountAddress(acc.address)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] transition ${
                  activeAccountAddress === acc.address
                    ? 'bg-indigo-100 font-bold text-indigo-950'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-mono text-[10px]">{acc.address}</span>
                  <span className="rounded bg-emerald-100 px-1 text-[9px] font-bold uppercase text-emerald-800">
                    {acc.accountType.slice(0, 4)}
                  </span>
                </div>
                <div className="truncate text-[10px] text-slate-400">{acc.roleLabel} · {senderAccess(communicationsPlayer, acc) ? 'Can send' : 'History only'}</div>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 px-2">
              Labels & Factions
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {['all', 'dga', 'faith', 'cyacademy', 'civic', 'personal', 'story'].map((fac) => (
                <button
                  key={fac}
                  onClick={() => setActiveFaction(fac)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize transition ${
                    activeFaction === fac
                      ? 'bg-[#17213f] text-white'
                      : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>
          </div>
        </AppSidebar>

        {/* PANE 2: CENTER MESSAGE LIST / DRAFTS / UNIVERSAL DIRECTORY */}
        <AppPane className="mail-list w-[33%] min-w-64 max-w-88 shrink-0 border-r border-slate-300/70 bg-white/40 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] font-semibold text-slate-500 bg-white/60">
            <span>{activeFolder.toUpperCase()}</span>
            <span>
              {activeFolder === 'directory'
                ? `${directoryContacts.length} verified contacts`
                : activeFolder === 'drafts'
                ? `${drafts.length} saved drafts`
                : `${filteredEmails.length} messages`}
            </span>
          </div>

          {/* Bulk Actions Bar when messages are selected */}
          {selectedBulkIds.length > 0 && activeFolder !== 'directory' && activeFolder !== 'drafts' && (
            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-indigo-200 bg-indigo-50/90 px-2.5 py-1.5 text-[10px]">
              <span className="font-bold text-indigo-900">{selectedBulkIds.length} selected</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleBulkAction('read')}
                  className="rounded bg-white px-1.5 py-0.5 font-semibold text-slate-700 border border-slate-200"
                >
                  Read
                </button>
                <button
                  onClick={() => handleBulkAction('unread')}
                  className="rounded bg-white px-1.5 py-0.5 font-semibold text-slate-700 border border-slate-200"
                >
                  Unread
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="rounded bg-white px-1.5 py-0.5 font-semibold text-slate-700 border border-slate-200"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction(activeFolder === 'trash' ? 'restore' : 'trash')}
                  className="rounded bg-white px-1.5 py-0.5 font-semibold text-rose-700 border border-rose-200"
                >
                  {activeFolder === 'trash' ? 'Restore' : 'Trash'}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {activeFolder === 'directory' ? (
              directoryContacts
                .filter((c) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.address.toLowerCase().includes(q) ||
                    c.institution.toLowerCase().includes(q) ||
                    (c.maid || '').toLowerCase().includes(q)
                  );
                })
                .map((contact) => {
                  const clearanceLocked = contact.requiredClearance > playerClearance;
                  return (
                    <div
                      key={contact.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1f2954] flex items-center gap-1">
                          {contact.name}
                          {contact.verified && <BadgeCheck size={13} className="text-indigo-600" />}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
                          {contact.maid || 'DIRECTORY'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-indigo-700">{contact.address}</div>
                      <div className="text-[11px] text-slate-600">
                        {contact.role} · <span className="font-semibold">{contact.institution}</span>
                      </div>
                      {contact.description && (
                        <p className="text-[10px] text-slate-500">{contact.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-mono text-slate-500">
                          Req: L{contact.requiredClearance} Clearance
                          {contact.requiredTrust ? ` · ${contact.requiredTrust} Trust` : ''}
                        </span>
                        <Button
                          size="sm"
                          variant={clearanceLocked ? 'ghost' : 'solid'}
                          onClick={() => {
                            setComposeRecipient(contact.address);
                            setComposeSubject('');
                            setIsComposing(true);
                          }}
                          className="text-[10px] px-2.5 py-1"
                        >
                          {clearanceLocked ? (
                            <span className="flex items-center gap-1 text-amber-700">
                              <Lock size={11} /> Compose (Held L{contact.requiredClearance})
                            </span>
                          ) : (
                            'Compose Mail'
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
            ) : activeFolder === 'drafts' ? (
              drafts.length > 0 ? (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Resume draft ${d.subject}`}
                    onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); handleResumeDraft(d.id); } }}
                    onClick={() => handleResumeDraft(d.id)}
                    className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50/60 p-3 hover:bg-amber-50 transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">{d.subject || '(Untitled Draft)'}</span>
                      <span className="text-[10px] font-mono text-amber-700">{d.updatedAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      From: {d.fromAddress} → To: {d.toAddress || '(No recipient)'}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{d.body}</p>
                  </div>
                ))
              ) : (
                <EmptyState icon={FileEdit} title="No saved drafts" description="Use Save Draft in the composer to store unfinished messages." />
              )
            ) : (
              conversationRows.map((mail) => {
                const isSelected = selectedMail && (organization.settings.conversations ? selectedMail.threadId || selectedMail.id : selectedMail.id) === (organization.settings.conversations ? mail.threadId || mail.id : mail.id);
                const isStarred = starredEmailIds.includes(mail.id);
                const isRead = organization.settings.conversations ? filteredEmails.filter(item => (item.threadId || item.id) === (mail.threadId || mail.id)).every(isEmailRead) : isEmailRead(mail);
                const atts = getNormalizedAttachments(mail);
                const fileCount = atts.filter((a) => !a.isReward).length;
                const rewardCount = atts.filter((a) => a.isReward).length;
                const threadCount = emails.filter((m) => (m.threadId || m.id) === (mail.threadId || mail.id)).length;
                const isChecked = selectedBulkIds.includes(mail.id);

                return (
                  <div
                    key={mail.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read ${mail.subject}`}
                    draggable
                    onDragStart={event => { const ids = conversationMessageIds(emails.filter(item => matchesAccountFilter(item) && (activeFolder === 'trash' || !trashedEmailIds.includes(item.id))), selectedBulkIds.includes(mail.id) ? selectedBulkIds : [mail.id], organization.settings.conversations); event.dataTransfer.setData('application/x-auremail', JSON.stringify(ids)); event.dataTransfer.effectAllowed = 'move'; }}
                    onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); handleSelectMail(mail); } }}
                    onClick={() => handleSelectMail(mail)}
                    className={`group relative cursor-pointer rounded-xl border p-3 transition shadow-2xs ${
                      isSelected
                        ? 'border-[#8c97d6] bg-[#eef0fb] shadow-sm'
                        : isRead
                        ? 'border-slate-200/80 bg-white/80 hover:bg-[#f7f7fd]'
                        : 'border-indigo-300 bg-white font-semibold shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <input
                          type="checkbox"
                          aria-label={`Select ${mail.subject}`}
                          checked={isChecked}
                          onClick={(e) => toggleBulkSelect(mail.id, e)}
                          onChange={() => {}}
                          className="h-3 w-3 rounded border-slate-300"
                        />
                        {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" title="Unread" />}
                        <span className="truncate text-xs font-bold text-[#1f2954]">{mail.sender}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {threadCount > 1 && (
                          <span className="rounded bg-indigo-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-indigo-800">
                            {threadCount} msgs
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{mail.time}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarEmail(mail.id);
                          }}
                          aria-label={`Star ${mail.subject}`}
                          aria-pressed={isStarred}
                          className="text-slate-300 hover:text-amber-400 transition ml-1"
                        >
                          <Star size={13} className={isStarred ? 'fill-amber-400 text-amber-400' : ''} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 truncate text-xs font-medium text-[#243064]">{mail.subject}</div>

                    {mail.recipientAddress && (
                      <div className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                        To: {mail.recipientAddress}
                      </div>
                    )}

                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-snug">{mail.body}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-1.5 text-[10px]">
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-medium">
                        {mail.faction || 'AureMail'}
                      </span>
                      <div className="flex items-center gap-2">
                        {fileCount > 0 && (
                          <span className="flex items-center gap-1 text-[#5f6ab0] font-semibold">
                            <Paperclip size={11} /> {fileCount} {fileCount === 1 ? 'File' : 'Files'}
                          </span>
                        )}
                        {rewardCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                            <Coins size={11} /> Verified Grant
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {activeFolder !== 'directory' && activeFolder !== 'drafts' && !filteredEmails.length && (
              <EmptyState
                icon={Inbox}
                title="No messages in this view"
                description="Try switching accounts, folders, or search terms."
              />
            )}
          </div>
        </AppPane>

        {/* PANE 3: RIGHT MESSAGE & THREAD READER + COMPOSER */}
        <main className="mail-reader flex min-w-0 flex-1 flex-col bg-[#FAFAFC] overflow-y-auto p-6">
          <button className="mail-back" onClick={() => setMobileView('list')}>← Back to mailbox</button>
          {isComposing && (
            <form
              onSubmit={handleSendNewDispatch}
              className="mb-5 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" /> Compose AureMail Message
                </span>
                <button
                  type="button"
                  aria-label="Close composer"
                  onClick={() => setIsComposing(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    From account
                  </label>
                  <select
                    aria-label="Sender account"
                      value={composeFrom}
                    onChange={(e) => setComposeFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
                  >
                    {playerAccounts.map((acc) => (
                      <option key={acc.id} value={acc.address} disabled={!senderAccess(communicationsPlayer, acc)}>
                        {acc.address} — {senderAccess(communicationsPlayer, acc) ? acc.label : 'History only'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Recipient (Directory or Address)
                  </label>
                  <div className="flex gap-1">
                    <Input
                      aria-label="Recipient"
                      value={composeRecipient}
                      onChange={(e) => setComposeRecipient(e.target.value)}
                      placeholder="e.g. registrar@cyacademy.edu or MAID..."
                      className="text-xs flex-1"
                    />
                    <select
                      aria-label="Pick recipient from Universal Directory"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setComposeRecipient(e.target.value);
                      }}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-2 text-[11px] text-slate-700 max-w-36"
                    >
                      <option value="">Directory...</option>
                      {directoryContacts.map((c) => (
                        <option key={c.id} value={c.address}>
                          {c.name} ({c.address})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  aria-label="Subject"
                      value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="text-xs md:col-span-1"
                />
                <Input
                  aria-label="Cc"
                      value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  placeholder="CC (comma separated)..."
                  className="text-xs"
                />
                <Input
                  aria-label="Bcc"
                      value={composeBcc}
                  onChange={(e) => setComposeBcc(e.target.value)}
                  placeholder="BCC (comma separated)..."
                  className="text-xs"
                />
              </div>

              <RichMailEditor value={composeHtml} onChange={(html, text) => { setComposeHtml(html); setComposeBody(text); }} />

              {/* Vault File Attachments Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Attach File:</span>
                  {VAULT_ATTACHABLE_FILES.map((vf) => {
                    const attached = composeAttachments.some((a) => a.id === vf.id);
                    return (
                      <button
                        key={vf.id}
                        type="button"
                        onClick={() =>
                          setComposeAttachments((prev) =>
                            attached ? prev.filter((a) => a.id !== vf.id) : [...prev, vf]
                          )
                        }
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-mono transition ${
                          attached
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Paperclip size={10} className="inline mr-1" />
                        {vf.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={handleSaveDraftClick}>
                    <FileEdit size={12} className="mr-1" /> Save Draft
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsComposing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1.5">
                    <Send size={12} /> Send Mail
                  </Button>
                </div>
              </div>
            </form>
          )}

          {!isComposing && (selectedMail ? (
            <div className="flex h-full flex-col space-y-4">
              <MailOrganizationBar ids={selectedBulkIds.length ? selectedBulkIds : selectedConversationIds} />
              <div className="rounded-2xl border border-slate-300/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#1c2650] font-serif">{selectedMail.subject}</h2>
                      {selectedMail.verifiedSender && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <BadgeCheck size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="font-bold text-[#1d2650]">{selectedMail.sender}</span>
                      {selectedMail.senderAddress && <span>&lt;{selectedMail.senderAddress}&gt;</span>}
                      {selectedMail.senderMaid && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-700">
                          {selectedMail.senderMaid}
                        </span>
                      )}
                      <span>•</span>
                      <span>{selectedMail.time}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-mono text-slate-400">
                      To: {selectedMail.recipientAddress || 'citizen@auremail.aure'}
                      {selectedMail.cc && selectedMail.cc.length > 0 && ` · CC: ${selectedMail.cc.join(', ')}`}
                      {selectedMail.deliveryStatus && ` · Status: ${selectedMail.deliveryStatus.toUpperCase()}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => bulkUpdateEmails(selectedConversationIds, isEmailRead(selectedMail) ? 'unread' : 'read')}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      <CheckSquare size={11} className="inline mr-1" />
                      {isEmailRead(selectedMail) ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const wasArchived = archivedEmailIds.includes(selectedMail.id) || selectedMail.folder === 'archive';
                        bulkUpdateEmails(selectedConversationIds, wasArchived ? 'restore' : 'archive');
                        pushToast({
                          title: wasArchived ? 'Restored to Inbox' : 'Message Archived',
                          message: selectedMail.subject,
                          tone: 'info',
                        });
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition"
                    >
                      <Archive size={11} />
                      {archivedEmailIds.includes(selectedMail.id) || selectedMail.folder === 'archive' ? 'Unarchive' : 'Archive'}
                    </button>
                    {trashedEmailIds.includes(selectedMail.id) || selectedMail.folder === 'trash' ? (
                      <button
                        type="button"
                        onClick={() => bulkUpdateEmails(selectedConversationIds, 'restore')}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 flex items-center gap-1"
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => bulkUpdateEmails(selectedConversationIds, 'trash')}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Trash
                      </button>
                    )}
                    {selectedMail.senderAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          reportSuspiciousEmail(selectedMail.id);
                          toggleBlockAddress(selectedMail.senderAddress!);
                          pushToast({
                            title: 'Sender Reported & Blocked',
                            message: `${selectedMail.senderAddress} added to AureMail security filter.`,
                            tone: 'warning',
                          });
                        }}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 flex items-center gap-1"
                        title="Report Phishing / Block Sender"
                      >
                        <AlertTriangle size={11} />
                        {reportedEmailIds.includes(selectedMail.id) ? 'Reported' : 'Block/Report'}
                      </button>
                    )}
                    <span className="rounded-full bg-purple-100 border border-purple-300 px-2.5 py-1 font-mono text-[10px] font-bold text-purple-800 flex items-center gap-1">
                      <Shield size={11} /> {selectedMail.faction || 'Verified Relay'}
                    </span>
                  </div>
                </div>

                {/* Conversation Thread View */}
                {selectedMail.assignmentId && <button type="button" className="assignment-mail-action" onClick={() => useOSStore.getState().openAssignment(selectedMail.assignmentId!)}>Review opportunity in WorkNet <ExternalLink size={14} /></button>}
                {selectedMail.id === CASE_MAIL && <div className="assignment-mail-action"><button type="button" onClick={() => { const result = useOSStore.getState().acquireCaseSource('guard-statement', 'mail'); setCaseNotice(result.message); }}>Add guard statement to evidence notebook</button><button type="button" onClick={() => useOSStore.getState().openAppWorkspace('dgaos', 'broadstreet:notebook')}>Open Broad Street notebook</button><p role="status">{caseNotice}</p></div>}
                {threadMessages.length > 1 ? (
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Conversation Thread ({threadMessages.length} messages)
                    </div>
                    {threadMessages.map((tMsg) => (
                      <div
                        key={tMsg.id}
                        className={`rounded-xl border p-3.5 text-xs ${
                          tMsg.id === selectedMail.id
                            ? 'border-indigo-300 bg-[#FAF9FF]'
                            : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                          <span className="font-bold text-[#1d2650]">
                            {tMsg.sender} {tMsg.senderAddress ? `<${tMsg.senderAddress}>` : ''}
                          </span>
                          <span>{tMsg.time}</span>
                        </div>
                        <div className="whitespace-pre-line font-serif text-[#243064] leading-relaxed">
                          <RichMailBody html={tMsg.bodyHtml} text={tMsg.body} />
                          {getNormalizedAttachments(tMsg).length > 0 && <button className="mail-thread-attachments" onClick={() => setSelectedMailId(tMsg.id)}>View this message’s attachments</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed text-[#243064] whitespace-pre-line font-serif bg-[#FAF9FF] p-4 rounded-xl border border-purple-200/50">
                    <RichMailBody html={selectedMail.bodyHtml} text={selectedMail.body} />
                  </div>
                )}

                {selectedMail.auditLog && selectedMail.auditLog.length > 0 && (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-[10px] text-slate-600">
                    {selectedMail.auditLog.map((entry, idx) => (
                      <div key={idx}>• {entry}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 1: ORDINARY FILE, RECORD & FORM ATTACHMENTS (Decision 011: 0 Automatic Credits/XP) */}
              {documentAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#1d2650] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip size={14} className="text-[#5f6ab0]" />
                      Attached Documents, Records & Official Forms ({documentAttachments.length})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Administrative Enclosures · Opening or saving does not award currency
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {documentAttachments.map((att) => {
                      const vaultKey = `${selectedMail.id}_${att.id}`;
                      const isSaved = savedAttachmentIds.includes(vaultKey);
                      const isFormSubmitted = submittedFormIds.includes(vaultKey);

                      return (
                        <div
                          key={att.id}
                          className="rounded-xl border border-slate-300/80 bg-white p-3.5 shadow-2xs flex flex-col gap-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div
                              onClick={() => handleOpenDocumentAttachment(att)}
                              className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition"
                            >
                              <div className="rounded-lg bg-[#eef0fb] p-2.5 text-[#5f6ab0]">
                                <FileText size={18} />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#1d2650] flex items-center gap-2">
                                  {att.name}
                                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 uppercase">
                                    {att.kind} {att.version ? `· ${att.version}` : ''}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {att.previewTitle || att.previewText || 'Official Document Attachment'}
                                </p>
                                {att.provenance && (
                                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{att.provenance}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button
                                onClick={() => handleOpenDocumentAttachment(att)}
                                size="sm"
                                variant="ghost"
                                className="text-xs font-bold text-[#5f6ab0] border border-slate-200 flex items-center gap-1"
                              >
                                Inspect <ExternalLink size={12} />
                              </Button>

                              <Button
                                onClick={() => handleSaveAttachmentToVault(att)}
                                disabled={isSaved}
                                size="sm"
                                variant="ghost"
                                className="text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1"
                              >
                                <FolderDown size={12} /> {isSaved ? 'Saved in Vault' : 'Save to Vault'}
                              </Button>

                              {att.targetApp && (
                                <Button
                                  onClick={() => openWindow(att.targetApp as any)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs font-bold text-indigo-700 border border-indigo-200"
                                >
                                  Open in App
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Interactive Form Submission Row for .osform / kind === 'form' */}
                          {(att.kind === 'form' || att.requiresFormSubmission) && (
                            <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
                              <Input
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                disabled={isFormSubmitted}
                                placeholder="Enter citizen attestation or form response notes..."
                                className="text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                variant={isFormSubmitted ? 'ghost' : 'solid'}
                                disabled={isFormSubmitted}
                                onClick={() => handleSubmitFormAttachment(att)}
                                className="text-xs font-bold"
                              >
                                {isFormSubmitted ? 'Form Filed ✓' : 'Complete & Submit Form'}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: EXPLICITLY DESIGNATED & VERIFIED GRANTS, PAYMENTS & REWARDS (Decision 011) */}
              {rewardAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-600" />
                    <span>Verified Institutional Disbursements & Grants ({rewardAttachments.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {rewardAttachments.map((att) => {
                      const claimId = `${selectedMail.id}_${att.id}`;
                      const isClaimed = claimedComms.includes(claimId);

                      return (
                        <div
                          key={att.id}
                          className="mail-reward-card rounded-xl border border-emerald-300 bg-emerald-50/60 p-3.5 shadow-2xs flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                              {att.name}
                              <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-900">
                                Verified {att.kind}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              {att.previewTitle || att.previewText}
                            </p>
                            {att.provenance && (
                              <p className="text-[10px] font-mono text-emerald-700/80 mt-0.5">{att.provenance}</p>
                            )}
                          </div>

                          <Button
                            onClick={() => handleClaimVerifiedReward(att)}
                            disabled={isClaimed}
                            size="sm"
                            variant={isClaimed ? 'ghost' : 'solid'}
                            className="font-bold text-xs px-3 py-1.5 shrink-0"
                          >
                            {isClaimed ? (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 size={13} /> Claimed (+₡{att.amount}
                                {att.xp ? ` / +${att.xp} XP` : ''})
                              </span>
                            ) : (
                              `Claim Verified Grant (+₡${att.amount}${att.xp ? ` / +${att.xp} XP` : ''})`
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reply / Reply All / Forward Box */}
              <div className="mt-auto pt-3 border-t border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReplyMode('reply')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                        replyMode === 'reply' ? 'bg-[#17213f] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Reply size={12} /> Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyMode('replyAll')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                        replyMode === 'replyAll' ? 'bg-[#17213f] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Reply size={12} /> Reply All
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyMode('forward')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                        replyMode === 'forward' ? 'bg-[#17213f] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Forward size={12} /> Forward
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-semibold">Send From:</span>
                    <select
                      aria-label="Select sender account for reply"
                      value={selectedSenderAddress}
                      onChange={(e) => setSelectedSenderAddress(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-mono text-[11px] text-[#1d2650]"
                    >
                      {playerAccounts.map((acc) => (
                        <option key={acc.id} value={acc.address} disabled={!senderAccess(communicationsPlayer, acc)}>
                          {acc.address} ({senderAccess(communicationsPlayer, acc) ? acc.accountType : 'History only'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {replyMode === 'forward' && (
                  <Input
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    placeholder="Forward to address or directory name (e.g. j.vance@dga.gov)..."
                    className="bg-white border-slate-300 text-xs"
                  />
                )}

                <form onSubmit={handleSendReplyOrForward} className="flex items-center gap-2">
                  <Input
                    aria-label="Reply message"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyMode === 'forward'
                        ? 'Add forwarding note...'
                        : `Reply to ${selectedMail.sender} as ${selectedSenderAddress}...`
                    }
                    className="flex-1 bg-white border-slate-300 text-xs text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5"
                  />
                  <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1.5 px-4 py-2.5">
                    <Send size={13} /> {replyMode === 'forward' ? 'Forward' : 'Send Reply'}
                  </Button>
                </form>
                {replyStatus && <p className="text-[10px] text-emerald-700 font-mono">{replyStatus}</p>}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No message selected"
              description="Select a message from the list to read its thread, inspect enclosures, or reply."
            />
          ))}
        </main>
      </div>

      {toolsView && <MailTools view={toolsView} onClose={() => setToolsView(null)} onCompose={address => { setComposeRecipient(address); setIsComposing(true); setMobileView('reader'); setToolsView(null); }} />}
      {/* Document Inspection Modal */}
      {openDocModal && <DocumentModal file={openDocModal} onClose={() => setOpenDocModal(null)} />}
    </AppShell>
  );
}
