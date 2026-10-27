import React, { useState } from 'react';
import { Globe, ArrowUpRight } from 'lucide-react';
import ExternalLink from './ExternalLink';
import { externalWebUrl } from './externalWeb';

export default function ExternalWebPage({ url }: { url: string }) {
  const [embedded, setEmbedded] = useState(false);
  const safeUrl = externalWebUrl(url);
  if (!safeUrl) return null;
  return <section className={`vn-external-page ${embedded ? 'is-embedded' : ''}`}>
    <header className="vn-gateway-bar"><strong><Globe size={16}/> External Internet</strong><ExternalLink url={safeUrl}><ArrowUpRight size={14}/> Open separately</ExternalLink></header>
    {embedded ? <>
      <div className="vn-embed-notice"><span>Blank or blocked? Use Open separately. Sign-ins and some features may require your browser. The address above is the starting address.</span><button onClick={() => setEmbedded(false)}>Close embedded view</button></div>
      <iframe title={`External website: ${new URL(safeUrl).hostname}`} src={safeUrl} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"/>
    </> : <div className="vn-gateway-intro">
      <Globe size={40}/><h1>Continue to the external web</h1>
      <p className="vn-destination">{safeUrl}</p>
      <p>This website is outside the VerseNet network. Open it in your browser, or try viewing it here. Your civic records and workspace data are not included with this address.</p>
      <div className="vn-gateway-actions"><ExternalLink url={safeUrl}/><button onClick={() => setEmbedded(true)}>Try inside VerseNet</button></div>
      <p className="vn-fine-print">Some websites block embedding. An embedded page has its own navigation; VerseNet saves the starting address. External pages load only when you choose an option.</p>
    </div>}
  </section>;
}
