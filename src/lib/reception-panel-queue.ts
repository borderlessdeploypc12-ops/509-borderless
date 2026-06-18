import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type AgendaSupabaseClient = SupabaseClient<Database>;

export async function getNextQueueNumber(
  supabase: AgendaSupabaseClient,
  eventDate: string
) {
  const { data, error } = await supabase
    .from("agenda_events")
    .select("queue_number")
    .eq("event_date", eventDate)
    .not("queue_number", "is", null)
    .order("queue_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.queue_number ?? 0) + 1;
}

export async function resolveQueueNumberForAppointment(
  supabase: AgendaSupabaseClient,
  eventDate: string,
  appointmentId: string
) {
  const { data: existingEvent, error: fetchError } = await supabase
    .from("agenda_events")
    .select("queue_number")
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existingEvent?.queue_number) {
    return existingEvent.queue_number;
  }

  return getNextQueueNumber(supabase, eventDate);
}
