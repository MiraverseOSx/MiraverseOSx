import type { DGAState, DGACase } from "./dga-types";
import { createRecordId } from "./record-id";
import type { OperationsState, OperationsActor } from "./operations";

export type Agency = "Police" | "Tactical" | "Fire" | "Medical";
export type ResponseStatus = "assigned" | "en route" | "on scene" | "cleared";
export interface ResponseUnit {
  id: string;
  callsign: string;
  agency: Agency;
  onDuty: boolean;
  available: boolean;
  panic: boolean;
}
export interface UnitAssignment {
  id: string;
  unitId: string;
  incidentId: string;
  status: ResponseStatus;
  assignedAt: string;
  updatedAt: string;
  dueAt: string;
  report?: string;
  history: { at: string; status: string; detail: string }[];
}
export interface RadioChannel {
  id: string;
  name: string;
  agency?: Agency;
  commandOnly?: boolean;
}
export interface RadioTransmission {
  id: string;
  channelId: string;
  sender: string;
  text: string;
  at: string;
  incidentId?: string;
  unitId?: string;
  emergency: boolean;
  npc: boolean;
}
export interface KnowledgeFact {
  id: string;
  text: string;
}
export interface CharacterKnowledge {
  caseId: string;
  personId: string;
  demeanor: string;
  facts: KnowledgeFact[];
}
export interface DialogueTurn {
  id: string;
  at: string;
  question: string;
  reply: string;
  source: string;
  factIds: string[];
}
export interface CharacterConversation {
  id: string;
  caseId: string;
  personId: string;
  turns: DialogueTurn[];
}
export interface ScenarioActor {
  personId: string;
  name: string;
  role: string;
  facts: KnowledgeFact[];
}
export interface ResponseScenario {
  id: string;
  callId: string;
  caseId?: string;
  title: string;
  hiddenFacts: string[];
  actors: ScenarioActor[];
  leads: {
    id: string;
    title: string;
    description: string;
    discovered: boolean;
  }[];
}
export interface ResponseState {
  units: ResponseUnit[];
  assignments: UnitAssignment[];
  channels: RadioChannel[];
  joinedChannels: string[];
  activeChannelId: string;
  callsign: string;
  transmissions: RadioTransmission[];
  automatic: boolean;
  knowledge: CharacterKnowledge[];
  conversations: CharacterConversation[];
  scenarios: ResponseScenario[];
}
export function createResponseState(): ResponseState {
  return {
    units: [],
    assignments: [],
    channels: [
      { id: "dispatch", name: "Dispatch" },
      { id: "police", name: "Police", agency: "Police" },
      { id: "tactical", name: "Tactical", agency: "Tactical" },
      { id: "fire", name: "Fire", agency: "Fire" },
      { id: "medical", name: "Medical", agency: "Medical" },
      { id: "command", name: "Command", commandOnly: true },
      { id: "all-call", name: "All-call" },
    ],
    joinedChannels: ["dispatch"],
    activeChannelId: "dispatch",
    callsign: "Dispatch",
    transmissions: [],
    automatic: false,
    knowledge: [],
    conversations: [],
    scenarios: [],
  };
}
export function responseOf(o: OperationsState): ResponseState {
  return { ...createResponseState(), ...o.response };
}
export function exportInvestigation(state: DGAState, caseId: string) {
  const c = state.cases.find((c) => c.id === caseId);
  if (!c) throw new Error("Case not found.");
  const o = state.operations!;
  const r = responseOf(o);
  const incidents = o.incidents.filter((i) => i.caseId === caseId);
  const incidentIds = new Set(incidents.map((i) => i.id));
  const assignments = r.assignments.filter((a) =>
    incidentIds.has(a.incidentId),
  );
  return {
    format: "dga-investigation-pack",
    version: 1,
    exportedAt: new Date().toISOString(),
    case: structuredClone(c),
    interviews: o.interviews.filter((i) => i.caseId === caseId),
    records: o.records.filter((i) => i.caseId === caseId),
    warrants: o.warrants.filter((i) => i.caseId === caseId),
    proceedings: o.proceedings.filter((i) => i.caseId === caseId),
    inmates: o.inmates.filter((i) => i.caseId === caseId),
    incidents,
    calls: o.calls.filter(
      (call) => call.incidentId && incidentIds.has(call.incidentId),
    ),
    assignments,
    units: r.units.filter((u) => assignments.some((a) => a.unitId === u.id)),
    radio: r.transmissions.filter(
      (t) => t.incidentId && incidentIds.has(t.incidentId),
    ),
  };
}
export type ResponseCommand =
  | { type: "unit-save"; callsign: string; agency: Agency }
  | { type: "unit-duty"; unitId: string; onDuty: boolean; available: boolean }
  | { type: "assign-unit"; unitId: string; incidentId: string }
  | {
      type: "unit-progress";
      assignmentId: string;
      status: ResponseStatus;
      report?: string;
    }
  | { type: "unit-report"; assignmentId: string; report: string }
  | { type: "unit-panic"; unitId: string }
  | { type: "ack-panic"; unitId: string; reason: string }
  | { type: "response-automatic"; enabled: boolean }
  | { type: "response-tick"; manual?: boolean; incidentIds?: string[] }
  | { type: "radio-join"; channelId: string; join: boolean }
  | { type: "radio-switch"; channelId: string }
  | { type: "radio-callsign"; callsign: string }
  | {
      type: "radio-send";
      channelId: string;
      text: string;
      incidentId?: string;
      emergency: boolean;
    }
  | {
      type: "character-knowledge";
      caseId: string;
      personId: string;
      demeanor: string;
      facts: string[];
    }
  | {
      type: "character-turn";
      caseId: string;
      personId: string;
      question: string;
      factIds: string[];
      source: string;
      contextSignature: string;
      presentedRecordIds: string[];
    }
  | {
      type: "scenario-start";
      template: "delivery" | "collision";
      location: string;
    }
  | { type: "scenario-discover"; scenarioId: string; leadId: string };
const RESPONSE_COMMANDS = new Set([
  "unit-save",
  "unit-duty",
  "assign-unit",
  "unit-progress",
  "unit-report",
  "unit-panic",
  "ack-panic",
  "response-automatic",
  "response-tick",
  "radio-join",
  "radio-switch",
  "radio-callsign",
  "radio-send",
  "character-knowledge",
  "character-turn",
  "scenario-start",
  "scenario-discover",
]);
export function isResponseCommand(command: {
  type: string;
}): command is ResponseCommand {
  return RESPONSE_COMMANDS.has(command.type);
}
const req = (s: string, label: string) => {
  if (!s?.trim()) throw new Error(`${label} is required.`);
  return s.trim();
};
const lookup = <T extends { id: string }>(
  rows: T[],
  id: string,
  label: string,
): T => {
  const r = rows.find((x) => x.id === id);
  if (!r) throw new Error(`${label} not found.`);
  return r;
};
export function caseSourceFacts(
  c: DGACase,
  recordIds: string[],
): KnowledgeFact[] {
  const sources = [
    ...c.evidence.map((x) => ({
      id: x.id,
      text: `${x.title}: ${x.description}`,
    })),
    ...c.documents.map((x) => ({
      id: x.id,
      text: `${x.title}: ${x.content || ""}`,
    })),
    ...(c.findings || []).map((x) => ({ id: x.id, text: x.statement })),
  ];
  return recordIds.map((id) => {
    const record = lookup(sources, id, "Presented case record");
    return { ...record, text: record.text.slice(0, 2400) };
  });
}
export function dialogueContext(
  state: DGAState,
  caseId: string,
  personId: string,
  presentedRecordIds: string[] = [],
) {
  const o = state.operations!;
  const r = responseOf(o);
  const c = lookup(state.cases, caseId, "Case");
  const p = c.people.find((p) => p.personId === personId);
  if (!p) throw new Error("Link this person to the selected case first.");
  const knowledge = r.knowledge.find(
    (k) => k.caseId === caseId && k.personId === personId,
  );
  const ownInterviews = o.interviews
    .filter(
      (i) =>
        i.caseId === caseId &&
        i.personId === personId &&
        !r.conversations.some((c) => c.id === i.id),
    )
    .map((i) => ({ id: i.id, text: i.transcript }));
  const facts = [
    { id: `identity:${personId}`, text: `My name is ${p.name}.` },
    ...(knowledge?.facts || []),
    ...ownInterviews,
    ...caseSourceFacts(c, presentedRecordIds),
  ];
  const conversation = r.conversations.find(
    (x) => x.caseId === caseId && x.personId === personId,
  );
  const context = {
    caseId,
    personId,
    name: p.name,
    role: p.role,
    demeanor: knowledge?.demeanor || "Neutral",
    facts,
    memory: conversation?.turns.slice(-12) || [],
  };
  return { ...context, signature: JSON.stringify(context) };
}
export function localFactSelection(
  facts: KnowledgeFact[],
  question: string,
): string[] {
  if(/name|who.*you/i.test(question)) { const identity=facts.find(f=>f.id.startsWith('identity:')); if(identity) return [identity.id]; }
  if (facts.some((f) => f.id === "description")) {
    const q = question.toLowerCase();
    const key = /where|address|location/.test(q)
      ? "location"
      : /name|who.*you/.test(q)
        ? "name"
        : /number|phone|call back/.test(q)
          ? "number"
          : /priority|urgent/.test(q)
            ? "priority"
            : /happen|describe|tell|see|hurt/.test(q)
              ? "description"
              : undefined;
    if (key) return [key];
  }
  const words =
    question
      .toLowerCase()
      .match(/[a-z]{4,}/g)
      ?.filter(
        (w) =>
          ![
            "what",
            "where",
            "when",
            "know",
            "about",
            "tell",
            "please",
            "there",
            "have",
            "that",
            "this",
            "does",
            "were",
          ].includes(w),
      ) || [];
  const ranked = facts
    .map((f) => ({
      id: f.id,
      score: words.filter((w) => f.text.toLowerCase().includes(w)).length,
    }))
    .sort((a, b) => b.score - a.score);
  if (/what.*know|tell.*happen|what.*happen|tell.*everything/i.test(question))
    return facts.slice(0, 3).map((f) => f.id);
  return ranked
    .filter((f) => f.score > 0)
    .slice(0, 3)
    .map((f) => f.id);
}
/** Mutates only the unpublished operations snapshot owned by the parent transaction. */
export function applyResponseCommand(
  state: DGAState,
  o: OperationsState,
  command: ResponseCommand,
  actor: OperationsActor,
): string {
  const r = (o.response = responseOf(o));
  const now = new Date().toISOString();
  const id = createRecordId(command.type.toUpperCase());
  const incident = (id: string) => lookup(o.incidents, id, "Incident");
  const unit = (id: string) => lookup(r.units, id, "Unit");
  const assignmentFor = (unitId: string) =>
    r.assignments.find((a) => a.unitId === unitId && a.status !== "cleared");
  const transmit = (
    channelId: string,
    sender: string,
    text: string,
    incidentId?: string,
    unitId?: string,
    emergency = false,
    npc = true,
  ) =>
    r.transmissions.push({
      id: createRecordId("RADIO"),
      channelId,
      sender,
      text,
      at: now,
      incidentId,
      unitId,
      emergency,
      npc,
    });
  const advance = (
    a: UnitAssignment,
    status: ResponseStatus,
    report?: string,
  ) => {
    const u = unit(a.unitId);
    const i = incident(a.incidentId);
    const next = {
      assigned: "en route",
      "en route": "on scene",
      "on scene": "cleared",
      cleared: "",
    };
    if (next[a.status] !== status)
      throw new Error("Follow the response stages in order.");
    if (status === "cleared" && u.panic)
      throw new Error("Acknowledge the unit panic before clearing.");
    if (status === "cleared") {
      a.report = req(report || a.report || "", "Response report");
      u.available = u.onDuty;
    }
    a.status = status;
    a.updatedAt = now;
    a.dueAt = new Date(Date.now() + 12000).toISOString();
    const detail =
      status === "cleared"
        ? a.report!
        : `${u.callsign} ${status} at ${i.location}.`;
    a.history.push({ at: now, status, detail });
    transmit("dispatch", u.callsign, detail, i.id, u.id);
  };
  switch (command.type) {
    case "unit-save": {
      const callsign = req(command.callsign, "Callsign");
      if (!["Police", "Tactical", "Fire", "Medical"].includes(command.agency))
        throw new Error("Choose an agency.");
      if (
        r.units.some((u) => u.callsign.toLowerCase() === callsign.toLowerCase())
      )
        throw new Error("Callsign already registered.");
      r.units.push({
        id,
        callsign,
        agency: command.agency,
        onDuty: false,
        available: false,
        panic: false,
      });
      return id;
    }
    case "unit-duty": {
      const u = unit(command.unitId);
      if (assignmentFor(u.id))
        throw new Error(
          "Clear the active assignment before changing duty or availability.",
        );
      if (u.panic) throw new Error("Acknowledge the unit panic first.");
      u.onDuty = command.onDuty;
      u.available = command.onDuty && command.available;
      return u.id;
    }
    case "assign-unit": {
      const u = unit(command.unitId);
      const i = incident(command.incidentId);
      if (i.status !== "open")
        throw new Error("Reopen this incident before assigning a unit.");
      if (!u.onDuty || !u.available || u.panic || assignmentFor(u.id))
        throw new Error("This unit is unavailable.");
      u.available = false;
      r.assignments.push({
        id,
        unitId: u.id,
        incidentId: i.id,
        status: "assigned",
        assignedAt: now,
        updatedAt: now,
        dueAt: new Date(Date.now() + 12000).toISOString(),
        history: [
          { at: now, status: "assigned", detail: `Assigned by ${actor.name}` },
        ],
      });
      transmit(
        "dispatch",
        u.callsign,
        `Assignment acknowledged: ${i.location}.`,
        i.id,
        u.id,
      );
      return id;
    }
    case "unit-progress": {
      const a = lookup(r.assignments, command.assignmentId, "Assignment");
      advance(a, command.status, command.report);
      return a.id;
    }
    case "unit-report": {
      const a = lookup(r.assignments, command.assignmentId, "Assignment");
      if (!["on scene", "cleared"].includes(a.status))
        throw new Error("A unit must attend the scene before reporting.");
      a.report = req(command.report, "Response report");
      a.updatedAt = now;
      a.history.push({ at: now, status: "report", detail: a.report });
      transmit(
        "dispatch",
        unit(a.unitId).callsign,
        a.report,
        a.incidentId,
        a.unitId,
      );
      return a.id;
    }
    case "unit-panic": {
      const u = unit(command.unitId);
      if (!u.onDuty) throw new Error("This unit is off duty.");
      if (u.panic) return u.id;
      const a = assignmentFor(u.id);
      u.panic = true;
      if (a) {
        incident(a.incidentId).priority = "Critical";
        incident(a.incidentId).updatedAt = now;
      }
      transmit(
        "all-call",
        u.callsign,
        "Emergency traffic. Unit panic activated. Assistance requested.",
        a?.incidentId,
        u.id,
        true,
      );
      return u.id;
    }
    case "ack-panic": {
      const u = unit(command.unitId);
      if (!u.panic) throw new Error("No active panic alert.");
      transmit(
        "all-call",
        actor.name,
        `Panic acknowledged for ${u.callsign}: ${req(command.reason, "Acknowledgment details")}`,
        assignmentFor(u.id)?.incidentId,
        u.id,
        true,
        false,
      );
      u.panic = false;
      return u.id;
    }
    case "response-automatic":
      r.automatic = command.enabled;
      return id;
    case "response-tick": {
      if (!command.manual && !r.automatic) return id;
      for (const a of r.assignments.filter(
        (a) =>
          a.status !== "cleared" &&
          (!command.incidentIds || command.incidentIds.includes(a.incidentId)),
      )) {
        if ((!command.manual && a.dueAt > now) || unit(a.unitId).panic)
          continue;
        const status = (
          {
            assigned: "en route",
            "en route": "on scene",
            "on scene": "cleared",
          } as const
        )[a.status as Exclude<ResponseStatus, "cleared">];
        const report =
          a.report ||
          `Attended ${incident(a.incidentId).location}. Report received: ${incident(a.incidentId).description} Independent scene observations have not been recorded.`;
        advance(a, status, report);
      }
      return id;
    }
    case "radio-join": {
      const ch = lookup(r.channels, command.channelId, "Channel");
      if (ch.commandOnly && !actor.canApproveLegal)
        throw new Error("Command channel requires command authority.");
      if (command.join)
        r.joinedChannels = [...new Set([...r.joinedChannels, ch.id])];
      else {
        if (r.activeChannelId === ch.id)
          throw new Error("Switch channels before leaving the active channel.");
        r.joinedChannels = r.joinedChannels.filter((id) => id !== ch.id);
      }
      return ch.id;
    }
    case "radio-switch": {
      const ch = lookup(r.channels, command.channelId, "Channel");
      if (ch.commandOnly && !actor.canApproveLegal)
        throw new Error("Command channel requires command authority.");
      if (!r.joinedChannels.includes(command.channelId))
        throw new Error("Join the channel first.");
      r.activeChannelId = command.channelId;
      return command.channelId;
    }
    case "radio-callsign":
      r.callsign = req(command.callsign, "Operator callsign");
      return id;
    case "radio-send": {
      const ch = lookup(r.channels, command.channelId, "Channel");
      if (!r.joinedChannels.includes(ch.id))
        throw new Error("Join the channel before transmitting.");
      if (ch.commandOnly && !actor.canApproveLegal)
        throw new Error("Command channel requires command authority.");
      if (command.incidentId) {
        const i = incident(command.incidentId);
        if (command.emergency) {
          i.priority = "Critical";
          i.updatedAt = now;
        }
      }
      const text = req(command.text, "Transmission");
      transmit(
        ch.id,
        r.callsign,
        text,
        command.incidentId,
        undefined,
        command.emergency,
        false,
      );
      const responders = r.units.filter(
        (u) => u.onDuty && (!ch.agency || u.agency === ch.agency),
      );
      for (const u of responders) {
        const a = assignmentFor(u.id);
        if (command.incidentId && a && a.incidentId !== command.incidentId)
          continue;
        transmit(
          ch.id,
          u.callsign,
          `Acknowledged, ${r.callsign}.${a ? ` Status ${a.status}.` : u.available ? " Available." : " Unavailable."}`,
          command.incidentId,
          u.id,
        );
      }
      return id;
    }
    case "character-knowledge": {
      if (!actor.canApproveLegal)
        throw new Error("Scenario authoring requires command authority.");
      const c = lookup(state.cases, command.caseId, "Case");
      if (!c.people.some((p) => p.personId === command.personId))
        throw new Error("Link the character first.");
      const k: CharacterKnowledge = {
        caseId: c.id,
        personId: command.personId,
        demeanor: req(command.demeanor, "Demeanor"),
        facts: command.facts
          .filter((t) => t.trim())
          .map((text) => ({ id: createRecordId("KNOW"), text: text.trim() })),
      };
      r.knowledge = [
        ...r.knowledge.filter(
          (x) => x.caseId !== c.id || x.personId !== k.personId,
        ),
        k,
      ];
      return id;
    }
    case "character-turn": {
      const ctx = dialogueContext(
        state,
        command.caseId,
        command.personId,
        command.presentedRecordIds,
      );
      if (ctx.signature !== command.contextSignature)
        throw new Error(
          "The character context changed. Ask again using the current records.",
        );
      const selected = [...new Set(command.factIds)].map((id) =>
        lookup(ctx.facts, id, "Character knowledge"),
      );
      const reply = selected.length
        ? selected.map((f) => f.text).join(" ")
        : "I cannot confirm that from what I know.";
      let conversation = r.conversations.find(
        (c) => c.caseId === ctx.caseId && c.personId === ctx.personId,
      );
      if (!conversation) {
        conversation = {
          id,
          caseId: ctx.caseId,
          personId: ctx.personId,
          turns: [],
        };
        r.conversations.push(conversation);
      }
      conversation.turns.push({
        id: createRecordId("TURN"),
        at: now,
        question: req(command.question, "Question"),
        reply,
        source: command.source,
        factIds: selected.map((f) => f.id),
      });
      return conversation.id;
    }
    case "scenario-start": {
      const location = req(command.location, "Scenario location");
      const collision = command.template === "collision";
      if (!["delivery", "collision"].includes(command.template))
        throw new Error("Unknown scenario template.");
      const title = collision
        ? "Roadside collision inquiry"
        : "Missing delivery inquiry";
      const caller = collision ? "Morgan Hale" : "Robin Vale";
      const witness = collision ? "Casey Reed" : "Avery Moss";
      const description = collision
        ? `Two vehicles collided at ${location}. One driver left on foot. I can see someone waiting beside the other vehicle.`
        : `A sealed delivery disappeared from the public counter at ${location}. I saw someone leave carrying a gray bag.`;
      const callId = createRecordId("CALL");
      const callerId = createRecordId("CITIZEN");
      const witnessId = createRecordId("CITIZEN");
      o.calls.push({
        id: callId,
        caller,
        number: "555-0174",
        location,
        description,
        priority: collision ? "High" : "Priority",
        status: "incoming",
        direction: "incoming",
        createdAt: now,
        transcript: [
          {
            at: now,
            speaker: "System",
            text: "Simulated scenario call queued.",
          },
        ],
      });
      for (const p of [
        { id: callerId, name: caller },
        { id: witnessId, name: witness },
      ])
        o.citizens.push({ ...p, birthDate: "", address: "", notes: "" });
      r.scenarios.push({
        id,
        callId,
        title,
        hiddenFacts: collision
          ? [
              "The fleeing driver was distracted; intent and liability still require investigation.",
            ]
          : [
              "A courier moved the parcel to an adjacent locker without signing the transfer log.",
            ],
        actors: [
          {
            personId: callerId,
            name: caller,
            role: "Reporting party",
            facts: [
              { id: createRecordId("KNOW"), text: description },
              {
                id: createRecordId("KNOW"),
                text: collision
                  ? "The departing driver wore a green jacket. I could not read a plate."
                  : "The person with the gray bag wore a courier badge. I did not read their name.",
              },
            ],
          },
          {
            personId: witnessId,
            name: witness,
            role: "Witness",
            facts: [
              {
                id: createRecordId("KNOW"),
                text: collision
                  ? "I heard a horn before the impact. I did not see the traffic signal."
                  : "I saw a courier open the locker beside the counter. I did not see what they put inside.",
              },
            ],
          },
        ],
        leads: [
          {
            id: createRecordId("LEAD"),
            title: collision
              ? "Intersection camera retention notice"
              : "Counter transfer log",
            description: collision
              ? "Camera footage may be requested from the transport office. No footage has been reviewed."
              : "The counter log has a delivery entry with no signed transfer. No author has been attributed.",
            discovered: false,
          },
        ],
      });
      return callId;
    }
    case "scenario-discover": {
      const s = lookup(r.scenarios, command.scenarioId, "Scenario");
      if (!s.caseId) throw new Error("Link an investigation first.");
      const i = o.incidents.find(
        (i) => i.caseId === s.caseId && i.callIds.includes(s.callId),
      );
      if (
        !i ||
        !r.assignments.some(
          (a) =>
            a.incidentId === i.id && ["on scene", "cleared"].includes(a.status),
        )
      )
        throw new Error(
          "A responding unit must reach the scene before collecting scene records.",
        );
      const lead = lookup(s.leads, command.leadId, "Lead");
      if (lead.discovered) return lead.id;
      const c = lookup(state.cases, s.caseId, "Case");
      c.documents.push({
        id: lead.id,
        title: lead.title,
        classification: c.classification,
        date: now,
        author: actor.name,
        sourceSystem: "COMMS",
        content: lead.description,
      });
      lead.discovered = true;
      return lead.id;
    }
  }
}
/** Keep reports, radio logs and interviews connected even when the case is created later. */
export function synchronizeResponseRecords(
  state: DGAState,
  o: OperationsState,
) {
  const r = o.response;
  if (!r) return;
  for (const s of r.scenarios) {
    const i = o.incidents.find((i) => i.callIds.includes(s.callId));
    if (!i?.caseId) continue;
    s.caseId = i.caseId;
    const c = state.cases.find((c) => c.id === s.caseId);
    if (!c) continue;
    for (const a of s.actors) {
      if (!c.people.some((p) => p.personId === a.personId))
        c.people.push({
          personId: a.personId,
          name: a.name,
          role: a.role,
          affiliation: "Not recorded",
          threatLevel: "None",
          status: "Not recorded",
        });
      if (
        !r.knowledge.some((k) => k.caseId === c.id && k.personId === a.personId)
      )
        r.knowledge.push({
          caseId: c.id,
          personId: a.personId,
          demeanor: "Cooperative",
          facts: structuredClone(a.facts),
        });
    }
  }
  const upsert = (c: DGACase, id: string, title: string, content: string) => {
    const d = c.documents.find((d) => d.id === id);
    if (d) {
      if (d.content !== content) {
        d.content = content;
        d.date = new Date().toISOString();
      }
    } else
      c.documents.push({
        id,
        title,
        content,
        classification: c.classification,
        date: new Date().toISOString(),
        author: "Agency response desk",
        sourceSystem: "COMMS",
      });
  };
  for (const i of o.incidents) {
    const c = state.cases.find((c) => c.id === i.caseId);
    if (!c) continue;
    for (const a of r.assignments.filter(
      (a) => a.incidentId === i.id && a.report,
    ))
      upsert(
        c,
        `RESPONSE-${a.id}`,
        `Response report · ${r.units.find((u) => u.id === a.unitId)?.callsign}`,
        a.report!,
      );
    const traffic = r.transmissions.filter((t) => t.incidentId === i.id);
    if (traffic.length)
      upsert(
        c,
        `RADIO-${i.id}`,
        "Incident radio log",
        traffic
          .map((t) => `${t.at} [${t.channelId}] ${t.sender}: ${t.text}`)
          .join("\n"),
      );
  }
  for (const conv of r.conversations) {
    const c = state.cases.find((c) => c.id === conv.caseId);
    if (!c) continue;
    const transcript = conv.turns
      .map(
        (t) =>
          `Investigator: ${t.question}\nCharacter: ${t.reply}\nSource: ${t.source}`,
      )
      .join("\n\n");
    let interview = o.interviews.find((i) => i.id === conv.id);
    if (!interview) {
      interview = {
        id: conv.id,
        caseId: conv.caseId,
        personId: conv.personId,
        transcript,
        supportingRecordIds: [],
        recordedAt: new Date().toISOString(),
        recordedBy: state.profile.name,
      };
      o.interviews.push(interview);
    } else interview.transcript = transcript;
  }
}
