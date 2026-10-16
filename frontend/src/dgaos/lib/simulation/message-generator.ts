import { DGACommunication, DGACase, DGASystem } from '@/lib/dga-types';

export function generateContextualMessage(
  activeCase?: DGACase,
  category: 'LAB_UPDATE' | 'INTEL_BULLETIN' | 'FIELD_REPORT' | 'DIRECTORATE' = 'INTEL_BULLETIN'
): DGACommunication {
  const now = new Date().toISOString();
  const caseId = activeCase ? activeCase.id : 'DGA-26-GEN';
  const id = `CABLE-${Date.now().toString().slice(-4)}`;

  switch (category) {
    case 'LAB_UPDATE':
      return {
        id,
        sender: 'Dr. Gregory Thorne (St. Jude Metro)',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: `CLINICAL UPDATE: Enzymatic Recovery Profile - Case ${caseId}`,
        body: `Agent Jerome,\n\nThe patient's respiratory rhythm has marginally stabilized following intensive atropine perfusion, but secondary blood gas metrics confirm ongoing cellular inhibition.\n\nWe anticipate TRACE spectrometry will isolate the fluorophosphate ester before cellular necrosis sets in. Please expedite analytical confirmation.\n\nDr. Thorne`,
        timestamp: now,
        read: false,
        priority: 'Priority',
        classification: 'SECRET // NOFORN',
        threadId: `TH-${caseId}-CLINICAL`,
        attachments: ['icu_vitals_telemetry.pdf'],
        caseId
      };

    case 'INTEL_BULLETIN':
      return {
        id,
        sender: 'ORACLE Global Intelligence Desk',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: `INTEL FLASH: Cross-Border Carrier Activity Linked to ${caseId}`,
        body: `Priority Distribution:\n\nSatellite Alpha-9 infrared sweep indicates an unmanifested maritime container transfer at Slip 4-B. Heat signatures match heavy chemical shielding containers consistent with schedule 2 organophosphate precursors.\n\nRecommend cross-referencing harbor warehouse leaseholder registry.\n\nORACLE Watch Office`,
        timestamp: now,
        read: false,
        priority: 'Flash / Immediate',
        classification: 'TOP SECRET // NOFORN',
        threadId: `TH-${caseId}-INTEL`,
        attachments: ['sat_ir_slip4b.dat'],
        caseId
      };

    case 'FIELD_REPORT':
      return {
        id,
        sender: 'AEGIS Strike Team Alpha (Field Unit)',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: `SITREP: Harbor Freight Zone Perimeter Established`,
        body: `Agent Jerome,\n\nTeam Alpha has established passive perimeter surveillance around Harbor Warehouse 18. Secondary vehicular access points have been sealed. No active outbound transit detected in the last 20 minutes.\n\nAwaiting your operational authorization before executing breach.\n\nField Commander Vance`,
        timestamp: now,
        read: false,
        priority: 'Priority',
        classification: 'SECRET // NOFORN',
        threadId: `TH-${caseId}-TACTICAL`,
        caseId
      };

    case 'DIRECTORATE':
    default:
      return {
        id,
        sender: 'Director Evelyn Cross (Executive Office)',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: `DIRECTORATE MEMO: Operational Scope Authorization - Case ${caseId}`,
        body: `Special Agent Jerome,\n\nThe Department has briefed the National Security Council on current developments. Full inter-agency liaison jurisdiction is confirmed.\n\nYou are authorized to coordinate directly with TRACE and CIPHER for expedited evidence handling.\n\nEvelyn Cross\nDirector, DGA`,
        timestamp: now,
        read: false,
        priority: 'Routine',
        classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED',
        threadId: `TH-${caseId}-EXEC`,
        caseId
      };
  }
}
