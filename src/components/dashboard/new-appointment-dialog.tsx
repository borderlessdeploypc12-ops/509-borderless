"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarPlus, CheckCircle2 } from "lucide-react";

import { createAppointmentAction } from "@/app/actions/agenda-availability-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFullDate } from "@/lib/calendar-utils";
import type { DailyAppointment } from "@/lib/dashboard-mock-data";
import type { ProfessionalRole } from "@/lib/professionals-data";

export type NewAppointmentDefaults = {
  professionalName: string;
  professionalUserId?: string | null;
  professionalRole?: ProfessionalRole;
  eventDate: string;
  startTime: string;
  endTime: string;
};

type NewAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: NewAppointmentDefaults | null;
  onCreated?: (appointment: DailyAppointment) => void;
};

export function NewAppointmentDialog({
  open,
  onOpenChange,
  defaults,
  onCreated,
}: NewAppointmentDialogProps) {
  const [patientName, setPatientName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setPatientName("");
      setError(null);
      setSuccessMessage(null);
    }
  }, [open, defaults]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!defaults) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await createAppointmentAction({
        patientName,
        professionalName: defaults.professionalName,
        professionalUserId: defaults.professionalUserId,
        eventDate: defaults.eventDate,
        startTime: defaults.startTime,
        endTime: defaults.endTime,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccessMessage("Agendamento criado com sucesso.");

      if (result.data?.appointment) {
        onCreated?.(result.data.appointment);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="size-5" />
            Novo agendamento
          </DialogTitle>
          <DialogDescription>
            Confirme os dados e informe o paciente para concluir o agendamento.
          </DialogDescription>
        </DialogHeader>

        {defaults ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 rounded-lg border border-border/80 bg-muted/30 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Profissional</span>
                <span className="text-right font-medium">
                  {defaults.professionalName}
                </span>
              </div>
              {defaults.professionalRole ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cargo</span>
                  <span className="text-right font-medium">
                    {defaults.professionalRole}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Data</span>
                <span className="text-right font-medium">
                  {formatFullDate(defaults.eventDate)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Horário</span>
                <span className="text-right font-medium">
                  {defaults.startTime} – {defaults.endTime}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-patient-name">Paciente</Label>
              <Input
                id="appointment-patient-name"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Nome do paciente ou aprendiz"
                autoFocus
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            {successMessage ? (
              <p className="flex items-center gap-2 text-sm text-[oklch(0.42_0.1_155)]">
                <CheckCircle2 className="size-4" />
                {successMessage}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {successMessage ? "Fechar" : "Cancelar"}
              </Button>
              {!successMessage ? (
                <Button type="submit" disabled={isPending || !patientName.trim()}>
                  {isPending ? "Salvando..." : "Confirmar agendamento"}
                </Button>
              ) : null}
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecione um profissional e horário disponíveis para continuar.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
