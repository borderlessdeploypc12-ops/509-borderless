export function formatPatientDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatPatientDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const patientStatusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  discharged: "Alta",
} as const;

export const appointmentStatusLabels = {
  confirmado: "Confirmado",
  agendado: "Agendado",
  em_espera: "Em espera",
  cancelado: "Cancelado",
} as const;
