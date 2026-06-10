"use server";

import { mapAgendaEventToDailyAppointment } from "@/lib/agenda-events";
import {
  filterAvailableProfessionals,
  getCatalogProfessionalsByRole,
  isValidTimeRange,
  type AvailabilitySearchParams,
  type AvailableProfessional,
} from "@/lib/agenda-availability";
import type { DailyAppointment } from "@/lib/dashboard-mock-data";
import type { ProfessionalRole } from "@/lib/professionals-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type CreateAppointmentInput = {
  patientName: string;
  professionalName: string;
  professionalUserId?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
};

export async function searchAvailableProfessionalsAction(
  input: AvailabilitySearchParams
): Promise<ActionResult<{ professionals: AvailableProfessional[] }>> {
  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      error: "O horário final deve ser posterior ao horário inicial.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    const catalogProfessionals = getCatalogProfessionalsByRole(input.role);
    return {
      success: true,
      data: { professionals: catalogProfessionals },
    };
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, full_name, professional_role")
    .eq("professional_role", input.role)
    .in("profile", ["at", "supervisor"])
    .order("full_name");

  if (profilesError) {
    return { success: false, error: profilesError.message };
  }

  const dbProfessionals: AvailableProfessional[] = (profileRows ?? []).map(
    (row) => ({
      id: row.id,
      fullName: row.full_name,
      role: row.professional_role as ProfessionalRole,
      source: "database",
    })
  );

  const professionals =
    dbProfessionals.length > 0
      ? dbProfessionals
      : getCatalogProfessionalsByRole(input.role);

  const { data: eventRows, error: eventsError } = await supabase
    .from("agenda_events")
    .select(
      "professional_name, professional_user_id, start_time, end_time, status"
    )
    .eq("event_date", input.date)
    .neq("status", "cancelado");

  if (eventsError) {
    return { success: false, error: eventsError.message };
  }

  const busyEvents = (eventRows ?? []).map((event) => ({
    professionalName: event.professional_name,
    professionalUserId: event.professional_user_id,
    startTime: event.start_time,
    endTime: event.end_time,
  }));

  const availableProfessionals = filterAvailableProfessionals(
    professionals,
    busyEvents,
    {
      startTime: input.startTime,
      endTime: input.endTime,
    }
  );

  return {
    success: true,
    data: { professionals: availableProfessionals },
  };
}

export async function createAppointmentAction(
  input: CreateAppointmentInput
): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  const patientName = input.patientName.trim();

  if (!patientName) {
    return { success: false, error: "Informe o nome do paciente." };
  }

  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      error: "O horário final deve ser posterior ao horário inicial.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  let professionalUserId: string | null = null;

  if (
    input.professionalUserId &&
    !input.professionalUserId.startsWith("catalog:")
  ) {
    professionalUserId = input.professionalUserId;
  } else {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .ilike("full_name", input.professionalName)
      .in("profile", ["at", "supervisor"])
      .maybeSingle();

    professionalUserId = profile?.id ?? null;
  }

  const appointmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const payload = {
    id: appointmentId,
    patient_name: patientName,
    professional_name: input.professionalName,
    professional_user_id: professionalUserId,
    event_date: input.eventDate,
    start_time: input.startTime,
    end_time: input.endTime,
    status: "agendado" as const,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("agenda_events")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Falha ao criar agendamento." };
  }

  return {
    success: true,
    data: { appointment: mapAgendaEventToDailyAppointment(data) },
  };
}
