import { ROLES, type Role } from "@/lib/rbac";

export const userProfileOptions = [
  {
    value: ROLES.ADMIN,
    label: "Administração",
    description: "Gestão geral da clínica",
  },
  {
    value: ROLES.SUPERVISOR,
    label: "Supervisor clínico",
    description: "Supervisão clínica e programas ABA",
  },
  {
    value: ROLES.AT1,
    label: "AT 1",
    description: "Assistente terapêutico — nível 1",
  },
  {
    value: ROLES.AT2,
    label: "AT 2",
    description: "Assistente terapêutico — nível 2",
  },
  {
    value: ROLES.RECEPCAO,
    label: "Recepção",
    description: "Agendamento e atendimento inicial",
  },
  {
    value: ROLES.FAMILIA,
    label: "Família / Responsável",
    description: "Acesso somente leitura ao portal da família",
  },
] as const;

export type UserProfile = Role;

export { signOutAction as signOut } from "@/app/actions/auth-actions";
