const CACHE_NAME = "miraverse-shell-8ba9da8e84239bc7";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BgNroYhm.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/case-workspace-CJUr1qgd.css","/assets/RichMailEditor-DZHZoGHi.css","/assets/VitalsApp-CjunPQJt.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DCSl-lUD.js","/assets/index-DzvBVEpd.js","/assets/App-YLnftakZ.js","/assets/DgaosApp-BssmNKMu.js","/assets/CommsApp-CMY-Rbiy.js","/assets/DocumentStudioApp-BIMK_dlp.js","/assets/RegistryWorkspaceApp-DZvBLxZX.js","/assets/PortraitStudioModal-CBjdCeb3.js","/assets/CivicProfileApp-Cnze8zSO.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-DDjcad5S.js","/assets/MaiSpaceApp-A5f-3-dI.js","/assets/BrowserApp-CW7qw4La.js","/assets/versenet-browser-DuSTmrn_.js","/assets/MaiSpacePortal-Nl-4Wzzu.js","/assets/MailApp-gktgF6vt.js","/assets/CommunicationsAccessPanel-saoZLaM0.js","/assets/FileExplorerApp-VHLPvKzN.js","/assets/attachmentDocument-CzReTwAw.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-BA3IC1WO.js","/assets/ProcessMonitorApp-CodMIDLl.js","/assets/HousingApp-DPIPEP_8.js","/assets/JobWorkstationApp-CIwUCqR2.js","/assets/AssignmentBoard-DZxBgOMF.js","/assets/BroadStreetCasePanel-BXFLevA6.js","/assets/case-workspace-CvFoilM5.js","/assets/RichMailEditor-Ulx8PDC_.js","/assets/VitalsApp-DN4xTNAd.js","/assets/CampusApp-C29pTGVF.js","/assets/Portals-BW70a5Fq.js","/assets/citizenBridge-CIJv-Mkb.js","/assets/maidIdentityService-oc84VTbo.js","/assets/FinanceTerminal-Dt5gfY6P.js","/assets/FieldOperationsApp-DZUNZK-k.js","/assets/SpellForgeApp-KAHleePK.js","/assets/TunnelScene-CksuEdIR.js"];
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
