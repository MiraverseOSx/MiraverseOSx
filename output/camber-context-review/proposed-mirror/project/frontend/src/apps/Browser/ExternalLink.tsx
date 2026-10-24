import React, { useState } from 'react';
import { hasNativeLauncher, launchExternal } from '../../services/externalLauncher';
import { serviceLaunchUrl } from './externalWeb';

export default function ExternalLink({ url, children = 'Open separately' }: { url: string; children?: React.ReactNode }) {
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);
  const safeUrl = serviceLaunchUrl(url);
  if (!safeUrl) return null;
  return <span className="vn-external-link">
    <a href={safeUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-busy={opening} onClick={event => {
      if (!hasNativeLauncher()) return;
      event.preventDefault();
      if (opening) return;
      setError(''); setOpening(true);
      launchExternal(safeUrl).catch(reason => setError(reason.message)).finally(() => setOpening(false));
    }}>{opening ? 'Opening browser…' : children}</a>
    {error && <small role="alert">{error}</small>}
  </span>;
}
