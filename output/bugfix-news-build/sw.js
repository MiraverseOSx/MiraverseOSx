const CACHE_NAME = "miraverse-shell-da3b8d5969cadda1";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CWotrLX_.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-I89AItJJ.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-CdswSE7t.js","/assets/index-DvvsoFue.js","/assets/App-CQhn2YiH.js","/assets/DgaosApp-CT1TkSRC.js","/assets/CommsApp-8GE03txc.js","/assets/DocumentStudioApp-D6RrCcuz.js","/assets/RegistryWorkspaceApp-DwhURtBd.js","/assets/PortraitStudioModal-CBnzzil6.js","/assets/CivicProfileApp-DkaKW7G2.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-CAPMfKMl.js","/assets/MaiSpaceApp-DRoUDFh5.js","/assets/BrowserApp-CnbDGU3G.js","/assets/versenet-browser-CseZfTas.js","/assets/SocialApp-DIB-Og_7.js","/assets/MailApp-BeYQw7FT.js","/assets/CommunicationsAccessPanel-Br9cKmVc.js","/assets/FileExplorerApp-C7WATMk-.js","/assets/attachmentDocument-CiNJ2QMF.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-To3mg6XJ.js","/assets/ProcessMonitorApp-BY1NcAxo.js","/assets/HousingApp-COri-GMM.js","/assets/JobWorkstationApp-DD7FP7CF.js","/assets/BroadStreetCasePanel-BGmYh9bb.js","/assets/RichMailEditor-BONhLDQy.js","/assets/VitalsApp-DP2vieEL.js","/assets/CampusApp-s6B-NxU6.js","/assets/Portals-DK3dNfIl.js","/assets/mai-space-DXkQ49hf.js","/assets/citizenBridge-C9_WPubl.js","/assets/maidIdentityService-Dii37eUx.js","/assets/FinanceTerminal-BymWinTM.js","/assets/FieldOperationsApp-CJKSqFd8.js","/assets/EvidenceBoard-C1D3RG1P.js","/assets/RichTextEditor-Jk9f6Lj5.js","/assets/DispatchNewsSite-CEbZw28F.js","/assets/SpellForgeApp-wlCRZ0H0.js","/assets/TunnelScene-f0Fpe_1H.js"];
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
