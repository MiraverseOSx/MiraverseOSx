const CACHE_NAME = "miraverse-shell-19a3cb299dc3366d";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DUiSG9nC.css","/assets/App-Ccy8_ykI.css","/assets/TraceApp-Cq75nUs0.css","/assets/BrowserApp-CD7zkIcz.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DHpcVkYH.js","/assets/index-DoOwbqJ9.js","/assets/App-BCZ-BA3n.js","/assets/DgaosApp-MzT4kHp3.js","/assets/CommsApp-BnA4ZsHu.js","/assets/DocumentStudioApp-BjkCx97T.js","/assets/RegistryWorkspaceApp-YbJLCf6P.js","/assets/citizenEvents-t7KAHVQG.js","/assets/TraceWorkspaceApp-Bk577y8b.js","/assets/TraceApp-B_Xml0-5.js","/assets/SpellForgeApp-DQL_bxC5.js","/assets/CivicProfileApp-DtPLBovk.js","/assets/PulseApp-DGdB79S0.js","/assets/NoticeBoardApp-D5wou9vK.js","/assets/BrowserApp-BUSBvZVz.js","/assets/MailApp-RKrpnzWK.js","/assets/FileExplorerApp-DDXQC3il.js","/assets/mockDocuments-SJMGFyag.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-CQ_GFwji.js","/assets/ProcessMonitorApp-C4fdCsxZ.js","/assets/HousingApp-XVh4QRLh.js","/assets/JobWorkstationApp-DEPq5om7.js","/assets/citizenBridge-BcVfvb9q.js","/assets/AssignmentBoard-ZqVyJaIV.js","/assets/maidIdentityService-BymElB3S.js","/assets/VitalsApp-DHKgdyUv.js","/assets/Portals-CoB0JMln.js","/assets/MaiSpacePortal-DGA7C7Nu.js","/assets/FinanceTerminal-CF2MLga5.js"];
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
