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

import { canManageAgenda } from "@/lib/agenda-permissions";
import type { UserProfile } from "@/lib/auth";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  adminOnly?: boolean;
  requiresAgendaManagement?: boolean;
};

export function getNavItemsForProfile(profile: UserProfile): NavItem[] {
  return mainNavItems.filter((item) => {
    if (item.adminOnly && profile !== "administracao") {
      return false;
    }

    if (item.requiresAgendaManagement && !canManageAgenda(profile)) {
      return false;
    }

    return true;
  });
}

export const mainNavItems: NavItem[] = [
  {
    title: "Agenda",
    href: "/dashboard",
    icon: CalendarDays,
    description: "Agendamentos e sessões do dia",
  },
  {
    title: "Busca de Agenda",
    href: "/dashboard/busca-agenda",
    icon: CalendarSearch,
    description: "Profissionais disponíveis por cargo e horário",
    requiresAgendaManagement: true,
  },
  {
    title: "Pacientes / Aprendizes",
    href: "/dashboard/pacientes",
    icon: Users,
    description: "Cadastro e evolução terapêutica",
  },
  {
    title: "Profissionais",
    href: "/dashboard/profissionais",
    icon: UserCog,
    description: "Equipe clínica e supervisores",
  },
  {
    title: "Avaliações",
    href: "/dashboard/avaliacoes",
    icon: ClipboardCheck,
    description: "Instrumentos e avaliações ABA",
  },
  {
    title: "Evolução Clínica",
    href: "/dashboard/evolucao",
    icon: FileText,
    description: "Relatórios narrativos de sessão",
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileBarChart,
    description: "Indicadores e relatórios clínicos",
  },
  {
    title: "Log de Auditoria",
    href: "/dashboard/auditoria",
    icon: ScrollText,
    description: "Rastreabilidade de alterações na agenda",
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    description: "Preferências da clínica",
  },
];
