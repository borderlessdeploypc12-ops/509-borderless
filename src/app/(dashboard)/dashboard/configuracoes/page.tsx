import type { Metadata } from "next";

import { getClinicSettingsAction } from "@/app/actions/clinic-settings-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { ClinicSettingsPageView } from "@/components/settings/clinic-settings-page-view";
import { requireAdmin } from "@/lib/auth-guard";
import {
  CLINIC_SETTINGS_ID,
  type ClinicSettingsPublic,
} from "@/lib/clinic-settings";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações globais da clínica.",
};

const emptySettings: ClinicSettingsPublic = {
  id: CLINIC_SETTINGS_ID,
  nomeClinica: "Nurse Care",
  cnpj: null,
  enderecoCompleto: null,
  logoUrl: null,
  stripeApiKeyMasked: null,
  mercadoPagoApiKeyMasked: null,
  hasStripeApiKey: false,
  hasMercadoPagoApiKey: false,
};

export default async function ConfiguracoesPage() {
  await requireAdmin();

  const result = await getClinicSettingsAction();

  if (!result.success) {
    return (
      <AccessDeniedCard
        title="Configurações indisponíveis"
        description={result.error}
      />
    );
  }

  return (
    <ClinicSettingsPageView
      initialSettings={result.data ?? emptySettings}
    />
  );
}
