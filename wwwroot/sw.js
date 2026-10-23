const CACHE_NAME = "miraverse-shell-fc87a7c0d23f9bb4";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DaHt1uv_.css","/assets/App-DECuAESh.css","/assets/DgaosApp-DD2xPzqv.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/case-workspace-CJUr1qgd.css","/assets/RichMailEditor-DZHZoGHi.css","/assets/VitalsApp-CjunPQJt.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DCSl-lUD.js","/assets/index-BJpGbUWn.js","/assets/App-B-JZJhqe.js","/assets/DgaosApp-CnDZx5ii.js","/assets/CommsApp-K_MIn3gO.js","/assets/DocumentStudioApp-zKqKTGbI.js","/assets/RegistryWorkspaceApp-q4FluSRz.js","/assets/PortraitStudioModal-DonHrXlY.js","/assets/CivicProfileApp-oFB0AfX4.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-C_70hDos.js","/assets/MaiSpaceApp-oHcg42jd.js","/assets/BrowserApp-DKICYcDY.js","/assets/versenet-browser-B8bBVxWv.js","/assets/MaiSpacePortal-QBBAE8ZH.js","/assets/MailApp-BN0tbB2U.js","/assets/CommunicationsAccessPanel-D3FiL_9f.js","/assets/FileExplorerApp-DvZJKuQp.js","/assets/mockDocuments-BmC4iW1v.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-C-nC7ox9.js","/assets/ProcessMonitorApp-CoPe8-7C.js","/assets/HousingApp-Bvj_Svlz.js","/assets/JobWorkstationApp-vAkP0NQj.js","/assets/AssignmentBoard-CQ7yRB4m.js","/assets/BroadStreetCasePanel-o4dZk6_k.js","/assets/case-workspace-CvFoilM5.js","/assets/RichMailEditor-BR4R3HBw.js","/assets/VitalsApp-B35IttBz.js","/assets/CampusApp-ivy9jWdZ.js","/assets/Portals-DMnfKbTn.js","/assets/citizenBridge-BEcQcOTP.js","/assets/maidIdentityService-BL6l1MK_.js","/assets/FinanceTerminal-BTMV6ZBH.js","/assets/FieldOperationsApp-DJTL_UyZ.js","/assets/SpellForgeApp-BPFkbsRF.js","/assets/TunnelScene-CE3l-wPf.js"];
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
