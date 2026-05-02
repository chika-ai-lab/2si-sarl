import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { useLocation } from "react-router-dom";

export function NotFoundAdminPage() {
  const location = useLocation();

  return (
    <PlaceholderPage
      title="Page non trouvée"
      description={`La page "${location.pathname}" que vous recherchez n'existe pas ou n'a pas encore été créée.`}
      icon="FileQuestion"
      suggestedFeatures={[
        "Vérifiez l'URL saisie",
        "Retournez au tableau de bord",
        "Utilisez le menu de navigation pour trouver la page souhaitée",
        "Contactez l'administrateur si vous pensez qu'il s'agit d'une erreur"
      ]}
      backLink="/admin"
      backLabel="Retour au tableau de bord"
    />
  );
}

export default NotFoundAdminPage;
