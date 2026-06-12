export type DashboardLearnerOption = {
  id: string;
  label: string;
};

export type DashboardCurriculumFolder = {
  id: string;
  label: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  icon: "sessions" | "programs" | "attempts" | "independence";
};

export type SkillPerformance = {
  skill: string;
  score: number;
};

export type ProgramPerformance = {
  program: string;
  score: number;
};

export type ProfessionalMetric = {
  label: string;
  value: string;
  icon: "sessions" | "hours" | "programs" | "avgPrograms";
  accent: "emerald" | "sky" | "slate" | "muted";
};

export type DashboardProfessionalOption = {
  id: string;
  label: string;
};

export type SessionByLearner = {
  learner: string;
  sessions: number;
};

export type SessionByWeek = {
  weekLabel: string;
  sessions: number;
};

export const dashboardLearners: DashboardLearnerOption[] = [
  { id: "all", label: "Todos os aprendizes" },
  { id: "a0000001-0000-4000-8000-000000000001", label: "Lucas Mendes" },
  { id: "a0000002-0000-4000-8000-000000000002", label: "Sofia Ribeiro" },
  { id: "a0000003-0000-4000-8000-000000000003", label: "Miguel Torres" },
];

export const dashboardCurriculumFolders: DashboardCurriculumFolder[] = [
  { id: "all", label: "Todas as pastas" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "autonomia", label: "Autonomia" },
  { id: "social", label: "Habilidades sociais" },
];

export const learnerDashboardMetrics: DashboardMetric[] = [
  { label: "Sessões Atendidas", value: "1", icon: "sessions" },
  { label: "Programas Utilizados", value: "4", icon: "programs" },
  { label: "Média de Tentativas/Sessão", value: "4", icon: "attempts" },
  { label: "Média de Independência/Sessão", value: "0%", icon: "independence" },
];

export const dashboardProfessionals: DashboardProfessionalOption[] = [
  { id: "all", label: "Todos os profissionais" },
  { id: "luciana", label: "Luciana Lima Marelli" },
  { id: "carlos", label: "Carlos Lima" },
  { id: "ana", label: "Ana Paula Silva" },
];

export const dashboardServiceTypes = [
  { id: "sessao", label: "Sessão" },
  { id: "supervisao", label: "Supervisão" },
  { id: "avaliacao", label: "Avaliação" },
] as const;

export const professionalDashboardMetrics: ProfessionalMetric[] = [
  {
    label: "Sessões Realizadas",
    value: "1",
    icon: "sessions",
    accent: "emerald",
  },
  {
    label: "Horas de Atendimento",
    value: "0 horas e 1 minutos",
    icon: "hours",
    accent: "sky",
  },
  {
    label: "Programas Aplicados",
    value: "4",
    icon: "programs",
    accent: "slate",
  },
  {
    label: "Média Programas/Sessão",
    value: "4",
    icon: "avgPrograms",
    accent: "muted",
  },
];

export const sessionsByLearnerData: SessionByLearner[] = [
  { learner: "Isis Pacheco Coimbra", sessions: 1 },
];

export const sessionsByWeekData: SessionByWeek[] = [
  { weekLabel: "08/06/2026", sessions: 1 },
];

export const skillPerformanceData: SkillPerformance[] = [
  { skill: "Comunicação funcional", score: 72 },
  { skill: "Imitação motora", score: 58 },
  { skill: "Seguimento de instruções", score: 81 },
  { skill: "Autonomia pessoal", score: 45 },
  { skill: "Interação social", score: 63 },
];

export const topProgramsData: ProgramPerformance[] = [
  { program: "Manding verbal", score: 88 },
  { program: "Esperar sua vez", score: 76 },
  { program: "Contato visual", score: 71 },
  { program: "Rotina de higiene", score: 54 },
];

export const bottomProgramsData: ProgramPerformance[] = [
  { program: "Generalização", score: 22 },
  { program: "Brincar funcional", score: 31 },
  { program: "Transição de atividades", score: 38 },
  { program: "Tolerância ao não", score: 41 },
];

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
