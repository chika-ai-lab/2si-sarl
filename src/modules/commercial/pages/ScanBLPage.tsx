import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { ScanLine } from "lucide-react";

export default function ScanBLPage() {
  return (
    <PlaceholderPage
      icon={ScanLine}
      title="Scan des Bons de Livraison"
      description="Numérisation et traitement des bons de livraison pour associer les réceptions aux commandes clients."
    />
  );
}
