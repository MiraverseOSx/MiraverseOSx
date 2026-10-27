const CACHE_NAME = "miraverse-shell-1765d81e40837def";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-BCbo7KCd.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-DSl_AqHM.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-C88Dtcld.js","/assets/index-CCx0IfFs.js","/assets/App-eLGQkyVt.js","/assets/DgaosApp-sP6F9R70.js","/assets/CommsApp-D6MSRDpd.js","/assets/DocumentStudioApp-D4SgnHw-.js","/assets/RegistryWorkspaceApp-a54mNmAz.js","/assets/PortraitStudioModal-BL0VxPhh.js","/assets/CivicProfileApp-T2hrXgqf.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-D-jR0YE3.js","/assets/MaiSpaceApp-Dh-kvoUF.js","/assets/BrowserApp-CAlOynHt.js","/assets/versenet-browser-CgWpGtJR.js","/assets/SocialApp-De48bw2K.js","/assets/MailApp-HFI3jnUh.js","/assets/CommunicationsAccessPanel-MaUAbkPJ.js","/assets/FileExplorerApp-DMQU0Ssx.js","/assets/attachmentDocument-COwnbvxF.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-Bdfez9S-.js","/assets/ProcessMonitorApp--3EN1ULG.js","/assets/HousingApp-DM8XgtWf.js","/assets/JobWorkstationApp-DbShuGcC.js","/assets/BroadStreetCasePanel-orBiftUv.js","/assets/RichMailEditor-HtMfdX55.js","/assets/VitalsApp-CWiqvbGh.js","/assets/CampusApp-4BNWv-dl.js","/assets/Portals-DbkOLjM1.js","/assets/mai-space-BWJpDLRo.js","/assets/citizenBridge-u9cHLj1T.js","/assets/maidIdentityService-CEVWYken.js","/assets/FinanceTerminal-DdGSfAYw.js","/assets/FieldOperationsApp-Bia9g2D1.js","/assets/EvidenceBoard-TY0lK4qk.js","/assets/RichTextEditor-o0KQYvLc.js","/assets/SpellForgeApp-BKnfx1XX.js","/assets/TunnelScene-C-K5hq1N.js"];
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
