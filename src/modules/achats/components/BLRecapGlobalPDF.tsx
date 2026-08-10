import { useQuery } from "@tanstack/react-query";
import {
  Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink,
} from "@react-pdf/renderer";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { companyConfig } from "@/config/company.config";

const S = StyleSheet.create({
  page:        { padding: "28 36", fontSize: 9, fontFamily: "Helvetica", color: "#111" },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  companyLine: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  docBadge:    { backgroundColor: "#1d4ed8", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  docBadgeText:{ color: "#fff", fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  docRef:      { fontSize: 9, color: "#374151", textAlign: "right", marginTop: 4 },
  docDate:     { fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 2 },
  divider:     { borderBottom: "1px solid #e5e7eb", marginBottom: 14 },
  notice:      { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4,
                 padding: "6 10", marginBottom: 12, fontSize: 8, color: "#1e40af" },
  thead:       { flexDirection: "row", backgroundColor: "#111", padding: "5 8" },
  thText:      { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase" },
  trow:        { flexDirection: "row", borderBottom: "1px solid #f3f4f6", padding: "5 8", minHeight: 20 },
  trowAlt:     { backgroundColor: "#f9fafb" },
  tdText:      { fontSize: 9, color: "#111" },
  tdSub:       { fontSize: 7, color: "#9ca3af", marginTop: 1 },
  cNum:        { width: 20, textAlign: "center" },
  cClient:     { width: 100 },
  cDesc:       { flex: 1 },
  cRef:        { width: 70 },
  cQty:        { width: 32, textAlign: "center" },
  cAdresse:    { width: 90 },
  totalRow:    { flexDirection: "row", justifyContent: "flex-end", padding: "5 8", borderTop: "2px solid #111", marginTop: 4 },
  totalText:   { fontSize: 9, fontFamily: "Helvetica-Bold" },
  footer:      { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between" },
  footerText:  { fontSize: 7, color: "#9ca3af" },
  sigSection:  { marginTop: 24 },
  sigTitle:    { fontSize: 8, color: "#6b7280", fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 8 },
  sigs:        { flexDirection: "row", gap: 10 },
  sigBox:      { flex: 1, border: "1px solid #d1d5db", borderRadius: 4, padding: "8 10", minHeight: 60 },
  sigLabel:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151", marginBottom: 3 },
  sigSub:      { fontSize: 7, color: "#9ca3af" },
  sigLine:     { borderBottom: "1px solid #d1d5db", marginTop: 36, marginBottom: 4 },
});

function formatDate(d?: string) {
  if (!d) return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function RecapDoc({ data, bdcLabel }: { data: any; bdcLabel: string }) {
  const { bdc, produits = [] } = data ?? {};
  const ref = bdc?.numero || bdcLabel;
  const total = produits.reduce((s: number, p: any) => s + Number(p.quantite || 0), 0);

  return (
    <Document title={`Récapitulatif Livraisons — ${ref}`}>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Sen Services International</Text>
            <Text style={S.companyLine}>Informatique · Électronique · Électroménager · BTP</Text>
            <Text style={S.companyLine}>{companyConfig.address.street}, {companyConfig.address.city}  ·  contact@sen-services.com</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={S.docBadge}>
              <Text style={S.docBadgeText}>BON DE LIVRAISON GLOBAL</Text>
            </View>
            <Text style={S.docRef}>BDC : {ref}</Text>
            <Text style={S.docDate}>Date : {formatDate(bdc?.date)}</Text>
          </View>
        </View>

        <View style={S.divider} />

        <View style={S.notice}>
          <Text>Document interne — récapitulatif de toutes les livraisons du bon de commande {ref}. Chaque ligne indique le client destinataire.</Text>
        </View>

        {/* Tableau */}
        <View style={S.thead}>
          <Text style={[S.thText, S.cNum]}>#</Text>
          <Text style={[S.thText, S.cClient]}>Client destinataire</Text>
          <Text style={[S.thText, S.cDesc]}>Désignation</Text>
          <Text style={[S.thText, S.cRef]}>Référence</Text>
          <Text style={[S.thText, S.cQty]}>Qté</Text>
          <Text style={[S.thText, S.cAdresse]}>Adresse</Text>
        </View>

        {produits.length === 0 ? (
          <View style={S.trow}>
            <Text style={[S.tdText, { color: "#9ca3af" }]}>Aucun article</Text>
          </View>
        ) : produits.map((p: any, i: number) => (
          <View key={i} style={[S.trow, i % 2 === 1 ? S.trowAlt : {}]}>
            <Text style={[S.tdText, S.cNum]}>{i + 1}</Text>
            <View style={S.cClient}>
              <Text style={S.tdText}>{p.client_nom || "—"}</Text>
              {p.client_agence && <Text style={S.tdSub}>{p.client_agence}</Text>}
            </View>
            <View style={S.cDesc}>
              <Text style={S.tdText}>{p.designation || "—"}</Text>
              {p.marque && <Text style={S.tdSub}>{p.marque}</Text>}
            </View>
            <Text style={[S.tdText, S.cRef]}>{p.reference || "—"}</Text>
            <Text style={[S.tdText, S.cQty]}>{p.quantite}</Text>
            <Text style={[S.tdText, S.cAdresse]}>{p.adresse_livraison || "—"}</Text>
          </View>
        ))}

        <View style={S.totalRow}>
          <Text style={S.totalText}>
            Total : {total} article{total > 1 ? "s" : ""} · {produits.length} ligne{produits.length > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Signatures */}
        <View style={S.sigSection}>
          <Text style={S.sigTitle}>Visa expédition</Text>
          <View style={S.sigs}>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Responsable logistique</Text>
              <Text style={S.sigSub}>Nom & signature</Text>
              <View style={S.sigLine} />
              <Text style={S.sigSub}>Date : ____/____/________</Text>
            </View>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Chauffeur / Livreur</Text>
              <Text style={S.sigSub}>Nom & CIN</Text>
              <View style={S.sigLine} />
              <Text style={S.sigSub}>Date : ____/____/________</Text>
            </View>
          </View>
        </View>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>2SI SARL — BL Récapitulatif Global</Text>
          <Text style={S.footerText}>{ref}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

interface Props { bdcId: number; bdcLabel: string; onClose: () => void; }

export default function BLRecapGlobalPDF({ bdcId, bdcLabel, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bl-recap-global", bdcId],
    queryFn: () => apiClient.get<any>(`/bordereau-livraisons/groupe/${bdcId}/global`),
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Chargement…</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-destructive text-sm">
      Erreur lors du chargement.
    </div>
  );

  const fileName = `BL-global-${bdcLabel.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="flex justify-between items-center px-4 py-3 border-b shrink-0">
        <div>
          <h2 className="font-semibold text-sm">BL Global — {bdcLabel}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data?.produits?.length ?? 0} ligne(s) · tous clients confondus
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadLink document={<RecapDoc data={data} bdcLabel={bdcLabel} />} fileName={fileName}>
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
      <div className="flex-1 min-h-0">
        <PDFViewer width="100%" height="100%" showToolbar>
          <RecapDoc data={data} bdcLabel={bdcLabel} />
        </PDFViewer>
      </div>
    </div>
  );
}
