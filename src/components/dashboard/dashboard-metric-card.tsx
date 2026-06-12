import {
  Activity,
  ClipboardList,
  Clock,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap = {
  sessions: Activity,
  hours: Clock,
  programs: ClipboardList,
  avgPrograms: ThumbsUp,
  attempts: Activity,
  independence: ThumbsUp,
  learners: ClipboardList,
  attendance: Activity,
} as const;

const accentMap = {
  emerald: "border-t-emerald-500",
  sky: "border-t-sky-400",
  slate: "border-t-slate-600",
  muted: "border-t-muted-foreground/40",
  primary: "border-t-primary",
} as const;

type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: keyof typeof iconMap;
  accent?: keyof typeof accentMap;
  className?: string;
  compactValue?: boolean;
};

export function DashboardMetricCard({
  label,
  value,
  icon,
  accent = "primary",
  className,
  compactValue = false,
}: DashboardMetricCardProps) {
  const Icon: LucideIcon = iconMap[icon];

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 border-t-4 shadow-sm",
        accentMap[accent],
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compactValue
                ? "text-lg leading-snug sm:text-xl"
                : "text-3xl sm:text-4xl"
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
