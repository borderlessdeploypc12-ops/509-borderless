import type { Metadata } from "next";

import { EvolucaoPageView } from "@/components/clinical-evolution/evolucao-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Evolução Clínica",
  description:
    "Registro narrativo de evolução clínica com rascunhos e geração de relatório em PDF.",
};

export default async function EvolucaoClinicaPage() {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  return <EvolucaoPageView />;
}
