# MAI.SPACE local implementation

Implemented October 23, 2026. The visual direction is classic MySpace: deep-blue network chrome, compact link navigation, square panels, purple headers, a large portrait area, and player-selected Top 8 friends. Personal pages can use independent colors, fonts, textures, and module arrangements.

## Open and customize

Run the existing local game, open Orbit, and launch **mai.space**. Choose **Customize** to open Profile Studio.

1. Choose a starting theme or keep your current design.
2. Drag module handles and resize corners, or use position/size controls. Arrow keys move or resize by 5 pixels; Shift increases this to 20.
3. Hide, add, reorder, or duplicate supported modules. Preview your own view or a public visitor's view.
4. Publish the layout. Earlier published designs remain in layout history; restoring one does not revert posts, relationships, or privacy settings.
5. Save and exchange design-only JSON templates. Imported templates cannot run scripts or overwrite personal content.

The freeform canvas is 960 pixels wide. Narrow app windows scroll across it; maximizing shows the complete composition. Existing customized layouts are preserved. Only untouched older starter layouts receive the updated Y2K arrangement.

## Social features

- Browse eight NPC profiles with authored interests, page designs, and original illustrated mood boards. These illustrations are not character portraits or documentary photographs.
- Accept or request friendships, choose and reorder your Top 8, and set block/mute boundaries. New outgoing requests receive a response after world time advances.
- Write rich-text blogs with uploaded image attachments, save drafts, publish bulletins, and leave threaded comments or guestbook entries.
- Create photo albums, change their audiences, upload/reorder pictures, edit captions, and request consent for friend tags. Tags are not immediately approved.
- Listen to two original synthesized loops or uploaded audio; choose a profile song and order a playlist. Playback is manual and follows the desktop sound setting.
- Join communities, request private membership, create groups, approve requests, and create member-scoped shared albums and calendars. Membership is checked again when actions execute.
- Plan desktop gatherings, invite eligible friends, receive later-cycle RSVPs, and attend once. Attendance creates a private memory and an empty album for your own photographs.
- Continue personal conversations in Mail using the same threads, drafts, and read state as the phone. Institutional Comms and formal AureMail remain separate.

NPC reactions are limited authored responses. Quiet Pages requires becoming acquainted with Rowan before approval. Profile changes follow the implemented conversation/event actions; pages are not randomly restyled every day. These desktop gatherings do not contain playable scenes. This is a local NPC network, with no real-player multiplayer or external music catalog.

## Persistence and media

Social records live in `player.maiSpaceWorld` and participate in the existing game snapshots. Earlier accepted friends and bulletin posts migrate without importing private case logs or creating an invented Top 8. Shared phone state remains in the existing communications save.

Media blobs stay in the browser's IndexedDB library; game snapshots contain their references and metadata. Upload limits are 2 MB per image, 8 MB per audio file, and 32 MB per collection. Use **Export media backup** in Profile Studio before changing devices or clearing browser data. Restore the game save first, then its matching media backup. Layout template exports do not include personal media or writing.

The established MAI.SPACE welcome reward can occur once. Routine posting, comments, music, friendship requests, photographs, and repeat visits do not award currency or repeat friendship points. Local reports are saved records, not messages to a human moderation service.

## Verification

From `frontend`, run `npm test` and `npm run build`. Focused coverage is in `tests/mai-space.test.mjs`; it exercises migration, layout history, privacy, stale-action authorization, media references, tags, groups, event deduplication, shared phone hydration, and one-time welcome compensation. The production build retains existing large-chunk advisories.

Live localhost checks verified normal/maximized views, keyboard layout editing and undo, draft preview, different NPC page themes, and decoded audio playback. No player posts, friendships, or gathering rewards were created for these visual checks.

All implementation changes are local. No GitHub commit or push was performed.
