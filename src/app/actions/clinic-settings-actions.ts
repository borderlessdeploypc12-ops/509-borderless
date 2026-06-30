"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  CLINIC_LOGO_ALLOWED_MIME_TYPES,
  CLINIC_LOGO_MAX_BYTES,
  CLINIC_LOGO_STORAGE_BUCKET,
  CLINIC_LOGO_STORAGE_PATH,
  CLINIC_SETTINGS_ID,
  formatCnpjDisplay,
  getLogoFileExtension,
  mapClinicSettingsRow,
  normalizeCnpj,
  normalizeOptionalText,
  type ClinicSettingsPublic,
} from "@/lib/clinic-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClinicSettingsRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

async function loadClinicSettingsRow() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase não configurado." as const, row: null };
  }

  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", CLINIC_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    return { error: error.message, row: null };
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("clinic_settings")
      .insert({ id: CLINIC_SETTINGS_ID, nome_clinica: "Nurse Care" })
      .select("*")
      .single();

    if (insertError) {
      return { error: insertError.message, row: null };
    }

    return { error: null, row: inserted as ClinicSettingsRow };
  }

  return { error: null, row: data as ClinicSettingsRow };
}

export async function getClinicSettingsAction(): Promise<
  ActionResult<ClinicSettingsPublic>
> {
  await requireAdmin();

  const { error, row } = await loadClinicSettingsRow();

  if (error || !row) {
    return { success: false, error: error ?? "Configurações não encontradas." };
  }

  return {
    success: true,
    data: mapClinicSettingsRow(row),
  };
}

export type UpsertInstitutionalSettingsInput = {
  nomeClinica: string;
  cnpj?: string;
  enderecoCompleto?: string;
};

export async function upsertInstitutionalSettingsAction(
  input: UpsertInstitutionalSettingsInput
): Promise<ActionResult<ClinicSettingsPublic>> {
  await requireAdmin();

  const nomeClinica = input.nomeClinica.trim();

  if (!nomeClinica) {
    return { success: false, error: "Informe o nome da clínica." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    id: CLINIC_SETTINGS_ID,
    nome_clinica: nomeClinica,
    cnpj: normalizeCnpj(input.cnpj),
    endereco_completo: normalizeOptionalText(input.enderecoCompleto),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clinic_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Dados institucionais atualizados com sucesso.",
    data: mapClinicSettingsRow(data as ClinicSettingsRow),
  };
}

export type UpsertPaymentSettingsInput = {
  stripeApiKey?: string;
  mercadoPagoApiKey?: string;
};

export async function upsertPaymentSettingsAction(
  input: UpsertPaymentSettingsInput
): Promise<ActionResult<ClinicSettingsPublic>> {
  await requireAdmin();

  const { error: loadError, row: current } = await loadClinicSettingsRow();

  if (loadError || !current) {
    return {
      success: false,
      error: loadError ?? "Configurações não encontradas.",
    };
  }

  const stripeApiKey = input.stripeApiKey?.trim();
  const mercadoPagoApiKey = input.mercadoPagoApiKey?.trim();

  if (!stripeApiKey && !mercadoPagoApiKey) {
    return {
      success: false,
      error: "Informe ao menos uma chave de API para atualizar.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload: ClinicSettingsRow = {
    ...current,
    stripe_api_key: stripeApiKey || current.stripe_api_key,
    mercado_pago_api_key: mercadoPagoApiKey || current.mercado_pago_api_key,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clinic_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Integrações de pagamento atualizadas com sucesso.",
    data: mapClinicSettingsRow(data as ClinicSettingsRow),
  };
}

export async function uploadClinicLogoAction(
  formData: FormData
): Promise<ActionResult<ClinicSettingsPublic>> {
  await requireAdmin();

  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione um arquivo de imagem válido." };
  }

  if (file.size > CLINIC_LOGO_MAX_BYTES) {
    return {
      success: false,
      error: "A logo deve ter no máximo 5 MB.",
    };
  }

  if (
    !CLINIC_LOGO_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof CLINIC_LOGO_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      success: false,
      error: "Formato inválido. Use PNG, JPG, WEBP ou SVG.",
    };
  }

  const extension = getLogoFileExtension(file.type);

  if (!extension) {
    return { success: false, error: "Formato de imagem não suportado." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const storagePath = `${CLINIC_LOGO_STORAGE_PATH}.${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CLINIC_LOGO_STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CLINIC_LOGO_STORAGE_BUCKET).getPublicUrl(storagePath);

  const logoUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: loadError, row: current } = await loadClinicSettingsRow();

  if (loadError || !current) {
    return {
      success: false,
      error: loadError ?? "Configurações não encontradas.",
    };
  }

  const { data, error } = await supabase
    .from("clinic_settings")
    .upsert(
      {
        ...current,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Logo da clínica atualizada com sucesso.",
    data: mapClinicSettingsRow(data as ClinicSettingsRow),
  };
}

export async function getClinicSettingsForDisplayAction(): Promise<
  ActionResult<{
    nomeClinica: string;
    cnpjFormatted: string;
    enderecoCompleto: string;
    logoUrl: string | null;
  }>
> {
  const result = await getClinicSettingsAction();

  if (!result.success) {
    return {
      success: false,
      error: "error" in result ? result.error : "Erro ao carregar.",
    };
  }

  if (!result.data) {
    return { success: false, error: "Configurações não encontradas." };
  }

  return {
    success: true,
    data: {
      nomeClinica: result.data.nomeClinica,
      cnpjFormatted: formatCnpjDisplay(result.data.cnpj),
      enderecoCompleto: result.data.enderecoCompleto ?? "",
      logoUrl: result.data.logoUrl,
    },
  };
}
