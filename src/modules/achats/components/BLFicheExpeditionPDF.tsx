import { useQuery } from "@tanstack/react-query";
import {
  Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink,
} from "@react-pdf/renderer";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:       { padding: "28 36", fontSize: 9, fontFamily: "Helvetica", color: "#111", backgroundColor: "#fff" },

  // Header
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  companyName:{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#111" },
  companyLine:{ fontSize: 8, color: "#6b7280", marginTop: 2 },
  docBadge:   { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  docBadgeText:{ color: "#fff", fontSize: 13, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  docRef:     { fontSize: 9, color: "#374151", textAlign: "right", marginTop: 4 },
  docDate:    { fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 2 },

  // Divider
  divider:    { borderBottom: "1px solid #e5e7eb", marginBottom: 12 },

  // Parties
  parties:    { flexDirection: "row", gap: 10, marginBottom: 12 },
  partyBox:   { flex: 1, border: "1px solid #d1d5db", borderRadius: 4, padding: "8 10" },
  partyLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 },
  partyName:  { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyLine:  { fontSize: 8, color: "#374151", marginTop: 1 },

  // Adresse livraison
  addrBox:    { backgroundColor: "#f9fafb", border: "1px solid #d1d5db", borderRadius: 4, padding: "8 10", marginBottom: 12 },

  addrLabel:  { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  addrText:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111" },

  // Table
  thead:      { flexDirection: "row", backgroundColor: "#111", padding: "5 8", borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  thText:     { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase" },
  trow:       { flexDirection: "row", borderBottom: "1px solid #f3f4f6", padding: "6 8", minHeight: 22 },
  trowAlt:    { backgroundColor: "#f9fafb" },
  tdText:     { fontSize: 9, color: "#111" },
  tdSub:      { fontSize: 7, color: "#9ca3af", marginTop: 1 },

  // Colonnes
  cNum:       { width: 22, textAlign: "center" },
  cDesc:      { flex: 1 },
  cRef:       { width: 80 },
  cQty:       { width: 42, textAlign: "center" },
  cUnit:      { width: 36, textAlign: "center" },
  cObs:       { width: 70 },

  // Total
  totalRow:   { flexDirection: "row", justifyContent: "flex-end", padding: "5 8", borderTop: "2px solid #111" },
  totalText:  { fontSize: 9, fontFamily: "Helvetica-Bold" },

  // Signatures
  sigSection: { marginTop: 28 },
  sigTitle:   { fontSize: 8, color: "#6b7280", fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 10 },
  sigs:       { flexDirection: "row", gap: 10 },
  sigBox:     { flex: 1, border: "1px solid #d1d5db", borderRadius: 4, padding: "8 10", minHeight: 70 },
  sigLabel:   { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151", marginBottom: 4 },
  sigSub:     { fontSize: 7, color: "#9ca3af" },
  sigLine:    { borderBottom: "1px solid #d1d5db", marginTop: 40, marginBottom: 4 },

  // Footer
  footer:     { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d?: string) {
  if (!d) return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Document PDF ─────────────────────────────────────────────────────────────

function BLDoc({ data }: { data: any }) {
  const { bl, client, commercial, produits = [] } = data ?? {};
  const ref = bl?.num || `BL-${String(bl?.id || 0).padStart(4, "0")}`;
  const adresse = bl?.note || client?.adresse || "—";
  const totalArticles = produits.reduce((s: number, p: any) => s + Number(p.quantite || 0), 0);

  return (
    <Document title={`Bordereau de Livraison ${ref}`}>
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <View>
            <Text style={S.companyName}>Sen Services International</Text>
            <Text style={S.companyLine}>Informatique · Électronique · Électroménager · BTP</Text>
            <Text style={S.companyLine}>Sicap Amitié villa n 4337, Dakar  ·  contact@sen-services.com</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={S.docBadge}>
              <Text style={S.docBadgeText}>BORDEREAU DE LIVRAISON</Text>
            </View>
            <Text style={S.docRef}>N° {ref}</Text>
            <Text style={S.docDate}>Date : {formatDate(bl?.date)}</Text>
            {commercial?.nom_complet && (
              <Text style={S.docDate}>Commercial : {commercial.nom_complet}</Text>
            )}
          </View>
        </View>

        <View style={S.divider} />

        {/* ── Expéditeur / Destinataire ── */}
        <View style={S.parties}>
          <View style={S.partyBox}>
            <Text style={S.partyLabel}>Expéditeur</Text>
            <Text style={S.partyName}>Sen Services International</Text>
            <Text style={S.partyLine}>Avenue Bourguiba, Sicap Amitié villa n 4337</Text>
            <Text style={S.partyLine}>Tel : +221 33 864 48 48 / 77 225 83 83</Text>
          </View>
          <View style={S.partyBox}>
            <Text style={S.partyLabel}>Destinataire</Text>
            <Text style={S.partyName}>{client?.nom_complet || "—"}</Text>
            {client?.telephone && <Text style={S.partyLine}>Tel : {client.telephone}</Text>}
            {client?.email     && <Text style={S.partyLine}>{client.email}</Text>}
            {client?.agence_nom && <Text style={S.partyLine}>Agence : {client.agence_nom}</Text>}
          </View>
        </View>

        {/* ── Adresse de livraison ── */}
        <View style={S.addrBox}>
          <View style={{ flex: 1 }}>
            <Text style={S.addrLabel}>Adresse de livraison</Text>
            <Text style={S.addrText}>{adresse}</Text>
          </View>
        </View>

        {/* ── Tableau articles ── */}
        <View style={S.thead}>
          <Text style={[S.thText, S.cNum]}>#</Text>
          <Text style={[S.thText, S.cDesc]}>Désignation</Text>
          <Text style={[S.thText, S.cRef]}>Référence</Text>
          <Text style={[S.thText, S.cQty]}>Qté</Text>
          <Text style={[S.thText, S.cUnit]}>Unité</Text>
          <Text style={[S.thText, S.cObs]}>Observations</Text>
        </View>

        {produits.length === 0 ? (
          <View style={S.trow}>
            <Text style={[S.tdText, S.cDesc, { color: "#9ca3af" }]}>Aucun article associé</Text>
          </View>
        ) : produits.map((p: any, i: number) => (
          <View key={i} style={[S.trow, i % 2 === 1 ? S.trowAlt : {}]}>
            <Text style={[S.tdText, S.cNum]}>{i + 1}</Text>
            <View style={S.cDesc}>
              <Text style={S.tdText}>{p.designation || p.libelle || "—"}</Text>
              {p.marque && <Text style={S.tdSub}>{p.marque}</Text>}
            </View>
            <Text style={[S.tdText, S.cRef]}>{p.reference || "—"}</Text>
            <Text style={[S.tdText, S.cQty]}>{p.quantite}</Text>
            <Text style={[S.tdText, S.cUnit]}>pce</Text>
            <Text style={[S.tdText, S.cObs]}></Text>
          </View>
        ))}

        <View style={S.totalRow}>
          <Text style={S.totalText}>Total : {totalArticles} article{totalArticles > 1 ? "s" : ""} ({produits.length} ligne{produits.length > 1 ? "s" : ""})</Text>
        </View>

        {/* ── Signatures ── */}
        <View style={S.sigSection}>
          <Text style={S.sigTitle}>Accusé de réception</Text>
          <View style={S.sigs}>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Responsable expédition</Text>
              <Text style={S.sigSub}>Nom & signature</Text>
              <View style={S.sigLine} />
              <Text style={S.sigSub}>Date : ____/____/________</Text>
            </View>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Chauffeur / Livreur</Text>
              <Text style={S.sigSub}>Nom & CIN :</Text>
              <View style={S.sigLine} />
              <Text style={S.sigSub}>Date : ____/____/________</Text>
            </View>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Client destinataire</Text>
              <Text style={S.sigSub}>Nom, cachet & signature</Text>
              <View style={S.sigLine} />
              <Text style={S.sigSub}>Date : ____/____/________</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>2SI SARL — Bordereau de Livraison</Text>
          <Text style={S.footerText}>{ref} — {formatDate(bl?.date)}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

interface Props { blId: number; onClose: () => void; }

export default function BLFicheExpeditionPDF({ blId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bl-print", blId],
    queryFn: () => apiClient.get<any>(`/bordereau-livraisons/${blId}/print`),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-destructive text-sm">
      Erreur lors du chargement du bordereau.
    </div>
  );

  const ref = data?.bl?.num || `BL-${String(blId).padStart(4, "0")}`;

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="flex justify-between items-center px-4 py-3 border-b shrink-0">
        <div>
          <h2 className="font-semibold text-sm">Bordereau de Livraison — {ref}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data?.client?.nom_complet} · {data?.produits?.length ?? 0} article(s)
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadLink document={<BLDoc data={data} />} fileName={`BL-${ref}.pdf`}>
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
          <BLDoc data={data} />
        </PDFViewer>
      </div>
    </div>
  );
}
