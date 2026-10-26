const CACHE_NAME = "miraverse-shell-5dd52d9107e77414";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-DSl_AqHM.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-C88Dtcld.js","/assets/index-CezxC7qT.js","/assets/App-BI-iEcqa.js","/assets/DgaosApp-C6E-3gpZ.js","/assets/CommsApp-CNt6zjpN.js","/assets/DocumentStudioApp-2hegT9VI.js","/assets/RegistryWorkspaceApp-0KVfyGqk.js","/assets/PortraitStudioModal-CvPTHyA_.js","/assets/CivicProfileApp-BAUlHbkZ.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-BKi5G8sW.js","/assets/MaiSpaceApp-xWjqICba.js","/assets/BrowserApp-C7Fngj6h.js","/assets/versenet-browser-CxAVw8Xh.js","/assets/SocialApp-BjzDJy9b.js","/assets/MailApp-Db-Kw57e.js","/assets/CommunicationsAccessPanel-CmeuPOi7.js","/assets/FileExplorerApp-ojcaqx85.js","/assets/attachmentDocument-2LqN0ul_.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-oM-VZDtz.js","/assets/ProcessMonitorApp-D7surJ5x.js","/assets/HousingApp-DXh_CL72.js","/assets/JobWorkstationApp-JFFpkLCy.js","/assets/BroadStreetCasePanel-6y4yCcj1.js","/assets/RichMailEditor-BNwwmleV.js","/assets/VitalsApp-BTHoLUCM.js","/assets/CampusApp-BtAefJm4.js","/assets/Portals-QjF19P_P.js","/assets/mai-space-9vDDHR3f.js","/assets/citizenBridge-CLwHhoZ2.js","/assets/maidIdentityService-DMcQCUMr.js","/assets/FinanceTerminal-BpYw0fja.js","/assets/FieldOperationsApp-XjDJsp_D.js","/assets/EvidenceBoard-DdW-wKhK.js","/assets/RichTextEditor-DA1NbuE_.js","/assets/SpellForgeApp-CCZ5LSPt.js","/assets/TunnelScene-CbWxD9bW.js"];
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
