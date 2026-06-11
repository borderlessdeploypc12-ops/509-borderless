"use client";

import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInternalCommunication } from "@/contexts/internal-communication-context";
import { useUserRole } from "@/hooks/use-user-role";

export function PatientWaitingBanner() {
  const { isClinicalStaff } = useUserRole();
  const { waitingNotifications, markNotificationRead } =
    useInternalCommunication();

  const isProfessional = isClinicalStaff;

  if (!isProfessional || waitingNotifications.length === 0) {
    return null;
  }

  const latestNotification = waitingNotifications[0];
  const patientName =
    typeof latestNotification.metadata === "object" &&
    latestNotification.metadata !== null &&
    "patient_name" in latestNotification.metadata &&
    typeof latestNotification.metadata.patient_name === "string"
      ? latestNotification.metadata.patient_name
      : "Paciente";

  return (
    <div
      role="status"
      className="border-b border-clinical-warning/30 bg-clinical-warning/15 px-4 py-3 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-5 shrink-0 text-[oklch(0.45_0.12_75)]"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            O paciente {patientName} chegou e está aguardando na recepção.
          </p>
          {waitingNotifications.length > 1 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              +{waitingNotifications.length - 1} outro(s) paciente(s) aguardando
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label="Dispensar aviso"
          onClick={() => void markNotificationRead(latestNotification.id)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
