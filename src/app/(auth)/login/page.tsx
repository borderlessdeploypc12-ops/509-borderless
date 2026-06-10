import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/app-brand";

export const metadata: Metadata = {
  title: "Entrar",
  description: `Acesse sua conta na plataforma ${APP_NAME}.`,
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
