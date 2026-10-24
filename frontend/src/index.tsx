import React from 'react';
import * as Sentry from '@sentry/react';
import './services/externalLauncher';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import { connectWorld } from './backend/worldConnection';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN || 'https://c427547b954bd38f9cfa3f6321a55250@o4512311772905472.ingest.us.sentry.io/4512311827824640';
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      })
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0, // 100% session replay while testing so every session is captured
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development'
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<div role="status" style={{ padding: 32, color: '#e6edf1', background: '#201529', height: '100vh' }}>Restoring saved world…</div>);

async function boot() {
  await connectWorld();
  const { default: App } = await import('./App');
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
void boot();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline shell unavailable:', error));
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', register, { once: true });
}
