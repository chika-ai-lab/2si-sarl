import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { Tool } from "lucide-react";

export default function SAVDetailPage() {
  return (
    <PlaceholderPage
      icon={Tool}
      title="Détails Ticket SAV"
      description="Fiche détaillée du ticket SAV avec historique des interventions, pièces échangées et statut du dossier."
    />
  );
}
