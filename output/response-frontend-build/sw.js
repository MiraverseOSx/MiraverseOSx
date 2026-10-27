const CACHE_NAME = "miraverse-shell-43bafc994c326aa6";
const PRECACHE = ["/index.html","/manifest.json","/pwa-icon.svg","/favicon.ico","/images/Logo_Icon - 1.png","/assets/index-DtVXDPJA.css","/assets/App-BjDC7XPS.css","/assets/DgaosApp-C1_bm3Wk.css","/assets/DocumentStudioApp-BTys34W0.css","/assets/RegistryWorkspaceApp-Dt2SnHHz.css","/assets/PulseApp-CEHPhihk.css","/assets/BrowserApp-BCMvgYNp.css","/assets/versenet-browser-CB31ceec.css","/assets/MailApp-JMX_z9Xy.css","/assets/FileExplorerApp-BLQR67_R.css","/assets/attachmentDocument-BtUdRknX.css","/assets/JobWorkstationApp-SYHCKhcG.css","/assets/case-workspace-CJUr1qgd.css","/assets/VitalsApp-CjunPQJt.css","/assets/mai-space-Drcbb3-d.css","/assets/FieldOperationsApp-DxWZrlgh.css","/assets/EvidenceBoard-V3rltzWT.css","/assets/RichTextEditor-DZHZoGHi.css","/assets/DispatchNewsSite-BObmZ79a.css","/assets/framer-motion-B0GbNFm6.js","/assets/lucide-icons-BDwsTWmo.js","/assets/index-DgkpXeDy.js","/assets/App-Bk_id3P-.js","/assets/DgaosApp-BpCOmjSD.js","/assets/CommsApp-BoqLbnqP.js","/assets/DocumentStudioApp-CtT1Tz6z.js","/assets/RegistryWorkspaceApp-lxGRzNnl.js","/assets/PortraitStudioModal-DH7IoEd5.js","/assets/CivicProfileApp-DcPtJr2P.js","/assets/citizenEvents-Ch6-1qqe.js","/assets/PulseApp-Mc8BL4y1.js","/assets/MaiSpaceApp-DMrWHD-a.js","/assets/BrowserApp-Bn4QnEMR.js","/assets/versenet-browser-h-ofjMrm.js","/assets/SocialApp-DGaMytfD.js","/assets/MailApp-Di-a3eJP.js","/assets/CommunicationsAccessPanel-Oybv8zR9.js","/assets/FileExplorerApp-BZOuHC5y.js","/assets/attachmentDocument-CND8W4FV.js","/assets/Form-yyTfbMzo.js","/assets/LoreExplorer-BhMXi-1S.js","/assets/ProcessMonitorApp-DvfP3TbD.js","/assets/HousingApp-CW7roJS6.js","/assets/JobWorkstationApp-DKrq3XdM.js","/assets/BroadStreetCasePanel-CtUWmmym.js","/assets/RichMailEditor-Su_WUJ4i.js","/assets/VitalsApp-CERCH-Rm.js","/assets/CampusApp-C2eWf6TB.js","/assets/Portals-F-oqnyte.js","/assets/mai-space-DJ3s1cn3.js","/assets/citizenBridge-BwcDDmfz.js","/assets/maidIdentityService-B0x8K8mR.js","/assets/FinanceTerminal-CZmI0Uns.js","/assets/FieldOperationsApp-Bwenr2QC.js","/assets/EvidenceBoard-DC8YOGcQ.js","/assets/RichTextEditor-DjGJK19F.js","/assets/DispatchNewsSite-YwQYsiUh.js","/assets/SpellForgeApp-BG7D-G6x.js","/assets/TunnelScene-B9wE8V6s.js"];
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
