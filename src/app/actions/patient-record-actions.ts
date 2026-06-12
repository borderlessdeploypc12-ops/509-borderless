"use server";

import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AgendaEventRow,
  ClinicalEvolutionRecordRow,
  EvaluationRow,
  PatientDocumentRow,
  PatientRow,
  TherapeuticPlanRow,
} from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type PatientRecordData = {
  patient: PatientRow;
  evolutions: ClinicalEvolutionRecordRow[];
  evaluations: EvaluationRow[];
  therapeuticPlans: TherapeuticPlanRow[];
  documents: PatientDocumentRow[];
  attendances: AgendaEventRow[];
};

export async function listPatientsAction(): Promise<
  ActionResult<{ patients: PatientRow[] }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("status", "active")
    .order("full_name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { patients: data ?? [] } };
}

export async function getPatientRecordAction(
  patientId: string
): Promise<ActionResult<PatientRecordData>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return { success: false, error: patientError.message };
  }

  if (!patient) {
    return { success: false, error: "Paciente não encontrado." };
  }

  const [
    evolutionsResult,
    evaluationsResult,
    plansResult,
    documentsResult,
    attendancesResult,
  ] = await Promise.all([
    supabase
      .from("clinical_evolution_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false }),
    supabase
      .from("evaluations")
      .select("*")
      .eq("patient_id", patientId)
      .order("evaluation_date", { ascending: false }),
    supabase
      .from("therapeutic_plans")
      .select("*")
      .eq("patient_id", patientId)
      .order("start_date", { ascending: false }),
    supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("agenda_events")
      .select("*")
      .eq("patient_id", patientId)
      .order("event_date", { ascending: false })
      .limit(50),
  ]);

  if (evolutionsResult.error) {
    return { success: false, error: evolutionsResult.error.message };
  }

  if (evaluationsResult.error) {
    return { success: false, error: evaluationsResult.error.message };
  }

  if (plansResult.error) {
    return { success: false, error: plansResult.error.message };
  }

  if (documentsResult.error) {
    return { success: false, error: documentsResult.error.message };
  }

  if (attendancesResult.error) {
    return { success: false, error: attendancesResult.error.message };
  }

  return {
    success: true,
    data: {
      patient,
      evolutions: evolutionsResult.data ?? [],
      evaluations: evaluationsResult.data ?? [],
      therapeuticPlans: plansResult.data ?? [],
      documents: documentsResult.data ?? [],
      attendances: attendancesResult.data ?? [],
    },
  };
}

export type SavePatientEvolutionInput = {
  patientId: string;
  patientName: string;
  sessionDate: string;
  contentHtml: string;
  status?: "draft" | "finalized";
};

export async function savePatientEvolutionAction(
  input: SavePatientEvolutionInput
): Promise<ActionResult<{ record: ClinicalEvolutionRecordRow }>> {
  const session = await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    session_date: input.sessionDate,
    content_html: input.contentHtml,
    status: input.status ?? "draft",
    professional_name: session.fullName,
    professional_role: session.displayRole,
    professional_council: session.professionalCouncil,
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
    return { success: false, error: error.message };
  }

  return { success: true, data: { record: data } };
}

export async function loadPatientEvolutionAction(
  patientId: string,
  sessionDate: string
): Promise<ActionResult<{ record: ClinicalEvolutionRecordRow | null }>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("session_date", sessionDate)
    .eq("professional_name", session.fullName)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { record: data } };
}
