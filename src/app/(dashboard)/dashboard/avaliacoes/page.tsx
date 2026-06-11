import type { Metadata } from "next";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Avaliações",
  description: "Instrumentos de avaliação ABA.",
};

export default async function AvaliacoesPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold sm:text-2xl">Avaliações</h1>
      <p className="text-sm text-muted-foreground">
        Instrumentos de avaliação e registros clínicos ABA.
      </p>
    </div>
  );
}
