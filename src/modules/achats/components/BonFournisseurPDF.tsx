import {
  Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:        { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  header:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  company:     { fontSize: 14, fontFamily: "Helvetica-Bold" },
  subtitle:    { fontSize: 9, color: "#6b7280", marginTop: 2 },
  docTitle:    { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "right" },
  docRef:      { fontSize: 9, color: "#6b7280", textAlign: "right", marginTop: 2 },
  box:         { border: "1px solid #e5e7eb", borderRadius: 4, padding: 10, marginBottom: 14 },
  label:       { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 },
  bold:        { fontFamily: "Helvetica-Bold" },
  small:       { fontSize: 9, color: "#6b7280", marginTop: 2 },
  table:       { marginBottom: 14 },
  thead:       { flexDirection: "row", backgroundColor: "#f3f4f6", borderBottom: "1px solid #d1d5db" },
  trow:        { flexDirection: "row", borderBottom: "1px solid #e5e7eb" },
  trowTotal:   { flexDirection: "row", backgroundColor: "#f9fafb", borderTop: "1px solid #d1d5db" },
  thDesig:     { flex: 1, padding: "5 8", fontSize: 9, fontFamily: "Helvetica-Bold" },
  tdDesig:     { flex: 1, padding: "5 8", fontSize: 9 },
  thQty:       { width: 40, padding: "5 4", fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center" },
  tdQty:       { width: 40, padding: "5 4", fontSize: 9, textAlign: "center" },
  thPrice:     { width: 80, padding: "5 8", fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "right" },
  tdPrice:     { width: 80, padding: "5 8", fontSize: 9, textAlign: "right" },
  sigs:        { flexDirection: "row", marginTop: 40, gap: 40 },
  sigBox:      { flex: 1, borderTop: "1px solid #e5e7eb", paddingTop: 6, fontSize: 9, color: "#9ca3af" },
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ligne { designation: string; quantite: number; prix: number; montant: number; }
interface CF {
  id: number; date: string; montant: number; etat: string; note: string | null;
  fournisseur?: { id: number; nomComplet: string; adresse?: string; telephone?: string; email?: string };
  lignes: Ligne[];
}

// ─── Document PDF ─────────────────────────────────────────────────────────────

function BonFournisseurDoc({ cf }: { cf: CF }) {
  const ref = `CF-${String(cf.id).padStart(4, "0")}`;
  const dateStr = cf.date
    ? new Date(cf.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR");
  const total = cf.lignes.reduce((s, l) => s + Number(l.montant), 0) || Number(cf.montant);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " FCFA";

  return (
    <Document title={`Bon Fournisseur ${ref}`}>
      <Page size="A4" style={S.page}>
        {/* En-tête */}
        <View style={S.header}>
          <View>
            <Text style={S.company}>Sen Services International</Text>
            <Text style={S.subtitle}>Informatique · Électronique · Électroménager · BTP</Text>
            <Text style={S.subtitle}>Tel: 33 864 48 48 / 77 225 83 83 / 77 420 90 03</Text>
          </View>
          <View>
            <Text style={S.docTitle}>Bon de Commande Fournisseur</Text>
            <Text style={S.docRef}>Réf : {ref}</Text>
            <Text style={S.docRef}>Date : {dateStr}</Text>
          </View>
        </View>

        {/* Fournisseur */}
        <View style={S.box}>
          <Text style={S.label}>Fournisseur</Text>
          <Text style={S.bold}>{cf.fournisseur?.nomComplet || "—"}</Text>
          {cf.fournisseur?.adresse   && <Text style={S.small}>{cf.fournisseur.adresse}</Text>}
          {cf.fournisseur?.telephone && <Text style={S.small}>Tél : {cf.fournisseur.telephone}</Text>}
          {cf.fournisseur?.email     && <Text style={S.small}>Email : {cf.fournisseur.email}</Text>}
        </View>

        {/* Tableau */}
        <View style={S.table}>
          <View style={S.thead}>
            <Text style={S.thDesig}>Désignation</Text>
            <Text style={S.thQty}>Qté</Text>
            <Text style={S.thPrice}>Prix unit.</Text>
            <Text style={S.thPrice}>Montant</Text>
          </View>
          {cf.lignes.length === 0 ? (
            <View style={S.trow}>
              <Text style={{ ...S.tdDesig, color: "#9ca3af" }}>Aucun article</Text>
            </View>
          ) : cf.lignes.map((l, i) => (
            <View key={i} style={S.trow}>
              <Text style={S.tdDesig}>{l.designation}</Text>
              <Text style={S.tdQty}>{l.quantite}</Text>
              <Text style={S.tdPrice}>{fmt(Number(l.prix))}</Text>
              <Text style={{ ...S.tdPrice, fontFamily: "Helvetica-Bold" }}>{fmt(Number(l.montant))}</Text>
            </View>
          ))}
          <View style={S.trowTotal}>
            <Text style={{ ...S.thDesig, textAlign: "right" }}>Total</Text>
            <Text style={S.thQty}> </Text>
            <Text style={S.thPrice}> </Text>
            <Text style={{ ...S.thPrice }}>{fmt(total)}</Text>
          </View>
        </View>

        {cf.note && <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic", marginBottom: 10 }}>Note : {cf.note}</Text>}

        {/* Signatures */}
        <View style={S.sigs}>
          <View style={S.sigBox}><Text>Signature responsable 2SI</Text></View>
          <View style={S.sigBox}><Text>Cachet & signature fournisseur</Text></View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props { cf: CF; onClose: () => void; }

export default function BonFournisseurPDF({ cf, onClose }: Props) {
  const ref = `CF-${String(cf.id).padStart(4, "0")}`;

  return (
    <div className="flex flex-col h-[90vh]">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-3 border-b shrink-0">
        <h2 className="font-semibold">Bon Fournisseur — {ref}</h2>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={<BonFournisseurDoc cf={cf} />}
            fileName={`bon-fournisseur-${ref}.pdf`}
          >
            {({ loading }) => (
              <Button size="sm" disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Génération…" : "Télécharger PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button size="sm" variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>

      {/* Visionneuse PDF */}
      <div className="flex-1">
        <PDFViewer width="100%" height="100%" showToolbar>
          <BonFournisseurDoc cf={cf} />
        </PDFViewer>
      </div>
    </div>
  );
}
