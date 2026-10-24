const CACHE_NAME = "miraverse-shell-b80f0a35ffd4926e";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-CB6Dsewk.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-CJoWwCyL.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-BE-fPvFy.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-CcXWoTB8.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/framer-motion-DSXSN-3g.js","/assets/lucide-icons-DFulvG4K.js","/assets/index-C4nQz7KZ.js","/assets/App-B_oXZBMw.js","/assets/DgaosApp-BtlzGX80.js","/assets/CommsApp-CB2WUFj2.js","/assets/DocumentStudioApp-DXb42efV.js","/assets/RegistryWorkspaceApp-B0UThahq.js","/assets/PortraitStudioModal-BxR4gOFy.js","/assets/CivicProfileApp-DvRmoPV1.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-Cdq8kjfh.js","/assets/MaiSpaceApp-BRBfqU_k.js","/assets/BrowserApp-Cl1d9shA.js","/assets/versenet-browser-C_9dSnH4.js","/assets/SocialApp-DdKAyLqi.js","/assets/MailApp-Dsr_IXPJ.js","/assets/CommunicationsAccessPanel-DeWovI7k.js","/assets/FileExplorerApp-CIRH7XNQ.js","/assets/attachmentDocument-ghsxCGsQ.js","/assets/Form-CuAVtn8O.js","/assets/LoreExplorer-PZD_Vv2k.js","/assets/ProcessMonitorApp-B0MNV3nc.js","/assets/HousingApp-C_gvEqxd.js","/assets/JobWorkstationApp-oVD5bk1F.js","/assets/BroadStreetCasePanel-CdTBG-GP.js","/assets/case-workspace-CvFoilM5.js","/assets/RichMailEditor-PE00MKdI.js","/assets/VitalsApp-DhRS1SKY.js","/assets/CampusApp-DcXJESTc.js","/assets/Portals-b6d_lV4Z.js","/assets/mai-space-D0z391X8.js","/assets/citizenBridge-_NKD4U42.js","/assets/maidIdentityService-B2iR-osr.js","/assets/FinanceTerminal-CU7OmCbC.js","/assets/FieldOperationsApp-4FpOomtb.js","/assets/RichTextEditor-CSrw4nMm.js","/assets/SpellForgeApp-D0NIT9UK.js","/assets/TunnelScene-R8heVejl.js"];
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
