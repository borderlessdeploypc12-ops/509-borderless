import type { Metadata } from "next";

import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Painel de indicadores clínicos e desempenho terapêutico.",
};

export default async function DashboardPage() {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  return <DashboardHome />;
}
