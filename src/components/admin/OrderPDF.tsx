import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/currency";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    width: 80,
    height: 80,
  },
  companyInfo: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#006847",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#006847",
    borderBottom: "2 solid #006847",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
  },
  value: {
    width: "60%",
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
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  summary: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
    width: "40%",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  total: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #006847",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#006847",
  },
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
  status: {
    padding: "5 10",
    borderRadius: 4,
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: 10,
    fontWeight: "bold",
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderPDFProps {
  order: {
    id: string;
    date: string;
    customer: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    items?: OrderItem[];
    paymentPlan?: string;
    total?: number;
    amount?: number;
  };
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export function OrderPDF({ order }: OrderPDFProps) {
  const total = order.total || order.amount || 0;
  const items = order.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Sen Services International</Text>
            <Text style={{ fontSize: 10, color: "#006847" }}>2SI.Sarl</Text>
            <Text style={{ fontSize: 9, marginTop: 5 }}>
              En face Auto Pont BRT Liberté 5 Villa N°5492
            </Text>
            <Text style={{ fontSize: 9 }}>Dakar, Sénégal</Text>
            <Text style={{ fontSize: 9 }}>Tél: +221 33 864 48 48</Text>
            <Text style={{ fontSize: 9 }}>NINEA: 007835162</Text>
          </View>
          <View style={styles.companyInfo}>
            <View style={styles.status}>
              <Text>{statusLabels[order.status] || order.status}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>COMMANDE {order.id}</Text>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de commande</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{order.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plan de paiement:</Text>
            <Text style={styles.value}>{order.paymentPlan || "12 mois"}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{order.customer}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{order.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse:</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
        </View>

        {/* Items Table */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Articles commandés</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Article</Text>
                <Text style={styles.col2}>Prix unit.</Text>
                <Text style={styles.col3}>Qté</Text>
                <Text style={styles.col4}>Total</Text>
              </View>
              {items.map((item, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={styles.col1}>{item.name}</Text>
                  <Text style={styles.col2}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.col3}>{item.quantity}</Text>
                  <Text style={styles.col4}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          <View style={[styles.summaryRow, styles.total]}>
            <Text style={styles.summaryLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </View>
          {order.paymentPlan && (
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 9, color: "#6B7280" }}>
                Paiement sur {order.paymentPlan}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Sen Services International (2SI.Sarl) - Équipement à Moindre Coût</Text>
          <Text>contact@sen-services.com | +221 33 864 48 48</Text>
        </View>
      </Page>
    </Document>
  );
}
