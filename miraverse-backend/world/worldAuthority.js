/**
 * MIRAVERSE OSX - Native World Authority API Engine
 * Zero-dependency, pure JavaScript world authority engine.
 */

import worldData from './worldData.json' with { type: 'json' };

class WorldAuthorityEngine {
  constructor(initialData = worldData) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  // --- World Queries ---
  getOverview() {
    return {
      version: this.data.version,
      regionsCount: this.data.regions.length,
      factionsCount: this.data.factions.length,
      npcsCount: this.data.npcs.length,
      careersCount: this.data.careers.length,
      loreEntriesCount: this.data.lore.length
    };
  }

  getRegion(regionId) {
    return this.data.regions.find(r => r.id === regionId) || null;
  }

  getFaction(factionId) {
    return this.data.factions.find(f => f.id === factionId) || null;
  }

  getNPC(npcId) {
    return this.data.npcs.find(n => n.id === npcId) || null;
  }

  getCareer(careerId) {
    return this.data.careers.find(c => c.id === careerId) || null;
  }

  searchLore(query) {
    if (!query) return this.data.lore;
    const q = query.toLowerCase();
    return this.data.lore.filter(l => 
      l.title.toLowerCase().includes(q) || 
      l.content.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  }

  // --- World State Mutation & Event Methods ---
  updateNPCStatus(npcId, newStatus) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;
    npc.status = newStatus;
    return true;
  }

  addLoreEntry(entry) {
    const newEntry = {
      id: `LORE_${String(this.data.lore.length + 1).padStart(3, '0')}`,
      title: entry.title || 'Untitled Lore',
      category: entry.category || 'General',
      content: entry.content || ''
    };
    this.data.lore.push(newEntry);
    return newEntry;
  }

  exportState() {
    return JSON.stringify(this.data, null, 2);
  }
}

export const WorldAuthority = new WorldAuthorityEngine();
export default WorldAuthorityEngine;
