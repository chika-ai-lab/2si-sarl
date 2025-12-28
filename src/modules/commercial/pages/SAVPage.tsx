import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { Wrench } from "lucide-react";

export default function SAVPage() {
  return (
    <PlaceholderPage
      icon={Wrench}
      title="Service Après-Vente"
      description="Gestion des demandes SAV, tickets de support, retours produits et suivi des interventions techniques."
    />
  );
}
