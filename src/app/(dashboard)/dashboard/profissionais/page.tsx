import type { Metadata } from "next";

import { TeamManagement } from "@/components/team/team-management";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Profissionais",
  description: "Cadastro e gestão da equipe clínica.",
};

export default async function ProfissionaisPage() {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Profissionais e equipe
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre funcionários, defina perfis de acesso e cargos clínicos.
        </p>
      </section>

      <TeamManagement />
    </div>
  );
}
