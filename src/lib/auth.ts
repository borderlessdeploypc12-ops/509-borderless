export const userProfileOptions = [
  {
    value: "administracao",
    label: "Administração",
    description: "Gestão geral da clínica",
  },
  {
    value: "supervisor",
    label: "Psicólogo supervisor",
    description: "Supervisão clínica e programas ABA",
  },
  {
    value: "at",
    label: "AT (Assistente Terapêutico)",
    description: "Condução de sessões terapêuticas",
  },
  {
    value: "recepcao",
    label: "Recepção",
    description: "Agendamento e atendimento inicial",
  },
] as const;

export type UserProfile = (typeof userProfileOptions)[number]["value"];

export { signOutAction as signOut } from "@/app/actions/auth-actions";
