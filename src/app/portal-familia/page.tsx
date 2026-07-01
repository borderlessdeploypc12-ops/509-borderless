import { getFamilyPortalHomeDataAction } from "@/app/actions/family-portal-actions";
import { FamilyPortalHome } from "@/components/family-portal/family-portal-home";

export default async function FamilyPortalPage() {
  const data = await getFamilyPortalHomeDataAction();

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        Não foi possível carregar os dados do portal. Entre em contato com a
        clínica.
      </div>
    );
  }

  return <FamilyPortalHome data={data} />;
}
