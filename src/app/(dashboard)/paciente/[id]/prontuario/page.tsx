import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPatientRecordAction } from "@/app/actions/patient-record-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { PatientRecordPageView } from "@/components/patient-record/patient-record-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

type PatientRecordPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Prontuário do paciente",
  description: "Prontuário individual com dados cadastrais, evoluções e documentos.",
};

export default async function PatientRecordPage({
  params,
}: PatientRecordPageProps) {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const { id } = await params;
  const result = await getPatientRecordAction(id);

  if (!result.success) {
    if (result.error === "Paciente não encontrado.") {
      notFound();
    }

    return (
      <AccessDeniedCard
        title="Prontuário indisponível"
        description={result.error}
      />
    );
  }

  return <PatientRecordPageView record={result.data!} />;
}
