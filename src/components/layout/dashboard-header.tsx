"use client";

import { Menu } from "lucide-react";

import { NotificationCenter } from "@/components/internal-communication/notification-center";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";

type DashboardHeaderProps = {
  onMenuClick?: () => void;
};

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { fullName, displayRole } = useUserRole();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0 flex-1 lg:hidden">
          <p className="truncate text-sm font-semibold">{fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{displayRole}</p>
        </div>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationCenter />

          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {displayRole}
            </p>
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
