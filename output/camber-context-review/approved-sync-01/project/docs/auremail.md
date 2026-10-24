# AureMail workspace

AureMail uses `MailProvider` and React Context to expose the existing shared communications store. OS dispatches, institutional replies, attachment receipts, and mail organization use one saved mailbox (`miraverse-comms` in localStorage). Existing saves receive empty personal contacts, folders, labels, and rules plus comfortable reading defaults.

- Open **Personal contacts** (or **Contacts** in narrow windows) to create, edit, delete, search, and group your own contacts. The verified institutional directory remains read-only; personal contacts do not acquire clearance or verification.
- Open **Settings & rules** to change density, conversation grouping, automatic read status, and the outgoing signature; create labels and folders; or define incoming sender/subject rules. New messages are processed when AureMail is open. **Apply rules to existing mail** runs rules across existing incoming mail explicitly.
- Drag message rows onto Inbox, Archive, Trash, Spam, a custom folder, or a label. The reader's organization controls provide keyboard and touch alternatives. Labels toggle on and off. Snoozed messages return to their original view after their time expires; **Return now** cancels a snooze. Trash is recoverable.
- **Save to Vault** exposes a document copy under `/downloads/auremail` in File Explorer, with **Open source email** returning to the correct message. These copies carry no objective or reward identifiers.
- Conversation grouping uses explicit thread IDs rather than guessing from subjects. Each message's attachment link opens its own documents and verified grants. Mail organization never pays rewards or completes objectives.
- The composer supports bold, italic, underline, lists, undo, and clearing formatting. **Save Draft** preserves formatted content; sent copies retain it. Pasted content becomes plain text, and saved/rendered HTML permits only formatting tags without attributes or executable content. Email sending remains the existing fictional local relay, with clearance/trust checks.

## Offline shell

Production builds generate a versioned service worker containing the built JS/CSS/font list. After a successful online visit and worker installation, the cached shell and application modules can load offline; local mail changes still persist. API requests and other origins are never intercepted or cached. Server-backed data and uncached media/fonts from other origins still need a connection. Development mode does not register a service worker. The web manifest includes a scalable app icon and standalone display metadata.

Run `npm test --prefix frontend` and `npm run build --prefix frontend` for persistence, formatting, organization, offline-worker, and production checks.
