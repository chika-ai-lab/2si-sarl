import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function LeadsPage() {
  return (
    <PlaceholderPage
      title="Prospects"
      description="Gestion et suivi des prospects et opportunités commerciales"
      icon="UserPlus"
      suggestedFeatures={[
        "Pipeline de vente visuel",
        "Scoring des prospects",
        "Affectation automatique aux commerciaux",
        "Suivi des activités",
        "Conversion en clients",
        "Statistiques de performance"
      ]}
      backLink="/admin/crm/customers"
      backLabel="Retour aux clients"
    />
  );
}

export default LeadsPage;
