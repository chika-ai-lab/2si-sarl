import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function QuotesPage() {
  return (
    <PlaceholderPage
      title="Devis"
      description="Création et gestion des devis clients"
      icon="FileText"
      suggestedFeatures={[
        "Création rapide de devis",
        "Templates personnalisables",
        "Conversion devis → commande",
        "Suivi des validations",
        "Envoi automatique par email",
        "Historique et versions"
      ]}
      backLink="/admin/orders"
      backLabel="Retour aux commandes"
    />
  );
}

export default QuotesPage;
