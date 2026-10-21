const CACHE_NAME = "miraverse-shell-f334dabbced5ce17";
const PRECACHE = ["/index.html","/manifest.json","/images/Logo_Icon - 1.png","/assets/index-C59nN0XL.css","/assets/TraceApp-Cq75nUs0.css","/assets/BrowserApp-B2lsMLeK.css","/assets/MailApp-C-3cFBow.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-CJwJytQL.js","/assets/index-DTkJQpcS.js","/assets/DgaosApp-CpnUgail.js","/assets/CommsApp-pR72erWn.js","/assets/DocumentStudioApp-jkig8_V7.js","/assets/RegistryWorkspaceApp-5p8L_FAv.js","/assets/citizenEvents-8EtXclUZ.js","/assets/TraceWorkspaceApp-Bqa2FWaO.js","/assets/TraceApp-vIiVu-qT.js","/assets/SpellForgeApp-fMnuJv60.js","/assets/CivicProfileApp-DBR2OvQa.js","/assets/PulseApp-B6n4uLJx.js","/assets/NoticeBoardApp-BU3P4GTb.js","/assets/BrowserApp-Ba2pA22y.js","/assets/MailApp-DWfasX2r.js","/assets/FileExplorerApp-C8T7DAI3.js","/assets/mockDocuments-D_AJ7AVK.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-RLEISxOE.js","/assets/ProcessMonitorApp-CA8GKQnt.js","/assets/HousingApp-BacRqIDc.js","/assets/JobWorkstationApp-RDilaovE.js","/assets/citizenBridge-DyM9TxaN.js","/assets/AssignmentBoard-C5nwaDRL.js","/assets/maidIdentityService-BgSbY5JE.js","/assets/VitalsApp-B-HzvtK2.js","/assets/Portals-BRL3X18M.js","/assets/MaiSpacePortal-wQyQ9x9q.js","/assets/FinanceTerminal-TMAbz-1l.js"];
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
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  })));
});
