import { useState, useEffect } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { FactureDocument, type FactureData } from "@/modules/commercial/components/FacturePDF";

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
  commandeClientId?: number;
}

const STATUT_CONFIG: Record<FactureStatut, { label: string; color: string; icon: React.ElementType }> = {
  brouillon:  { label: "Brouillon",   color: "bg-gray-100 text-gray-700",     icon: Clock },
  envoyee:    { label: "Envoyée",     color: "bg-blue-100 text-blue-800",     icon: AlertCircle },
  payee:      { label: "Payée",       color: "bg-green-100 text-green-800",   icon: CheckCircle },
  en_retard:  { label: "En retard",   color: "bg-red-100 text-red-800",       icon: XCircle },
  annulee:    { label: "Annulée",     color: "bg-gray-100 text-gray-500",     icon: XCircle },
};


export function InvoicesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statutFilter, setStatutFilter] = useState<FactureStatut | "all">("all");
  const [selected, setSelected]           = useState<Facture | null>(null);
  const [selectedData, setSelectedData]   = useState<FactureData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading]     = useState<string | null>(null);

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const res = await apiClient.get<any>('/facture-clients');
        const items: any[] = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped: Facture[] = items.map((item: any) => {
          const statut: FactureStatut =
            item.etat === "payee"     ? "payee"     :
            item.etat === "brouillon" ? "brouillon" :
            item.etat === "en_retard" ? "en_retard" :
            "envoyee";
          const montantTTC = Number(item.montant) || 0;
          // commande_client peut être encapsulé dans .data par JsonResource
          const cmd = item.commande_client?.data ?? item.commande_client;
          const clientObj = cmd?.client?.data ?? cmd?.client;
          const clientNom = clientObj?.nom_complet
            ?? [clientObj?.nom, clientObj?.prenom].filter(Boolean).join(" ")
            ?? clientObj?.raison_sociale
            ?? "";
          const facRef = 'FAC-' + String(item.id).padStart(5, '0');
          return {
            id: String(item.id),
            numero: facRef,
            client: clientNom,
            dateEmission: item.date ?? "",
            dateEcheance: item.date ?? "",
            montantTTC,
            montantHT: montantTTC,
            tva: 0,
            montantPaye: Number(item.recu) || 0,
            statut,
            lignes: [],
            commandeClientId: item.commande_client_id ?? cmd?.id,
          };
        });
        setFactures(mapped);
      } catch (err: any) {
        const msg = err?.message ?? "";
        if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
          setError("Accès refusé (403) — votre compte n'a pas la permission d'accéder aux factures. Contactez l'administrateur.");
        } else {
          setError("Impossible de charger les factures. Vérifiez votre connexion et réessayez.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFactures();
  }, []);

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

  const handleSelect = async (f: Facture) => {
    setSelected(f);
    setSelectedData(null);
    if (!f.commandeClientId) return;
    setPreviewLoading(true);
    try {
      const data = await apiClient.post<FactureData>(`/leads/${f.commandeClientId}/facture`);
      setSelectedData(data);
    } catch {
      // affiche le dialog sans preview si erreur
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleMarquerPayee = (id: string) => {
    setFactures((prev) => prev.map((f) =>
      f.id === id ? { ...f, statut: "payee", montantPaye: f.montantTTC } : f
    ));
    toast({ title: "Facture marquée comme payée" });
  };

  const handleDownload = async (f: Facture) => {
    if (!f.commandeClientId) {
      toast({ title: "Données manquantes pour générer le PDF", variant: "destructive" });
      return;
    }
    setDownloading(f.id);
    try {
      const res = await apiClient.post<FactureData & { created: boolean }>(
        `/leads/${f.commandeClientId}/facture`
      );
      const blob = await pdf(<FactureDocument data={res} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${f.numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `${f.numero} téléchargé` });
    } catch {
      toast({ title: "Erreur lors de la génération du PDF", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <XCircle className="h-12 w-12 text-red-400" />
        <div>
          <p className="text-lg font-semibold text-red-600">Erreur d'accès</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48" /></div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="flex-1 space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div>
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Detail Dialog — aperçu PDF */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setSelectedData(null); } }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-base">{selected?.numero} — {selected?.client}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selected && handleDownload(selected)}
              disabled={!selected || downloading === selected.id}
            >
              {selected && downloading === selected.id
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Download className="mr-2 h-4 w-4" />}
              Télécharger
            </Button>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            {previewLoading && (
              <div className="flex items-center justify-center h-full gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Chargement de l'aperçu…</span>
              </div>
            )}
            {!previewLoading && selectedData && (
              <PDFViewer width="100%" height="100%" showToolbar={false}>
                <FactureDocument data={selectedData} />
              </PDFViewer>
            )}
            {!previewLoading && !selectedData && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Aperçu non disponible
              </div>
            )}
          </div>
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
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune facture</p>
                <p className="text-sm mt-1">Les factures générées depuis les commandes apparaîtront ici.</p>
              </div>
            )}

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
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSelect(f)}>
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
                            <Button variant="ghost" size="icon" onClick={() => handleSelect(f)}>
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
