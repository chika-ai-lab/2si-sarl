import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { User } from "lucide-react";

export default function ClientDetailPage() {
  return (
    <PlaceholderPage
      icon={User}
      title="Détails Client"
      description="Fiche détaillée du client avec informations complètes, historique des commandes, documents et interactions."
    />
  );
}
