import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { FileText } from "lucide-react";

export default function CommandeDetailPage() {
  return (
    <PlaceholderPage
      icon={FileText}
      title="Détails Commande"
      description="Fiche détaillée de la commande avec informations client, produits, prix, statut et documents associés."
    />
  );
}
