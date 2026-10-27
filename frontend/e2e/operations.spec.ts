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

test("NPC call becomes a case with persistent linked interviews and distinct court stages", async ({
  page,
}) => {
  const ui = await openOperations(page);
  const click = (name: string) =>
    ui.getByRole("button", { name, exact: true }).click();
  await click("Emergency calls");
  await click("Receive sample NPC call");
  await click("Answer call");
  await ui
    .getByRole("textbox", { name: "Message to caller", exact: true })
    .fill("What is the location?");
  await click("Send message");
  await expect(ui.getByRole("log")).toContainText(
    "The location is 66 Pickman Street.",
  );
  await click("Hold call");
  await click("Resume call");
  await click("Create dispatch incident");
  await click("Disconnect call");
  await click("Call back");
  await expect(ui.getByRole("log")).toContainText(
    "Callback connected to 555-0142.",
  );
  await click("Disconnect call");
  await click("Create investigation from incident");
  await expect(
    ui.getByRole("heading", {
      name: "Emergency incident at 66 Pickman Street",
      exact: true,
    }),
  ).toBeVisible();
  await click("Records & legal");
  const citizen = ui.getByRole("form", {
    name: "Create investigation profile",
    exact: true,
  });
  await citizen.getByLabel("Full name", { exact: true }).fill("Dena Banks");
  await click("Create profile");
  await expect(
    ui.getByRole("form", { name: "Edit citizen details", exact: true }),
  ).toBeVisible();
  await click("Connected cases");
  const link = ui.getByRole("form", {
    name: "Link citizen to case",
    exact: true,
  });
  const personId = await link
    .locator("option")
    .filter({ hasText: "Dena Banks" })
    .getAttribute("value");
  await link.getByLabel("Citizen", { exact: true }).selectOption(personId!);
  await link.getByLabel("Case role", { exact: true }).selectOption("Witness");
  await click("Link citizen");
  const interview = ui.getByRole("form", {
    name: "Record interview",
    exact: true,
  });
  await interview
    .getByLabel("Case subject", { exact: true })
    .selectOption(personId!);
  await interview
    .getByLabel("Interview transcript", { exact: true })
    .fill("I found the door open and called for help.");
  await click("Save interview");
  await ui
    .getByRole("checkbox", { name: "Interview · Dena Banks", exact: true })
    .check();
  await ui
    .getByRole("form", { name: "Record supported finding", exact: true })
    .getByLabel("Observation", { exact: true })
    .fill("Dena reports finding the door open.");
  await click("Save finding");
  await click("Records & legal");
  const warrant = ui.getByRole("form", {
    name: "Request warrant",
    exact: true,
  });
  await warrant
    .getByLabel("Case subject", { exact: true })
    .selectOption(personId!);
  await warrant
    .getByLabel("Warrant scope", { exact: true })
    .fill("Fictional records review");
  await warrant
    .getByLabel("Grounds and supporting record references", { exact: true })
    .fill("Recorded interview");
  await click("Submit warrant");
  for (const status of ["approved", "served"]) {
    const stage = ui.getByRole("form", { name: /^Warrant WARRANT-/ });
    await stage
      .getByLabel("Warrant decision", { exact: true })
      .selectOption(status);
    await stage
      .getByLabel("Decision authority or service details", { exact: true })
      .fill(`Fictional ${status} details`);
    await click("Record warrant stage");
    await expect(
      ui.getByText(`Dena Banks · ${status}`, { exact: true }),
    ).toBeVisible();
  }
  const charge = ui.getByRole("form", {
    name: "File fictional charge",
    exact: true,
  });
  await charge
    .getByLabel("Case subject", { exact: true })
    .selectOption(personId!);
  await charge
    .getByLabel("Fictional penal code", { exact: true })
    .selectOption("MER-202");
  await charge
    .getByLabel("Charge basis and record references", { exact: true })
    .fill("Test-only fictional allegation");
  await click("File charge");
  for (const status of ["hearing", "convicted", "sentenced"]) {
    const court = ui.getByRole("form", { name: /^Court stage CHARGE-/ });
    await court
      .getByLabel("Next legal stage", { exact: true })
      .selectOption(status);
    await court.getByRole("textbox").fill(`Fictional ${status} recorded`);
    await click("Record court stage");
    await expect(
      ui.getByText(`Dena Banks · ${status}`, { exact: true }),
    ).toBeVisible();
  }
  await ui
    .getByRole("form", { name: /^Inmate admission CHARGE-/ })
    .getByLabel("Custody facility", { exact: true })
    .fill("Meridion Center");
  await click("Create inmate record");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("DGAOS_WORKSTATION_STATE_V3")!),
  );
  expect(saved.operations.calls).toHaveLength(2);
  expect(saved.operations.incidents).toHaveLength(1);
  expect(saved.operations.interviews).toHaveLength(1);
  expect(saved.operations.warrants[0].status).toBe("served");
  expect(saved.operations.proceedings[0].status).toBe("sentenced");
  expect(saved.operations.inmates[0].facility).toBe("Meridion Center");
  const c = saved.cases.find(
    (c) => c.id === saved.operations.incidents[0].caseId,
  );
  expect(c.status).toBe("Active");
  expect(c.documents[0].content).toContain("Callback connected");
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("DGAOS_WORKSTATION_STATE_V3")!)
          .operations,
    ),
  ).toEqual(saved.operations);
});

test("TRACE returns a finalized report only to the originating request and preserves exhibit IDs", async ({
  page,
}) => {
  const ui = await openOperations(page);
  const setup = await page.evaluate(async () => {
    const s = await import("/src/dgaos/lib/dga-store.ts");
    const a = await s.createManualIncidentCase({
      narrative: "Parcel document inquiry",
      title: "Parcel inquiry",
    });
    const b = await s.createManualIncidentCase({
      narrative: "Unrelated case",
      title: "Other inquiry",
    });
    const ev = await s.addDGACaseEvidence(a.id, {
      title: "Parcel label",
      category: "Document",
      description: "Handwritten label",
      locationFound: "Station",
      dateRecovered: new Date().toISOString(),
      custodyStatus: "In DGA Custody",
    });
    return { caseId: a.id, otherId: b.id, evidenceId: ev!.id };
  });
  await ui
    .getByRole("combobox", { name: "Operations case", exact: true })
    .selectOption(setup.caseId);
  await ui
    .getByRole("checkbox", { name: "Evidence · Parcel label", exact: true })
    .check();
  const request = ui.getByRole("form", {
    name: "Send examination to TRACE",
    exact: true,
  });
  await request
    .getByLabel("Examination module", { exact: true })
    .selectOption("documents");
  await request
    .getByLabel("Investigative question", { exact: true })
    .fill("Compare label handwriting with the submitted sample.");
  await request
    .getByRole("button", { name: "Submit to TRACE", exact: true })
    .click();
  await expect(request.getByRole("status")).toHaveText("Saved.");
  const result = await page.evaluate(async ({ caseId, otherId }) => {
    const s = await import("/src/dgaos/lib/dga-store.ts");
    const { traceDurableStore: lab } = await import(
      "/src/dgaos/services/traceDurableStore.ts"
    );
    const c = s.getDGAState().cases.find((c) => c.id === caseId)!;
    const r = c.forensicRequests[0];
    const report = await lab.finalizeExamination(
      r.traceExamIds![0],
      "Examiner",
      "The available sample is insufficient for attribution.",
      "No authorship conclusion.",
    );
    let rejected = false;
    try {
      await lab.transmitFindings(report.id, "Commander", otherId);
    } catch {
      rejected = true;
    }
    const released = await lab.transmitFindings(report.id, "Commander");
    const live = s.getDGAState().cases.find((c) => c.id === caseId)!;
    return {
      rejected,
      success: released.success,
      receipt: released.transmission.dgaCaseId,
      summary: live.forensicRequests[0].resultSummary,
      evidenceId: live.evidence[0].linkedTraceEvidenceId,
      realEvidenceId: lab.getRecord(r.traceExamIds![0])!.data.evidenceId,
      otherDocuments: s.getDGAState().cases.find((c) => c.id === otherId)!
        .documents.length,
    };
  }, setup);
  expect(result.rejected).toBe(true);
  expect(result.success).toBe(true);
  expect(result.receipt).toBe(setup.caseId);
  expect(result.summary).toContain("No authorship conclusion.");
  expect(result.evidenceId).toBe(result.realEvidenceId);
  expect(result.otherDocuments).toBe(0);
  await expect(
    ui.getByText(
      /Report: RP-.*The available sample is insufficient for attribution./,
      { exact: false },
    ),
  ).toBeVisible();
});
