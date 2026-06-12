"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClinicalEvolutionRecordRow } from "@/lib/supabase/database.types";

export type SaveClinicalEvolutionInput = {
  patientId: string;
  patientName: string;
  sessionDate: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
  professionalCouncil?: string;
  status?: "draft" | "finalized";
};

export type SaveClinicalEvolutionResult = {
  success: boolean;
  error?: string;
  record?: ClinicalEvolutionRecordRow;
};

export type LoadClinicalEvolutionResult = {
  success: boolean;
  error?: string;
  record: ClinicalEvolutionRecordRow | null;
};

export type ListDraftsResult = {
  success: boolean;
  error?: string;
  drafts: ClinicalEvolutionRecordRow[];
};

export async function saveClinicalEvolutionAction(
  input: SaveClinicalEvolutionInput
): Promise<SaveClinicalEvolutionResult> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
    };
  }

  const payload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    session_date: input.sessionDate,
    content_html: input.contentHtml,
    status: input.status ?? "draft",
    professional_name: input.professionalName,
    professional_role: input.professionalRole,
    professional_council: input.professionalCouncil ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .upsert(payload, {
      onConflict: "patient_id,session_date,professional_name",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    record: data,
  };
}

export async function loadClinicalEvolutionAction(
  patientId: string,
  sessionDate: string,
  professionalName: string
): Promise<LoadClinicalEvolutionResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      record: null,
    };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("session_date", sessionDate)
    .eq("professional_name", professionalName)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message,
      record: null,
    };
  }

  return {
    success: true,
    record: data,
  };
}

export async function listClinicalEvolutionDraftsAction(
  professionalName: string
): Promise<ListDraftsResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      drafts: [],
    };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("professional_name", professionalName)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    return {
      success: false,
      error: error.message,
      drafts: [],
    };
  }

  return {
    success: true,
    drafts: data ?? [],
  };
}
