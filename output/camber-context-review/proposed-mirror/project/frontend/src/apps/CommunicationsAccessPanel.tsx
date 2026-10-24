import React, { useEffect, useRef, useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useCommsStore } from '../store/useCommsStore';
import { ORGANIZATIONS, canAcceptInvitation, channelsForOrganization, invitationForOrganization, membershipSource, senderAccess, organization } from '../integration/communicationsAccess';

export default function CommunicationsAccessPanel({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { if (node?.open) node.close(); }; }, []);
  const player = useOSStore(s => s.gameplay.player);
  const isLoggedIn = useOSStore(s => s.isLoggedIn);
  const accounts = useCommsStore(s => s.playerAccounts);
  const [notice, setNotice] = useState('');
  const [institutionId, setInstitutionId] = useState<string>('cyacademy');
  const [localName, setLocalName] = useState('');
  const institution = organization(institutionId)!;
  const canAdminister = Boolean(player.isAdmin && isLoggedIn);
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); onClose(); }} aria-labelledby="communications-access-title" className="communications-access-panel">
    <header><div><span className="workspace-kicker">Current player / communications</span><h1 id="communications-access-title">Accounts & memberships</h1></div><button aria-label="Close accounts and memberships" onClick={onClose}>Close</button></header>
    <p>Organization membership opens its Comms channels. An institutional email address must be issued separately.</p>
    <h2>Organization memberships & invitations</h2><div className="communications-memberships">{ORGANIZATIONS.map(item => {
      const source = membershipSource(player, item.id);
      const explicit = player.organizationMemberships?.[item.id];
      const invite = invitationForOrganization(player, item.id);
      const pendingInvite = canAcceptInvitation(player, item.id);
      const orgChannels = channelsForOrganization(item.id);
      return <article key={item.id}><div><strong>{item.name}</strong><small>{source ? source === 'employment' ? 'Active · accepted employment contract' : explicit?.via === 'invitation' ? 'Active · accepted invitation' : 'Active · issued membership' : pendingInvite ? `Invitation pending · invited by ${invite?.invitedBy}` : explicit?.status || 'No membership'}{orgChannels.length ? ` · Channels: ${orgChannels.join(', ')}` : ''}</small></div>
        <div className="communications-membership-actions">
          {isLoggedIn && pendingInvite && !source && <>
            <button onClick={() => setNotice(useOSStore.getState().acceptOrganizationInvitation(item.id).message)}>Accept {item.name} invite</button>
            <button onClick={() => setNotice(useOSStore.getState().declineOrganizationInvitation(item.id).message)}>Decline</button>
          </>}
          {isLoggedIn && source && <button onClick={() => setNotice(useOSStore.getState().leaveOrganizationMembership(item.id).message)}>Leave {item.name}</button>}
          {canAdminister && <>
            {!source && !pendingInvite && <button onClick={() => setNotice(useOSStore.getState().inviteToOrganization(item.id).message)}>Invite to {item.name}</button>}
            <button onClick={() => setNotice(useOSStore.getState().setOrganizationMembership(item.id, source ? 'suspended' : 'active').message)}>{source ? `Suspend ${item.name}` : `Grant ${item.name}`}</button>
            {(source || explicit?.status === 'suspended' || pendingInvite) && <button onClick={() => setNotice(useOSStore.getState().removeOrganizationMembership(item.id).message)}>Remove {item.name}</button>}
          </>}
        </div>
      </article>;
    })}</div>
    <h2>Email accounts</h2><p>Every citizen begins with one starter personal account (`citizen@auremail.aure`). Older mailboxes retain their messages and drafts. Institutional sending requires active membership and explicit issuance.</p>
    <div className="communications-accounts">{accounts.map(account => <article key={account.id}><div><strong>{account.address}</strong><small>{account.accountType === 'personal' ? 'Starter personal account · available to send' : `${account.accountType} · ${senderAccess(player, account) ? 'Available to send' : `${account.status} · sending unavailable`}`}{account.issuanceSource === 'legacy' ? ' · retained from earlier save' : ''}</small></div>
      {canAdminister && account.accountType !== 'personal' && <div className="communications-account-actions">
        <button onClick={() => { useCommsStore.getState().updateAccountStatus(account.address, account.status === 'active' ? 'suspended' : 'active'); setNotice('Account status updated. Membership and issuance checks still apply.'); }}>{account.status === 'active' ? `Suspend account ${account.address}` : `Reactivate account ${account.address}`}</button>
        {account.status !== 'revoked' && <button onClick={() => setNotice(useCommsStore.getState().revokeInstitutionalAccount(account.address).message)}>Revoke {account.address}</button>}
      </div>}
    </article>)}</div>
    {canAdminister && <form onSubmit={event => {
      event.preventDefault();
      const result = useCommsStore.getState().issueInstitutionalAccount({ address: `${localName.trim()}@${institution.domain}`, organizationId: institution.id } as any);
      setNotice(result.message);
    }}><h2>Issue institutional email</h2><p>World administrator controls for this player. This records an in-world account; it does not create a real internet mailbox.</p>
      <label>Institution<select value={institutionId} onChange={event => setInstitutionId(event.target.value)}>{ORGANIZATIONS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Account name<input value={localName} onChange={event => setLocalName(event.target.value)} required pattern="[a-zA-Z0-9._+\-]+" placeholder="account.name"/><small>@{institution.domain}</small></label>
      <button disabled={!membershipSource(player, institution.id)}>Issue email account</button>
    </form>}
    {!canAdminister && <p>Institutions grant memberships or invitations and issue accounts separately. Accepted WORKNET employment contracts also establish workplace membership.</p>}
    <p role="status">{notice}</p>
  </dialog>;
}
