import { communicationsAuthority, membershipSource } from './communicationsAccess';
import type { CanonicalPerson } from '../services/maidIdentityService';

export type AuraRole = 'admin' | 'registrar' | 'dga' | 'medical' | 'academic' | 'citizen';

export type AuraAction =
  | 'lookup_public'
  | 'lookup_restricted'
  | 'register_person'
  | 'confirm_migration'
  | 'edit_identity_core'
  | 'edit_medical_record'
  | 'edit_security_clearance'
  | 'edit_self_contact'
  | 'link_relationships'
  | 'issue_document'
  | 'issue_full_packet';

export interface AuraActorContext {
  isLoggedIn: boolean;
  isAdmin: boolean;
  clearanceLevel: number;
  dgaVerified: boolean;
  canonicalPersonId: string | null;
  citizenId: string | null;
  roles: AuraRole[];
  primaryRole: AuraRole;
  roleLabel: string;
}

export interface AuraRecordPermissions {
  canViewRecord: boolean;
  canViewRestrictedFields: boolean;
  canViewMedicalDetails: boolean;
  canViewForensicBiometrics: boolean;
  canEditCoreProfile: boolean;
  canEditMedicalOnly: boolean;
  canEditSelfContactOnly: boolean;
  canLinkRelationships: boolean;
  canConfirmMigration: boolean;
  editableFields: string[];
  allowedDocumentIds: number[];
  canExportFullPacket: boolean;
  restrictionReason?: string;
}

const CORE_EDITABLE_FIELDS = [
  'occupation', 'affiliation', 'clearance', 'medical', 'residency', 'household',
  'status', 'abilities', 'affinity', 'height', 'eyes', 'hair', 'build', 'blood',
  'mark', 'address', 'phone', 'email', 'portraitData', 'isRestricted'
];

const REGISTRAR_EDITABLE_FIELDS = [
  'occupation', 'affiliation', 'residency', 'household', 'status', 'abilities',
  'affinity', 'height', 'eyes', 'hair', 'build', 'mark', 'address', 'phone',
  'email', 'portraitData'
];

const MEDICAL_EDITABLE_FIELDS = ['medical', 'blood', 'aura'];
const DGA_EDITABLE_FIELDS = ['status', 'clearance', 'links', 'history', 'isRestricted'];
const SELF_CONTACT_EDITABLE_FIELDS = ['address', 'phone', 'email', 'residency', 'household'];

export function resolveAuraActor(override?: { player?: any; identity?: any; isLoggedIn?: boolean }): AuraActorContext {
  const auth = override ?? communicationsAuthority();
  const player = auth.player || {};
  const identity = auth.identity || {};
  const isLoggedIn = Boolean(auth.isLoggedIn);
  const isAdmin = Boolean(isLoggedIn && player.isAdmin);
  const clearanceLevel = typeof player.clearanceLevel === 'number' ? player.clearanceLevel : 1;
  const dgaVerified = Boolean(player.dgaVerified);

  const roles: AuraRole[] = ['citizen'];

  if (isLoggedIn) {
    if (isAdmin) {
      roles.unshift('admin');
    }
    const hasRegistrarMembership =
      Boolean(membershipSource(player, 'archivist')) ||
      Boolean(membershipSource(player, 'diplomat')) ||
      ((player.careers?.archivist?.rankIndex >= 2 || player.careers?.gov?.rankIndex >= 2) && clearanceLevel >= 3);
    if (hasRegistrarMembership || isAdmin) {
      if (!roles.includes('registrar')) roles.push('registrar');
    }

    const hasDgaAuthority =
      Boolean(membershipSource(player, 'dga')) ||
      (dgaVerified && clearanceLevel >= 3) ||
      isAdmin;
    if (hasDgaAuthority) {
      if (!roles.includes('dga')) roles.push('dga');
    }

    const hasMedicalAuthority =
      Boolean(membershipSource(player, 'medical')) ||
      isAdmin;
    if (hasMedicalAuthority) {
      if (!roles.includes('medical')) roles.push('medical');
    }

    const hasAcademicAuthority =
      Boolean(membershipSource(player, 'cyacademy')) ||
      isAdmin;
    if (hasAcademicAuthority) {
      if (!roles.includes('academic')) roles.push('academic');
    }
  }

  const primaryRole: AuraRole = roles.includes('admin')
    ? 'admin'
    : roles.includes('registrar')
    ? 'registrar'
    : roles.includes('dga')
    ? 'dga'
    : roles.includes('medical')
    ? 'medical'
    : roles.includes('academic')
    ? 'academic'
    : 'citizen';

  const roleLabels: Record<AuraRole, string> = {
    admin: 'Sovereign Registry Administrator',
    registrar: 'Orynvell Civic Registrar',
    dga: 'DGA / TRACE Authorized Investigator',
    medical: 'Faith Medical Clinical Officer',
    academic: 'Cyacademy Academic Officer',
    citizen: 'Standard Citizen Access',
  };

  return {
    isLoggedIn,
    isAdmin,
    clearanceLevel,
    dgaVerified,
    canonicalPersonId: identity.canonicalPersonId || null,
    citizenId: identity.citizenId || null,
    roles,
    primaryRole,
    roleLabel: roleLabels[primaryRole],
  };
}

export function isSelfRecord(person: Partial<CanonicalPerson> | null | undefined, actor: AuraActorContext): boolean {
  if (!person || !actor.isLoggedIn) return false;
  if (actor.canonicalPersonId && person.id === actor.canonicalPersonId) return true;
  if (actor.citizenId && (person.maid === actor.citizenId || person.legacyRecord === actor.citizenId)) return true;
  return false;
}

export function evaluateAuraRecordPermissions(
  person: Partial<CanonicalPerson> | null | undefined,
  actorOverride?: AuraActorContext
): AuraRecordPermissions {
  const actor = actorOverride ?? resolveAuraActor();
  const hasRole = (r: AuraRole) => actor.roles.includes(r);
  const isSelf = isSelfRecord(person, actor);
  const isRestricted = Boolean(person?.isRestricted);

  const canViewRestricted = hasRole('admin') || (hasRole('dga') && actor.clearanceLevel >= 3);
  if (isRestricted && !canViewRestricted) {
    return {
      canViewRecord: false,
      canViewRestrictedFields: false,
      canViewMedicalDetails: false,
      canViewForensicBiometrics: false,
      canEditCoreProfile: false,
      canEditMedicalOnly: false,
      canEditSelfContactOnly: false,
      canLinkRelationships: false,
      canConfirmMigration: false,
      editableFields: [],
      allowedDocumentIds: [],
      canExportFullPacket: false,
      restrictionReason: 'Access Restricted: DGA Level 3+ clearance or Sovereign Administrator authority is required for classified records.',
    };
  }

  const canEditCore = hasRole('admin') || (hasRole('registrar') && !isRestricted);
  const canEditMedical = hasRole('admin') || hasRole('medical');
  const canEditSecurity = hasRole('admin') || (hasRole('dga') && actor.clearanceLevel >= 4);
  const canEditSelf = isSelf && !isRestricted;

  const editableSet = new Set<string>();
  if (hasRole('admin')) {
    CORE_EDITABLE_FIELDS.forEach(f => editableSet.add(f));
  } else {
    if (hasRole('registrar') && !isRestricted) {
      REGISTRAR_EDITABLE_FIELDS.forEach(f => editableSet.add(f));
    }
    if (canEditMedical) {
      MEDICAL_EDITABLE_FIELDS.forEach(f => editableSet.add(f));
    }
    if (canEditSecurity) {
      DGA_EDITABLE_FIELDS.forEach(f => editableSet.add(f));
    }
    if (canEditSelf) {
      SELF_CONTACT_EDITABLE_FIELDS.forEach(f => editableSet.add(f));
    }
  }

  // Document permissions (1..9):
  // 1: Aura Citizen ID, 2: Aura Passport, 3: Birth Certificate, 4: 10-Print Biometrics,
  // 5: Investigative Profile, 6: Residency Record, 7: Physical ID Sheet, 8: Medical Summary, 9: Education & Service
  const docSet = new Set<number>([1, 6]);
  if (isSelf || hasRole('admin') || hasRole('registrar')) {
    [1, 2, 3, 6, 9].forEach(id => docSet.add(id));
  }
  if (hasRole('academic')) {
    [1, 2, 6, 9].forEach(id => docSet.add(id));
  }
  if (hasRole('medical') || isSelf) {
    [1, 8].forEach(id => docSet.add(id));
  }
  if (hasRole('dga')) {
    [1, 4, 5, 7].forEach(id => docSet.add(id));
  }
  if (hasRole('admin')) {
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(id => docSet.add(id));
  }

  const allowedDocumentIds = Array.from(docSet).sort((a, b) => a - b);
  const canExportFullPacket = hasRole('admin') || (hasRole('registrar') && hasRole('dga'));

  return {
    canViewRecord: true,
    canViewRestrictedFields: canViewRestricted,
    canViewMedicalDetails: hasRole('admin') || hasRole('medical') || hasRole('registrar') || isSelf,
    canViewForensicBiometrics: hasRole('admin') || hasRole('dga') || hasRole('registrar'),
    canEditCoreProfile: canEditCore,
    canEditMedicalOnly: !canEditCore && canEditMedical,
    canEditSelfContactOnly: !canEditCore && !canEditMedical && canEditSelf,
    canLinkRelationships: hasRole('admin') || hasRole('registrar') || (hasRole('dga') && actor.clearanceLevel >= 3),
    canConfirmMigration: hasRole('admin') || hasRole('registrar'),
    editableFields: Array.from(editableSet),
    allowedDocumentIds,
    canExportFullPacket,
  };
}

export function authorizeAuraAction(
  action: AuraAction,
  options?: {
    actor?: AuraActorContext;
    targetPerson?: Partial<CanonicalPerson> | null;
    requestedFields?: string[];
    documentId?: number;
  }
): { authorized: boolean; role: AuraRole; reason?: string; permittedFields?: string[] } {
  const actor = options?.actor ?? resolveAuraActor();
  const perms = evaluateAuraRecordPermissions(options?.targetPerson, actor);

  switch (action) {
    case 'lookup_public':
      return { authorized: true, role: actor.primaryRole };

    case 'lookup_restricted':
      if (!perms.canViewRestrictedFields) {
        return {
          authorized: false,
          role: actor.primaryRole,
          reason: perms.restrictionReason || 'Restricted record lookup requires DGA Level 3+ clearance or World Administrator authority.',
        };
      }
      return { authorized: true, role: actor.primaryRole };

    case 'register_person':
      if (actor.roles.includes('admin') || actor.roles.includes('registrar')) {
        return { authorized: true, role: actor.primaryRole };
      }
      return {
        authorized: false,
        role: actor.primaryRole,
        reason: 'Citizen registration requires Orynvell Civic Registrar authority or World Administrator privileges.',
      };

    case 'confirm_migration':
      if (perms.canConfirmMigration) {
        return { authorized: true, role: actor.primaryRole };
      }
      return {
        authorized: false,
        role: actor.primaryRole,
        reason: 'Confirming pending regional migrations requires Civic Registrar or World Administrator authorization.',
      };

    case 'link_relationships':
      if (perms.canLinkRelationships) {
        return { authorized: true, role: actor.primaryRole };
      }
      return {
        authorized: false,
        role: actor.primaryRole,
        reason: 'Linking canonical citizen relationships requires Civic Registrar, DGA Investigator (Clearance 3+), or World Administrator authority.',
      };

    case 'edit_identity_core':
    case 'edit_medical_record':
    case 'edit_security_clearance':
    case 'edit_self_contact': {
      if (!perms.canViewRecord) {
        return { authorized: false, role: actor.primaryRole, reason: perms.restrictionReason };
      }
      if (perms.editableFields.length === 0) {
        return {
          authorized: false,
          role: actor.primaryRole,
          reason: 'Your current role does not have edit permissions for this citizen record.',
        };
      }
      const requested = options?.requestedFields || [];
      const unauthorizedFields = requested.filter(f => !perms.editableFields.includes(f));
      if (unauthorizedFields.length > 0) {
        return {
          authorized: false,
          role: actor.primaryRole,
          reason: `Role '${actor.roleLabel}' is not authorized to modify fields: ${unauthorizedFields.join(', ')}.`,
          permittedFields: perms.editableFields,
        };
      }
      return { authorized: true, role: actor.primaryRole, permittedFields: perms.editableFields };
    }

    case 'issue_document': {
      if (!perms.canViewRecord) {
        return { authorized: false, role: actor.primaryRole, reason: perms.restrictionReason };
      }
      const docId = options?.documentId ?? 1;
      if (!perms.allowedDocumentIds.includes(docId)) {
        return {
          authorized: false,
          role: actor.primaryRole,
          reason: `Document ${String(docId).padStart(2, '0')} requires institutional authorization (DGA/TRACE for forensic/intel dossiers, Faith Medical for clinical charts, or Registrar for vital archives).`,
        };
      }
      return { authorized: true, role: actor.primaryRole };
    }

    case 'issue_full_packet': {
      if (!perms.canViewRecord) {
        return { authorized: false, role: actor.primaryRole, reason: perms.restrictionReason };
      }
      if (!perms.canExportFullPacket) {
        return {
          authorized: false,
          role: actor.primaryRole,
          reason: 'Exporting the complete 9-document sovereign packet (which includes classified DGA & forensic sheets) requires Sovereign Administrator or joint Registrar/DGA authorization.',
        };
      }
      return { authorized: true, role: actor.primaryRole };
    }

    default:
      return { authorized: false, role: actor.primaryRole, reason: 'Unrecognized AURA Registry action.' };
  }
}
