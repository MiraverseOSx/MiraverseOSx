# MAI SPACE social world design

Implementation status: see [the local implementation guide](mai-space-implementation.md) for shipped features, verification, and current limits. The original design below is retained as a design record.

Design revision October 23 2026. This document describes the requested expansion and its relationship to the current local game. It does not implement the expansion. No application code, player saves, Git commits, or GitHub records are changed by this design document.

## Confirmed direction

MAI.SPACE is a nostalgic social network within Meridion, with the personal freedom of classic MySpace. Profiles, music, photographs, writing, communities, and relationships should make it feel inhabited. Social participation is part of everyday life and need not become a quest or a source of points.

- Players use a freeform profile canvas to drag, resize, arrange, and personalize sections. Ready-made templates are optional starting points, not layout restrictions.
- Basic controls and advanced layout tools coexist. Players can save reusable templates and restore earlier layout versions without reverting their personal information or published content.
- Important NPCs have individually designed profiles. Their visual identities reflect established personalities and change through meaningful experiences rather than daily random restyling.
- NPC citizens form the initial network. Real-player participation is a future possibility; the single-player experience must stand on its own.
- The network keeps a consistent service identity around radically different personal pages. It does not adopt a short-video-first interface.
- Designing a profile, visiting a friend, listening to music, or sharing a photograph does not require a formal assignment.

The detailed behaviors below are design recommendations unless explicitly identified above as confirmed. Numerical limits, new NPC biographies, and new world events are not finalized by this document.

## Current prototype and gaps

The current `MaiSpacePortal.tsx` offers My Profile, Bulletin, Top 8 Network, and 7 Ecosystems views. It saves a handle, selected header font, status thought, accepted friend IDs, cycle-based pings, and bulletin posts.

| Current behavior | Expansion requirement |
| --- | --- |
| A fixed eight-character grid appears as the Top 8. | Players choose and reorder featured friends from actual accepted relationships. Empty slots are valid. |
| The music control changes a local play state and animated bar. | A real player handles an actual supported audio source, including unavailable-media and paused states. |
| Bulletin posting grants cycle-based reputation and friendship; pings increase relationship values each cycle. | Meaningful exchanges and shared experiences drive relationships. Posting and repeat check-ins are not a general progress farm. |
| The profile renders recent entries directly from the shared world-event log. | The social feed uses explicitly publishable social records, with audience and spoiler checks. Private case and medical activity must not be republished automatically. |
| Customization is limited to three header-font choices and profile text. | Freeform placement, module sizing, styling, optional templates, separate drafts, preview, and layout history. |
| Major NPCs are summarized as cards. | Major NPC pages have authored visual compositions, interests, writing, media, and justified updates. |
| Broader albums, blogs, groups, events, and social notifications are absent from this portal. | Each becomes a distinct social destination with its own content and state. |

The existing code is the implementation baseline, not proof that the proposed features already work. In particular, an animated music bar is not audio playback, a fixed card is not an established friendship, and a world-event receipt is not consent to publish its contents.

## Navigation and screen ownership

Use the classic primary navigation **Home | Browse | Search | Friends | Mail | Blog | Music**. Add an always-available My Profile link, notification indicator, and Customize action. Secondary navigation exposes the remaining destinations without crowding the header.

| Destination | Purpose and placement |
| --- | --- |
| Home | Personalized social feed, friends' updates, invitations, and recommendations. Include an explicit chronological option. |
| My Profile | Public identity, mood, biography, interests, layout, profile song, selected modules, and activity. |
| Friends | Accepted relationships, requests, discovery suggestions, and an editable Top 8. |
| Photos | Albums, featured photograph, thumbnail gallery, captions, tags, and comments. Link from profiles and Home. |
| Music | Profile track, playlists, favorite artists, and music shared by friends. |
| Blogs | Titled long-form entries, drafts, categories, audiences, and reader comments. |
| Bulletins | Short announcements and timely updates, distinct from blogs and profile guestbooks. Link from Home. |
| Groups | Discoverable communities, membership requests, discussions, shared albums, and group events. Link from Browse. |
| Events | Invitations, RSVP state, host updates, and supported attendance. Link from Home and Groups. |
| Browse | People and communities by disclosed interests and public profile information. |
| Search | Social content the viewer is permitted to discover. Do not query unrestricted AURA or private institution records. |
| Messages | Personal social correspondence, reached by the classic Mail label. It is not an AureMail account selector. |
| Notifications | Comments, mentions, requests, invitations, and selected friend updates. |
| Customize | Profile Studio, media choices, templates, preview, and version history. |

MAI.SPACE remains the social destination accessible through Orbit and VerseNet. Pulse does not become a second social network. Institutional channels remain in Comms; formal email stays in AureMail.

## Profile Studio

### Canvas and module model

The canvas supports both grid-assisted and free placement. One-, two-, and three-column compositions are convenient presets; they do not define the only legal layouts. Players can change module positions, widths, heights, spacing, and stacking order within the profile canvas.

Keep the network header and editor controls outside the customizable canvas. Profile decorations cannot obscure navigation, impersonate system dialogs, or cover editing controls. Freeform layouts belong inside the page, not across the whole operating-system desktop.

Useful modules include About Me, mood and status, interests, music player, playlists, Top Friends, featured photograph, album gallery, blog excerpts, bulletins, guestbook, groups, events, and decorative text or images. Content-bearing modules refer to existing content records. They do not copy friendships, albums, or posts into each layout version.

Recommend these module rules:

- Allow duplicates of decorative text, images, and selected media views.
- Keep one authoritative editable identity and guestbook. Additional views can reference the same record rather than creating conflicting biographies or conversations.
- Resizing should preserve legibility. Let long text scroll, expand, or use a preview with an Open action; do not silently clip saved writing.
- Hiding a module changes presentation, not its audience or underlying content. Offer separate actions for visibility, deletion, and privacy.
- Dragging and resizing have keyboard equivalents, visible focus, undo and redo, and precise position controls. Reordering arrows remain an accessible alternative.
- Provide optional snapping, alignment guides, grouping, and overlap warnings. Deliberate decorative overlap is possible without making essential controls unusable.

### Styling and media

Basic controls cover background, colors, fonts, borders, textures, section headers, profile photograph, banner, stickers, and media selection. Advanced controls expose composition, spacing, sizes, and supported styling. Classic Lavender and Glitter After Dark establish the initial art directions; Classic Blue can be a proposed additional template rather than a mandatory network theme.

Recommend structured style properties as the first advanced editor. Custom HTML or CSS, if later supported, must be constrained to the profile environment. Arbitrary scripts, event handlers, executable URLs, and styles escaping into the desktop are excluded. A decorative theme must not inherit access to private game state.

### Drafts templates and history

Editing creates a layout draft. Preview displays it at representative app-window widths and under the selected audience context. Publishing a layout makes that version active. Canceling a draft or resetting to a template does not delete the biography, photos, friends, messages, or posts.

Save a template as design only: module arrangement, reusable styling, and distributable decorations. Exclude personal information, friend IDs, private messages, album contents, and inaccessible media references. Applying a template uses the recipient's own content. Copying a template cannot copy permissions or institutional credentials.

Layout history records versions independently of content history. Restoring an old layout does not restore deleted comments, reverse a block, re-add a former friend, or republish an album whose audience has changed. History should identify missing modules or assets and offer a usable fallback.

Exact history retention, asset limits, and template export format remain to be chosen. Local template export and import can precede any real-player sharing service.

### Window sizes

Design against the actual Miraverse window, including normal 16 to 9 windows and maximized views. A wide composition retains its authored canvas while offering a fit-to-width preview and horizontal navigation when appropriate. Recommend a separately arranged compact layout or a readable automatic stack on narrow windows; previews must show the fallback before publication.

The precise breakpoint and minimum readable module sizes remain implementation choices. Do not shrink an entire elaborate page until its text is unreadable.

## NPC pages and social identity

Major NPCs receive authored pages rather than a random theme applied to the same card. Each profile definition specifies an established character reference, layout, aesthetic preferences, disclosed interests, writing style, posting habits, privacy boundaries, relevant relationships, and permitted update triggers.

| Character already present in the prototype | Proposed artistic interpretation |
| --- | --- |
| Jeremie Belpois | Cyber-academic composition with silver and blue panels, technical journal excerpts, technology interests, organized links, and restrained decorations. |
| Aelita Schaeffer | Dreamy pink gradients, floral accents, art, reflective writing, selected music, and more private sections. |
| Elisabeth Delmas | Glamorous Y2K presentation with bold pink details, fashion imagery, featured friends, and event announcements. |

These are proposed art directions, not new biographies, proof of relationships, or settled character lore. No linked reference image is assumed to be a licensed in-game asset.

Background citizens can have simpler pages with fewer modules and less frequent activity. Both tiers need stable identity and coherent privacy. An NPC's public occupation does not expose their patient list, cases, government access, academic grades, or private residence.

NPC customization follows actual experiences. A completed shared activity may produce an album, a new interest may receive a featured module, or an authored privacy decision may remove public details. Record why a change happened and which profile version it replaced. Opening a page or advancing a day does not arbitrarily redesign it.

NPCs maintain lives and connections beyond the player. They can decline requests, miss events, prefer quieter interaction, or leave some details undisclosed. Their posting cadence and availability should reflect authored routines without requiring a full simulation of every background resident.

## Photographs albums and memories

Use a photo-reader layout with an album sidebar, featured photograph, thumbnail strip or grid, caption, description, and chronological comment conversation. Support albums, image order, optional tags, covers, and audience settings.

Player imports, supported in-game camera output, and authored NPC media are separate asset sources. A camera feature is not assumed to exist merely because this design accepts future camera images. Recommend requiring tagged participants to approve public tags or allowing them to remove their association without deleting someone else's photograph.

An event album links to the event that actually occurred. An RSVP alone is not attendance, and a stock picture is not evidence that an NPC was there. NPC memories should reference supported activity outcomes and disclosed participants, with unavailable media represented honestly.

Albums and captions remain separate from layout history. Hiding the gallery does not make a public album private. Changing an album's audience also updates its accessibility from feeds, notifications, search, and direct links.

## Music and the profile player

Provide actual play, pause, seek, volume, track information, and loading or error states for supported audio. Recommend starting paused and requiring a deliberate play action. Selecting another profile should stop or deliberately transfer playback rather than layering several hidden players.

Accept original Meridion tracks, user-provided audio, or sources authorized for the intended use. Do not assume an external commercial track is playable or cleared for redistribution. A template can remember a preferred track reference but cannot silently bundle restricted audio.

Music can prompt authored recommendations, conversation, and event discovery. Shared taste does not automatically establish friendship or grant relationship points. A missing imported file should show a replace or relink option while preserving playlist metadata.

## Friends and the Top 8

Friendship requests have pending, accepted, declined, canceled, and blocked outcomes. Accepted friendship and Top 8 placement are separate records. Players can feature fewer than eight friends, change the order, and remove a featured friend without ending the friendship.

Do not populate featured slots with people who have never accepted a connection. The current fixed eight-card display can inform candidate profiles, but migration must not fabricate friendships. Preserve existing accepted relationships and let the player choose their new arrangement.

NPC reactions to Top 8 changes are contextual and occasional. There is no automatic penalty for editing the list. Meaningful conversations, shared activities, trust, boundaries, and repair after conflict shape relationships. Recommend keeping numerical relationship values out of the main social interface in favor of understandable context and remembered experiences.

Public engagement, repeated pings, and routine posts should not produce an unlimited currency, XP, reputation, or friendship loop. The older decision register retains MAI.SPACE-004 as a one-time onboarding accomplishment. Preserve already-earned rewards; decide its future presentation separately from ordinary social behavior. Do not silently retract player balances or erase historical claims.

## Writing and conversation

Blogs support titles, rich-text drafts, images, categories, audience selection, publication, edits, and comments. Reuse the established local rich-text editor where appropriate. Bulletins remain shorter and timely, with optional expiry from the active bulletin list rather than unexplained deletion of history. Guestbook comments live on profiles and can support replies, decorative media, and reactions.

These are separate content types with clear context. A comment on a photograph stays with that photograph; a blog reply stays with the entry; a private message never becomes a guestbook comment through a layout change.

### Relationship with phone Messages

Recommended integration: MAI.SPACE Mail is another view of the existing personal conversation history, using the same contact and thread identifiers as phone Messages. Preserve message origin so a conversation can show whether an item came through the social site or phone, without duplicating delivery or unread counts.

This recommendation still needs a design choice before implementation. If separate social inboxes are preferred, they must have explicitly distinct conversation ownership and a deliberate link to phone contacts. Do not silently copy all messages between stores.

Either approach keeps AureMail as formal email and Comms as organization communication. A social connection does not issue an institutional account or unlock a restricted channel.

## Groups and events

Groups have a description, membership rules, visibility, discussion board, administrators, optional shared albums, and event listings. Public groups are discoverable; private groups expose only the information their rules allow and require invitation or approval. Membership in a photography club or Color House interest group does not confer legal House membership or institutional authority.

Events have a host, audience, location reference, world-time schedule, invitations, RSVP states, changes or cancellation, and a supported attendance record. Attending can lead to conversation, an album, or a memory without becoming a quest. A quest is created only when the authored activity actually defines one.

Recommend desktop-based attendance and contextual activity choices as the first implementation. Only offer travel or a scene when that destination and interaction exist. The Friday Night Photo Walk is an illustrative scenario, not approved event canon or a promise of a playable city.

## Social simulation and privacy

The social simulation should consume eligible world events through an explicit publication step. It creates a public or audience-limited social item with its own author, time, audience, and safe content. It must not directly render arbitrary world-log summaries into a public feed.

An NPC can respond only to information they experienced or are permitted to know. Private evidence, medical records, undisclosed identity details, and hidden story discoveries cannot leak through reactions, search previews, photo tags, or recommendations. A public association is not permission to inspect institutional records.

Use stable event and reaction IDs so refresh, reload, offline play, and reconnecting cannot repeat invitations, posts, memories, notifications, or relationship consequences. Recommend bounded catch-up when world time advances: show a coherent amount of eligible activity, not a fabricated backlog of events the player never attended.

Blocking, muting, restricting replies, removing tags, and changing audiences have different effects. Blocking should stop new direct interactions and remove actionable requests; muting changes the viewer's presentation. Existing records should explain their state without exposing private content. A local report function can hide content and save a report record, but must not pretend to contact human moderators while the game is offline and single-player.

Future real-player features require explicit identity, authentication, privacy, sharing, and moderation design. The present simulated administrator system and local world database do not provide those services.

## Proposed persistence structure

Keep social profiles separate from canonical identity and institutional authority. Stable references connect the same NPC to the existing citizen record without copying its private dossier into a public profile.

| Record | Responsibility |
| --- | --- |
| Social profile | Display identity, public fields, preferences, and active layout reference. |
| Layout draft and versions | Module instances, composition, responsive presentation, and design history. |
| Template | Reusable design stripped of personal content and private references. |
| Friendship and Top 8 | Request state, accepted relationships, and player-selected featured order. |
| Social content | Typed blog, bulletin, guestbook, photo, and comment records with audiences. |
| Media asset | Image or audio metadata, provenance, availability, and storage reference. |
| Group and event | Membership, role, invitation, RSVP, attendance, and supporting activity references. |
| Social reaction and memory | Eligible cause, participating identities, result, and deduplication reference. |
| Notification | Destination, safe preview, recipient, and shared read state. |

Extend the existing world-save path deliberately when implementing. Imported images and audio need an asset-storage and backup plan; placing unbounded binary data into localStorage or the current JSON snapshot is unsuitable. Decide file-size limits and whether a portable backup bundles media before claiming that saves transfer all uploads between devices.

Preserve current handles, fonts, status, accepted friends, bulletins, rewards, and legacy routing. New layout records can start from an equivalent simple template. Legacy posts can retain their text without recreating a reward event. The current short bulletin retention and timestamp-based identifiers also need explicit migration treatment before the network gains durable comments and links.

## Recommended implementation sequence

These are future work packages, not authorization to start coding during this design phase.

1. **Profiles and Profile Studio.** Establish the social record model and privacy projection, migrate existing content, add freeform layout editing, keyboard controls, drafts, templates, history, and the three proposed NPC page compositions for review.
2. **Social content and media.** Build albums, actual audio playback, blogs, bulletins, guestbooks, and audience-aware search. Agree on media storage and the Messages ownership decision before connecting them.
3. **Relationships and communities.** Add request states, player-selected Top 8, meaningful contextual exchanges, groups, invitations, and desktop event attendance. Replace recurring click-based relationship gains without undoing historical progress.
4. **NPC continuity.** Author a small complete social sequence driven by supported world activity, then extend it to additional NPCs. Test event-linked profile changes, memories, privacy, and offline recovery before expanding the population.
5. **Future sharing.** Consider portable design-only templates first. Real-player profiles, messaging, communities, or shared events require a separate multiplayer project and are not prerequisites for the earlier work.

## Acceptance criteria for later implementation

- Two players can create substantially different pages without changing MAI.SPACE navigation or another app's styles.
- Dragging, resizing, hiding, undo, reset, and version restoration work with mouse and keyboard in normal and maximized windows.
- Applying or restoring a layout does not copy identity, recreate deleted content, reverse privacy decisions, or modify friendships.
- Major NPC pages are recognizably authored and change only through defined causes; background citizens remain coherent with fewer details.
- Top 8 order persists and contains only eligible accepted friends; changing it does not automatically penalize relationships.
- Music plays real supported audio with honest unavailable states and no hidden competing players.
- Photos, comments, blogs, bulletins, groups, and events retain separate meanings and correct destinations.
- Public search, feeds, notifications, and direct links respect audiences and never expose private institutional records.
- Replies and reactions require the relevant access and social state; stale open screens cannot bypass a block or membership change.
- Posts, requests, memories, event attendance, unread states, and relationship effects survive reload and offline reconnect without duplication.
- Ordinary likes, posts, visits, and repeated check-ins do not farm rewards or guaranteed relationship increases.
- Older profiles, earned rewards, and existing personal conversations remain available after migration.
- A complete social sequence works locally with NPCs and does not require multiplayer, a real email service, Python at runtime, or a playable scene.

## Decisions still needed

- Shared personal threads between MAI.SPACE and phone Messages, or a deliberately separate social inbox.
- The permitted advanced styling surface and initial compact-layout behavior.
- Media storage limits, supported audio sources, portable backup behavior, and layout-history retention.
- Approval of individual NPC art directions, initial social content, and the first supported social activity.
- Visibility defaults, tag consent, and the intended presentation of the preserved onboarding accomplishment.

No new decision here defines final relationship mathematics, automatic reaction frequencies, a commercial music catalog, human moderation, or multiplayer availability.
