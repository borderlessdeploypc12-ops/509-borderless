import { redirect } from "next/navigation";

import { requireServerUserSession } from "@/lib/auth-server";
import {
  canAccessRoute,
  getAccessDeniedRedirectPath,
  hasPermission,
  type Permission,
} from "@/lib/rbac";

export async function requirePermission(permission: Permission) {
  const session = await requireServerUserSession();

  if (!hasPermission(session.profile, permission, session.isMaster)) {
    redirect(getAccessDeniedRedirectPath(session.profile));
  }

  return session;
}

export async function requireRouteAccess(pathname: string) {
  const session = await requireServerUserSession();

  if (!canAccessRoute(pathname, session.profile, session.isMaster)) {
    redirect(getAccessDeniedRedirectPath(session.profile));
  }

  return session;
}
