import React, { useState } from 'react';
import ServiceDirectory from '../../../apps/Browser/ServiceDirectory';
import ExternalWebPage from '../../../apps/Browser/ExternalWebPage';
import '../../../styles/apps/versenet-browser.css';

export default function DgaServiceWorkspace() {
  const [url, setUrl] = useState('');
  return (
    <section className="versenet-browser" aria-label="DGAOS Service Directory">
      {url ? <>
        <nav className="consolidated-tabs">
          <button onClick={() => setUrl('')}>Back to Service Directory</button>
          <span className="vn-destination">{url}</span>
        </nav>
        <ExternalWebPage key={url} url={url}/>
      </> : <ServiceDirectory navigateTab={setUrl}/>}
    </section>
  );
}
