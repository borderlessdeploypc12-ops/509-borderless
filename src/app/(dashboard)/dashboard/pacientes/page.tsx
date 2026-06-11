import type { Metadata } from "next";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Cadastro e acompanhamento de pacientes.",
};

export default async function PacientesPage() {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold sm:text-2xl">
        Pacientes / Aprendizes
      </h1>
      <p className="text-sm text-muted-foreground">
        Cadastro e acompanhamento de evolução terapêutica.
      </p>
    </div>
  );
}
