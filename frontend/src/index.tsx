import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import { connectWorld } from './backend/worldConnection';

const root = ReactDOM.createRoot(document.getElementById('root'));
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
