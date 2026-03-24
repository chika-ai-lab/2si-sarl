import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingUp,
  ShoppingCart,
  Plus,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCommandes } from "../hooks/useCommandes";
import { useClients } from "../hooks/useClients";
import { apiClient } from "../services/apiClient";
import { createCommande, deleteCommande, changeCommandeStatut } from "../services/commandes.service";
import type { CommandeCommerciale, CommandeStatut, ModePaiement, BanquePartenaire } from "../types";
import { toast } from "@/hooks/use-toast";

// ─── Types locaux ──────────────────────────────────────────────────────────

interface BackendArticle {
  id: number;
  libelle: string;
  prix: number;
  prix_achat?: number;
  reference?: string;
}

interface LigneForm {
  article_id: string;
  quantite: number;
  prix_achat: number;
  frais_livraison_fournisseur: number;
  frais_livraison_client: number;
  type_livraison: "agence" | "destination";
  taux_commission: number;
  marge: number; // saisie utilisateur — le prix de vente est déduit
}

const EMPTY_LIGNE: LigneForm = {
  article_id: "",
  quantite: 1,
  prix_achat: 0,
  frais_livraison_fournisseur: 0,
  frais_livraison_client: 0,
  type_livraison: "agence",
  taux_commission: 0.05,
  marge: 0,
};

/**
 * prix_vente = (prix_achat + frais_fourn + frais_client + marge) / (1 - taux)
 * commission = prix_vente * taux
 * c_total    = prix_achat + frais_fourn + frais_client + commission
 */
function calcLigne(l: LigneForm) {
  const base = l.prix_achat + l.frais_livraison_fournisseur + l.frais_livraison_client + l.marge;
  const prix  = l.taux_commission < 1 ? base / (1 - l.taux_commission) : base;
  const commission = prix * l.taux_commission;
  const cTotal = l.prix_achat + l.frais_livraison_fournisseur + l.frais_livraison_client + commission;
  return { prix, commission, cTotal };
}

// ─── Statut configs ────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  brouillon:  { label: "Brouillon",  color: "bg-gray-100 text-gray-800",   icon: Edit },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  validee:    { label: "Validée",    color: "bg-blue-100 text-blue-800",   icon: CheckCircle },
  en_cours:   { label: "En cours",   color: "bg-purple-100 text-purple-800", icon: Package },
  livree:     { label: "Livrée",     color: "bg-green-100 text-green-800", icon: CheckCircle },
  annulee:    { label: "Annulée",    color: "bg-red-100 text-red-800",     icon: XCircle },
};

const PAIEMENT_CONFIG: Record<string, { label: string; color: string }> = {
  en_attente: { label: "Non payé",  color: "bg-red-100 text-red-800" },
  partiel:    { label: "Partiel",   color: "bg-orange-100 text-orange-800" },
  complet:    { label: "Payé",      color: "bg-green-100 text-green-800" },
};

// ─── Page principale ──────────────────────────────────────────────────────

export function CommandesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery]     = useState("");
  const [statutFilter, setStatutFilter]   = useState<CommandeStatut | "all">("all");
  const [page, setPage]                   = useState(1);
  const limit = 10;

  // Modals state
  const [selectedCommande, setSelectedCommande]   = useState<CommandeCommerciale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen]         = useState(false);
  const [isCreateOpen, setIsCreateOpen]           = useState(false);
  const [deleteId, setDeleteId]                   = useState<string | null>(null);
  const [saving, setSaving]                       = useState(false);

  // Articles list for form
  const [articles, setArticles] = useState<BackendArticle[]>([]);
  useEffect(() => {
    apiClient.get<any>("/articles").then((r) => setArticles(r.data ?? r ?? [])).catch(() => {});
  }, []);

  // Create form state
  const [formClientId, setFormClientId]           = useState("");
  const [formDate, setFormDate]                   = useState(new Date().toISOString().split("T")[0]);
  const [formModePaiement, setFormModePaiement]   = useState<ModePaiement>("virement");
  const [formNotes, setFormNotes]                 = useState("");
  const [lignes, setLignes]                       = useState<LigneForm[]>([{ ...EMPTY_LIGNE }]);

  const resetForm = () => {
    setFormClientId(""); setFormDate(new Date().toISOString().split("T")[0]);
    setFormModePaiement("virement"); setFormNotes("");
    setLignes([{ ...EMPTY_LIGNE }]);
  };

  // Fetch
  const { data, isLoading, error, refetch } = useCommandes({
    page, limit,
    search: searchQuery || undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    sortBy: "dateCommande", sortOrder: "desc",
  });
  const { data: clientsData } = useClients({ limit: 1000 });
  const clients  = clientsData?.data || [];
  const commandes = data?.data || [];
  const pagination = data?.pagination;

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.nom ?? id;

  // ─── Handlers ──────────────────────────────────────────────────────────

  const updateLigne = (i: number, field: keyof LigneForm, value: any) => {
    setLignes((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      // Auto-fill prix_achat depuis l'article sélectionné
      if (field === "article_id") {
        const art = articles.find((a) => String(a.id) === value);
        if (art) {
          next[i].prix_achat = art.prix_achat ?? 0;
        }
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (!formClientId) { toast({ title: "Sélectionnez un client", variant: "destructive" }); return; }
    if (lignes.some((l) => !l.article_id)) { toast({ title: "Sélectionnez un article pour chaque ligne", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createCommande({
        clientId: formClientId,
        lignes: lignes.map((l) => {
          const { prix } = calcLigne(l);
          return {
            produitId: l.article_id,
            quantite: l.quantite,
            prixUnitaire: Math.round(prix),
            prixAchat: l.prix_achat,
            fraisLivraisonFournisseur: l.frais_livraison_fournisseur,
            fraisLivraisonClient: l.frais_livraison_client,
            typeLivraison: l.type_livraison,
            tauxCommission: l.taux_commission,
            remise: 0,
          };
        }),
        modeLivraison: "retrait",
        modePaiement: formModePaiement,
        fraisLivraison: 0,
        remise: 0,
        notes: formNotes || undefined,
      });
      toast({ title: "Commande créée avec succès" });
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommande(id);
      toast({ title: "Commande supprimée" });
      setDeleteId(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleStatut = async (id: string, statut: CommandeStatut) => {
    try {
      await changeCommandeStatut(id, statut);
      toast({ title: "Statut mis à jour" });
      refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <>
      {/* Delete confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Infos générales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input className="mt-1" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select value={formModePaiement} onValueChange={(v) => setFormModePaiement(v as ModePaiement)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                    <SelectItem value="accreditif">Accréditif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={1} placeholder="Remarques..." />
              </div>
            </div>

            {/* Lignes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Articles commandés</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setLignes((p) => [...p, { ...EMPTY_LIGNE }])}>
                  <Plus className="h-4 w-4 mr-1" />Ajouter article
                </Button>
              </div>
              <div className="space-y-4">
                {lignes.map((ligne, i) => {
                  const { prix, commission, cTotal } = calcLigne(ligne);
                  return (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Ligne {i + 1}</span>
                        {lignes.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setLignes((p) => p.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      {/* — Article & quantité — */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs font-medium">Article *</Label>
                          <Select value={ligne.article_id} onValueChange={(v) => updateLigne(i, "article_id", v)}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un article..." /></SelectTrigger>
                            <SelectContent>
                              {articles.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Quantité</Label>
                          <Input className="mt-1" type="number" min="1" value={ligne.quantite} onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))} />
                        </div>
                      </div>

                      {/* — Coûts — */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Coûts</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Prix d'achat (FCFA)</Label>
                            <Input className="mt-1" type="number" min="0" value={ligne.prix_achat} onChange={(e) => updateLigne(i, "prix_achat", Number(e.target.value))} />
                          </div>
                          <div>
                            <Label className="text-xs">Frais livr. fournisseur (FCFA)</Label>
                            <Input className="mt-1" type="number" min="0" value={ligne.frais_livraison_fournisseur} onChange={(e) => updateLigne(i, "frais_livraison_fournisseur", Number(e.target.value))} />
                          </div>
                          <div>
                            <Label className="text-xs">Frais livr. client (FCFA)</Label>
                            <Input className="mt-1" type="number" min="0" value={ligne.frais_livraison_client} onChange={(e) => updateLigne(i, "frais_livraison_client", Number(e.target.value))} />
                          </div>
                        </div>
                      </div>

                      {/* — Marge & commission — */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Marge & commission</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Marge souhaitée (FCFA)</Label>
                            <Input className="mt-1" type="number" min="0" value={ligne.marge} onChange={(e) => updateLigne(i, "marge", Number(e.target.value))} />
                          </div>
                          <div>
                            <Label className="text-xs">Taux de commission</Label>
                            <Select value={String(ligne.taux_commission)} onValueChange={(v) => updateLigne(i, "taux_commission", Number(v))}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.03">3%</SelectItem>
                                <SelectItem value="0.04">4%</SelectItem>
                                <SelectItem value="0.05">5%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Type de livraison</Label>
                            <Select value={ligne.type_livraison} onValueChange={(v) => updateLigne(i, "type_livraison", v)}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="agence">En agence</SelectItem>
                                <SelectItem value="destination">À destination</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* — Prix de vente calculé automatiquement — */}
                      <div className="grid grid-cols-3 gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Commission ({Math.round(ligne.taux_commission * 100)}%)</p>
                          <p className="font-semibold text-blue-600 mt-1">{formatCurrency(Math.round(commission))}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Coût total</p>
                          <p className="font-semibold mt-1">{formatCurrency(Math.round(cTotal))}</p>
                        </div>
                        <div className="text-center bg-primary/10 rounded-md p-2">
                          <p className="text-xs font-semibold text-primary">Prix de vente (calculé)</p>
                          <p className="font-bold text-lg text-primary mt-1">{formatCurrency(Math.round(prix))}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Totaux */}
              <div className="mt-4 p-3 border rounded-lg bg-muted/50 text-sm space-y-1">
                {(() => {
                  const totalVente = lignes.reduce((s, l) => s + Math.round(calcLigne(l).prix) * l.quantite, 0);
                  const totalComm  = lignes.reduce((s, l) => s + calcLigne(l).commission * l.quantite, 0);
                  const totalMarge = lignes.reduce((s, l) => s + l.marge * l.quantite, 0);
                  return (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">CA total</span><span className="font-semibold">{formatCurrency(totalVente)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Commissions totales</span><span className="font-semibold">{formatCurrency(totalComm)}</span></div>
                      <div className="flex justify-between font-semibold border-t pt-1"><span>Marge totale</span><span className={totalMarge >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(totalMarge)}</span></div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commande {selectedCommande?.reference}</DialogTitle>
          </DialogHeader>
          {selectedCommande && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Client</p><p className="font-semibold">{getClientName(selectedCommande.clientId)}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-semibold">{selectedCommande.dateCommande}</p></div>
                <div><p className="text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={STATUT_CONFIG[selectedCommande.statut]?.color}>
                    {STATUT_CONFIG[selectedCommande.statut]?.label}
                  </Badge>
                </div>
                <div><p className="text-muted-foreground">Mode paiement</p><Badge variant="outline">{selectedCommande.modePaiement}</Badge></div>
              </div>

              {/* Lignes */}
              <div>
                <h3 className="font-semibold mb-2">Articles</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead className="text-right">Qté</TableHead>
                        <TableHead className="text-right">Prix vente</TableHead>
                        <TableHead className="text-right">Prix achat</TableHead>
                        <TableHead className="text-right">Frais fourn.</TableHead>
                        <TableHead className="text-right">Frais client</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Marge</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCommande.lignes.map((ligne) => (
                        <TableRow key={ligne.id}>
                          <TableCell className="font-medium">{ligne.produit?.nom || ligne.produitId}</TableCell>
                          <TableCell className="text-right">{ligne.quantite}</TableCell>
                          <TableCell className="text-right">{formatCurrency(ligne.prixUnitaire)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(ligne.prixAchat)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(ligne.fraisLivraisonFournisseur)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(ligne.fraisLivraisonClient)}</TableCell>
                          <TableCell className="text-right text-blue-600">{formatCurrency(ligne.commission)}</TableCell>
                          <TableCell className={`text-right font-semibold ${ligne.marge >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(ligne.marge)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={ligne.statut === "livré" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {ligne.statut === "livré" ? "Livré" : "En attente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Récap financier */}
              <div className="border-t pt-4">
                <div className="space-y-2 max-w-sm ml-auto text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">CA total</span><span className="font-semibold">{formatCurrency(selectedCommande.total)}</span></div>
                  {selectedCommande.remise > 0 && <div className="flex justify-between text-orange-600"><span>Remise</span><span>-{formatCurrency(selectedCommande.remise)}</span></div>}
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total TTC</span><span>{formatCurrency(selectedCommande.total)}</span></div>
                </div>
              </div>

              {selectedCommande.notes && (
                <div><h3 className="font-semibold mb-1">Notes</h3><p className="text-muted-foreground text-sm">{selectedCommande.notes}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />Générer facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Main content ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("admin.orders")}</h2>
            <p className="text-muted-foreground">Gestion des commandes commerciales</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: pagination?.total || 0, icon: ShoppingCart, color: "text-muted-foreground" },
            { label: "En attente", value: commandes.filter((c) => c.statut === "en_attente").length, icon: Clock, color: "text-yellow-600" },
            { label: "En cours", value: commandes.filter((c) => c.statut === "en_cours" || c.statut === "validee").length, icon: Package, color: "text-purple-600" },
            { label: "Livrées", value: commandes.filter((c) => c.statut === "livree").length, icon: CheckCircle, color: "text-green-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par référence, client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as CommandeStatut | "all")}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card><CardContent className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent></Card>
        ) : error ? (
          <Card><CardContent className="py-8 text-center text-destructive">Erreur lors du chargement</CardContent></Card>
        ) : commandes.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune commande</CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>{pagination?.total || 0} commande(s)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode paiement</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandes.map((commande) => {
                    const cfg = STATUT_CONFIG[commande.statut] ?? STATUT_CONFIG.brouillon;
                    const StatusIcon = cfg.icon;
                    const paieCfg = PAIEMENT_CONFIG[commande.statutPaiement] ?? PAIEMENT_CONFIG.en_attente;
                    return (
                      <TableRow key={commande.id}>
                        <TableCell className="font-mono text-sm font-medium">{commande.reference}</TableCell>
                        <TableCell>
                          <div className="font-medium">{getClientName(commande.clientId)}</div>
                          <div className="text-xs text-muted-foreground">{commande.lignes.length} article(s)</div>
                        </TableCell>
                        <TableCell className="text-sm">{commande.dateCommande}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{commande.modePaiement}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(commande.total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant="outline" className={paieCfg.color}>{paieCfg.label}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedCommande(commande); setIsDetailsOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" />Voir détails
                              </DropdownMenuItem>
                              {commande.statut === "brouillon" && (
                                <DropdownMenuItem onClick={() => handleStatut(commande.id, "validee")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />Valider
                                </DropdownMenuItem>
                              )}
                              {commande.statut === "validee" && (
                                <DropdownMenuItem onClick={() => handleStatut(commande.id, "livree")}>
                                  <Package className="mr-2 h-4 w-4" />Marquer livrée
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />Générer facture
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(commande.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {pagination.page} sur {pagination.totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>Suivant</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CommandesPage;
