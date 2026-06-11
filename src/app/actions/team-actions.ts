"use server";

import { requirePermission } from "@/lib/auth-guard";
import type { UserProfile } from "@/lib/auth";
import { isRole, normalizeRole, PERMISSIONS } from "@/lib/rbac";
import type { ProfessionalRole } from "@/lib/professionals-data";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserProfileRow } from "@/lib/supabase/database.types";
import { getProfileLabel } from "@/lib/user-profile";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type TeamMember = {
  id: string;
  fullName: string;
  profile: UserProfile;
  profileLabel: string;
  professionalRole: string | null;
  professionalCouncil: string | null;
  isMaster: boolean;
  createdAt: string;
};

export type CreateTeamMemberInput = {
  fullName: string;
  email: string;
  password: string;
  profile: UserProfile;
  professionalRole?: ProfessionalRole | "";
  professionalCouncil?: string;
};

function isClinicalProfile(profile: UserProfile) {
  const role = normalizeRole(profile);
  return role === "AT1" || role === "AT2" || role === "SUPERVISOR";
}

function mapTeamMember(row: UserProfileRow): TeamMember {
  const profile = normalizeRole(row.profile);

  return {
    id: row.id,
    fullName: row.full_name,
    profile,
    profileLabel: getProfileLabel(profile),
    professionalRole: row.professional_role,
    professionalCouncil: row.professional_council,
    isMaster: row.is_master,
    createdAt: row.created_at,
  };
}

export async function listTeamMembersAction(): Promise<
  ActionResult<{ members: TeamMember[] }>
> {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("full_name");

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: { members: (data ?? []).map(mapTeamMember) },
  };
}

export async function createTeamMemberAction(
  input: CreateTeamMemberInput
): Promise<ActionResult<{ member: TeamMember }>> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const profile = normalizeRole(input.profile);

  if (!fullName || !email || !password) {
    return {
      success: false,
      error: "Preencha nome, e-mail e senha provisória.",
    };
  }

  if (!isRole(profile)) {
    return { success: false, error: "Selecione um perfil válido." };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "A senha provisória deve ter pelo menos 8 caracteres.",
    };
  }

  if (
    isClinicalProfile(profile) &&
    input.professionalRole &&
    !PROFESSIONAL_ROLES.includes(input.professionalRole)
  ) {
    return { success: false, error: "Selecione um cargo clínico válido." };
  }

  const adminClient = createAdminSupabaseClient();

  if (!adminClient) {
    return {
      success: false,
      error:
        "Cadastro de equipe indisponível. Configure SUPABASE_SERVICE_ROLE_KEY no ambiente.",
    };
  }

  const { data: createdUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        profile,
        professional_council: input.professionalCouncil?.trim() || null,
      },
    });

  if (createError || !createdUser.user) {
    return {
      success: false,
      error: createError?.message ?? "Não foi possível criar o usuário.",
    };
  }

  const professionalRole =
    isClinicalProfile(profile) && input.professionalRole
      ? input.professionalRole
      : null;

  const { data: profileRow, error: profileError } = await adminClient
    .from("user_profiles")
    .update({
      full_name: fullName,
      profile,
      professional_role: professionalRole,
      professional_council: input.professionalCouncil?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", createdUser.user.id)
    .select("*")
    .single();

  if (profileError || !profileRow) {
    return {
      success: false,
      error:
        profileError?.message ??
        "Usuário criado, mas o perfil não pôde ser atualizado.",
    };
  }

  return {
    success: true,
    data: { member: mapTeamMember(profileRow) },
  };
}
