const CACHE_NAME = "miraverse-shell-233fdf9adfc73301";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CWotrLX_.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-I89AItJJ.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-CdswSE7t.js","/assets/index-CWpPC-0h.js","/assets/App-Cl5Woq_N.js","/assets/DgaosApp-D9HCBtbW.js","/assets/CommsApp-CQywVyXt.js","/assets/DocumentStudioApp-Ehihk0df.js","/assets/RegistryWorkspaceApp-CGz7QHt0.js","/assets/PortraitStudioModal-BFh2q2kZ.js","/assets/CivicProfileApp-DAA_xkqJ.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-Nkmn2UDF.js","/assets/MaiSpaceApp-CfnD8qyi.js","/assets/BrowserApp-B3CQTtAO.js","/assets/versenet-browser-DNuIvt8S.js","/assets/SocialApp-UisPJkNC.js","/assets/MailApp-v5XHaylX.js","/assets/CommunicationsAccessPanel-DX0Wt7wA.js","/assets/FileExplorerApp-DKmuNWOK.js","/assets/attachmentDocument-BdbrKfcB.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-CyI_tOdC.js","/assets/ProcessMonitorApp-WfRmlbUz.js","/assets/HousingApp-D35_cZFV.js","/assets/JobWorkstationApp-SQkziKJq.js","/assets/BroadStreetCasePanel-2fC2C89X.js","/assets/RichMailEditor-MAq__i1e.js","/assets/VitalsApp-g92UNVMl.js","/assets/CampusApp-BWUhyq-G.js","/assets/Portals-C369vQFn.js","/assets/mai-space-DP_U2OUX.js","/assets/citizenBridge-_6su9Z-E.js","/assets/maidIdentityService-3QuytszN.js","/assets/FinanceTerminal-Chj1ukq4.js","/assets/FieldOperationsApp-DpOjTCtl.js","/assets/EvidenceBoard-D_XT_gn-.js","/assets/RichTextEditor-CbmBdFOA.js","/assets/DispatchNewsSite-DFYaPKFL.js","/assets/SpellForgeApp-VIC5Sqbx.js","/assets/TunnelScene-DelW7pUu.js"];
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
