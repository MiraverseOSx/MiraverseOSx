const CACHE_NAME = "miraverse-shell-eee10cd649734dc3";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-gj8kEzSN.css","/assets/App-D3yfv-xv.css","/assets/DgaosApp-Cq75nUs0.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-BE4zxOi8.js","/assets/index-TfoM_0IX.js","/assets/App-BFNQuEEs.js","/assets/DgaosApp-Cqxm1s1S.js","/assets/CommsApp-jTbuCqlx.js","/assets/DocumentStudioApp-D-y2EAlv.js","/assets/RegistryWorkspaceApp-DIKvisrF.js","/assets/PortraitStudioModal-JVCcM05N.js","/assets/CivicProfileApp-DKTkykCE.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-BoxEA217.js","/assets/MaiSpaceApp-Br_lifnh.js","/assets/BrowserApp-BuWjiIQv.js","/assets/versenet-browser-BCQbiTG5.js","/assets/MaiSpacePortal-DD80qnpY.js","/assets/MailApp-CAkAcYI0.js","/assets/CommunicationsAccessPanel-Dpgpv2oD.js","/assets/FileExplorerApp-CM1DM04_.js","/assets/mockDocuments-PwIpl4Lh.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-VzS_fRd6.js","/assets/ProcessMonitorApp-D_jANhsP.js","/assets/HousingApp-CNIqFl9u.js","/assets/JobWorkstationApp-C1fIRj3A.js","/assets/citizenBridge-CnxG-ap0.js","/assets/AssignmentBoard-CY4Q95-y.js","/assets/maidIdentityService-DGtGMFTm.js","/assets/VitalsApp-DdtPyK5u.js","/assets/CampusApp-BS1P5Qm6.js","/assets/Portals-CVZM-RN5.js","/assets/FinanceTerminal-BDWIdsyk.js","/assets/SpellForgeApp-Cai-ai4F.js"];
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
