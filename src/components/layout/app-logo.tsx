import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/app-brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  variant?: "default" | "compact";
  linkToHome?: boolean;
};

const logoSources = {
  default: {
    src: "/brand/logo-nurse-care.png",
    width: 220,
    height: 72,
  },
  compact: {
    src: "/brand/logo-nurse-care-sm.png",
    width: 160,
    height: 52,
  },
} as const;

export function AppLogo({
  className,
  variant = "default",
  linkToHome = false,
}: AppLogoProps) {
  const logo = logoSources[variant];

  const content = (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logo.src}
        alt={APP_NAME}
        width={logo.width}
        height={logo.height}
        className="h-auto max-h-12 w-auto max-w-full object-contain"
        priority
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/dashboard" className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }

  return content;
}
