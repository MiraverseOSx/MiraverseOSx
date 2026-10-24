const CACHE_NAME = "miraverse-shell-103931738c1bafe6";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-ziOhJv1w.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-CuDNsPy5.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-D7E-zj9n.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-tMQt3-OE.js","/assets/index-DaNssXYm.js","/assets/App-CeZckoOG.js","/assets/DgaosApp-DHg9zCeF.js","/assets/CommsApp-CxxFFkUh.js","/assets/DocumentStudioApp-ew9_sFSG.js","/assets/RegistryWorkspaceApp-TSAOzaGT.js","/assets/PortraitStudioModal-CnPikHYw.js","/assets/CivicProfileApp-BuQFxuz6.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-DfGo4zpn.js","/assets/MaiSpaceApp-CuVBmYwj.js","/assets/BrowserApp-P3xRbLqA.js","/assets/versenet-browser-mwIClaw6.js","/assets/SocialApp-0tUHcHZq.js","/assets/MailApp-DcEAUBuz.js","/assets/CommunicationsAccessPanel-C4BlW5km.js","/assets/FileExplorerApp-DRgnogDR.js","/assets/attachmentDocument-C0zWrD8z.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-tJ2BmnGT.js","/assets/ProcessMonitorApp-DTmv3Qd2.js","/assets/HousingApp-D1RJLOUL.js","/assets/JobWorkstationApp-CLKWMbQL.js","/assets/BroadStreetCasePanel-fVYGfD3H.js","/assets/case-workspace-CvFoilM5.js","/assets/RichMailEditor-rF0ejZuc.js","/assets/VitalsApp-BDazfnS2.js","/assets/CampusApp-4QaycQ5w.js","/assets/Portals-DJTUVVBi.js","/assets/mai-space-BNTaj5-J.js","/assets/citizenBridge-D9OtNITx.js","/assets/maidIdentityService-DuHA1SM2.js","/assets/FinanceTerminal-UohxRMDZ.js","/assets/FieldOperationsApp-BT62rhIZ.js","/assets/RichTextEditor-CXsTFgmu.js","/assets/SpellForgeApp-DHmvw6ZJ.js","/assets/TunnelScene-GvUlCM3M.js"];
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
