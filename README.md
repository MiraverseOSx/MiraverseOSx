# MIRAVERSEOSX (mosuniverse.me)

**MIRAVERSEOSX** is an operating system and simulated desktop gaming environment built on React 19, Vite 8, and Zustand 5.

---

## 🌟 Key Architecture & Features

- **Celestial Operating System Desktop**: Light-themed glassmorphism interface, translucent window surfaces, and crisp silver/navy borders.
- **Master Typography System**:
  - *Commissioner*: Primary UI, system telemetry, and standard municipal forms.
  - *Esteban*: Authoritative serif for decrees, lore, and encrypted historical archives.
  - *Alice*: Conversational personal communications and notes.
  - *Cookie* & *Yeseva One*: Expressive headers for Mai.space social network.
- **Core Applications**:
  - **Net Browser (`BrowserApp`)**: Regional web browser featuring Versenet Search, Faith Medical intranet, DGA portal, Cyacademy portal, Orynvell public records, and the **Mai.space** social grid (`mai.space.aure`).
  - **Citizen Record (`CivicProfileApp`)**: Multi-step biometric calibration (dermal nodes, optical geometry, aura telemetry) and holographic municipal identity card.
  - **Mailbox (`MailApp`) & Comms Portal (`CommsApp`)**: Official dispatches, personal citizen mailbox, NPC chat mesh, and squad channels.
  - **SpellForge (`SpellForgeApp`)**: 6 Regional Elements, 8 Utility Protocols, and 5 Rune Modifiers with live synthesis and network defense grid.
  - **File Explorer (`FileExplorerApp`)**: Local documents, system records, and encrypted `.arch` archives.
  - **Notice Board (`NoticeBoardApp`)**: Bootstrap 5 multi-tier operations engine tracking Journeys, Adventures, Quests, Tasks, and Missions.
- **UI Framework**: Built with **Bootstrap 5**, React 19, and Tailwind utility components.
- **AI Logic & Agent Orchestrator**:
  - **Groq API Engine (`miragroq`)**: Sub-second, real-time LLM inference native to the OS.
  - **Agent Orchestrator (`mcp-agents-groq`)**: Node.js MCP server framework orchestrating AI agents, tool calls, and workflow generation with web UI dashboard on port `5050`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Browser (Vite Dev Server)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build Production Bundle
```bash
npm run build
```

---

## 📂 Project Structure

```
MiraverseOSx/
├── miraverse-frontend/
│   ├── public/               # Public assets and favicon
│   └── src/
│       ├── apps/             # Desktop OS Applications
│       │   ├── BrowserApp/   # Web browser & Mai.space portal
│       │   ├── CivicProfileApp.jsx
│       │   ├── CommsApp.jsx
│       │   ├── FileExplorerApp.jsx
│       │   ├── MailApp.jsx
│       │   ├── NoticeBoardApp.jsx
│       │   └── SpellForgeApp.jsx
│       ├── assets/           # Video feeds, images, and audio
│       ├── components/       # UI Shell, Taskbar, MAI Dock, Windows
│       ├── data/             # Standalone world, mission & email datasets
│       ├── db/               # Local client database queries
│       ├── store/            # Zustand global state (OS, World, Toasts)
│       └── styles/           # Styling & typography
├── package.json
└── vite.config.js
```

---

## 📜 License
Private & Proprietary — MIRAVERSE OS Core.
