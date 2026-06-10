import { CalendarPlus, Clock, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VacantSlot } from "@/lib/agenda-filter-utils";

type VacantSlotCardProps = {
  slot: VacantSlot;
  isReadOnly?: boolean;
  onSchedule?: (slot: VacantSlot) => void;
};

export function VacantSlotCard({
  slot,
  isReadOnly = false,
  onSchedule,
}: VacantSlotCardProps) {
  return (
    <article className="flex w-full flex-col gap-3 rounded-xl border border-dashed border-clinical-success/40 bg-clinical-success/5 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-clinical-success/15 px-2.5 py-2 text-center">
            <span className="text-sm font-bold leading-none text-[oklch(0.42_0.1_155)]">
              {slot.time}
            </span>
            <span className="mt-1 text-[0.65rem] text-muted-foreground">
              {slot.endTime}
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-foreground">
              Horário vago
            </p>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              {slot.professional}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="h-6 shrink-0 border-clinical-success/20 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]"
        >
          {slot.role}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>
            {slot.time} – {slot.endTime}
          </span>
        </div>

        {isReadOnly ? (
          <span className="text-xs font-medium text-muted-foreground">
            Somente leitura
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => onSchedule?.(slot)}
          >
            <CalendarPlus className="size-3.5" aria-hidden />
            Agendar
          </Button>
        )}
      </div>
    </article>
  );
}
