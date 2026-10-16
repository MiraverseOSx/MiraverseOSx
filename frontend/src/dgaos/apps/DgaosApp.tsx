'use client';

import React, { useEffect } from 'react';
import { DgaShell } from '../components/dga/dga-shell';
import TraceApp from './TraceApp';
import { installDgaosApiInterceptor } from '../services/traceApiInterceptor';
import { initDGAStore } from '../lib/dga-store';
import '../styles/dgaos-integrated.css';

// Ensure in-browser API interceptor is active for DGAOS and TRACE
installDgaosApiInterceptor();

export default function DgaosApp() {
  useEffect(() => {
    initDGAStore();
  }, []);

  return (
    <div className="dga-workstation-root flex-1 h-full w-full overflow-hidden bg-[#ebe9f3] text-[#0f0d1a] relative">
      <DgaShell traceWorkbenchNode={<TraceApp />} />
    </div>
  );
}
