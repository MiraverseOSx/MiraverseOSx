'use client';

import {
  DGAState,
  DGACase,
  EvidenceItem,
  DocumentReference,
  Task,
  ForensicRequest,
  DGACommunication,
  DgaAlert,
  AgencyActivityItem
} from '@/lib/dga-types';
import { VoicemailRecord, CallLogEntry } from '@/lib/phone-data';
import { emitDgaEvent } from '@/lib/dga-events';

export interface IncomingCallEventPayload {
  callerName: string;
  callerTitle: string;
  callerDepartment: string;
  callerAvatar: string;
  headlineMessage: string;
  contactId: string;
  caseId: string;
}

export interface EngineExecutionResult {
  mutated: boolean;
  notices: string[];
}

/**
 * Event + Communications Engine
 *
 * Implements the circular causality where every player action creates downstream
 * signals across the entire agency workspace:
 *
 * PLAYER ACTION
 *       ↓
 *     EVENT
 *       ↓
 * ┌──────────────┬─────────────┬─────────────┐
 * ↓              ↓             ↓
 * EMAIL        PHONE CALL     TASK
 * ↓              ↓             ↓
 * REPORT       VOICEMAIL     REQUEST
 * ↓              ↓             ↓
 * EVIDENCE       └─────┬───────┘
 *                      ↓
 *                  CASE UPDATE
 */
export class EventCommsEngine {
  private static instance: EventCommsEngine;

  public static getInstance(): EventCommsEngine {
    if (!EventCommsEngine.instance) {
      EventCommsEngine.instance = new EventCommsEngine();
    }
    return EventCommsEngine.instance;
  }

  /**
   * 1. ACCEPT CASE → INTRODUCTORY EMAIL & DISPATCH ALERT
   */
  public handleCaseAccepted(state: DGAState, caseId: string, investigatorName: string): boolean {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false;

    const now = new Date().toISOString();

    // Check if intro cable already present
    const hasIntroCable = state.communications.some((comm) => comm.caseId === caseId && comm.sender.includes('Thorne'));
    if (!hasIntroCable) {
      const introCable: DGACommunication = {
        id: `CABLE-INTRO-${caseId.replace(/[^a-zA-Z0-9]/g, '')}`,
        sender: 'Dr. Gregory Thorne, MD [St. Jude Medical ICU]',
        recipient: `${investigatorName} [Primary Investigator]`,
        subject: `CASE ASSIGNMENT DISPATCH // DOCKET ${caseId}: Clinical Intake Briefing`,
        body: `Investigator,\n\nI have received confirmation of your formal jurisdictional assignment over Docket ${caseId}. Patient Christian Vance remains intubated under acute autonomic storm. Our preliminary venipuncture and gastric aspirate vials are sealed in the biological transfer locker under Chain of Custody Protocol 4-B.\n\nPlease authorize immediate laboratory intake and chemical mass spectrometry before biological sample integrity degrades.\n\nRespectfully,\nDr. Gregory Thorne, MD\nDirector of Clinical Toxicology, St. Jude Metropolitan`,
        timestamp: now,
        read: false,
        status: 'ACTION REQUIRED',
        priority: 'Flash / Immediate',
        classification: 'TOP SECRET // NOFORN',
        threadId: `TH-${caseId}-INTAKE`,
        caseId: c.id
      };
      state.communications.unshift(introCable);

      emitDgaEvent({
        type: 'COMMUNICATION_RECEIVED',
        caseId: c.id,
        actor: 'Dr. Gregory Thorne',
        payload: introCable
      });
    }

    return true;
  }

  /**
   * 2. OPEN EVIDENCE → REVEAL NEW LEAD & CROSS-REFERENCE
   */
  public handleEvidenceOpened(state: DGAState, caseId: string, evidenceId: string): boolean {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false;

    const ev = c.evidence.find((e) => e.id === evidenceId);
    if (!ev) return false;

    const leadNoteId = `NOTE-LEAD-${evidenceId}`;
    const alreadyInspected = c.notes.some((n) => n.id === leadNoteId);
    if (alreadyInspected) return false;

    const now = new Date().toISOString();
    let leadText = `Forensic examination of exhibit [${ev.id}: ${ev.title}] revealed microscopic trace markers and chain-of-custody transfer signatures.`;
    
    if (ev.id === 'EV-194-A') {
      leadText = `Lead Unlocked from EV-194-A (Whole Blood): Initial enzyme assays show 72% acetylcholinesterase suppression without alkylation aging. The inhibitor structure suggests a high-purity organophosphate fluoridate synthesized within the last 72 hours. Cross-referenced chemical catalog points directly toward Phoenix Biotech precursors.`;
    } else if (ev.id === 'EV-194-B') {
      leadText = `Lead Unlocked from EV-194-B (Rim Swab): Crystal tumbler residue reveals trace glycerol ether surfactant used specifically as a stabilizing carrier for aerosolized neuro-agents. Point of origin matches maritime industrial batch shipments.`;
    } else if (ev.id === 'EV-194-C') {
      leadText = `Lead Unlocked from EV-194-C (Audio Feed): Audio spectral filtration isolated a low-frequency diesel engine harmonic at 01:41:22 UTC outside the pantry door, consistent with a customized commercial delivery vehicle.`;
    }

    c.notes.unshift({
      id: leadNoteId,
      agentId: state.profile.id,
      agentName: state.profile.name,
      timestamp: now,
      content: leadText
    });

    c.timeline.unshift({
      id: `TL-LEAD-${Date.now()}`,
      timestamp: now,
      type: 'EVIDENCE_LOGGED',
      actor: state.profile.name,
      description: `Discovered evidentiary lead from inspecting ${ev.id}: ${ev.title}`
    });

    // Check if new person or location can be corroborated
    const suspect = c.people.find((p) => p.personId === 'P-103');
    if (suspect && suspect.status !== 'Primary Target // Red Notice Queued') {
      suspect.status = 'Primary Target // Red Notice Queued';
    }

    emitDgaEvent({
      type: 'EVIDENCE_OPENED',
      caseId: c.id,
      actor: state.profile.name,
      payload: { evidenceId, leadText }
    });

    return true;
  }

  /**
   * 3. SUBMIT REQUEST → PENDING / QUEUED STATUS
   */
  public handleRequestSubmitted(state: DGAState, caseId: string, requestId: string): boolean {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false;

    const req = c.forensicRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'QUEUED';
    const now = new Date().toISOString();

    c.timeline.unshift({
      id: `TL-REQ-Q-${Date.now()}`,
      timestamp: now,
      type: 'FORENSIC_REQUESTED',
      actor: state.profile.name,
      description: `Requisition ${req.id} queued for TRACE forensic spectrometry run.`
    });

    return true;
  }

  /**
   * 4. TIMER/EVENT COMPLETES → INCOMING PHONE CALL EVENT
   */
  public triggerIncomingPhoneCall(caseId: string, caller: {
    callerName: string;
    callerTitle: string;
    callerDepartment: string;
    callerAvatar: string;
    headlineMessage: string;
    contactId: string;
  }): IncomingCallEventPayload {
    const payload: IncomingCallEventPayload = {
      ...caller,
      caseId
    };

    emitDgaEvent({
      type: 'INCOMING_CALL_TRIGGERED',
      caseId,
      actor: caller.callerName,
      payload
    });

    return payload;
  }

  /**
   * 5. MISS / DECLINE CALL → VOICEMAIL CREATED IN PHONE SUBSYSTEM
   */
  public handleCallMissed(state: DGAState, call: IncomingCallEventPayload): VoicemailRecord {
    const now = new Date().toISOString();
    const vmId = `VM-${Date.now().toString().slice(-4)}`;

    const vm: VoicemailRecord = {
      id: vmId,
      contactId: call.contactId,
      callerName: call.callerName,
      callerTitle: call.callerTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '0:42',
      durationSeconds: 42,
      isNew: true,
      subject: `MISSED CALL: ${call.headlineMessage}`,
      transcript: `“Special Agent Jerome, this is ${call.callerName}. You missed my priority call regarding Docket ${call.caseId}. ${call.headlineMessage}. Review the secure log and execute the corresponding directive immediately upon listening to this dispatch.”`,
      caseId: call.caseId,
      callbackAction: 'ASSIGN_INSPECTION_DIRECTIVE'
    };

    // Alert operator of new voicemail
    state.alerts.unshift({
      id: `ALT-VM-${Date.now()}`,
      level: 'FLASH',
      title: `PRIORITY VOICEMAIL: ${call.callerName}`,
      message: `${call.headlineMessage}. Stored in phone terminal voicemail box.`,
      source: 'SECURE VOIP SWITCHBOARD',
      timestamp: now,
      actionRequired: true,
      caseId: call.caseId
    });

    emitDgaEvent({
      type: 'CALL_MISSED',
      caseId: call.caseId,
      actor: call.callerName,
      payload: vm
    });

    emitDgaEvent({
      type: 'VOICEMAIL_RECEIVED',
      caseId: call.caseId,
      actor: call.callerName,
      payload: vm
    });

    return vm;
  }

  /**
   * 6. LISTEN TO VOICEMAIL → DIRECTIVE / TASK CREATED IN CASE
   */
  public handleVoicemailListened(state: DGAState, vm: VoicemailRecord): Task | null {
    if (!vm.caseId) return null;
    const c = state.cases.find((item) => item.id === vm.caseId);
    if (!c) return null;

    const taskId = `TSK-${vm.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const alreadyCreated = c.tasks.some((t) => t.id === taskId);
    if (alreadyCreated) return null;

    const now = new Date().toISOString();
    const newTask: Task = {
      id: taskId,
      caseId: c.id,
      title: `Follow Up on Voicemail from ${vm.callerName}`,
      description: `Action directive derived from priority voice recording (${vm.timestamp}):\n"${vm.transcript}"\n\nExecute field investigation and document the operational findings.`,
      phase: 'Active Investigation',
      priority: 'High',
      completed: false,
      status: 'pending',
      assignedTo: state.profile.name,
      tags: ['#VOICEMAIL_DIRECTIVE', `#${vm.id}`]
    };

    c.tasks.unshift(newTask);
    c.updatedAt = now;

    c.timeline.unshift({
      id: `TL-VM-TSK-${Date.now()}`,
      timestamp: now,
      type: 'TASK_COMPLETED',
      actor: state.profile.name,
      description: `Task created from voicemail: "${newTask.title}"`
    });

    emitDgaEvent({
      type: 'VOICEMAIL_LISTENED',
      caseId: c.id,
      actor: state.profile.name,
      payload: { voicemail: vm, task: newTask }
    });

    emitDgaEvent({
      type: 'TASK_CREATED',
      caseId: c.id,
      actor: state.profile.name,
      payload: newTask
    });

    return newTask;
  }

  /**
   * 7. COMPLETE TASK → GENERATE NEW DOCUMENT / REPORT
   */
  public handleTaskCompleted(state: DGAState, caseId: string, taskId: string): DocumentReference | null {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false as any;

    const task = c.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const docId = `DOC-REP-${task.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4)}`;
    const alreadyExists = c.documents.some((d) => d.id === docId);
    if (alreadyExists) return null;

    const now = new Date().toISOString();
    const newDoc: DocumentReference = {
      id: docId,
      title: `Tactical Debrief & Field Finding: ${task.title.slice(0, 40)}`,
      classification: 'SECRET // NOFORN',
      date: new Date().toISOString().slice(0, 10),
      author: `${state.profile.name} [Investigator]`,
      content: `OPERATIONAL REPORT RECORD\nREFERENCE TASK: ${task.id} (${task.title})\nTIMESTAMP: ${now}\nINVESTIGATOR: ${state.profile.name}\n\nEXECUTIVE SUMMARY:\nInvestigative actions concluded successfully regarding task directive. Field forensics corroborated biological residue markers and intercepted logistics records linking Phoenix Biotech's harbor distribution center to the delivery van manifestation.\n\nRECOMMENDATION:\nAnalyze document to formally log extracted evidentiary specimens into the secure evidence locker.`
    };

    c.documents.unshift(newDoc);
    c.updatedAt = now;

    c.timeline.unshift({
      id: `TL-DOC-${Date.now()}`,
      timestamp: now,
      type: 'DOCUMENT_ATTACHED',
      actor: state.profile.name,
      description: `Generated investigative report: "${newDoc.title}"`
    });

    emitDgaEvent({
      type: 'SYSTEM_DOCUMENT_ATTACHED',
      caseId: c.id,
      actor: state.profile.name,
      payload: newDoc
    });

    return newDoc;
  }

  /**
   * 8. ANALYZE DOCUMENT → EXTRACT NEW EVIDENCE
   */
  public handleDocumentAnalyzed(state: DGAState, caseId: string, docId: string): EvidenceItem | null {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return null;

    const doc = c.documents.find((d) => d.id === docId);
    if (!doc) return null;

    const evId = `EV-ANALYSIS-${doc.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4)}`;
    const alreadyExtracted = c.evidence.some((e) => e.id === evId);
    if (alreadyExtracted) return null;

    const now = new Date().toISOString();
    const newEvidence: EvidenceItem = {
      id: evId,
      title: `Extracted Forensic Lead Exhibit from ${doc.title.slice(0, 30)}`,
      category: 'Document',
      description: `Formal evidentiary artifact extracted through algorithmic textual and forensic analysis of document [${doc.id}]. Contains verified cryptographic signatures, chain of custody logs, and precursor manifest serial numbers.`,
      locationFound: `Investigative Document Archive // ${doc.id}`,
      dateRecovered: now,
      custodyStatus: 'In DGA Custody',
      secureHash: `SHA256-${Date.now().toString(16).toUpperCase()}`
    };

    c.evidence.unshift(newEvidence);
    c.updatedAt = now;

    c.timeline.unshift({
      id: `TL-EV-ANALYZED-${Date.now()}`,
      timestamp: now,
      type: 'EVIDENCE_LOGGED',
      actor: state.profile.name,
      description: `Extracted and logged new evidence ${newEvidence.id} from document ${doc.id}`
    });

    emitDgaEvent({
      type: 'DOCUMENT_ANALYZED',
      caseId: c.id,
      actor: state.profile.name,
      payload: { doc, evidence: newEvidence }
    });

    emitDgaEvent({
      type: 'EVIDENCE_LOGGED',
      caseId: c.id,
      actor: state.profile.name,
      payload: newEvidence
    });

    // Check if evidence threshold is met
    this.checkEvidenceThreshold(state, c.id);

    return newEvidence;
  }

  /**
   * 9. EVIDENCE THRESHOLD MET → SUPERVISOR EMAIL
   */
  public checkEvidenceThreshold(state: DGAState, caseId: string): boolean {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false;

    // Threshold: 4 or more evidence items secured
    if (c.evidence.length >= 4) {
      const emailId = `COMM-SUPERVISOR-${caseId.replace(/[^a-zA-Z0-9]/g, '')}`;
      const alreadySent = state.communications.some((comm) => comm.id === emailId);
      if (alreadySent) return false;

      const now = new Date().toISOString();
      const supervisorEmail: DGACommunication = {
        id: emailId,
        sender: 'Deputy Director Evelyn Cross [DGA Executive Directorate]',
        recipient: `${state.profile.name} [Lead Investigator]`,
        subject: `EXECUTIVE REVIEW: Evidence Threshold Reached on Docket ${caseId}`,
        body: `Special Agent Jerome,\n\nYour investigative team has secured sufficient material exhibits (${c.evidence.length} physical and analytical items logged) on Docket ${caseId}. The evidentiary threshold for formal judicial indictment and cabinet briefing has now been satisfied.\n\nYou are authorized to compile the comprehensive dossier and execute the FINAL INCIDENT REPORT for formal Case Closure Review.\n\nOutstanding work on securing the chain of custody.\n\n-- Evelyn Cross\nDeputy Director, Counter-Proliferation & Major Crimes`,
        timestamp: now,
        read: false,
        status: 'ACTION REQUIRED',
        priority: 'Flash / Immediate',
        classification: 'TOP SECRET // NOFORN',
        threadId: `TH-${caseId}-CLOSURE`,
        caseId: c.id
      };

      state.communications.unshift(supervisorEmail);

      state.alerts.unshift({
        id: `ALT-SUP-${Date.now()}`,
        level: 'CRITICAL',
        title: 'EXECUTIVE DIRECTIVE: Evidence Threshold Met',
        message: `Deputy Director Cross authorized Docket ${caseId} for Final Case Closure Review.`,
        source: 'EXECUTIVE DIRECTORATE',
        timestamp: now,
        actionRequired: true,
        caseId: c.id
      });

      emitDgaEvent({
        type: 'COMMUNICATION_RECEIVED',
        caseId: c.id,
        actor: 'Deputy Director Evelyn Cross',
        payload: supervisorEmail
      });

      return true;
    }

    return false;
  }

  /**
   * 10. SUBMIT FINAL REPORT → CASE CLOSURE REVIEW
   */
  public handleFinalReportSubmitted(
    state: DGAState,
    caseId: string,
    summary: string,
    determination: 'REFERRED' | 'CLOSED'
  ): boolean {
    const c = state.cases.find((item) => item.id === caseId);
    if (!c) return false;

    const now = new Date().toISOString();
    const prevStatus = c.status;
    c.status = determination;
    c.updatedAt = now;

    // Timeline event
    c.timeline.unshift({
      id: `TL-CLOSURE-${Date.now()}`,
      timestamp: now,
      type: 'STATUS_CHANGED',
      actor: state.profile.name,
      description: `Final Incident Report submitted for closure review. Determination: ${determination}. Summary: ${summary.slice(0, 100)}...`
    });

    // Add agency activity
    const activity: AgencyActivityItem = {
      id: `ACT-CLOSURE-${Date.now()}`,
      timestamp: now,
      system: c.leadSystem,
      headline: `Case Closed / Referred: Docket ${c.id} [${determination}]`,
      details: `Primary Investigator ${state.profile.name} submitted final findings: "${summary.slice(0, 90)}..."`,
      caseId: c.id,
      priority: 'High'
    };
    state.agencyActivityFeed.unshift(activity);
    state.activityFeed.unshift(activity);

    // Final acknowledgment cable
    const finalComm: DGACommunication = {
      id: `COMM-FIN-${Date.now().toString().slice(-4)}`,
      sender: 'Department of Justice / Liaison Magistrate',
      recipient: `${state.profile.name} [Lead Investigator]`,
      subject: `OFFICIAL CLOSURE AUDIT RECEIPT // Docket ${caseId}`,
      body: `Special Agent Jerome,\n\nYour final report on Docket ${caseId} has been archived with federal criminal indexation. Investigative docket status transitioned to ${determination}.\n\nFinal Report Summary:\n${summary}\n\nCase records sealed under Statutory Record Directive 10-A.`,
      timestamp: now,
      read: false,
      status: 'RESPONDED',
      priority: 'Routine',
      classification: 'SECRET // NOFORN',
      threadId: `TH-${caseId}-CLOSURE`,
      caseId: c.id
    };
    state.communications.unshift(finalComm);

    emitDgaEvent({
      type: 'CASE_CLOSURE_REVIEW_INITIATED',
      caseId: c.id,
      actor: state.profile.name,
      payload: { determination, summary }
    });

    emitDgaEvent({
      type: 'CASE_STATUS_CHANGED',
      caseId: c.id,
      actor: state.profile.name,
      payload: { previous: prevStatus, current: determination, summary }
    });

    return true;
  }
}

export const eventCommsEngine = EventCommsEngine.getInstance();
