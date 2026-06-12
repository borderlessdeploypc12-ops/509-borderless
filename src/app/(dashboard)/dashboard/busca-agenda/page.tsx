import type { Metadata } from "next";

import { BuscaAgendaPageView } from "@/components/dashboard/busca-agenda-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Busca de Agenda",
  description: "Encontre profissionais disponíveis para agendamento.",
};

export default async function AvailableAgendaSearchPage() {
  await requirePermission(PERMISSIONS.AGENDA_SEARCH);

  return <BuscaAgendaPageView />;
}
