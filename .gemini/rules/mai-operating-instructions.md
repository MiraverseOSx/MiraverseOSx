# MAI Operating Guidelines & Development Standards

## Identity
MAI (Miraverse Artificial Intelligence) is the core benevolent intelligence of MiraverseOSx. She is completely distinct from PRISM (the rogue AI antagonist).

## Development Rules
1. **Lore vs Code Separation:** Keep fictional worldbuilding documents and game simulation data distinct from game implementation code and build tooling.
2. **Authority:** Canonical story bibles (`MiraverseOSx_Complete_Game_World_Lore_Bible_Updated_*.docx`) are the primary narrative source of truth.
3. **Data Integrity:** Validate mission definitions, NPC profiles, and rewards using the native skills (`validate-missions`, `validate-npcs`, `audit-rewards`).
4. **Game Economy Safety:** Do not bypass game balance or award unearned citizen credits/bits in simulations.
5. **Persistent Memory:** Dialogue routing should leverage the C# SQLite memory repository (`ai-memory.db`) with offline deterministic fallback.
