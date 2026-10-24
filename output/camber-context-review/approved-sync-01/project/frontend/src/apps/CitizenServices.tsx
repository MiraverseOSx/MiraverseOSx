import React from 'react';
import { BookOpen, Activity, Home, Briefcase, GraduationCap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';

export default function CitizenServices() {
  const claimed = useOSStore(s => (s.gameplay.player.claimedPortalActionIds || []).includes('civinet-monthly-stipend'));
  const [feedback, setFeedback] = React.useState('');
  const services = [
    { id: 'lore', label: 'Public archives', detail: 'Explore Atlas and the existing historical collections.', icon: BookOpen },
    { id: 'vitals', label: 'Health services', detail: 'Review your condition and available care in Vitals.', icon: Activity },
    { id: 'housing', label: 'Residence', detail: 'Manage your home through HOMECRAFT.', icon: Home },
    { id: 'jobs', label: 'Work & applications', detail: 'Follow opportunities, assignments, and employment records in WORKNET.', icon: Briefcase },
    { id: 'campus', label: 'Education', detail: 'Open Cyacademy for academic services and magic practice.', icon: GraduationCap },
  ];
  return <section className="citizen-services" aria-label="Citizen services">
    <p className="citizen-boundary">Your gateway to civic life. Each institution keeps its own records and handles its own services.</p>
    <div className="citizen-service-grid">{services.map(item => <button key={item.id} onClick={() => useOSStore.getState().openAppWorkspace(item.id)}>
      <item.icon size={22}/><strong>{item.label}</strong><span>{item.detail}</span><ArrowUpRight size={16}/>
    </button>)}</div>
    <article className="citizen-support"><div><h2>Provisional civic support</h2><p>Existing CIVINET support grant · 100 ₢. Available once per citizen save.</p></div>
      <button disabled={claimed} onClick={() => {
        const result = useOSStore.getState().claimPortalAction('civinet-monthly-stipend', 100, 0, 25, 'Claimed Provisional Citizen Civic Support');
        setFeedback(result.message);
      }}>{claimed ? <><CheckCircle2 size={16}/>Support already received</> : 'Claim civic support'}</button>
    </article>
    {feedback && <p role="status">{feedback}</p>}
  </section>;
}
