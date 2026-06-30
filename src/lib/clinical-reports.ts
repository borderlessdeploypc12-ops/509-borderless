import type { EvaluationRow } from "@/lib/supabase/database.types";

export const REASSESSMENT_THRESHOLD_MONTHS = 6;

export type ClinicalReportPatientOption = {
  id: string;
  label: string;
};

export type ClinicalReportInstrumentOption = {
  value: string;
  label: string;
};

export type ClinicalReportEvaluationOption = {
  id: string;
  patientId: string;
  patientName: string;
  label: string;
  instrument: string;
  evaluationDate: string;
  score: number | null;
  status: EvaluationRow["status"];
};

export type EvaluationEvolutionPoint = {
  evaluationId: string;
  date: string;
  dateLabel: string;
  score: number;
  title: string;
};

export type EvaluationComparisonSeries = {
  evaluationId: string;
  label: string;
  color: string;
  points: Array<{ category: string; score: number }>;
};

export type ReassessmentAlert = {
  patientId: string;
  patientName: string;
  lastEvaluationDate: string | null;
  lastInstrument: string | null;
  monthsSinceLastEvaluation: number | null;
};

export type ClinicalReportsSummary = {
  totalEvaluations: number;
  averageScore: number | null;
  scoreTrend: number | null;
  pendingReassessments: number;
};

function parseNumericScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseScoreBreakdown(
  contentHtml: string
): Record<string, number> | null {
  const jsonCommentMatch = contentHtml.match(
    /<!--\s*score-breakdown:\s*(\{[\s\S]*?\})\s*-->/i
  );

  if (jsonCommentMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonCommentMatch[1]) as Record<string, unknown>;
      const breakdown: Record<string, number> = {};

      Object.entries(parsed).forEach(([key, value]) => {
        const score = parseNumericScore(value);
        if (score !== null) {
          breakdown[key] = score;
        }
      });

      if (Object.keys(breakdown).length > 0) {
        return breakdown;
      }
    } catch {
      // Ignora JSON inválido e tenta outros formatos.
    }
  }

  const dataAttributePattern =
    /data-skill-score=["'](\d+(?:[.,]\d+)?)["'][^>]*data-skill-label=["']([^"']+)["']/gi;
  const breakdown: Record<string, number> = {};
  let match = dataAttributePattern.exec(contentHtml);

  while (match) {
    const score = parseNumericScore(match[1]);
    const label = match[2]?.trim();

    if (score !== null && label) {
      breakdown[label] = score;
    }

    match = dataAttributePattern.exec(contentHtml);
  }

  return Object.keys(breakdown).length > 0 ? breakdown : null;
}

export function extractEvaluationScore(evaluation: {
  total_score?: number | null;
  content_html: string;
}): number | null {
  const columnScore = parseNumericScore(evaluation.total_score);
  if (columnScore !== null) {
    return columnScore;
  }

  const dataAttributeMatch = evaluation.content_html.match(
    /data-total-score=["'](\d+(?:[.,]\d+)?)["']/i
  );

  if (dataAttributeMatch?.[1]) {
    return parseNumericScore(dataAttributeMatch[1]);
  }

  const textMatch = evaluation.content_html.match(
    /(?:pontua[cç][aã]o|score)\s*(?:total|geral)?\s*:?\s*(\d+(?:[.,]\d+)?)/i
  );

  if (textMatch?.[1]) {
    return parseNumericScore(textMatch[1]);
  }

  const breakdown = parseScoreBreakdown(evaluation.content_html);
  if (!breakdown) {
    return null;
  }

  const values = Object.values(breakdown);
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0);
}

export function formatEvaluationDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

export function formatEvaluationOptionLabel(input: {
  instrument: string | null;
  title: string;
  evaluation_date: string;
}) {
  const instrument =
    input.instrument?.trim() || input.title.trim() || "Avaliação";
  return `${instrument} — ${formatEvaluationDateLabel(input.evaluation_date)}`;
}

export function getInstrumentKey(evaluation: {
  instrument: string | null;
  title: string;
}) {
  return (
    evaluation.instrument?.trim().toLowerCase() ||
    evaluation.title.trim().toLowerCase() ||
    "sem-instrumento"
  );
}

export function getInstrumentLabel(evaluation: {
  instrument: string | null;
  title: string;
}) {
  return evaluation.instrument?.trim() || evaluation.title.trim() || "Sem instrumento";
}

export function buildEvolutionSeries(
  evaluations: Array<
    Pick<
      EvaluationRow,
      "id" | "evaluation_date" | "title" | "content_html" | "total_score"
    >
  >
): EvaluationEvolutionPoint[] {
  return evaluations
    .map((evaluation) => {
      const score = extractEvaluationScore(evaluation);
      if (score === null) {
        return null;
      }

      return {
        evaluationId: evaluation.id,
        date: evaluation.evaluation_date,
        dateLabel: formatEvaluationDateLabel(evaluation.evaluation_date),
        score,
        title: evaluation.title,
      };
    })
    .filter((point): point is EvaluationEvolutionPoint => point !== null)
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function buildComparisonSeries(
  evaluations: Array<
    Pick<
      EvaluationRow,
      | "id"
      | "evaluation_date"
      | "title"
      | "instrument"
      | "content_html"
      | "total_score"
    >
  >,
  colors: [string, string]
): EvaluationComparisonSeries[] {
  return evaluations.map((evaluation, index) => {
    const breakdown = parseScoreBreakdown(evaluation.content_html);
    const points =
      breakdown && Object.keys(breakdown).length > 0
        ? Object.entries(breakdown).map(([category, score]) => ({
            category,
            score,
          }))
        : [
            {
              category: "Pontuação Total",
              score: extractEvaluationScore(evaluation) ?? 0,
            },
          ];

    return {
      evaluationId: evaluation.id,
      label: formatEvaluationOptionLabel(evaluation),
      color: colors[index] ?? colors[0],
      points,
    };
  });
}

export function monthsBetween(fromDateKey: string, toDate = new Date()) {
  const from = new Date(`${fromDateKey}T12:00:00`);
  const years = toDate.getFullYear() - from.getFullYear();
  const months = toDate.getMonth() - from.getMonth();
  const total = years * 12 + months;

  if (toDate.getDate() < from.getDate()) {
    return Math.max(total - 1, 0);
  }

  return Math.max(total, 0);
}

export function getReassessmentCutoffDate(months = REASSESSMENT_THRESHOLD_MONTHS) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return cutoff.toISOString().slice(0, 10);
}

export function buildReassessmentAlerts(
  patients: Array<{ id: string; full_name: string; status: string }>,
  evaluations: Array<
    Pick<
      EvaluationRow,
      "patient_id" | "evaluation_date" | "instrument" | "title" | "status"
    >
  >
): ReassessmentAlert[] {
  const cutoffDate = getReassessmentCutoffDate();
  const lastEvaluationByPatient = new Map<
    string,
    { date: string; instrument: string | null }
  >();

  evaluations
    .filter((evaluation) => evaluation.status === "finalized")
    .forEach((evaluation) => {
      const current = lastEvaluationByPatient.get(evaluation.patient_id);

      if (!current || evaluation.evaluation_date > current.date) {
        lastEvaluationByPatient.set(evaluation.patient_id, {
          date: evaluation.evaluation_date,
          instrument:
            evaluation.instrument?.trim() || evaluation.title.trim() || null,
        });
      }
    });

  return patients
    .filter((patient) => patient.status === "active")
    .map((patient) => {
      const lastEvaluation = lastEvaluationByPatient.get(patient.id) ?? null;

      if (
        lastEvaluation &&
        lastEvaluation.date >= cutoffDate
      ) {
        return null;
      }

      return {
        patientId: patient.id,
        patientName: patient.full_name,
        lastEvaluationDate: lastEvaluation?.date ?? null,
        lastInstrument: lastEvaluation?.instrument ?? null,
        monthsSinceLastEvaluation: lastEvaluation
          ? monthsBetween(lastEvaluation.date)
          : null,
      };
    })
    .filter((alert): alert is ReassessmentAlert => alert !== null)
    .sort((left, right) => {
      if (!left.lastEvaluationDate && !right.lastEvaluationDate) {
        return left.patientName.localeCompare(right.patientName, "pt-BR");
      }

      if (!left.lastEvaluationDate) {
        return -1;
      }

      if (!right.lastEvaluationDate) {
        return 1;
      }

      return left.lastEvaluationDate.localeCompare(right.lastEvaluationDate);
    });
}

export function calculateScoreTrend(points: EvaluationEvolutionPoint[]) {
  if (points.length < 2) {
    return null;
  }

  const first = points[0].score;
  const last = points[points.length - 1].score;

  return Number((last - first).toFixed(1));
}
