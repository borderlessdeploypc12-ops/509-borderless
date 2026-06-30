"use server";

import { requireSupervisorOrAdmin } from "@/lib/auth-guard";
import {
  buildComparisonSeries,
  buildEvolutionSeries,
  buildReassessmentAlerts,
  calculateScoreTrend,
  extractEvaluationScore,
  formatEvaluationOptionLabel,
  getInstrumentKey,
  getInstrumentLabel,
  type ClinicalReportEvaluationOption,
  type ClinicalReportInstrumentOption,
  type ClinicalReportPatientOption,
  type ClinicalReportsSummary,
  type EvaluationComparisonSeries,
  type EvaluationEvolutionPoint,
  type ReassessmentAlert,
} from "@/lib/clinical-reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow, PatientRow } from "@/lib/supabase/database.types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ClinicalReportsFilters = {
  patientId: string;
  instrument: string;
};

export type ClinicalReportsData = {
  patients: ClinicalReportPatientOption[];
  instruments: ClinicalReportInstrumentOption[];
  evaluations: ClinicalReportEvaluationOption[];
  evolutionPoints: EvaluationEvolutionPoint[];
  comparisonSeries: EvaluationComparisonSeries[];
  reassessmentAlerts: ReassessmentAlert[];
  summary: ClinicalReportsSummary;
};

export type ClinicalReportsQuery = ClinicalReportsFilters & {
  comparisonEnabled: boolean;
  comparisonEvaluationIds: [string | null, string | null];
};

function mapEvaluationOption(
  evaluation: EvaluationRow,
  patientName: string
): ClinicalReportEvaluationOption {
  return {
    id: evaluation.id,
    patientId: evaluation.patient_id,
    patientName,
    label: formatEvaluationOptionLabel(evaluation),
    instrument: getInstrumentLabel(evaluation),
    evaluationDate: evaluation.evaluation_date,
    score: extractEvaluationScore(evaluation),
    status: evaluation.status,
  };
}

function buildInstrumentOptions(
  evaluations: EvaluationRow[]
): ClinicalReportInstrumentOption[] {
  const instruments = new Map<string, string>();

  evaluations.forEach((evaluation) => {
    const key = getInstrumentKey(evaluation);
    if (!instruments.has(key)) {
      instruments.set(key, getInstrumentLabel(evaluation));
    }
  });

  return [...instruments.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

function filterEvaluations(
  evaluations: EvaluationRow[],
  filters: ClinicalReportsFilters
) {
  return evaluations.filter((evaluation) => {
    if (evaluation.status !== "finalized") {
      return false;
    }

    if (filters.patientId !== "all" && evaluation.patient_id !== filters.patientId) {
      return false;
    }

    if (
      filters.instrument !== "all" &&
      getInstrumentKey(evaluation) !== filters.instrument
    ) {
      return false;
    }

    return true;
  });
}

export async function getClinicalReportsDataAction(
  query: ClinicalReportsQuery
): Promise<ActionResult<ClinicalReportsData>> {
  await requireSupervisorOrAdmin();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [patientsResult, evaluationsResult] = await Promise.all([
    supabase
      .from("patients")
      .select("id, full_name, status")
      .order("full_name"),
    supabase
      .from("evaluations")
      .select("*")
      .order("evaluation_date", { ascending: false }),
  ]);

  const queryError = patientsResult.error ?? evaluationsResult.error;

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  const patients = (patientsResult.data ?? []) as PatientRow[];
  const evaluations = (evaluationsResult.data ?? []) as EvaluationRow[];
  const patientNameById = new Map(
    patients.map((patient) => [patient.id, patient.full_name])
  );

  const patientsOptions: ClinicalReportPatientOption[] = [
    { id: "all", label: "Todos os aprendizes" },
    ...patients
      .filter((patient) => patient.status === "active")
      .map((patient) => ({
        id: patient.id,
        label: patient.full_name,
      })),
  ];

  const finalizedEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === "finalized"
  );
  const instruments = buildInstrumentOptions(finalizedEvaluations);
  const scopedEvaluations = filterEvaluations(finalizedEvaluations, query);
  const evolutionPoints = buildEvolutionSeries(scopedEvaluations);

  const comparisonIds = query.comparisonEvaluationIds.filter(
    (id): id is string => Boolean(id)
  );

  let comparisonSeries: EvaluationComparisonSeries[] = [];

  if (query.comparisonEnabled && comparisonIds.length === 2) {
    const selectedEvaluations = comparisonIds
      .map((id) => finalizedEvaluations.find((evaluation) => evaluation.id === id))
      .filter((evaluation): evaluation is EvaluationRow => Boolean(evaluation));

    if (selectedEvaluations.length === 2) {
      comparisonSeries = buildComparisonSeries(selectedEvaluations, [
        "var(--chart-1)",
        "var(--chart-2)",
      ]);
    }
  }

  const evaluationOptions = scopedEvaluations.map((evaluation) =>
    mapEvaluationOption(
      evaluation,
      patientNameById.get(evaluation.patient_id) ?? "Aprendiz"
    )
  );

  const scores = evolutionPoints.map((point) => point.score);
  const averageScore =
    scores.length > 0
      ? Number(
          (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(
            1
          )
        )
      : null;

  const reassessmentAlerts = buildReassessmentAlerts(patients, evaluations);

  const summary: ClinicalReportsSummary = {
    totalEvaluations: scopedEvaluations.length,
    averageScore,
    scoreTrend: calculateScoreTrend(evolutionPoints),
    pendingReassessments: reassessmentAlerts.length,
  };

  return {
    success: true,
    data: {
      patients: patientsOptions,
      instruments: [{ value: "all", label: "Todos os instrumentos" }, ...instruments],
      evaluations: evaluationOptions,
      evolutionPoints,
      comparisonSeries,
      reassessmentAlerts,
      summary,
    },
  };
}
