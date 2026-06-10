import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { ClinicalEvolutionForm } from "@/components/clinical-evolution/clinical-evolution-form";

export const metadata: Metadata = {
  title: "Evolução Clínica",
  description:
    "Registro narrativo de evolução clínica com rascunhos e geração de relatório em PDF.",
};

export default function EvolucaoClinicaPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="size-6 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Evolução Clínica
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Registre a evolução da sessão em formato narrativo, salve rascunhos
          durante o atendimento e gere o relatório formal em PDF.
        </p>
      </section>

      <ClinicalEvolutionForm />
    </div>
  );
}
