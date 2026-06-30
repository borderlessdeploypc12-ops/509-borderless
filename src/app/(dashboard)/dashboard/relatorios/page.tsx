import type { Metadata } from "next";

import { ClinicalReportsPageView } from "@/components/clinical-reports/clinical-reports-page-view";
import { requireSupervisorOrAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Indicadores Clínicos",
  description: "Indicadores e relatórios clínicos para supervisão.",
};

export default async function RelatoriosPage() {
  await requireSupervisorOrAdmin();

  return <ClinicalReportsPageView />;
}
