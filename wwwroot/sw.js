const CACHE_NAME = "miraverse-shell-e4c4f7d832d1a8a8";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/images/Logo_Icon - 1.png","/assets/index-DKWLQTBG.css","/assets/App-D3yfv-xv.css","/assets/DgaosApp-Cq75nUs0.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/VitalsApp-CjunPQJt.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-BE4zxOi8.js","/assets/index-SjqNx1Ev.js","/assets/App-AxD3tB7u.js","/assets/DgaosApp-DabHq-Z1.js","/assets/CommsApp-ClZYZut0.js","/assets/DocumentStudioApp-DrTeS2BE.js","/assets/RegistryWorkspaceApp-Bv4Er78j.js","/assets/PortraitStudioModal-wLaAiRPl.js","/assets/CivicProfileApp-D3lBFGJj.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-CUFOnRuk.js","/assets/MaiSpaceApp-3TNAh8BU.js","/assets/BrowserApp-BO-WAhO-.js","/assets/versenet-browser-B5AvbEnX.js","/assets/MaiSpacePortal-zBxWI0B2.js","/assets/MailApp-Cu4lRB_b.js","/assets/CommunicationsAccessPanel-tzgXfuB7.js","/assets/FileExplorerApp-B3VF_tEb.js","/assets/mockDocuments-DGUQxhPf.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-BGYsIxhR.js","/assets/ProcessMonitorApp-COkvIRxs.js","/assets/HousingApp-BalTwoKw.js","/assets/JobWorkstationApp-CjV7pBwq.js","/assets/citizenBridge-Bvkibilj.js","/assets/AssignmentBoard-C52vXd9x.js","/assets/maidIdentityService-CYGipDxc.js","/assets/VitalsApp-67BRIA6l.js","/assets/CampusApp-BKDoq46f.js","/assets/Portals-4gyj-yeY.js","/assets/FinanceTerminal-oOYWiziz.js","/assets/SpellForgeApp-Dv9H613x.js"];
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
