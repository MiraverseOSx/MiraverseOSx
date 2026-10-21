const CACHE_NAME = "miraverse-shell-49c0e7595e40802b";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DUiSG9nC.css","/assets/App-B_a0wLaK.css","/assets/TraceApp-Cq75nUs0.css","/assets/BrowserApp-B2lsMLeK.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DTalZHnK.js","/assets/index-CbSUYKwn.js","/assets/App-Bgxagjq8.js","/assets/DgaosApp-DpjFcyoC.js","/assets/CommsApp-UuKOY0No.js","/assets/DocumentStudioApp-DuuA6HXI.js","/assets/RegistryWorkspaceApp-BeyWBwN6.js","/assets/citizenEvents-DCESSTYH.js","/assets/TraceWorkspaceApp-mAhQZA5G.js","/assets/TraceApp-D40G5QR4.js","/assets/SpellForgeApp-DTOQtQ3L.js","/assets/CivicProfileApp-DMQr_hHr.js","/assets/PulseApp-BmH_jExh.js","/assets/NoticeBoardApp-kbHSC23l.js","/assets/BrowserApp-Dk8e77km.js","/assets/MailApp-CZCvkrxz.js","/assets/FileExplorerApp-C-k_PiHz.js","/assets/mockDocuments-BRhfoMde.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-CayV2z1t.js","/assets/ProcessMonitorApp-DDJFk1qS.js","/assets/HousingApp-Bx7inaGU.js","/assets/JobWorkstationApp-B_D4aPtB.js","/assets/citizenBridge-BnPaRmp6.js","/assets/AssignmentBoard-D2IrAuvI.js","/assets/maidIdentityService-C32P4RYS.js","/assets/VitalsApp-Cm8QZK4-.js","/assets/Portals-MW65dGXx.js","/assets/MaiSpacePortal-BmxJp086.js","/assets/FinanceTerminal-CqGtFLOc.js"];
// CACHE_NAME and PRECACHE are injected by the production build.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('miraverse-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request; const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname === '/api') return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => response.ok ? response : caches.match('/index.html').then(cached => cached || response)).catch(() => caches.match('/index.html').then(cached => cached || Response.error())));
    return;
  }
  // Public app resources only. Never cache API responses or arbitrary user URLs.
  if (!/^\/(assets|images|icons|sounds)\//.test(url.pathname)) return;
  // Public hashed assets do not vary by request Origin. Module/CSS preloads may
  // carry a different Origin header than install-time requests (Vary: Origin).
  event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(request, { ignoreVary: true })).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  })));
});
