/**
 * MIRAVERSE OSX - Express API Client & World Connector
 * Connects to http://localhost:5000/api with graceful fallback.
 */

const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  async getWorldOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/world/overview`);
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using fallback');
      return null;
    }
  },

  async getRegions() {
    try {
      const res = await fetch(`${API_BASE_URL}/world/regions`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getFactions() {
    try {
      const res = await fetch(`${API_BASE_URL}/world/factions`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getNPCs() {
    try {
      const res = await fetch(`${API_BASE_URL}/world/npcs`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async searchLore(query = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/world/lore?q=${encodeURIComponent(query)}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async sendMAIPrompt(prompt, userContext = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/mai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userContext })
      });
      return await res.json();
    } catch (err) {
      return {
        thought: 'Backend connection offline',
        response: 'MAI Offline Mode: Unable to reach Express backend API server.',
        action: null
      };
    }
  }
};

export default apiClient;
