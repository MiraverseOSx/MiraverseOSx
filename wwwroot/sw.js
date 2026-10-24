const CACHE_NAME = "miraverse-shell-3167d2988fee489d";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-ziOhJv1w.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-CuDNsPy5.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-D7E-zj9n.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-tMQt3-OE.js","/assets/index-Cxb7HGxe.js","/assets/App-Cfj9u-cG.js","/assets/DgaosApp-Cf4FvLpy.js","/assets/CommsApp-DfF9UDm5.js","/assets/DocumentStudioApp-CvATKACm.js","/assets/RegistryWorkspaceApp-DOP3D4Op.js","/assets/PortraitStudioModal-Dq2R5azt.js","/assets/CivicProfileApp-CMgQ-AMU.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-HeseE4JP.js","/assets/MaiSpaceApp-DuSNNJOO.js","/assets/BrowserApp-PfdZS93R.js","/assets/versenet-browser-S6Y6ZkTD.js","/assets/SocialApp-0w7weXiY.js","/assets/MailApp-CsEShfus.js","/assets/CommunicationsAccessPanel-C9g519IR.js","/assets/FileExplorerApp-BFFyXzXH.js","/assets/attachmentDocument-pf7kFvSX.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-CNMp73O0.js","/assets/ProcessMonitorApp-BJJCEqfI.js","/assets/HousingApp-DpUIld2J.js","/assets/JobWorkstationApp-BCbjXQsf.js","/assets/BroadStreetCasePanel-C-ASS9EA.js","/assets/case-workspace-CvFoilM5.js","/assets/RichMailEditor-44ZhNoed.js","/assets/VitalsApp-CTBQGzgs.js","/assets/CampusApp-hb-2zLGU.js","/assets/Portals-DOY2G80e.js","/assets/mai-space-DqCp9QXG.js","/assets/citizenBridge-nwZvQc3V.js","/assets/maidIdentityService-CKwonrNc.js","/assets/FinanceTerminal-CWnzi5V5.js","/assets/FieldOperationsApp-Cqy_JiGi.js","/assets/RichTextEditor-Bha4i9wJ.js","/assets/SpellForgeApp-BEfBn6vt.js","/assets/TunnelScene-DZxSwoPs.js"];
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
