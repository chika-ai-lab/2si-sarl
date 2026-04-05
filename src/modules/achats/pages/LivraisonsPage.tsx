import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Truck, Package, CheckCircle2, Clock, RefreshCcw, FileText,
  Plus, Search, Trash2, XCircle, Eye, MoreVertical,
  CheckCircle, Loader2, ShoppingCart, Printer,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { useClients } from "@/modules/commercial/hooks/useClients";
import { FactureDialog } from "@/modules/commercial/components/FactureDialog";
import { CreateCommandeDialog } from "@/modules/commercial/components/CreateCommandeDialog";
import { type BackendArticle } from "@/modules/commercial/components/ProductPickerSheet";
import { toast } from "@/hooks/use-toast";
import { CMD_STATUT, MODES_PAIEMENT } from "@/modules/commercial/lib/commandes.constants";
import { BLDialog } from "../components/BLDialog";
import { useLivraisonsCommandes } from "../hooks/useLivraisonsCommandes";
import { clientDisplayName } from "../lib/livraisons.helpers";
import type { CommandeLivraison } from "../types";

// Re-export query key so LogistiqueDashboard can share cache
export { LOGISTIQUE_COMMANDES_KEY } from "../hooks/useLivraisonsCommandes";

// ─── Component ────────────────────────────────────────────────────────────────

export function LivraisonsPage() {
  const { allRaw, isLoading, invalidate, changeStatut, livrer, annuler, supprimer } =
    useLivraisonsCommandes();

  // ── Articles + clients (for CreateCommandeDialog) ──────────────────────
  const { data: articlesData = [] } = useQuery<BackendArticle[]>({
    queryKey: ["articles-list"],
    queryFn:  async () => { const r = await apiClient.get<any>("/articles"); return r.data ?? r ?? []; },
    staleTime: 1000 * 60 * 10,
  });
  const { data: clientsData } = useClients({ limit: 1000 });
  const clients = clientsData?.data || [];

  // ── Derived lists ──────────────────────────────────────────────────────
  const toutesCommandes = allRaw;
  const commandes       = toutesCommandes.filter((c) => ["validee", "en_cours", "livree"].includes(c.statut));
  const aPrep           = commandes.filter((c) => c.statut === "validee");
  const enLivr          = commandes.filter((c) => c.statut === "en_cours");
  const livrees         = commandes.filter((c) => c.statut === "livree");

  // ── UI state ───────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState<"commandes" | "validee" | "en_cours" | "livree">("commandes");
  const [actionLoading,   setActionLoading]   = useState<string | null>(null);

  // BL dialog
  const [blOpen,          setBlOpen]          = useState(false);
  const [blCommande,      setBlCommande]      = useState<CommandeLivraison | null>(null);

  // Livrer dialog
  const [livrerCmd,       setLivrerCmd]       = useState<CommandeLivraison | null>(null);
  const [livrerMode,      setLivrerMode]      = useState("especes");

  // Cancel dialog
  const [cancelCmd,       setCancelCmd]       = useState<CommandeLivraison | null>(null);
  const [cancelNotes,     setCancelNotes]     = useState("");
  const [saving,          setSaving]          = useState(false);

  // Delete dialog
  const [deleteCmd,       setDeleteCmd]       = useState<CommandeLivraison | null>(null);

  // Detail + facture dialogs
  const [detailCmd,       setDetailCmd]       = useState<CommandeLivraison | null>(null);
  const [factureCmd,      setFactureCmd]      = useState<CommandeLivraison | null>(null);
  const [isCreateOpen,    setIsCreateOpen]    = useState(false);

  // Commandes tab filters
  const [cmdSearch,       setCmdSearch]       = useState("");
  const [cmdStatutFilter, setCmdStatut]       = useState("all");

  const filteredCommandes = useMemo(() => {
    const q = cmdSearch.toLowerCase();
    return toutesCommandes.filter((c) => {
      if (cmdStatutFilter !== "all" && c.statut !== cmdStatutFilter) return false;
      if (q) {
        const h = [c.reference, clientDisplayName(c.client), c.client?.telephone]
          .filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    });
  }, [toutesCommandes, cmdSearch, cmdStatutFilter]);

  const visibleRows = activeTab === "validee" ? aPrep : activeTab === "en_cours" ? enLivr : livrees;

  // ── Handlers ───────────────────────────────────────────────────────────

  const openBLDialog = (cmd: CommandeLivraison) => {
    setBlCommande(cmd);
    setBlOpen(true);
  };

  const handleBLPrinted = (cmd: CommandeLivraison) => {
    if (cmd.statut === "validee") changeStatut(cmd, "en_cours");
  };

  const handleStatutChange = async (cmd: CommandeLivraison, newEtat: string) => {
    setActionLoading(cmd.id);
    await changeStatut(cmd, newEtat);
    setActionLoading(null);
  };

  const handleLivrer = async () => {
    if (!livrerCmd) return;
    const cmd = livrerCmd;
    setLivrerCmd(null);
    setActionLoading(cmd.id);
    await livrer(cmd, livrerMode);
    setActionLoading(null);
  };

  const handleCancelCommande = async () => {
    if (!cancelCmd) return;
    setSaving(true);
    try {
      await annuler(cancelCmd, cancelNotes);
      setCancelCmd(null); setCancelNotes("");
    } catch { /* error toasted inside hook */ }
    finally { setSaving(false); }
  };

  const handleDeleteCommande = async () => {
    if (!deleteCmd) return;
    const cmd = deleteCmd;
    setDeleteCmd(null);
    await supprimer(cmd);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Dialogs ── */}

      <CreateCommandeDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={invalidate}
        articles={articlesData}
        clients={clients}
      />

      <BLDialog
        commande={blCommande}
        open={blOpen}
        onClose={() => setBlOpen(false)}
        onPrinted={handleBLPrinted}
      />

      {/* Confirmation livraison */}
      <Dialog open={!!livrerCmd} onOpenChange={(o) => { if (!o) setLivrerCmd(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />Confirmer la livraison
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Commande <span className="font-mono font-semibold">{livrerCmd?.reference}</span>
              {" — "}{clientDisplayName(livrerCmd?.client)}
            </p>
            <div>
              <Label>Mode de paiement reçu *</Label>
              <Select value={livrerMode} onValueChange={setLivrerMode}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLivrerCmd(null)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleLivrer}>
              <CheckCircle2 className="h-4 w-4 mr-2" />Marquer livrée
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annulation */}
      <Dialog open={!!cancelCmd} onOpenChange={(o) => { if (!o) { setCancelCmd(null); setCancelNotes(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />Annuler la commande
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Commande <span className="font-mono font-semibold">{cancelCmd?.reference}</span>
              {" — client : "}<span className="font-medium">{clientDisplayName(cancelCmd?.client)}</span>
            </p>
            <div>
              <Label>Raison de l'annulation *</Label>
              <Textarea
                className="mt-1" rows={3} value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Expliquez pourquoi cette commande est annulée..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelCmd(null); setCancelNotes(""); }}>Retour</Button>
            <Button variant="destructive" onClick={handleCancelCommande} disabled={saving || !cancelNotes.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression */}
      <AlertDialog open={!!deleteCmd} onOpenChange={(o) => !o && setDeleteCmd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande <span className="font-mono font-semibold">{deleteCmd?.reference}</span> sera
              définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteCommande}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Détail commande */}
      <Dialog open={!!detailCmd} onOpenChange={(o) => !o && setDetailCmd(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Commande — {detailCmd?.reference}</DialogTitle></DialogHeader>
          {detailCmd && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="font-semibold">{clientDisplayName(detailCmd.client)}</p>
                  <p className="text-xs text-muted-foreground">{detailCmd.client?.telephone}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Paiement</p>
                  <p className="font-semibold capitalize">{detailCmd.banque || "—"}</p>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <div className="px-3 py-2 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Articles
                </div>
                <table className="w-full">
                  <tbody className="divide-y">
                    {detailCmd.lignes.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2">
                          <p className="font-medium">{l.produit?.nom || `Produit #${l.id}`}</p>
                          {l.produit?.reference && (
                            <p className="text-xs text-muted-foreground font-mono">{l.produit.reference}</p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-muted-foreground w-16">×{l.quantite}</td>
                        <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                          {formatCurrency(l.prixUnitaire * l.quantite)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2 border-t bg-muted/20 flex justify-end">
                  <span className="font-bold">{formatCurrency(detailCmd.total)}</span>
                </div>
              </div>
              {detailCmd.notes && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p>{detailCmd.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailCmd(null)}>Fermer</Button>
            {detailCmd && (detailCmd.statut === "validee" || detailCmd.statut === "livree") && (
              <Button variant="outline" onClick={() => { setFactureCmd(detailCmd); setDetailCmd(null); }}>
                <FileText className="mr-2 h-4 w-4" />Générer facture
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {factureCmd && (
        <FactureDialog
          commandeId={Number(factureCmd.id)}
          commandeRef={factureCmd.reference}
          open={!!factureCmd}
          onClose={() => setFactureCmd(null)}
        />
      )}

      {/* ── Page ── */}
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-7 w-7" /> Logistique
            </h2>
            <p className="text-muted-foreground">Gestion des commandes et expéditions</p>
          </div>
          <Button variant="outline" onClick={invalidate} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-3">
          {[
            { label: "À préparer",   count: aPrep.length,   icon: Clock,        color: "text-blue-600" },
            { label: "En livraison", count: enLivr.length,  icon: Truck,        color: "text-orange-500" },
            { label: "Livrées",      count: livrees.length, icon: CheckCircle2, color: "text-green-600" },
          ].map(({ label, count, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-6 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold">{isLoading ? "—" : count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="commandes" className="gap-2">
              <ShoppingCart className="h-4 w-4" />Commandes
              {toutesCommandes.filter((c) => c.statut === "brouillon" || c.statut === "en_attente").length > 0 && (
                <Badge className="ml-1 bg-yellow-500 text-white text-xs px-1.5">
                  {toutesCommandes.filter((c) => c.statut === "brouillon" || c.statut === "en_attente").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="validee" className="gap-2">
              <Clock className="h-4 w-4" />À préparer
              {aPrep.length > 0 && <Badge className="ml-1 bg-blue-600 text-white text-xs px-1.5">{aPrep.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="en_cours" className="gap-2">
              <Truck className="h-4 w-4" />En livraison
              {enLivr.length > 0 && <Badge className="ml-1 bg-orange-500 text-white text-xs px-1.5">{enLivr.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="livree" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />Livrées
            </TabsTrigger>
          </TabsList>

          {/* ── Onglet Commandes (vue complète + filtres) ── */}
          <TabsContent value="commandes" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Référence, client..."
                    value={cmdSearch}
                    onChange={(e) => setCmdSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={cmdStatutFilter} onValueChange={setCmdStatut}>
                  <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {Object.entries(CMD_STATUT).map(([v, cfg]) => (
                      <SelectItem key={v} value={v}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />Nouvelle commande
              </Button>
            </div>

            {isLoading ? (
              <Card><CardContent className="p-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b">
                    <Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-48 flex-1" />
                    <Skeleton className="h-5 w-20" /><Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </CardContent></Card>
            ) : filteredCommandes.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Aucune commande trouvée</p>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="whitespace-nowrap">Référence</TableHead>
                      <TableHead className="whitespace-nowrap">Client</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Articles</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Total</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommandes.map((cmd) => {
                      const cfg        = CMD_STATUT[cmd.statut] ?? CMD_STATUT.brouillon;
                      const StatusIcon = cfg.icon;
                      const isAct      = actionLoading === cmd.id;
                      return (
                        <TableRow key={cmd.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-sm font-medium whitespace-nowrap">{cmd.reference}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <p className="font-medium">{clientDisplayName(cmd.client)}</p>
                            <p className="text-xs text-muted-foreground">{cmd.client?.telephone || "—"}</p>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap text-muted-foreground">{cmd.dateCommande}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {cmd.lignes.slice(0, 2).map((l) => (
                                <div key={l.id} className="flex items-center gap-1 text-xs">
                                  <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="truncate max-w-[140px]">{l.produit?.nom || "Produit"}</span>
                                  <Badge variant="outline" className="text-xs shrink-0">×{l.quantite}</Badge>
                                </div>
                              ))}
                              {cmd.lignes.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{cmd.lignes.length - 2} autre(s)</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">{formatCurrency(cmd.total)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cfg.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />{cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDetailCmd(cmd)}>
                                  <Eye className="mr-2 h-4 w-4" />Voir détails
                                </DropdownMenuItem>
                                {cmd.statut === "brouillon" && (
                                  <DropdownMenuItem onClick={() => handleStatutChange(cmd, "validee")} disabled={isAct}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Valider
                                  </DropdownMenuItem>
                                )}
                                {cmd.statut === "validee" && (
                                  <DropdownMenuItem onClick={() => openBLDialog(cmd)}>
                                    <Printer className="mr-2 h-4 w-4" />Imprimer BL
                                  </DropdownMenuItem>
                                )}
                                {cmd.statut === "en_cours" && (
                                  <DropdownMenuItem
                                    onClick={() => { setLivrerCmd(cmd); setLivrerMode(cmd.banque || "especes"); }}
                                    disabled={isAct}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Marquer livrée
                                  </DropdownMenuItem>
                                )}
                                {(cmd.statut === "validee" || cmd.statut === "livree") && (
                                  <DropdownMenuItem onClick={() => setFactureCmd(cmd)}>
                                    <FileText className="mr-2 h-4 w-4" />Générer facture
                                  </DropdownMenuItem>
                                )}
                                {cmd.statut !== "annulee" && cmd.statut !== "livree" && (
                                  <DropdownMenuItem
                                    className="text-orange-600 focus:text-orange-600"
                                    onClick={() => { setCancelCmd(cmd); setCancelNotes(""); }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />Annuler
                                  </DropdownMenuItem>
                                )}
                                {(cmd.statut === "brouillon" || cmd.statut === "annulee") && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteCmd(cmd)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* ── Onglets À préparer / En livraison / Livrées ── */}
          {(["validee", "en_cours", "livree"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {isLoading ? (
                <Card><CardContent className="p-0">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b">
                      <Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-48 flex-1" />
                      <Skeleton className="h-5 w-24" /><Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </CardContent></Card>
              ) : visibleRows.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>
                    {tab === "validee"   ? "Aucune commande à préparer"
                    : tab === "en_cours" ? "Aucune livraison en cours"
                    :                     "Aucune livraison terminée"}
                  </p>
                </CardContent></Card>
              ) : (
                <Card><CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead className="whitespace-nowrap">Total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleRows.map((cmd) => {
                        const cfg   = CMD_STATUT[cmd.statut] ?? CMD_STATUT.en_attente;
                        const isAct = actionLoading === cmd.id;
                        return (
                          <TableRow key={cmd.id}>
                            <TableCell>
                              <span className="font-mono font-semibold text-sm">{cmd.reference}</span>
                              <div className="text-xs text-muted-foreground mt-0.5">{cmd.dateCommande}</div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{clientDisplayName(cmd.client)}</p>
                              <p className="text-xs text-muted-foreground">{cmd.client?.telephone || "—"}</p>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5 max-w-xs">
                                {cmd.lignes.slice(0, 2).map((l) => (
                                  <div key={l.id} className="flex items-center gap-1.5 text-sm">
                                    <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="truncate">{l.produit?.nom || "Produit"}</span>
                                    <Badge variant="outline" className="text-xs shrink-0">×{l.quantite}</Badge>
                                  </div>
                                ))}
                                {cmd.lignes.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{cmd.lignes.length - 2} autre(s)</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold whitespace-nowrap">{formatCurrency(cmd.total)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {cmd.statut === "validee" && (
                                  <Button size="sm" disabled={isAct} onClick={() => openBLDialog(cmd)}>
                                    <Truck className="h-3.5 w-3.5 mr-1" />Préparer
                                  </Button>
                                )}
                                {cmd.statut === "en_cours" && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => openBLDialog(cmd)}>
                                      <Printer className="h-3.5 w-3.5 mr-1" />BL / Fiche
                                    </Button>
                                    <Button
                                      size="sm" variant="outline"
                                      className="text-green-700 border-green-300 hover:bg-green-50"
                                      disabled={isAct}
                                      onClick={() => { setLivrerCmd(cmd); setLivrerMode(cmd.banque || "especes"); }}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Livré
                                    </Button>
                                  </>
                                )}
                                {cmd.statut === "livree" && (
                                  <Button size="sm" variant="outline" onClick={() => openBLDialog(cmd)}>
                                    <Printer className="h-3.5 w-3.5 mr-1" />Réimprimer
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent></Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

export default LivraisonsPage;
