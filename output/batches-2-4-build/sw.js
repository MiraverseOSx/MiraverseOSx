const CACHE_NAME = "miraverse-shell-e0de0210f68f6b01";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-Bjchtva3.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-C1_bm3Wk.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CEHPhihk.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-CB31ceec.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-BObmZ79a.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-BDwsTWmo.js","/assets/index-VlvEzqCJ.js","/assets/App-BmraxmJE.js","/assets/DgaosApp-W2R6Lqu5.js","/assets/CommsApp-DCifUAuY.js","/assets/DocumentStudioApp-B7tlMwGx.js","/assets/RegistryWorkspaceApp-DR-kb1MV.js","/assets/PortraitStudioModal-wC1OYHY9.js","/assets/CivicProfileApp-B28Gf7ca.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-CV3uWg6b.js","/assets/MaiSpaceApp-CA__YrgV.js","/assets/BrowserApp-BI-X3pCO.js","/assets/versenet-browser-Dq66ou5Z.js","/assets/SocialApp-m5_df7b9.js","/assets/MailApp-HRP0ptbv.js","/assets/CommunicationsAccessPanel-D0i5epqd.js","/assets/FileExplorerApp-cZ7m25DA.js","/assets/attachmentDocument-d8ajstUV.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-Ck4F3PQJ.js","/assets/ProcessMonitorApp-9-DrrfAI.js","/assets/HousingApp-BTm73uUP.js","/assets/JobWorkstationApp-CxZAC6sS.js","/assets/BroadStreetCasePanel-B_S3mMIR.js","/assets/RichMailEditor-C7TvpyNv.js","/assets/VitalsApp-D91fJsu7.js","/assets/CampusApp-D2-egOSj.js","/assets/Portals-BBtc0poT.js","/assets/mai-space-CJp87HVs.js","/assets/citizenBridge-CFn9LHZa.js","/assets/maidIdentityService-Ce_OAX3d.js","/assets/FinanceTerminal-CDkv44o-.js","/assets/FieldOperationsApp-Dh0uOJKf.js","/assets/EvidenceBoard-G6kAzc7M.js","/assets/RichTextEditor-D-X6JbBP.js","/assets/DispatchNewsSite-wyJFLYZp.js","/assets/SpellForgeApp-h7of_0cr.js","/assets/TunnelScene-DQP8Xvt4.js"];
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
