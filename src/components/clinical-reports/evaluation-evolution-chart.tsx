"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EvaluationEvolutionPoint } from "@/lib/clinical-reports";

type EvaluationEvolutionChartProps = {
  points: EvaluationEvolutionPoint[];
};

export function EvaluationEvolutionChart({
  points,
}: EvaluationEvolutionChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
        Nenhuma avaliação com pontuação encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
            formatter={(value) => [`${value} pts`, "Pontuação"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as EvaluationEvolutionPoint | undefined;
              return item?.title ?? "Avaliação";
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Pontuação"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--chart-1)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
