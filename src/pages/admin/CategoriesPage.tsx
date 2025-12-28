import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function CategoriesPage() {
  return (
    <PlaceholderPage
      title="Catégories"
      description="Organisation et gestion des catégories de produits"
      icon="FolderOpen"
      suggestedFeatures={[
        "Arborescence des catégories",
        "Catégories et sous-catégories",
        "Glisser-déposer pour réorganiser",
        "Images de catégories",
        "SEO par catégorie",
        "Statistiques par catégorie"
      ]}
      backLink="/admin/products"
      backLabel="Retour aux produits"
    />
  );
}

export default CategoriesPage;
