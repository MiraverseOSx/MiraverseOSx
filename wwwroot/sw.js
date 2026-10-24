const CACHE_NAME = "miraverse-shell-b4b97578985d7eb9";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-XPQ3PKhR.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-mtOjvRVy.js","/assets/index-cE5NLxM9.js","/assets/App-7qqHdMPi.js","/assets/DgaosApp-CkdfctVO.js","/assets/CommsApp-CCwYGJvE.js","/assets/DocumentStudioApp-CeB5bNOb.js","/assets/RegistryWorkspaceApp-BKpWqkcn.js","/assets/PortraitStudioModal-DeCyjvfu.js","/assets/CivicProfileApp-DR9injCb.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-JLngbtNK.js","/assets/MaiSpaceApp-C9Ju6ulX.js","/assets/BrowserApp-DSmEl2ZJ.js","/assets/versenet-browser-Hy8KfIUR.js","/assets/SocialApp-8fGwhqGc.js","/assets/MailApp-D_76xc1h.js","/assets/CommunicationsAccessPanel-Bj__aiNh.js","/assets/FileExplorerApp-CohIlS01.js","/assets/attachmentDocument-BGXzAA3f.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-4SOx-lxW.js","/assets/ProcessMonitorApp-M6CsfGZs.js","/assets/HousingApp-Df5lDwdN.js","/assets/JobWorkstationApp-BljhqCmK.js","/assets/BroadStreetCasePanel-CTXv3cAt.js","/assets/RichMailEditor-Br8GN-EZ.js","/assets/VitalsApp-BmNJsaYt.js","/assets/CampusApp-i7_K5HF8.js","/assets/Portals-DD6wo7Rd.js","/assets/mai-space-ys9Hw3ML.js","/assets/citizenBridge-ajHOZvAl.js","/assets/maidIdentityService-Cx6AF6pj.js","/assets/FinanceTerminal-eS2mrYS1.js","/assets/FieldOperationsApp-B8LiKWUz.js","/assets/EvidenceBoard-BYyZlftQ.js","/assets/RichTextEditor-B-u7U6p1.js","/assets/SpellForgeApp-DB3Wm6dD.js","/assets/TunnelScene-BGFEf0Mw.js"];
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
