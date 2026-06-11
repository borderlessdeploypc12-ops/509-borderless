import type { Metadata } from "next";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Indicadores e relatórios clínicos.",
};

export default async function RelatoriosPage() {
  await requirePermission(PERMISSIONS.REPORTS_VIEW);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold sm:text-2xl">Relatórios</h1>
      <p className="text-sm text-muted-foreground">
        Indicadores de desempenho e relatórios para supervisão clínica.
      </p>
    </div>
  );
}
