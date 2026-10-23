const CACHE_NAME = "miraverse-shell-f384aa766a990a20";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DKWLQTBG.css","/assets/App-D3yfv-xv.css","/assets/DgaosApp-Cq75nUs0.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-BE4zxOi8.js","/assets/index-D142A2Oa.js","/assets/App-DgPQWaIT.js","/assets/DgaosApp-DQFt1L4v.js","/assets/CommsApp-COxB6TL-.js","/assets/DocumentStudioApp-Bc_cnxYE.js","/assets/RegistryWorkspaceApp-BaIvM8am.js","/assets/PortraitStudioModal-BqB4M8rG.js","/assets/CivicProfileApp-CcQY-4gX.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-DwE6oEv3.js","/assets/MaiSpaceApp-CjJY2mdm.js","/assets/BrowserApp-tZcWVndp.js","/assets/versenet-browser-DsJJsxBW.js","/assets/MaiSpacePortal-BgkHUaid.js","/assets/MailApp-DQe7G5vT.js","/assets/CommunicationsAccessPanel-tIT6nsCy.js","/assets/FileExplorerApp-DH6qfpIG.js","/assets/mockDocuments-BfbYzNKA.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-CJyBY5RK.js","/assets/ProcessMonitorApp-n4tIKZU4.js","/assets/HousingApp-BhTSVB8K.js","/assets/JobWorkstationApp-NGYXCJgs.js","/assets/AssignmentBoard-CqAcNPbL.js","/assets/VitalsApp-COCfailr.js","/assets/CampusApp-CBVk3YEV.js","/assets/Portals-DulNhLXU.js","/assets/citizenBridge-CYcC-ei6.js","/assets/maidIdentityService-Buh-9bSG.js","/assets/FinanceTerminal-JKXtPvpc.js","/assets/SpellForgeApp-D5RUqzIQ.js"];
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
