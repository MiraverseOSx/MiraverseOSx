const CACHE_NAME = "miraverse-shell-6914071b4fa2b9cf";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CEHPhihk.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-CB31ceec.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-BObmZ79a.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-CdswSE7t.js","/assets/index-BCAIhefh.js","/assets/App-OtzSWr9t.js","/assets/DgaosApp-BuQJYdQU.js","/assets/CommsApp-C9r1c91D.js","/assets/DocumentStudioApp-CEQTS5NV.js","/assets/RegistryWorkspaceApp-DdmRADBO.js","/assets/PortraitStudioModal-zTeZIV02.js","/assets/CivicProfileApp-yelkAuY6.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-CtrnX06V.js","/assets/MaiSpaceApp-BCMqZBee.js","/assets/BrowserApp-B0jedPH6.js","/assets/versenet-browser-BR4cR0rK.js","/assets/SocialApp-BfiPtwPS.js","/assets/MailApp-BAfJEZ2b.js","/assets/CommunicationsAccessPanel-DK2WOML4.js","/assets/FileExplorerApp-KaK19-AJ.js","/assets/attachmentDocument-B4Ra9AVL.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-Dt5gdB_v.js","/assets/ProcessMonitorApp-CRrU02lD.js","/assets/HousingApp-RtuNP_q2.js","/assets/JobWorkstationApp-BG8ljMMz.js","/assets/BroadStreetCasePanel-DXfdo69h.js","/assets/RichMailEditor-CdPVc6-s.js","/assets/VitalsApp-C7G0_cPt.js","/assets/CampusApp-DtqMMV9x.js","/assets/Portals-DQplaoiK.js","/assets/mai-space-DnFA8j-K.js","/assets/citizenBridge-Cul8bwgU.js","/assets/maidIdentityService-Dj2_66bx.js","/assets/FinanceTerminal-BI7RW_uA.js","/assets/FieldOperationsApp-mayRwY2o.js","/assets/EvidenceBoard-DQvdfrLL.js","/assets/RichTextEditor-d6fv1JGX.js","/assets/DispatchNewsSite-D9LW92wx.js","/assets/SpellForgeApp-VVA8IMKV.js","/assets/TunnelScene-CAmJsCzz.js"];
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
