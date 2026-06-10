import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { UserProfile } from "@/lib/auth";
import { mapUserProfileRow, type AppUserSession } from "@/lib/user-profile";
import type { UserProfileRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function isValidProfile(value: unknown): value is UserProfile {
  return (
    value === "administracao" ||
    value === "supervisor" ||
    value === "at" ||
    value === "recepcao"
  );
}

async function ensureUserProfile(
  user: User
): Promise<UserProfileRow | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { count, error: masterCountError } = await supabase
    .from("user_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_master", true);

  if (masterCountError) {
    return null;
  }

  const hasMaster = (count ?? 0) > 0;
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : (user.email?.split("@")[0] ?? "Usuário");

  const profile: UserProfile = hasMaster
    ? isValidProfile(metadata.profile)
      ? metadata.profile
      : "recepcao"
    : "administracao";

  const { data: inserted, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      profile,
      is_master: !hasMaster,
    })
    .select("*")
    .single();

  if (insertError) {
    return null;
  }

  return inserted;
}

export async function getServerUserSession(): Promise<AppUserSession | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let profile = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
    .then(({ data }) => data);

  if (!profile) {
    profile = await ensureUserProfile(user);
  }

  if (!profile) {
    return null;
  }

  return mapUserProfileRow(user, profile);
}

export async function requireServerUserSession() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
    .then(({ data }) => data);

  if (!profile) {
    profile = await ensureUserProfile(user);
  }

  if (!profile) {
    redirect("/login?erro=perfil-pendente");
  }

  return mapUserProfileRow(user, profile);
}
