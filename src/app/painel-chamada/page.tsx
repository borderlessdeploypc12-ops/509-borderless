import type { Metadata } from "next";

import { ReceptionDisplayPanel } from "@/components/reception/reception-display-panel";

export const metadata: Metadata = {
  title: "Painel de Chamada",
  description: "Painel público de chamada de pacientes na recepção.",
};

export default function ReceptionPanelPage() {
  return <ReceptionDisplayPanel />;
}
