import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function InvoicesPage() {
  return (
    <PlaceholderPage
      title="Factures"
      description="Gestion des factures et paiements clients"
      icon="Receipt"
      suggestedFeatures={[
        "Génération automatique de factures",
        "Suivi des paiements",
        "Relances automatiques",
        "Export comptable",
        "Factures récurrentes",
        "Multi-devises"
      ]}
      backLink="/admin/orders"
      backLabel="Retour aux commandes"
    />
  );
}

export default InvoicesPage;
