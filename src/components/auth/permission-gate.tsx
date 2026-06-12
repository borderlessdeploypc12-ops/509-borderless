"use client";

import type { ReactNode } from "react";

import { ProtectedComponent } from "@/components/auth/protected-component";
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
  return (
    <ProtectedComponent permission={permission} fallback={fallback}>
      {children}
    </ProtectedComponent>
  );
}
