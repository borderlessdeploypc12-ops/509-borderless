"use client";

import { AuditLogGuard } from "@/components/dashboard/audit-log-guard";
import { PageContainer } from "@/components/layout/page-container";

export function AuditoriaPageView() {
  return (
    <PageContainer size="wide">
      <AuditLogGuard />
    </PageContainer>
  );
}
