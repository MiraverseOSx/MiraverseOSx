import React, { useEffect, useRef, useState } from "react";
import { FolderSearch, Scale, PhoneIncoming, Plus } from "lucide-react";
import type { DGAState } from "@/lib/dga-types";
import type { DGAAuthorityContext } from "@/lib/dga-permissions";
import {
  citizenIndex,
  operationsOf,
  type OperationsCommand,
} from "@/lib/operations";
import { runOperationsCommand } from "@/lib/dga-store";
import { sendDgaCaseToTrace } from "@/lib/dga-trace-bridge";

import {
  Form,
  Panel,
  control,
  button,
  option,
  priorities,
  type InputSpec,
} from "./operations-ui";
import { DgaResponseWorkspace } from "./dga-response-workspace";
import { askEmergencyCaller } from "@/lib/operations-dialogue";
import { exportInvestigation } from "@/lib/response-operations";
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DgaOperationsWorkspace({
  state,
  authority,
  onOpenCase,
  onOpenTrace,
  initialTab = "investigation",
}: {
  state: DGAState;
  authority: DGAAuthorityContext;
  onOpenCase: (id: string) => void;
  onOpenTrace: (id: string) => void;
  initialTab?: "investigation" | "records" | "calls" | "response";
}) {
  const [tab, setTab] = useState(initialTab);
  const [caseId, setCaseId] = useState(state.activeCaseId || "");
  const [personId, setPersonId] = useState("");
  const [search, setSearch] = useState("");
  const [refs, setRefs] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [selectedCallId, setSelectedCallId] = useState("");
  const [voice, setVoice] = useState(false);
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const recognition = useRef<any>(null);
  const busyAction = useRef(false);
  const [working, setWorking] = useState(false);
  const allOperations = operationsOf(state);
  const visibleCases = new Set(state.cases.map((c) => c.id));
  const visibleCaseRecord = (r: { caseId?: string }) =>
    !r.caseId || visibleCases.has(r.caseId);
  const o = {
    ...allOperations,
    interviews: allOperations.interviews.filter(visibleCaseRecord),
    records: allOperations.records.filter(visibleCaseRecord),
    warrants: allOperations.warrants.filter(visibleCaseRecord),
    proceedings: allOperations.proceedings.filter(visibleCaseRecord),
    inmates: allOperations.inmates.filter(visibleCaseRecord),
    incidents: allOperations.incidents.filter(visibleCaseRecord),
    calls: allOperations.calls.filter((call) => {
      const incident = allOperations.incidents.find(
        (i) => i.id === call.incidentId,
      );
      return !incident || visibleCaseRecord(incident);
    }),
  };
  const citizens = citizenIndex(state);
  const c = state.cases.find((x) => x.id === caseId);
  const person = citizens.find((x) => x.id === personId);
  const cmd = (value: OperationsCommand) =>
    runOperationsCommand(value, authority);
  const action = async (fn: () => Promise<unknown>) => {
    if (busyAction.current) return;
    busyAction.current = true;
    setWorking(true);
    setNotice("");
    try {
      await fn();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    } finally {
      busyAction.current = false;
      setWorking(false);
    }
  };
  const call = o.calls.find((x) => x.id === selectedCallId) || o.calls.at(-1);
  const caseOptions = state.cases.map((x) =>
    option(x.id, `${x.id} · ${x.title}`),
  );
  const personOptions = citizens.map((x) =>
    option(x.id, `${x.name} · ${x.id}`),
  );
  const linkedOptions =
    c?.people.map((x) => option(x.personId, `${x.name} · ${x.role}`)) || [];
  const sourceRecords = c
    ? [
        ...c.evidence.map((x) => option(x.id, `Evidence · ${x.title}`)),
        ...c.documents.map((x) => option(x.id, `Document · ${x.title}`)),
        ...o.interviews
          .filter((x) => x.caseId === c.id)
          .map((x) =>
            option(
              x.id,
              `Interview · ${citizens.find((p) => p.id === x.personId)?.name || x.personId}`,
            ),
          ),
        ...o.records
          .filter((x) => x.caseId === c.id)
          .map((x) => option(x.id, `${x.kind} · ${x.reference}`)),
      ]
    : [];
  useEffect(() => {
    setRefs([]);
  }, [caseId]);
  useEffect(
    () => () => {
      recognition.current?.abort();
      window.speechSynthesis?.cancel();
    },
    [],
  );
  const speak = (text: string) => {
    if (voice && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };
  const callAction = (
    actionName: "answer" | "hold" | "resume" | "disconnect" | "callback",
  ) =>
    action(async () => {
      if (!call) return;
      const id = await cmd({
        type: "call-stage",
        id: call.id,
        action: actionName,
      });
      setSelectedCallId(id);
      if (actionName === "answer") speak(call.description);
    });
  const sendMessage = async (text: string) => {
    if (!call) return;
    await askEmergencyCaller(call.id, text, authority);
    setMessage("");
    const { getDGAState } = await import("@/lib/dga-store");
    const last = operationsOf(getDGAState())
      .calls.find((x) => x.id === call.id)
      ?.transcript.at(-1);
    if (last) speak(last.text);
  };
  const startMic = () => {
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setNotice(
        "Microphone transcription is unavailable in this browser. Use the message box.",
      );
      return;
    }
    const r = new Recognition();
    recognition.current = r;
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e: any) => {
      setMessage(e.results[0][0].transcript);
    };
    r.onerror = (e: any) => {
      setNotice(
        `Microphone unavailable (${e.error}). You can type the message.`,
      );
      setListening(false);
    };
    r.onend = () => setListening(false);
    try {
      r.start();
      setListening(true);
    } catch {
      setNotice("Could not start the microphone. Use the message box.");
    }
  };
  const caseField: InputSpec = {
    name: "caseId",
    label: "Case",
    options: caseOptions,
    value: c?.id,
  };
  const subjectField: InputSpec = {
    name: "personId",
    label: "Case subject",
    options: linkedOptions,
  };
  return (
    <div
      className="h-full flex flex-col bg-[#f5f4f8] text-[#262337] min-w-0"
      data-testid="operations-workspace"
    >
      <header className="px-5 py-4 border-b border-[#cfcddb] bg-[#eeedf5] flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[16px] font-bold">Operations</h2>
          <p className="text-[11px] text-[#67617b]">
            Investigation, civic records and emergency intake
          </p>
        </div>
        <div className="flex gap-1">
          {(
            [
              ["investigation", "Connected cases", FolderSearch],
              ["records", "Records & legal", Scale],
              ["calls", "Emergency calls", PhoneIncoming],
              ["response", "Dispatch & radio", FolderSearch],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              className={`${button} ${tab === id ? "!bg-[#5d5a86] !text-white" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon className="inline w-3.5 h-3.5 mr-1" />
              {label}
            </button>
          ))}
        </div>
      </header>
      {notice && (
        <div
          role="status"
          className="px-5 py-2 bg-[#fff4d8] text-[#59451c] text-[12px]"
        >
          {notice}
        </div>
      )}
      <div className="overflow-auto flex-1 p-5 space-y-4 select-text">
        {tab !== "calls" && tab !== "response" && (
          <div className="flex gap-3 flex-wrap items-end">
            <label className="text-[11px] flex-1 min-w-48">
              Active case
              <select
                aria-label="Operations case"
                className={control}
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
              >
                <option value="">Choose a case</option>
                {caseOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>
            {c && (
              <button className={button} onClick={() => onOpenCase(c.id)}>
                Open full case file
              </button>
            )}
            {c && (
              <button
                className={button}
                onClick={() =>
                  download(
                    `${c.id}-investigation.json`,
                    exportInvestigation(state, c.id),
                  )
                }
              >
                Export investigation
              </button>
            )}
          </div>
        )}
        {tab === "response" && (
          <DgaResponseWorkspace
            state={state}
            authority={authority}
            onOpenCase={onOpenCase}
            onCallQueued={() => setTab("calls")}
          />
        )}
        {tab === "investigation" && (
          <>
            {!c ? (
              <Panel title="Choose a case">
                <p className="text-[12px]">
                  Create a case in Cases, or create an investigation from an
                  emergency incident.
                </p>
              </Panel>
            ) : (
              <>
                <Panel title={c.title}>
                  <p className="text-[12px] whitespace-pre-wrap">{c.summary}</p>
                  <p className="text-[11px] text-[#67617b]">
                    {c.people.length} people · {c.evidence.length} exhibits ·{" "}
                    {c.tasks.length} tasks · {c.forensicRequests.length} TRACE
                    requests
                  </p>
                </Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Form
                    title="Link citizen to case"
                    fields={[
                      {
                        name: "personId",
                        label: "Citizen",
                        options: personOptions,
                      },
                      {
                        name: "role",
                        label: "Case role",
                        options: [
                          "Witness",
                          "Suspect",
                          "Victim",
                          "Reporting party",
                          "Other relevant person",
                        ].map((x) => option(x)),
                      },
                    ]}
                    submit="Link citizen"
                    onSubmit={(v) =>
                      cmd({
                        type: "link-person",
                        caseId: c.id,
                        personId: v.personId,
                        role: v.role,
                      })
                    }
                  />
                  <Panel title="Supporting records">
                    <p className="text-[11px] text-[#67617b]">
                      Choose sources for a finding, interview or task. Add
                      exhibits and documents in the full case file.
                    </p>
                    {sourceRecords.length ? (
                      sourceRecords.map((x) => (
                        <label key={x.value} className="flex gap-2 text-[12px]">
                          <input
                            type="checkbox"
                            checked={refs.includes(x.value)}
                            onChange={(e) =>
                              setRefs((old) =>
                                e.target.checked
                                  ? [...old, x.value]
                                  : old.filter((id) => id !== x.value),
                              )
                            }
                          />
                          {x.label}
                        </label>
                      ))
                    ) : (
                      <p className="text-[12px]">No supporting records yet.</p>
                    )}
                  </Panel>
                  <Form
                    title="Record interview"
                    fields={[
                      subjectField,
                      {
                        name: "transcript",
                        label: "Interview transcript",
                        multiline: true,
                      },
                    ]}
                    submit="Save interview"
                    onSubmit={(v) =>
                      cmd({
                        type: "interview",
                        caseId: c.id,
                        personId: v.personId,
                        transcript: v.transcript,
                        supportingRecordIds: refs,
                      })
                    }
                  />
                  <div className="space-y-4">
                    <Form
                      title="Record supported finding"
                      fields={[
                        {
                          name: "statement",
                          label: "Observation",
                          multiline: true,
                        },
                      ]}
                      submit="Save finding"
                      onSubmit={(v) =>
                        cmd({
                          type: "finding",
                          caseId: c.id,
                          statement: v.statement,
                          supportingRecordIds: refs,
                        })
                      }
                    />
                    <Form
                      title="Create linked follow-up"
                      fields={[{ name: "title", label: "Task description" }]}
                      submit="Create follow-up"
                      onSubmit={(v) =>
                        cmd({
                          type: "task",
                          caseId: c.id,
                          title: v.title,
                          supportingRecordIds: refs,
                        })
                      }
                    />
                  </div>
                </div>
                <Panel title="Interview record">
                  {o.interviews
                    .filter((x) => x.caseId === c.id)
                    .map((x) => (
                      <article
                        key={x.id}
                        className="border-t border-[#e7e5ef] pt-3 text-[12px]"
                      >
                        <b>{citizens.find((p) => p.id === x.personId)?.name}</b>
                        <p className="text-[10px] text-[#67617b]">
                          {new Date(x.recordedAt).toLocaleString()} ·{" "}
                          {x.recordedBy} · {x.supportingRecordIds.length}{" "}
                          sources
                        </p>
                        <p className="whitespace-pre-wrap">{x.transcript}</p>
                      </article>
                    ))}
                  {!o.interviews.some((x) => x.caseId === c.id) && (
                    <p className="text-[12px]">No interviews recorded.</p>
                  )}
                </Panel>
                <Panel title="TRACE examinations">
                  <p className="text-[11px]">
                    Select exhibits above and submit a specific examination.
                    Reports return through the original request.
                  </p>
                  <Form
                    title="Send examination to TRACE"
                    fields={[
                      {
                        name: "module",
                        label: "Examination module",
                        options: [
                          option("biology", "DNA / biology"),
                          option("toxicology", "Toxicology"),
                          option("digital", "Digital forensics"),
                          option("documents", "Document analysis"),
                          option("firearms", "Firearms"),
                          option("prints", "Fingerprints"),
                        ],
                      },
                      {
                        name: "question",
                        label: "Investigative question",
                        multiline: true,
                      },
                    ]}
                    submit="Submit to TRACE"
                    onSubmit={async (v) => {
                      const result = await sendDgaCaseToTrace(
                        c,
                        c.evidence.filter((e) => refs.includes(e.id)),
                        [v.module],
                        v.question,
                      );
                      if (!result.success) throw new Error(result.message);
                      setNotice(result.message);
                    }}
                  />
                  {c.forensicRequests.map((r) => (
                    <article
                      key={r.id}
                      className="border-t border-[#cfcddb] pt-2 text-[12px]"
                    >
                      <b>
                        {r.targetModules.join(", ")} · {r.status}
                      </b>
                      <p>{r.investigativeQuestion || r.notes}</p>
                      {r.resultSummary && (
                        <p className="whitespace-pre-wrap">
                          Report: {r.resultSummary}
                        </p>
                      )}
                      {r.linkedTraceCaseId && (
                        <button
                          className={button}
                          onClick={() => onOpenTrace(r.linkedTraceCaseId!)}
                        >
                          Open TRACE case
                        </button>
                      )}
                    </article>
                  ))}
                </Panel>
              </>
            )}
          </>
        )}
        {tab === "records" && (
          <>
            <Panel title="Shared citizen records">
              <p className="text-[11px]">
                Import existing AURA citizens with their issued IDs. New
                profiles here are investigative records; official identity
                documents remain managed in AURA.
              </p>
              <button
                className={button}
                disabled={working}
                onClick={() =>
                  action(async () => {
                    const { getCanonicalCitizens } = await import(
                      "../../../integration/citizenBridge"
                    );
                    const records = await getCanonicalCitizens();
                    await cmd({
                      type: "registry-citizens",
                      citizens: records.map((p) => ({
                        id: p.maid || p.legacyRecord || p.id,
                        name: p.name,
                        birthDate: p.dob,
                        address: p.address || p.home,
                        notes: "",
                      })),
                    });
                    setNotice(
                      "Existing citizen IDs imported. No existing case roles were changed.",
                    );
                  })
                }
              >
                Import AURA citizens
              </button>
            </Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Citizen and vehicle lookup">
                <input
                  aria-label="Search citizen or vehicle"
                  placeholder="Name, citizen ID or vehicle reference…"
                  className={control}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="max-h-56 overflow-auto">
                  {citizens
                    .filter((p) =>
                      `${p.name} ${p.id} ${o.records
                        .filter(
                          (r) => r.personId === p.id && r.kind === "vehicle",
                        )
                        .map((r) => r.reference)
                        .join(" ")}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        className={`${button} block w-full text-left mb-1 ${personId === p.id ? "!bg-[#dfdceb]" : ""}`}
                        onClick={() => setPersonId(p.id)}
                      >
                        {p.name}
                        <span className="block text-[10px] font-normal break-all">
                          {p.id}
                        </span>
                      </button>
                    ))}
                </div>
              </Panel>
              <Form
                key={personId || "new"}
                title={
                  person
                    ? "Edit citizen details"
                    : "Create investigation profile"
                }
                fields={[
                  { name: "name", label: "Full name", value: person?.name },
                  {
                    name: "birthDate",
                    label: "Birth date",
                    type: "date",
                    optional: true,
                    value: person?.birthDate,
                  },
                  {
                    name: "address",
                    label: "Address",
                    optional: true,
                    value: person?.address,
                  },
                  {
                    name: "notes",
                    label: "Registry notes",
                    multiline: true,
                    optional: true,
                    value: person?.notes,
                  },
                ]}
                submit={person ? "Save citizen details" : "Create profile"}
                onSubmit={async (v) => {
                  const id = await cmd({
                    type: "citizen",
                    id: personId || undefined,
                    name: v.name,
                    birthDate: v.birthDate,
                    address: v.address,
                    notes: v.notes,
                  });
                  setPersonId(id);
                }}
              />
            </div>
            {person && (
              <>
                <button className={button} onClick={() => setPersonId("")}>
                  <Plus className="inline w-3 h-3" /> Register another citizen
                </button>
                <Panel title={`${person.name} · record history`}>
                  <p className="text-[12px]">
                    {person.address || "Address not recorded"} ·{" "}
                    {person.birthDate || "Birth date not recorded"}
                  </p>
                  {o.records
                    .filter((r) => r.personId === person.id)
                    .map((r) => (
                      <article
                        key={r.id}
                        className="text-[12px] border-t border-[#cfcddb] pt-2"
                      >
                        <b>
                          {r.kind} · {r.reference} · {r.status}
                        </b>
                        <p className="whitespace-pre-wrap">{r.details}</p>
                        <p className="text-[10px]">
                          {r.caseId || "Registry record"} ·{" "}
                          {new Date(r.recordedAt).toLocaleString()}
                        </p>
                        {r.status === "active" && (
                          <button
                            disabled={working}
                            className={button}
                            onClick={() =>
                              action(() =>
                                cmd({ type: "close-record", id: r.id }),
                              )
                            }
                          >
                            Close record
                          </button>
                        )}
                      </article>
                    ))}
                  <h4 className="text-[12px] font-bold">Court history</h4>
                  {o.proceedings
                    .filter((p) => p.personId === person.id)
                    .map((p) => (
                      <p className="text-[12px]" key={p.id}>
                        {p.caseId} · {p.offenses.map((x) => x.title).join(", ")}{" "}
                        · {p.status}
                        {p.sentence ? ` · ${p.sentence}` : ""}
                      </p>
                    ))}
                  {!o.proceedings.some((p) => p.personId === person.id) && (
                    <p className="text-[12px]">
                      No court records. Allegations and arrests do not establish
                      a conviction.
                    </p>
                  )}
                </Panel>
                <Form
                  title="Add civic record"
                  fields={[
                    {
                      name: "kind",
                      label: "Record type",
                      options: [
                        "vehicle",
                        "license",
                        "bolo",
                        "arrest",
                        "report",
                      ].map((x) => option(x)),
                    },
                    { ...caseField, optional: true },
                    {
                      name: "reference",
                      label: "Plate, license number or record title",
                    },
                    {
                      name: "details",
                      label: "Details / issuing authority / validity",
                      multiline: true,
                    },
                  ]}
                  submit="Save civic record"
                  onSubmit={(v) =>
                    cmd({
                      type: "record",
                      kind: v.kind as any,
                      personId: person.id,
                      caseId: v.caseId || undefined,
                      reference: v.reference,
                      details: v.details,
                    })
                  }
                />
              </>
            )}
            {c && (
              <>
                <Panel title="Case subjects">
                  <p className="text-[12px]">
                    {c.people.map((p) => `${p.name} (${p.role})`).join(" · ") ||
                      "Link citizens under Connected cases first."}
                  </p>
                </Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Form
                    title="Request warrant"
                    fields={[
                      subjectField,
                      { name: "scope", label: "Warrant scope" },
                      {
                        name: "grounds",
                        label: "Grounds and supporting record references",
                        multiline: true,
                      },
                    ]}
                    submit="Submit warrant"
                    onSubmit={(v) =>
                      cmd({
                        type: "warrant",
                        caseId: c.id,
                        personId: v.personId,
                        scope: v.scope,
                        grounds: v.grounds,
                      })
                    }
                  />
                  <Form
                    title="File fictional charge"
                    fields={[
                      subjectField,
                      {
                        name: "offense",
                        label: "Fictional penal code",
                        options: o.code
                          .filter((x) => x.enabled)
                          .map((x) => option(x.id, `${x.id} · ${x.title}`)),
                      },
                      {
                        name: "basis",
                        label: "Charge basis and record references",
                        multiline: true,
                      },
                    ]}
                    submit="File charge"
                    onSubmit={(v) =>
                      cmd({
                        type: "charge",
                        caseId: c.id,
                        personId: v.personId,
                        offenseIds: [v.offense],
                        basis: v.basis,
                      })
                    }
                  />
                </div>
                <Panel title="Warrant decisions and service">
                  {o.warrants
                    .filter((w) => w.caseId === c.id)
                    .map((w) => (
                      <div
                        key={w.id}
                        className="border-t border-[#cfcddb] pt-2 space-y-2"
                      >
                        <p className="text-[12px]">
                          <b>
                            {citizens.find((p) => p.id === w.personId)?.name} ·{" "}
                            {w.status}
                          </b>{" "}
                          · {w.scope}
                        </p>
                        <p className="text-[12px] whitespace-pre-wrap">
                          {w.grounds}
                        </p>
                        <p className="text-[10px]">
                          {w.history
                            .map((h) => `${h.action}: ${h.detail} (${h.actor})`)
                            .join(" → ")}
                        </p>
                        {((w.status === "submitted" &&
                          authority.role === "command_director") ||
                          w.status === "approved") && (
                          <Form
                            title={`Warrant ${w.id}`}
                            fields={[
                              {
                                name: "status",
                                label: "Warrant decision",
                                options: (w.status === "submitted"
                                  ? ["approved", "rejected"]
                                  : ["served"]
                                ).map((x) => option(x)),
                              },
                              {
                                name: "detail",
                                label: "Decision authority or service details",
                              },
                            ]}
                            submit="Record warrant stage"
                            onSubmit={(v) =>
                              cmd({
                                type: "warrant-stage",
                                id: w.id,
                                status: v.status as any,
                                detail: v.detail,
                              })
                            }
                          />
                        )}
                      </div>
                    ))}
                </Panel>
                <Panel title="Charges, hearings and court decisions">
                  {o.proceedings
                    .filter((p) => p.caseId === c.id)
                    .map((p) => (
                      <article
                        key={p.id}
                        className="border-t border-[#cfcddb] pt-3 space-y-2"
                      >
                        <p className="text-[12px]">
                          <b>
                            {citizens.find((x) => x.id === p.personId)?.name} ·{" "}
                            {p.status}
                          </b>{" "}
                          ·{" "}
                          {p.offenses
                            .map((x) => `${x.id} ${x.title}`)
                            .join(", ")}
                        </p>
                        <p className="text-[12px]">{p.basis}</p>
                        <p className="text-[10px] whitespace-pre-wrap">
                          {p.history
                            .map((h) => `${h.action}: ${h.detail} (${h.actor})`)
                            .join("\n")}
                        </p>
                        {authority.role === "command_director" &&
                          ["charged", "hearing", "convicted"].includes(
                            p.status,
                          ) && (
                            <Form
                              title={`Court stage ${p.id}`}
                              fields={[
                                {
                                  name: "status",
                                  label: "Next legal stage",
                                  options: (p.status === "charged"
                                    ? ["hearing"]
                                    : p.status === "hearing"
                                      ? ["acquitted", "convicted"]
                                      : ["sentenced"]
                                  ).map((x) => option(x)),
                                },
                                {
                                  name: "detail",
                                  label:
                                    p.status === "convicted"
                                      ? "Sentence terms and authority"
                                      : "Hearing or court decision details",
                                  multiline: true,
                                },
                              ]}
                              submit="Record court stage"
                              onSubmit={(v) =>
                                cmd({
                                  type: "legal-stage",
                                  id: p.id,
                                  status: v.status as any,
                                  detail: v.detail,
                                })
                              }
                            />
                          )}
                        {authority.role === "command_director" &&
                          p.status === "sentenced" &&
                          !o.inmates.some(
                            (i) =>
                              i.proceedingId === p.id &&
                              i.status === "in custody",
                          ) && (
                            <Form
                              title={`Inmate admission ${p.id}`}
                              fields={[
                                { name: "facility", label: "Custody facility" },
                              ]}
                              submit="Create inmate record"
                              onSubmit={(v) =>
                                cmd({
                                  type: "admit",
                                  proceedingId: p.id,
                                  facility: v.facility,
                                })
                              }
                            />
                          )}
                      </article>
                    ))}
                </Panel>
                <Panel title="Inmate records">
                  {o.inmates
                    .filter((i) => i.caseId === c.id)
                    .map((i) => (
                      <article key={i.id} className="text-[12px] border-t pt-2">
                        <b>
                          {citizens.find((p) => p.id === i.personId)?.name} ·{" "}
                          {i.status}
                        </b>
                        <p>
                          {i.facility} · admitted{" "}
                          {new Date(i.admittedAt).toLocaleString()}
                          {i.releasedAt &&
                            ` · released ${new Date(i.releasedAt).toLocaleString()}`}
                        </p>
                        {authority.role === "command_director" &&
                          i.status === "in custody" && (
                            <Form
                              title={`Release ${i.id}`}
                              fields={[
                                {
                                  name: "detail",
                                  label: "Release authority and reason",
                                },
                              ]}
                              submit="Record release"
                              onSubmit={(v) =>
                                cmd({
                                  type: "release",
                                  id: i.id,
                                  detail: v.detail,
                                })
                              }
                            />
                          )}
                      </article>
                    ))}
                </Panel>
              </>
            )}
            <Panel title="Fictional penal code">
              <p className="text-[11px]">
                Configurable Meridion statutes. Filed charges retain the offense
                wording used when filed.
              </p>
              {o.code.map((x) => (
                <p className="text-[12px]" key={x.id}>
                  {x.id} · {x.title} · {x.category} ·{" "}
                  {x.enabled ? "active" : "disabled"}
                </p>
              ))}
              {authority.role === "command_director" && (
                <Form
                  title="Configure offense"
                  fields={[
                    { name: "id", label: "Offense code" },
                    { name: "title", label: "Offense title" },
                    { name: "category", label: "Offense category" },
                    {
                      name: "enabled",
                      label: "Offense availability",
                      options: [
                        option("true", "Active"),
                        option("false", "Disabled"),
                      ],
                    },
                  ]}
                  submit="Save offense"
                  onSubmit={(v) =>
                    cmd({
                      type: "code",
                      id: v.id,
                      title: v.title,
                      category: v.category,
                      enabled: v.enabled === "true",
                    })
                  }
                />
              )}
            </Panel>
          </>
        )}
        {tab === "calls" && (
          <>
            <Panel title="Emergency intake">
              <p className="text-[12px]">
                Simulated callers and local incident records. NPC replies use
                the call details entered below. Voice is optional.
              </p>
              <button
                className={button}
                disabled={working}
                onClick={() =>
                  action(async () => {
                    const id = await cmd({
                      type: "incoming",
                      caller: "Dena Banks",
                      number: "555-0142",
                      location: "66 Pickman Street",
                      description:
                        "My neighbor Lily is on the kitchen floor with a head injury. Her daughter Stella is missing. I found the front door open.",
                      priority: "Critical",
                    });
                    setSelectedCallId(id);
                  })
                }
              >
                Receive sample NPC call
              </button>
            </Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Form
                title="Create simulated incoming call"
                fields={[
                  {
                    name: "caller",
                    label: "Caller name (blank for unknown)",
                    optional: true,
                  },
                  { name: "number", label: "Callback number", optional: true },
                  { name: "location", label: "Emergency location" },
                  {
                    name: "description",
                    label: "Caller emergency description",
                    multiline: true,
                  },
                  {
                    name: "priority",
                    label: "Reported priority",
                    options: priorities,
                  },
                ]}
                submit="Queue incoming call"
                onSubmit={async (v) => {
                  const id = await cmd({
                    type: "incoming",
                    caller: v.caller,
                    number: v.number,
                    location: v.location,
                    description: v.description,
                    priority: v.priority as any,
                  });
                  setSelectedCallId(id);
                }}
              />
              <Panel title="Call log">
                <div className="max-h-80 overflow-auto">
                  {[...o.calls].reverse().map((x) => (
                    <button
                      key={x.id}
                      className={`${button} w-full mb-1 text-left ${call?.id === x.id ? "!bg-[#dfdceb]" : ""}`}
                      onClick={() => setSelectedCallId(x.id)}
                    >
                      {x.caller} · {x.status}
                      <span className="text-[10px] block">
                        {x.direction} · {new Date(x.createdAt).toLocaleString()}{" "}
                        · {x.location}
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
            {call && (
              <Panel title={`${call.caller} · ${call.status}`}>
                <p className="text-[12px]">
                  {call.number || "No callback number"} · {call.location} ·{" "}
                  {call.priority}
                </p>
                <div className="flex flex-wrap gap-2">
                  {call.status === "incoming" && (
                    <button
                      disabled={working}
                      className={button}
                      onClick={() => callAction("answer")}
                    >
                      Answer call
                    </button>
                  )}
                  {call.status === "connected" && (
                    <button
                      disabled={working}
                      className={button}
                      onClick={() => callAction("hold")}
                    >
                      Hold call
                    </button>
                  )}
                  {call.status === "held" && (
                    <button
                      disabled={working}
                      className={button}
                      onClick={() => callAction("resume")}
                    >
                      Resume call
                    </button>
                  )}
                  {["incoming", "connected", "held"].includes(call.status) && (
                    <button
                      disabled={working}
                      className={button}
                      onClick={() => callAction("disconnect")}
                    >
                      Disconnect call
                    </button>
                  )}
                  {["ended", "transferred"].includes(call.status) && (
                    <button
                      disabled={working || !call.number}
                      className={button}
                      onClick={() => callAction("callback")}
                    >
                      Call back
                    </button>
                  )}
                  <button
                    disabled={working || call.status === "incoming"}
                    className={button}
                    onClick={() =>
                      action(() => cmd({ type: "incident", callId: call.id }))
                    }
                  >
                    {call.incidentId
                      ? "View linked incident below"
                      : "Create dispatch incident"}
                  </button>
                  <button
                    className={button}
                    onClick={() => download(`${call.id}.json`, call)}
                  >
                    Export call log
                  </button>
                  <label className="text-[12px] flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={voice}
                      onChange={(e) => {
                        setVoice(e.target.checked);
                        if (!e.target.checked) window.speechSynthesis?.cancel();
                      }}
                    />
                    Spoken NPC replies
                  </label>
                </div>
                <div
                  role="log"
                  aria-label="Emergency transcript"
                  className="max-h-72 overflow-auto space-y-2 p-3 bg-[#f5f4f8] border border-[#e3e0ed] text-[12px]"
                >
                  {call.transcript.map((t, index) => (
                    <p key={index}>
                      <b>{t.speaker}</b>{" "}
                      <span className="text-[10px] text-[#67617b]">
                        {new Date(t.at).toLocaleTimeString()}
                      </span>
                      <br />
                      {t.text}
                    </p>
                  ))}
                </div>
                {call.status === "connected" && (
                  <form
                    aria-label="Speak to caller"
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      action(() => sendMessage(message));
                    }}
                  >
                    <input
                      aria-label="Message to caller"
                      className={`${control} flex-1 min-w-48`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Ask about the location or what happened…"
                    />
                    <button disabled={working} className={button}>
                      Send message
                    </button>
                    <button
                      className={button}
                      type="button"
                      onClick={() =>
                        listening ? recognition.current?.stop() : startMic()
                      }
                    >
                      {listening ? "Stop microphone" : "Use microphone"}
                    </button>
                  </form>
                )}
                {["connected", "held"].includes(call.status) && (
                  <Form
                    title="Transfer emergency call"
                    fields={[
                      {
                        name: "target",
                        label: "Transfer destination",
                        options: [
                          "Police dispatch",
                          "Fire dispatch",
                          "Medical dispatch",
                          "Supervisor",
                        ].map((x) => option(x)),
                      },
                    ]}
                    submit="Transfer call"
                    onSubmit={(v) =>
                      cmd({
                        type: "call-stage",
                        id: call.id,
                        action: "transfer",
                        target: v.target,
                      })
                    }
                  />
                )}
              </Panel>
            )}
            <Panel title="Dispatch incidents">
              {[...o.incidents]
                .sort(
                  (a, b) =>
                    priorities.findIndex((p) => p.value === a.priority) -
                    priorities.findIndex((p) => p.value === b.priority),
                )
                .map((i) => (
                  <article
                    key={i.id}
                    className="border-t border-[#cfcddb] pt-3 space-y-3"
                  >
                    <b className="text-[12px]">
                      {i.location} · {i.priority} · {i.status}
                    </b>
                    <p className="text-[12px] whitespace-pre-wrap">
                      {i.description}
                    </p>
                    <p className="text-[10px]">
                      {i.callIds.length} linked calls ·{" "}
                      {i.caseId || "No investigation linked"}
                    </p>
                    <Form
                      key={`${i.id}-${i.updatedAt}`}
                      title={`Update incident ${i.location}`}
                      fields={[
                        {
                          name: "location",
                          label: "Incident location",
                          value: i.location,
                        },
                        {
                          name: "description",
                          label: "Incident description",
                          value: i.description,
                          multiline: true,
                        },
                        {
                          name: "priority",
                          label: "Incident priority",
                          options: priorities,
                          value: i.priority,
                        },
                        {
                          name: "status",
                          label: "Incident status",
                          options: ["open", "closed"].map((x) => option(x)),
                          value: i.status,
                        },
                      ]}
                      submit="Update dispatch incident"
                      onSubmit={(v) =>
                        cmd({
                          type: "update-incident",
                          id: i.id,
                          location: v.location,
                          description: v.description,
                          priority: v.priority as any,
                          status: v.status as any,
                        })
                      }
                    />
                    {i.caseId ? (
                      <button
                        className={button}
                        onClick={() => onOpenCase(i.caseId!)}
                      >
                        Open linked investigation
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          disabled={working}
                          className={button}
                          onClick={() =>
                            action(async () => {
                              const id = await cmd({
                                type: "investigate",
                                incidentId: i.id,
                              });
                              setCaseId(id);
                              setTab("investigation");
                            })
                          }
                        >
                          Create investigation from incident
                        </button>
                        <Form
                          title={`Link incident ${i.location}`}
                          fields={[{ ...caseField, value: undefined }]}
                          submit="Link to existing investigation"
                          onSubmit={(v) =>
                            cmd({
                              type: "investigate",
                              incidentId: i.id,
                              caseId: v.caseId,
                            })
                          }
                        />
                      </div>
                    )}
                  </article>
                ))}
              {!o.incidents.length && (
                <p className="text-[12px]">
                  Answer a call and create its dispatch incident to begin.
                </p>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
