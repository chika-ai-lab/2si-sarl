import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/currency";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 30,
    borderBottom: "3 solid #006847",
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006847",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 18,
    color: "#333333",
    marginTop: 10,
  },
  reportDate: {
    fontSize: 10,
    color: "#666666",
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#006847",
    marginBottom: 12,
    paddingBottom: 5,
    borderBottom: "1 solid #E5E7EB",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 4,
    border: "1 solid #E5E7EB",
  },
  statLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },
  statChange: {
    fontSize: 8,
    color: "#10B981",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#006847",
    color: "white",
    padding: 8,
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
    fontSize: 9,
  },
  col1: { width: "40%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#6B7280",
    borderTop: "1 solid #E5E7EB",
    paddingTop: 10,
  },
  divider: {
    marginVertical: 15,
    borderBottom: "1 solid #E5E7EB",
  },
  chartBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chartLabel: {
    width: "40%",
    fontSize: 9,
  },
  chartBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginRight: 8,
  },
  chartBarFill: {
    height: 12,
    backgroundColor: "#006847",
    borderRadius: 2,
  },
  chartValue: {
    width: "20%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: "bold",
  },
});

interface ReportPDFProps {
  period: string;
  stats: {
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    products: { value: number; change: number };
    customers: { value: number; change: number };
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
}

export function ReportPDF({ period, stats, topProducts, salesByCategory }: ReportPDFProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const periodLabel =
    period === "7"
      ? "7 derniers jours"
      : period === "30"
      ? "30 derniers jours"
      : period === "90"
      ? "90 derniers jours"
      : "Cette année";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Sen Services International</Text>
          <Text style={{ fontSize: 10, color: "#006847" }}>2SI.Sarl</Text>
          <Text style={styles.reportTitle}>Rapport de Performance</Text>
          <Text style={styles.reportDate}>
            Période: {periodLabel} • Généré le {today}
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Chiffre d'affaires</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.revenue.value)}</Text>
              <Text style={styles.statChange}>↑ {stats.revenue.change}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Commandes</Text>
              <Text style={styles.statValue}>{stats.orders.value}</Text>
              <Text style={styles.statChange}>↑ {stats.orders.change}%</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Produits vendus</Text>
              <Text style={styles.statValue}>{stats.products.value}</Text>
              <Text style={styles.statChange}>↑ {stats.products.change}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Clients</Text>
              <Text style={styles.statValue}>{stats.customers.value}</Text>
              <Text style={styles.statChange}>↑ {stats.customers.change}%</Text>
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 - Produits les plus vendus</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Produit</Text>
              <Text style={styles.col2}>Ventes</Text>
              <Text style={styles.col3}>Chiffre</Text>
              <Text style={styles.col4}>Part</Text>
            </View>
            {topProducts.map((product, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.col1}>{product.name}</Text>
                <Text style={styles.col2}>{product.sales}</Text>
                <Text style={styles.col3}>{formatCurrency(product.revenue)}</Text>
                <Text style={styles.col4}>
                  {((product.sales / topProducts[0].sales) * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sales by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ventes par catégorie</Text>
          {salesByCategory.map((category, index) => (
            <View key={index} style={styles.chartBar}>
              <Text style={styles.chartLabel}>{category.category}</Text>
              <View style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBarFill,
                    { width: `${category.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.chartValue}>
                {category.sales} ({category.percentage}%)
              </Text>
            </View>
          ))}
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights de performance</Text>
          <View style={{ fontSize: 9, lineHeight: 1.6 }}>
            <Text style={{ marginBottom: 8 }}>
              • Le chiffre d'affaires a augmenté de {stats.revenue.change}% par rapport à la
              période précédente
            </Text>
            <Text style={{ marginBottom: 8 }}>
              • {stats.orders.value} commandes ont été traitées avec succès
            </Text>
            <Text style={{ marginBottom: 8 }}>
              • Le produit le plus vendu est "{topProducts[0].name}" avec {topProducts[0].sales}{" "}
              ventes
            </Text>
            <Text style={{ marginBottom: 8 }}>
              • La catégorie "{salesByCategory[0].category}" représente{" "}
              {salesByCategory[0].percentage}% des ventes
            </Text>
            <Text style={{ marginBottom: 8 }}>
              • {stats.customers.value} clients actifs sur la période
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations</Text>
          <View style={{ fontSize: 9, lineHeight: 1.6 }}>
            <Text style={{ marginBottom: 8 }}>
              1. Augmenter le stock des produits les plus vendus pour éviter les ruptures
            </Text>
            <Text style={{ marginBottom: 8 }}>
              2. Développer des promotions ciblées sur les catégories moins performantes
            </Text>
            <Text style={{ marginBottom: 8 }}>
              3. Fidéliser les clients existants avec des programmes de récompenses
            </Text>
            <Text style={{ marginBottom: 8 }}>
              4. Analyser les tendances saisonnières pour optimiser les approvisionnements
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Sen Services International (2SI.Sarl) - Rapport confidentiel</Text>
          <Text style={{ marginTop: 3 }}>
            En face Auto Pont BRT Liberté 5 Villa N°5492 - Dakar, Sénégal
          </Text>
          <Text style={{ marginTop: 3 }}>
            Tél: +221 33 864 48 48 • NINEA: 007835162
          </Text>
        </View>
      </Page>
    </Document>
  );
}
