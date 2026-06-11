import type { SupabaseClient } from "@supabase/supabase-js";

import {
  detectAppointmentConflict,
  type AgendaConflictCandidate,
  type AgendaConflictEvent,
  type AppointmentConflict,
} from "@/lib/agenda-conflicts";
import type { Database } from "@/lib/supabase/database.types";

type ServerSupabaseClient = SupabaseClient<Database>;

export async function fetchAgendaEventsForDate(
  supabase: ServerSupabaseClient,
  eventDate: string
) {
  const { data, error } = await supabase
    .from("agenda_events")
    .select(
      "id, patient_name, professional_name, professional_user_id, event_date, start_time, end_time, status"
    )
    .eq("event_date", eventDate);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AgendaConflictEvent[];
}

export async function validateAgendaAppointmentSlot(
  supabase: ServerSupabaseClient,
  candidate: AgendaConflictCandidate
): Promise<AppointmentConflict | null> {
  const events = await fetchAgendaEventsForDate(supabase, candidate.eventDate);
  return detectAppointmentConflict(events, candidate);
}
