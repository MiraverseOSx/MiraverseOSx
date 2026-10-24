# Communications ownership — third implementation package

Completed October 23, 2026 following the user's request to continue the Rev06 cleanup.

## AureMail account issuance

New saves start with one personal mailbox, `citizen@auremail.aure`. It does not borrow Elara's MAID. Fresh onboarding mail is addressed to this mailbox and explains the current organization/account boundaries. Reading an email does not enroll the player, grant membership, or issue another account.

Institutional, academic, and workplace addresses require two separate conditions: an active organization membership and explicit account issuance. The shared **Accounts & memberships** dialog is available in AureMail and Comms, including AureMail's narrower layout. The existing signed-in world administrator can manage the current player's memberships and separately issue an address within the selected institution's domain. These are fictional in-world accounts, not real internet email accounts.

Issuing the same address updates its existing account rather than creating a duplicate. Suspending or revoking membership prevents institutional sending immediately. Account suspension independently prevents sending. Unknown sender addresses are rejected rather than silently replaced with the first account. Unavailable senders are disabled in compose/reply selectors, and a stale selected sender falls back to an available personal account when AureMail opens.

Earlier saved mailboxes, drafts, message addresses, conversation content, saved attachment IDs, filing IDs, and reward claims are retained. Legacy institutional accounts are readable as history; they require active membership and explicit reissuance before further sending. Reissuing an existing address preserves its account ID. Historical account-credentials emails keep their original text; they are not proof of current authorization.

## Comms memberships

Comms now presents public broadcasts, community/institution channels, and workplace coordination. Restricted channel messages are hidden when membership is unavailable. The write action also checks membership, so an old open screen cannot continue posting after revocation.

Accepted WORKNET employment contracts establish their matching workplace membership. Career rank, reputation, an affiliation string, or the administrator flag alone does not establish membership. Explicit suspended/revoked memberships override the contract-derived access without deleting the employment contract or unfinished work. Membership does not automatically create an email address.

Cyacademy membership can currently be issued through the existing simulated administrator workflow. A full student admission/enrollment process has not been invented or implemented in this phase. Tactical channels currently use DGA organization membership; assignment-specific compartment permissions remain later work. Existing permanently locked destinations stay locked. Municipal warnings and DGA public security bulletins remain read-only broadcasts; the Glassline civic room remains public.

The existing encryption/warden mechanics and corruption diagnostic are retained. The diagnostic action verifies access and actual corruption before the UI awards its existing XP, preventing repeat awards for an already-clean channel.

## Phone Messages and personal history

Personal conversations now continue in phone Messages. Earlier Comms direct conversations are imported once into the appropriate phone thread, with stable imported message IDs; the original Comms records remain untouched. Comms retains links to these phone conversations rather than providing another personal chat editor.

Phone messages and per-contact drafts now persist in the existing `miraverse-comms` save, which is already included in world synchronization. Closing the phone no longer discards newly written texts or drafts. Existing phone quick replies and the former Comms cooperative/independent dialogue choices remain available on the phone. Older phone text held only in component memory before this change cannot be recovered after it was already closed.

Phone-open requests are transient and do not reopen conversations on reload. Email message requests retain their existing persistence behavior.

## Implementation boundaries

Organization membership belongs to the current player's OS/gameplay record. Email accounts and conversations remain in the communications store. Store actions read the current OS authority through a registered getter rather than accepting membership claims in send payloads or persisting a second copy of membership data.

The current local simulated administrator system is retained. This phase does not implement production login, backend authorization, real email delivery, or a real institutional account provisioner. The existing canonical NPC contact directory and its previously issued account metadata are retained; no AURA identity or existing NPC address is rewritten by this player-account change.

## Verification

- 153 frontend tests pass, including nine new communications tests for one-account startup and hydration, explicit issuance, domain checks, employment membership, revocation, older-save preservation, unknown senders, phone migration, persistent drafts, and repeated diagnostic rejection.
- Production frontend build passes; the existing DGAOS bundle-size advisory remains.
- Live localhost checks cover membership-required channel states with no protected messages displayed, account/membership dialog access, preserved older account history, and earlier direct conversations opening on the phone.

## Git lock repair

During this work, GitHub Desktop reported an existing lock. The repository's empty `index.lock` was almost two hours old and no Git process was active. After verifying exclusive file access, it was moved to `.git/index.lock.stale-20261022-190842`. Git status succeeded afterward. No commit, reset, source deletion, or removal of generated files was performed.

## Remaining roadmap

Creator Studio pause/resume and publish boundaries, deeper banking/health/housing/archive/education gameplay, full institution/agency access enforcement, MAI's broader role, and Pulse's remaining purpose are still separate work.
