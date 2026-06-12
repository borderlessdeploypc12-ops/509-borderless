import type { Metadata } from "next";

import { AgendaPageView } from "@/components/dashboard/agenda-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda diária de atendimentos da clínica.",
};

export default async function AgendaPage() {
  await requirePermission(PERMISSIONS.AGENDA_VIEW);

  return <AgendaPageView />;
}
