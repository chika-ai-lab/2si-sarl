import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { BookOpen } from "lucide-react";

export default function CataloguePage() {
  return (
    <PlaceholderPage
      icon={BookOpen}
      title="Catalogue Produits"
      description="Catalogue des produits disponibles, organisé par banque (CBAO, CMS) avec tarifs et disponibilités."
    />
  );
}
