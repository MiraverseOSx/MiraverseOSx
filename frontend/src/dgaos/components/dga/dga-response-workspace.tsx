import { useEffect, useRef, useState } from "react";
import type { DGAState } from "@/lib/dga-types";
import type { DGAAuthorityContext } from "@/lib/dga-permissions";
import { operationsOf, type OperationsCommand } from "@/lib/operations";
import {
  responseOf,
  type ResponseStatus,
  type Agency,
} from "@/lib/response-operations";
import { runOperationsCommand } from "@/lib/dga-store";
import { askCaseCharacter } from "@/lib/operations-dialogue";
import { Form, Panel, button, control, option } from "./operations-ui";

function RadioMicrophone({
  disabled,
  onText,
}: {
  disabled: boolean;
  onText: (s: string) => void;
}) {
  const active = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => () => active.current?.abort(), []);
  const start = () => {
    if (active.current || disabled) return;
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setNotice(
        "Microphone transcription is unavailable. Type the transmission below.",
      );
      return;
    }
    const rec = new Recognition();
    active.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => onText(e.results[0][0].transcript);
    rec.onerror = (e: any) => {
      setNotice(
        `Microphone unavailable (${e.error}). Text transmission remains available.`,
      );
    };
    rec.onend = () => {
      active.current = null;
      setListening(false);
    };
    try {
      rec.start();
      setListening(true);
    } catch {
      active.current = null;
      setNotice("Microphone could not start.");
    }
  };
  const stop = () => active.current?.stop();
  return (
    <div className="space-y-1">
      <button
        type="button"
        className={button}
        disabled={disabled}
        aria-pressed={listening}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if ([" ", "Enter"].includes(e.key)) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if ([" ", "Enter"].includes(e.key)) {
            e.preventDefault();
            stop();
          }
        }}
        onBlur={stop}
      >
        {listening ? "Listening… release to stop" : "Hold to talk"}
      </button>
      <p className="text-[11px]">Review microphone text before sending.</p>
      {notice && (
        <p role="status" className="text-[12px]">
          {notice}
        </p>
      )}
    </div>
  );
}

export function DgaResponseWorkspace({
  state,
  authority,
  onOpenCase,
  onCallQueued,
}: {
  state: DGAState;
  authority: DGAAuthorityContext;
  onOpenCase: (id: string) => void;
  onCallQueued: () => void;
}) {
  const [tab, setTab] = useState<
    "dispatch" | "radio" | "conversations" | "scenarios"
  >("dispatch");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [caseId, setCaseId] = useState(state.activeCaseId || "");
  const [personId, setPersonId] = useState("");
  const [presented, setPresented] = useState<string[]>([]);
  const [connected, setConnected] = useState(true);
  const [radioText, setRadioText] = useState("");
  const [radioIncident, setRadioIncident] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const o = operationsOf(state);
  const r = responseOf(o);
  const allowedCases = new Set(state.cases.map((c) => c.id));
  const incidents = o.incidents.filter(
    (i) => !i.caseId || allowedCases.has(i.caseId),
  );
  const allowedIncidents = new Set(incidents.map((i) => i.id));
  const assignments = r.assignments.filter((a) =>
    allowedIncidents.has(a.incidentId),
  );
  const traffic = r.transmissions.filter(
    (t) =>
      (!t.incidentId || allowedIncidents.has(t.incidentId)) &&
      (t.channelId !== "command" || authority.role === "command_director"),
  );
  const c = state.cases.find((c) => c.id === caseId);
  const cmd = (command: OperationsCommand) =>
    runOperationsCommand(command, authority);
  const act = async (fn: () => Promise<unknown>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    setPersonId("");
    setPresented([]);
  }, [caseId]);
  const lastSpoken = useRef<string | undefined>(traffic.at(-1)?.id);
  useEffect(() => {
    const latest = traffic.at(-1);
    if (latest?.id !== lastSpoken.current) {
      lastSpoken.current = latest?.id;
      if (spoken && latest?.npc && window.speechSynthesis) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(`${latest.sender}. ${latest.text}`),
        );
      }
    }
  }, [traffic.at(-1)?.id, spoken]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const sorted = [...incidents].sort(
    (a, b) =>
      Number(a.status === "closed") - Number(b.status === "closed") ||
      ["Critical", "High", "Priority", "Routine"].indexOf(a.priority) -
        ["Critical", "High", "Priority", "Routine"].indexOf(b.priority),
  );
  const caseOptions = state.cases.map((c) =>
    option(c.id, `${c.id} · ${c.title}`),
  );
  const conversation = r.conversations.find(
    (x) => x.caseId === caseId && x.personId === personId,
  );
  return (
    <div className="space-y-4" data-testid="response-workspace">
      <div className="flex gap-2 flex-wrap">
        {(["dispatch", "radio", "conversations", "scenarios"] as const).map(
          (id) => (
            <button
              key={id}
              className={`${button} ${tab === id ? "!bg-[#5d5a86] !text-white" : ""}`}
              onClick={() => setTab(id)}
            >
              {
                {
                  dispatch: "Solo dispatch",
                  radio: "Radio channels",
                  conversations: "Character conversations",
                  scenarios: "Scenario workshop",
                }[id]
              }
            </button>
          ),
        )}
      </div>
      {notice && (
        <p
          role="status"
          className="text-[12px] p-3 bg-[#fff4d8] text-[#59451c]"
        >
          {notice}
        </p>
      )}
      {tab === "dispatch" && (
        <>
          <Panel title="Response desk">
            <div className="flex gap-3 items-center flex-wrap">
              <label className="text-[12px] flex gap-2">
                <input
                  type="checkbox"
                  checked={r.automatic}
                  onChange={(e) =>
                    act(() =>
                      cmd({
                        type: "response-automatic",
                        enabled: e.target.checked,
                      }),
                    )
                  }
                />
                Run NPC response updates
              </label>
              <button
                className={button}
                disabled={busy}
                onClick={() =>
                  act(() =>
                    cmd({
                      type: "response-tick",
                      manual: true,
                      incidentIds: incidents.map((i) => i.id),
                    }),
                  )
                }
              >
                Simulate next response update
              </button>
            </div>
            <p className="text-[11px]">
              NPC units acknowledge assignments and progress through en route,
              on scene and cleared. Reports distinguish the received call from
              independent observations.
            </p>
          </Panel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Form
              title="Register response unit"
              fields={[
                { name: "callsign", label: "Unit callsign" },
                {
                  name: "agency",
                  label: "Response agency",
                  options: ["Police", "Tactical", "Fire", "Medical"].map((x) =>
                    option(x),
                  ),
                },
              ]}
              submit="Register unit"
              onSubmit={(v) =>
                cmd({
                  type: "unit-save",
                  callsign: v.callsign,
                  agency: v.agency as Agency,
                })
              }
            />
            <Panel title="Agency roster">
              {!r.units.length && (
                <p className="text-[12px]">
                  Register police, tactical, fire or medical units to begin
                  dispatching.
                </p>
              )}
              {r.units.map((u) => {
                const a = assignments.find(
                  (a) => a.unitId === u.id && a.status !== "cleared",
                );
                return (
                  <article
                    key={u.id}
                    className="border-t border-[#cfcddb] py-2 space-y-2 text-[12px]"
                  >
                    <b>
                      {u.callsign} · {u.agency}
                    </b>
                    <p>
                      {u.onDuty ? "On duty" : "Off duty"} ·{" "}
                      {a?.status || (u.available ? "Available" : "Unavailable")}
                      {u.panic ? " · PANIC" : ""}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        disabled={
                          busy ||
                          !!r.assignments.find(
                            (a) => a.unitId === u.id && a.status !== "cleared",
                          ) ||
                          u.panic
                        }
                        className={button}
                        onClick={() =>
                          act(() =>
                            cmd({
                              type: "unit-duty",
                              unitId: u.id,
                              onDuty: !u.onDuty,
                              available: !u.onDuty,
                            }),
                          )
                        }
                      >
                        {u.onDuty ? "End unit duty" : "Put unit on duty"}
                      </button>
                      {u.onDuty && !a && (
                        <button
                          className={button}
                          disabled={busy}
                          onClick={() =>
                            act(() =>
                              cmd({
                                type: "unit-duty",
                                unitId: u.id,
                                onDuty: true,
                                available: !u.available,
                              }),
                            )
                          }
                        >
                          {u.available ? "Mark unavailable" : "Mark available"}
                        </button>
                      )}
                      {u.onDuty && !u.panic && (
                        <button
                          className={button}
                          disabled={busy}
                          onClick={() =>
                            act(() => cmd({ type: "unit-panic", unitId: u.id }))
                          }
                        >
                          Activate unit panic
                        </button>
                      )}
                    </div>
                    {u.panic && (
                      <Form
                        title={`Panic acknowledgment ${u.callsign}`}
                        fields={[
                          {
                            name: "reason",
                            label: "Panic acknowledgment details",
                          },
                        ]}
                        submit="Acknowledge panic"
                        onSubmit={(v) =>
                          cmd({
                            type: "ack-panic",
                            unitId: u.id,
                            reason: v.reason,
                          })
                        }
                      />
                    )}
                  </article>
                );
              })}
            </Panel>
          </div>
          <Panel title="Prioritized incident queue">
            {sorted.map((i) => (
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
                {i.status === "open" && (
                  <Form
                    title={`Assign response ${i.location}`}
                    fields={[
                      {
                        name: "unitId",
                        label: "Available unit",
                        options: r.units
                          .filter((u) => u.onDuty && u.available && !u.panic)
                          .map((u) =>
                            option(u.id, `${u.callsign} · ${u.agency}`),
                          ),
                      },
                    ]}
                    submit="Assign unit"
                    onSubmit={(v) =>
                      cmd({
                        type: "assign-unit",
                        unitId: v.unitId,
                        incidentId: i.id,
                      })
                    }
                  />
                )}
                {assignments
                  .filter((a) => a.incidentId === i.id)
                  .map((a) => {
                    const u = r.units.find((u) => u.id === a.unitId);
                    const next = {
                      assigned: "en route",
                      "en route": "on scene",
                      "on scene": "cleared",
                      cleared: "",
                    }[a.status];
                    return (
                      <section
                        key={a.id}
                        className="p-3 bg-[#f5f4f8] rounded text-[12px] space-y-2"
                      >
                        <b>
                          {u?.callsign} · {a.status}
                        </b>
                        <p className="whitespace-pre-wrap">
                          {a.report || "No response report filed."}
                        </p>
                        {next && next !== "cleared" && (
                          <button
                            disabled={busy}
                            className={button}
                            onClick={() =>
                              act(() =>
                                cmd({
                                  type: "unit-progress",
                                  assignmentId: a.id,
                                  status: next as ResponseStatus,
                                }),
                              )
                            }
                          >
                            Mark {next}
                          </button>
                        )}
                        {["on scene", "cleared"].includes(a.status) && (
                          <Form
                            title={`Response report ${a.id}`}
                            fields={[
                              {
                                name: "report",
                                label: "Unit response report",
                                multiline: true,
                                value: a.report,
                              },
                            ]}
                            submit={
                              a.status === "on scene"
                                ? "File report and clear unit"
                                : "Amend response report"
                            }
                            onSubmit={(v) =>
                              cmd(
                                a.status === "on scene"
                                  ? {
                                      type: "unit-progress",
                                      assignmentId: a.id,
                                      status: "cleared",
                                      report: v.report,
                                    }
                                  : {
                                      type: "unit-report",
                                      assignmentId: a.id,
                                      report: v.report,
                                    },
                              )
                            }
                          />
                        )}
                        <details>
                          <summary>Response history</summary>
                          {a.history.map((h, n) => (
                            <p key={n}>
                              {new Date(h.at).toLocaleTimeString()} · {h.detail}
                            </p>
                          ))}
                        </details>
                      </section>
                    );
                  })}
                {i.caseId ? (
                  <button
                    className={button}
                    onClick={() => onOpenCase(i.caseId!)}
                  >
                    Open response investigation
                  </button>
                ) : (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        const id = await cmd({
                          type: "investigate",
                          incidentId: i.id,
                        });
                        setCaseId(id);
                        setNotice(
                          `Investigation ${id} opened with linked response records.`,
                        );
                      })
                    }
                  >
                    Escalate to investigation
                  </button>
                )}
              </article>
            ))}
            {!sorted.length && (
              <p className="text-[12px]">
                Create an incident from Emergency calls or start a scenario.
              </p>
            )}
          </Panel>
        </>
      )}
      {tab === "radio" && (
        <>
          <Panel title="Channel membership">
            <div className="flex gap-2 flex-wrap">
              {r.channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-2 border border-[#cfcddb] rounded space-x-2 text-[12px]"
                >
                  <b>{ch.name}</b>
                  {r.joinedChannels.includes(ch.id) ? (
                    <>
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() =>
                          act(() =>
                            cmd({ type: "radio-switch", channelId: ch.id }),
                          )
                        }
                      >
                        {r.activeChannelId === ch.id
                          ? "Active channel"
                          : "Switch channel"}
                      </button>
                      {r.activeChannelId !== ch.id && (
                        <button
                          className={button}
                          onClick={() =>
                            act(() =>
                              cmd({
                                type: "radio-join",
                                channelId: ch.id,
                                join: false,
                              }),
                            )
                          }
                        >
                          Leave
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className={button}
                      disabled={
                        busy ||
                        (!!ch.commandOnly &&
                          authority.role !== "command_director")
                      }
                      onClick={() =>
                        act(() =>
                          cmd({
                            type: "radio-join",
                            channelId: ch.id,
                            join: true,
                          }),
                        )
                      }
                    >
                      Join {ch.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
          <Form
            title="Operator callsign"
            fields={[
              { name: "callsign", label: "Radio callsign", value: r.callsign },
            ]}
            submit="Save callsign"
            onSubmit={(v) =>
              cmd({ type: "radio-callsign", callsign: v.callsign })
            }
          />
          <Panel
            title={`Radio · ${r.channels.find((c) => c.id === r.activeChannelId)?.name}`}
          >
            <div
              role="log"
              aria-label="Radio transmission history"
              className="max-h-80 overflow-auto space-y-2 text-[12px]"
            >
              {traffic
                .filter((t) => t.channelId === r.activeChannelId || t.emergency)
                .map((t) => (
                  <p
                    key={t.id}
                    className={t.emergency ? "text-red-800 font-semibold" : ""}
                  >
                    <b>{t.sender}</b> · {new Date(t.at).toLocaleTimeString()} ·{" "}
                    {t.emergency ? "EMERGENCY · " : ""}
                    {t.text}
                    {t.incidentId && (
                      <span className="block text-[10px]">
                        {incidents.find((i) => i.id === t.incidentId)?.location}
                      </span>
                    )}
                  </p>
                ))}
            </div>
            <form
              aria-label="Radio transmission"
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                act(async () => {
                  await cmd({
                    type: "radio-send",
                    channelId: r.activeChannelId,
                    text: radioText,
                    incidentId: radioIncident || undefined,
                    emergency,
                  });
                  setRadioText("");
                });
              }}
            >
              <label className="block text-[11px]">
                Linked incident
                <select
                  aria-label="Radio incident"
                  className={control}
                  value={radioIncident}
                  onChange={(e) => setRadioIncident(e.target.value)}
                >
                  <option value="">General traffic</option>
                  {incidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.location} · {i.priority}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                className={control}
                aria-label="Radio message"
                value={radioText}
                onChange={(e) => setRadioText(e.target.value)}
                required
              />
              <div className="flex gap-4 flex-wrap text-[12px]">
                <label>
                  <input
                    type="checkbox"
                    checked={emergency}
                    onChange={(e) => setEmergency(e.target.checked)}
                  />{" "}
                  Emergency traffic
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={spoken}
                    onChange={(e) => {
                      setSpoken(e.target.checked);
                      if (!e.target.checked) window.speechSynthesis?.cancel();
                    }}
                  />{" "}
                  Spoken NPC radio replies
                </label>
              </div>
              <RadioMicrophone disabled={busy} onText={setRadioText} />
              <button className={button} disabled={busy}>
                Transmit radio message
              </button>
            </form>
          </Panel>
        </>
      )}
      {tab === "conversations" && (
        <>
          <Panel title="Case-aware character conversations">
            <p className="text-[12px]">
              Conversations use this character's knowledge and prior statements.
              Choose any acquired case records you want to present. Replies are
              saved as interviews.
            </p>
            <label className="block text-[11px]">
              Conversation case
              <select
                aria-label="Conversation case"
                className={control}
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
              >
                <option value="">Choose case</option>
                {caseOptions.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            {c && (
              <label className="block text-[11px]">
                Character
                <select
                  aria-label="Conversation character"
                  className={control}
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                >
                  <option value="">Choose character</option>
                  {c.people.map((p) => (
                    <option key={p.personId} value={p.personId}>
                      {p.name} · {p.role}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-[12px]">
              <input
                type="checkbox"
                checked={connected}
                onChange={(e) => setConnected(e.target.checked)}
              />{" "}
              Use connected AI when available
            </label>
          </Panel>
          {c && personId && (
            <>
              <Panel title="Present acquired records">
                {[
                  ...c.evidence.map((e) => option(e.id, e.title)),
                  ...c.documents.map((d) => option(d.id, d.title)),
                  ...(c.findings || []).map((f) => option(f.id, f.statement)),
                ].map((v) => (
                  <label key={v.value} className="flex gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={presented.includes(v.value)}
                      onChange={(e) =>
                        setPresented((old) =>
                          e.target.checked
                            ? [...old, v.value]
                            : old.filter((id) => id !== v.value),
                        )
                      }
                    />
                    {v.label}
                  </label>
                ))}
              </Panel>
              <Panel title="Saved conversation">
                <div
                  role="log"
                  aria-label="Character conversation"
                  className="space-y-3 text-[12px] max-h-96 overflow-auto"
                >
                  {conversation?.turns.map((t) => (
                    <article key={t.id}>
                      <b>Investigator</b>
                      <p>{t.question}</p>
                      <b>
                        {c.people.find((p) => p.personId === personId)?.name}
                      </b>
                      <p>{t.reply}</p>
                      <p className="text-[10px] text-[#67617b]">
                        {t.source} · {new Date(t.at).toLocaleString()}
                      </p>
                    </article>
                  )) || <p>No conversation yet.</p>}
                </div>
              </Panel>
              <Form
                key={`${caseId}-${personId}`}
                title="Ask case character"
                fields={[
                  {
                    name: "question",
                    label: "Question for character",
                    multiline: true,
                  },
                ]}
                submit="Ask character"
                onSubmit={(v) =>
                  askCaseCharacter(
                    caseId,
                    personId,
                    v.question,
                    presented,
                    authority,
                    connected,
                  )
                }
              />
              {authority.role === "command_director" && (
                <details className="text-[12px]">
                  <summary>
                    Scenario authoring · configure character knowledge
                  </summary>
                  <p>
                    Only the facts entered here are known to this character.
                    This does not create investigator findings.
                  </p>
                  <Form
                    key={`knowledge-${caseId}-${personId}`}
                    title="Author character knowledge"
                    fields={[
                      {
                        name: "demeanor",
                        label: "Character demeanor",
                        value:
                          r.knowledge.find(
                            (k) =>
                              k.caseId === caseId && k.personId === personId,
                          )?.demeanor || "Neutral",
                      },
                      {
                        name: "facts",
                        label: "Known facts (one per line)",
                        multiline: true,
                        value: r.knowledge
                          .find(
                            (k) =>
                              k.caseId === caseId && k.personId === personId,
                          )
                          ?.facts.map((f) => f.text)
                          .join("\n"),
                      },
                    ]}
                    submit="Save character knowledge"
                    onSubmit={(v) =>
                      cmd({
                        type: "character-knowledge",
                        caseId,
                        personId,
                        demeanor: v.demeanor,
                        facts: v.facts.split("\n"),
                      })
                    }
                  />
                </details>
              )}
            </>
          )}
        </>
      )}
      {tab === "scenarios" && (
        <>
          <Form
            title="Generate connected scenario"
            fields={[
              {
                name: "template",
                label: "Scenario type",
                options: [
                  option("delivery", "Missing delivery"),
                  option("collision", "Roadside collision"),
                ],
              },
              { name: "location", label: "Scenario location" },
            ]}
            submit="Generate scenario call"
            onSubmit={async (v) => {
              await cmd({
                type: "scenario-start",
                template: v.template as "delivery" | "collision",
                location: v.location,
              });
              onCallQueued();
            }}
          />
          <Panel title="Scenario investigations">
            {r.scenarios
              .filter((s) => !s.caseId || allowedCases.has(s.caseId))
              .map((s) => {
                const i = incidents.find(
                  (i) => i.caseId === s.caseId && i.callIds.includes(s.callId),
                );
                const attended =
                  i &&
                  assignments.some(
                    (a) =>
                      a.incidentId === i.id &&
                      ["on scene", "cleared"].includes(a.status),
                  );
                return (
                  <article
                    key={s.id}
                    className="border-t border-[#cfcddb] pt-3 space-y-3 text-[12px]"
                  >
                    <b>{s.title}</b>
                    <p>
                      {s.caseId ||
                        "Awaiting emergency intake and investigation referral"}
                    </p>
                    {attended ? (
                      s.leads.map((lead) => (
                        <button
                          key={lead.id}
                          className={button}
                          disabled={busy || lead.discovered}
                          onClick={() =>
                            act(() =>
                              cmd({
                                type: "scenario-discover",
                                scenarioId: s.id,
                                leadId: lead.id,
                              }),
                            )
                          }
                        >
                          {lead.discovered
                            ? `Collected: ${lead.title}`
                            : "Search scene records"}
                        </button>
                      ))
                    ) : (
                      <p>
                        Scene records become available after a unit reaches the
                        scene.
                      </p>
                    )}
                    {authority.role === "command_director" && (
                      <details>
                        <summary>Author notes · hidden scenario facts</summary>
                        {s.hiddenFacts.map((text, n) => (
                          <p key={n}>{text}</p>
                        ))}
                      </details>
                    )}
                  </article>
                );
              })}
          </Panel>
        </>
      )}
    </div>
  );
}
