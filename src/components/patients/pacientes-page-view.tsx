"use client";

import { PatientList } from "@/components/patients/patient-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { PatientRow } from "@/lib/supabase/database.types";

type PacientesPageViewProps = {
  patients: PatientRow[];
  error?: string;
};

export function PacientesPageView({ patients, error }: PacientesPageViewProps) {
  return (
    <PageContainer>
      <DashboardPageHeader
        title="Aprendizes"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Aprendizes" },
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <PatientList patients={patients} />
      )}
    </PageContainer>
  );
}
