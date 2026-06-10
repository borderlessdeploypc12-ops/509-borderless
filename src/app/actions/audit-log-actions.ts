"use server";

import type { AuditActor, CreateAuditLogInput } from "@/lib/audit-log";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AgendaAuditLogRow } from "@/lib/supabase/database.types";

export type AuditLogFilters = {
  startDate?: string;
  endDate?: string;
  patientName?: string;
};

export type PersistAuditLogsResult = {
  success: boolean;
  error?: string;
  persistedCount: number;
};

export type FetchAuditLogsResult = {
  success: boolean;
  error?: string;
  logs: AgendaAuditLogRow[];
};

function mapLogToInsert(log: CreateAuditLogInput, actor: AuditActor) {
  return {
    performed_at: new Date().toISOString(),
    user_name: actor.userName,
    user_profile: actor.displayRole,
    action_label: log.actionLabel,
    patient_name: log.patientName,
    from_description: log.fromDescription,
    to_description: log.toDescription,
    appointment_id: log.appointmentId ?? null,
    metadata: {
      profile: actor.userProfile,
      ...(log.metadata ?? {}),
    },
  };
}

export async function persistAuditLogsAction(
  actor: AuditActor,
  logs: CreateAuditLogInput[]
): Promise<PersistAuditLogsResult> {
  if (logs.length === 0) {
    return { success: true, persistedCount: 0 };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase não configurado. Defina as variáveis de ambiente para persistir o log de auditoria.",
      persistedCount: 0,
    };
  }

  const payload = logs.map((log) => mapLogToInsert(log, actor));
  const { error } = await supabase.from("agenda_audit_logs").insert(payload);

  if (error) {
    return {
      success: false,
      error: error.message,
      persistedCount: 0,
    };
  }

  return {
    success: true,
    persistedCount: logs.length,
  };
}

export async function fetchAuditLogsAction(
  filters: AuditLogFilters = {}
): Promise<FetchAuditLogsResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase não configurado. Defina as variáveis de ambiente para consultar o log de auditoria.",
      logs: [],
    };
  }

  let query = supabase
    .from("agenda_audit_logs")
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(200);

  if (filters.startDate) {
    query = query.gte("performed_at", `${filters.startDate}T00:00:00.000Z`);
  }

  if (filters.endDate) {
    query = query.lte("performed_at", `${filters.endDate}T23:59:59.999Z`);
  }

  if (filters.patientName?.trim()) {
    query = query.ilike("patient_name", `%${filters.patientName.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      error: error.message,
      logs: [],
    };
  }

  return {
    success: true,
    logs: data ?? [],
  };
}
