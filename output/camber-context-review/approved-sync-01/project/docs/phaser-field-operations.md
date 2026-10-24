# Phaser Field Operations — Tunnel 09

Implemented October 23, 2026.

Open **Orbit → FIELD → Open app**, or the playable investigation button on WORKNET assignment `ms-spec-01` (High-Priority Breach: Sub-Aureline Data Bleed Containment).

Accept the assignment and acknowledge its briefing. Click the floor to walk, or focus the scene and use WASD / arrow keys. The location buttons also walk the character to a target and inspect it. Gather the relay, terminal, and conduit findings; ask technician Iona what preceded the failure; then approach the containment console.

Record the field findings to create the existing `inspect` and `contain` stage receipts. Write and submit a report explaining the source, carrier, tunnel, and seal, then finalize the operation. WORKNET's existing validators, clearance checks, stamina requirements, and one-time reward receipts remain responsible for acceptance and compensation. The existing form workflow stays available for older saves and other assignments.

The Phaser renderer loads only when an active, briefed operation opens. React owns the briefing, notebook, interview, report, and window controls. Position and findings live in `worknetOrders['ms-spec-01'].fieldSession` alongside the work order, using the existing persisted world snapshot. Report drafts use the existing stage draft system. Findings are deduplicated, restored positions are bounded, and unknown evidence is discarded. No external assets, services, or Python process are required.

The scene pauses when its Miraverse window loses focus, is minimized, the browser is hidden, an interview opens, or the player chooses Pause. Closing releases the renderer; reopening restores the field session. Keyboard movement is scoped to the focused scene so report input does not move the character.

This is a first playable 2D scene drawn with Phaser primitives. It includes direct movement and interaction rather than combat, pathfinding, or a full explorable city. The Phaser engine is a separate lazy-loaded bundle; Vite reports its size alongside the existing DGAOS bundle advisory.

Validation: frontend tests cover malformed/older saves, proximity and briefing checks, incomplete containment, reload recovery, stage receipts, invalid reports, and duplicate reward prevention. Live localhost verification covers scene rendering, point-and-click travel, evidence, and interview controls.
