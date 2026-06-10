import { redirect } from "next/navigation";

import { getServerUserSession } from "@/lib/auth-server";

export default async function HomePage() {
  const session = await getServerUserSession();

  redirect(session ? "/dashboard" : "/login");
}
