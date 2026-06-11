import type { Metadata } from "next";
import { Suspense } from "react";

import { AvailableAgendaSearch } from "@/components/dashboard/available-agenda-search";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Busca de Agenda",
  description: "Encontre profissionais disponíveis para agendamento.",
};

export default async function AvailableAgendaSearchPage() {
  await requirePermission(PERMISSIONS.AGENDA_SEARCH);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando busca...</p>}>
        <AvailableAgendaSearch />
      </Suspense>
    </div>
  );
}
