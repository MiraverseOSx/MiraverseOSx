/**
 * Autonomous in-browser API interceptor for DGAOS and TRACE.
 * Intercepts `/api/records` and `/api/comms` so that all laboratory stations,
 * forensic tools, evidence custody, case registry, and communications work
 * 100% client-side with zero external terminal or backend servers required.
 */

import { traceDurableStore } from './traceDurableStore';
import { templates, modules, type LabRecord } from '../lib/records';
import { PHONE_CONTACTS } from '../lib/phone-data';
import { INITIAL_CHANNELS, INITIAL_CHANNEL_MESSAGES } from '../lib/comms-channels-data';
import { seedCommunications } from '../data/seed/communications';

let isInterceptorInstalled = false;

interface StoredAttachment {
  id: string;
  record_id: string;
  filename: string;
  size: number;
  mime_type: string;
  data: string;
  uploaded_at: string;
}

const attachmentsStore: StoredAttachment[] = [];

export function installDgaosApiInterceptor(): void {
  if (isInterceptorInstalled || typeof window === 'undefined') return;
  isInterceptorInstalled = true;

  // Initialize store in the background
  traceDurableStore.init();

  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // --- 1. /api/records ---
    if (urlStr.includes('/api/records')) {
      await traceDurableStore.init();
      return handleRecordsRequest(urlStr, init);
    }

    // --- 2. /api/comms ---
    if (urlStr.includes('/api/comms')) {
      return handleCommsRequest(urlStr, init);
    }

    // Normal network fetch for everything else
    return originalFetch.call(window, input, init);
  };
}

async function handleRecordsRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const url = new URL(urlStr, window.location.origin);
  const actionParam = url.searchParams.get('action');

  if (method === 'GET') {
    if (actionParam === 'templates') {
      return Response.json(templates, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (actionParam === 'attachments') {
      const recordId = url.searchParams.get('recordId');
      const filtered = attachmentsStore.filter((a) => a.record_id === recordId);
      return Response.json(filtered, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    // Return all records
    const all = traceDurableStore.getRecords();
    return Response.json(all, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (method === 'POST') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      const { action, id, revision } = body;
      const d = body.data || {};

      // 1. Create record
      if (action === 'create') {
        const kind = body.kind;
        const prefixMap: Record<string, string> = { case: 'FS', evidence: 'EV', examination: 'EX', report: 'RP' };
        const prefix = prefixMap[kind] || 'REC';
        const newId = `${prefix}-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

        let caseId = body.caseId || null;
        let data: Record<string, any> = { title: d.title?.trim() || 'Untitled', tags: d.tags || [] };

        if (kind === 'case') {
          data = {
            ...data,
            summary: d.summary || '',
            submitter: d.submitter || 'Investigator',
            module: d.module || 'trace',
            category: d.category || 'General examination',
            priority: d.priority === 'Priority' ? 'Priority' : 'Routine',
            status: d.status || 'Active',
          };
        } else if (kind === 'evidence') {
          data = {
            ...data,
            type: d.type || 'Physical artifact',
            description: d.description || '',
            seal: d.seal || 'Intact',
            location: d.location || 'Secure Storage',
            custodian: d.custodian || 'TRACE Evidence Officer',
            attachments: [],
            custody: [
              {
                at: new Date().toISOString(),
                from: d.from || 'Investigator',
                to: d.custodian || 'TRACE Evidence Officer',
                location: d.location || 'Secure Storage',
                seal: d.seal || 'Intact',
                reason: 'Initial intake',
              },
            ],
          };
        } else if (kind === 'examination') {
          data = {
            ...data,
            evidenceId: d.evidenceId || '',
            module: d.module || 'trace',
            method: d.method || 'Comparative microscopy',
            analyst: d.analyst || 'Lab analyst',
            templateId: d.templateId || '',
            worksheetValues: d.worksheetValues || {},
            status: 'Planned',
            observations: '',
            conclusion: '',
            limitations: '',
            suggestions: [],
            history: [],
          };
        } else if (kind === 'report') {
          data = {
            ...data,
            examinationId: d.examinationId || '',
            author: d.author || 'Lab analyst',
            summary: d.summary || '',
            limitations: d.limitations || '',
            status: 'Draft',
            history: [],
            examinationSnapshot: d.examinationSnapshot || {},
          };
        }

        const newRecord: LabRecord = {
          id: newId,
          kind,
          caseId,
          revision: 1,
          created: new Date().toISOString(),
          data,
        };

        await traceDurableStore.saveRecord(newRecord);
        return Response.json(newRecord, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // 2. Autosave Draft
      if (action === 'autosave-draft') {
        const examId = body.id;
        await traceDurableStore.saveDraft({
          id: examId,
          caseId: body.caseId || 'UNKNOWN',
          kind: body.kind || 'examination',
          data: d,
          worksheetValues: body.worksheetValues,
          updatedAt: new Date().toISOString(),
        });
        return Response.json({ success: true, id: examId, status: 'Draft Saved' }, { status: 200 });
      }

      // 3. Finalize Examination (Stage B)
      if (action === 'finalize-examination') {
        const report = await traceDurableStore.finalizeExamination(
          body.id,
          d.analyst || 'Lab analyst',
          d.conclusion || '',
          d.limitations || ''
        );
        return Response.json(report, { status: 200 });
      }

      // 4. Transmit Findings (Stage C)
      if (action === 'transmit-findings') {
        const result = await traceDurableStore.transmitFindings(
          body.reportId,
          body.authorizedBy || 'Authorized Investigator',
          body.dgaCaseId
        );
        return Response.json(result, { status: 200 });
      }

      // 5. Existing record modifications
      const record = traceDurableStore.getRecord(id);
      if (!record) {
        return Response.json({ error: `Record ${id} not found.` }, { status: 404 });
      }

      let data = { ...record.data };

      if (action === 'transfer' && record.kind === 'evidence') {
        data = {
          ...data,
          custodian: d.to,
          location: d.location,
          seal: d.seal,
          custody: [
            ...(data.custody || []),
            {
              at: new Date().toISOString(),
              from: data.custodian,
              to: d.to,
              location: d.location,
              reason: d.reason,
              seal: d.seal,
            },
          ],
        };
      } else if (action === 'examine' && record.kind === 'examination') {
        data = {
          ...data,
          observations: d.observations ?? data.observations,
          conclusion: d.conclusion ?? data.conclusion,
          limitations: d.limitations ?? data.limitations,
          status: d.status === 'Completed' ? 'Completed' : 'In progress',
          templateId: d.templateId !== undefined ? d.templateId : data.templateId,
          worksheetValues: d.worksheetValues !== undefined ? d.worksheetValues : data.worksheetValues,
        };
      } else if (action === 'reopen-examination' && record.kind === 'examination') {
        data = {
          ...data,
          status: 'In progress',
          history: [
            ...(data.history || []),
            {
              action: 'reopened',
              reason: d.reason || 'Reopened for additional analysis',
              reopenedBy: d.reopenedBy || 'Lab analyst',
              at: new Date().toISOString(),
            },
          ],
        };
      } else if (action === 'report' && record.kind === 'report') {
        data = {
          ...data,
          status: d.status,
          history: [
            ...(data.history || []),
            {
              at: new Date().toISOString(),
              status: d.status,
              reviewer: d.reviewer,
              note: d.note,
            },
          ],
        };
      } else if (action === 'edit-report' && record.kind === 'report') {
        data = {
          ...data,
          summary: d.summary ?? data.summary,
          limitations: d.limitations ?? data.limitations,
        };
      } else if ((action === 'case-status' || action === 'sign-case') && record.kind === 'case') {
        data.status = d.status || data.status;
        if (d.primaryInvestigator) data.primaryInvestigator = d.primaryInvestigator;
        if (d.primaryInvestigatorSignature) data.primaryInvestigatorSignature = d.primaryInvestigatorSignature;
        if (d.acceptedAt) data.acceptedAt = d.acceptedAt;
      } else if (action === 'add-tag') {
        if (!data.tags) data.tags = [];
        if (!data.tags.includes(d.tag)) data.tags.push(d.tag);
      } else if (action === 'remove-tag') {
        if (data.tags) data.tags = data.tags.filter((t: string) => t !== d.tag);
      }

      const updatedRecord: LabRecord = {
        ...record,
        data,
        revision: record.revision + 1,
      };

      await traceDurableStore.saveRecord(updatedRecord);
      return Response.json(updatedRecord, { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      console.error('Error handling /api/records POST:', err);
      return Response.json({ error: err instanceof Error ? err.message : 'Unable to save record.' }, { status: 400 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

// In-memory / localStorage comms state
let commsContacts = [...PHONE_CONTACTS];
let commsChannels = [...INITIAL_CHANNELS];
let commsMessages = [...INITIAL_CHANNEL_MESSAGES];

async function handleCommsRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();

  if (method === 'GET') {
    return Response.json(
      {
        contacts: commsContacts,
        channels: commsChannels,
        messages: commsMessages,
        events: [],
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (method === 'POST') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      const { action } = body;

      if (action === 'send' || action === 'send-cable') {
        const newMsg = {
          id: `msg-${Date.now()}`,
          kind: body.kind || 'cable',
          folder: 'sent',
          threadId: body.threadId || `thread-${Date.now()}`,
          channelId: body.channelId,
          contactId: body.contactId,
          senderName: body.senderName || 'Special Agent',
          recipient: body.recipient || 'Central Dispatch',
          subject: body.subject || 'Priority Cable',
          body: body.body || '',
          createdAt: new Date().toISOString(),
          read: true,
          priority: body.priority || 'Routine',
        };
        commsMessages.unshift(newMsg as any);
      }

      return Response.json(
        {
          contacts: commsContacts,
          channels: commsChannels,
          messages: commsMessages,
          events: [],
        },
        { status: 200 }
      );
    } catch (err) {
      return Response.json({ error: 'Failed to process communications message.' }, { status: 400 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
