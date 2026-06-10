"use client";

import { createContext, useContext, useMemo } from "react";

import {
  canDragAppointments,
  canManageAgenda,
  canManageClinicalEvolution,
  canViewAuditLogs,
  isAgendaReadOnly,
} from "@/lib/agenda-permissions";
import type { AppUserSession } from "@/lib/user-profile";

type UserRoleContextValue = AppUserSession & {
  userName: string;
  isAgendaReadOnly: boolean;
  canDragAppointments: boolean;
  canManageAgenda: boolean;
  canViewAuditLogs: boolean;
  canManageClinicalEvolution: boolean;
};

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

type UserRoleProviderProps = {
  children: React.ReactNode;
  session: AppUserSession;
};

export function UserRoleProvider({ children, session }: UserRoleProviderProps) {
  const value = useMemo<UserRoleContextValue>(
    () => ({
      ...session,
      userName: session.fullName,
      isAgendaReadOnly: isAgendaReadOnly(session.profile),
      canDragAppointments: canDragAppointments(session.profile),
      canManageAgenda: canManageAgenda(session.profile),
      canViewAuditLogs:
        canViewAuditLogs(session.profile) || session.isMaster,
      canManageClinicalEvolution: canManageClinicalEvolution(session.profile),
    }),
    [session]
  );

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
