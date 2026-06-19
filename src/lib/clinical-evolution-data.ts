export type ClinicalPatient = {
  id: string;
  name: string;
  birthDate: string;
  guardian: string;
  diagnosis: string;
};

export const CLINIC_REPORT_HEADER = {
  name: "Nurse Care",
  legalName: "Nurse Care Soluções em Saúde Ltda.",
  cnpj: "00.000.000/0001-00",
  address: "Av. Paulista, 1000 — São Paulo, SP",
  phone: "(11) 3000-0000",
  email: "contato@nursecare.com.br",
} as const;

type PatientLike = {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_name: string | null;
  diagnosis: string | null;
};

export function mapPatientToClinicalPatient(patient: PatientLike): ClinicalPatient {
  return {
    id: patient.id,
    name: patient.full_name,
    birthDate: patient.birth_date ?? "",
    guardian: patient.guardian_name?.trim() || "—",
    diagnosis: patient.diagnosis?.trim() || "—",
  };
}

export function getClinicalPatient(
  patients: ClinicalPatient[],
  patientId: string
) {
  return patients.find((patient) => patient.id === patientId) ?? null;
}

export function formatPatientBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
