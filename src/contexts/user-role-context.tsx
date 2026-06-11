"use client";

import { createContext, useContext, useMemo } from "react";

import {
  canDragAppointments,
  canManageAgenda,
  canForceAppointment,
  canManageClinicalEvolution,
  canSearchAgenda,
  canUseInternalMessaging,
  canViewAuditLogs,
  canViewClinicalEvolution,
  canViewPatients,
  canViewReports,
  isAgendaReadOnly,
} from "@/lib/agenda-permissions";
import {
  getPermissionsForRole,
  hasPermission,
  isClinicalRole,
  isReceptionOnlyRole,
  normalizeRole,
  type Permission,
} from "@/lib/rbac";
import type { AppUserSession } from "@/lib/user-profile";

type UserRoleContextValue = AppUserSession & {
  userName: string;
  role: ReturnType<typeof normalizeRole>;
  isAgendaReadOnly: boolean;
  canDragAppointments: boolean;
  canManageAgenda: boolean;
  canForceAppointment: boolean;
  canSearchAgenda: boolean;
  canViewAuditLogs: boolean;
  canViewClinicalEvolution: boolean;
  canManageClinicalEvolution: boolean;
  canViewReports: boolean;
  canViewPatients: boolean;
  canUseInternalMessaging: boolean;
  isReceptionOnly: boolean;
  isClinicalStaff: boolean;
  hasPermission: (permission: Permission) => boolean;
  permissions: readonly Permission[];
};

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

type UserRoleProviderProps = {
  children: React.ReactNode;
  session: AppUserSession;
};

export function UserRoleProvider({ children, session }: UserRoleProviderProps) {
  const value = useMemo<UserRoleContextValue>(() => {
    const role = normalizeRole(session.profile);
    const checkPermission = (permission: Permission) =>
      hasPermission(session.profile, permission, session.isMaster);

    return {
      ...session,
      role,
      userName: session.fullName,
      isAgendaReadOnly: isAgendaReadOnly(session.profile, session.isMaster),
      canDragAppointments: canDragAppointments(
        session.profile,
        session.isMaster
      ),
      canManageAgenda: canManageAgenda(session.profile, session.isMaster),
      canForceAppointment: canForceAppointment(
        session.profile,
        session.isMaster
      ),
      canSearchAgenda: canSearchAgenda(session.profile, session.isMaster),
      canViewAuditLogs: canViewAuditLogs(session.profile, session.isMaster),
      canViewClinicalEvolution: canViewClinicalEvolution(
        session.profile,
        session.isMaster
      ),
      canManageClinicalEvolution: canManageClinicalEvolution(
        session.profile,
        session.isMaster
      ),
      canViewReports: canViewReports(session.profile, session.isMaster),
      canViewPatients: canViewPatients(session.profile, session.isMaster),
      canUseInternalMessaging: canUseInternalMessaging(
        session.profile,
        session.isMaster
      ),
      isReceptionOnly: isReceptionOnlyRole(session.profile),
      isClinicalStaff: isClinicalRole(session.profile),
      hasPermission: checkPermission,
      permissions: getPermissionsForRole(session.profile, session.isMaster),
    };
  }, [session]);

  return (
    <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);

  if (!context) {
    throw new Error("useUserRole deve ser usado dentro de UserRoleProvider.");
  }

  return context;
}
