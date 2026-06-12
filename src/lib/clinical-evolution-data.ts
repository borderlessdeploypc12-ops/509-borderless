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

export const clinicalPatients: ClinicalPatient[] = [
  {
    id: "a0000001-0000-4000-8000-000000000001",
    name: "Lucas Mendes",
    birthDate: "2018-03-14",
    guardian: "Patrícia Mendes",
    diagnosis: "TEA — Nível 2",
  },
  {
    id: "a0000002-0000-4000-8000-000000000002",
    name: "Sofia Ribeiro",
    birthDate: "2019-07-22",
    guardian: "Carlos Ribeiro",
    diagnosis: "TEA — Nível 1",
  },
  {
    id: "a0000003-0000-4000-8000-000000000003",
    name: "Miguel Torres",
    birthDate: "2017-11-05",
    guardian: "Ana Torres",
    diagnosis: "TEA — Nível 2",
  },
  {
    id: "a0000004-0000-4000-8000-000000000004",
    name: "Fernanda Oliveira",
    birthDate: "2016-01-30",
    guardian: "Roberto Oliveira",
    diagnosis: "TEA — Nível 3",
  },
  {
    id: "a0000005-0000-4000-8000-000000000005",
    name: "Gabriel Souza",
    birthDate: "2020-09-18",
    guardian: "Juliana Souza",
    diagnosis: "TEA — Nível 1",
  },
];

export function getClinicalPatient(patientId: string) {
  return clinicalPatients.find((patient) => patient.id === patientId) ?? null;
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
