'use client';

import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { createDGACase } from '@/lib/dga-store';
import { DGACase, Priority } from '@/lib/dga-types';

interface DgaCaseCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (caseId: string) => void;
}

export function DgaCaseCreationWizard({
  isOpen,
  onClose,
  onCaseCreated
}: DgaCaseCreationWizardProps) {
  const [narrative, setNarrative] = useState('');
  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [incidentTime, setIncidentTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('');
  const [reportingParty, setReportingParty] = useState('');
  const [priority, setPriority] = useState<Priority>('Routine');
  const [initialNotes, setInitialNotes] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; content?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const loaded: Array<{ name: string; type: string; content?: string }> = [];
    for (const file of Array.from(fileList)) {
      try {
        const text = await file.text();
        loaded.push({ name: file.name, type: file.type || 'document', content: text.slice(0, 8000) });
      } catch {
        loaded.push({ name: file.name, type: file.type || 'document' });
      }
    }
    setAttachments((prev) => [...prev, ...loaded]);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!narrative.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const caseId = `INC-26-${randomSuffix}`;
      const now = new Date().toISOString();

      const workingTitle =
        title.trim() ||
        (narrative.trim().length > 60
          ? `${narrative.trim().slice(0, 60)}...`
          : narrative.trim());

      const newCase: DGACase = {
        id: caseId,
        title: workingTitle,
        classification: 'UNCLASSIFIED // FOUO',
        status: 'Active',
        priority,
        department: 'Investigation',
        leadSystem: 'CIVITAS',
        supportingSystems: ['TRACE'],
        assignedAgents: ['Special Agent Miracle Jerome'],
        primaryInvestigator: 'Special Agent Miracle Jerome',
        summary: narrative.trim(),
        objectives: [],
        tasks: [],
        evidence: [],
        people: reportingParty.trim()
          ? [
              {
                personId: `PERS-${Date.now().toString().slice(-4)}`,
                name: reportingParty.trim(),
                role: 'Reporting Party / First Responder',
                affiliation: location.trim() || 'Independent / Unverified',
                threatLevel: 'None',
                status: 'Contacted',
                notes: 'Recorded during initial incident intake.'
              }
            ]
          : [],
        organizations: [],
        locations: location.trim()
          ? [
              {
                locationId: `LOC-${Date.now().toString().slice(-4)}`,
                name: location.trim(),
                significance: 'Reported Incident Scene'
              }
            ]
          : [],
        communications: [],
        documents: [],
        forensicRequests: [],
        timeline: [
          {
            id: `TL-INTAKE-${Date.now()}`,
            timestamp: incidentDate && incidentTime ? new Date(`${incidentDate}T${incidentTime}`).toISOString() : now,
            type: 'CASE_OPENED',
            actor: 'Special Agent Miracle Jerome [HQ-04]',
            description: `Manual incident intake filed. Docket ${caseId} activated. Initial report: "${workingTitle}".`
          }
        ],
        notes: initialNotes.trim()
          ? [
              {
                id: `NOTE-${Date.now()}`,
                agentId: 'AGT-HQ-04',
                agentName: 'Special Agent Miracle Jerome',
                timestamp: now,
                content: initialNotes.trim()
              }
            ]
          : [],
        causeHypothesis: {
          primaryCause: '',
          causeConfidence: 10,
          incidentLocation: location.trim(),
          incidentTimeWindow: `${incidentDate} ${incidentTime}`.trim(),
          indictmentStatus: 'Drafting'
        },
        suspectProfiles: [],
        createdAt: now,
        updatedAt: now
      };

      const created = await createDGACase(newCase);
      onCaseCreated(created.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The case could not be saved. Your narrative is still in the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs font-sans max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3 shrink-0">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-widest text-slate-600 flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              INCIDENT INTAKE & CASE INITIALIZATION
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">NEW INCIDENT REPORT</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Write what was reported in your own words. People, evidence exhibits, and lab requests can be added after the case file is open.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-900 rounded p-3 text-xs" role="alert">
              {error}
            </div>
          )}

          {/* Incident Narrative (Primary Required Field) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="incident-narrative" className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Describe What Happened *
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">Required</span>
            </div>
            <textarea
              id="incident-narrative"
              value={narrative}
              onChange={(event) => setNarrative(event.target.value)}
              rows={5}
              required
              placeholder="Describe the incident as reported. Include circumstances, immediate observations, dispatch statements, scene conditions, or injuries..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 p-3 rounded text-xs leading-relaxed resize-y outline-none transition-colors"
            />
          </div>

          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Case Title (Optional)
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Auto-generated from narrative if blank..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 px-3 py-1.5 rounded text-xs outline-none"
              />
            </label>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Initial Urgency / Priority
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(['Routine', 'Priority', 'High', 'Critical'] as Priority[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={`py-1.5 text-xs font-semibold rounded border cursor-pointer transition-colors ${
                      priority === level
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Reported Incident Date
              </span>
              <input
                type="date"
                value={incidentDate}
                onChange={(event) => setIncidentDate(event.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 px-3 py-1.5 rounded text-xs outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Reported Incident Time
              </span>
              <input
                type="time"
                value={incidentTime}
                onChange={(event) => setIncidentTime(event.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 px-3 py-1.5 rounded text-xs outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Incident Location / Scene
              </span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Level 4 Airlock, Novatech Bio-Laboratories"
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 px-3 py-1.5 rounded text-xs outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                Reporting Party / Dispatch Unit
              </span>
              <input
                type="text"
                value={reportingParty}
                onChange={(event) => setReportingParty(event.target.value)}
                placeholder="e.g. Officer Vance, Security Dispatch"
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 px-3 py-1.5 rounded text-xs outline-none"
              />
            </label>
          </div>

          {/* Initial Field Notes */}
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
              Initial Investigator Notes (Optional)
            </span>
            <textarea
              value={initialNotes}
              onChange={(event) => setInitialNotes(event.target.value)}
              rows={2}
              placeholder="Immediate observations, scene condition notes, or triage reminders..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white text-slate-900 placeholder-slate-400 px-3 py-1.5 rounded text-xs outline-none resize-none"
            />
          </label>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !narrative.trim()}
            className="px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white cursor-pointer disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {isSubmitting ? 'Opening File...' : 'Create Case File'}
          </button>
        </div>
      </form>
    </div>
  );
}
