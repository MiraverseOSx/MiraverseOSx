const CACHE_NAME = "miraverse-shell-9aaff45c92a27844";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CEHPhihk.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-BObmZ79a.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-CdswSE7t.js","/assets/index-CHH8hrYk.js","/assets/App-QsZ-QQXh.js","/assets/DgaosApp-CXNvPMx2.js","/assets/CommsApp-CAwJBdQv.js","/assets/DocumentStudioApp-vHROplFT.js","/assets/RegistryWorkspaceApp-DuGotRH2.js","/assets/PortraitStudioModal-ax26O7nn.js","/assets/CivicProfileApp-DNeBfP-d.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-CfHxzT2Z.js","/assets/MaiSpaceApp-dDsueZ9L.js","/assets/BrowserApp-D99dkkff.js","/assets/versenet-browser-C95bLWwk.js","/assets/SocialApp-BX4jRYtk.js","/assets/MailApp-DHRjVr-7.js","/assets/CommunicationsAccessPanel-CLy6Pprq.js","/assets/FileExplorerApp-kvw2Pw34.js","/assets/attachmentDocument-kvhYg2Vf.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-BawGGvtt.js","/assets/ProcessMonitorApp-OZ3pUBVO.js","/assets/HousingApp-CDnI7exm.js","/assets/JobWorkstationApp-C9YWBvTD.js","/assets/BroadStreetCasePanel-0vOOckhJ.js","/assets/RichMailEditor-5ijpE9cv.js","/assets/VitalsApp-D_aMjeaa.js","/assets/CampusApp-75QsJQMz.js","/assets/Portals-LawOb95N.js","/assets/mai-space-BdIy8fvu.js","/assets/citizenBridge-BxVhfABK.js","/assets/maidIdentityService-DJCLer99.js","/assets/FinanceTerminal-BCu3A39L.js","/assets/FieldOperationsApp-Ch8jn8m9.js","/assets/EvidenceBoard-BjRBfJTS.js","/assets/RichTextEditor-CMZoWGUM.js","/assets/DispatchNewsSite-ClowIxBZ.js","/assets/SpellForgeApp-pVXF1N52.js","/assets/TunnelScene-rhwWj7Lh.js"];
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
