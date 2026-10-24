const CACHE_NAME = "miraverse-shell-cda3b3e6fc303522";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-XPQ3PKhR.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-mtOjvRVy.js","/assets/index-DszDt5cu.js","/assets/App-B3ec3kKr.js","/assets/DgaosApp-1rW4RNrh.js","/assets/CommsApp-Cq0pAPue.js","/assets/DocumentStudioApp-CkhWmmua.js","/assets/RegistryWorkspaceApp-B6azHQcw.js","/assets/PortraitStudioModal-C5SyPCu9.js","/assets/CivicProfileApp-CbnHSt4X.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-D_FibRMY.js","/assets/MaiSpaceApp-CaIxtX_U.js","/assets/BrowserApp-DemT7vlq.js","/assets/versenet-browser-DJZqrKw4.js","/assets/SocialApp-zXdPfwDz.js","/assets/MailApp-Ckhq_qzH.js","/assets/CommunicationsAccessPanel-CoutyllN.js","/assets/FileExplorerApp-CKITe-jW.js","/assets/attachmentDocument-DXwlwwAR.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-DYhVwvYe.js","/assets/ProcessMonitorApp-Bg5VHLDQ.js","/assets/HousingApp-1BdxmElO.js","/assets/JobWorkstationApp-CLMPv8FS.js","/assets/BroadStreetCasePanel-DpxSs-No.js","/assets/RichMailEditor-Bf4eMpUd.js","/assets/VitalsApp-DrSAd3e6.js","/assets/CampusApp-CSUO5ppp.js","/assets/Portals-bqM4cjtF.js","/assets/mai-space-BAIBHb8z.js","/assets/citizenBridge-CztGBHfm.js","/assets/maidIdentityService-BGbQcWNk.js","/assets/FinanceTerminal-BAZsnVSJ.js","/assets/FieldOperationsApp-DCtSGPbU.js","/assets/EvidenceBoard-B7XozPgp.js","/assets/RichTextEditor-BvJ2S-R8.js","/assets/SpellForgeApp-MtkFXQYW.js","/assets/TunnelScene-BCavPRUM.js"];
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
