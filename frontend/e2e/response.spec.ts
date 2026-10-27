import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Isolated test"}',
    }),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
});
async function openOperations(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Sign In / Login Boot", exact: true })
    .click();
  await page.getByPlaceholder("e.g. CY-9021-PLAYER or admin").fill("admin");
  await page
    .getByRole("button", { name: "START LOGIN BOOT", exact: true })
    .click();
  await page.getByRole("button", { name: "Open Orbit", exact: true }).click();
  await page.getByRole("button", { name: "Select DGAOS", exact: true }).click();
  await page.locator(".drawer-launch").click();
  await page
    .getByRole("button", { name: "UNLOCK DGA COMMAND SHELL", exact: true })
    .click();
  const dga = page.locator(".os-window[data-app=dgaos]");
  await dga.getByRole("button", { name: "Maximize", exact: true }).click();
  await dga.locator('button[title="Operations workspace"]').click();
  return dga.getByTestId("operations-workspace");
}

test("complete scenario response, radio, grounded interview, TRACE, acquittal and backup recovery", async ({
  page,
}) => {
  test.setTimeout(120000);
  const ui = await openOperations(page);
  const click = (name: string) =>
    ui.getByRole("button", { name, exact: true }).click();
  await click("Dispatch & radio");
  await click("Scenario workshop");
  const scenario = ui.getByRole("form", {
    name: "Generate connected scenario",
    exact: true,
  });
  await scenario
    .getByLabel("Scenario type", { exact: true })
    .selectOption("delivery");
  await scenario
    .getByLabel("Scenario location", { exact: true })
    .fill("Central depot");
  await click("Generate scenario call");
  await click("Answer call");
  await click("Create dispatch incident");
  await click("Dispatch & radio");
  const roster = ui.getByRole("form", {
    name: "Register response unit",
    exact: true,
  });
  await roster.getByLabel("Unit callsign", { exact: true }).fill("PATROL-1");
  await roster
    .getByLabel("Response agency", { exact: true })
    .selectOption("Police");
  await click("Register unit");
  await click("Put unit on duty");
  const assign = ui.getByRole("form", {
    name: "Assign response Central depot",
    exact: true,
  });
  await assign
    .getByLabel("Available unit", { exact: true })
    .selectOption({ label: "PATROL-1 · Police" });
  await click("Assign unit");
  await click("Simulate next response update");
  await expect(
    ui.getByText("PATROL-1 · en route", { exact: true }),
  ).toBeVisible();
  await click("Simulate next response update");
  await expect(
    ui.getByText("PATROL-1 · on scene", { exact: true }),
  ).toBeVisible();
  await click("Radio channels");
  await click("Join Police");
  await click("Switch channel");
  const incidentId = await ui
    .getByLabel("Radio incident", { exact: true })
    .locator("option")
    .filter({ hasText: "Central depot" })
    .getAttribute("value");
  await ui
    .getByLabel("Radio incident", { exact: true })
    .selectOption(incidentId!);
  await ui
    .getByLabel("Radio message", { exact: true })
    .fill("Confirm scene status.");
  await click("Transmit radio message");
  await expect(
    ui.getByRole("log", { name: "Radio transmission history", exact: true }),
  ).toContainText("Acknowledged, Dispatch. Status on scene.");
  await ui.screenshot({ path: "../output/previews/dga-radio-workspace.png" });
  await click("Solo dispatch");
  await click("Activate unit panic");
  const panic = ui.getByRole("form", {
    name: "Panic acknowledgment PATROL-1",
    exact: true,
  });
  await panic
    .getByLabel("Panic acknowledgment details", { exact: true })
    .fill("Unit confirms safe; assistance arrived.");
  await click("Acknowledge panic");
  const report = ui.getByRole("form", {
    name: /^Response report ASSIGN-UNIT-/,
  });
  await report
    .getByLabel("Unit response report", { exact: true })
    .fill(
      "Attended the depot; a counter log is available. No person identified as responsible.",
    );
  await click("File report and clear unit");
  await click("Escalate to investigation");
  await click("Scenario workshop");
  await click("Search scene records");
  await click("Character conversations");
  await ui
    .getByLabel("Conversation character", { exact: true })
    .selectOption({ label: "Robin Vale · Reporting party" });
  await ui
    .getByLabel("Use connected AI when available", { exact: true })
    .uncheck();
  const interview = ui.getByRole("form", {
    name: "Ask case character",
    exact: true,
  });
  await interview
    .getByLabel("Question for character", { exact: true })
    .fill("Tell me about the courier badge.");
  await click("Ask character");
  await expect(
    ui.getByRole("log", { name: "Character conversation", exact: true }),
  ).toContainText("The person with the gray bag wore a courier badge.");
  const setup = await page.evaluate(async () => {
    const s = await import("/src/dgaos/lib/dga-store.ts");
    const state = s.getDGAState();
    const scenario = state.operations!.response!.scenarios.at(-1)!;
    const c = state.cases.find((c) => c.id === scenario.caseId)!;
    const ev = await s.addDGACaseEvidence(c.id, {
      title: "Counter log copy",
      category: "Document",
      description: c.documents.find((d) => d.title === "Counter transfer log")!
        .content!,
      locationFound: "Central depot",
      dateRecovered: new Date().toISOString(),
      custodyStatus: "In DGA Custody",
    });
    return {
      caseId: c.id,
      personId: scenario.actors[0].personId,
      evidenceId: ev!.id,
      hidden: scenario.hiddenFacts[0],
    };
  });
  await click("Connected cases");
  await ui
    .getByLabel("Operations case", { exact: true })
    .selectOption(setup.caseId);
  await ui
    .getByRole("checkbox", { name: "Evidence · Counter log copy", exact: true })
    .check();
  const labForm = ui.getByRole("form", {
    name: "Send examination to TRACE",
    exact: true,
  });
  await labForm
    .getByLabel("Examination module", { exact: true })
    .selectOption("documents");
  await labForm
    .getByLabel("Investigative question", { exact: true })
    .fill("Does this log establish who moved the parcel?");
  await click("Submit to TRACE");
  await expect(labForm.getByRole("status")).toHaveText("Saved.");
  await page.evaluate(async ({ caseId }) => {
    const s = await import("/src/dgaos/lib/dga-store.ts");
    const { traceDurableStore: lab } = await import(
      "/src/dgaos/services/traceDurableStore.ts"
    );
    const r = s.getDGAState().cases.find((c) => c.id === caseId)!
      .forensicRequests[0];
    const report = await lab.finalizeExamination(
      r.traceExamIds![0],
      "Examiner",
      "The unsigned transfer cannot establish authorship.",
      "No comparison specimen was supplied.",
    );
    await lab.transmitFindings(report.id, "Commander");
  }, setup);
  await click("Records & legal");
  const charge = ui.getByRole("form", {
    name: "File fictional charge",
    exact: true,
  });
  await charge
    .getByLabel("Case subject", { exact: true })
    .selectOption(setup.personId);
  await charge
    .getByLabel("Fictional penal code", { exact: true })
    .selectOption("MER-202");
  await charge
    .getByLabel("Charge basis and record references", { exact: true })
    .fill("Fictional allegation referred for court review.");
  await click("File charge");
  for (const status of ["hearing", "acquitted"]) {
    const court = ui.getByRole("form", { name: /^Court stage CHARGE-/ });
    await court
      .getByLabel("Next legal stage", { exact: true })
      .selectOption(status);
    await court
      .getByRole("textbox")
      .fill(
        status === "hearing"
          ? "Fictional court considered the record."
          : "Insufficient evidence to identify the responsible person.",
      );
    await click("Record court stage");
    await expect(
      ui.getByText(`Robin Vale · ${status}`, { exact: true }),
    ).toBeVisible();
  }
  const downloadPromise = page.waitForEvent("download");
  await click("Export investigation");
  const download = await downloadPromise;
  const { readFile } = await import("node:fs/promises");
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.format).toBe("dga-investigation-pack");
  expect(exported.assignments[0].status).toBe("cleared");
  expect(exported.radio.length).toBeGreaterThan(0);
  expect(JSON.stringify(exported)).not.toContain(setup.hidden);
  expect(exported.proceedings[0].status).toBe("acquitted");
  const saved = await page.evaluate(async () => {
    const { createWorldBackup } = await import("/src/backend/worldBackup.ts");
    return createWorldBackup(localStorage);
  });
  await page.evaluate(async (backup) => {
    const { restoreWorldEntries } = await import(
      "/src/backend/worldConnection.ts"
    );
    localStorage.setItem("DGAOS_WORKSTATION_STATE_V3", "{}");
    await restoreWorldEntries(backup.entries);
  }, saved);
  await page.reload();
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("DGAOS_WORKSTATION_STATE_V3")!),
  );
  expect(restored.operations).toEqual(
    JSON.parse(saved.entries.DGAOS_WORKSTATION_STATE_V3).operations,
  );
  expect(
    restored.cases.find((c) => c.id === setup.caseId).forensicRequests[0]
      .resultSummary,
  ).toContain("No comparison specimen");
});
