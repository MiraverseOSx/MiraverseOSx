# Versenet development roadmap

## Phase 1 — Browser foundation (implemented locally)

The in-game browser provides navigation, reload, up to eight independent tabs, back/forward stacks, search, a saved history library, and bookmarks. Its home directory features five existing fictional websites: WorkNet, CIVINET, Faith Medical, Cycademy, and the Royal Historic Society. Existing portal addresses remain available.

Tabs, history, and bookmarks are stored in the existing local progress save. Older saves gain browser defaults without replacing gameplay progress. History retains the 150 most recently visited unique pages, each tab retains 100 navigation entries, and bookmarks retain 100 pages. Clearing history also clears each tab's back/forward stack, preserving current pages and bookmarks. Reload remounts the current page without creating a visit or changing its navigation stack; unsaved page form input may reset.

Search combines the existing fictional site and public archive index with the local content catalog described below. Unknown addresses still display an unavailable page. Navigation stays inside the simulated network; typed queries are not sent to a public-web search service.

## Generated search collections — implemented locally

Every non-empty submitted search has Sites, Images, Files, and Maps content. All mixes these results; People and Archives show actual public indexed matches only. Filters are encoded in the search URL so back/forward restores the selected filter. Search suggestions are not shown while typing.

Authored packs cover dogs, cats, animals, plants, food, housing, travel, technology, education, health, work, and history. Dog/dogs/puppy aliases share one collection. Other words receive a deterministic research collection with source worksheets, abstract artwork, and public research locations. This provides a useful fallback without inventing literal photographs, people, businesses, or established lore for an unknown phrase. Queries normalize Unicode, whitespace, and case, with a 512-character storage limit.

Generated pages are served at internal `fieldnotes.aure` addresses. Articles, image previews, folders, documents, map pins, public listings, and related links are usable. The local `versenetContent.catalog` stores the original version and text; revisits retain saved editions. It begins empty for older saves. Searching never creates progression receipts, rewards, or discoveries. Restricted archives remain outside public results until their explicit release rule permits them.

Documents and folders can be saved to `/downloads/versenet` in File Explorer. `versenetContent.savedFiles` is separate from assignment storage; IDs and source references prevent duplicate downloads. A folder contains its saved documents, and each document retains its publisher and source address. Existing assignment files remain untouched.

Images combine original vector compositions with bundled reference photographs. Source and rights information appears in previews and in `frontend/public/images/versenet/CREDITS.md`. If a photograph fails, a labelled illustration fallback appears. Maps are schematic and contain public locations, not measured routes or hidden discoveries.

`EXTERNAL_SEARCH_LINKS` is an initially empty curated registry. Added matching HTTP(S) links are marked external and use a separate real browser tab. Attribution links also open separately. Arbitrary external results are not fetched or invented.

## Phase 2 — Interactive sites (first three implemented locally)

Three public sites now provide local character-owned accounts, profiles, forms, drafts, and searchable records:

- `companion.aure`: Aureline Companion; dog/cat interests and neighborhood companion enquiries.
- `gardenreview.aure`: Glassline Garden Review; visitor interests and garden visit requests.
- `readingroom.aure`: Aureline Open Reading Room; reader interests and research requests.

Find them through search or a matching article's publisher link. Each has stable routes for overview, profile, request, records, and individual references. Forms validate site-specific selections and lengths; garden group sizes range from one to eight. A fictional display name, handle, and interest create the site account; no real email, password, or network registration is used. Handles are unique within each site's local saved profiles. Profile names can change without rewriting previous submission snapshots.

New browser destinations open at the top of their page. Profiles, forms, and record links work with the existing history and bookmark system; private site records are not added to public search results.

The persisted `versenetSites` state holds profiles, drafts, and received/withdrawn submissions separately from gameplay and downloaded documents. Accounts belong to the same named character used by the existing game-resume behavior, so later civic verification does not detach them. Another character cannot read or modify a record by entering its address. Old saves start with empty site state.

Use Save draft to keep an unfinished form. Submitting clears only that form's draft and provides a stable reference. Identical received submissions are deduplicated. Revisions retain the reference and original date, with a revision count. Withdrawal retains the copy and is reversible; withdrawn requests must be reopened before editing. Received means recorded locally, not approved or booked. No automatic institution response, mail, rewards, qualifications, or world events are generated. Those integrations remain Phase 3 work.

## Phase 3 — Interconnected applications

Connect AureMail, DGAOS, TRACE, careers, businesses, and other services through a consistent world state. Establish shared identities, record ownership, and event propagation.

## Phase 4 — Living internet

Add generated articles, fictional community activity, developing organizations, new websites, and world events. Content must reflect established world state and preserve discovery rules.

## Phase 5 — Player-created internet (potential)

Explore controlled website, business, digital-service, and page templates with publishing rules. Scope, unlock conditions, and publication behavior remain undecided.
