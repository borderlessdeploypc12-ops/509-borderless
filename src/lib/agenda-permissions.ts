import type { UserProfile } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";

export function isAgendaReadOnly(
  profile: UserProfile,
  isMaster = false
) {
  return !hasPermission(profile, PERMISSIONS.AGENDA_MANAGE, isMaster);
}

export function canDragAppointments(
  profile: UserProfile,
  isMaster = false
) {
  return hasPermission(profile, PERMISSIONS.AGENDA_MANAGE, isMaster);
}

export function canManageAgenda(profile: UserProfile, isMaster = false) {
  return hasPermission(profile, PERMISSIONS.AGENDA_MANAGE, isMaster);
}

export function canSearchAgenda(profile: UserProfile, isMaster = false) {
  return hasPermission(profile, PERMISSIONS.AGENDA_SEARCH, isMaster);
}

export function canViewAuditLogs(profile: UserProfile, isMaster = false) {
  return hasPermission(profile, PERMISSIONS.AUDIT_LOGS_VIEW, isMaster);
}

export function canViewClinicalEvolution(
  profile: UserProfile,
  isMaster = false
) {
  return hasPermission(
    profile,
    PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
    isMaster
  );
}

export function canManageClinicalEvolution(
  profile: UserProfile,
  isMaster = false
) {
  return hasPermission(
    profile,
    PERMISSIONS.CLINICAL_EVOLUTION_MANAGE,
    isMaster
  );
}

export function canViewReports(profile: UserProfile, isMaster = false) {
  return hasPermission(profile, PERMISSIONS.REPORTS_VIEW, isMaster);
}

export function canViewPatients(profile: UserProfile, isMaster = false) {
  return hasPermission(profile, PERMISSIONS.PATIENTS_VIEW, isMaster);
}

export function canUseInternalMessaging(
  profile: UserProfile,
  isMaster = false
) {
  return hasPermission(profile, PERMISSIONS.INTERNAL_MESSAGING, isMaster);
}

export function canForceAppointment(
  profile: UserProfile,
  isMaster = false
) {
  return hasPermission(profile, PERMISSIONS.AGENDA_FORCE, isMaster);
}
