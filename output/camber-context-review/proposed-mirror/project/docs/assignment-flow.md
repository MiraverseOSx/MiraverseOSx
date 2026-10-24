# Connected assignment flow

Updated by the [gameplay decision register](gameplay-decision-register.md) and its [implementation notes](gameplay-register-implementation.md). Whole work shifts are Missions; their individual stages are assigned Tasks. Mystery invitations now wait for contextual discovery, and Journey rewards are chapter records within an ongoing Journey.

WorkNet and `versenet.aure/jobs` share a directory of tasks, quests, missions, journeys and adventures. VerseNet searches for work, careers and these activity types lead to the same directory.

1. Signing in delivers eligible in-world email invitations. Discovery can reveal a phone dispatch. Delivery IDs and answered-call history are saved; reopening apps does not issue duplicate invitations. Submitting a completed engineering repair releases an accreditation follow-up invitation.
2. An invitation or phone transcript selects its opportunity in WorkNet. The phone's Missions screen also resumes real active assignments and stories.
3. Choosing a story or accepting a work order creates `Briefing.txt` and `Assignment_checklist.txt` under `/assignments/<opportunity-id>` in VAULT. Existing active work resumes without losing evidence. The saved briefing contains the location, equipment, scenario readings, required work and compensation terms.
4. Before submitting work-stage activities, the player reviews the mission briefing. Employment contracts, clearance and stamina requirements remain separate. Existing accepted work retains its completion status.
5. Profession workflows use investigation, evidence comparison, diagnostics, equipment procedures, dialogue, logistics, creative submissions and reports. Drafts and accepted outputs persist. A completed work order still needs submission for acceptance.
6. Acceptance issues the published pay once and saves a completion log with the actual outputs and compensation record. Medical compensation remains shared with Faith Medical. A chosen quest, journey or adventure can additionally unlock a readable permanent record after every required work order is accepted. Special records do not reissue the underlying assignment payouts.

Special records: Glassline signal atlas, Accredited engineer field manual, and Old Factory Ward sealed archive. The opportunity directory shows the collection and opens each activity folder.

Implementation: `AssignmentFlow.ts` defines the catalog, dispatch schedule and briefings. `assignmentActions.ts` manages the persisted journal, dispatches, files and unlocks. `AssignmentBoard.tsx` is shared by WorkNet and VerseNet. Calls are simulated in-world transcripts.

Validation: `npm test --prefix frontend` covers dispatch delivery, call history, briefing review, linked acceptance requirements, save/reload, receipt files and duplicate reward prevention. `npm run build --prefix frontend` generates the production frontend.
