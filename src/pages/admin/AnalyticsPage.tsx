import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytiques"
      description="Analyse détaillée des performances et métriques de votre entreprise"
      icon="TrendingUp"
      suggestedFeatures={[
        "Graphiques de ventes en temps réel",
        "Analyse des conversions clients",
        "Suivi des KPIs personnalisés",
        "Comparaisons de périodes",
        "Export des données analytics",
        "Rapports automatiques"
      ]}
      backLink="/admin"
      backLabel="Retour au tableau de bord"
    />
  );
}

export default AnalyticsPage;
