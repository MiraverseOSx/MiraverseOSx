import { serviceLaunchUrl } from '../apps/Browser/externalWeb';

// A per-run capability is supplied only to the trusted native app's top-level URL.
// Remove it before any user navigation; never put it in saved browser state.
const params = new URLSearchParams(window.location.search);
let nativeToken = params.get('nativeLaunchToken');
try {
  if (nativeToken) sessionStorage.setItem('miraverse-native-launch', nativeToken);
  else nativeToken = sessionStorage.getItem('miraverse-native-launch');
} catch { /* The current run can still launch if session storage is unavailable. */ }
if (params.has('nativeLaunchToken')) {
  params.delete('nativeLaunchToken');
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${params.size ? `?${params}` : ''}${window.location.hash}`);
}

export const hasNativeLauncher = () => Boolean(nativeToken && window.external?.sendMessage && window.external?.receiveMessage);

export function launchExternal(input: string): Promise<void> {
  const url = serviceLaunchUrl(input);
  if (!url || !hasNativeLauncher()) return Promise.reject(new Error('This address cannot be opened by the desktop launcher.'));
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => { pending.delete(requestId); reject(new Error('The desktop launcher did not respond. Copy the address into your browser.')); }, 8000);
    pending.set(requestId, { resolve: () => { clearTimeout(timeout); resolve(); }, reject: message => { clearTimeout(timeout); reject(new Error(message)); } });
    try {
      if (!listening) {
        window.external!.receiveMessage!((message: string) => {
          try {
            const result = JSON.parse(message);
            if (result.action !== 'open_external_ack') return;
            const request = pending.get(result.requestId);
            if (!request) return;
            pending.delete(result.requestId);
            if (result.payload?.status === 'opened') request.resolve();
            else request.reject('The system browser could not be opened. Copy the address into your browser.');
          } catch { /* Ignore unrelated host messages. */ }
        });
        listening = true;
      }
      window.external!.sendMessage!(JSON.stringify({ action: 'open_external', requestId, payload: { url, token: nativeToken } }));
    } catch {
      pending.delete(requestId); clearTimeout(timeout); reject(new Error('The desktop launcher is unavailable. Copy the address into your browser.'));
    }
  });
}
const pending = new Map<string, { resolve: () => void; reject: (message: string) => void }>();
let listening = false;
