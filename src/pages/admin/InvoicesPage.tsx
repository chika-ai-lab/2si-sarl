import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Receipt, Search, Download, Eye, CheckCircle, Clock, XCircle, AlertCircle, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import { downloadPDF } from "@/lib/pdfDownload";

type FactureStatut = "brouillon" | "envoyee" | "payee" | "en_retard" | "annulee";

interface Facture {
  id: string;
  numero: string;
  client: string;
  dateEmission: string;
  dateEcheance: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  montantPaye: number;
  statut: FactureStatut;
  lignes: { description: string; quantite: number; prixUnitaire: number; total: number }[];
}

const STATUT_CONFIG: Record<FactureStatut, { label: string; color: string; icon: React.ElementType }> = {
  brouillon:  { label: "Brouillon",   color: "bg-gray-100 text-gray-700",     icon: Clock },
  envoyee:    { label: "Envoyée",     color: "bg-blue-100 text-blue-800",     icon: AlertCircle },
  payee:      { label: "Payée",       color: "bg-green-100 text-green-800",   icon: CheckCircle },
  en_retard:  { label: "En retard",   color: "bg-red-100 text-red-800",       icon: XCircle },
  annulee:    { label: "Annulée",     color: "bg-gray-100 text-gray-500",     icon: XCircle },
};

const INITIAL_FACTURES: Facture[] = [
  {
    id: "fct-001", numero: "FAC-2025-001", client: "SARL Diallo & Frères",
    dateEmission: "2025-01-05", dateEcheance: "2025-02-05",
    montantHT: 8474576, tva: 1525424, montantTTC: 10000000, montantPaye: 10000000,
    statut: "payee",
    lignes: [
      { description: "Ordinateur Portable Pro × 10", quantite: 10, prixUnitaire: 850000, total: 8500000 },
    ],
  },
  {
    id: "fct-002", numero: "FAC-2025-002", client: "Groupe TechAfrique",
    dateEmission: "2025-01-12", dateEcheance: "2025-02-12",
    montantHT: 5084745, tva: 915255, montantTTC: 6000000, montantPaye: 3000000,
    statut: "envoyee",
    lignes: [
      { description: "Imprimante Multifonction × 5", quantite: 5, prixUnitaire: 800000, total: 4000000 },
      { description: "Câble Cat6 × 10", quantite: 10, prixUnitaire: 120000, total: 1200000 },
    ],
  },
  {
    id: "fct-003", numero: "FAC-2025-003", client: "BTP Solutions SARL",
    dateEmission: "2024-12-01", dateEcheance: "2025-01-01",
    montantHT: 12711864, tva: 2288136, montantTTC: 15000000, montantPaye: 0,
    statut: "en_retard",
    lignes: [
      { description: "Serveur NAS 4 baies × 5", quantite: 5, prixUnitaire: 1500000, total: 7500000 },
      { description: "Switch 24 ports × 10", quantite: 10, prixUnitaire: 500000, total: 5000000 },
    ],
  },
  {
    id: "fct-004", numero: "FAC-2025-004", client: "Import Export Co",
    dateEmission: "2025-01-20", dateEcheance: "2025-02-20",
    montantHT: 2118644, tva: 381356, montantTTC: 2500000, montantPaye: 2500000,
    statut: "payee",
    lignes: [
      { description: "Téléphone IP HD × 10", quantite: 10, prixUnitaire: 95000, total: 950000 },
      { description: "Onduleur 1 KVA × 3", quantite: 3, prixUnitaire: 350000, total: 1050000 },
    ],
  },
  {
    id: "fct-005", numero: "FAC-2025-005", client: "Cabinet MF Consulting",
    dateEmission: "2025-01-25", dateEcheance: "2025-03-25",
    montantHT: 6779661, tva: 1220339, montantTTC: 8000000, montantPaye: 0,
    statut: "envoyee",
    lignes: [
      { description: "Ordinateur Portable Pro × 8", quantite: 8, prixUnitaire: 850000, total: 6800000 },
    ],
  },
];

export function InvoicesPage() {
  const [factures, setFactures] = useState<Facture[]>(INITIAL_FACTURES);
  const [search, setSearch]     = useState("");
  const [statutFilter, setStatutFilter] = useState<FactureStatut | "all">("all");
  const [selected, setSelected] = useState<Facture | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered = factures.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.numero.toLowerCase().includes(q) || f.client.toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || f.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const stats = {
    total:    factures.length,
    totalTTC: factures.filter((f) => f.statut !== "annulee").reduce((s, f) => s + f.montantTTC, 0),
    paye:     factures.filter((f) => f.statut === "payee").reduce((s, f) => s + f.montantTTC, 0),
    impaye:   factures.filter((f) => ["envoyee", "en_retard"].includes(f.statut)).reduce((s, f) => s + (f.montantTTC - f.montantPaye), 0),
    retard:   factures.filter((f) => f.statut === "en_retard").length,
  };

  const handleMarquerPayee = (id: string) => {
    setFactures((prev) => prev.map((f) =>
      f.id === id ? { ...f, statut: "payee", montantPaye: f.montantTTC } : f
    ));
    toast({ title: "Facture marquée comme payée" });
  };

  const handleDownload = async (f: Facture) => {
    setDownloading(f.id);
    try {
      await downloadPDF(
        <InvoicePDF data={{ ...f, statutLabel: STATUT_CONFIG[f.statut].label }} />,
        `${f.numero}.pdf`
      );
      toast({ title: `${f.numero} téléchargé` });
    } catch {
      toast({ title: "Erreur lors de la génération du PDF", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.numero}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Client</p><p className="font-semibold">{selected.client}</p></div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={STATUT_CONFIG[selected.statut].color}>
                    {STATUT_CONFIG[selected.statut].label}
                  </Badge>
                </div>
                <div><p className="text-muted-foreground">Date émission</p><p>{new Date(selected.dateEmission).toLocaleDateString("fr-FR")}</p></div>
                <div><p className="text-muted-foreground">Échéance</p><p>{new Date(selected.dateEcheance).toLocaleDateString("fr-FR")}</p></div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.lignes.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell>{l.description}</TableCell>
                        <TableCell className="text-right">{l.quantite}</TableCell>
                        <TableCell className="text-right">{formatCurrency(l.prixUnitaire)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(l.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-end">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selected)}
                  disabled={downloading === selected.id}
                >
                  {downloading === selected.id
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Download className="mr-2 h-4 w-4" />}
                  Télécharger PDF
                </Button>
                <div className="w-56 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sous-total HT</span><span>{formatCurrency(selected.montantHT)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">TVA (18%)</span><span>{formatCurrency(selected.tva)}</span></div>
                  <hr />
                  <div className="flex justify-between font-bold text-base"><span>Total TTC</span><span>{formatCurrency(selected.montantTTC)}</span></div>
                  <div className="flex justify-between text-green-600"><span>Payé</span><span>{formatCurrency(selected.montantPaye)}</span></div>
                  {selected.montantTTC - selected.montantPaye > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Reste à payer</span><span>{formatCurrency(selected.montantTTC - selected.montantPaye)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Receipt className="h-6 w-6 sm:h-7 sm:w-7" /> Factures
            </h2>
            <p className="text-muted-foreground text-sm">Gestion et suivi des factures clients</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Total factures</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Montant total</p>
              <p className="text-sm sm:text-xl font-bold">{formatCurrency(stats.totalTTC)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground text-green-700">Encaissé</p>
              <p className="text-sm sm:text-xl font-bold text-green-600">{formatCurrency(stats.paye)}</p>
            </CardContent>
          </Card>
          <Card className={stats.retard > 0 ? "border-red-200" : ""}>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Impayé / En retard</p>
              <p className={`text-sm sm:text-xl font-bold ${stats.impaye > 0 ? "text-red-600" : ""}`}>
                {formatCurrency(stats.impaye)}
              </p>
              {stats.retard > 0 && (
                <Badge variant="destructive" className="mt-1 text-xs">{stats.retard} en retard</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Numéro ou client..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as FactureStatut | "all")}>
                <SelectTrigger className="w-40 sm:w-44"><SelectValue placeholder="Tous" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoyee">Envoyée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{filtered.length} facture(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ── Mobile card list (< md) ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((f) => {
                const cfg = STATUT_CONFIG[f.statut];
                const Icon = cfg.icon;
                return (
                  <div key={f.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{f.numero}</p>
                        <p className="font-semibold truncate">{f.client}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(f.dateEmission).toLocaleDateString("fr-FR")}
                          {" → "}
                          <span className={f.statut === "en_retard" ? "text-red-600 font-semibold" : ""}>
                            {new Date(f.dateEcheance).toLocaleDateString("fr-FR")}
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(f.montantTTC)}</p>
                        <Badge variant="outline" className={`${cfg.color} mt-1 text-xs`}>
                          <Icon className="mr-1 h-3 w-3" />{cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelected(f)}>
                        <Eye className="mr-1 h-3 w-3" />Voir
                      </Button>
                      <Button
                        size="sm" variant="outline" className="flex-1"
                        onClick={() => handleDownload(f)}
                        disabled={downloading === f.id}
                      >
                        {downloading === f.id
                          ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          : <Download className="mr-1 h-3 w-3" />}
                        PDF
                      </Button>
                      {(f.statut === "envoyee" || f.statut === "en_retard") && (
                        <Button size="sm" className="flex-1" onClick={() => handleMarquerPayee(f.id)}>
                          <CheckCircle className="mr-1 h-3 w-3" />Payée
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Émission</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Montant TTC</TableHead>
                    <TableHead className="text-right">Payé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f) => {
                    const cfg = STATUT_CONFIG[f.statut];
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono font-medium">{f.numero}</TableCell>
                        <TableCell className="font-medium">{f.client}</TableCell>
                        <TableCell className="text-sm">{new Date(f.dateEmission).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className={`text-sm ${f.statut === "en_retard" ? "text-red-600 font-semibold" : ""}`}>
                          {new Date(f.dateEcheance).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(f.montantTTC)}</TableCell>
                        <TableCell className="text-right">
                          <span className={f.montantPaye >= f.montantTTC ? "text-green-600 font-semibold" : "text-orange-600"}>
                            {formatCurrency(f.montantPaye)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.color}>
                            <Icon className="mr-1 h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelected(f)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              onClick={() => handleDownload(f)}
                              disabled={downloading === f.id}
                              title="Télécharger PDF"
                            >
                              {downloading === f.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Download className="h-4 w-4" />}
                            </Button>
                            {(f.statut === "envoyee" || f.statut === "en_retard") && (
                              <Button variant="outline" size="sm" onClick={() => handleMarquerPayee(f.id)}>
                                <CheckCircle className="mr-1 h-3 w-3" />Payée
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default InvoicesPage;
