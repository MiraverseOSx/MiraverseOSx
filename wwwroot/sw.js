const CACHE_NAME = "miraverse-shell-e732f305d8e7569f";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-XPQ3PKhR.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-mtOjvRVy.js","/assets/index-C0NZX1ny.js","/assets/App-LaKWGBSc.js","/assets/DgaosApp-CdApgO01.js","/assets/CommsApp-CJankxI0.js","/assets/DocumentStudioApp-qFUpKK8d.js","/assets/RegistryWorkspaceApp-BqKrTOCU.js","/assets/PortraitStudioModal-Deve_OKb.js","/assets/CivicProfileApp-YHJ4sP1w.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-DbwUH9QC.js","/assets/MaiSpaceApp-SV8lWBYm.js","/assets/BrowserApp-D8gc6L3L.js","/assets/versenet-browser-DF8wy6fF.js","/assets/SocialApp-C9Ya7_ID.js","/assets/MailApp-BsMTpUc1.js","/assets/CommunicationsAccessPanel-DC5hohfX.js","/assets/FileExplorerApp-DX77c19d.js","/assets/attachmentDocument-lycwaZbW.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-7Y0THxGf.js","/assets/ProcessMonitorApp-15gEkeGW.js","/assets/HousingApp-CnDf0J4Y.js","/assets/JobWorkstationApp-RzUOWviX.js","/assets/BroadStreetCasePanel-DRGJSt8D.js","/assets/RichMailEditor-DqTsXlhS.js","/assets/VitalsApp-COS5M29d.js","/assets/CampusApp-DwNMIh8B.js","/assets/Portals-BKadkp5M.js","/assets/mai-space-Bsk7u1gu.js","/assets/citizenBridge-DVRjiY8e.js","/assets/maidIdentityService-DiwiaJnD.js","/assets/FinanceTerminal-BfuUwFhF.js","/assets/FieldOperationsApp-CfzswP6b.js","/assets/EvidenceBoard-1DV-eORw.js","/assets/RichTextEditor-7ww_IAxF.js","/assets/SpellForgeApp-3alBVk8G.js","/assets/TunnelScene-DNF6QTky.js"];
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
