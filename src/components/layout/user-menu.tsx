"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/use-user-role";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  className?: string;
};

export function UserMenu({ className }: UserMenuProps) {
  const { fullName, displayRole, initials } = useUserRole();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-10 rounded-full p-0", className)}
            aria-label="Abrir menu do usuário"
            disabled={isPending}
          />
        }
      >
        <Avatar className="size-9 ring-2 ring-primary/10 sm:size-10">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary sm:text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{fullName}</span>
              <span className="text-xs text-muted-foreground">
                {displayRole}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="min-h-10 cursor-pointer"
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="size-4" aria-hidden />
          {isPending ? "Saindo..." : "Sair da plataforma"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
