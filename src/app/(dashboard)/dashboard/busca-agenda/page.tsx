import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AvailableAgendaSearch } from "@/components/dashboard/available-agenda-search";
import { canManageAgenda } from "@/lib/agenda-permissions";
import { requireServerUserSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Busca de Agenda",
  description: "Encontre profissionais disponíveis para agendamento.",
};

export default async function AvailableAgendaSearchPage() {
  const session = await requireServerUserSession();

  if (!canManageAgenda(session.profile)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando busca...</p>}>
        <AvailableAgendaSearch />
      </Suspense>
    </div>
  );
}
