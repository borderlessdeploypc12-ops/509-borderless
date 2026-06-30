export const CLINIC_SETTINGS_ID = "00000000-0000-4000-8000-000000000001";

export const CLINIC_LOGO_STORAGE_BUCKET = "clinic-assets";

export const CLINIC_LOGO_STORAGE_PATH = "logos/clinic-logo";

export const CLINIC_LOGO_MAX_BYTES = 5 * 1024 * 1024;

export const CLINIC_LOGO_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export type ClinicSettingsPublic = {
  id: string;
  nomeClinica: string;
  cnpj: string | null;
  enderecoCompleto: string | null;
  logoUrl: string | null;
  stripeApiKeyMasked: string | null;
  mercadoPagoApiKeyMasked: string | null;
  hasStripeApiKey: boolean;
  hasMercadoPagoApiKey: boolean;
};

export function maskSecretKey(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= 4) {
    return "••••";
  }

  const visibleSuffix = normalized.slice(-4);
  return `••••••••${visibleSuffix}`;
}

export function normalizeOptionalText(value: string | undefined | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeCnpj(value: string | undefined | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function formatCnpjDisplay(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (digits.length !== 14) {
    return value ?? "";
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

export function getLogoFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return null;
  }
}

export function mapClinicSettingsRow(row: {
  id: string;
  nome_clinica: string;
  cnpj: string | null;
  endereco_completo: string | null;
  logo_url: string | null;
  stripe_api_key: string | null;
  mercado_pago_api_key: string | null;
}): ClinicSettingsPublic {
  return {
    id: row.id,
    nomeClinica: row.nome_clinica,
    cnpj: row.cnpj,
    enderecoCompleto: row.endereco_completo,
    logoUrl: row.logo_url,
    stripeApiKeyMasked: maskSecretKey(row.stripe_api_key),
    mercadoPagoApiKeyMasked: maskSecretKey(row.mercado_pago_api_key),
    hasStripeApiKey: Boolean(row.stripe_api_key?.trim()),
    hasMercadoPagoApiKey: Boolean(row.mercado_pago_api_key?.trim()),
  };
}
