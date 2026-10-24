# MAI Context Mirror pre-upload review

NOT UPLOADED. No game code changed.
Verified target: Miraverse Artificial Intelligence, @mirxclej.mai, version 3.
Agent ID: ff089884-2462-4fab-9430-1859e784a313.

## Setup update after Ubuntu installation

Camber CLI 1.0.42 is installed in Ubuntu WSL 2 under cyberbrat and authenticated
as mirxclej. The CLI independently confirmed @mirxclej.mai. A new isolated pull at
backups/pre-sync-20261024-01/project_mirxclej_mai preserved the agent instructions
and four registered skill scripts. Camber reported no existing Context Mirror.
The indexed Game Doc.docx was NOT downloaded by this pull and is not backed up here.
The earlier CLI/WSL setup blockers below are resolved. MCP OAuth remains unresolved,
but the authenticated CLI can perform Context Mirror operations independently.
No upload or remote agent change was performed. File-list approval remains pending.

## Exact scope
files.csv lists 562 source/config/test/document files (7,678,656 bytes) with source
paths, project destinations and SHA-256 hashes. exclusions.csv lists exact excluded
paths or pruned subtrees and reasons. upload-manifest.csv lists every proposed
mirror/skill/knowledge file. inspection.json contains imports and local test results.
sync.yaml.proposed is a review specimen, NOT an upload-ready config.

Project includes relevant frontend source, tests, Storybook configuration, backend
C# source, developer scripts, manifests/lockfiles, implementation guides, SQL schema,
and selected textual public assets. Most binary media is omitted: this is code
context, not a complete runnable game distribution.

Excluded: .env* including examples, .git, keys/credentials, databases and saves,
dependency folders, generated builds/wwwroot, caches, logs, output, vendored
Bootstrap, prototypes and the unrelated terminal orchestrator. Worldbuilding
binaries are withheld except the separately selected current bible. Signature
scanning found no common embedded token prefixes or private keys in selected
source. This narrow check is not a comprehensive secret audit.

## Remote state inspected through the authenticated browser
- Existing 2,625-character MAI instructions: inspected, not changed or backed up yet.
- Knowledge: Game Doc.docx is Indexed. Its content/hash has not been exported, so
  equivalence to the local updated bible is unverified.
- Skills: mai-validation, test-skills, validate-missions, audit-rewards.
- Project Directory: No project context.
- A previous notebook shows import failures and missing input errors, followed by
  successful mission/reward runs after adding PYTHONPATH and supplying examples.
  This is historical output, not a new remote execution verification.

## Proposed changes for approval
1. Preserve MAI's owner, alias, name, instructions and existing Knowledge Base.
2. Populate Project Directory from the exact source allowlist.
3. Replace validate-missions and audit-rewards with self-contained packages; add
   validate-npcs. Each has its own helper and examples plus --example support.
4. Leave mai-validation and test-skills untouched, outside the managed list.
5. Do not sync chat history, local assistant settings or player saves. Do not
   create another agent or publicly publish the agent.
6. Keep canon and implementation references separate. Before any actual push,
   pull and back up remote state and compare it with this proposal.

## Knowledge Base indexing
knowledge-proposal/canon contains the updated October 24 bible. Compare it with
Game Doc.docx first: retain the existing resource if identical; review differences
before adding/replacing if different. Never silently remove the existing resource.
knowledge-proposal/implementation contains 13 selected implementation/reference
guides. Index them as implementation evidence, not canon. Historical proposals
remain available in project/docs but are not proposed as current indexed authority.
Mirroring source does not automatically index it. The initial sync specimen keeps
knowledge_base disabled to preserve existing resources. Append approved resources
through the Knowledge Base flow or merge with a verified pulled inventory before
enabling knowledge sync. Confirm each addition reaches Indexed.

## Local skill verification
The original ZIP was inspected for safe paths, imports, descriptions and examples.
It uses standard-library modules plus its bundled mai_validation module.
Original 8-test suite: PASS. Each proposed isolated package: 8 tests PASS,
--example invocation without PYTHONPATH PASS, invalid input returns exit 1 PASS.
These validate explicit JSON interchange schemas, not arbitrary native game saves.
Structural passes do not establish canon, prose quality, eligibility or gameplay.
No third-party Python dependencies are required.

## Setup blockers
No Camber MCP tools are exposed in this chat; plugin search found no listing.
The supplied endpoint was added to local Codex config, but OAuth failed:
- Dynamic client registration is not supported by Camber.
- Explicit CIMD attempt failed because required server support is not advertised.
Configuration is NOT a successful connection. Camber's current setup page provides
registered clients for several apps, but no Codex-specific client ID. Obtain a
Codex-compatible client registration/callback from Camber, or use a documented
supported client. Do not borrow a different app's client ID or paste tokens here.

CLI: absent on PATH and standard Camber paths. Official installer source explicitly
supports Darwin and Linux, not native Windows. Git Bash exists but is not Linux;
WSL is not installed. A Windows local-mirror route therefore needs a separate WSL
setup (administrator permission/restart may be required), or another supported
Linux/macOS machine. No OS installation has been performed.

## Supported CLI route after system setup
In Ubuntu/WSL, follow the official installation and login documentation:

    curl -sL https://cli.cambercloud.com/install-v2.sh | bash
    export PATH="$HOME/.camber/bin:$PATH"
    camber version
    camber login
    camber me

Complete sign-in yourself. Then inspect `camber agent --help`, verify the existing
@mirxclej.mai identity and pull into a NEW isolated destination:

    camber agent pull @mirxclej.mai --dest <new-isolated-directory>

Pull replaces its generated project_owner_alias directory: never use the live game
as that destination. Back up the pull. Preserve unknown remote files and disabled
sections, then merge approved staged files and selected skills. Adapt the generated
sync.yaml rather than blindly replacing it with the specimen.

`camber agent push` has no dry-run or confirmation prompt. Enabled sections become
the desired cloud state and a successful push commits a new stable agent version.
Review final hashes/differences first. Existing unrelated skills must stay unmanaged.

## Required post-sync verification
Pull to another fresh destination and compare file hashes. Inspect Project Directory
for expected paths and exclusions. Compare instructions with the remote backup.
Confirm all previous knowledge remains and approved additions are Indexed. Confirm
skill registration and packaged helpers/examples. Execute each actual --example
command and deliberate invalid input in Camber, recording stdout/stderr/exit codes.
Report indexing, compilation, upload or execution failures separately. None of these
post-sync checks has been completed because no upload occurred.

## Sources
https://docs.cambercloud.com/docs/camber-mcp/
https://docs.cambercloud.com/docs/camber-mcp/context-mirror/
https://docs.cambercloud.com/docs/camber-cli/agent/
https://docs.cambercloud.com/docs/camber-cli/installation/
https://docs.cambercloud.com/docs/camber-cli/login/
https://learn.chatgpt.com/docs/extend/mcp
