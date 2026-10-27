const CACHE_NAME = "miraverse-shell-20bae175db76ed6d";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CEHPhihk.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-CB31ceec.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-BObmZ79a.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-CdswSE7t.js","/assets/index-ChVSwolM.js","/assets/App-DGXdxnEf.js","/assets/DgaosApp-BFfbEngA.js","/assets/CommsApp-tYgoZ5yv.js","/assets/DocumentStudioApp-DuxaVTlT.js","/assets/RegistryWorkspaceApp-Ti2X_Wc-.js","/assets/PortraitStudioModal-B__FcX-E.js","/assets/CivicProfileApp-COkNknAu.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-DMy19r3U.js","/assets/MaiSpaceApp-DO7-f-hy.js","/assets/BrowserApp-DGMBgEQ2.js","/assets/versenet-browser-BKkU3wuv.js","/assets/SocialApp-B0Mfk7vl.js","/assets/MailApp-DnG34IqU.js","/assets/CommunicationsAccessPanel-BuhJrbYg.js","/assets/FileExplorerApp-CElZJV3s.js","/assets/attachmentDocument-BBWYNl--.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-DvCaTBl-.js","/assets/ProcessMonitorApp-b2NuJBUT.js","/assets/HousingApp-Cegmxkq9.js","/assets/JobWorkstationApp-DnsB8Jjb.js","/assets/BroadStreetCasePanel-uqNATluu.js","/assets/RichMailEditor-DO_OYz2D.js","/assets/VitalsApp-BCPgDyD1.js","/assets/CampusApp-CpQIS6N3.js","/assets/Portals-DSyj7XA_.js","/assets/mai-space-P31sqnO-.js","/assets/citizenBridge-BeFYZPuk.js","/assets/maidIdentityService-CwAmMly5.js","/assets/FinanceTerminal-CqrBV60a.js","/assets/FieldOperationsApp-DQJHk21s.js","/assets/EvidenceBoard-BOE9FMKC.js","/assets/RichTextEditor-CGCKh_WW.js","/assets/DispatchNewsSite-CkrswcFX.js","/assets/SpellForgeApp-CUTYCh4E.js","/assets/TunnelScene-Bw2f0IcR.js"];
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
