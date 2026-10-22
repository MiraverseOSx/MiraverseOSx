const CACHE_NAME = "miraverse-shell-a08a42134368d4e6";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-CtOitE2b.css","/assets/App-D3yfv-xv.css","/assets/DgaosApp-Cq75nUs0.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-BE4zxOi8.js","/assets/index-CrwNU02R.js","/assets/App-TcQcCBrn.js","/assets/DgaosApp-CqWCfCrZ.js","/assets/CommsApp-DdjYc0cN.js","/assets/DocumentStudioApp-DhlZwpBR.js","/assets/RegistryWorkspaceApp-Lb1YEjxi.js","/assets/PortraitStudioModal-BNB-cxWk.js","/assets/CivicProfileApp-B4wSCdw8.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-_-zE2uvF.js","/assets/MaiSpaceApp-BbjCEgjc.js","/assets/BrowserApp-CktAzJHO.js","/assets/versenet-browser-DPeZ3xOV.js","/assets/MaiSpacePortal-DiZGcEv0.js","/assets/MailApp-DOSspumE.js","/assets/CommunicationsAccessPanel-CtpEkCl3.js","/assets/FileExplorerApp-D4drSygS.js","/assets/mockDocuments-WZ86GZN9.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-Dn-N6XQ4.js","/assets/ProcessMonitorApp-C2T1_ZeF.js","/assets/HousingApp-DZn0CXBO.js","/assets/JobWorkstationApp-Dc1GyN9m.js","/assets/citizenBridge-DdQfC23Y.js","/assets/AssignmentBoard-DvpyKw5U.js","/assets/maidIdentityService-C96iRQZA.js","/assets/VitalsApp-G9CfX6N-.js","/assets/CampusApp-BONkpQ3v.js","/assets/Portals-B9qTtnHY.js","/assets/FinanceTerminal-CzBqdJpd.js","/assets/SpellForgeApp-DlMOjg61.js"];
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
