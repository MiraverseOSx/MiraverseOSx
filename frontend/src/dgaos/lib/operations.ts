import type { DGAState, DGACase } from "./dga-types";
import { createRecordId } from "./record-id";
import { createResponseState, responseOf, isResponseCommand, applyResponseCommand, synchronizeResponseRecords, type ResponseState, type ResponseCommand } from './response-operations';
import {
  allocateIncidentCaseId,
  buildManualIncidentCase,
} from "./dga-incident";

export interface CitizenRecord {
  id: string;
  name: string;
  birthDate: string;
  address: string;
  notes: string;
}
export interface PenalOffense {
  id: string;
  title: string;
  category: string;
  enabled: boolean;
}
export interface Interview {
  id: string;
  caseId: string;
  personId: string;
  transcript: string;
  supportingRecordIds: string[];
  recordedAt: string;
  recordedBy: string;
}
export interface CivicRecord {
  id: string;
  kind: "vehicle" | "license" | "bolo" | "arrest" | "report";
  personId: string;
  caseId?: string;
  reference: string;
  details: string;
  status: "active" | "closed";
  recordedAt: string;
}
export interface Warrant {
  id: string;
  caseId: string;
  personId: string;
  scope: string;
  grounds: string;
  status: "submitted" | "approved" | "rejected" | "served";
  history: AuditEntry[];
}
export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail: string;
}
export interface Proceeding {
  id: string;
  caseId: string;
  personId: string;
  offenses: PenalOffense[];
  basis: string;
  status: "charged" | "hearing" | "acquitted" | "convicted" | "sentenced";
  hearing?: string;
  sentence?: string;
  history: AuditEntry[];
}
export interface InmateRecord {
  id: string;
  proceedingId: string;
  personId: string;
  caseId: string;
  facility: string;
  status: "in custody" | "released";
  admittedAt: string;
  releasedAt?: string;
}
export interface CallTurn {
  at: string;
  speaker: "Caller" | "Operator" | "System";
  text: string;
}
export interface EmergencyCall {
  id: string;
  caller: string;
  number: string;
  location: string;
  description: string;
  priority: "Routine" | "Priority" | "High" | "Critical";
  status: "incoming" | "connected" | "held" | "transferred" | "ended";
  direction: "incoming" | "callback";
  createdAt: string;
  endedAt?: string;
  transferTo?: string;
  parentCallId?: string;
  incidentId?: string;
  transcript: CallTurn[];
}
export interface DispatchIncident {
  id: string;
  callIds: string[];
  location: string;
  description: string;
  priority: EmergencyCall["priority"];
  status: "open" | "closed";
  caseId?: string;
  updatedAt: string;
}
export interface OperationsState {
  response?: ResponseState;
  version: 1;
  citizens: CitizenRecord[];
  interviews: Interview[];
  records: CivicRecord[];
  code: PenalOffense[];
  warrants: Warrant[];
  proceedings: Proceeding[];
  inmates: InmateRecord[];
  calls: EmergencyCall[];
  incidents: DispatchIncident[];
}
export const createOperations = (): OperationsState => ({
  response: createResponseState(),
  version: 1,
  citizens: [],
  interviews: [],
  records: [],
  code: [
    { id: "MER-101", title: "Assault", category: "Person", enabled: true },
    { id: "MER-202", title: "Theft", category: "Property", enabled: true },
    { id: "MER-303", title: "Fraud", category: "Financial", enabled: true },
  ],
  warrants: [],
  proceedings: [],
  inmates: [],
  calls: [],
  incidents: [],
});
export function operationsOf(state: DGAState): OperationsState {
  const result = { ...createOperations(), ...state.operations };
  result.response = responseOf(result);
  return result;
}
export function citizenIndex(state: DGAState): CitizenRecord[] {
  const entries = new Map<string, CitizenRecord>();
  for (const p of state.people)
    entries.set(p.id, {
      id: p.id,
      name: p.name,
      birthDate: "",
      address: "",
      notes: "",
    });
  for (const c of state.cases)
    for (const p of c.people)
      if (!entries.has(p.personId))
        entries.set(p.personId, {
          id: p.personId,
          name: p.name,
          birthDate: "",
          address: "",
          notes: "",
        });
  for (const p of operationsOf(state).citizens) entries.set(p.id, p);
  return [...entries.values()];
}
export type OperationsCommand =
  | ResponseCommand
  | { type: "registry-citizens"; citizens: CitizenRecord[] }
  | {
      type: "citizen";
      id?: string;
      name: string;
      birthDate: string;
      address: string;
      notes: string;
    }
  | { type: "link-person"; caseId: string; personId: string; role: string }
  | {
      type: "interview";
      caseId: string;
      personId: string;
      transcript: string;
      supportingRecordIds: string[];
    }
  | {
      type: "task";
      caseId: string;
      title: string;
      supportingRecordIds: string[];
    }
  | {
      type: "finding";
      caseId: string;
      statement: string;
      supportingRecordIds: string[];
    }
  | {
      type: "record";
      kind: CivicRecord["kind"];
      personId: string;
      caseId?: string;
      reference: string;
      details: string;
    }
  | { type: "close-record"; id: string }
  | {
      type: "code";
      id: string;
      title: string;
      category: string;
      enabled: boolean;
    }
  | {
      type: "warrant";
      caseId: string;
      personId: string;
      scope: string;
      grounds: string;
    }
  | {
      type: "warrant-stage";
      id: string;
      status: "approved" | "rejected" | "served";
      detail: string;
    }
  | {
      type: "charge";
      caseId: string;
      personId: string;
      offenseIds: string[];
      basis: string;
    }
  | {
      type: "legal-stage";
      id: string;
      status: "hearing" | "acquitted" | "convicted" | "sentenced";
      detail: string;
    }
  | { type: "admit"; proceedingId: string; facility: string }
  | { type: "release"; id: string; detail: string }
  | {
      type: "incoming";
      caller: string;
      number: string;
      location: string;
      description: string;
      priority: EmergencyCall["priority"];
    }
  | {
      type: "call-stage";
      id: string;
      action:
        | "answer"
        | "hold"
        | "resume"
        | "transfer"
        | "disconnect"
        | "callback";
      target?: string;
    }
  | { type: "call-message"; id: string; text: string; selectedFacts?: string[]; contextSignature?: string; source?: string }
  | { type: "incident"; callId: string }
  | {
      type: "update-incident";
      id: string;
      location: string;
      description: string;
      priority: EmergencyCall["priority"];
      status: "open" | "closed";
    }
  | { type: "investigate"; incidentId: string; caseId?: string };
export interface OperationsActor {
  name: string;
  canApproveLegal: boolean;
}
const required = (value: string, label: string) => {
  if (!value?.trim()) throw new Error(`${label} is required.`);
  return value.trim();
};
function find<T extends { id: string }>(
  items: T[],
  id: string,
  label: string,
): T {
  const item = items.find((v) => v.id === id);
  if (!item) throw new Error(`${label} not found.`);
  return item;
}
function checkRefs(state: DGAState, c: DGACase, refs: string[]) {
  const known = new Set([
    ...c.evidence.map((x) => x.id),
    ...c.documents.map((x) => x.id),
    ...(c.findings || []).map((x) => x.id),
    ...operationsOf(state)
      .interviews.filter((x) => x.caseId === c.id)
      .map((x) => x.id),
    ...operationsOf(state)
      .records.filter((x) => x.caseId === c.id)
      .map((x) => x.id),
  ]);
  if (refs.some((id) => !known.has(id)))
    throw new Error("Supporting records must belong to this case.");
}
/** One command creates a new snapshot. A rejected command cannot partially mutate a docket. */
export function applyOperationsCommand(
  original: DGAState,
  command: OperationsCommand,
  actor: OperationsActor,
): { state: DGAState; id: string } {
  const state = structuredClone(original);
  const o = (state.operations = operationsOf(state));
  const now = new Date().toISOString();
  const id = createRecordId(command.type.toUpperCase());
  let resultId = id;
  const audit = (action: string, detail: string): AuditEntry => ({
    at: now,
    actor: actor.name,
    action,
    detail,
  });
  const caseFor = (caseId: string) => find(state.cases, caseId, "Case");
  const personFor = (personId: string) =>
    find(citizenIndex(state), personId, "Citizen");
  const linked = (caseId: string, personId: string) => {
    const c = caseFor(caseId);
    personFor(personId);
    if (!c.people.some((p) => p.personId === personId))
      throw new Error("Link this citizen to the case first.");
    return c;
  };
  const legal = () => {
    if (!actor.canApproveLegal)
      throw new Error("Command authority is required for this legal decision.");
  };
  if (isResponseCommand(command)) resultId = applyResponseCommand(state, o, command, actor);
  else switch (command.type) {
    case "registry-citizens": {
      const existing = new Set(citizenIndex(state).map((p) => p.id));
      for (const p of command.citizens) {
        required(p.id, "Citizen ID");
        required(p.name, "Citizen name");
        if (!existing.has(p.id)) {
          o.citizens.push({ ...p });
          existing.add(p.id);
        }
      }
      break;
    }
    case "citizen": {
      if (command.id) personFor(command.id);
      resultId = command.id || id;
      const citizen = {
        id: resultId,
        name: required(command.name, "Name"),
        birthDate: command.birthDate,
        address: command.address.trim(),
        notes: command.notes.trim(),
      };
      o.citizens = [...o.citizens.filter((p) => p.id !== resultId), citizen];
      // Names are presentation data; identity and case-local roles are preserved.
      state.people
        .filter((p) => p.id === resultId)
        .forEach((p) => {
          p.name = citizen.name;
        });
      state.cases.forEach((c) =>
        c.people
          .filter((p) => p.personId === resultId)
          .forEach((p) => {
            p.name = citizen.name;
          }),
      );
      break;
    }
    case "link-person": {
      const c = caseFor(command.caseId);
      const p = personFor(command.personId);
      const role = required(command.role, "Case role");
      const existing = c.people.find((x) => x.personId === p.id);
      if (existing) existing.role = role;
      else
        c.people.push({
          personId: p.id,
          name: p.name,
          role,
          affiliation: "Not recorded",
          threatLevel: "None",
          status: "Not recorded",
        });
      c.updatedAt = now;
      resultId = p.id;
      break;
    }
    case "interview": {
      const c = linked(command.caseId, command.personId);
      checkRefs(state, c, command.supportingRecordIds);
      o.interviews.push({
        id,
        caseId: c.id,
        personId: command.personId,
        transcript: required(command.transcript, "Transcript"),
        supportingRecordIds: [...new Set(command.supportingRecordIds)],
        recordedAt: now,
        recordedBy: actor.name,
      });
      c.timeline.unshift({
        id: createRecordId("TL"),
        timestamp: now,
        actor: actor.name,
        type: "NOTE_ADDED",
        recordId: id,
        description: `Interview recorded for ${personFor(command.personId).name}.`,
      });
      c.updatedAt = now;
      break;
    }
    case "task":
    case "finding": {
      const c = caseFor(command.caseId);
      checkRefs(state, c, command.supportingRecordIds);
      if (command.type === "task")
        c.tasks.push({
          id,
          caseId: c.id,
          title: required(command.title, "Task"),
          description: "Follow-up from connected workspace",
          assignedTo: actor.name,
          completed: false,
          status: "pending",
          phase: "Active Investigation",
          linkedEvidenceIds: command.supportingRecordIds.filter((x) =>
            c.evidence.some((e) => e.id === x),
          ),
          linkedDocumentIds: command.supportingRecordIds.filter((x) =>
            c.documents.some((d) => d.id === x),
          ),
          customFields: {
            supportingRecordIds: JSON.stringify(command.supportingRecordIds),
          },
        });
      else {
        if (!command.supportingRecordIds.length)
          throw new Error("Choose at least one supporting record.");
        (c.findings ||= []).push({
          id,
          kind: "Investigator Observation",
          statement: required(command.statement, "Finding"),
          supportingRecordIds: [...command.supportingRecordIds],
          recordedBy: actor.name,
          recordedAt: now,
        });
      }
      c.updatedAt = now;
      break;
    }
    case "record": {
      personFor(command.personId);
      if (command.caseId) linked(command.caseId, command.personId);
      const reference = required(command.reference, "Reference");
      if (
        command.kind === "vehicle" &&
        o.records.some(
          (r) =>
            r.kind === "vehicle" &&
            r.reference.toLowerCase() === reference.toLowerCase() &&
            r.status === "active",
        )
      )
        throw new Error("This vehicle reference is already registered.");
      o.records.push({
        ...command,
        id,
        reference,
        details: required(command.details, "Details"),
        status: "active",
        recordedAt: now,
      });
      break;
    }
    case "close-record":
      find(o.records, command.id, "Record").status = "closed";
      break;
    case "code": {
      legal();
      const codeId = required(command.id, "Offense code").toUpperCase();
      const offense = {
        id: codeId,
        title: required(command.title, "Offense title"),
        category: required(command.category, "Category"),
        enabled: command.enabled,
      };
      o.code = [...o.code.filter((x) => x.id !== codeId), offense];
      resultId = codeId;
      break;
    }
    case "warrant": {
      linked(command.caseId, command.personId);
      o.warrants.push({
        id,
        caseId: command.caseId,
        personId: command.personId,
        scope: required(command.scope, "Scope"),
        grounds: required(command.grounds, "Grounds"),
        status: "submitted",
        history: [audit("submitted", command.grounds)],
      });
      break;
    }
    case "warrant-stage": {
      const w = find(o.warrants, command.id, "Warrant");
      if (command.status === "served") {
        if (w.status !== "approved")
          throw new Error("Only an approved warrant can be served.");
      } else {
        legal();
        if (w.status !== "submitted")
          throw new Error("Only a submitted warrant can be decided.");
      }
      w.history.push(
        audit(
          command.status,
          required(command.detail, "Decision or service details"),
        ),
      );
      w.status = command.status;
      resultId = w.id;
      break;
    }
    case "charge": {
      linked(command.caseId, command.personId);
      const offenses = [...new Set(command.offenseIds)].map((x) =>
        find(o.code, x, "Offense"),
      );
      if (!offenses.length || offenses.some((x) => !x.enabled))
        throw new Error("Choose an active fictional offense.");
      const basis = required(command.basis, "Charge basis");
      o.proceedings.push({
        id,
        caseId: command.caseId,
        personId: command.personId,
        offenses: structuredClone(offenses),
        basis,
        status: "charged",
        history: [audit("charged", basis)],
      });
      break;
    }
    case "legal-stage": {
      legal();
      const p = find(o.proceedings, command.id, "Proceeding");
      const allowed = {
        charged: ["hearing"],
        hearing: ["acquitted", "convicted"],
        convicted: ["sentenced"],
        acquitted: [],
        sentenced: [],
      };
      if (!(allowed[p.status] as string[]).includes(command.status))
        throw new Error("Complete the preceding legal stage first.");
      const detail = required(command.detail, "Decision details");
      if (command.status === "hearing") p.hearing = detail;
      if (command.status === "sentenced") p.sentence = detail;
      p.status = command.status;
      p.history.push(audit(command.status, detail));
      resultId = p.id;
      break;
    }
    case "admit": {
      legal();
      const p = find(o.proceedings, command.proceedingId, "Proceeding");
      if (p.status !== "sentenced")
        throw new Error(
          "A recorded sentence is required for inmate admission.",
        );
      if (
        o.inmates.some(
          (i) => i.proceedingId === p.id && i.status === "in custody",
        )
      )
        throw new Error("This sentence already has an active inmate record.");
      o.inmates.push({
        id,
        proceedingId: p.id,
        personId: p.personId,
        caseId: p.caseId,
        facility: required(command.facility, "Facility"),
        status: "in custody",
        admittedAt: now,
      });
      break;
    }
    case "release": {
      legal();
      const i = find(o.inmates, command.id, "Inmate");
      if (i.status !== "in custody")
        throw new Error("This inmate is already released.");
      const p = find(o.proceedings, i.proceedingId, "Proceeding");
      p.history.push(
        audit("released", required(command.detail, "Release authority")),
      );
      i.status = "released";
      i.releasedAt = now;
      break;
    }
    case "incoming": {
      if (
        !["Routine", "Priority", "High", "Critical"].includes(command.priority)
      )
        throw new Error("Choose a valid priority.");
      o.calls.push({
        id,
        caller: command.caller.trim() || "Unknown caller",
        number: command.number.trim(),
        location: required(command.location, "Location"),
        description: required(command.description, "Emergency description"),
        priority: command.priority,
        status: "incoming",
        direction: "incoming",
        createdAt: now,
        transcript: [
          {
            at: now,
            speaker: "System",
            text: "Simulated incoming emergency call.",
          },
        ],
      });
      break;
    }
    case "call-stage": {
      const c = find(o.calls, command.id, "Call");
      if (command.action === "callback") {
        if (!["ended", "transferred"].includes(c.status) || !c.number)
          throw new Error(
            "A completed call with a callback number is required.",
          );
        if (o.calls.some((x) => x.status === "connected"))
          throw new Error("Hold or finish the current connected call first.");
        o.calls.push({
          ...structuredClone(c),
          id,
          parentCallId: c.id,
          direction: "callback",
          status: "connected",
          createdAt: now,
          endedAt: undefined,
          transferTo: undefined,
          transcript: [
            {
              at: now,
              speaker: "System",
              text: `Callback connected to ${c.number}.`,
            },
            {
              at: now,
              speaker: "Caller",
              text: "Hello, this is the caller. What do you need to know?",
            },
          ],
        });
        if (c.incidentId)
          find(o.incidents, c.incidentId, "Incident").callIds.push(id);
        break;
      }
      const allowed = {
        answer: ["incoming"],
        hold: ["connected"],
        resume: ["held"],
        transfer: ["connected", "held"],
        disconnect: ["incoming", "connected", "held"],
      };
      if (!allowed[command.action].includes(c.status))
        throw new Error("That action is unavailable for this call state.");
      if (
        command.action === "answer" &&
        o.calls.some((x) => x.id !== c.id && x.status === "connected")
      )
        throw new Error("Hold or finish the current connected call first.");
      const statuses = {
        answer: "connected",
        hold: "held",
        resume: "connected",
        transfer: "transferred",
        disconnect: "ended",
      } as const;
      if (
        command.action === "resume" &&
        o.calls.some((x) => x.id !== c.id && x.status === "connected")
      )
        throw new Error("Hold or finish the current connected call first.");
      if (command.action === "transfer")
        c.transferTo = required(command.target || "", "Transfer destination");
      c.status = statuses[command.action];
      if (["ended", "transferred"].includes(c.status)) c.endedAt = now;
      c.transcript.push({
        at: now,
        speaker: "System",
        text:
          command.action === "transfer"
            ? `Transferred to ${c.transferTo} (simulated).`
            : command.action,
      });
      if (command.action === "answer")
        c.transcript.push({ at: now, speaker: "Caller", text: c.description });
      resultId = c.id;
      break;
    }
    case "call-message": {
      const c = find(o.calls, command.id, "Call");
      if (c.status !== "connected")
        throw new Error("Connect the call before speaking.");
      if(command.contextSignature && command.contextSignature!==JSON.stringify(c)) throw new Error('The call changed while the reply was prepared. Ask again.');
      const text = required(command.text, "Message");
      const q = text.toLowerCase();
      let response = /where|address|location/.test(q)
        ? `The location is ${c.location}.`
        : /name|who/.test(q)
          ? `You can call me ${c.caller}.`
          : /number|phone|call back/.test(q)
            ? c.number
              ? `My callback number is ${c.number}.`
              : "I cannot provide a callback number."
            : /priority|urgent/.test(q)
              ? `The reported priority is ${c.priority}.`
              : /happen|describe|tell|see|hurt/.test(q)
                ? c.description
                : "That is all I can confirm right now. Please ask about the location, what happened, my name, or callback number.";
      if(command.selectedFacts) { const facts:Record<string,string>={location:`The location is ${c.location}.`,name:`You can call me ${c.caller}.`,number:c.number?`My callback number is ${c.number}.`:'I cannot provide a callback number.',description:c.description,priority:`The reported priority is ${c.priority}.`}; if(command.selectedFacts.some(id=>!Object.hasOwn(facts,id))) throw new Error('The caller cannot confirm that fact.'); response=command.selectedFacts.map(id=>facts[id]).join(' ') || 'I cannot confirm that from what I know.'; }
      c.transcript.push(
        { at: now, speaker: "Operator", text },
        { at: now, speaker: "Caller", text: response },
      );
      resultId = c.id;
      break;
    }
    case "incident": {
      const c = find(o.calls, command.callId, "Call");
      if (!c.transcript.some(t=>t.speaker==='Caller'))
        throw new Error("Answer the call before creating an incident.");
      let root = c; const ancestors = new Set<string>();
      while(root.parentCallId && !ancestors.has(root.id)) { ancestors.add(root.id); root=find(o.calls,root.parentCallId,'Parent call'); }
      const family = new Set([root.id]); let changed=true;
      while(changed) { changed=false; for(const call of o.calls) if(call.parentCallId && family.has(call.parentCallId) && !family.has(call.id)) {family.add(call.id);changed=true;} }
      const existingIds=[...new Set(o.calls.filter(call=>family.has(call.id)&&call.incidentId).map(call=>call.incidentId!))];
      if(existingIds.length>1) throw new Error('This call family already references conflicting incidents. Review its records first.');
      resultId=existingIds[0] || id;
      if(!existingIds.length) o.incidents.push({
        id,
        callIds: [...family],
        location: c.location,
        description: c.description,
        priority: c.priority,
        status: "open",
        updatedAt: now,
      });
      const target=find(o.incidents,resultId,'Incident'); target.callIds=[...new Set([...target.callIds,...family])];
      o.calls.filter(call=>family.has(call.id)).forEach(call=>call.incidentId=resultId);
      break;
    }
    case "update-incident": {
      const i = find(o.incidents, command.id, "Incident");
      if(command.status==='closed' && o.response?.assignments.some(a=>a.incidentId===i.id&&a.status!=='cleared')) throw new Error('Clear responding units before closing this incident.');
      i.location = required(command.location, "Location");
      i.description = required(command.description, "Description");
      if (
        !["Routine", "Priority", "High", "Critical"].includes(command.priority)
      )
        throw new Error("Invalid priority.");
      i.priority = command.priority;
      i.status = command.status;
      i.updatedAt = now;
      resultId = i.id;
      break;
    }
    case "investigate": {
      const i = find(o.incidents, command.incidentId, "Incident");
      if (i.caseId) {
        resultId = i.caseId;
        break;
      }
      let c: DGACase;
      if (command.caseId) c = caseFor(command.caseId);
      else {
        const caseId = allocateIncidentCaseId(state.cases.map((c) => c.id));
        c = buildManualIncidentCase(
          {
            narrative: i.description,
            location: i.location,
            priority: i.priority,
            title: `Emergency incident at ${i.location}`,
          },
          caseId,
          actor.name,
        );
        state.cases.push(c);
      }
      i.caseId = c.id;
      state.activeCaseId = c.id;
      c.timeline.unshift({
        id: createRecordId("TL"),
        type: "NOTE_ADDED",
        timestamp: now,
        actor: actor.name,
        recordId: i.id,
        description: `Dispatch incident ${i.id} linked. The call transcript is reported information.`,
      });
      c.updatedAt = now;
      resultId = c.id;
      break;
    }
  }
  synchronizeResponseRecords(state, o);
  // A linked case always sees the latest transcript, including callbacks after referral.
  for (const incident of o.incidents.filter((i) => i.caseId)) {
    const c = state.cases.find((c) => c.id === incident.caseId);
    if (!c) continue;
    const documentId = `CALLLOG-${incident.id}`;
    const content =
      `DISPATCH INCIDENT: ${incident.id}\nLOCATION: ${incident.location}\nPRIORITY: ${incident.priority}\nSTATUS: ${incident.status}\nREPORTED: ${incident.description}\n\n` +
      incident.callIds
        .map((callId) => {
          const call = find(o.calls, callId, "Call");
          return `${call.id} · ${call.caller}\n${call.transcript.map((t) => `${t.at} ${t.speaker}: ${t.text}`).join("\n")}`;
        })
        .join("\n\n");
    const doc = c.documents.find((d) => d.id === documentId);
    if (doc) {
      if (doc.content !== content) {
        doc.content = content;
        doc.date = now;
        c.updatedAt = now;
      }
    } else
      c.documents.push({
        id: documentId,
        title: `Emergency call record — ${incident.location}`,
        classification: c.classification,
        date: now,
        author: actor.name,
        sourceSystem: "COMMS",
        content,
      });
  }
  return { state, id: resultId };
}
