"use client";

import type { ReactNode } from "react";

import { useUserRole } from "@/hooks/use-user-role";
import type { Permission } from "@/lib/rbac";

type PermissionGateProps = {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = useUserRole();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}
