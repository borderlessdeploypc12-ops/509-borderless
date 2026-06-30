"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatEvaluationDateLabel,
  REASSESSMENT_THRESHOLD_MONTHS,
  type ReassessmentAlert,
} from "@/lib/clinical-reports";

type ReassessmentAlertsPanelProps = {
  alerts: ReassessmentAlert[];
};

function formatMonthsLabel(months: number | null) {
  if (months === null) {
    return "Sem avaliação registrada";
  }

  return `há ${months} ${months === 1 ? "mês" : "meses"}`;
}

export function ReassessmentAlertsPanel({ alerts }: ReassessmentAlertsPanelProps) {
  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-clinical-warning/15 text-clinical-warning">
            <AlertTriangle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle>Alertas de Reavaliação</CardTitle>
            <CardDescription>
              Aprendizes com última avaliação há mais de{" "}
              {REASSESSMENT_THRESHOLD_MONTHS} meses.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        {alerts.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum aprendiz com reavaliação pendente no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aprendiz</TableHead>
                  <TableHead>Última avaliação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.patientId}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p>{alert.patientName}</p>
                        {alert.lastInstrument ? (
                          <p className="text-xs text-muted-foreground">
                            {alert.lastInstrument}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.lastEvaluationDate
                        ? formatEvaluationDateLabel(alert.lastEvaluationDate)
                        : "—"}
                      <p className="text-xs">
                        {formatMonthsLabel(alert.monthsSinceLastEvaluation)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-clinical-warning/40 bg-clinical-warning/10 text-[oklch(0.42_0.12_75)]"
                      >
                        Reavaliação Pendente
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {alerts.length > 0 ? (
          <div className="border-t border-border/60 px-5 py-4">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/prontuario" />}
            >
              Ver aprendizes
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
