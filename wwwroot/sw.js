const CACHE_NAME = "miraverse-shell-c21021a6e4d48f6e";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DvpGLHdE.css","/assets/App-DECuAESh.css","/assets/DgaosApp-Cq75nUs0.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DCSl-lUD.js","/assets/index-CCVJoNZR.js","/assets/App-BWVIvdYJ.js","/assets/DgaosApp-Dbi4aLP1.js","/assets/CommsApp-D9qtkm0b.js","/assets/DocumentStudioApp-fVXxw8gt.js","/assets/RegistryWorkspaceApp-C83wCOWH.js","/assets/PortraitStudioModal-Dw4Uudo0.js","/assets/CivicProfileApp-DnSgQ2Q0.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-BSSkbay-.js","/assets/MaiSpaceApp-DuMcnETV.js","/assets/BrowserApp-CS1COPl9.js","/assets/versenet-browser-BT1N7rHk.js","/assets/MaiSpacePortal-Dx2LAmWJ.js","/assets/MailApp-Ceqqo8bO.js","/assets/CommunicationsAccessPanel-BPCpmf5n.js","/assets/FileExplorerApp-Bm-erZgP.js","/assets/mockDocuments-CsHdM0em.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-t4fsRA_-.js","/assets/ProcessMonitorApp-DYjkr3LG.js","/assets/HousingApp-dReJY87t.js","/assets/JobWorkstationApp-Clh1FtOJ.js","/assets/AssignmentBoard-DrRBAat6.js","/assets/VitalsApp-DNsnYXSh.js","/assets/CampusApp-Q7AbXbK3.js","/assets/Portals-on1OA3dX.js","/assets/citizenBridge-CTYDPBuI.js","/assets/maidIdentityService-CI9bynLv.js","/assets/FinanceTerminal-CipJnV0F.js","/assets/SpellForgeApp-_eMBCRDs.js"];
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
