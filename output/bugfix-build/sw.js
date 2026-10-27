const CACHE_NAME = "miraverse-shell-1f97c07a4f0fbe41";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-DSl_AqHM.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-C88Dtcld.js","/assets/index-BKfZTJiY.js","/assets/App-CpmUVxpe.js","/assets/DgaosApp-BU47q5kJ.js","/assets/CommsApp-DcJ0BW2V.js","/assets/DocumentStudioApp-DjvsLWW1.js","/assets/RegistryWorkspaceApp-Bo_n7-iO.js","/assets/PortraitStudioModal-G1HLkOKr.js","/assets/CivicProfileApp-CJsUwLCq.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-5sbYCz2W.js","/assets/MaiSpaceApp-BK3Oiaam.js","/assets/BrowserApp-CLv-oT0o.js","/assets/versenet-browser-DPQvEjni.js","/assets/SocialApp-Dj8kntup.js","/assets/MailApp-CnrFZfy4.js","/assets/CommunicationsAccessPanel-Dp_v1Odr.js","/assets/FileExplorerApp-C4bn5Ua-.js","/assets/attachmentDocument-BiOmY-yq.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-Dh4L9G6f.js","/assets/ProcessMonitorApp-Dzlp4hfu.js","/assets/HousingApp-B0UF-aYT.js","/assets/JobWorkstationApp-BZak4ZL2.js","/assets/BroadStreetCasePanel-DZDcE7x9.js","/assets/RichMailEditor-NGJHGMDK.js","/assets/VitalsApp-ByKungQs.js","/assets/CampusApp-Bxj8JPs3.js","/assets/Portals-CUF1yhO9.js","/assets/mai-space-BHtTlnxG.js","/assets/citizenBridge-C1IWHvwR.js","/assets/maidIdentityService-DAjDYt8i.js","/assets/FinanceTerminal-BLULH5wZ.js","/assets/FieldOperationsApp-DbKcbHwz.js","/assets/EvidenceBoard-BLGzZbzx.js","/assets/RichTextEditor-VN5YKAJY.js","/assets/SpellForgeApp-BWZd8jqv.js","/assets/TunnelScene-1BVJtzLF.js"];
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
