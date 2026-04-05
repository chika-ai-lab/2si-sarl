import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { companyConfig } from "@/config/company.config";
import type { BLForm, CommandeLivraison } from "../types";
import { buildBLCNumber, clientDisplayName, formatDatetime } from "../lib/livraisons.helpers";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:        { padding: 24, fontFamily: "Helvetica", fontSize: 11, color: "#000" },
  header:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  addrBlock:   { gap: 2 },
  addrLabel:   { fontSize: 9, color: "#555" },
  addrName:    { fontWeight: "bold" },
  barcodeWrap: { alignItems: "flex-end", gap: 4 },
  barcode:     { fontFamily: "Courier", fontSize: 16, letterSpacing: 3, borderWidth: 1, borderColor: "#000", padding: "3 6" },
  blcNum:      { fontSize: 9, textAlign: "right" },
  title:       { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  metaGrid:    { flexDirection: "row", gap: 8, marginVertical: 14, padding: 10, borderWidth: 1, borderColor: "#ccc" },
  metaItem:    { flex: 1 },
  metaLabel:   { fontSize: 9, color: "#555", marginBottom: 2 },
  metaValue:   { fontWeight: "bold", fontSize: 11 },
  tableHead:   { flexDirection: "row", backgroundColor: "#222", padding: "6 10" },
  tableHCell:  { color: "white", fontWeight: "bold", fontSize: 10 },
  tableRow:    { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", padding: "6 10" },
  col1:        { flex: 3 },
  col2:        { flex: 1, textAlign: "center" },
  col3:        { flex: 1 },
  driverBox:   { marginTop: 16, borderWidth: 1, borderColor: "#ccc", padding: 12 },
  driverTitle: { fontSize: 9, color: "#555", textTransform: "uppercase", marginBottom: 8 },
  driverGrid:  { flexDirection: "row", gap: 8 },
  driverField: { flex: 1 },
  driverLabel: { fontSize: 9, color: "#555" },
  driverValue: { fontWeight: "bold", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 4, minHeight: 18, marginTop: 2 },
  sigsGrid:    { flexDirection: "row", gap: 20, marginTop: 28 },
  sigBox:      { flex: 1, alignItems: "center" },
  sigLine:     { borderBottomWidth: 1, borderBottomColor: "#000", width: "100%", height: 36, marginBottom: 6 },
  sigLabel:    { fontSize: 10 },
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  commande: CommandeLivraison;
  blForm: BLForm;
}

export function BonLivraisonPDF({ commande, blForm }: Props) {
  const blcNum       = buildBLCNumber(commande.id);
  const clientName   = clientDisplayName(commande.client);
  const clientVille  = commande.client?.adresse?.ville || "Dakar";
  const clientTel    = commande.client?.telephone || "—";
  const datePlanifie = formatDatetime(blForm.datePlanifiee);

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <View style={S.addrBlock}>
            <Text style={S.addrLabel}>Adresse de livraison :</Text>
            <Text style={S.addrName}>{clientName}</Text>
            <Text>{clientVille}, {companyConfig.address.country}</Text>
            <Text>{clientTel}</Text>
          </View>
          <View style={S.barcodeWrap}>
            <Text style={S.barcode}>|||||||||||||||||||||||||||||||</Text>
            <Text style={S.blcNum}>{blcNum}</Text>
          </View>
        </View>

        <Text style={S.title}>{blcNum}</Text>

        {/* ── Meta ── */}
        <View style={S.metaGrid}>
          {[
            { label: "Commande",      value: commande.reference },
            { label: "Statut",        value: "Prêt" },
            { label: "Date planifiée", value: datePlanifie },
          ].map(({ label, value }) => (
            <View key={label} style={S.metaItem}>
              <Text style={S.metaLabel}>{label}</Text>
              <Text style={S.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Products table ── */}
        <View style={S.tableHead}>
          <Text style={[S.tableHCell, S.col1]}>Produit</Text>
          <Text style={[S.tableHCell, S.col2]}>Qté</Text>
          <Text style={[S.tableHCell, S.col3]}>De</Text>
        </View>
        {commande.lignes.map((l) => (
          <View key={l.id} style={S.tableRow}>
            <Text style={S.col1}>
              {l.produit?.reference ? `[${l.produit.reference}] ` : ""}
              {l.produit?.nom || "Produit"}
            </Text>
            <Text style={S.col2}>{l.quantite.toFixed(2)}</Text>
            <Text style={S.col3}>COL/Stock</Text>
          </View>
        ))}

        {/* ── Driver ── */}
        <View style={S.driverBox}>
          <Text style={S.driverTitle}>Informations de transport</Text>
          <View style={S.driverGrid}>
            {[
              { label: "Nom du chauffeur :",       value: blForm.chauffeurNom || "—" },
              { label: "Numéro du chauffeur :",    value: blForm.chauffeurTel || "—" },
              { label: "Matricule du véhicule :",  value: blForm.matricule    || "—" },
            ].map(({ label, value }) => (
              <View key={label} style={S.driverField}>
                <Text style={S.driverLabel}>{label}</Text>
                <Text style={S.driverValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Signatures ── */}
        <View style={S.sigsGrid}>
          {["Signature du Chauffeur", "Signature Comptable", "Signature Client"].map((s) => (
            <View key={s} style={S.sigBox}>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>{s}</Text>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
}
