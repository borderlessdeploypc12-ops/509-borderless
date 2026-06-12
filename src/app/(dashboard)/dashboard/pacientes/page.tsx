import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { PacientesPageView } from "@/components/patients/pacientes-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Aprendizes",
  description: "Cadastro e acompanhamento de aprendizes.",
};

export default async function PacientesPage() {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const result = await listPatientsAction();

  return (
    <PacientesPageView
      patients={result.success ? (result.data?.patients ?? []) : []}
      error={result.success ? undefined : result.error}
    />
  );
}
