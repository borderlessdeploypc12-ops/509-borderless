"use client";

import type { ReactNode } from "react";

import { useUserRole } from "@/hooks/use-user-role";
import type { Permission, Role } from "@/lib/rbac";
import { normalizeRole } from "@/lib/rbac";

type ProtectedComponentProps = {
  children: ReactNode;
  permission?: Permission;
  roles?: readonly Role[];
  fallback?: ReactNode;
};

export function ProtectedComponent({
  children,
  permission,
  roles,
  fallback = null,
}: ProtectedComponentProps) {
  const { hasPermission, role, isMaster } = useUserRole();

  if (isMaster) {
    return children;
  }

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (roles && !roles.includes(normalizeRole(role))) {
    return fallback;
  }

  return children;
}
