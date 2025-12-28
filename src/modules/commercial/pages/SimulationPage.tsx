import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { Calculator } from "lucide-react";

export default function SimulationPage() {
  return (
    <PlaceholderPage
      icon={Calculator}
      title="Tableau de Simulation"
      description="Outil de simulation pour calculer les prix, marges, taxes et conditions de vente pour les devis clients."
    />
  );
}
