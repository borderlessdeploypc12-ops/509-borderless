import type { Metadata } from "next";

import { AuditLogGuard } from "@/components/dashboard/audit-log-guard";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Log de Auditoria",
  description:
    "Consulta de rastreabilidade das alterações realizadas na agenda clínica.",
};

export default async function AuditoriaPage() {
  await requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW);

  return <AuditLogGuard />;
}
