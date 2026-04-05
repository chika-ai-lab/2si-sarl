import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { companyConfig } from "@/config/company.config";
import type { CommandeLivraison } from "../types";
import { buildCONumber, clientDisplayName } from "../lib/livraisons.helpers";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:        { padding: 28, fontFamily: "Helvetica", fontSize: 11, color: "#000" },
  pageHeader:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: "#000", gap: 16 },
  pageLeft:    { flex: 1 },
  logoRow:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  logoBox:     { width: 40, height: 40, backgroundColor: "#1a1a2e", borderRadius: 6, alignItems: "center", justifyContent: "center" },
  logoText:    { color: "white", fontWeight: "bold", fontSize: 9 },
  companyName: { fontWeight: "bold", fontSize: 13, marginBottom: 2 },
  tagline:     { fontSize: 10, color: "#555" },
  infoLine:    { fontSize: 10, color: "#333", marginTop: 2 },
  pageRight:   { flexShrink: 0, alignItems: "flex-end", gap: 8 },
  qrBox:       { width: 60, height: 60, borderWidth: 1, borderColor: "#ccc", alignItems: "center", justifyContent: "center" },
  qrLabel:     { fontSize: 7, color: "#aaa" },
  docTitle:    { alignItems: "flex-end" },
  docH2:       { fontSize: 15, fontWeight: "bold" },
  docRef:      { fontWeight: "bold", fontSize: 12, color: "#333", marginTop: 3 },
  docDate:     { fontSize: 10, color: "#555", marginTop: 2 },
  addresses:   { flexDirection: "row", gap: 16, marginVertical: 14 },
  addrBox:     { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10 },
  addrTitle:   { fontSize: 9, textTransform: "uppercase", color: "#555", marginBottom: 5 },
  addrName:    { fontWeight: "bold", marginBottom: 2 },
  addrLine:    { fontSize: 10, marginTop: 1 },
  metaRow:     { flexDirection: "row", gap: 20, marginVertical: 10, fontSize: 10 },
  metaLabel:   { color: "#555" },
  tableHead:   { flexDirection: "row", backgroundColor: "#000", padding: "7 10" },
  tableHCell:  { color: "white", fontWeight: "bold", fontSize: 10, textTransform: "uppercase" },
  tableRow:    { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", padding: "7 10" },
  colDesc:     { flex: 3 },
  colQte:      { flex: 1, textAlign: "center" },
  sigsRow:     { flexDirection: "row", gap: 24, marginTop: 32 },
  sigBox:      { flex: 1, alignItems: "center" },
  sigLine:     { borderBottomWidth: 1, borderBottomColor: "#000", width: "100%", height: 40, marginBottom: 6 },
  sigLabel:    { fontSize: 10 },
  footer:      { marginTop: 20, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#888" },
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  commande: CommandeLivraison;
}

export function FicheExpeditionPDF({ commande }: Props) {
  const coNum      = buildCONumber(commande.id);
  const dateStr    = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const clientName = clientDisplayName(commande.client);
  const clientVille = commande.client?.adresse?.ville || "—";
  const clientTel  = commande.client?.telephone || "—";
  const commercial = commande.commercial || "—";
  const agence     = commande.banque
    ? `${commande.banque} - ${clientVille.toUpperCase()}`
    : clientVille.toUpperCase();

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Page header ── */}
        <View style={S.pageHeader}>
          <View style={S.pageLeft}>
            <View style={S.logoRow}>
              <View style={S.logoBox}>
                <Text style={S.logoText}>2SI</Text>
              </View>
              <View>
                <Text style={S.companyName}>{companyConfig.name}</Text>
                <Text style={S.tagline}>{companyConfig.tagline}</Text>
              </View>
            </View>
            <Text style={S.infoLine}>{companyConfig.address.street}</Text>
            <Text style={S.infoLine}>Tél : {companyConfig.phone} — 77 225 83 83</Text>
            <Text style={S.infoLine}>77 420 90 03</Text>
            <Text style={S.infoLine}>Email : {companyConfig.email}</Text>
          </View>

          <View style={S.pageRight}>
            <View style={S.qrBox}>
              <Text style={S.qrLabel}>QR CODE</Text>
            </View>
            <View style={S.docTitle}>
              <Text style={S.docH2}>Fiche d'Expédition</Text>
              <Text style={S.docRef}>{coNum}</Text>
              <Text style={S.docDate}>Date : {dateStr}</Text>
            </View>
          </View>
        </View>

        {/* ── Addresses ── */}
        <View style={S.addresses}>
          <View style={S.addrBox}>
            <Text style={S.addrTitle}>Émetteur</Text>
            <Text style={S.addrName}>{companyConfig.name}</Text>
            <Text style={S.addrLine}>{companyConfig.address.street}</Text>
            <Text style={S.addrLine}>{companyConfig.address.city}</Text>
            <Text style={S.addrLine}>Tél : {companyConfig.phone}</Text>
          </View>
          <View style={S.addrBox}>
            <Text style={S.addrTitle}>Adressé à</Text>
            <Text style={S.addrName}>{clientName}</Text>
            <Text style={S.addrLine}>{clientVille.toUpperCase()}</Text>
            <Text style={S.addrLine}>{clientTel}</Text>
          </View>
        </View>

        {/* ── Meta ── */}
        <View style={S.metaRow}>
          {[
            { label: "Commercial :", value: commercial },
            { label: "Agence :",     value: agence },
            { label: "Commande :",   value: commande.reference },
          ].map(({ label, value }) => (
            <View key={label} style={{ flexDirection: "row", gap: 4 }}>
              <Text style={S.metaLabel}>{label}</Text>
              <Text>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Products table ── */}
        <View style={S.tableHead}>
          <Text style={[S.tableHCell, S.colDesc]}>Désignation</Text>
          <Text style={[S.tableHCell, S.colQte]}>Qte commande</Text>
          <Text style={[S.tableHCell, S.colQte]}>Qte expédiée</Text>
        </View>
        {commande.lignes.map((l) => (
          <View key={l.id} style={S.tableRow}>
            <Text style={S.colDesc}>{l.produit?.nom || "Produit"}</Text>
            <Text style={S.colQte}>{l.quantite}</Text>
            <Text style={S.colQte}>{/* blank — à remplir manuellement */}</Text>
          </View>
        ))}

        {/* ── Signatures ── */}
        <View style={S.sigsRow}>
          {["Signature / Cachet Expéditeur", "Signature Destinataire"].map((s) => (
            <View key={s} style={S.sigBox}>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>{s}</Text>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <Text style={S.footer}>
          {companyConfig.legalInfo.registrationNumber} — {companyConfig.address.city}, {companyConfig.address.country}
        </Text>

      </Page>
    </Document>
  );
}
