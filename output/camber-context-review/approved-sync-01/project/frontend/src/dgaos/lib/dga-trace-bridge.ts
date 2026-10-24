import { DGACase, EvidenceItem } from './dga-types';
import {
  attachTraceResultToDgaCase,
  createDGASystemRequest,
  ensureDGAForensicRequest,
  getDGAState,
  recordEvidenceCustodyTransfer,
  updateDGACaseDetails,
  updateDGACaseEvidenceItem
} from './dga-store';
import { getSystemAdapter } from './systems/system-registry';
import {
  findReusableForensicRequest,
  resolveRequestedTraceModules
} from './dga-trace-match';

export { findReusableForensicRequest, resolveRequestedTraceModules };

export interface TraceBridgeResult {
  success: boolean;
  partial?: boolean;
  reused?: boolean;
  traceCaseId?: string;
  traceEvidenceIds?: string[];
  traceExamIds?: string[];
  forensicRequestId?: string;
  message: string;
}

async function readJson(response: Response): Promise<{ id?: string; error?: string }> {
  try {
    return await response.json();
  } catch {
    return { error: `TRACE returned an unreadable response (${response.status}).` };
  }
}

export async function sendDgaCaseToTrace(
  dgaCase: DGACase,
  selectedEvidenceItems: EvidenceItem[] = [],
  requestedModules: string[] = [],
  notes?: string
): Promise<TraceBridgeResult> {
  const live = getDGAState().cases.find((item) => item.id === dgaCase.id);
  if (!live) {
    return {
      success: false,
      message: `Originating case ${dgaCase.id} was not found. Nothing was submitted to TRACE.`
    };
  }

  const evidenceIds = selectedEvidenceItems.map((item) => item.id);
  if (evidenceIds.length === 0) {
    return {
      success: false,
      message: 'Select at least one evidence item before submitting to TRACE. Nothing was submitted.'
    };
  }

  const missingEvidence = evidenceIds.filter((id) => !live.evidence.some((item) => item.id === id));
  if (missingEvidence.length > 0) {
    return {
      success: false,
      message: `These evidence items are not on case ${live.id}: ${missingEvidence.join(', ')}. Nothing was submitted.`
    };
  }

  if (requestedModules.length === 0) {
    return {
      success: false,
      message: 'Select a laboratory examination module. Nothing was submitted.'
    };
  }

  const resolved = resolveRequestedTraceModules(requestedModules);
  if (resolved.unsupported.length > 0) {
    return {
      success: false,
      message: `Unsupported laboratory module: ${resolved.unsupported.join(', ')}. No fallback examination was chosen, and nothing was submitted.`
    };
  }

  const existing = findReusableForensicRequest(live, evidenceIds, requestedModules);
  const investigator = getDGAState().profile?.name || live.primaryInvestigator || live.assignedAgents[0] || 'Assigned investigator';

  if (
    existing?.linkedTraceCaseId &&
    existing.traceExamIds &&
    existing.traceExamIds.length >= resolved.modules.length &&
    evidenceIds.every((id) => live.evidence.find((item) => item.id === id)?.linkedTraceEvidenceId)
  ) {
    return {
      success: true,
      reused: true,
      traceCaseId: existing.linkedTraceCaseId,
      traceEvidenceIds: evidenceIds
        .map((id) => live.evidence.find((item) => item.id === id)?.linkedTraceEvidenceId)
        .filter((id): id is string => !!id),
      traceExamIds: existing.traceExamIds,
      forensicRequestId: existing.id,
      message: `Existing TRACE submission ${existing.id} (${existing.linkedTraceCaseId}) was reused. No duplicate laboratory file or examination was created.`
    };
  }

  let traceCaseId = existing?.linkedTraceCaseId || live.linkedTraceCaseId;
  if (!traceCaseId) {
    try {
      const caseResponse = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          kind: 'case',
          data: {
            title: `[DGA LINKED] ${live.title}`,
            summary: `${live.summary}\n\n[Originating DGA Case: ${live.id} | Classification: ${live.classification}]`,
            submitter: investigator,
            module: resolved.modules[0].id,
            category: 'Forensic Specimen Triage',
            priority: live.priority === 'Critical' || live.priority === 'High' ? 'Priority' : 'Routine',
            tags: ['DGA-TRANSFER', live.id]
          }
        })
      });
      const caseJson = await readJson(caseResponse);
      if (!caseResponse.ok || caseJson.error || !caseJson.id) {
        return {
          success: false,
          message: `TRACE did not open a laboratory file (${caseJson.error || caseResponse.status}). No forensic request was created.`
        };
      }
      traceCaseId = caseJson.id;
      await updateDGACaseDetails(live.id, { linkedTraceCaseId: traceCaseId });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `TRACE could not be reached (${detail}). No forensic request was created. You can retry without creating a duplicate.`
      };
    }
  }

  const request = await ensureDGAForensicRequest(live.id, evidenceIds, requestedModules, {
    requestedBy: investigator,
    notes: notes?.trim() || `Laboratory examination requested for case ${live.id}.`,
    linkedTraceCaseId: traceCaseId,
    investigativeQuestion: notes?.trim()
  });
  if (!request) {
    return {
      success: false,
      traceCaseId,
      message: `TRACE file ${traceCaseId} is recorded, but the DGA request could not be saved. Retry will reuse that laboratory file.`
    };
  }

  const traceEvidenceIds: string[] = [];
  const failedEvidence: string[] = [];
  const currentCase = () => getDGAState().cases.find((item) => item.id === live.id);

  for (const evidenceId of evidenceIds) {
    const evidence = currentCase()?.evidence.find((item) => item.id === evidenceId);
    if (!evidence) {
      failedEvidence.push(evidenceId);
      continue;
    }
    if (evidence.linkedTraceEvidenceId) {
      traceEvidenceIds.push(evidence.linkedTraceEvidenceId);
      continue;
    }

    try {
      const evidenceResponse = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          kind: 'evidence',
          caseId: traceCaseId,
          data: {
            title: evidence.title,
            type:
              evidence.category === 'Digital Media'
                ? 'Digital storage media'
                : evidence.category === 'Toxicological Specimen'
                  ? 'Biological specimen'
                  : 'Physical artifact',
            description: evidence.description,
            location: evidence.storageLocation || 'TRACE intake — location not further specified',
            custodian: 'TRACE Evidence Officer',
            seal: evidence.seal || `SEAL-${evidence.id}`,
            from: investigator
          }
        })
      });
      const evidenceJson = await readJson(evidenceResponse);
      if (!evidenceResponse.ok || evidenceJson.error || !evidenceJson.id) {
        failedEvidence.push(evidence.id);
        continue;
      }
      await updateDGACaseEvidenceItem(live.id, evidence.id, {
        linkedTraceEvidenceId: evidenceJson.id,
        custodyStatus: 'Transferred to TRACE'
      });
      await recordEvidenceCustodyTransfer(live.id, evidence.id, {
        releasingCustodian: evidence.custodian || investigator,
        receivingCustodian: 'TRACE Evidence Officer',
        reason: 'Submitted for laboratory examination',
        location: 'TRACE intake',
        sealStatus: evidence.seal || 'Seal not recorded',
        notes: `Transferred under request ${request.id} to TRACE ${traceCaseId}.`
      });
      traceEvidenceIds.push(evidenceJson.id);
    } catch {
      failedEvidence.push(evidence.id);
    }
  }

  const traceExamIds = [...(request.traceExamIds || [])];
  const failedExams: string[] = [];
  if (traceEvidenceIds.length > 0 && traceExamIds.length < resolved.modules.length) {
    for (const mod of resolved.modules) {
      try {
        const examResponse = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            kind: 'examination',
            caseId: traceCaseId,
            data: {
              title: `DGA ${mod.id.toUpperCase()} examination`,
              evidenceId: traceEvidenceIds[0],
              module: mod.id,
              method: mod.method,
              analyst: 'TRACE Forensic Specialist',
              question: notes?.trim() || ''
            }
          })
        });
        const examJson = await readJson(examResponse);
        if (!examResponse.ok || examJson.error || !examJson.id) {
          failedExams.push(mod.id);
          continue;
        }
        traceExamIds.push(examJson.id);
        await ensureDGAForensicRequest(live.id, evidenceIds, requestedModules, {
          requestedBy: investigator,
          notes: request.notes,
          linkedTraceCaseId: traceCaseId,
          traceExamIds: [...traceExamIds]
        });
      } catch {
        failedExams.push(mod.id);
      }
    }
  }

  const exchange = getDGAState().systemExchange.requests.some((item) => item.legacyForensicRequestId === request.id);
  if (!exchange) {
    await createDGASystemRequest({
      caseId: live.id,
      requestedBy: 'DGA_CORE',
      targetSystem: 'TRACE',
      requestType: 'FORENSIC_EXAMINATION',
      summary: request.notes,
      evidenceIds,
      externalRef: traceCaseId,
      legacyForensicRequestId: request.id,
      payload: { modules: resolved.modules.map((mod) => mod.id), traceEvidenceIds, traceExamIds },
      logToTimeline: false
    });
    await getSystemAdapter('TRACE')?.receiveCase(live.id, { from: 'DGA_CORE', externalRef: traceCaseId });
  }

  if (failedEvidence.length > 0 || failedExams.length > 0 || traceExamIds.length === 0) {
    return {
      success: false,
      partial: true,
      traceCaseId,
      traceEvidenceIds,
      traceExamIds,
      forensicRequestId: request.id,
      message: `TRACE file ${traceCaseId} is linked to ${request.id}, but the submission is incomplete. Evidence not transferred: ${failedEvidence.join(', ') || 'none'}. Examinations not created: ${failedExams.join(', ') || 'none'}. Retry reuses this laboratory file and request.`
    };
  }

  return {
    success: true,
    traceCaseId,
    traceEvidenceIds,
    traceExamIds,
    forensicRequestId: request.id,
    message: `Case ${live.id} is linked to TRACE ${traceCaseId}. Request ${request.id} covers ${traceEvidenceIds.length} evidence item(s) and ${traceExamIds.length} examination(s). Examinations are not complete until TRACE releases a report.`
  };
}

export async function returnTraceResultToDga(
  dgaCaseId: string,
  forensicRequestId: string,
  resultSummary: string,
  traceCaseId: string
): Promise<boolean> {
  return attachTraceResultToDgaCase(dgaCaseId, forensicRequestId, resultSummary, traceCaseId);
}
