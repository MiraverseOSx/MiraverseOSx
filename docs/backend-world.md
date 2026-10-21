# Connected local world

The local .NET backend now persists the game to SQLite. This is a single-player local world, not a hosted account service or multiplayer server. Existing gameplay validation remains in the shared game engine; this change makes its state durable across the connected apps.

## What is connected

One transaction saves character/career progress, reward receipts, assignment files, housing, browser history/bookmarks/generated content/site records, AureMail messages/contacts/settings/attachments, phone preferences, canonical identities and MAID counters, DGAOS workstation state, and TRACE's active case. Only an explicit list of game storage keys is included. Credentials and unrelated browser storage are excluded.

Accepting a WorkNet order saves its briefing/checklist and issues one confirmation in AureMail. Completing verified work saves a receipt, updates existing career/compensation records, and issues a non-reward completion message. Receipt IDs are tied to work-order IDs; resuming, reloading, and viewing those messages do not issue duplicate rewards. Older active orders receive their missing confirmation when dispatches refresh.

## Saving and restoration

The frontend contacts `/api/world` before application stores initialize. An empty database imports existing device progress. A fresh browser restores the database snapshot. Offline changes remain in localStorage and retry when the local backend is available. **System Settings → Save & sync** shows save status, the last database save, a **Save now** action, and recovery controls when copies conflict.

Each SQLite commit has a revision. A stale PUT returns HTTP 409 instead of overwriting another save. If both the database and browser have changed, saving pauses and the player chooses which copy to continue with. Displaced records are backed up under `miraverse-world-backup-*` on the device. SQLite retains the most recent 20 successful world revisions. Loading the database copy refreshes the apps so mounted stores cannot retain a stale world.

The identity mirror is restored before registry apps initialize; an older IndexedDB copy cannot override the restored canonical records. Window positions and temporary UI selections retain their existing persistence rules.

Database location on Windows: `%LOCALAPPDATA%\MiraverseOSx\world-saves.db`. Existing `miraverse.db` authored document data is left in place.

## Running

- `npm run dev` starts the loopback backend on port 5000 and the Vite frontend. `npm run dev:backend` runs just the API. Vite proxies `/api` to `http://localhost:5000`.
- `npm run build` builds the frontend and desktop backend. `npm run desktop` starts the native desktop host.
- `dotnet run --project MiraverseOSx.csproj -- --server-only --port 5000` runs the API without opening a native window. `--data-dir <directory>` selects a separate save database, useful for tests.

The API accepts only local requests, JSON writes, known game record keys, and bounded payloads. Unrelated web origins cannot write the world. Unknown API paths return JSON 404 responses; static requests cannot escape `wwwroot`. Offline service workers continue to exclude `/api` responses.

## Verification

Run `npm test --prefix frontend`, `npm run build --prefix frontend`, and `dotnet build -c Release`. After the Release build, run `npm run test:backend` for real SQLite/API checks, including stale revisions, rejected writes, origin checks, atomic snapshots and process-restart persistence. The frontend suite also covers import/restore, offline retries, explicit conflict choices, updates during an upload, and the WorkNet → mail → files → career flow.
