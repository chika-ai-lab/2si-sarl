import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { Users } from "lucide-react";

export default function ClientsPage() {
  return (
    <PlaceholderPage
      icon={Users}
      title="Gestion des Clients"
      description="Cette page permet de gérer tous les clients de l'entreprise : création, modification, consultation des fiches clients et historique des commandes."
    />
  );
}
