import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { ShoppingCart } from "lucide-react";

export default function CommandesPage() {
  return (
    <PlaceholderPage
      icon={ShoppingCart}
      title="Gestion des Commandes"
      description="Liste complète des commandes clients avec filtres avancés, suivi des statuts, validation et gestion des livraisons."
    />
  );
}
