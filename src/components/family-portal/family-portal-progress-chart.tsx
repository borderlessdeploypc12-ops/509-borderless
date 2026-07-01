"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EvaluationEvolutionPoint } from "@/lib/clinical-reports";

type FamilyPortalProgressChartProps = {
  points: EvaluationEvolutionPoint[];
};

function formatShortDateLabel(dateLabel: string) {
  const [day, month, year] = dateLabel.split("/");
  return `${day}/${month}/${year?.slice(-2) ?? year}`;
}

export function FamilyPortalProgressChart({
  points,
}: FamilyPortalProgressChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/15 px-4 text-center text-sm text-muted-foreground">
        Ainda não há avaliações com pontuação registradas.
      </div>
    );
  }

  const chartData = points.map((point) => ({
    ...point,
    shortDate: formatShortDateLabel(point.dateLabel),
  }));

  const latestScore = points[points.length - 1]?.score;

  return (
    <div className="space-y-3">
      {latestScore !== undefined ? (
        <p className="text-center text-3xl font-semibold tracking-tight text-foreground">
          {latestScore}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            pts
          </span>
        </p>
      ) : null}

      <div className="h-44 w-full sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border/50"
            />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--card-foreground)",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value} pts`, "Pontuação"]}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as
                  | EvaluationEvolutionPoint
                  | undefined;
                return item?.title ?? "Avaliação";
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "var(--chart-1)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
