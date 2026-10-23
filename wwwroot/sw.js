const CACHE_NAME = "miraverse-shell-27a285b0052998aa";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-WHIKcjz4.css","/assets/App-DECuAESh.css","/assets/DgaosApp-Cq75nUs0.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-D4yhmeRo.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DCSl-lUD.js","/assets/index-BUs2eMvq.js","/assets/App-JGAzGuEc.js","/assets/DgaosApp-J2ryzJ6Q.js","/assets/CommsApp-CmlQi58w.js","/assets/DocumentStudioApp-BaDKcCNS.js","/assets/RegistryWorkspaceApp-BG8_KYsO.js","/assets/PortraitStudioModal-j81j5nd9.js","/assets/CivicProfileApp-CpciB0T_.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-BN-QRLAJ.js","/assets/MaiSpaceApp-Cq5exMD5.js","/assets/BrowserApp-DXNrkvQh.js","/assets/versenet-browser-BoJOuS-p.js","/assets/MaiSpacePortal-P_-LsFIL.js","/assets/MailApp-Cq7azAgM.js","/assets/CommunicationsAccessPanel-D4LqVaac.js","/assets/FileExplorerApp-DgNex48K.js","/assets/mockDocuments-D85cdqcn.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-_4KoL1gO.js","/assets/ProcessMonitorApp-DhcrRE7g.js","/assets/HousingApp-BV2TzOvh.js","/assets/JobWorkstationApp-BzHUcH1T.js","/assets/AssignmentBoard-BWFMLei8.js","/assets/VitalsApp-UOIo0-RX.js","/assets/CampusApp-3tbSlW_u.js","/assets/Portals-DENjxsUt.js","/assets/citizenBridge-CeFpbKDu.js","/assets/maidIdentityService-COAPSBzt.js","/assets/FinanceTerminal-Ce-z9xUU.js","/assets/SpellForgeApp-CpHLdwVx.js"];
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
