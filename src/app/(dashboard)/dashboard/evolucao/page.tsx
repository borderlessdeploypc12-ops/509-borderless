import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { EvolucaoPageView } from "@/components/clinical-evolution/evolucao-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Evolução Clínica",
  description:
    "Registro narrativo de evolução clínica com rascunhos e geração de relatório em PDF.",
};

export default async function EvolucaoClinicaPage() {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <EvolucaoPageView patients={patients} />;
}
