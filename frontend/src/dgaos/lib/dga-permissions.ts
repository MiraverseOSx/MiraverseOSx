import type { DGAAgentProfile, Classification, DGACase } from './dga-types';
import { communicationsAuthority, membershipSource } from '../../integration/communicationsAccess';

export type DGARole =
  | 'command_director'
  | 'field_investigator'
  | 'forensic_examiner'
  | 'intelligence_analyst'
  | 'medical_liaison'
  | 'civic_observer';

export type DgaWorkspaceId =
  | 'operations'
  | 'dashboard'
  | 'cases'
  | 'assignments'
  | 'comms'
  | 'phone'
  | 'medstat'
  | 'investigation'
  | 'intelligence'
  | 'government'
  | 'extranet'
  | 'services'
  | 'world';

export interface DGAAuthorityContext {
  role: DGARole;
  roleLabel: string;
  clearanceLevel: number;
  department: string;
  isAuthorizedAgent: boolean;
  canAccessTrace: boolean;
  canTransmitTraceFindings: boolean;
  canManageAgencyWorld: boolean;
  allowedWorkspaces: DgaWorkspaceId[];
  defaultWorkspace: DgaWorkspaceId;
  allowedTraceViews: string[];
}

export function hasRequiredClearance(
  profile: Pick<DGAAgentProfile, 'clearanceLevel'>,
  requiredClassification: Classification
): boolean {
  const clearanceLevel = profile.clearanceLevel;

  switch (requiredClassification) {
    case 'UNCLASSIFIED // FOUO':
      return clearanceLevel >= 1;
    case 'CONFIDENTIAL':
      return clearanceLevel >= 2;
    case 'SECRET // NOFORN':
      return clearanceLevel >= 3;
    case 'TOP SECRET // NOFORN':
      return clearanceLevel >= 4;
    case 'TOP SECRET // SPECIAL ACCESS REQUIRED':
      return clearanceLevel >= 5;
    default:
      return false;
  }
}

const ALL_DGA_WORKSPACES: DgaWorkspaceId[] = [
  'operations',
  'dashboard',
  'cases',
  'assignments',
  'comms',
  'phone',
  'medstat',
  'investigation',
  'intelligence',
  'government',
  'extranet',
  'services',
  'world',
];

const ALL_TRACE_VIEWS = [
  'Dashboard',
  'Cases',
  'Evidence',
  'Examinations',
  'Reports',
  'Detective Desk',
  'Crime Scene (CSI)',
  'Interrogation Room',
  'Forensic Morgue',
  'Cyber Lab',
  'Laboratory',
  'Legal & Warrants',
  'Courtroom Trial',
  'Citizen Registry',
  'Communications',
  'Quality',
  'Training',
  'Case Builder',
  'Library',
  'Administration',
  'Profile',
];

const ROLE_SPECIFICATIONS: Record<
  DGARole,
  {
    label: string;
    department: string;
    defaultWorkspace: DgaWorkspaceId;
    workspaces: DgaWorkspaceId[];
    canAccessTrace: boolean;
    canTransmitTraceFindings: boolean;
    traceViews: string[];
  }
> = {
  command_director: {
    label: 'DGA Command Director',
    department: 'Executive Command & Counter-PRISM',
    defaultWorkspace: 'dashboard',
    workspaces: ALL_DGA_WORKSPACES,
    canAccessTrace: true,
    canTransmitTraceFindings: true,
    traceViews: ALL_TRACE_VIEWS,
  },
  field_investigator: {
    label: 'DGA Field Investigator',
    department: 'Major Investigations & Tactical Ops',
    defaultWorkspace: 'investigation',
    workspaces: ['dashboard', 'cases', 'assignments', 'comms', 'phone', 'investigation', 'extranet', 'services', 'world', 'operations'],
    canAccessTrace: true,
    canTransmitTraceFindings: false,
    traceViews: [
      'Dashboard', 'Cases', 'Evidence', 'Reports',
      'Detective Desk', 'Crime Scene (CSI)', 'Interrogation Room',
      'Legal & Warrants', 'Courtroom Trial', 'Citizen Registry', 'Communications', 'Library', 'Profile'
    ],
  },
  forensic_examiner: {
    label: 'TRACE Forensic Criminalist',
    department: 'TRACE Central Forensic Laboratory',
    defaultWorkspace: 'cases',
    workspaces: ['dashboard', 'cases', 'assignments', 'comms', 'medstat', 'investigation', 'extranet', 'services'],
    canAccessTrace: true,
    canTransmitTraceFindings: true,
    traceViews: [
      'Dashboard', 'Cases', 'Evidence', 'Examinations', 'Reports',
      'Crime Scene (CSI)', 'Forensic Morgue', 'Cyber Lab', 'Laboratory',
      'Quality', 'Training', 'Library', 'Profile'
    ],
  },
  intelligence_analyst: {
    label: 'ORACLE Intelligence Analyst',
    department: 'SIGINT & Cryptanalysis Division',
    defaultWorkspace: 'intelligence',
    workspaces: ['dashboard', 'cases', 'assignments', 'comms', 'phone', 'intelligence', 'government', 'extranet', 'services', 'world'],
    canAccessTrace: true,
    canTransmitTraceFindings: false,
    traceViews: [
      'Dashboard', 'Cases', 'Evidence', 'Reports',
      'Cyber Lab', 'Citizen Registry', 'Communications', 'Library', 'Profile'
    ],
  },
  medical_liaison: {
    label: 'MEDSTAT Clinical Liaison',
    department: 'Faith Medical / Bio-Surveillance',
    defaultWorkspace: 'medstat',
    workspaces: ['dashboard', 'cases', 'comms', 'medstat', 'extranet', 'services'],
    canAccessTrace: true,
    canTransmitTraceFindings: true,
    traceViews: [
      'Dashboard', 'Cases', 'Evidence', 'Examinations', 'Reports',
      'Forensic Morgue', 'Laboratory', 'Quality', 'Library', 'Profile'
    ],
  },
  civic_observer: {
    label: 'Civic Public Liaison',
    department: 'Public Service Portal',
    defaultWorkspace: 'services',
    workspaces: ['services', 'extranet'],
    canAccessTrace: false,
    canTransmitTraceFindings: false,
    traceViews: [],
  },
};

export function resolveDGAAuthority(options?: {
  profile?: Partial<DGAAgentProfile>;
  player?: any;
  isLoggedIn?: boolean;
  roleOverride?: DGARole | null;
}): DGAAuthorityContext {
  const commAuth = communicationsAuthority();
  const hasExplicitPlayer = options?.player !== undefined;
  const isLoggedIn = options?.isLoggedIn ?? commAuth.isLoggedIn;
  const player = options?.player ?? commAuth.player ?? {};
  const profile = options?.profile;

  // If no OS user is logged in and no explicit player object was passed, fall back to profile or full command seed
  if (!isLoggedIn && !hasExplicitPlayer) {
    const fallbackClearance = profile?.clearanceLevel ?? 5;
    const role: DGARole = options?.roleOverride || (fallbackClearance >= 4 ? 'command_director' : fallbackClearance >= 2 ? 'field_investigator' : 'civic_observer');
    const spec = ROLE_SPECIFICATIONS[role];
    return {
      role,
      roleLabel: spec.label,
      clearanceLevel: fallbackClearance,
      department: profile?.department || spec.department,
      isAuthorizedAgent: role !== 'civic_observer',
      canAccessTrace: spec.canAccessTrace,
      canTransmitTraceFindings: spec.canTransmitTraceFindings,
      canManageAgencyWorld: role === 'command_director',
      allowedWorkspaces: spec.workspaces,
      defaultWorkspace: spec.defaultWorkspace,
      allowedTraceViews: spec.traceViews,
    };
  }

  const isAdmin = Boolean(player?.isAdmin);
  const hasDgaMembership = Boolean(membershipSource(player, 'dga'));
  const hasMedicalMembership = Boolean(membershipSource(player, 'medical'));
  const hasDiplomatMembership = Boolean(membershipSource(player, 'diplomat'));
  const dgaVerified = Boolean(player?.dgaVerified);
  const rawClearance = typeof player?.clearanceLevel === 'number' ? player.clearanceLevel : (profile?.clearanceLevel ?? 1);
  const dgaRank = player?.careers?.dga?.rankIndex ?? 0;
  const enforcerRank = player?.careers?.enforcer?.rankIndex ?? 0;
  const medicalRank = player?.careers?.medical?.rankIndex ?? 0;

  let resolvedRole: DGARole = 'civic_observer';

  if (isAdmin || (hasDgaMembership && rawClearance >= 5) || dgaRank >= 4) {
    resolvedRole = 'command_director';
  } else if (hasDgaMembership || dgaVerified || dgaRank >= 1 || enforcerRank >= 2) {
    if (options?.roleOverride && options.roleOverride !== 'command_director' && options.roleOverride !== 'civic_observer') {
      resolvedRole = options.roleOverride;
    } else if ((player?.skills?.Cryptography?.level ?? 1) >= 4 || (player?.skills?.CyberSecurity?.level ?? 1) >= 4) {
      resolvedRole = 'intelligence_analyst';
    } else if ((player?.skills?.Research?.level ?? 1) >= 3) {
      resolvedRole = 'forensic_examiner';
    } else {
      resolvedRole = 'field_investigator';
    }
  } else if (hasMedicalMembership || medicalRank >= 1) {
    resolvedRole = 'medical_liaison';
  } else if (hasDiplomatMembership && rawClearance >= 3) {
    resolvedRole = 'intelligence_analyst';
  }

  // Allow command_director to preview any role workspace if roleOverride is set
  if (resolvedRole === 'command_director' && options?.roleOverride) {
    resolvedRole = options.roleOverride;
  }

  const effectiveClearance = isAdmin
    ? 5
    : resolvedRole === 'civic_observer'
    ? Math.min(1, rawClearance)
    : Math.max(2, rawClearance);

  const spec = ROLE_SPECIFICATIONS[resolvedRole];

  return {
    role: resolvedRole,
    roleLabel: spec.label,
    clearanceLevel: effectiveClearance,
    department: spec.department,
    isAuthorizedAgent: resolvedRole !== 'civic_observer',
    canAccessTrace: spec.canAccessTrace && effectiveClearance >= 2,
    canTransmitTraceFindings: spec.canTransmitTraceFindings && effectiveClearance >= 2,
    canManageAgencyWorld: isAdmin || (resolvedRole === 'command_director' && effectiveClearance >= 5),
    allowedWorkspaces: spec.workspaces,
    defaultWorkspace: spec.defaultWorkspace,
    allowedTraceViews: spec.traceViews,
  };
}

export function canAccessDgaWorkspace(
  workspace: DgaWorkspaceId,
  authority?: DGAAuthorityContext
): { allowed: boolean; reason?: string } {
  const auth = authority ?? resolveDGAAuthority();
  if (auth.allowedWorkspaces.includes(workspace)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Workspace '${workspace.toUpperCase()}' requires DGA departmental authorization (Current role: ${auth.roleLabel}).`,
  };
}

export function canAccessTraceLab(
  authority?: DGAAuthorityContext
): { allowed: boolean; reason?: string; allowedViews: string[]; canTransmitFindings: boolean } {
  const auth = authority ?? resolveDGAAuthority();
  if (!auth.canAccessTrace) {
    return {
      allowed: false,
      reason: 'TRACE Forensic Laboratory access requires active DGA/TRACE credentials or Faith Medical clinical liaison clearance (Level 2+).',
      allowedViews: [],
      canTransmitFindings: false,
    };
  }
  return {
    allowed: true,
    allowedViews: auth.allowedTraceViews,
    canTransmitFindings: auth.canTransmitTraceFindings,
  };
}

export function authorizeTraceView(
  viewName: string,
  authority?: DGAAuthorityContext
): { allowed: boolean; reason?: string } {
  const auth = authority ?? resolveDGAAuthority();
  if (!auth.canAccessTrace) {
    return {
      allowed: false,
      reason: 'Unauthorized: TRACE Forensic Workstation requires verified DGA or Forensic Laboratory credentials.',
    };
  }
  if (auth.allowedTraceViews.includes(viewName)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `TRACE module '${viewName}' is restricted to authorized division specialists (Current role: ${auth.roleLabel}).`,
  };
}

export function filterAuthorizedDgaCases(
  cases: DGACase[],
  authority?: DGAAuthorityContext
): DGACase[] {
  const auth = authority ?? resolveDGAAuthority();
  if (!auth.isAuthorizedAgent) return [];
  return cases.filter(c =>
    hasRequiredClearance({ clearanceLevel: auth.clearanceLevel }, c.classification)
  );
}
