"use client";

import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPatientDate } from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";

type PatientListProps = {
  patients: PatientRow[];
};

export function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        Nenhum paciente cadastrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {patients.map((patient) => (
        <Link
          key={patient.id}
          href={`/paciente/${patient.id}/prontuario`}
          className="group block"
        >
          <Card className="shadow-sm transition-all hover:border-primary/20 hover:bg-muted/15 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {patient.full_name}
                    </CardTitle>
                    <CardDescription>
                      {patient.diagnosis ?? "Sem diagnóstico registrado"}
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                Nascimento: {formatPatientDate(patient.birth_date)}
              </span>
              {patient.guardian_name ? (
                <span>· Responsável: {patient.guardian_name}</span>
              ) : null}
              <Badge variant="outline" className="ml-auto">
                Abrir prontuário
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
