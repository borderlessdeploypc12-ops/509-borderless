import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { APP_NAME } from "@/lib/app-brand";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: `Recupere o acesso à sua conta ${APP_NAME}.`,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
