import { getDGAState, runOperationsCommand } from "./dga-store";
import type { DGAAuthorityContext } from "./dga-permissions";
import { hasRequiredClearance } from "./dga-permissions";
import {
  dialogueContext,
  localFactSelection,
  type KnowledgeFact,
} from "./response-operations";

/** Cloud AI chooses known facts; canonical text is rendered locally so it cannot invent evidence. */
export async function selectKnownFacts(
  scope: string,
  name: string,
  facts: KnowledgeFact[],
  question: string,
  memory: unknown,
  connected = true,
): Promise<{ factIds: string[]; source: string }> {
  const fallback = {
    factIds: localFactSelection(facts, question),
    source: "Local record engine",
  };
  if (
    /again|repeat|earlier|remember|previous/i.test(question) &&
    Array.isArray(memory)
  ) {
    const previous = [...memory]
      .reverse()
      .find((t) => Array.isArray(t.factIds) || t.speaker === "Caller");
    if (previous)
      fallback.factIds = Array.isArray(previous.factIds)
        ? previous.factIds
            .filter((id: string) => facts.some((f) => f.id === id))
            .slice(0, 3)
        : facts.filter((f) => f.text === previous.text).map((f) => f.id);
  }
  if (!connected || !facts.length) return fallback;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        npc: name,
        prompt: question,
        activeApp: "dga-operations",
        contextScope: scope,
        context: JSON.stringify({ facts, memory }),
        maxTokens: 180,
      }),
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    if (!["openai", "google-gemini"].includes(data.provider)) return fallback;
    const decoded = JSON.parse(
      String(data.text || "").replace(/^```(?:json)?\s*|\s*```$/g, ""),
    );
    if (
      !Array.isArray(decoded.factIds) ||
      decoded.factIds.length > 3 ||
      decoded.factIds.some(
        (id: unknown) =>
          typeof id !== "string" || !facts.some((f) => f.id === id),
      )
    )
      return fallback;
    return {
      factIds: [...new Set(decoded.factIds)] as string[],
      source: `${data.provider} · grounded in character records`,
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}
export async function askCaseCharacter(
  caseId: string,
  personId: string,
  question: string,
  presentedRecordIds: string[],
  authority: DGAAuthorityContext,
  connected = true,
): Promise<string> {
  if (!authority.allowedWorkspaces.includes("operations"))
    throw new Error("Agency credentials are required.");
  const docket = getDGAState().cases.find((c) => c.id === caseId);
  if (
    !docket ||
    !hasRequiredClearance(
      { clearanceLevel: authority.clearanceLevel },
      docket.classification,
    )
  )
    throw new Error(
      "Your clearance does not permit access to this conversation.",
    );
  const context = dialogueContext(
    getDGAState(),
    caseId,
    personId,
    presentedRecordIds,
  );
  const result = await selectKnownFacts(
    `${caseId}:${personId}`,
    context.name,
    context.facts,
    question,
    context.memory,
    connected,
  );
  return runOperationsCommand(
    {
      type: "character-turn",
      caseId,
      personId,
      question,
      presentedRecordIds,
      factIds: result.factIds,
      source: result.source,
      contextSignature: context.signature,
    },
    authority,
  );
}
export async function askEmergencyCaller(
  callId: string,
  question: string,
  authority: DGAAuthorityContext,
  connected = true,
): Promise<string> {
  if (!authority.allowedWorkspaces.includes("operations"))
    throw new Error("Agency credentials are required.");
  const call = getDGAState().operations?.calls.find((c) => c.id === callId);
  if (!call || call.status !== "connected")
    throw new Error("Connect the call first.");
  const incident = getDGAState().operations?.incidents.find(
    (i) => i.id === call.incidentId,
  );
  const docket = getDGAState().cases.find((c) => c.id === incident?.caseId);
  if (
    docket &&
    !hasRequiredClearance(
      { clearanceLevel: authority.clearanceLevel },
      docket.classification,
    )
  )
    throw new Error("Your clearance does not permit access to this call.");
  const facts = callerFacts(call);
  const result = await selectKnownFacts(
    `call:${callId}`,
    call.caller,
    facts,
    question,
    call.transcript.slice(-12),
    connected,
  );
  return runOperationsCommand(
    {
      type: "call-message",
      id: callId,
      text: question,
      selectedFacts: result.factIds,
      contextSignature: JSON.stringify(call),
      source: result.source,
    },
    authority,
  );
}
export function callerFacts(call: {
  caller: string;
  number: string;
  description: string;
  location: string;
  priority: string;
}): KnowledgeFact[] {
  return [
    { id: "location", text: `The location is ${call.location}.` },
    { id: "name", text: `You can call me ${call.caller}.` },
    {
      id: "number",
      text: call.number
        ? `My callback number is ${call.number}.`
        : "I cannot provide a callback number.",
    },
    { id: "description", text: call.description },
    { id: "priority", text: `The reported priority is ${call.priority}.` },
  ];
}
