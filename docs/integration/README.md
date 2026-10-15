# MiraverseOSx integration staging

This branch adds the latest light-themed Meridion Identity Registry as an **OS application** and registers a **TRACE staging window**. It does not replace the OS desktop or existing MIRROR app. The same-origin localStorage bridge is read-only for TRACE. The original DGAOS/TRACE backend is not embedded.

Security: use no committed `.env` values. A `.env` file is currently tracked on main and needs secrets review, untracking, and credential rotation in a separately reviewed security change. Generated `bin`/`obj` folders require separate cleanup after build confirmation.

No in-world names, Lightborn histories, House structures, or PRISM rules are changed by this patch.

Validation required: npm ci, npm run build, browser smoke test of Registry generation and downloads, and desktop host packaging check.
