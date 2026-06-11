import type { Metadata } from "next";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Preferências da clínica.",
};

export default async function ConfiguracoesPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold sm:text-2xl">Configurações</h1>
      <p className="text-sm text-muted-foreground">
        Preferências da clínica e da equipe.
      </p>
    </div>
  );
}
