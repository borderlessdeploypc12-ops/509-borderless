"use server";

import { redirect } from "next/navigation";

import { translateAuthError } from "@/lib/auth-messages";
import type { UserProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export type BootstrapStatus = {
  hasMaster: boolean;
  configured: boolean;
};

function isValidProfile(value: FormDataEntryValue | null): value is UserProfile {
  return (
    value === "administracao" ||
    value === "supervisor" ||
    value === "at" ||
    value === "recepcao"
  );
}

export async function getBootstrapStatusAction(): Promise<BootstrapStatus> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { hasMaster: false, configured: false };
  }

  const { count, error } = await supabase
    .from("user_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_master", true);

  if (error) {
    return { hasMaster: false, configured: true };
  }

  return {
    hasMaster: (count ?? 0) > 0,
    configured: true,
  };
}

export async function signInAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      error: "Informe e-mail e senha.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: translateAuthError(error.message),
    };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  formData: FormData
): Promise<AuthActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const profileValue = formData.get("profile");

  if (!fullName || !email || !password) {
    return {
      success: false,
      error: "Preencha nome, e-mail e senha.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "A senha deve ter pelo menos 8 caracteres.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
    };
  }

  const bootstrap = await getBootstrapStatusAction();
  const profile = bootstrap.hasMaster
    ? isValidProfile(profileValue)
      ? profileValue
      : null
    : "administracao";

  if (!profile) {
    return {
      success: false,
      error: "Selecione um perfil válido.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        profile,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: translateAuthError(error.message),
    };
  }

  if (!bootstrap.hasMaster) {
    if (data.session) {
      redirect("/dashboard");
    }

    return {
      success: true,
      message:
        "Conta master criada. Confirme seu e-mail, se solicitado, e faça login.",
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success: true,
    message:
      "Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro.",
  };
}

export async function resetPasswordAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      success: false,
      error: "Informe seu e-mail.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
    };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`,
  });

  if (error) {
    return {
      success: false,
      error: translateAuthError(error.message),
    };
  }

  return {
    success: true,
    message:
      "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.",
  };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
