# MIRAVERSEOSX (`mosuniverse.me`)

**MiraverseOSx** is a unified, in-world desktop operating system and investigative simulation environment set in **Meridion / Aureline (Year 1000)**. Built with **React 19**, **TypeScript**, **Vite 6**, **Tailwind CSS 4**, and **Zustand 5**, it integrates civic identity management, federal agency command (`DGAOS`), forensic laboratory analysis (`TRACE`), institutional portals, and personal citizen applications into a single persistent desktop workspace.

---

## 🌟 Core Architecture & Integrated Systems

### 1. Celestial Desktop Environment & Window Manager
- **Unified Window & Workspace Shell**: Draggable, resizable, minimizable, and maximizable application windows (`Window.tsx`), a categorized protocol launcher (`AppLauncherModal.tsx`), live desktop widget rail (`DesktopWidgetRail.tsx`), and the `MAI` Civic Assistant dock (`MAIDock.tsx`).
- **Scoped Visual Systems**: Celestial glassmorphism and paper-ledger aesthetics across MiraverseOSx applications, paired with scoped Lavender-OS tactical styling (`.dgaos-scope`) for embedded DGAOS and TRACE workstations so both design systems coexist without CSS bleed.
- **Master Typography**:
  - *Commissioner* & *Plus Jakarta Sans*: Primary UI, system telemetry, and municipal forms.
  - *Esteban* & *Newsreader*: Authoritative serif for decrees, lore codices, and official certificates.
  - *JetBrains Mono*: Forensic instrumentation, kernel telemetry, and SQL/CLI consoles.

### 2. DGAOS Agency Command Center & TRACE Forensic Workstation
- **Single Authoritative Forensic Engine**: `DGAOS` (`DgaosApp.tsx`) and `TRACE` (`TraceWorkspaceApp.tsx` / `TraceApp.tsx`) share a unified persistent store and IndexedDB/localStorage synchronization layer (`dgaos/lib/store.tsx`) across both navigation entry points (launching `TRACE` directly from the desktop or from inside `DGAOS`).
- **Session & Workspace Restoration**: `TRACE` automatically restores the investigator's active case, forensic laboratory station, selected evidence item, open case tabs, and working checkpoints, with a one-click return to **Laboratory Home**.
- **Automatic Draft Saving & Hybrid Findings Transmission**:
  - Examination notes, forensic worksheets, evidence comparisons, and draft reports autosave continuously.
  - **Progress statuses** (*In Progress*, *Preliminary Notes Logged*, *Ready for Review*) sync automatically to `DGAOS`.
  - **Formal forensic findings** require explicit **Transmit Findings to DGAOS** authorization, generating immutable audit receipts and locking finalized reports against accidental overwrite.

### 3. AURA Citizen Registry, MAID Engine & Document Studio
- **Canonical MAID Identity Engine (`maidIdentityService.ts` & `useRegistryWorkspaceStore.ts`)**:
  - **Add Person**: Procedural character generator and manual identity creator supporting Meridion species/ancestry constraints, biometrics, family/household relationship graphs, and permanent **MAID** (`Meridion Aureline Identification`) assignment.
  - **Portrait Studio (`PortraitStudioModal.tsx`)**: Layered SVG/Canvas biometric portrait composer with species-accurate features, attire, expressions, and cryptographic portrait hashes synced across all citizen records.
  - **Look Up MAID (`RegistryWorkspaceApp.tsx`)**: Searchable population database with full citizen dossiers, medical baselines, academic records, and investigative flags.
- **Official Document Studio (`DocumentStudioApp.tsx`)**:
  - Renders and exports 8 canonical Meridion documents bound to live MAID records:
    1. **Citizen Identity Card**
    2. **Meridion Sovereign Passport**
    3. **Certificate of Birth & Lineage**
    4. **Faith Medical Clinical Record**
    5. **DGA Investigative Identity Dossier**
    6. **Cyacademy Academic Transcript**
    7. **Housing Suite Allocation Deed**
    8. **Federal Worknet Clearance Permit**
- **Cross-Application Synchronization (`citizenBridge.ts`)**:
  - Selecting, updating, or logging activity for a citizen in `AURA Citizen Registry`, `Document Studio`, `WORKNET`, `DGAOS`, `TRACE`, `Faith Medical`, or `Cyacademy` synchronizes across the shared MAID record and persists via IndexedDB (`citizenPersistence.ts`).

---

## 🖥️ Desktop Applications Directory (21 Modules)

| Category | Code / Title | Module | Description |
| :--- | :--- | :--- | :--- |
| **Agency** | `DGAOS // Command Center` | `dgaos/apps/DgaosApp.tsx` | Department of Global Affairs command dashboard, division queues, case assignments, and comms. |
| **Agency** | `TRACE // Forensic Workstation` | `apps/TraceWorkspaceApp.tsx` | Multi-discipline forensic laboratory workbench, evidence comparison, and report transmission. |
| **Agency** | `WORKNET // Federal Access` | `apps/JobWorkstationApp.tsx` | Federal career network across DGA, Faith Medical, Oryn Treasury, and Royal Archives linked to MAID records. |
| **Civic** | `AURA // Citizen Registry` | `apps/RegistryWorkspaceApp.tsx` | Population database, Add Person generator, Look Up MAID inspector, and Portrait Studio. |
| **Civic** | `DOCUMENT STUDIO` | `apps/DocumentStudioApp.tsx` | Official 8-template municipal document renderer and inspector synchronized with MAID profiles. |
| **Civic** | `CHRONICLE // Notice Board` | `apps/NoticeBoardApp.tsx` | Public civic bulletin board, active quests, community errands, and one-time reward dispatches. |
| **Civic** | `CAMPUS // Cycademy Network` | `apps/Browser/Portals.tsx` | Cyacademy of Sciences student directory, faculty roster, and academic registry. |
| **Personal** | `MIRROR // Citizen Record` | `apps/CivicProfileApp.tsx` | Personal citizen identity card, bio-aura calibration, skill progression, and wardrobe profile. |
| **Personal** | `HOMECRAFT // Housing` | `apps/HousingApp.tsx` | Housing grid editor, suite customization, furniture placement, room expansion, and restorative rest hub. |
| **Personal** | `ORYN // Treasury & Crypto Ledger` | `apps/FinanceTerminal.tsx` | Citizen sovereign credit (`₢`) & bit (`◈`) balances alongside PoW blockchain telemetry. |
| **Personal** | `VITALS // Bio-Aura Matrix` | `apps/VitalsApp.tsx` | Real-time bio-aura integrity diagnostics, PRISM exposure meter, active conditions, and recovery links. |
| **Connect** | `VERSENET // Web Terminal` | `apps/Browser/BrowserApp.tsx` | Quantum web browser hosting Faith Medical (`faithmed.aure`), DGA (`dga.gov`), Oryn Bank (`bank.aure`), and **Mai.space** (`MaiSpacePortal.tsx`). |
| **Connect** | `AUREMAIL // Mailbox` | `apps/MailApp.tsx` | Citizen inbox, official faction dispatches, `.osform` attachment inspection, reward claiming, and dispatch composer. |
| **Connect** | `COMMS // Institutional Network` | `apps/Comms/CommsApp.tsx` | Dual-pane instant messaging mesh, Cyacademy student channels, and career dispatches. |
| **Connect** | `PULSE // Faction Telemetry` | `apps/Pulse/PulseApp.tsx` | Regional broadcast stream, faction influence vectors, and civic announcements. |
| **Tools** | `VAULT // File Explorer` | `apps/FileExplorerApp.tsx` | Local filesystem browser for `.osform`, `.arch`, `.veil`, `.log`, and municipal records. |
| **Tools** | `ATLAS // Royal Historic Archive` | `apps/LoreExplorer.tsx` | Encyclopedic lore repository covering Meridion regions, factions, NPCs, and treaties. |
| **Tools** | `NEXLINK // SpellForge Matrix` | `apps/SpellForgeApp.tsx` | Dual-slot protocol compiler combining regional code modules into defensive and utility spells. |
| **Tools** | `SYSTEM // Kernel & PRISM Monitor` | `apps/ProcessMonitorApp.tsx` | Kernel thread inspector, resource telemetry, and anomalous PRISM process termination. |
| **Tools** | `TERMINAL // System Console` | `apps/contents.tsx` | Interactive CLI and SQL query console (`SELECT * FROM Factions`, `LORE SEARCH <query>`). |
| **Tools** | `SETTINGS // Preferences` | `apps/contents.tsx` | World Authority database metrics and desktop wallpaper configuration. |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm install --prefix frontend
```

### 2. Run the Development Server
```bash
npm run dev --prefix frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Local Persistence Note:** Gameplay progression, citizen registry records, DGAOS/TRACE investigations, autosaved forensic drafts, and desktop preferences persist automatically in the browser via `localStorage` (`miraverse-os-progress`, `dgaos-trace-storage-v2`) and `IndexedDB`.

### 3. Build Production Bundle
```bash
npm run build --prefix frontend
```
Production assets are emitted to `wwwroot/` for static hosting or integration with the C# backend host.

---

## 🧪 Verification & Acceptance Test Suites

Run the automated verification suites from the repository root:

```bash
# 1. OS Progress, Housing & Persistence Regression Suite (5 tests)
node --test frontend/tests/os-progress.test.mjs

# 2. Canonical MAID Identity, Portrait Studio & 8-Document Pipeline Suite (55 tests)
npx tsx scripts/verify_maid_document_portrait_pipeline.ts

# 3. DGAOS & TRACE Shared Session, Draft Autosave & Hybrid Transmission Suite (40 tests)
npx tsx scripts/verify_dgaos_trace_integration.ts
```

---

## 📂 Project Structure

```text
MiraverseOSx/
├── frontend/
│   ├── public/                        # Static assets, portraits, and icons
│   ├── src/
│   │   ├── apps/                      # 21 MiraverseOSx Desktop Applications
│   │   │   ├── Browser/               # Versenet Browser, Mai.space & Intranet Portals
│   │   │   ├── Comms/                 # Institutional Instant Messaging Mesh
│   │   │   ├── Pulse/                 # Faction Telemetry & Broadcast Stream
│   │   │   ├── CivicProfileApp.tsx    # MIRROR Citizen Record & Skill Matrix
│   │   │   ├── DocumentStudioApp.tsx  # 8-Template Official Document Studio
│   │   │   ├── FileExplorerApp.tsx    # VAULT Encrypted Storage Explorer
│   │   │   ├── FinanceTerminal.tsx    # ORYN Treasury & PoW Crypto Ledger
│   │   │   ├── HousingApp.tsx         # HOMECRAFT Housing Editor & Rest Hub
│   │   │   ├── JobWorkstationApp.tsx  # WORKNET Federal Career Console
│   │   │   ├── LoreExplorer.tsx       # ATLAS Royal Historic Archive
│   │   │   ├── MailApp.tsx            # AureMail Citizen Inbox & Dispatches
│   │   │   ├── NoticeBoardApp.tsx     # CHRONICLE Civic Notice Board
│   │   │   ├── ProcessMonitorApp.tsx  # SYSTEM Kernel & PRISM Monitor
│   │   │   ├── RegistryWorkspaceApp.tsx # AURA Citizen Registry (Add/Look Up MAID)
│   │   │   ├── SpellForgeApp.tsx      # NEXLINK SpellForge Protocol Compiler
│   │   │   ├── TraceWorkspaceApp.tsx  # TRACE Forensic Workstation Entry
│   │   │   ├── VitalsApp.tsx          # VITALS Bio-Aura & PRISM Exposure Matrix
│   │   │   └── contents.tsx           # App Registry, Terminal & Settings
│   │   ├── components/
│   │   │   ├── desktop/               # Desktop Shell, Taskbar, Launcher, Widget Rail
│   │   │   ├── registry/              # Portrait Studio Modal & Registry Components
│   │   │   ├── ui/                    # Shared AppShell, Window, and Glyph Primitives
│   │   │   └── widgets/               # MAI Civic Assistant Dock & Document Modal
│   │   ├── data/                      # Canonical Lore, Citizens, Notices, Emails & Forms
│   │   ├── db/                        # Client SQL/Lore Query Engine (miraverseDb)
│   │   ├── dgaos/                     # Integrated DGAOS & TRACE Forensic Subsystem
│   │   │   ├── apps/                  # DgaosApp & TraceApp Workbenches
│   │   │   ├── components/            # Forensic Stations, Citizen Registry & Medical Charts
│   │   │   └── lib/                   # Authoritative Store, Persistence & Seed Data
│   │   ├── services/                  # Canonical MAID Identity & Portrait Generator Engine
│   │   ├── store/                     # Zustand Stores (OS, Registry, Comms, World, Toasts)
│   │   ├── styles/                    # Celestial & Scoped DGAOS/TRACE Stylesheets
│   │   └── utils/                     # Cross-App Citizen Bridge & Sound Engine
│   └── tests/                         # Node Test Runner Suites
├── scripts/                           # Integration & Pipeline Verification Scripts
├── docs/                              # Architecture & Design System Documentation
├── wwwroot/                           # Compiled Production Bundle Output
└── package.json
```

---

## 📜 License
Private & Proprietary — **MIRAVERSE OS Core**.
