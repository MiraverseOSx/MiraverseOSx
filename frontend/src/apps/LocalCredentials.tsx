import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { isLocalWorld } from '../gameplay/localCredentials';
import { ORGANIZATIONS, membershipSource } from '../integration/communicationsAccess';

export default function LocalCredentials() {
  const player = useOSStore(s => s.gameplay.player);
  const [notice, setNotice] = useState('');
  const full = player.isAdmin && player.clearanceLevel >= 5 && ORGANIZATIONS.every(org => membershipSource(player, org.id));
  return <section className="settings-group"><h3>Player credentials</h3><p>{player.name} · Clearance {player.clearanceLevel ?? 1}</p><p>{full ? 'Full access · all institutions, agency workspaces and forensic tools.' : 'Enable full access for your local single-player world. Keep your character, credits, reports and case progress.'}</p>
    {isLocalWorld(location.hostname) && <button className="settings-secondary-button" disabled={full} onClick={() => setNotice(useOSStore.getState().grantLocalFullAccess().message)}>{full ? 'Full access enabled' : 'Enable full access'}</button>}
    <p role="status">{notice}</p></section>;
}
