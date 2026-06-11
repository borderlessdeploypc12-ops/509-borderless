import {
  CalendarDays,
  CalendarSearch,
  ClipboardCheck,
  FileBarChart,
  FileText,
  ScrollText,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserProfile } from "@/lib/auth";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/rbac";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  permission: Permission;
};

export function getNavItemsForProfile(
  profile: UserProfile,
  isMaster = false
): NavItem[] {
  return mainNavItems.filter((item) =>
    hasPermission(profile, item.permission, isMaster)
  );
}

export const mainNavItems: NavItem[] = [
  {
    title: "Agenda",
    href: "/dashboard",
    icon: CalendarDays,
    description: "Agendamentos e sessões do dia",
    permission: PERMISSIONS.AGENDA_VIEW,
  },
  {
    title: "Busca de Agenda",
    href: "/dashboard/busca-agenda",
    icon: CalendarSearch,
    description: "Profissionais disponíveis por cargo e horário",
    permission: PERMISSIONS.AGENDA_SEARCH,
  },
  {
    title: "Pacientes / Aprendizes",
    href: "/dashboard/pacientes",
    icon: Users,
    description: "Cadastro e evolução terapêutica",
    permission: PERMISSIONS.PATIENTS_VIEW,
  },
  {
    title: "Profissionais",
    href: "/dashboard/profissionais",
    icon: UserCog,
    description: "Cadastro da equipe e perfis de acesso",
    permission: PERMISSIONS.PROFESSIONALS_VIEW,
  },
  {
    title: "Avaliações",
    href: "/dashboard/avaliacoes",
    icon: ClipboardCheck,
    description: "Instrumentos e avaliações ABA",
    permission: PERMISSIONS.ASSESSMENTS_VIEW,
  },
  {
    title: "Evolução Clínica",
    href: "/dashboard/evolucao",
    icon: FileText,
    description: "Relatórios narrativos de sessão",
    permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileBarChart,
    description: "Indicadores e relatórios clínicos",
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    title: "Log de Auditoria",
    href: "/dashboard/auditoria",
    icon: ScrollText,
    description: "Rastreabilidade de alterações na agenda",
    permission: PERMISSIONS.AUDIT_LOGS_VIEW,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    description: "Preferências da clínica",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];
