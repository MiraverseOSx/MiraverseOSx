import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const root = new URL("../src/dgaos/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    let result;
    const name = specifier.startsWith("@/")
      ? new URL(specifier.slice(2), root).href
      : specifier;
    try {
      result = next(name, context);
    } catch (error) {
      if (!name.startsWith(".") && !name.startsWith("file:")) throw error;
      const base = new URL(name, context.parentURL);
      const candidate = [
        new URL(`${base.href}.ts`),
        new URL(`${base.href}/index.ts`),
      ].find((url) => existsSync(fileURLToPath(url)));
      if (!candidate) throw error;
      result = next(candidate.href, context);
    }
    return result.url.endsWith(".json")
      ? { ...result, importAttributes: { type: "json" } }
      : result;
  },
  load(url, context, next) {
    if (
      url.startsWith("file:") &&
      new URL(url).pathname.endsWith(".ts") &&
      !url.includes("node_modules")
    ) {
      return {
        format: "module",
        shortCircuit: true,
        source: transformSync(readFileSync(new URL(url), "utf8"), {
          loader: "ts",
          target: "es2022",
          format: "esm",
        }).code,
      };
    }
    return next(url, context);
  },
});
function memory() {
  const data = new Map();
  const storage = {
    data,
    get length() {
      return data.size;
    },
    key: (i) => [...data.keys()][i] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, raw) => data.set(key, raw),
    removeItem: (key) => data.delete(key),
  };
  globalThis.localStorage = storage;
  globalThis.window = {
    localStorage: storage,
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
  };
  return storage;
}
memory();
const store = await import("../src/dgaos/lib/dga-store.ts");
const { buildManualIncidentCase } = await import(
  "../src/dgaos/lib/dga-incident.ts"
);
const { processSimulationTick, processOfflineProgression } = await import(
  "../src/dgaos/lib/simulation/simulation-engine.ts"
);
const { evaluateTaskCompletionReaction } = await import(
  "../src/dgaos/lib/simulation/reaction-engine.ts"
);
const trace = await import("../src/dgaos/lib/case-store.ts");
const task = {
  id: "task",
  title: "Interview witness and request TRACE",
  description: "Submit case evidence to TRACE",
  completed: true,
};

const { applyOperationsCommand, operationsOf, citizenIndex } = await import(
  "../src/dgaos/lib/operations.ts"
);
const { resolveDGAAuthority } = await import(
  "../src/dgaos/lib/dga-permissions.ts"
);
const actor = { name: "Test commander", canApproveLegal: true };
function fixture() {
  let state = store.createDefaultDGAState();
  state.cases = [
    buildManualIncidentCase(
      { narrative: "Station inquiry" },
      "CASE-A",
      actor.name,
    ),
    buildManualIncidentCase(
      { narrative: "Separate inquiry" },
      "CASE-B",
      actor.name,
    ),
  ];
  const run = (command, who = actor) => {
    const result = applyOperationsCommand(state, command, who);
    state = result.state;
    return result.id;
  };
  const personId = run({
    type: "citizen",
    name: "Alex Rowe",
    birthDate: "",
    address: "Station Row",
    notes: "",
  });
  run({ type: "link-person", caseId: "CASE-A", personId, role: "Witness" });
  return {
    get state() {
      return state;
    },
    run,
    personId,
  };
}
test("citizen IDs, roles and same-name profiles remain distinct across cases", () => {
  const f = fixture();
  f.run({
    type: "link-person",
    caseId: "CASE-B",
    personId: f.personId,
    role: "Suspect",
  });
  const second = f.run({
    type: "citizen",
    name: "Alex Rowe",
    birthDate: "",
    address: "",
    notes: "",
  });
  assert.notEqual(second, f.personId);
  assert.equal(f.state.cases[0].people[0].role, "Witness");
  assert.equal(f.state.cases[1].people[0].personId, f.personId);
  f.run({
    type: "registry-citizens",
    citizens: [
      {
        id: "MAID-OR-00001",
        name: "Registered Citizen",
        birthDate: "",
        address: "",
        notes: "",
      },
    ],
  });
  f.run({
    type: "registry-citizens",
    citizens: [
      {
        id: "MAID-OR-00001",
        name: "Registered Citizen",
        birthDate: "",
        address: "",
        notes: "",
      },
    ],
  });
  assert.equal(
    citizenIndex(f.state).filter((p) => p.id === "MAID-OR-00001").length,
    1,
  );
});
test("interviews, findings and tasks cite case-local sources and reject unrelated records without mutation", () => {
  const f = fixture();
  const interviewId = f.run({
    type: "interview",
    caseId: "CASE-A",
    personId: f.personId,
    transcript: "I saw a red parcel.",
    supportingRecordIds: [],
  });
  f.run({
    type: "finding",
    caseId: "CASE-A",
    statement: "The witness reports a red parcel.",
    supportingRecordIds: [interviewId],
  });
  f.run({
    type: "task",
    caseId: "CASE-A",
    title: "Locate parcel",
    supportingRecordIds: [interviewId],
  });
  assert.deepEqual(f.state.cases[0].findings[0].supportingRecordIds, [
    interviewId,
  ]);
  assert.equal(
    JSON.parse(f.state.cases[0].tasks[0].customFields.supportingRecordIds)[0],
    interviewId,
  );
  const before = JSON.stringify(f.state);
  assert.throws(
    () =>
      f.run({
        type: "finding",
        caseId: "CASE-B",
        statement: "Cross contamination",
        supportingRecordIds: [interviewId],
      }),
    /belong to this case/,
  );
  assert.throws(
    () =>
      f.run({
        type: "interview",
        caseId: "CASE-B",
        personId: f.personId,
        transcript: "No link",
        supportingRecordIds: [],
      }),
    /Link this citizen/,
  );
  assert.equal(JSON.stringify(f.state), before);
});
test("warrants require explicit approval before service and preserve decisions", () => {
  const f = fixture();
  const id = f.run({
    type: "warrant",
    caseId: "CASE-A",
    personId: f.personId,
    scope: "Locker search",
    grounds: "Witness account",
  });
  assert.throws(
    () =>
      f.run({
        type: "warrant-stage",
        id,
        status: "served",
        detail: "Too soon",
      }),
    /approved/,
  );
  assert.throws(
    () =>
      f.run(
        {
          type: "warrant-stage",
          id,
          status: "approved",
          detail: "Unauthorized",
        },
        { ...actor, canApproveLegal: false },
      ),
    /authority/,
  );
  f.run({
    type: "warrant-stage",
    id,
    status: "approved",
    detail: "Approved by fictional magistrate",
  });
  f.run({
    type: "warrant-stage",
    id,
    status: "served",
    detail: "Served at locker",
  });
  assert.deepEqual(
    operationsOf(f.state).warrants[0].history.map((h) => h.action),
    ["submitted", "approved", "served"],
  );
  assert.equal(f.state.cases[0].status, "Active");
});
test("charges, hearing, verdict, sentence and custody remain separate; offense snapshots stay intact", () => {
  const f = fixture();
  const id = f.run({
    type: "charge",
    caseId: "CASE-A",
    personId: f.personId,
    offenseIds: ["MER-202"],
    basis: "Recorded evidence",
  });
  f.run({
    type: "code",
    id: "MER-202",
    title: "Revised theft statute",
    category: "Property",
    enabled: false,
  });
  assert.equal(operationsOf(f.state).proceedings[0].offenses[0].title, "Theft");
  assert.throws(
    () =>
      f.run({
        type: "legal-stage",
        id,
        status: "sentenced",
        detail: "Skipped verdict",
      }),
    /preceding/,
  );
  assert.throws(
    () => f.run({ type: "admit", proceedingId: id, facility: "Custody" }),
    /sentence/,
  );
  f.run({
    type: "legal-stage",
    id,
    status: "hearing",
    detail: "Hearing held with defense present",
  });
  f.run({
    type: "legal-stage",
    id,
    status: "convicted",
    detail: "Fictional court decision",
  });
  f.run({
    type: "legal-stage",
    id,
    status: "sentenced",
    detail: "Two fictional months",
  });
  const inmate = f.run({
    type: "admit",
    proceedingId: id,
    facility: "Meridion correctional center",
  });
  assert.throws(
    () => f.run({ type: "admit", proceedingId: id, facility: "Duplicate" }),
    /already/,
  );
  f.run({ type: "release", id: inmate, detail: "Sentence completed" });
  assert.equal(operationsOf(f.state).inmates[0].status, "released");
  assert.equal(f.state.cases[0].status, "Active");
});
test("acquittal prevents sentencing; arrests never imply conviction", () => {
  const f = fixture();
  f.run({
    type: "record",
    kind: "arrest",
    personId: f.personId,
    caseId: "CASE-A",
    reference: "Arrest report",
    details: "Pending hearing",
  });
  assert.equal(operationsOf(f.state).proceedings.length, 0);
  const id = f.run({
    type: "charge",
    caseId: "CASE-A",
    personId: f.personId,
    offenseIds: ["MER-202"],
    basis: "Allegation",
  });
  f.run({ type: "legal-stage", id, status: "hearing", detail: "Heard" });
  f.run({
    type: "legal-stage",
    id,
    status: "acquitted",
    detail: "Insufficient proof",
  });
  assert.throws(
    () =>
      f.run({
        type: "legal-stage",
        id,
        status: "sentenced",
        detail: "Invalid",
      }),
    /preceding/,
  );
});
test("vehicle references cannot duplicate active registrations and citizens retain license/report history", () => {
  const f = fixture();
  const record = {
    type: "record",
    kind: "vehicle",
    personId: f.personId,
    reference: "MER-123",
    details: "Blue hatchback",
  };
  const id = f.run(record);
  assert.throws(
    () => f.run({ ...record, reference: "mer-123" }),
    /already registered/,
  );
  f.run({ type: "close-record", id });
  f.run(record);
  f.run({
    ...record,
    kind: "license",
    reference: "DL-12",
    details: "Class A; valid until 2030",
  });
  assert.equal(operationsOf(f.state).records.length, 3);
});
function incoming(f, overrides = {}) {
  return f.run({
    type: "incoming",
    caller: "NPC caller",
    number: "555-0190",
    location: "Station Row",
    description: "A parcel was left at the station.",
    priority: "High",
    ...overrides,
  });
}
test("emergency calls enforce connection, hold, resume, transfer, callback and one connected line", () => {
  const f = fixture();
  const callId = incoming(f);
  assert.throws(
    () => f.run({ type: "call-message", id: callId, text: "Where?" }),
    /Connect/,
  );
  f.run({ type: "call-stage", id: callId, action: "answer" });
  const other = incoming(f);
  assert.throws(
    () => f.run({ type: "call-stage", id: other, action: "answer" }),
    /current connected/,
  );
  f.run({ type: "call-stage", id: callId, action: "hold" });
  assert.throws(
    () => f.run({ type: "call-message", id: callId, text: "Where?" }),
    /Connect/,
  );
  f.run({ type: "call-stage", id: callId, action: "resume" });
  f.run({ type: "call-message", id: callId, text: "What is the location?" });
  assert.match(
    operationsOf(f.state).calls[0].transcript.at(-1).text,
    /Station Row/,
  );
  f.run({
    type: "call-stage",
    id: callId,
    action: "transfer",
    target: "Police dispatch",
  });
  const callback = f.run({
    type: "call-stage",
    id: callId,
    action: "callback",
  });
  assert.notEqual(callback, callId);
  assert.equal(operationsOf(f.state).calls.at(-1).parentCallId, callId);
});
test("unknown callers cannot be called back without a number", () => {
  const f = fixture();
  const callId = incoming(f, { caller: "", number: "" });
  f.run({ type: "call-stage", id: callId, action: "disconnect" });
  assert.throws(
    () => f.run({ type: "call-stage", id: callId, action: "callback" }),
    /callback number/,
  );
  assert.equal(operationsOf(f.state).calls[0].caller, "Unknown caller");
});
test("call-to-incident and incident-to-case are idempotent; callbacks update the originating case transcript", () => {
  const f = fixture();
  const callId = incoming(f);
  f.run({ type: "call-stage", id: callId, action: "answer" });
  const incident = f.run({ type: "incident", callId });
  assert.equal(f.run({ type: "incident", callId }), incident);
  const caseId = f.run({ type: "investigate", incidentId: incident });
  assert.equal(f.run({ type: "investigate", incidentId: incident }), caseId);
  f.run({ type: "call-stage", id: callId, action: "disconnect" });
  const callback = f.run({
    type: "call-stage",
    id: callId,
    action: "callback",
  });
  f.run({ type: "call-message", id: callback, text: "What happened?" });
  f.run({
    type: "update-incident",
    id: incident,
    location: "Station east entrance",
    description: "Revised report",
    priority: "Critical",
    status: "open",
  });
  const c = f.state.cases.find((c) => c.id === caseId);
  assert.equal(c.documents.length, 1);
  assert.match(c.documents[0].content, /Callback connected/);
  assert.match(c.documents[0].content, /Station east entrance/);
  assert.equal(c.evidence.length, 0);
  assert.equal(c.findings.length, 0);
  assert.equal(operationsOf(f.state).incidents[0].callIds.length, 2);
  assert.equal(f.state.cases[1].documents.length, 0);
});
test("operations changes survive reload and storage failures leave the prior state intact", async () => {
  const storage = memory();
  await store.resetDGAWorld();
  const auth = resolveDGAAuthority({
    profile: store.getDGAState().profile,
    roleOverride: "command_director",
  });
  const id = await store.runOperationsCommand(
    {
      type: "incoming",
      caller: "NPC",
      number: "",
      location: "Civic plaza",
      description: "Smoke reported",
      priority: "High",
    },
    auth,
  );
  const reloaded = await new store.LocalStorageDGAAdapter().loadState();
  assert.equal(reloaded.operations.calls[0].id, id);
  const before = JSON.stringify(store.getDGAState());
  storage.setItem = () => {
    throw new Error("Storage full");
  };
  await assert.rejects(
    store.runOperationsCommand(
      { type: "call-stage", id, action: "answer" },
      auth,
    ),
    /Storage full/,
  );
  assert.equal(JSON.stringify(store.getDGAState()), before);
  await assert.rejects(
    store.runOperationsCommand(
      { type: "call-stage", id, action: "answer" },
      resolveDGAAuthority({ roleOverride: "civic_observer" }),
    ),
    /credentials/,
  );
});
test("submitting an indictment no longer invents warrant service or closes the case", async () => {
  memory();
  await store.resetDGAWorld();
  const c = await store.createManualIncidentCase({
    narrative: "Independent incident",
  });
  await store.submitDGACaseIndictment(c.id, { primaryCause: "Unconfirmed" });
  assert.equal(store.getDGAState().cases[0].status, "Active");
  assert.equal(
    store.getDGAState().cases[0].causeHypothesis.indictmentStatus,
    "Submitted",
  );
  assert.doesNotMatch(
    store.getDGAState().cases[0].timeline[0].description,
    /Warrant served/,
  );
});

test("TRACE requests remain in analysis until all linked examinations return and receipts are idempotent", async () => {
  memory();
  await store.resetDGAWorld();
  const c = await store.createManualIncidentCase({
    narrative: "Two laboratory disciplines requested",
  });
  c.linkedTraceCaseId = "TRACE-LAB";
  c.forensicRequests.push({
    id: "FREQ-linked",
    caseId: c.id,
    evidenceIds: [],
    targetModules: ["biology", "documents"],
    status: "Pending",
    linkedTraceCaseId: "TRACE-LAB",
    traceExamIds: ["EX-one", "EX-two"],
  });
  assert.equal(
    await store.attachTraceResultToDgaCase(
      c.id,
      "FREQ-linked",
      "First analysis",
      "TRACE-LAB",
      { reportId: "RP-one", examId: "EX-one" },
    ),
    true,
  );
  let request = store.getDGAState().cases[0].forensicRequests[0];
  assert.equal(request.status, "Under Analysis");
  const documents = store.getDGAState().cases[0].documents.length;
  await store.attachTraceResultToDgaCase(
    c.id,
    "FREQ-linked",
    "First analysis",
    "TRACE-LAB",
    { reportId: "RP-one", examId: "EX-one" },
  );
  assert.equal(store.getDGAState().cases[0].documents.length, documents);
  assert.equal(
    await store.attachTraceResultToDgaCase(
      c.id,
      "FREQ-linked",
      "Foreign analysis",
      "TRACE-LAB",
      { reportId: "RP-foreign", examId: "EX-foreign" },
    ),
    false,
  );
  await store.attachTraceResultToDgaCase(
    c.id,
    "FREQ-linked",
    "Second analysis",
    "TRACE-LAB",
    { reportId: "RP-two", examId: "EX-two" },
  );
  request = store.getDGAState().cases[0].forensicRequests[0];
  assert.equal(request.status, "Completed");
  assert.match(request.resultSummary, /First analysis/);
  assert.match(request.resultSummary, /Second analysis/);
});

const { responseOf, dialogueContext, exportInvestigation } = await import(
  "../src/dgaos/lib/response-operations.ts"
);
const { selectKnownFacts, askCaseCharacter } = await import(
  "../src/dgaos/lib/operations-dialogue.ts"
);
function dispatchFixture() {
  const f = fixture();
  const callId = incoming(f);
  f.run({ type: "call-stage", id: callId, action: "answer" });
  const incidentId = f.run({ type: "incident", callId });
  const unitId = f.run({
    type: "unit-save",
    callsign: "PATROL-1",
    agency: "Police",
  });
  return {
    ...f,
    get state() {
      return f.state;
    },
    callId,
    incidentId,
    unitId,
  };
}
test("disconnected unanswered calls cannot create incidents; callbacks before intake share one incident", () => {
  const f = fixture();
  const missed = incoming(f);
  f.run({ type: "call-stage", id: missed, action: "disconnect" });
  assert.throws(() => f.run({ type: "incident", callId: missed }), /Answer/);
  const callId = incoming(f);
  f.run({ type: "call-stage", id: callId, action: "answer" });
  f.run({ type: "call-stage", id: callId, action: "disconnect" });
  const cb = f.run({ type: "call-stage", id: callId, action: "callback" });
  const incidentId = f.run({ type: "incident", callId: cb });
  assert.equal(f.run({ type: "incident", callId }), incidentId);
  assert.deepEqual(
    new Set(operationsOf(f.state).incidents[0].callIds),
    new Set([callId, cb]),
  );
});
test("off-duty and busy units cannot be assigned; incidents cannot close with responding units", () => {
  const f = dispatchFixture();
  assert.throws(
    () =>
      f.run({
        type: "assign-unit",
        unitId: f.unitId,
        incidentId: f.incidentId,
      }),
    /unavailable/,
  );
  f.run({ type: "unit-duty", unitId: f.unitId, onDuty: true, available: true });
  const a = f.run({
    type: "assign-unit",
    unitId: f.unitId,
    incidentId: f.incidentId,
  });
  assert.throws(
    () =>
      f.run({
        type: "assign-unit",
        unitId: f.unitId,
        incidentId: f.incidentId,
      }),
    /unavailable/,
  );
  assert.throws(
    () =>
      f.run({
        type: "unit-duty",
        unitId: f.unitId,
        onDuty: false,
        available: false,
      }),
    /Clear/,
  );
  assert.throws(
    () =>
      f.run({
        type: "update-incident",
        id: f.incidentId,
        location: "Station",
        description: "Test",
        priority: "High",
        status: "closed",
      }),
    /Clear responding/,
  );
  assert.throws(
    () =>
      f.run({
        type: "unit-progress",
        assignmentId: a,
        status: "cleared",
        report: "Skipped scene",
      }),
    /order/,
  );
});
test("multi-agency responses progress independently, panic blocks clearing and raises priority", () => {
  const f = dispatchFixture();
  const medical = f.run({
    type: "unit-save",
    callsign: "MEDIC-1",
    agency: "Medical",
  });
  for (const unitId of [f.unitId, medical]) {
    f.run({ type: "unit-duty", unitId, onDuty: true, available: true });
    f.run({ type: "assign-unit", unitId, incidentId: f.incidentId });
  }
  f.run({ type: "response-tick", manual: true });
  f.run({ type: "response-tick", manual: true });
  f.run({ type: "unit-panic", unitId: f.unitId });
  assert.equal(operationsOf(f.state).incidents[0].priority, "Critical");
  f.run({ type: "response-tick", manual: true });
  let r = responseOf(operationsOf(f.state));
  assert.equal(r.assignments[0].status, "on scene");
  assert.equal(r.assignments[1].status, "cleared");
  f.run({
    type: "ack-panic",
    unitId: f.unitId,
    reason: "Backup has arrived; unit confirms safe",
  });
  f.run({
    type: "unit-progress",
    assignmentId: r.assignments[0].id,
    status: "cleared",
    report: "No independent observation of a suspect.",
  });
  r = responseOf(operationsOf(f.state));
  assert.equal(r.units[0].available, true);
  assert.ok(r.transmissions.some((t) => t.emergency));
});
test("response reports and radio records follow late investigation referrals without duplicated documents", () => {
  const f = dispatchFixture();
  f.run({ type: "unit-duty", unitId: f.unitId, onDuty: true, available: true });
  const assignmentId = f.run({
    type: "assign-unit",
    unitId: f.unitId,
    incidentId: f.incidentId,
  });
  for (let n = 0; n < 3; n++) f.run({ type: "response-tick", manual: true });
  const caseId = f.run({ type: "investigate", incidentId: f.incidentId });
  const count = f.state.cases.find((c) => c.id === caseId).documents.length;
  f.run({
    type: "unit-report",
    assignmentId,
    report: "Follow-up: a station attendant supplied a log.",
  });
  const c = f.state.cases.find((c) => c.id === caseId);
  assert.equal(c.documents.length, count);
  assert.ok(c.documents.some((d) => d.content.includes("station attendant")));
});
test("radio requires joined channels, scopes acknowledgments to duty and agency, and protects command", () => {
  const f = dispatchFixture();
  f.run({ type: "unit-duty", unitId: f.unitId, onDuty: true, available: true });
  assert.throws(
    () =>
      f.run({
        type: "radio-send",
        channelId: "police",
        text: "Status?",
        emergency: false,
      }),
    /Join/,
  );
  f.run({ type: "radio-join", channelId: "police", join: true });
  f.run({ type: "radio-switch", channelId: "police" });
  f.run({
    type: "radio-send",
    channelId: "police",
    text: "Status?",
    incidentId: f.incidentId,
    emergency: false,
  });
  const r = responseOf(operationsOf(f.state));
  assert.equal(r.transmissions.filter((t) => t.npc).length, 1);
  assert.match(r.transmissions.at(-1).text, /Available/);
  assert.throws(
    () =>
      f.run(
        { type: "radio-join", channelId: "command", join: true },
        { ...actor, canApproveLegal: false },
      ),
    /authority/,
  );
  f.run({ type: "radio-join", channelId: "command", join: true });
  assert.throws(
    () =>
      f.run(
        { type: "radio-switch", channelId: "command" },
        { ...actor, canApproveLegal: false },
      ),
    /authority/,
  );
});
test("scenario hidden facts remain outside conversations, discoveries and exported investigator packs", () => {
  const f = fixture();
  const callId = f.run({
    type: "scenario-start",
    template: "delivery",
    location: "Central depot",
  });
  f.run({ type: "call-stage", id: callId, action: "answer" });
  const incidentId = f.run({ type: "incident", callId });
  const caseId = f.run({ type: "investigate", incidentId });
  let r = responseOf(operationsOf(f.state));
  const scenario = r.scenarios[0];
  const personId = scenario.actors[0].personId;
  const ctx = dialogueContext(f.state, caseId, personId);
  assert.ok(!JSON.stringify(ctx).includes(scenario.hiddenFacts[0]));
  assert.throws(
    () =>
      f.run({
        type: "scenario-discover",
        scenarioId: scenario.id,
        leadId: scenario.leads[0].id,
      }),
    /reach the scene/,
  );
  f.run({
    type: "character-turn",
    caseId,
    personId,
    question: "What happened?",
    factIds: [ctx.facts[0].id],
    source: "Local",
    contextSignature: ctx.signature,
    presentedRecordIds: [],
  });
  assert.equal(
    operationsOf(f.state).interviews.filter((i) => i.caseId === caseId).length,
    1,
  );
  const pack = exportInvestigation(f.state, caseId);
  assert.ok(!JSON.stringify(pack).includes(scenario.hiddenFacts[0]));
  assert.equal(pack.interviews.length, 1);
});
test("character conversation rejects another person’s facts, stale knowledge and unpresented case records", () => {
  const f = fixture();
  const caseId = "CASE-A",
    personId = f.personId;
  f.run({
    type: "character-knowledge",
    caseId,
    personId,
    demeanor: "Neutral",
    facts: ["I saw a green jacket."],
  });
  const ctx = dialogueContext(f.state, caseId, personId);
  assert.throws(
    () =>
      f.run({
        type: "character-turn",
        caseId,
        personId,
        question: "Who?",
        factIds: ["hidden-fact"],
        source: "AI",
        contextSignature: ctx.signature,
        presentedRecordIds: [],
      }),
    /knowledge/,
  );
  f.run({
    type: "character-knowledge",
    caseId,
    personId,
    demeanor: "Neutral",
    facts: ["I saw a blue jacket."],
  });
  assert.throws(
    () =>
      f.run({
        type: "character-turn",
        caseId,
        personId,
        question: "Who?",
        factIds: [],
        source: "AI",
        contextSignature: ctx.signature,
        presentedRecordIds: [],
      }),
    /context changed/,
  );
  assert.throws(
    () => dialogueContext(f.state, caseId, personId, ["unrelated-document"]),
    /Presented case record/,
  );
});
test("connected AI selects only known IDs and malformed or unavailable providers fall back to grounded facts", async () => {
  const originalFetch = globalThis.fetch;
  const facts = [{ id: "known", text: "The courier wore a badge." }];
  try {
    globalThis.fetch = async () =>
      Response.json({ provider: "openai", text: '{"factIds":["known"]}' });
    assert.match(
      (await selectKnownFacts("case-a", "Witness", facts, "Courier badge?", []))
        .source,
      /openai/,
    );
    globalThis.fetch = async () =>
      Response.json({
        provider: "openai",
        text: '{"factIds":["secret-from-another-case"]}',
      });
    const safe = await selectKnownFacts(
      "case-a",
      "Witness",
      facts,
      "Courier badge?",
      [],
    );
    assert.deepEqual(safe.factIds, ["known"]);
    assert.equal(safe.source, "Local record engine");
    globalThis.fetch = async () => {
      throw new Error("Offline");
    };
    assert.deepEqual(
      (
        await selectKnownFacts(
          "case-a",
          "Witness",
          facts,
          "Unknown weapon?",
          [],
        )
      ).factIds,
      [],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("TRACE storage errors reject new records and retain the previously saved record cache", async () => {
  const storage = memory();
  storage.setItem("trace_records_v2", "[]");
  const { traceDurableStore: lab } = await import(
    "../src/dgaos/services/traceDurableStore.ts"
  );
  await lab.init();
  const before = lab.getRecords();
  const write = storage.setItem;
  storage.setItem = (key, value) => {
    if (key === "trace_records_v2") throw new Error("Storage full");
    write(key, value);
  };
  await assert.rejects(
    lab.saveRecord({
      id: "EX-FAIL",
      kind: "examination",
      caseId: "A",
      revision: 1,
      created: new Date().toISOString(),
      data: {},
    }),
    /Storage full/,
  );
  assert.deepEqual(lab.getRecords(), before);
});

test("NPC response updates continue from the agency clock outside the response screen and respect pause", async () => {
  memory();
  await store.resetDGAWorld();
  const auth = resolveDGAAuthority({
    profile: store.getDGAState().profile,
    roleOverride: "command_director",
  });
  const run = (c) => store.runOperationsCommand(c, auth);
  const callId = await run({
    type: "incoming",
    caller: "NPC",
    number: "555-0123",
    location: "Depot",
    description: "A report",
    priority: "High",
  });
  await run({ type: "call-stage", id: callId, action: "answer" });
  const incidentId = await run({ type: "incident", callId });
  const unitId = await run({
    type: "unit-save",
    callsign: "AUTO-1",
    agency: "Fire",
  });
  await run({ type: "unit-duty", unitId, onDuty: true, available: true });
  await run({ type: "assign-unit", unitId, incidentId });
  await run({ type: "response-automatic", enabled: true });
  store.getDGAState().operations.response.assignments[0].dueAt =
    "2000-01-01T00:00:00Z";
  await store.runSimulationTick();
  assert.equal(
    store.getDGAState().operations.response.assignments[0].status,
    "en route",
  );
  store.getDGAState().simulation.status = "paused";
  store.getDGAState().operations.response.assignments[0].dueAt =
    "2000-01-01T00:00:00Z";
  await store.runSimulationTick();
  assert.equal(
    store.getDGAState().operations.response.assignments[0].status,
    "en route",
  );
});
test("conversation memory can repeat a prior grounded answer after saving", async () => {
  const result = await selectKnownFacts(
    "case",
    "Witness",
    [{ id: "known", text: "Saw a badge." }],
    "Repeat what you told me earlier.",
    [{ factIds: ["known"], reply: "Saw a badge." }],
    false,
  );
  assert.deepEqual(result.factIds, ["known"]);
});

test('duplicate development module URLs share saved calls and live subscribers',async()=>{
 memory();await store.resetDGAWorld();const auth=resolveDGAAuthority({profile:store.getDGAState().profile,roleOverride:'command_director'});
 const callId=await store.runOperationsCommand({type:'incoming',caller:'Runtime test',number:'555-0180',location:'Depot',description:'Test call',priority:'High'},auth);
 const duplicate=await import('../src/dgaos/lib/dga-store.ts?duplicate-runtime-test');
 assert.equal(duplicate.getDGAState().operations.calls.at(-1).id,callId);
 let notifications=0;const off=store.subscribeDGAState(()=>notifications++);
 await duplicate.runOperationsCommand({type:'call-stage',id:callId,action:'answer'},auth);
 assert.equal(store.getDGAState().operations.calls.at(-1).status,'connected');assert.ok(notifications>=2);off();
});
