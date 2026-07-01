import { redirect } from "next/navigation";

import { getServerUserSession } from "@/lib/auth-server";
import {
  FAMILIA_HOME_PATH,
  isFamilyOnlyRole,
  isReceptionOnlyRole,
  RECEPCAO_HOME_PATH,
} from "@/lib/rbac";

export default async function HomePage() {
  const session = await getServerUserSession();

  if (!session) {
    redirect("/login");
  }

  if (isFamilyOnlyRole(session.profile)) {
    redirect(FAMILIA_HOME_PATH);
  }

  redirect(
    isReceptionOnlyRole(session.profile) ? RECEPCAO_HOME_PATH : "/dashboard"
  );
}
