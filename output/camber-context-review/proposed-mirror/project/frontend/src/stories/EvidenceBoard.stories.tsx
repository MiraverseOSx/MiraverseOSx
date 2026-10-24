import React, { useState } from 'react';
import EvidenceBoard from '../apps/investigation/EvidenceBoard';
import type { EvidenceBoard as Board } from '../gameplay/evidenceBoard';
export default { title: 'Miraverse/Evidence Board' };
const sources = [{ id: 'audit', title: 'Acquired access audit', app: 'VAULT' }, { id: 'statement', title: 'Acquired witness statement', app: 'AUREMAIL' }];
function Demo({ empty = false, editable = true }) {
  const [board, setBoard] = useState<Board>({ positions: {}, connections: [] });
  const [opened, setOpened] = useState('');
  return <><EvidenceBoard sources={empty ? [] : sources} board={board} editable={editable} onSave={value => { setBoard(value); return { message: 'Preview board saved in memory.' }; }} onOpen={id => setOpened(id)}/><p role="status">{opened && `Original reader requested: ${opened}`}</p></>;
}
export const AcquiredSources = { render: () => <Demo/> };
export const NoSources = { render: () => <Demo empty/> };
export const ReadOnly = { render: () => <Demo editable={false}/> };
