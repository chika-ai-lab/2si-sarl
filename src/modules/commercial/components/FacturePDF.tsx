import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FactureData {
  facture_id: number;
  reference: string;
  date: string;
  commande: {
    reference: string;
    etat: string;
    mode_paiement?: string;
    duree_paiement?: number;
    frais_expedition: number;
    autres_charges: number;
    remise: number;
    created_at: string;
  };
  client: { nom: string; email?: string; telephone?: string; adresse?: string } | null;
  commercial: { name: string } | null;
  articles: { libelle: string; quantite: number; prix: number; montant: number }[];
  sous_total: number;
  total_ttc: number;
}

// ── Styles ─────────────────────────────────────────────────────────────────

const GREEN = "#1a6b3a";
const LIGHT_GREEN = "#f0faf4";
const GRAY = "#555";
const LIGHT_GRAY = "#f7f9fc";

const s = StyleSheet.create({
  page:    { padding: 40, fontFamily: "Helvetica", fontSize: 11, color: "#1a1a2e" },

  // Header
  header:  { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 3, borderBottomColor: GREEN, paddingBottom: 16, marginBottom: 28 },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: GREEN },
  companySub:  { fontSize: 9, color: GRAY, marginTop: 2 },
  factureLabel:{ fontSize: 24, fontFamily: "Helvetica-Bold", color: GREEN, textAlign: "right", letterSpacing: 2 },
  factureRef:  { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#333", textAlign: "right", marginTop: 3 },
  factureDate: { fontSize: 10, color: "#777", textAlign: "right", marginTop: 2 },
  badge:       { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#d1fae5", borderRadius: 10, alignSelf: "flex-end" },
  badgeText:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#065f46", textTransform: "uppercase" },

  // Info grid
  infoGrid:  { flexDirection: "row", gap: 16, marginBottom: 24 },
  infoBox:   { flex: 1, backgroundColor: LIGHT_GRAY, border: "1px solid #e2e8f0", borderRadius: 5, padding: 12 },
  boxTitle:  { fontSize: 8, fontFamily: "Helvetica-Bold", color: GREEN, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  boxName:   { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  boxLine:   { fontSize: 10, color: GRAY, marginBottom: 2 },

  // Section
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GREEN, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },

  // Table
  tableHeader: { flexDirection: "row", backgroundColor: GREEN, padding: "7 8", borderRadius: 3 },
  tableHeaderText: { color: "#fff", fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  tableRow:    { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#edf2f7", paddingVertical: 7, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: "#f7faf9" },
  tableCell:   { fontSize: 10, color: "#333" },
  col1: { flex: 1 },
  col2: { width: 40, textAlign: "right" },
  col3: { width: 110, textAlign: "right" },
  col4: { width: 110, textAlign: "right" },

  // Totaux
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 24 },
  totalsBox:  { width: 260, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 5, overflow: "hidden" },
  totalsRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#edf2f7" },
  totalsLabel:{ fontSize: 11, color: GRAY },
  totalsValue:{ fontSize: 11, color: "#333" },
  totalRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, paddingHorizontal: 12, backgroundColor: GREEN },
  totalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },
  totalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#fff" },

  // Plan
  planBox:   { backgroundColor: LIGHT_GREEN, borderWidth: 1, borderColor: "#a7d9bb", borderRadius: 5, padding: 12, marginBottom: 24 },
  planTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GREEN, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  planGrid:  { flexDirection: "row", gap: 10 },
  planItem:  { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#c6e8d3", borderRadius: 4, padding: 8, alignItems: "center" },
  planDuree: { fontSize: 13, fontFamily: "Helvetica-Bold", color: GREEN },
  planMens:  { fontSize: 9, color: GRAY, marginTop: 2 },

  // Footer
  footer:    { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 14, alignItems: "center" },
  footerThank: { fontSize: 12, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 5 },
  footerText:  { fontSize: 9, color: "#888", marginBottom: 2 },
});

// ── Helpers ────────────────────────────────────────────────────────────────

function fcfa(n: number) {
  // Intl insécables causent des "/" dans react-pdf — formatage manuel
  const parts = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts + " FCFA";
}
function fdate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Document ───────────────────────────────────────────────────────────────

export function FactureDocument({ data }: { data: FactureData }) {
  const etatLabel = data.commande.etat === "confirmee" ? "Confirmée" : "Livrée";

  return (
    <Document title={`Facture ${data.reference}`} author="2SI Sarl">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>2SI Sarl</Text>
            <Text style={s.companySub}>Société Sénégalaise d'Investissement et d'Ingénierie</Text>
            <Text style={s.companySub}>Dakar, Sénégal  ·  contact@2si-sarl.com</Text>
          </View>
          <View>
            <Text style={s.factureLabel}>FACTURE</Text>
            <Text style={s.factureRef}>N° {data.reference}</Text>
            <Text style={s.factureDate}>Émise le {fdate(data.date)}</Text>
            <View style={s.badge}><Text style={s.badgeText}>{etatLabel}</Text></View>
          </View>
        </View>

        {/* Infos */}
        <View style={s.infoGrid}>
          <View style={s.infoBox}>
            <Text style={s.boxTitle}>Client</Text>
            {data.client ? (
              <>
                <Text style={s.boxName}>{data.client.nom}</Text>
                {data.client.email     && <Text style={s.boxLine}>{data.client.email}</Text>}
                {data.client.telephone && <Text style={s.boxLine}>{data.client.telephone}</Text>}
                {data.client.adresse   && <Text style={s.boxLine}>{data.client.adresse}</Text>}
              </>
            ) : <Text style={s.boxLine}>Client inconnu</Text>}
          </View>
          <View style={s.infoBox}>
            <Text style={s.boxTitle}>Détails commande</Text>
            <Text style={s.boxLine}>Réf. commande : {data.commande.reference}</Text>
            <Text style={s.boxLine}>Date : {fdate(data.commande.created_at)}</Text>
            {data.commande.mode_paiement && (
              <Text style={s.boxLine}>Mode de paiement : {data.commande.mode_paiement}</Text>
            )}
            {data.commande.duree_paiement && (
              <Text style={s.boxLine}>Durée : {data.commande.duree_paiement} mois</Text>
            )}
            {data.commercial && (
              <Text style={s.boxLine}>Commercial : {data.commercial.name}</Text>
            )}
          </View>
        </View>

        {/* Articles */}
        <Text style={s.sectionTitle}>Articles commandés</Text>
        <View style={{ marginBottom: 16 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.col1]}>Article</Text>
            <Text style={[s.tableHeaderText, s.col2]}>Qté</Text>
            <Text style={[s.tableHeaderText, s.col3]}>Prix unitaire</Text>
            <Text style={[s.tableHeaderText, s.col4]}>Sous-total</Text>
          </View>
          {data.articles.map((a, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.col1]}>{a.libelle}</Text>
              <Text style={[s.tableCell, s.col2]}>{a.quantite}</Text>
              <Text style={[s.tableCell, s.col3]}>{fcfa(a.prix)}</Text>
              <Text style={[s.tableCell, s.col4, { fontFamily: "Helvetica-Bold" }]}>{fcfa(a.montant)}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Sous-total articles</Text>
              <Text style={s.totalsValue}>{fcfa(data.sous_total)}</Text>
            </View>
            {data.commande.frais_expedition > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Frais d'expédition</Text>
                <Text style={s.totalsValue}>{fcfa(data.commande.frais_expedition)}</Text>
              </View>
            )}
            {data.commande.autres_charges > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Autres charges</Text>
                <Text style={s.totalsValue}>{fcfa(data.commande.autres_charges)}</Text>
              </View>
            )}
            {data.commande.remise > 0 && (
              <View style={s.totalsRow}>
                <Text style={[s.totalsLabel, { color: "#c0392b" }]}>Remise</Text>
                <Text style={[s.totalsValue, { color: "#c0392b" }]}>- {fcfa(data.commande.remise)}</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL TTC</Text>
              <Text style={s.totalValue}>{fcfa(data.total_ttc)}</Text>
            </View>
          </View>
        </View>

        {/* Plan de paiement */}
        {data.commande.duree_paiement && data.total_ttc > 0 && (
          <View style={s.planBox}>
            <Text style={s.planTitle}>Plan de paiement</Text>
            <View style={s.planGrid}>
              {[6, 12, 24].map((d) => (
                <View key={d} style={[s.planItem, d === data.commande.duree_paiement ? { borderColor: GREEN, backgroundColor: LIGHT_GREEN } : {}]}>
                  <Text style={s.planDuree}>{d} mois</Text>
                  <Text style={s.planMens}>{fcfa(Math.round(data.total_ttc / d))}/mois</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerThank}>Merci de votre confiance !</Text>
          <Text style={s.footerText}>2SI Sarl — NINEA : XXXXXXXX — RC : XXXXXXXX</Text>
          <Text style={s.footerText}>Cette facture a été générée électroniquement et est valide sans signature.</Text>
        </View>

      </Page>
    </Document>
  );
}
