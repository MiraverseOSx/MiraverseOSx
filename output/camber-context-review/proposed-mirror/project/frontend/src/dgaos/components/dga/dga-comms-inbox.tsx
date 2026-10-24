'use client';

import React, { useState } from 'react';
import {
  Send,
  FileText,
  Paperclip,
  CheckCircle2,
  Plus,
  Radio,
  Shield,
  Search,
  Link as LinkIcon,
  CheckSquare,
  BellOff,
  Beaker,
  Download,
  Cpu,
  Eye,
  X
} from 'lucide-react';
import {
  DGACommunication,
  DGACase,
  RichMailAttachment,
  CommunicationStatus,
  normalizeCommunicationStatus
} from '@/lib/dga-types';
import type { MailAttachment } from '@/data/seed/communications';
import {
  markCommunicationRead,
  sendDGACommunication,
  attachCommunicationToCase,
  convertCommunicationToTask,
  convertCommunicationToCase,
  addEvidenceFromAttachment,
  createForensicRequestFromAttachment
} from '@/lib/dga-store';

export function parseRichAttachment(att: MailAttachment): RichMailAttachment {
  if (typeof att === 'string') {
    const isPdf = att.toLowerCase().endsWith('.pdf');
    const isData = att.toLowerCase().endsWith('.dat') || att.toLowerCase().endsWith('.bin') || att.toLowerCase().endsWith('.pcap');
    return {
      name: att,
      type: isPdf ? 'document' : isData ? 'telemetry' : 'file',
      size: '128 KB',
      classification: 'SECRET // NOFORN'
    };
  }
  return {
    ...att,
    type: att.type || (att.name.toLowerCase().endsWith('.pdf') ? 'document' : 'file'),
    size: att.size || '164 KB',
    classification: att.classification || 'SECRET // NOFORN'
  };
}

interface DgaCommsInboxProps {
  messages: DGACommunication[];
  cases: DGACase[];
  onOpenCase?: (caseId: string) => void;
}

export function DgaCommsInbox({ messages, cases, onOpenCase }: DgaCommsInboxProps) {
  const [selectedMsgId, setSelectedMsgId] = useState<string>(messages[0]?.id || '');
  const [filter, setFilter] = useState<'ALL' | CommunicationStatus>('ALL');
  const [search, setSearch] = useState<string>('');

  // Attach to case modal / state
  const [targetCaseId, setTargetCaseId] = useState<string>(cases[0]?.id || '');
  const [attachFeedback, setAttachFeedback] = useState<string | null>(null);

  // Compose Cable state
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('Directorate Operations Desk');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composePriority, setComposePriority] = useState<'Routine' | 'Priority' | 'Flash / Immediate'>('Priority');
  const [openAttachment, setOpenAttachment] = useState<string | null>(null);

  // UPGRADED COMMS ATTACHMENT SYSTEM STATE
  const [composeAttachments, setComposeAttachments] = useState<RichMailAttachment[]>([]);
  const [isAttachDrawerOpen, setIsAttachDrawerOpen] = useState<boolean>(false);
  const [attachSource, setAttachSource] = useState<'case_evidence' | 'case_doc' | 'custom'>('case_evidence');
  const [selectedCaseForAttach, setSelectedCaseForAttach] = useState<string>(cases[0]?.id || '');
  const [selectedEvidenceSourceId, setSelectedEvidenceSourceId] = useState<string>('');
  const [selectedDocSourceId, setSelectedDocSourceId] = useState<string>('');
  const [customAttName, setCustomAttName] = useState<string>('');
  const [customAttContent, setCustomAttContent] = useState<string>('');
  const [customAttType, setCustomAttType] = useState<'evidence' | 'document' | 'telemetry' | 'lab_result'>('document');
  const [attachmentActionFeedback, setAttachmentActionFeedback] = useState<string | null>(null);

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || messages[0] || null;

  const handleSelectMessage = (id: string) => {
    setSelectedMsgId(id);
    markCommunicationRead(id);
    setAttachFeedback(null);
  };

  const filteredMessages = messages.filter((m) => {
    const status = normalizeCommunicationStatus(m);
    if (filter !== 'ALL' && status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.sender.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendCable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) return;

    await sendDGACommunication({
      sender: 'Special Agent Miracle Jerome [HQ-04]',
      recipient: composeTo,
      subject: composeSubject,
      body: composeBody,
      priority: composePriority,
      classification: 'SECRET // NOFORN',
      attachments: composeAttachments.length > 0 ? composeAttachments : undefined
    });

    setIsComposing(false);
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    setIsAttachDrawerOpen(false);
  };

  const handleAddAttachmentFromEvidence = () => {
    const activeC = cases.find((c) => c.id === selectedCaseForAttach) || cases[0];
    const ev = activeC?.evidence.find((e) => e.id === selectedEvidenceSourceId) || activeC?.evidence[0];
    if (!ev) return;

    const newAtt: RichMailAttachment = {
      id: `ATT-EV-${Date.now()}`,
      name: `${ev.id}_${ev.title.replace(/\s+/g, '_')}.dat`,
      type: ev.category === 'Toxicological Specimen' ? 'lab_result' : 'evidence',
      size: '240 KB',
      classification: 'SECRET // NOFORN',
      content: `EVIDENCE SPECIMEN TRANSFER: ${ev.id}\nTITLE: ${ev.title}\nCATEGORY: ${ev.category}\nCUSTODY: ${ev.custodyStatus}\nSECURE HASH: ${ev.secureHash || 'SHA256-PENDING'}\n\nDESCRIPTION:\n${ev.description}`,
      sourceCaseId: activeC.id,
      evidenceId: ev.id
    };

    setComposeAttachments((prev) => [...prev, newAtt]);
    setIsAttachDrawerOpen(false);
  };

  const handleAddAttachmentFromDoc = () => {
    const activeC = cases.find((c) => c.id === selectedCaseForAttach) || cases[0];
    const doc = activeC?.documents.find((d) => d.id === selectedDocSourceId) || activeC?.documents[0];
    if (!doc) return;

    const newAtt: RichMailAttachment = {
      id: `ATT-DOC-${Date.now()}`,
      name: `${doc.id}_${doc.title.replace(/\s+/g, '_')}.pdf`,
      type: 'document',
      size: '142 KB',
      classification: doc.classification,
      content: `DGA OFFICIAL DISPATCH DOCKET: ${doc.id}\nTITLE: ${doc.title}\nCLASSIFICATION: ${doc.classification}\nDATE: ${doc.date}\nAUTHOR: ${doc.author}\n\nCONTENT:\n${doc.content}`,
      sourceCaseId: activeC.id
    };

    setComposeAttachments((prev) => [...prev, newAtt]);
    setIsAttachDrawerOpen(false);
  };

  const handleAddCustomAttachment = () => {
    if (!customAttName.trim()) return;

    const newAtt: RichMailAttachment = {
      id: `ATT-CUST-${Date.now()}`,
      name: customAttName.trim(),
      type: customAttType,
      size: `${Math.max(12, Math.round(customAttContent.length / 10))} KB`,
      classification: 'SECRET // NOFORN',
      content: customAttContent.trim() || '[ENCRYPTED DATA PAYLOAD - NO NOTES COMMITTED]'
    };

    setComposeAttachments((prev) => [...prev, newAtt]);
    setCustomAttName('');
    setCustomAttContent('');
    setIsAttachDrawerOpen(false);
  };

  const handleRemoveComposeAttachment = (index: number) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogAttachmentAsEvidence = async (att: MailAttachment) => {
    const caseId = selectedMsg?.caseId || targetCaseId || cases[0]?.id;
    if (!caseId) return;
    const ev = await addEvidenceFromAttachment(caseId, att);
    if (ev) {
      setAttachmentActionFeedback(`Item "${ev.title}" logged to Case ${caseId} Evidence Vault as ${ev.id}.`);
      setTimeout(() => setAttachmentActionFeedback(null), 6000);
    }
  };

  const handleRequisitionFromAttachment = async (att: MailAttachment) => {
    const caseId = selectedMsg?.caseId || targetCaseId || cases[0]?.id;
    if (!caseId) return;
    const freq = await createForensicRequestFromAttachment(caseId, att, 'toxicology');
    if (freq) {
      setAttachmentActionFeedback(`Forensic Requisition ${freq.id} filed with TRACE Central Laboratory for Case ${caseId}.`);
      setTimeout(() => setAttachmentActionFeedback(null), 6000);
    }
  };

  const handleDownloadAttachment = (att: MailAttachment) => {
    const parsed = parseRichAttachment(att);
    const content = parsed.content || `[DGA ENCRYPTED ARTIFACT]\nFILENAME: ${parsed.name}\nCLASSIFICATION: ${parsed.classification}\nSIZE: ${parsed.size}\nTIMESTAMP: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = parsed.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConvertToTask = async () => {
    if (!selectedMsg || !targetCaseId) return;
    const task = await convertCommunicationToTask(selectedMsg.id, targetCaseId);
    if (task) {
      setAttachFeedback(`Directive ${task.id} successfully registered in Case ${targetCaseId}.`);
    }
  };

  const handleConvertToCase = async () => {
    if (!selectedMsg) return;
    const newCase = await convertCommunicationToCase(selectedMsg.id);
    if (newCase) {
      setAttachFeedback(`Mission Case ${newCase.id} generated from dispatch.`);
      if (onOpenCase) {
        onOpenCase(newCase.id);
      }
    }
  };

  const handleSnoozeCable = () => {
    if (!selectedMsg) return;
    setAttachFeedback(`Cable ${selectedMsg.id} snoozed. Notification deferred.`);
  };

  const handleAttachToCase = async () => {
    if (!selectedMsg || !targetCaseId) return;
    await attachCommunicationToCase(targetCaseId, selectedMsg.id);
    setAttachFeedback(`Successfully linked cable ${selectedMsg.id} to Case ${targetCaseId}.`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#e9e8f0]">
      {/* LEFT COLUMN: MESSAGE LIST */}
      <div className="w-80 md:w-96 border-r border-[#cfcddb] flex flex-col bg-[#f4f3f8]">
        <div className="p-3 border-b border-[#cfcddb] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4d4b68] flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#5d5a86]" />
              SATELLITE CABLE INBOX
            </span>
            <button
              onClick={() => setIsComposing(true)}
              className="px-2.5 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>TRANSMIT CABLE</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7b7899]" />
            <input
              type="text"
              placeholder="Search sender, subject, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#cfcddb] rounded pl-8 pr-3 py-1.5 text-xs text-[#2a293c] placeholder-[#9593aa] focus:outline-none focus:border-[#7c79a8]"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto text-[10px] pb-0.5 scrollbar-none font-bold">
            {[
              { id: 'ALL', label: `ALL (${messages.length})` },
              { id: 'UNREAD', label: `UNREAD (${messages.filter((m) => normalizeCommunicationStatus(m) === 'UNREAD').length})` },
              { id: 'ACTION REQUIRED', label: `ACTION REQUIRED (${messages.filter((m) => normalizeCommunicationStatus(m) === 'ACTION REQUIRED').length})`, highlight: messages.some((m) => normalizeCommunicationStatus(m) === 'ACTION REQUIRED') },
              { id: 'RESPONDED', label: `RESPONDED (${messages.filter((m) => normalizeCommunicationStatus(m) === 'RESPONDED').length})` },
              { id: 'ARCHIVED', label: `ARCHIVED (${messages.filter((m) => normalizeCommunicationStatus(m) === 'ARCHIVED').length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#5d5a86] text-white font-semibold'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 hover:bg-amber-200'
                    : 'bg-[#e4e2ec] hover:bg-[#d8d6e3] text-[#555370]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#cfcddb]">
          {filteredMessages.map((msg) => {
            const isSelected = selectedMsg?.id === msg.id;
            const commStatus = normalizeCommunicationStatus(msg);

            return (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg.id)}
                className={`p-3 cursor-pointer transition-all border-l-4 ${
                  isSelected
                    ? 'bg-white border-l-[#5d5a86] shadow-sm'
                    : 'hover:bg-[#ebeaf2] border-l-transparent'
                } ${!msg.read ? 'font-semibold' : ''}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                    <span className="text-xs text-[#252438] truncate">{msg.sender}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 border ${
                      commStatus === 'ACTION REQUIRED'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : commStatus === 'UNREAD'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : commStatus === 'RESPONDED'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {commStatus}
                  </span>
                </div>

                <div className="text-xs text-[#1e1d2c] line-clamp-1 mb-1 font-bold">
                  {msg.subject}
                </div>

                <div className="text-[11px] text-[#696783] line-clamp-2">
                  {msg.body}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8583a0] mt-2 pt-1 border-t border-[#e8e7f0]">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{msg.classification}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: MESSAGE VIEWER OR COMPOSER */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {isComposing ? (
          /* COMPOSE CABLE VIEW */
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cfcddb] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#1f1e2f] flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#5d5a86]" />
                  Transmit Encrypted Satellite Cable
                </h2>
                <div className="text-xs text-[#696783]">Origin: Special Agent Miracle Jerome (HQ-04)</div>
              </div>

              <button
                onClick={() => setIsComposing(false)}
                className="text-xs text-[#6c6a85] hover:text-[#252438]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendCable} className="space-y-4 w-full max-w-4xl text-xs">
              <div>
                <label className="block font-semibold text-[#484661] mb-1">RECIPIENT / STATION</label>
                <select
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-white border border-[#cfcddb] rounded px-3 py-2 text-xs text-[#201f30] focus:outline-none focus:border-[#7c79a8]"
                >
                  <option value="Directorate Operations Desk">Directorate Operations Desk (Langley/HQ)</option>
                  <option value="TRACE Forensic Laboratory">TRACE Forensic Laboratory - Chemical / Specimen Unit</option>
                  <option value="Station Geneva - Diplomatic Field Unit">Station Geneva - Diplomatic Field Unit</option>
                  <option value="National SCADA Defense Cell">National SCADA Defense Cell</option>
                  <option value="Epidemiological Emergency Taskforce">Epidemiological Emergency Taskforce</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#484661] mb-1">TRANSMISSION PRIORITY</label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as 'Routine' | 'Priority' | 'Flash / Immediate')}
                    className="w-full bg-white border border-[#cfcddb] rounded px-3 py-2 text-xs text-[#201f30] focus:outline-none focus:border-[#7c79a8]"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Priority">Priority</option>
                    <option value="Flash / Immediate">Flash / Immediate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#484661] mb-1">CLASSIFICATION</label>
                  <input
                    type="text"
                    disabled
                    value="SECRET // NOFORN"
                    className="w-full bg-[#f4f3f8] border border-[#cfcddb] rounded px-3 py-2 text-xs text-[#52506b] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#484661] mb-1">SUBJECT</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent request for spectrometry confirmation on Specimen A-4"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-white border border-[#cfcddb] rounded px-3 py-2 text-xs text-[#201f30] focus:outline-none focus:border-[#7c79a8]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#484661] mb-1">CABLE TRANSMISSION BODY</label>
                <textarea
                  rows={10}
                  placeholder="Draft encrypted dispatch..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-white border border-[#cfcddb] rounded-lg p-3 text-xs font-mono text-[#252438] leading-relaxed focus:outline-none focus:border-[#7c79a8]"
                  required
                />
              </div>

              {/* ATTACHMENT SECTION IN COMPOSER */}
              <div className="space-y-2 border border-[#cfcddb] rounded-lg p-3 bg-[#f8f7fc]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#35334d] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#5d5a86]" />
                    <span>ENCRYPTED CABLE ATTACHMENTS ({composeAttachments.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAttachDrawerOpen(!isAttachDrawerOpen)}
                    className="px-2.5 py-1 bg-[#dedce7] hover:bg-[#cfcddb] text-[#2c2a41] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAttachDrawerOpen ? 'Close Attachment Drawer' : 'Attach Artifact / Evidence'}</span>
                  </button>
                </div>

                {/* Attached items list */}
                {composeAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {composeAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#cfcddb] rounded px-2.5 py-1 text-xs flex items-center gap-2 shadow-2xs"
                      >
                        {att.type === 'lab_result' ? (
                          <Beaker className="w-3 h-3 text-[#5d5a86]" />
                        ) : att.type === 'telemetry' ? (
                          <Cpu className="w-3 h-3 text-[#5d5a86]" />
                        ) : (
                          <FileText className="w-3 h-3 text-[#5d5a86]" />
                        )}
                        <span className="font-medium text-[#201f30]">{att.name}</span>
                        <span className="text-[10px] text-[#787693] font-mono">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveComposeAttachment(idx)}
                          className="text-[#8886a1] hover:text-rose-600 cursor-pointer p-0.5"
                          title="Remove attachment"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attachment Source Drawer */}
                {isAttachDrawerOpen && (
                  <div className="p-3 bg-white border border-[#cfcddb] rounded-lg space-y-3 mt-2 text-xs">
                    <div className="flex gap-2 border-b border-[#e5e4ee] pb-2">
                      <button
                        type="button"
                        onClick={() => setAttachSource('case_evidence')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          attachSource === 'case_evidence'
                            ? 'bg-[#5d5a86] text-white'
                            : 'bg-[#edecef] text-[#484661] hover:bg-[#dedce7]'
                        }`}
                      >
                        Case Evidence Vault
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachSource('case_doc')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          attachSource === 'case_doc'
                            ? 'bg-[#5d5a86] text-white'
                            : 'bg-[#edecef] text-[#484661] hover:bg-[#dedce7]'
                        }`}
                      >
                        Official Documents
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachSource('custom')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          attachSource === 'custom'
                            ? 'bg-[#5d5a86] text-white'
                            : 'bg-[#edecef] text-[#484661] hover:bg-[#dedce7]'
                        }`}
                      >
                        Custom Payload
                      </button>
                    </div>

                    {/* SOURCE 1: CASE EVIDENCE */}
                    {attachSource === 'case_evidence' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Select Case</label>
                            <select
                              value={selectedCaseForAttach}
                              onChange={(e) => setSelectedCaseForAttach(e.target.value)}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            >
                              {cases.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.id} - {c.title.slice(0, 28)}...
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Select Evidence Item</label>
                            <select
                              value={selectedEvidenceSourceId}
                              onChange={(e) => setSelectedEvidenceSourceId(e.target.value)}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            >
                              {(cases.find((c) => c.id === selectedCaseForAttach) || cases[0])?.evidence.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                  {ev.id} - {ev.title} ({ev.category})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddAttachmentFromEvidence}
                            className="px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Attach Selected Evidence Item</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SOURCE 2: CASE DOCUMENTS */}
                    {attachSource === 'case_doc' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Select Case</label>
                            <select
                              value={selectedCaseForAttach}
                              onChange={(e) => setSelectedCaseForAttach(e.target.value)}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            >
                              {cases.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.id} - {c.title.slice(0, 28)}...
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Select Case Document</label>
                            <select
                              value={selectedDocSourceId}
                              onChange={(e) => setSelectedDocSourceId(e.target.value)}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            >
                              {(cases.find((c) => c.id === selectedCaseForAttach) || cases[0])?.documents.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                  {doc.id} - {doc.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddAttachmentFromDoc}
                            className="px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Attach Selected Document</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SOURCE 3: CUSTOM PAYLOAD */}
                    {attachSource === 'custom' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Filename</label>
                            <input
                              type="text"
                              placeholder="e.g. spectrograph_peaks_a4.dat"
                              value={customAttName}
                              onChange={(e) => setCustomAttName(e.target.value)}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Artifact Type</label>
                            <select
                              value={customAttType}
                              onChange={(e) => setCustomAttType(e.target.value as 'evidence' | 'document' | 'telemetry' | 'lab_result')}
                              className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded px-2.5 py-1.5 text-xs text-[#201f30] focus:outline-none"
                            >
                              <option value="document">Questioned Document</option>
                              <option value="telemetry">Digital Telemetry / Hex</option>
                              <option value="lab_result">Laboratory Analytical Result</option>
                              <option value="evidence">Physical Item Record</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#64627d] uppercase mb-1">Payload Content</label>
                          <textarea
                            rows={3}
                            placeholder="Data stream, transcript, or lab notes..."
                            value={customAttContent}
                            onChange={(e) => setCustomAttContent(e.target.value)}
                            className="w-full bg-[#f8f7fc] border border-[#cfcddb] rounded p-2 text-xs font-mono text-[#201f30] focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddCustomAttachment}
                            className="px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Package Payload to Cable</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 border border-[#cfcddb] rounded text-xs text-[#555370] hover:bg-[#f4f3f8]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT VIA SATELLITE</span>
                </button>
              </div>
            </form>
          </div>
        ) : selectedMsg ? (
          /* READ CABLE VIEW */
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Header info */}
            <div className="p-6 border-b border-[#cfcddb] bg-[#fdfdfd] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-[#dedce7] text-[#35334e] px-2 py-0.5 rounded">
                      CABLE {selectedMsg.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        normalizeCommunicationStatus(selectedMsg) === 'ACTION REQUIRED'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : normalizeCommunicationStatus(selectedMsg) === 'UNREAD'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : normalizeCommunicationStatus(selectedMsg) === 'RESPONDED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      STATUS: {normalizeCommunicationStatus(selectedMsg)}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {selectedMsg.classification}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${
                        selectedMsg.priority === 'Flash / Immediate'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedMsg.priority}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-[#1f1e2f]">{selectedMsg.subject}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleConvertToTask}
                    className="px-2.5 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Convert this cable directly into an operational directive within selected case"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>CONVERT TO DIRECTIVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConvertToCase}
                    className="px-2.5 py-1.5 bg-[#4c4a6b] hover:bg-[#3d3b58] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Procedurally spawn an active case dossier from this dispatch"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>CONVERT TO CASE</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSnoozeCable}
                    className="px-2 py-1.5 border border-[#cfcddb] bg-white hover:bg-[#f4f3f8] text-[#555370] rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Snooze cable notifications"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                    <span>SNOOZE</span>
                  </button>
                </div>
              </div>

              {/* Attach to case bar */}
              <div className="p-3 bg-[#f8f7fc] border border-[#cfcddb] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#5d5a86]" />
                  <span className="font-semibold text-[#302e48]">Link Dispatch to Active Case:</span>
                  <select
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    className="bg-white border border-[#cfcddb] rounded px-2.5 py-1 text-xs text-[#201f30] focus:outline-none focus:border-[#7c79a8]"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.title.slice(0, 32)}...
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAttachToCase}
                  className="px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold shrink-0"
                >
                  Attach to Case File
                </button>
              </div>

              {attachFeedback && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{attachFeedback}</span>
                </div>
              )}

              {/* Metadata strip */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-[#ebe9f2] text-xs text-[#5e5c7a]">
                <div>
                  <span className="text-[#8785a3] block text-[10px] uppercase font-bold">FROM</span>
                  <strong className="text-[#201f30]">{selectedMsg.sender}</strong>
                </div>
                <div>
                  <span className="text-[#8785a3] block text-[10px] uppercase font-bold">TO</span>
                  <strong className="text-[#201f30]">{selectedMsg.recipient}</strong>
                </div>
                <div>
                  <span className="text-[#8785a3] block text-[10px] uppercase font-bold">TIMESTAMP</span>
                  <strong className="text-[#201f30]">{new Date(selectedMsg.timestamp).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Cable Content */}
            <div className="p-6 space-y-5">
              <div className="bg-[#f8f7fc] border border-[#e4e2ee] rounded-lg p-5 font-mono text-xs text-[#2c2b3e] leading-relaxed whitespace-pre-wrap shadow-inner">
                {selectedMsg.body}
              </div>

              {/* Attachments */}
              {selectedMsg.attachments && selectedMsg.attachments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#e5e3ee]">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#4e4c6b] flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#5d5a86]" />
                      <span>ENCRYPTED SATELLITE ATTACHMENTS ({selectedMsg.attachments.length})</span>
                    </div>
                    {attachmentActionFeedback && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{attachmentActionFeedback}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {selectedMsg.attachments.map((att, idx) => {
                      const richAtt = parseRichAttachment(att);
                      const key = `${selectedMsg.id}-${idx}`;
                      const isOpen = openAttachment === key;

                      return (
                        <div
                          key={key}
                          className="bg-white border border-[#cfcddb] rounded-lg p-3 text-xs shadow-2xs hover:border-[#9b98bc] transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 rounded bg-[#f2f1f8] border border-[#cfcddb] text-[#5d5a86] shrink-0">
                                {richAtt.type === 'lab_result' ? (
                                  <Beaker className="w-4 h-4 text-[#5d5a86]" />
                                ) : richAtt.type === 'telemetry' ? (
                                  <Cpu className="w-4 h-4 text-[#5d5a86]" />
                                ) : (
                                  <FileText className="w-4 h-4 text-[#5d5a86]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#201f30] truncate flex items-center gap-2">
                                  <span>{richAtt.name}</span>
                                  <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold">
                                    {richAtt.classification || 'SECRET'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#787693] font-mono mt-0.5">
                                  Type: <strong className="uppercase">{richAtt.type || 'FILE'}</strong> • Size: {richAtt.size || '142 KB'}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons on Attachment */}
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setOpenAttachment(isOpen ? null : key)}
                                className="px-2.5 py-1 bg-[#dedce7] hover:bg-[#cfcddb] text-[#2c2a41] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Expand inline preview"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{isOpen ? 'COLLAPSE' : 'PREVIEW'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleLogAttachmentAsEvidence(att)}
                                className="px-2.5 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Extract and record this artifact into active Case Evidence Vault"
                              >
                                <Shield className="w-3 h-3" />
                                <span>LOG AS EVIDENCE</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRequisitionFromAttachment(att)}
                                className="px-2.5 py-1 bg-[#4c4a6b] hover:bg-[#3d3b58] text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Requisition TRACE Forensic Laboratory analysis"
                              >
                                <Beaker className="w-3 h-3" />
                                <span>LAB REQ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadAttachment(att)}
                                className="p-1 hover:bg-[#ebeaf2] border border-[#cfcddb] rounded text-[#555370] cursor-pointer"
                                title="Download decrypted artifact payload"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Preview */}
                          {isOpen && (
                            <div className="mt-3 pt-2.5 border-t border-[#edecef] space-y-2">
                              <div className="text-[10px] font-mono font-bold uppercase text-[#696788] flex items-center justify-between">
                                <span>Decrypted Content Payload</span>
                                <span>Encoding: UTF-8 / ASCII Telemetry</span>
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-[11px] text-[#222135] bg-[#f8f7fc] border border-[#e2e0ed] rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed shadow-inner">
                                {richAtt.content || '[NO RAW BODY PAYLOAD STORED FOR THIS ARTIFACT]'}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-[#807e9c]">
            Select a cable to view transmission details
          </div>
        )}
      </div>
    </div>
  );
}
