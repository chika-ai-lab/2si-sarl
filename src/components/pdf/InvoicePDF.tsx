import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface InvoicePDFData {
  numero: string;
  client: string;
  dateEmission: string;
  dateEcheance: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  montantPaye: number;
  statut: string;
  statutLabel: string;
  lignes: {
    description: string;
    quantite: number;
    prixUnitaire: number;
    total: number;
  }[];
}

const BLUE = '#1e40af';
const GRAY = '#6b7280';
const GREEN = '#16a34a';
const RED = '#dc2626';

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';

const s = StyleSheet.create({
  page: {
    paddingTop: 45, paddingBottom: 60,
    paddingLeft: 45, paddingRight: 45,
    fontSize: 10, fontFamily: 'Helvetica', color: '#111827',
  },

  /* ── Header ─────────────────────────────────────── */
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  companyName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: BLUE, marginBottom: 4 },
  companyLine: { fontSize: 9, color: GRAY, marginBottom: 2 },
  docTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: BLUE, textAlign: 'right', marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  metaLabel: { fontSize: 9, color: GRAY, width: 65 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },

  divider: { borderBottomWidth: 2, borderBottomColor: BLUE, marginBottom: 20 },

  /* ── Client ──────────────────────────────────────── */
  sectionLabel: {
    fontSize: 8, color: GRAY, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5,
  },
  clientName: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 2 },

  /* ── Table ───────────────────────────────────────── */
  tableHead: {
    flexDirection: 'row', backgroundColor: BLUE,
    paddingVertical: 7, paddingHorizontal: 10, borderRadius: 3,
  },
  thCell: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8, paddingHorizontal: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  cDesc: { flex: 4 },
  cQty:  { flex: 1, textAlign: 'right' },
  cPU:   { flex: 2, textAlign: 'right' },
  cTot:  { flex: 2, textAlign: 'right' },

  /* ── Totals ──────────────────────────────────────── */
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, marginBottom: 16 },
  totalsBox: { width: 270 },
  tLine: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4, paddingHorizontal: 4,
  },
  tLabel: { fontSize: 10, color: GRAY },
  tValue: { fontSize: 10 },
  tFinalBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: BLUE, borderRadius: 4,
    paddingVertical: 10, paddingHorizontal: 12, marginTop: 6,
  },
  tFinalText: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

  /* ── Status badge ─────────────────────────────────── */
  statusBadge: {
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: 4, alignSelf: 'flex-start', marginTop: 6,
  },
  statusText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },

  /* ── Footer ──────────────────────────────────────── */
  footer: {
    position: 'absolute', bottom: 28, left: 45, right: 45,
    borderTopWidth: 0.5, borderTopColor: '#e5e7eb',
    paddingTop: 8, textAlign: 'center', fontSize: 8, color: '#9ca3af',
  },
});

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const reste = data.montantTTC - data.montantPaye;
  const isPaid = reste <= 0;
  const isLate = data.statut === 'en_retard';
  const statusColor = isPaid ? GREEN : isLate ? RED : BLUE;

  return (
    <Document title={data.numero} author="2SI.Sarl">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>2SI.Sarl</Text>
            <Text style={s.companyLine}>Solutions Informatiques &amp; Services Intégrés</Text>
            <Text style={s.companyLine}>BP 1234, Dakar — Sénégal</Text>
            <Text style={s.companyLine}>contact@2si.sn · +221 33 XXX XX XX</Text>
          </View>
          <View>
            <Text style={s.docTitle}>FACTURE</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Numéro</Text>
              <Text style={s.metaValue}>{data.numero}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Émise le</Text>
              <Text style={s.metaValue}>{new Date(data.dateEmission).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Échéance</Text>
              <Text style={s.metaValue}>{new Date(data.dateEcheance).toLocaleDateString('fr-FR')}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Client ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={s.sectionLabel}>Facturer à</Text>
          <Text style={s.clientName}>{data.client}</Text>
        </View>

        {/* ── Items table ── */}
        <View style={s.tableHead}>
          <Text style={[s.thCell, s.cDesc]}>Description</Text>
          <Text style={[s.thCell, s.cQty]}>Qté</Text>
          <Text style={[s.thCell, s.cPU]}>Prix unitaire</Text>
          <Text style={[s.thCell, s.cTot]}>Total HT</Text>
        </View>
        {data.lignes.map((l, i) => (
          <View key={i} style={i % 2 !== 0 ? [s.tableRow, s.tableRowAlt] : s.tableRow}>
            <Text style={s.cDesc}>{l.description}</Text>
            <Text style={s.cQty}>{l.quantite}</Text>
            <Text style={s.cPU}>{fmt(l.prixUnitaire)}</Text>
            <Text style={[s.cTot, { fontFamily: 'Helvetica-Bold' }]}>{fmt(l.total)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.tLine}>
              <Text style={s.tLabel}>Sous-total HT</Text>
              <Text style={s.tValue}>{fmt(data.montantHT)}</Text>
            </View>
            <View style={s.tLine}>
              <Text style={s.tLabel}>TVA (18%)</Text>
              <Text style={s.tValue}>{fmt(data.tva)}</Text>
            </View>
            <View style={s.tFinalBox}>
              <Text style={s.tFinalText}>TOTAL TTC</Text>
              <Text style={s.tFinalText}>{fmt(data.montantTTC)}</Text>
            </View>
            {data.montantPaye > 0 && (
              <View style={s.tLine}>
                <Text style={[s.tLabel, { color: GREEN }]}>Déjà payé</Text>
                <Text style={[s.tValue, { color: GREEN }]}>{fmt(data.montantPaye)}</Text>
              </View>
            )}
            {reste > 0 && (
              <View style={s.tLine}>
                <Text style={[s.tLabel, { color: RED, fontFamily: 'Helvetica-Bold' }]}>Reste à payer</Text>
                <Text style={[s.tValue, { color: RED, fontFamily: 'Helvetica-Bold' }]}>{fmt(reste)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Status badge ── */}
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20', borderWidth: 1, borderColor: statusColor }]}>
          <Text style={[s.statusText, { color: statusColor }]}>
            {data.statutLabel.toUpperCase()}
          </Text>
        </View>

        {/* ── Footer ── */}
        <Text style={s.footer}>
          2SI.Sarl — NINEA : XXXXXXXX — RC : SN.DKR.XXXX — Ce document fait foi de facture officielle.
        </Text>
      </Page>
    </Document>
  );
}
