import { redirect } from "next/navigation";

import { getServerUserSession } from "@/lib/auth-server";
import { isReceptionOnlyRole, RECEPCAO_HOME_PATH } from "@/lib/rbac";

export default async function HomePage() {
  const session = await getServerUserSession();

  if (!session) {
    redirect("/login");
  }

  redirect(
    isReceptionOnlyRole(session.profile) ? RECEPCAO_HOME_PATH : "/dashboard"
  );
}
