'use client';

import React, { useState } from 'react';
import {
  FolderLock,
  Search,
  Plus,
  CheckCircle2,
  Circle,
  FileText,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Save,
  Clock,
  Tag,
  AlertTriangle,
  Beaker,
  ChevronLeft,
  PanelLeft,
  History,
  MessageSquare,
  Lock,
  PenTool,
  FileSignature,
  Eye,
  CheckCheck,
  HeartPulse,
  Video,
  Globe,
  Landmark,
  Link as LinkIcon,
  ArrowRight,
  ExternalLink,
  Target,
  FileCheck2,
  Send,
  Edit3,
  Layers,
  Compass,
  X,
  UserPlus,
  PackagePlus,
  Calendar
} from 'lucide-react';
import {
  DGACase,
  Task,
  CaseStatus,
  Priority,
  CaseDepartment,
  normalizeCaseStatus,
  EvidenceItem,
  PersonReference,
  FindingKind
} from '@/lib/dga-types';
import {
  toggleDGATask,
  createDGATask,
  addDGACaseNote,
  updateDGACaseStatus,
  createDGAForensicRequest,
  acceptAndSignDGACase,
  getDGAState,
  addDGACaseEvidence,
  addDGACasePerson,
  addDGACaseTimelineEvent,
  updateDGACaseDetails,
  requestCaseMedicalRecords,
  amendIncidentNarrative,
  linkExistingPersonToCase,
  recordInvestigativeFinding,
  submitCaseFinalReport
} from '@/lib/dga-store';
import { canCloseCase } from '@/lib/dga-case-engine';
import { sendDgaCaseToTrace } from '@/lib/dga-trace-bridge';
import {
  escalateMedicalCaseToInvestigation,
  generateIntelligenceLeadFromInvestigation,
  triggerGovernmentBriefingFromIntel
} from '@/lib/dga-crosslink-engine';
import { DgaDecisionModal } from './dga-decision-modal';
import { DgaCaseCreationWizard } from './dga-case-creation-wizard';
import { DgaTaskDetailModal } from './work-management/dga-task-detail-modal';
import { DgaCaseBuilder } from './dga-case-builder';
import { DgaInvestigatorDesk } from './workspace/dga-investigator-desk';

interface DgaCaseRegistryProps {
  cases: DGACase[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onOpenTraceWithCase?: (traceCaseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export type FileSection =
  | 'overview'
  | 'people'
  | 'medical'
  | 'evidence'
  | 'forensics'
  | 'requests'
  | 'findings'
  | 'documents'
  | 'tasks'
  | 'timeline'
  | 'disposition'
  | 'gm_blueprint';

export function DgaCaseRegistry({
  cases,
  selectedCaseId,
  onSelectCase,
  onOpenTraceWithCase,
  onNavigateTab
}: DgaCaseRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('ACTIVE');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'Investigation' | 'Medical' | 'Intelligence' | 'Government'>('all');
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  // Two-Tier Workspace Presentation: 'desk' (Investigator's Desk) vs 'file' (Complete Case File)
  const [workspaceView, setWorkspaceView] = useState<'desk' | 'file'>('desk');
  const [activeFileSection, setActiveFileSection] = useState<FileSection>('overview');
  const [crossoverFeedback, setCrossoverFeedback] = useState<string | null>(null);

  // Quick Action Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedTaskModal, setSelectedTaskModal] = useState<Task | null>(null);

  // Form Modals
  const [isLogEvidenceModalOpen, setIsLogEvidenceModalOpen] = useState(false);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isRequestMedstatModalOpen, setIsRequestMedstatModalOpen] = useState(false);
  const [isRequisitionTraceModalOpen, setIsRequisitionTraceModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditNarrativeModalOpen, setIsEditNarrativeModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Log Evidence Form Fields
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState<EvidenceItem['category']>('Physical Item');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceLocation, setEvidenceLocation] = useState('');

  // Add Person Form Fields
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('Victim');
  const [personAffiliation, setPersonAffiliation] = useState('');
  const [personThreat, setPersonThreat] = useState<PersonReference['threatLevel']>('None');
  const [personNotes, setPersonNotes] = useState('');
  const [confirmNewPerson, setConfirmNewPerson] = useState(false);

  // Request Medical Form Fields
  const [patientName, setPatientName] = useState('');
  const [medicalFacility, setMedicalFacility] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [medicalPurpose, setMedicalPurpose] = useState('');
  const [medicalError, setMedicalError] = useState<string | null>(null);

  // Requisition TRACE Form Fields
  const [traceSelectedEvidence, setTraceSelectedEvidence] = useState<string[]>([]);
  const [traceModules, setTraceModules] = useState<string[]>(['toxicology', 'spectroscopy']);
  const [traceRequisitionNotes, setTraceRequisitionNotes] = useState('');

  // Add Task Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPhase, setTaskPhase] = useState<Task['phase']>('Active Investigation');

  // Edit Narrative Form Field
  const [narrativeText, setNarrativeText] = useState('');
  const [narrativeReason, setNarrativeReason] = useState('');
  const [findingKind, setFindingKind] = useState<FindingKind>('Investigator Observation');
  const [findingStatement, setFindingStatement] = useState('');
  const [isRecordFindingOpen, setIsRecordFindingOpen] = useState(false);

  // Add Note Form Field
  const [noteContent, setNoteContent] = useState('');

  // Timeline Filter
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'EVIDENCE' | 'FORENSIC' | 'SYSTEM' | 'TASK'>('ALL');
  const [newTimelineDesc, setNewTimelineDesc] = useState('');

  // Primary Investigator Signature State (for Awaiting Acceptance)
  const [signatureName, setSignatureName] = useState('Special Agent Miracle Jerome [HQ-04]');
  const [signatureText, setSignatureText] = useState('/s/ Miracle Jerome, Lead Investigator');
  const [affirmJurisdiction, setAffirmJurisdiction] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccessToast, setSignSuccessToast] = useState<string | null>(null);

  // TRACE Transfer feedback
  const [isTransferringToTrace, setIsTransferringToTrace] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  const activeCases = cases.filter((c) => normalizeCaseStatus(c.status) === 'ACTIVE');
  const availableCases = cases.filter((c) => normalizeCaseStatus(c.status) === 'AVAILABLE');
  const onHoldCases = cases.filter((c) => normalizeCaseStatus(c.status) === 'ON HOLD');
  const referredCases = cases.filter((c) => normalizeCaseStatus(c.status) === 'REFERRED');
  const closedCases = cases.filter((c) => normalizeCaseStatus(c.status) === 'CLOSED');

  const activeCase =
    cases.find((c) => c.id === selectedCaseId) ||
    (systemFilter === 'ACTIVE'
      ? activeCases[0]
      : systemFilter === 'AVAILABLE'
      ? availableCases[0]
      : cases[0]) ||
    null;

  // Retrieve Phase 2 simulation state
  const dgaState = getDGAState();
  const activeCasePendingDecision = dgaState.decisions.find(
    (d) => d.caseId === activeCase?.id && d.status === 'pending'
  );
  const activeCaseBlueprint = activeCase ? dgaState.caseBlueprints[activeCase.id] : undefined;
  const activeCaseRelationships = dgaState.caseRelationships.filter(
    (r) => r.sourceCaseId === activeCase?.id || r.targetCaseId === activeCase?.id
  );

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesSystem = true;
    if (systemFilter === 'ALL' || systemFilter === 'all') {
      matchesSystem = true;
    } else {
      matchesSystem = normalizeCaseStatus(c.status) === systemFilter;
    }

    let matchesDept = true;
    if (departmentFilter !== 'all') {
      matchesDept =
        c.department === departmentFilter ||
        (departmentFilter === 'Medical' && c.id.startsWith('MED')) ||
        (departmentFilter === 'Investigation' && (c.id.startsWith('INV') || c.id.startsWith('DGA'))) ||
        (departmentFilter === 'Intelligence' && (c.id.startsWith('INT') || c.id.startsWith('CYB'))) ||
        (departmentFilter === 'Government' && c.id.startsWith('GOV'));
    }

    return matchesSearch && matchesSystem && matchesDept;
  });

  // Action Handlers
  const handleTaskToggle = async (taskId: string) => {
    if (!activeCase) return;
    await toggleDGATask(activeCase.id, taskId);
  };

  const handleSignAndAccept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeCase) return;
    setIsSigning(true);
    try {
      await acceptAndSignDGACase(activeCase.id, signatureName.trim(), signatureText.trim());
      setSignSuccessToast(`Docket ${activeCase.id} successfully accepted! Status transitioned to ACTIVE.`);
      setTimeout(() => setSignSuccessToast(null), 6000);
    } finally {
      setIsSigning(false);
    }
  };

  const handleStatusChange = async (newStatus: DGACase['status']) => {
    if (!activeCase) return;

    if (activeCase.status === 'Awaiting Acceptance' && newStatus === 'Active') {
      alert('Statutory Rule: To mark this case ACTIVE, sign the acceptance docket as Primary Investigator.');
      return;
    }

    if (newStatus === 'Closed') {
      const check = canCloseCase(activeCase);
      if (!check.allowed) {
        alert(check.reason);
        return;
      }
    }

    await updateDGACaseStatus(activeCase.id, newStatus);
  };

  const handleSendToTraceDirect = () => {
    handleOpenModal('requisition_trace');
  };

  // Modal Open Handlers
  const handleOpenModal = (
    modalName:
      | 'log_evidence'
      | 'add_person'
      | 'request_medstat'
      | 'requisition_trace'
      | 'add_task'
      | 'edit_narrative'
      | 'add_note'
      | 'record_finding'
  ) => {
    if (modalName === 'log_evidence') {
      setEvidenceTitle('');
      setEvidenceDescription('');
      setEvidenceLocation('');
      setIsLogEvidenceModalOpen(true);
    } else if (modalName === 'add_person') {
      setPersonName('');
      setPersonAffiliation('');
      setPersonNotes('');
      setIsAddPersonModalOpen(true);
    } else if (modalName === 'request_medstat') {
      const victim = activeCase?.people.find((p) => p.role.toLowerCase().includes('victim'));
      setPatientName(victim?.name || '');
      setMedicalNotes('');
      setIsRequestMedstatModalOpen(true);
    } else if (modalName === 'requisition_trace') {
      setTraceSelectedEvidence(activeCase ? activeCase.evidence.map((e) => e.id) : []);
      setTraceRequisitionNotes('');
      setIsRequisitionTraceModalOpen(true);
    } else if (modalName === 'add_task') {
      setTaskTitle('');
      setTaskDesc('');
      setIsAddTaskModalOpen(true);
    } else if (modalName === 'edit_narrative') {
      setNarrativeText(activeCase?.summary || '');
      setIsEditNarrativeModalOpen(true);
    } else if (modalName === 'add_note') {
      setNoteContent('');
      setIsAddNoteModalOpen(true);
    } else if (modalName === 'record_finding') {
      setFindingStatement('');
      setIsRecordFindingOpen(true);
    }
  };

  // Submit Modals
  const handleSubmitLogEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !evidenceTitle.trim()) return;

    await addDGACaseEvidence(activeCase.id, {
      title: evidenceTitle.trim(),
      category: evidenceCategory,
      description: evidenceDescription.trim(),
      locationFound: evidenceLocation.trim(),
      dateRecovered: '',
      custodyStatus: 'In DGA Custody'
    });

    setIsLogEvidenceModalOpen(false);
  };

  const handleSubmitAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !personName.trim()) return;

    const directory = getDGAState().people;
    const exactDirectoryMatch = directory.some((person) => person.name.toLowerCase() === personName.trim().toLowerCase());
    if (exactDirectoryMatch && !confirmNewPerson) {
      alert('An existing CIVITAS record matches this name. Link that record, or confirm that this is a different person.');
      return;
    }

    await addDGACasePerson(
      activeCase.id,
      {
        name: personName.trim(),
        role: personRole.trim(),
        affiliation: personAffiliation.trim(),
        threatLevel: personThreat,
        status: 'Unknown',
        notes: personNotes.trim()
      },
      { allowDuplicateName: confirmNewPerson }
    );

    setIsAddPersonModalOpen(false);
  };

  const handleSubmitRequestMedstat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !patientName.trim()) return;

    const linkedPerson = activeCase.people.find((person) => person.name.toLowerCase() === patientName.trim().toLowerCase());
    const res = await requestCaseMedicalRecords(activeCase.id, patientName.trim(), medicalFacility, medicalNotes.trim(), {
      subjectPersonId: linkedPerson?.personId,
      recordsRequested: medicalNotes.trim() || 'Records requested by the investigator',
      purpose: medicalPurpose.trim() || undefined
    });
    if (!res.success) {
      setMedicalError(res.message);
      return;
    }
    setMedicalError(null);
    setTransferFeedback(res.message);
    setIsRequestMedstatModalOpen(false);
  };

  const handleSubmitRequisitionTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    const items = activeCase.evidence.filter((ev) => traceSelectedEvidence.includes(ev.id));
    if (items.length === 0 || traceModules.length === 0) {
      alert(items.length === 0 ? 'Select at least one evidence item.' : 'Select a laboratory module.');
      return;
    }
    setIsTransferringToTrace(true);
    const result = await sendDgaCaseToTrace(activeCase, items, traceModules);
    setIsTransferringToTrace(false);

    setTransferFeedback(result.message);
    if (!result.success) {
      alert(result.message);
    }
    if (result.success || result.partial) setIsRequisitionTraceModalOpen(false);
  };

  const handleSubmitAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !taskTitle.trim()) return;

    await createDGATask(activeCase.id, {
      title: taskTitle.trim(),
      description: taskDesc.trim() || 'Field objective task.',
      assignedTo: activeCase.assignedAgents[0] || 'Special Agent Miracle Jerome',
      phase: taskPhase
    });

    setIsAddTaskModalOpen(false);
  };

  const handleSubmitEditNarrative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !narrativeText.trim()) return;

    try {
      await amendIncidentNarrative(activeCase.id, narrativeText, narrativeReason);
      setNarrativeReason('');
      setIsEditNarrativeModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'The narrative could not be saved.');
    }
  };

  const handleSubmitAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !noteContent.trim()) return;

    await addDGACaseNote(activeCase.id, noteContent.trim());
    setIsAddNoteModalOpen(false);
  };

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !newTimelineDesc.trim()) return;

    await addDGACaseTimelineEvent(activeCase.id, {
      description: newTimelineDesc.trim(),
      type: 'NOTE_ADDED',
      timestamp: new Date().toISOString(),
      actor: activeCase.primaryInvestigator || 'Special Agent Miracle Jerome'
    });
    setNewTimelineDesc('');
  };

  const handleNavigateToFileSection = (section: FileSection) => {
    setWorkspaceView('file');
    setActiveFileSection(section);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* COLLAPSED EXPAND RAIL */}
      {isListCollapsed && (
        <button
          onClick={() => setIsListCollapsed(false)}
          className="w-8 border-r border-[#cfcddb] bg-[#f4f3f8] hover:bg-[#eae8f3] flex flex-col items-center justify-start pt-3 gap-3 transition-colors cursor-pointer text-[#5d5a86] shrink-0"
          title="Expand Case Directory"
        >
          <PanelLeft className="w-4 h-4" />
          <span className="text-[10px] font-mono font-bold [writing-mode:vertical-lr] tracking-widest text-[#726f91] uppercase">
            CASES ({filteredCases.length})
          </span>
        </button>
      )}

      {/* LEFT SIDEBAR: CASE LIST */}
      {!isListCollapsed && (
        <div className="w-64 sm:w-72 lg:w-76 max-w-[300px] border-r border-[#cfcddb] flex flex-col bg-[#f4f3f8] shrink-0">
          <div className="p-2.5 border-b border-[#cfcddb] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4d4b68] flex items-center gap-1.5 whitespace-nowrap">
                <FolderLock className="w-3.5 h-3.5 text-[#5d5a86] shrink-0" />
                <span>CASES ({filteredCases.length})</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-2 py-0.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                  title="File new incident report or compile scenario"
                >
                  <Plus className="w-3 h-3" />
                  <span>NEW CASE</span>
                </button>
                <button
                  onClick={() => setIsListCollapsed(true)}
                  className="p-1 hover:bg-[#e4e2ec] text-[#696784] hover:text-[#201f30] rounded transition-colors cursor-pointer"
                  title="Collapse case list panel for fullscreen dossier"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#7b7899]" />
              <input
                type="text"
                placeholder="Search ID, title, summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#cfcddb] rounded pl-8 pr-2.5 py-1 text-xs text-[#2a293c] placeholder-[#9593aa] focus:outline-none focus:border-[#7c79a8]"
              />
            </div>

            {/* Department Filter tabs */}
            <div className="flex gap-1 overflow-x-auto text-[9px] pb-1 scrollbar-thin scrollbar-thumb-[#cfcddb] font-bold">
              {[
                { id: 'all', label: 'ALL' },
                { id: 'Investigation', label: 'INV' },
                { id: 'Medical', label: 'MED' },
                { id: 'Intelligence', label: 'INTEL' },
                { id: 'Government', label: 'GOV' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepartmentFilter(d.id as any)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    departmentFilter === d.id
                      ? 'bg-[#5d5a86] text-white'
                      : 'bg-white border border-[#cfcddb] text-[#555371] hover:bg-[#eae8f3]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Status Filter buttons */}
            <div className="flex gap-1 overflow-x-auto text-[9px] pb-0.5 scrollbar-thin scrollbar-thumb-[#cfcddb] font-bold">
              {[
                { id: 'ACTIVE', label: `ACTIVE (${activeCases.length})` },
                { id: 'AVAILABLE', label: `INTAKE (${availableCases.length})` },
                { id: 'ALL', label: `ALL (${cases.length})` }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSystemFilter(s.id)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    systemFilter === s.id
                      ? 'bg-[#3b3956] text-white'
                      : 'bg-white border border-[#cfcddb] text-[#555371] hover:bg-[#eae8f3]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cases List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase?.id;
              const unreadNotes = c.notes.length;
              const isCrit = c.priority === 'Critical';

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-200/80 border-l-4 border-l-slate-900'
                      : 'hover:bg-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
                    <span className="font-bold text-slate-900">{c.id}</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded uppercase text-[10px] ${
                        isCrit ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug">
                    {c.title}
                  </div>

                  <div className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                    {c.summary}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 font-medium">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{c.leadSystem}</span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      {c.evidence.length} exhibits • {c.people.length} subjects
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">No cases matching filter criteria.</div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT MAIN WORKSPACE */}
      {!activeCase ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#faf9fd]">
          <FolderLock className="w-12 h-12 text-[#9a97ba] mb-3" />
          <h2 className="text-base font-bold text-[#2a283e]">No Case Selected</h2>
          <p className="text-xs text-[#6e6b8a] mt-1 max-w-sm">
            Select an operational dossier from the directory on the left or file a New Incident Report.
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="mt-4 px-4 py-2 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>File New Incident Report</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* TOP PERSISTENT DOCKET HEADER & PRIMARY WORKSPACE SWITCHER */}
          <div className="px-4 py-2.5 border-b border-[#cfcddb] bg-[#fbfbfe] space-y-2 shrink-0">
            {/* Top row: Badges, Title, and Workspace Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {isListCollapsed && (
                  <button
                    onClick={() => setIsListCollapsed(false)}
                    className="p-1 hover:bg-[#dedce7] text-[#4d4b68] rounded transition-colors cursor-pointer mr-1"
                    title="Expand Case Directory"
                  >
                    <PanelLeft className="w-4 h-4 text-[#5d5a86]" />
                  </button>
                )}
                <span className="font-mono text-xs font-bold bg-[#35334d] text-white px-2 py-0.5 rounded shrink-0">
                  {activeCase.id}
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shrink-0">
                  {activeCase.classification}
                </span>
                <span className="text-[10px] font-bold text-[#5c5a77] uppercase tracking-wide shrink-0">
                  LEAD: {activeCase.leadSystem}
                </span>
              </div>

              {/* Center / Right: Two-Tier Presentation Switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-[#e8e6f1] p-0.5 rounded-md border border-[#cfcddb] text-xs font-bold">
                  <button
                    onClick={() => setWorkspaceView('desk')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                      workspaceView === 'desk'
                        ? 'bg-[#5d5a86] text-white shadow-2xs'
                        : 'text-[#504d6d] hover:text-[#201f30]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>INVESTIGATOR'S DESK</span>
                  </button>
                  <button
                    onClick={() => setWorkspaceView('file')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                      workspaceView === 'file'
                        ? 'bg-[#5d5a86] text-white shadow-2xs'
                        : 'text-[#504d6d] hover:text-[#201f30]'
                    }`}
                  >
                    <FolderLock className="w-3.5 h-3.5" />
                    <span>COMPLETE CASE FILE (11 SECTIONS)</span>
                  </button>
                </div>

                {/* Status Dropdown */}
                <select
                  value={activeCase.status}
                  onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                  className="bg-white border border-[#cfcddb] rounded px-2 py-1 text-xs font-bold text-[#252438] focus:outline-none focus:border-[#7c79a8] cursor-pointer"
                >
                  {activeCase.status === 'Awaiting Acceptance' && (
                    <option value="Awaiting Acceptance">Status: Awaiting Acceptance</option>
                  )}
                  <option value="Active" disabled={activeCase.status === 'Awaiting Acceptance'}>
                    Status: Active
                  </option>
                  <option value="Under Review">Status: Under Review</option>
                  <option value="Suspended">Status: Suspended</option>
                  <option value="Closed">Status: Closed</option>
                </select>

                <button
                  onClick={handleSendToTraceDirect}
                  disabled={isTransferringToTrace}
                  className="px-2 py-1 bg-[#4c4a6b] hover:bg-[#3d3b58] text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  title="Submit specimens to TRACE Forensic Laboratory"
                >
                  <Beaker className="w-3.5 h-3.5" />
                  <span>REQUEST TRACE</span>
                </button>
              </div>
            </div>

            {/* Title Line */}
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold text-[#1f1e2f] tracking-tight leading-snug">
                {activeCase.title}
              </h1>
              <span className="text-[11px] text-[#6a6886]">
                Department: <strong className="text-[#201f30]">{activeCase.department || 'Investigation'}</strong>
              </span>
            </div>

            {/* Awaiting Acceptance Affirmation Strip if needed */}
            {activeCase.status === 'Awaiting Acceptance' && (
              <div className="bg-amber-50 border border-amber-300 rounded p-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold min-w-0">
                  <FileSignature className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Dossier Awaiting Official Acceptance. Sign credentials to activate full investigative jurisdiction.</span>
                </div>
                <button
                  onClick={handleSignAndAccept}
                  disabled={isSigning}
                  className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded text-xs transition-colors cursor-pointer shrink-0"
                >
                  {isSigning ? 'Signing...' : 'Sign & Activate Docket'}
                </button>
              </div>
            )}

            {/* Verified Signature Strip (When Accepted) */}
            {activeCase.status !== 'Awaiting Acceptance' && activeCase.primaryInvestigator && (
              <div className="bg-emerald-50 border border-emerald-300 rounded px-2.5 py-1 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold">INVESTIGATOR JURISDICTION ACTIVE:</span>{' '}
                  <span className="font-semibold text-emerald-900">{activeCase.primaryInvestigator}</span>
                  {activeCase.investigatorSignature && (
                    <span className="font-mono text-[10.5px] text-emerald-800 ml-1 font-bold">
                      [{activeCase.investigatorSignature}]
                    </span>
                  )}
                </div>
                {activeCase.signedAt && (
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {new Date(activeCase.signedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {signSuccessToast && (
              <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 rounded px-3 py-2 text-xs font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                <span>{signSuccessToast}</span>
              </div>
            )}

            {/* TRACE Feedback Banner */}
            {transferFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{transferFeedback}</span>
                </div>
                <button onClick={() => setTransferFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* SECONDARY NAVIGATION: ONLY WHEN IN COMPLETE CASE FILE (11 SECTIONS) */}
          {workspaceView === 'file' && (
            <div className="flex border-b border-[#cfcddb] bg-[#f4f3f8] px-3 text-xs font-semibold overflow-x-auto scrollbar-thin scrollbar-thumb-[#cfcddb] shrink-0 py-0.5">
              {[
                { id: 'overview', label: '1. Overview & Intake', icon: FileText, count: undefined },
                { id: 'people', label: '2. People & Entities', icon: Users, count: activeCase.people.length },
                { id: 'medical', label: '3. Medical & Clinical', icon: HeartPulse, count: activeCase.medicalRecordId ? 1 : 0 },
                { id: 'evidence', label: '4. Evidence Vault', icon: Beaker, count: activeCase.evidence.length },
                { id: 'forensics', label: '5. TRACE Laboratory', icon: ArrowUpRight, count: activeCase.forensicRequests.length },
                { id: 'requests', label: '6. Agency Dispatches', icon: Send, count: undefined },
                { id: 'findings', label: '7. Findings & Hypotheses', icon: Target, count: undefined },
                { id: 'documents', label: '8. Documents & Cables', icon: FileText, count: activeCase.documents.length },
                { id: 'tasks', label: '9. Directives & Tasks', icon: CheckCircle2, count: activeCase.tasks.length },
                { id: 'timeline', label: '10. Case Timeline', icon: History, count: activeCase.timeline.length },
                { id: 'disposition', label: '11. Indictment & Closure', icon: FileCheck2, count: undefined }
              ].map((sec) => {
                const Icon = sec.icon;
                const isActive = activeFileSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveFileSection(sec.id as FileSection)}
                    className={`py-2 px-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-[#5d5a86] text-[#201f30] bg-purple-100/60 font-bold'
                        : 'border-transparent text-[#676582] hover:text-[#2c2b3d]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sec.label}</span>
                    {sec.count !== undefined && <span className="text-[10px] opacity-75">({sec.count})</span>}
                  </button>
                );
              })}

            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#fbfbfe]">
            {/* TIER 1: INVESTIGATOR'S DESK */}
            {workspaceView === 'desk' && (
              <DgaInvestigatorDesk
                caseData={activeCase}
                onNavigateToFileSection={handleNavigateToFileSection}
                onOpenModal={handleOpenModal}
                onOpenTraceWithCase={onOpenTraceWithCase}
                onNavigateTab={onNavigateTab}
              />
            )}

            {/* TIER 2: COMPLETE CASE FILE (11 SECTIONS) */}
            {workspaceView === 'file' && (
              <div className="max-w-6xl mx-auto space-y-4">
                {/* SECTION 1: OVERVIEW & INTAKE */}
                {activeFileSection === 'overview' && (
                  <div className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#ecebf2] pb-3">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 1: INCIDENT INTAKE & CASE OVERVIEW
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Authoritative intake parameters recorded when Docket {activeCase.id} was filed.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('edit_narrative')}
                        className="px-2.5 py-1 rounded bg-[#dedce7] hover:bg-[#cfcddb] text-[#302e48] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Narrative</span>
                      </button>
                    </div>

                    <div className="bg-[#f8f7fc] border border-[#e2e0ed] rounded-lg p-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d5a86]">
                        Reported Incident Narrative
                      </span>
                      <p className="text-xs text-[#2a293c] leading-relaxed whitespace-pre-line">
                        {activeCase.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Docket Identifier</span>
                        <div className="font-mono font-bold text-[#2c2a3e]">{activeCase.id}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Priority & Classification</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.priority} • {activeCase.classification}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Lead Department</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.department || 'Investigation'}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Reported At</span>
                        <div className="font-bold text-[#2c2a3e]">{new Date(activeCase.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Incident Date</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.incidentOccurredAt || 'Unknown'}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Location</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.incidentLocationText || 'Unknown'}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Reporting Party</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.reportingParty || 'Unknown'}</div>
                      </div>
                      <div className="p-3 bg-[#fdfdfe] border border-[#cfcddb] rounded space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716e90]">Narrative Revisions</span>
                        <div className="font-bold text-[#2c2a3e]">{activeCase.incidentRevisions?.length || 0}</div>
                      </div>
                    </div>

                    {activeCaseRelationships.length > 0 && (
                      <div className="p-3 bg-[#f2f1f7] border border-[#dedce7] rounded space-y-1.5 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#474564] text-[10px]">
                          Inter-Case Connections ({activeCaseRelationships.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCaseRelationships.map((rel) => {
                            const targetId = rel.sourceCaseId === activeCase.id ? rel.targetCaseId : rel.sourceCaseId;
                            return (
                              <button
                                key={rel.id}
                                type="button"
                                onClick={() => onSelectCase(targetId)}
                                className="inline-flex items-center gap-1.5 bg-white border border-[#cfcddb] hover:border-[#5d5a86] px-2 py-0.5 rounded font-mono text-[10px] text-[#302e48] cursor-pointer transition-colors shadow-2xs"
                              >
                                <strong className="text-[#5d5a86]">{targetId}</strong>
                                <span className="text-[#787693]">[{rel.type.replace('_', ' ')}]</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 2: PEOPLE & ENTITIES */}
                {activeFileSection === 'people' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 2: PEOPLE, SUBJECTS & WITNESSES ({activeCase.people.length})
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Victims, witnesses, reporting sources, persons of interest, and suspects.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('add_person')}
                        className="px-3 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Person / Subject</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeCase.people.map((person) => (
                        <div
                          key={person.personId}
                          className="bg-white border border-[#cfcddb] rounded-lg p-3.5 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-[#716e90]">{person.personId}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                person.threatLevel === 'High' || person.threatLevel === 'Severe'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Threat: {person.threatLevel}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-[#201f30]">{person.name}</h3>
                            <div className="text-[11px] font-semibold text-[#5d5a86]">{person.role}</div>
                            <div className="text-[10px] text-[#716e90]">{person.affiliation}</div>
                          </div>
                          {person.notes && (
                            <p className="text-[11px] text-[#4d4b68] leading-relaxed pt-1 border-t border-[#f0eff5]">
                              {person.notes}
                            </p>
                          )}
                        </div>
                      ))}

                      {activeCase.people.length === 0 && (
                        <div className="col-span-full py-8 text-center bg-white border border-[#cfcddb] rounded-lg">
                          <Users className="w-8 h-8 text-[#9f9cae] mx-auto mb-2" />
                          <p className="text-xs text-[#55536e]">No persons or subjects recorded for this case yet.</p>
                          <button
                            onClick={() => handleOpenModal('add_person')}
                            className="mt-3 text-xs font-bold text-[#5d5a86] underline cursor-pointer"
                          >
                            Add Initial Subject or Reporting Source
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 3: MEDICAL & CLINICAL RECORDS */}
                {activeFileSection === 'medical' && (
                  <div className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#ecebf2] pb-3">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 3: MEDICAL & CLINICAL RECORDS (MEDSTAT)
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Hospital ICU telemetry, autopsy reports, and biological toxicology screening charts.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('request_medstat')}
                        className="px-3 py-1.5 bg-rose-800 hover:bg-rose-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Requisition MEDSTAT Records</span>
                      </button>
                    </div>

                    {(activeCase.medicalRequests || []).length === 0 && !activeCase.medicalRecordId && (
                      <div className="py-8 text-center bg-[#faf9fd] border border-[#e2e0ed] rounded-lg">
                        <HeartPulse className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                        <p className="text-xs text-[#524f6d]">No medical records have been requested for this case.</p>
                        <button
                          onClick={() => handleOpenModal('request_medstat')}
                          className="mt-2 text-xs font-bold text-rose-800 underline cursor-pointer"
                        >
                          Request Medical Records
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(activeCase.medicalRequests || []).map((request) => (
                        <div key={request.id} className="p-3 border border-rose-200 rounded-lg bg-rose-50/40 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-rose-950">{request.id}</span>
                            <span className="text-[10px] font-bold uppercase text-rose-800">{request.status}</span>
                          </div>
                          <div className="font-semibold text-[#201f30]">{request.subjectName}</div>
                          <div className="text-[#5c3d45]">
                            Facility: {request.facility || 'Unknown'} · Records: {request.recordsRequested}
                          </div>
                          {request.releasedDocumentId && (
                            <div className="text-emerald-900">Released report: {request.releasedDocumentId}</div>
                          )}
                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab('medstat')}
                              className="text-[11px] font-bold text-rose-800 underline cursor-pointer"
                            >
                              Open in MEDSTAT
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: PHYSICAL & DIGITAL EVIDENCE VAULT */}
                {activeFileSection === 'evidence' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 4: EVIDENCE VAULT & CHAIN OF CUSTODY ({activeCase.evidence.length})
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Physical artifacts, toxicological specimens, ballistics, and digital media.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal('requisition_trace')}
                          className="px-3 py-1.5 bg-[#4c4a6b] hover:bg-[#3d3b58] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Beaker className="w-3.5 h-3.5" />
                          <span>Transfer to TRACE Lab</span>
                        </button>
                        <button
                          onClick={() => handleOpenModal('log_evidence')}
                          className="px-3 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Log New Exhibit</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeCase.evidence.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-[#cfcddb] rounded-lg p-3.5 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#35334e]">{item.id}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                item.custodyStatus === 'Transferred to TRACE'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.custodyStatus}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-[#201f30]">{item.title}</h3>
                            <div className="text-[10px] text-[#6d6b88]">{item.category} • Location: {item.locationFound}</div>
                          </div>
                          <p className="text-[11px] text-[#4d4b68] leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#787693] pt-1 border-t border-[#f0eff5]">
                            <span className="font-mono">{item.secureHash || 'SHA-256'}</span>
                            {item.linkedTraceEvidenceId && (
                              <span className="font-mono text-purple-700 font-bold">
                                TRACE: {item.linkedTraceEvidenceId}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {activeCase.evidence.length === 0 && (
                        <div className="col-span-full py-8 text-center bg-white border border-[#cfcddb] rounded-lg">
                          <Beaker className="w-8 h-8 text-[#9f9cae] mx-auto mb-2" />
                          <p className="text-xs text-[#55536e]">No evidence items secured in custody vault.</p>
                          <button
                            onClick={() => handleOpenModal('log_evidence')}
                            className="mt-3 text-xs font-bold text-[#5d5a86] underline cursor-pointer"
                          >
                            Log First Evidence Exhibit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 5: TRACE FORENSIC LABORATORY */}
                {activeFileSection === 'forensics' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 5: LABORATORY & SCIENTIFIC EXAMINATIONS (TRACE)
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Mass spectrometry, toxicology screening, microscopy, and ballistic examination results.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('requisition_trace')}
                        className="px-3 py-1.5 bg-[#4c4a6b] hover:bg-[#3d3b58] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Beaker className="w-3.5 h-3.5" />
                        <span>New TRACE Requisition</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeCase.forensicRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-[#cfcddb] rounded-lg p-4 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#35334d]">{req.id}</span>
                              <span className="text-[11px] text-[#6e6c89]">
                                Requested by: {req.requestedBy} • {new Date(req.dateRequested).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                req.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          <div className="text-xs text-[#302e48] leading-relaxed">
                            {req.notes}
                          </div>

                          <div className="flex items-center gap-2 text-[10.5px] text-[#696784]">
                            <span>Target Disciplines:</span>
                            {req.targetModules.map((m) => (
                              <span key={m} className="px-1.5 py-0.2 bg-[#f0eff6] rounded border border-[#dfdceb] font-mono uppercase">
                                {m}
                              </span>
                            ))}
                          </div>

                          {req.resultSummary && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950 font-medium">
                              <span className="font-bold block mb-0.5">Official Forensic Determination:</span>
                              {req.resultSummary}
                            </div>
                          )}

                          {onOpenTraceWithCase && req.linkedTraceCaseId && (
                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => onOpenTraceWithCase(req.linkedTraceCaseId!)}
                                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open Laboratory Workbench ({req.linkedTraceCaseId})</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {activeCase.forensicRequests.length === 0 && (
                        <div className="py-8 text-center bg-white border border-[#cfcddb] rounded-lg">
                          <Beaker className="w-8 h-8 text-[#9f9cae] mx-auto mb-2" />
                          <p className="text-xs text-[#55536e]">No forensic requisitions dispatched to TRACE yet.</p>
                          <button
                            onClick={() => handleOpenModal('requisition_trace')}
                            className="mt-3 text-xs font-bold text-[#5d5a86] underline cursor-pointer"
                          >
                            Requisition Initial Mass Spectrometry Panel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 6: AGENCY REQUESTS & DISPATCHES */}
                {activeFileSection === 'requests' && (
                  <div className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#ecebf2] pb-3">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 6: INTER-AGENCY REQUESTS & DISPATCHES
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Status of all communications dispatched to CIVITAS, MEDSTAT, ORACLE, and TRACE.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dgaState.systemExchange.requests
                        .filter((r) => r.caseId === activeCase.id)
                        .map((req) => (
                          <div
                            key={req.id}
                            className="p-3 rounded border border-[#cfcddb] bg-[#fbfbfe] text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#201f30]">{req.id}</span>
                                <span className="px-1.5 py-0.2 bg-[#ecebf3] rounded text-[10px] font-mono font-bold text-[#4c4a6c]">
                                  TO: {req.targetSystem}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-100 text-indigo-900">
                                {req.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#4d4b68]">{req.summary}</div>
                            <div className="text-[10px] text-[#716e90]">
                              Created: {new Date(req.createdAt).toLocaleString()} • Requested by: {req.requestedBy}
                            </div>
                          </div>
                        ))}

                      {dgaState.systemExchange.requests.filter((r) => r.caseId === activeCase.id).length === 0 && (
                        <div className="text-center py-6 text-xs text-[#716e90]">
                          No cross-system exchange dispatches active for this docket.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 7: INVESTIGATIVE FINDINGS & HYPOTHESES (CASE BUILDER) */}
                {activeFileSection === 'findings' && (
                  <div className="space-y-3">
                    <div className="bg-white border border-[#cfcddb] rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#35334d]">Recorded findings</h3>
                        <button
                          type="button"
                          onClick={() => handleOpenModal('record_finding')}
                          className="text-xs font-bold text-[#5d5a86] underline cursor-pointer"
                        >
                          Record Finding
                        </button>
                      </div>
                      {(activeCase.findings || []).length === 0 && (
                        <p className="text-xs text-[#716e90]">No findings have been recorded. Allegations in the incident narrative are not verified facts.</p>
                      )}
                      {(activeCase.findings || []).map((finding) => (
                        <div key={finding.id} className="text-xs border border-[#ecebf2] rounded p-2">
                          <div className="font-bold text-[#35334d]">{finding.kind} · {finding.id}</div>
                          <p className="text-[#2a293c] mt-1 whitespace-pre-line">{finding.statement}</p>
                        </div>
                      ))}
                    </div>
                    <DgaCaseBuilder
                      caseData={activeCase}
                      onSelectCase={onSelectCase}
                      onOpenTraceWithCase={onOpenTraceWithCase}
                    />
                  </div>
                )}

                {/* SECTION 8: DOCUMENTS, CABLES & TRANSCRIPTS */}
                {activeFileSection === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 8: OFFICIAL DOCUMENTS, CABLES & TRANSCRIPTS ({activeCase.documents.length})
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Sworn witness statements, agency cables, forensic certificates, and judicial warrants.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('add_note')}
                        className="px-3 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Document / Note</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeCase.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border border-[#cfcddb] rounded-lg p-4 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#35334e]">{doc.id}</span>
                              <span className="text-xs font-bold text-[#201f30]">{doc.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#716e90]">{doc.date}</span>
                          </div>
                          <div className="text-[11px] text-[#6d6a89]">Author: {doc.author} • Classification: {doc.classification}</div>
                          <p className="text-xs text-[#302e48] leading-relaxed whitespace-pre-line bg-[#f8f7fc] p-3 rounded border border-[#ecebf2]">
                            {doc.content}
                          </p>
                        </div>
                      ))}

                      {activeCase.documents.length === 0 && (
                        <div className="py-8 text-center bg-white border border-[#cfcddb] rounded-lg text-xs text-[#716e90]">
                          No formal documents attached to this case.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 9: DIRECTIVES & TASKS */}
                {activeFileSection === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 9: OPERATIONAL DIRECTIVES & ACTION TASKS ({activeCase.tasks.length})
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Field directives, witness interview orders, surveillance warrants, and lab tasks.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal('add_task')}
                        className="px-3 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Directive</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeCase.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                            task.completed
                              ? 'bg-[#f4f3f8] border-[#cfcddb] text-[#63617b]'
                              : 'bg-white border-[#cfcddb] shadow-2xs text-[#201f30]'
                          }`}
                        >
                          <button
                            onClick={() => handleTaskToggle(task.id)}
                            className="mt-0.5 cursor-pointer text-[#5d5a86] hover:text-[#383656]"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#7b7899]" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${task.completed ? 'line-through text-[#797793]' : ''}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#716e90]">{task.phase}</span>
                            </div>
                            <p className="text-[11px] text-[#656381] mt-0.5 leading-snug">{task.description}</p>
                            <div className="text-[10px] text-[#8683a3] mt-1">
                              Assigned to: {task.assignedTo}
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeCase.tasks.length === 0 && (
                        <div className="py-8 text-center bg-white border border-[#cfcddb] rounded-lg text-xs text-[#716e90]">
                          No directives assigned. Use "Add Directive" to create team tasks.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 10: CASE TIMELINE */}
                {activeFileSection === 'timeline' && (
                  <div className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#ecebf2] pb-3">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                          SECTION 10: CASE INCIDENT & INVESTIGATION TIMELINE ({activeCase.timeline.length})
                        </h2>
                        <p className="text-xs text-[#716e90] mt-0.5">
                          Chronological log of incident occurrences, evidence receipts, and operational actions.
                        </p>
                      </div>
                    </div>

                    {/* Timeline Filter and Add Form */}
                    <div className="space-y-2">
                      <div className="flex gap-1 overflow-x-auto text-[10px] font-bold">
                        {(['ALL', 'EVIDENCE', 'FORENSIC', 'SYSTEM', 'TASK'] as const).map((flt) => (
                          <button
                            key={flt}
                            type="button"
                            onClick={() => setTimelineFilter(flt)}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              timelineFilter === flt
                                ? 'bg-[#5d5a86] text-white'
                                : 'bg-[#ecebf2] text-[#555371] hover:bg-[#dedce7]'
                            }`}
                          >
                            {flt}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddTimelineEvent} className="flex gap-2">
                        <input
                          type="text"
                          value={newTimelineDesc}
                          onChange={(e) => setNewTimelineDesc(e.target.value)}
                          placeholder="Log chronological event or observation..."
                          className="flex-1 bg-white border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#201f30] outline-none focus:border-[#5d5a86]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          Add Entry
                        </button>
                      </form>
                    </div>

                    <div className="space-y-3 pt-2">
                      {activeCase.timeline
                        .filter((evt) => {
                          if (timelineFilter === 'ALL') return true;
                          if (timelineFilter === 'EVIDENCE') return evt.type === 'EVIDENCE_LOGGED';
                          if (timelineFilter === 'FORENSIC') return evt.type.includes('FORENSIC') || evt.type.includes('TRACE');
                          if (timelineFilter === 'SYSTEM') return evt.type.includes('SYSTEM');
                          if (timelineFilter === 'TASK') return evt.type.includes('TASK');
                          return true;
                        })
                        .map((evt) => (
                          <div
                            key={evt.id}
                            className="p-3 rounded border border-[#e8e6f1] bg-[#fdfdfe] text-xs space-y-1 relative pl-6"
                          >
                            <div className="absolute left-2.5 top-4 w-1.5 h-1.5 rounded-full bg-[#5d5a86]" />
                            <div className="flex items-center justify-between text-[10px] text-[#716e90]">
                              <span className="font-mono font-bold text-[#44406a]">{evt.type}</span>
                              <span>{new Date(evt.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="font-medium text-[#252438]">{evt.description}</div>
                            <div className="text-[10px] text-[#8683a3] italic">Recorded by: {evt.actor}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* SECTION 11: CASE DISPOSITION & INDICTMENT */}
                {activeFileSection === 'disposition' && (
                  <div className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-xs space-y-5">
                    <div className="border-b border-[#ecebf2] pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#35334d]">
                        SECTION 11: CASE DISPOSITION & FINAL INDICTMENT
                      </h2>
                      <p className="text-xs text-[#716e90] mt-0.5">
                        Formal closure findings, indictment submission, and DOJ judicial warrant packet.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#f8f7fc] border border-[#e1dfeb] rounded-lg space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d5a86]">
                          Established Cause of Incident
                        </span>
                        <div className="text-sm font-bold text-[#201f30]">
                          {activeCase.causeHypothesis?.primaryCause || 'Conclusive Cause Not Yet Formulated'}
                        </div>
                        <div className="text-xs text-[#6e6c88]">
                          Confidence Score: {activeCase.causeHypothesis?.causeConfidence ?? 20}%
                        </div>
                      </div>

                      <div className="p-4 bg-[#f8f7fc] border border-[#e1dfeb] rounded-lg space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d5a86]">
                          Prime Suspect & Formal Charge
                        </span>
                        <div className="text-sm font-bold text-[#201f30]">
                          {activeCase.causeHypothesis?.primeSuspectName || 'Subject Identification Pending'}
                        </div>
                        <div className="text-xs text-[#6e6c88]">
                          Charge: {activeCase.causeHypothesis?.formalCharge || 'Statutory Code Pending'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#ebe9f2] flex items-center justify-between">
                      <div className="text-xs text-[#6e6b8a]">
                        Status: <strong className="text-[#201f30]">{activeCase.status}</strong> • Indictment:{' '}
                        <strong className="text-purple-900">{activeCase.causeHypothesis?.indictmentStatus || 'Drafting'}</strong>
                      </div>

                      {activeCase.status !== 'Closed' && (
                        <button
                          onClick={async () => {
                            const summary = prompt(
                              'SUBMIT FINAL INDICTMENT DETERMINATION & CLOSE DOCKET:',
                              `Investigation of Docket ${activeCase.id} concluded. All physical and spectral evidence corroborates formal indictment.`
                            );
                            if (summary) {
                              await submitCaseFinalReport(activeCase.id, summary, 'CLOSED');
                              alert(`Docket ${activeCase.id} concluded and sealed.`);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow cursor-pointer transition-colors"
                        >
                          <FileCheck2 className="w-4 h-4" />
                          <span>Submit Final Indictment & Close Docket</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 12: GM BLUEPRINT (If available) */}
                {activeFileSection === 'gm_blueprint' && activeCaseBlueprint && (
                  <div className="bg-[#1c1b26] border border-[#3e3b56] rounded-lg p-5 text-[#e1dfea] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      <span>PROCEDURAL SIMULATION BLUEPRINT & HIDDEN TRUTH</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#262436] rounded border border-[#3b3850]">
                        <span className="text-[10px] text-amber-300 font-bold uppercase">Hidden Culprit</span>
                        <div className="font-bold text-white mt-0.5">{activeCaseBlueprint.hiddenTruth.culprit}</div>
                      </div>
                      <div className="p-3 bg-[#262436] rounded border border-[#3b3850]">
                        <span className="text-[10px] text-amber-300 font-bold uppercase">Hidden Cause</span>
                        <div className="font-bold text-white mt-0.5">{activeCaseBlueprint.hiddenTruth.cause}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: LOG EVIDENCE */}
      {isLogEvidenceModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitLogEvidence}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <PackagePlus className="w-4 h-4 text-slate-700" />
                LOG NEW EVIDENCE EXHIBIT
              </span>
              <button type="button" onClick={() => setIsLogEvidenceModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Exhibit Title *</label>
              <input
                type="text"
                required
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="e.g. Airlock HEPA Scrubber Filter Fragment"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={evidenceCategory}
                  onChange={(e) => setEvidenceCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
                >
                  <option value="Physical Item">Physical Item</option>
                  <option value="Toxicological Specimen">Toxicological Specimen</option>
                  <option value="Digital Media">Digital Media</option>
                  <option value="Chemical Residue">Chemical Residue</option>
                  <option value="Ballistics">Ballistics</option>
                  <option value="Document">Document</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Location Found</label>
                <input
                  type="text"
                  value={evidenceLocation}
                  onChange={(e) => setEvidenceLocation(e.target.value)}
                  placeholder="e.g. Level 4 Airlock Return Duct"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={3}
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                placeholder="Detailed exhibit appearance, condition, serial tags, or packaging notes..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLogEvidenceModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Secure Exhibit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD PERSON */}
      {isAddPersonModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAddPerson}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <UserPlus className="w-4 h-4 text-slate-700" />
                ADD PERSON / SUBJECT
              </span>
              <button type="button" onClick={() => setIsAddPersonModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Dr. Marcus Vance"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            {personName.trim().length >= 2 && (
              <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded p-2">
                {getDGAState().people
                  .filter((person) =>
                    person.name.toLowerCase().includes(personName.trim().toLowerCase()) ||
                    person.aliases.some((alias) => alias.toLowerCase().includes(personName.trim().toLowerCase()))
                  )
                  .slice(0, 4)
                  .map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={async () => {
                        if (!activeCase) return;
                        await linkExistingPersonToCase(activeCase.id, person.id, personRole);
                        setIsAddPersonModalOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:border-slate-800 cursor-pointer text-slate-800 font-medium text-xs shadow-2xs"
                    >
                      Link existing record <strong className="font-mono">{person.id}</strong>: {person.name}
                    </button>
                  ))}
                {getDGAState().people.some((person) => person.name.toLowerCase() === personName.trim().toLowerCase()) && (
                  <label className="flex items-center gap-2 text-[11px] text-amber-900 font-medium pt-1">
                    <input type="checkbox" checked={confirmNewPerson} onChange={(e) => setConfirmNewPerson(e.target.checked)} className="rounded" />
                    This is a different person. Create a new record anyway.
                  </label>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={personRole}
                  onChange={(e) => setPersonRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
                >
                  <option value="Victim">Victim</option>
                  <option value="Witness">Witness</option>
                  <option value="Reporting Party">Reporting Party</option>
                  <option value="Person of Interest">Person of Interest</option>
                  <option value="Prime Suspect">Prime Suspect</option>
                  <option value="Medical Provider">Medical Provider</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Threat Level</label>
                <select
                  value={personThreat}
                  onChange={(e) => setPersonThreat(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Affiliation / Organization</label>
              <input
                type="text"
                value={personAffiliation}
                onChange={(e) => setPersonAffiliation(e.target.value)}
                placeholder="e.g. Senior Researcher, Novatech Bio-Laboratories"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Investigative Notes</label>
              <textarea
                rows={2}
                value={personNotes}
                onChange={(e) => setPersonNotes(e.target.value)}
                placeholder="Background, statements, observations, alibi claims..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddPersonModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Save Person
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: REQUEST MEDICAL RECORDS */}
      {isRequestMedstatModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitRequestMedstat}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <HeartPulse className="w-4 h-4 text-red-600" />
                REQUISITION HOSPITAL / TOXICOLOGY RECORDS (MEDSTAT)
              </span>
              <button type="button" onClick={() => setIsRequestMedstatModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Name of the person"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            {medicalError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 font-semibold rounded text-xs">
                {medicalError}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Facility / Unit</label>
              <input
                type="text"
                value={medicalFacility}
                onChange={(e) => setMedicalFacility(e.target.value)}
                placeholder="Unknown if left blank"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Purpose</label>
              <input
                type="text"
                value={medicalPurpose}
                onChange={(e) => setMedicalPurpose(e.target.value)}
                placeholder="Why these records are being requested"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Records Requested</label>
              <textarea
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Which records are needed. Leave blank if not yet known."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsRequestMedstatModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Dispatch Requisition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: REQUISITION TRACE LAB */}
      {isRequisitionTraceModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitRequisitionTrace}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <Beaker className="w-4 h-4 text-slate-700" />
                TRACE FORENSIC LABORATORY REQUISITION
              </span>
              <button type="button" onClick={() => setIsRequisitionTraceModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Exhibits to Transfer</label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-50 p-2.5 rounded border border-slate-300">
                {activeCase.evidence.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 cursor-pointer text-xs p-1 rounded hover:bg-white text-slate-800 font-medium">
                    <input
                      type="checkbox"
                      checked={traceSelectedEvidence.includes(ev.id)}
                      onChange={(e) => {
                        if (e.target.checked) setTraceSelectedEvidence((prev) => [...prev, ev.id]);
                        else setTraceSelectedEvidence((prev) => prev.filter((id) => id !== ev.id));
                      }}
                      className="accent-slate-900 rounded"
                    />
                    <span className="font-mono text-slate-900 font-bold">{ev.id}</span>
                    <span className="truncate text-slate-700">{ev.title}</span>
                  </label>
                ))}
                {activeCase.evidence.length === 0 && (
                  <div className="text-[11px] text-slate-500 italic p-1">No evidence exhibits available in vault.</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Analytical Protocols</label>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {['toxicology', 'spectroscopy', 'microscopy', 'biology', 'digital', 'trace'].map((mod) => (
                  <label key={mod} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-300 hover:border-slate-800 cursor-pointer text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={traceModules.includes(mod)}
                      onChange={(e) => {
                        if (e.target.checked) setTraceModules((prev) => [...prev, mod]);
                        else setTraceModules((prev) => prev.filter((m) => m !== mod));
                      }}
                      className="accent-slate-900 rounded"
                    />
                    <span className="uppercase font-mono text-[10.5px]">{mod}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsRequisitionTraceModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTransferringToTrace}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                {isTransferringToTrace ? 'Transmitting...' : 'Dispatch Requisition'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: ADD DIRECTIVE */}
      {isAddTaskModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAddTask}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ADD OPERATIONAL DIRECTIVE
              </span>
              <button type="button" onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Directive Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Subpoena Novatech Airlock Badge Telemetry"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Investigation Phase</label>
              <select
                value={taskPhase}
                onChange={(e) => setTaskPhase(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
              >
                <option value="Preliminary">Preliminary</option>
                <option value="Active Investigation">Active Investigation</option>
                <option value="Forensic Analysis">Forensic Analysis</option>
                <option value="Intervention">Intervention</option>
                <option value="Prosecution">Prosecution</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={3}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Instructions, expected deliverables, specific warrants..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Create Directive
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: EDIT NARRATIVE */}
      {isEditNarrativeModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitEditNarrative}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-xl w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <Edit3 className="w-4 h-4 text-slate-700" />
                EDIT INCIDENT REPORT NARRATIVE
              </span>
              <button type="button" onClick={() => setIsEditNarrativeModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Incident Report Narrative *</label>
              <textarea
                rows={8}
                required
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded text-slate-900 outline-none resize-y leading-relaxed focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for amendment</label>
              <input
                type="text"
                value={narrativeReason}
                onChange={(e) => setNarrativeReason(e.target.value)}
                placeholder="Optional. The previous narrative is kept in the revision history."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditNarrativeModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Update Narrative
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: ADD FIELD NOTE */}
      {isAddNoteModalOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAddNote}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                ADD INVESTIGATOR FIELD NOTE
              </span>
              <button type="button" onClick={() => setIsAddNoteModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Note Content *</label>
              <textarea
                rows={4}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log field interview takeaways, phone calls, or observations..."
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 8: RECORD FINDING */}
      {isRecordFindingOpen && activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!findingStatement.trim()) return;
              await recordInvestigativeFinding(activeCase.id, {
                kind: findingKind,
                statement: findingStatement
              });
              setIsRecordFindingOpen(false);
            }}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <Target className="w-4 h-4 text-slate-700" />
                RECORD INVESTIGATIVE FINDING
              </span>
              <button type="button" onClick={() => setIsRecordFindingOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Finding Category</label>
              <select
                value={findingKind}
                onChange={(e) => setFindingKind(e.target.value as FindingKind)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
              >
                {([
                  'Reported Information',
                  'Investigator Observation',
                  'Documentary Information',
                  'Laboratory Finding',
                  'Medical Finding',
                  'Inference or Hypothesis',
                  'Verified Fact',
                  'Disputed Information'
                ] as FindingKind[]).map((kind) => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Statement *</label>
              <textarea
                required
                rows={4}
                value={findingStatement}
                onChange={(e) => setFindingStatement(e.target.value)}
                placeholder="Record only what the supporting material says. Do not upgrade an allegation to a verified fact."
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setIsRecordFindingOpen(false)} className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs">
                Save Finding
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CASE CREATION WIZARD (INCIDENT-FIRST) */}
      <DgaCaseCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCaseCreated={(caseId) => {
          setWorkspaceView('desk');
          onSelectCase(caseId);
        }}
      />

      {/* CONSEQUENTIAL DECISION MODAL */}
      {activeCasePendingDecision && (
        <DgaDecisionModal
          decision={activeCasePendingDecision}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
        />
      )}

      {/* INTERACTIVE TASK DETAIL MODAL */}
      <DgaTaskDetailModal
        task={selectedTaskModal}
        cases={cases}
        customFieldDefs={[]}
        isFavorite={false}
        isOpen={!!selectedTaskModal}
        onClose={() => setSelectedTaskModal(null)}
        onSelectCase={onSelectCase}
      />
    </div>
  );
}
