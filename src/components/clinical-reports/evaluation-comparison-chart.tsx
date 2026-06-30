"use client";

import { useMemo } from "react";
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

import type { EvaluationComparisonSeries } from "@/lib/clinical-reports";

type EvaluationComparisonChartProps = {
  series: EvaluationComparisonSeries[];
};

export function EvaluationComparisonChart({
  series,
}: EvaluationComparisonChartProps) {
  const chartData = useMemo(() => {
    if (series.length !== 2) {
      return [];
    }

    const categories = [
      ...new Set(
        series.flatMap((item) => item.points.map((point) => point.category))
      ),
    ];

    return categories.map((category) => {
      const row: Record<string, string | number> = { category };

      series.forEach((item) => {
        const point = item.points.find((entry) => entry.category === category);
        row[item.evaluationId] = point?.score ?? 0;
      });

      return row;
    });
  }, [series]);

  if (series.length !== 2) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
        Selecione duas avaliações para comparar os resultados no mesmo gráfico.
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
        As avaliações selecionadas não possuem pontuação para comparação.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
          <XAxis
            dataKey="category"
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
          />
          <Legend />
          {series.map((item) => (
            <Line
              key={item.evaluationId}
              type="monotone"
              dataKey={item.evaluationId}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
