import type { UserProfile } from "@/lib/auth";

export function isAgendaReadOnly(profile: UserProfile) {
  return profile === "at";
}

export function canDragAppointments(profile: UserProfile) {
  return !isAgendaReadOnly(profile);
}

export function canManageAgenda(profile: UserProfile) {
  return !isAgendaReadOnly(profile);
}

export function canViewAuditLogs(profile: UserProfile) {
  return profile === "administracao";
}

export function canManageClinicalEvolution(profile: UserProfile) {
  return (
    profile === "at" ||
    profile === "supervisor" ||
    profile === "administracao"
  );
}
