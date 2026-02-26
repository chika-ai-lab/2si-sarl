import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function InventoryPage() {
  return (
    <PlaceholderPage
      title="Inventaire"
      description="Gestion des stocks et inventaire en temps réel"
      icon="Warehouse"
      suggestedFeatures={[
        "Suivi des stocks en temps réel",
        "Alertes de rupture de stock",
        "Mouvements de stock détaillés",
        "Inventaire multi-entrepôts",
        "Import/Export de stocks",
        "Rapports d'inventaire"
      ]}
      backLink="/admin/products"
      backLabel="Retour aux produits"
    />
  );
}

export default InventoryPage;
