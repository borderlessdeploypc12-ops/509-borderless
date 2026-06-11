import { ShieldCheck } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        "border-border/80 bg-card shadow-md ring-1 ring-black/[0.03]",
        className
      )}
    >
      <CardHeader className="space-y-4 px-4 pt-6 text-center sm:px-6">
        <div className="flex justify-center">
          <AppLogo className="justify-center" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">{children}</CardContent>

      {footer ? (
        <CardFooter className="flex flex-col gap-4 px-4 pb-6 sm:px-6">
          {footer}
        </CardFooter>
      ) : null}

      <div className="flex items-center justify-center gap-1.5 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-clinical-success" />
        <span>Conexão segura e criptografada</span>
      </div>
    </Card>
  );
}
