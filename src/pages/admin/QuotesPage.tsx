import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Search, Plus, Clock, CheckCircle, XCircle, ArrowRight,
  Eye, Download, Copy, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { QuotePDF } from "@/components/pdf/QuotePDF";
import { downloadPDF } from "@/lib/pdfDownload";

type DevisStatut = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

interface LigneDevis { description: string; quantite: number; prixUnitaire: number; remise: number; total: number }

interface Devis {
  id: string;
  numero: string;
  client: string;
  dateCreation: string;
  dateValidite: string;
  lignes: LigneDevis[];
  sousTotal: number;
  remiseTotale: number;
  tva: number;
  total: number;
  statut: DevisStatut;
  notes?: string;
}

const STATUT_CONFIG: Record<DevisStatut, { label: string; color: string; icon: React.ElementType }> = {
  brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-700",    icon: FileText },
  envoye:    { label: "Envoyé",   color: "bg-blue-100 text-blue-800",    icon: Clock },
  accepte:   { label: "Accepté",  color: "bg-green-100 text-green-800",  icon: CheckCircle },
  refuse:    { label: "Refusé",   color: "bg-red-100 text-red-800",      icon: XCircle },
  expire:    { label: "Expiré",   color: "bg-gray-100 text-gray-500",    icon: Clock },
};

function buildDevis(
  id: string, numero: string, client: string, dateCreation: string, dateValidite: string,
  statut: DevisStatut, lignes: Omit<LigneDevis, "total">[], notes?: string
): Devis {
  const computed = lignes.map((l) => ({
    ...l,
    total: l.quantite * l.prixUnitaire * (1 - l.remise / 100),
  }));
  const sousTotal = computed.reduce((s, l) => s + l.total, 0);
  const remiseTotale = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * l.remise / 100, 0);
  const tva = sousTotal * 0.18;
  return { id, numero, client, dateCreation, dateValidite, statut, lignes: computed, sousTotal, remiseTotale, tva, total: sousTotal + tva, notes };
}

const INITIAL_DEVIS: Devis[] = [
  buildDevis("dv-001", "DEV-2025-001", "SARL Diallo & Frères", "2025-01-10", "2025-02-10", "accepte",
    [{ description: "Ordinateur Portable Pro", quantite: 10, prixUnitaire: 850000, remise: 5 }]),
  buildDevis("dv-002", "DEV-2025-002", "BTP Solutions SARL", "2025-01-15", "2025-02-15", "envoye",
    [
      { description: "Serveur NAS 4 baies", quantite: 3, prixUnitaire: 1500000, remise: 10 },
      { description: "Switch 24 ports", quantite: 5, prixUnitaire: 500000, remise: 0 },
    ], "Offre spéciale partenariat"),
  buildDevis("dv-003", "DEV-2025-003", "Cabinet MF Consulting", "2025-01-20", "2025-02-20", "brouillon",
    [
      { description: "Ordinateur Portable Pro", quantite: 5, prixUnitaire: 850000, remise: 0 },
      { description: "Écran 27\" QHD", quantite: 5, prixUnitaire: 185000, remise: 0 },
    ]),
  buildDevis("dv-004", "DEV-2025-004", "Import Export Co", "2024-12-01", "2025-01-01", "expire",
    [{ description: "Téléphone IP HD", quantite: 20, prixUnitaire: 95000, remise: 8 }]),
  buildDevis("dv-005", "DEV-2025-005", "Groupe TechAfrique", "2025-01-22", "2025-02-22", "refuse",
    [{ description: "Onduleur 1 KVA", quantite: 10, prixUnitaire: 350000, remise: 0 }],
    "Client a préféré un concurrent"),
];

export function QuotesPage() {
  const [devis, setDevis]     = useState<Devis[]>(INITIAL_DEVIS);
  const [search, setSearch]   = useState("");
  const [statutFilter, setStatutFilter] = useState<DevisStatut | "all">("all");
  const [selected, setSelected]         = useState<Devis | null>(null);
  const [downloading, setDownloading]   = useState<string | null>(null);

  const filtered = devis.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.numero.toLowerCase().includes(q) || d.client.toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || d.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const stats = {
    total:   devis.length,
    envoyes: devis.filter((d) => d.statut === "envoye").length,
    acceptes: devis.filter((d) => d.statut === "accepte").length,
    tauxConv: devis.length > 0
      ? Math.round((devis.filter((d) => d.statut === "accepte").length / devis.length) * 100)
      : 0,
    valeurPipeline: devis
      .filter((d) => ["envoye", "brouillon"].includes(d.statut))
      .reduce((s, d) => s + d.total, 0),
  };

  const handleDuplicate = (d: Devis) => {
    const newDevis: Devis = {
      ...d,
      id: `dv-${Date.now()}`,
      numero: `DEV-2025-${String(devis.length + 1).padStart(3, "0")}`,
      statut: "brouillon",
      dateCreation: new Date().toISOString().split("T")[0],
      dateValidite: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    };
    setDevis((prev) => [newDevis, ...prev]);
    toast({ title: "Devis dupliqué", description: newDevis.numero });
  };

  const handleConvertir = (d: Devis) => {
    setDevis((prev) => prev.map((dv) => dv.id === d.id ? { ...dv, statut: "accepte" } : dv));
    toast({ title: "Devis accepté", description: `${d.numero} → converti en commande` });
  };

  const handleDownload = async (d: Devis) => {
    setDownloading(d.id);
    try {
      await downloadPDF(
        <QuotePDF data={{ ...d, statutLabel: STATUT_CONFIG[d.statut].label }} />,
        `${d.numero}.pdf`
      );
      toast({ title: `${d.numero} téléchargé` });
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
            <DialogTitle className="flex items-center gap-3">
              {selected?.numero}
              {selected && (
                <Badge variant="outline" className={STATUT_CONFIG[selected.statut].color}>
                  {STATUT_CONFIG[selected.statut].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Client</p><p className="font-semibold">{selected.client}</p></div>
                <div><p className="text-muted-foreground">Validité</p><p>{new Date(selected.dateValidite).toLocaleDateString("fr-FR")}</p></div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Remise</TableHead>
                      <TableHead className="text-right">Total HT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.lignes.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell>{l.description}</TableCell>
                        <TableCell className="text-right">{l.quantite}</TableCell>
                        <TableCell className="text-right">{formatCurrency(l.prixUnitaire)}</TableCell>
                        <TableCell className="text-right">{l.remise > 0 ? `-${l.remise}%` : "—"}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(l.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sous-total HT</span><span>{formatCurrency(selected.sousTotal)}</span></div>
                  {selected.remiseTotale > 0 && (
                    <div className="flex justify-between text-orange-600"><span>Remises</span><span>-{formatCurrency(selected.remiseTotale)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">TVA (18%)</span><span>{formatCurrency(selected.tva)}</span></div>
                  <hr />
                  <div className="flex justify-between font-bold text-base"><span>Total TTC</span><span>{formatCurrency(selected.total)}</span></div>
                </div>
              </div>
              {selected.notes && (
                <div className="bg-muted rounded p-3 text-sm">
                  <p className="font-medium mb-1">Notes</p><p>{selected.notes}</p>
                </div>
              )}
              <DialogFooter className="gap-2">
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
                {selected.statut === "envoye" && (
                  <Button onClick={() => { handleConvertir(selected); setSelected(null); }}>
                    <ArrowRight className="mr-2 h-4 w-4" />Marquer accepté
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7" /> Devis
            </h2>
            <p className="text-muted-foreground text-sm">Création et suivi des devis clients</p>
          </div>
          <Button onClick={() => toast({ title: "Nouveau devis", description: "Fonctionnalité complète disponible via le module Simulation." })}>
            <Plus className="mr-2 h-4 w-4" />Nouveau devis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Total devis</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">En attente de réponse</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.envoyes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Taux de conversion</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.tauxConv}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs sm:text-sm text-muted-foreground">Pipeline (en cours)</p>
              <p className="text-sm sm:text-xl font-bold">{formatCurrency(stats.valeurPipeline)}</p>
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
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as DevisStatut | "all")}>
                <SelectTrigger className="w-40 sm:w-44"><SelectValue placeholder="Tous" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="accepte">Accepté</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{filtered.length} devis</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ── Mobile card list (< md) ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((d) => {
                const cfg = STATUT_CONFIG[d.statut];
                const Icon = cfg.icon;
                return (
                  <div key={d.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{d.numero}</p>
                        <p className="font-semibold truncate">{d.client}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Valide jusqu'au{" "}
                          <span className={d.statut === "expire" ? "text-red-500" : ""}>
                            {new Date(d.dateValidite).toLocaleDateString("fr-FR")}
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(d.total)}</p>
                        <Badge variant="outline" className={`${cfg.color} mt-1 text-xs`}>
                          <Icon className="mr-1 h-3 w-3" />{cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelected(d)}>
                        <Eye className="mr-1 h-3 w-3" />Voir
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDuplicate(d)}>
                        <Copy className="mr-1 h-3 w-3" />Dupliquer
                      </Button>
                      <Button
                        size="sm" variant="outline" className="flex-1"
                        onClick={() => handleDownload(d)}
                        disabled={downloading === d.id}
                      >
                        {downloading === d.id
                          ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          : <Download className="mr-1 h-3 w-3" />}
                        PDF
                      </Button>
                      {d.statut === "envoye" && (
                        <Button size="sm" className="flex-1" onClick={() => handleConvertir(d)}>
                          <CheckCircle className="mr-1 h-3 w-3" />Accepté
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
                    <TableHead>Créé le</TableHead>
                    <TableHead>Valide jusqu'au</TableHead>
                    <TableHead className="text-right">Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const cfg = STATUT_CONFIG[d.statut];
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono font-medium">{d.numero}</TableCell>
                        <TableCell className="font-medium">{d.client}</TableCell>
                        <TableCell className="text-sm">{new Date(d.dateCreation).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className={`text-sm ${d.statut === "expire" ? "text-red-500" : ""}`}>
                          {new Date(d.dateValidite).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(d.total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.color}>
                            <Icon className="mr-1 h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelected(d)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDuplicate(d)} title="Dupliquer">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              onClick={() => handleDownload(d)}
                              disabled={downloading === d.id}
                              title="Télécharger PDF"
                            >
                              {downloading === d.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Download className="h-4 w-4" />}
                            </Button>
                            {d.statut === "envoye" && (
                              <Button variant="outline" size="sm" onClick={() => handleConvertir(d)}>
                                <CheckCircle className="mr-1 h-3 w-3" />Accepté
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

export default QuotesPage;
