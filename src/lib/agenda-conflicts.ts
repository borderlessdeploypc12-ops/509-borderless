import { doTimeRangesOverlap } from "@/lib/agenda-availability";

export type AppointmentConflictType = "professional_busy" | "patient_busy";

export type AppointmentConflict = {
  type: AppointmentConflictType;
  message: string;
};

export const APPOINTMENT_CONFLICT_MESSAGES = {
  professional_busy:
    "Conflito Detectado: O profissional já está alocado para outro atendimento.",
  patient_busy:
    "Conflito Detectado: Este paciente já possui um agendamento no mesmo horário.",
} as const;

export type AgendaConflictCandidate = {
  id?: string;
  patientName: string;
  professionalName: string;
  professionalUserId?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
};

export type AgendaConflictEvent = {
  id: string;
  patient_name: string;
  professional_name: string;
  professional_user_id: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function isSamePatient(
  candidate: AgendaConflictCandidate,
  event: AgendaConflictEvent
) {
  return (
    normalizeName(candidate.patientName) === normalizeName(event.patient_name)
  );
}

function isSameProfessional(
  candidate: AgendaConflictCandidate,
  event: AgendaConflictEvent
) {
  if (
    candidate.professionalUserId &&
    event.professional_user_id &&
    candidate.professionalUserId === event.professional_user_id
  ) {
    return true;
  }

  return (
    normalizeName(candidate.professionalName) ===
    normalizeName(event.professional_name)
  );
}

export function detectAppointmentConflict(
  existingEvents: AgendaConflictEvent[],
  candidate: AgendaConflictCandidate
): AppointmentConflict | null {
  const candidateRange = {
    startTime: candidate.startTime,
    endTime: candidate.endTime,
  };

  const overlappingEvents = existingEvents.filter((event) => {
    if (event.status === "cancelado") {
      return false;
    }

    if (candidate.id && event.id === candidate.id) {
      return false;
    }

    if (event.event_date !== candidate.eventDate) {
      return false;
    }

    return doTimeRangesOverlap(candidateRange, {
      startTime: event.start_time,
      endTime: event.end_time,
    });
  });

  const professionalConflict = overlappingEvents.find(
    (event) =>
      isSameProfessional(candidate, event) &&
      !isSamePatient(candidate, event)
  );

  if (professionalConflict) {
    return {
      type: "professional_busy",
      message: APPOINTMENT_CONFLICT_MESSAGES.professional_busy,
    };
  }

  const professionalSelfConflict = overlappingEvents.find(
    (event) =>
      isSameProfessional(candidate, event) && isSamePatient(candidate, event)
  );

  if (professionalSelfConflict) {
    return {
      type: "professional_busy",
      message: APPOINTMENT_CONFLICT_MESSAGES.professional_busy,
    };
  }

  const patientConflict = overlappingEvents.find(
    (event) =>
      isSamePatient(candidate, event) &&
      !isSameProfessional(candidate, event)
  );

  if (patientConflict) {
    return {
      type: "patient_busy",
      message: APPOINTMENT_CONFLICT_MESSAGES.patient_busy,
    };
  }

  return null;
}
