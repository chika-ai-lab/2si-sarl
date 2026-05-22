import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BonFournisseurPDF from "../components/BonFournisseurPDF";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart, Search, RefreshCcw, CheckCircle2, Clock,
  XCircle, Package, ChevronDown, ChevronRight, Loader2, Printer, FileText, Truck,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { apiClient } from "@/modules/commercial/services/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CFLigne {
  id: number;
  designation: string | null;
  articleId: number | null;
  quantite: number;
  prix: number;
  montant: number;
}

interface CF {
  id: number;
  fournisseurId: number;
  fournisseur?: { id: number; nomComplet: string };
  bonCommandeId?: number | null;
  factureId?: number | null;
  date: string;
  montant: number;
  fraisExpedition: number;
  autresCharges: number;
  etat: string;
  note: string | null;
  lignes: CFLigne[];
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const STATUT: Record<string, { label: string; color: string; icon: any }> = {
  brouillon: { label: "Brouillon",  color: "bg-gray-100 text-gray-600",    icon: Clock        },
  "validé":  { label: "Validé",    color: "bg-blue-100 text-blue-700",    icon: CheckCircle2 },
  "reçu":    { label: "Reçu",      color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  non_reçu:  { label: "Non reçu",  color: "bg-red-100 text-red-700",      icon: XCircle      },
};

function StatutBadge({ etat }: { etat: string }) {
  const cfg = STATUT[etat] ?? STATUT.brouillon;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandesFournisseursPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [filterEtat, setFilterEtat] = useState("tous");
  const [openId, setOpenId]         = useState<number | null>(null);
  const [loading, setLoading]       = useState<string | null>(null);
  const [printCf, setPrintCf]       = useState<CF | null>(null);
  // frais locaux : cfId → { fraisExpedition, autresCharges }
  const [localFrais, setLocalFrais] = useState<Record<number, { fraisExpedition: string; autresCharges: string }>>({});

  const { data: res, isLoading, refetch, error } = useQuery({
    queryKey: ["commandes-fournisseurs"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/commande-fournisseurs", { per_page: 200 });
      // API returns { data: [], meta: {} } or flat array
      const list = Array.isArray(r) ? r : (r?.data ?? []);
      return list as CF[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const all: CF[] = res ?? [];

  if (error) console.error('[CF] query error:', error);

  // Tabs
  const TABS = [
    { key: "tous",      label: "Tous",      count: all.length },
    { key: "brouillon", label: "Brouillon", count: all.filter((c) => !["validé", "reçu", "non_reçu"].includes(c.etat)).length },
    { key: "validé",    label: "Validé",    count: all.filter((c) => c.etat === "validé").length },
    { key: "reçu",      label: "Reçu",      count: all.filter((c) => c.etat === "reçu").length },
    { key: "non_reçu",  label: "Non reçu",  count: all.filter((c) => c.etat === "non_reçu").length },
  ];

  const filtered = all.filter((c) => {
    if (filterEtat !== "tous") {
      if (filterEtat === "brouillon") {
        if (["validé", "reçu", "non_reçu"].includes(c.etat)) return false;
      } else if (c.etat !== filterEtat) {
        return false;
      }
    }
    if (search) {
      const hay = [
        `CF-${c.id}`,
        c.fournisseur?.nomComplet,
        c.note,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // ── Actions workflow ───────────────────────────────────────────────────

  const action = async (id: number, endpoint: string, label: string) => {
    setLoading(`${id}-${endpoint}`);
    try {
      await apiClient.put(`/commande-fournisseurs/${id}/${endpoint}`, {});
      if (endpoint === "valider") {
        toast({
          title: "Commande validée",
          description: "La commande a été envoyée au fournisseur.",
          action: (
            <ToastAction altText="Voir livraisons" onClick={() => navigate("/admin/achats/livraisons")} className="gap-1.5">
              <Truck className="h-3 w-3" />
              Voir livraisons
            </ToastAction>
          ),
        });
      } else {
        toast({ title: label });
      }
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── Sauvegarder frais ────────────────────────────────────────────────
  const handleSaveFrais = async (cf: CF) => {
    const frais = localFrais[cf.id];
    if (!frais) return;
    setLoading(`${cf.id}-frais`);
    try {
      await apiClient.put(`/commande-fournisseurs/${cf.id}`, {
        frais_expedition: Number(frais.fraisExpedition) || 0,
        autres_charges:   Number(frais.autresCharges)   || 0,
      });
      toast({ title: "Frais enregistrés" });
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── Générer facture depuis CF ─────────────────────────────────────────
  const handleGenererFacture = async (cf: CF) => {
    // Sauvegarder les frais s'ils ont été modifiés
    if (localFrais[cf.id]) await handleSaveFrais(cf);

    setLoading(`${cf.id}-facture`);
    try {
      const result = await apiClient.post<any>(
        `/bon-commandes/commande-fournisseur/${cf.id}/generer-factures`,
        {},
      );
      toast({ title: result.message || "Facture générée" });
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
      qc.invalidateQueries({ queryKey: ["factures"] });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const montantTotal = all.reduce((s, c) => s + Number(c.montant) + Number(c.fraisExpedition ?? 0) + Number(c.autresCharges ?? 0), 0);
  const montantRecu = all.filter((c) => c.etat === "reçu").reduce((s, c) => s + Number(c.montant) + Number(c.fraisExpedition ?? 0) + Number(c.autresCharges ?? 0), 0);

  return (
    <>
    {/* Dialog Bon Fournisseur */}
    <Dialog open={!!printCf} onOpenChange={(o) => !o && setPrintCf(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {printCf && <BonFournisseurPDF cf={printCf} onClose={() => setPrintCf(null)} />}
      </DialogContent>
    </Dialog>

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-indigo-500" /> Commandes Fournisseurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivi des achats · {formatCurrency(montantRecu)} reçu / {formatCurrency(montantTotal)} total
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterEtat(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterEtat === key
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Fournisseur, référence…"
            className="pl-9 w-52"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            Aucune commande fournisseur
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((cf) => {
            const isOpen = openId === cf.id;
            const montantLignes = cf.lignes?.reduce((s, l) => s + Number(l.montant), 0) ?? 0;

            return (
              <Card key={cf.id} className={isOpen ? "ring-2 ring-indigo-400" : ""}>
                {/* ── Ligne principale ── */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 rounded-lg"
                  onClick={() => setOpenId(isOpen ? null : cf.id)}
                >
                  <div className="text-muted-foreground">
                    {isOpen
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />}
                  </div>

                  {/* Référence + fournisseur */}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-semibold text-sm">CF-{String(cf.id).padStart(4, "0")}</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="font-medium">{cf.fournisseur?.nomComplet || `Fournisseur #${cf.fournisseurId}`}</span>
                    {cf.date && <span className="text-xs text-muted-foreground ml-3">{cf.date}</span>}
                  </div>

                  {/* Lignes count */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {cf.lignes?.length ?? 0} article(s)
                  </div>

                  {/* Montant */}
                  <div className="font-semibold text-sm whitespace-nowrap">
                    {formatCurrency(Number(cf.montant))}
                  </div>

                  {/* Statut */}
                  <StatutBadge etat={cf.etat} />

                  {/* Actions directes (1 clic) */}
                  <TooltipProvider delayDuration={300}>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {!["validé", "reçu", "non_reçu"].includes(cf.etat) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                            disabled={loading === `${cf.id}-valider`}
                            onClick={() => action(cf.id, "valider", "Commande validée")}
                          >
                            {loading === `${cf.id}-valider`
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : "Valider"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-center">
                          Valider la commande pour confirmer l'envoi au fournisseur
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {cf.etat === "validé" && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                              disabled={!!loading}
                              onClick={() => action(cf.id, "recu", "Marqué reçu")}
                            >
                              {loading === `${cf.id}-recu` ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reçu ✓"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            Confirmer la réception de la marchandise — crée automatiquement un bon de livraison par client
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              disabled={!!loading}
                              onClick={() => action(cf.id, "non-recu", "Marqué non-reçu")}
                            >
                              {loading === `${cf.id}-non-recu` ? <Loader2 className="h-3 w-3 animate-spin" /> : "Non reçu"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            Signaler que la marchandise n'a pas été reçue (retard, litige, erreur fournisseur)
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-1"
                              onClick={() => navigate("/admin/achats/livraisons")}
                            >
                              <Truck className="h-3 w-3" /> Livraisons
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Voir les bons de livraison associés
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={(e) => { e.stopPropagation(); setPrintCf(cf); }}
                        >
                          <Printer className="h-3 w-3 mr-1" /> Imprimer
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Imprimer le bon de commande fournisseur
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  </TooltipProvider>
                </div>

                {/* ── Détail lignes (accordéon) ── */}
                {isOpen && cf.lignes?.length > 0 && (
                  <div className="border-t bg-muted/20 px-4 py-3 space-y-4">
                    {/* Tableau articles */}
                    <Table>
                      <TableHeader>
                        <TableRow className="border-0">
                          <TableHead className="h-7 text-xs">Désignation</TableHead>
                          <TableHead className="h-7 text-xs text-right w-16">Qté</TableHead>
                          <TableHead className="h-7 text-xs text-right w-28">Prix unit.</TableHead>
                          <TableHead className="h-7 text-xs text-right w-28">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cf.lignes.map((l) => (
                          <TableRow key={l.id} className="border-0 hover:bg-transparent">
                            <TableCell className="py-1.5 text-sm">
                              {l.designation || `Article #${l.articleId}`}
                            </TableCell>
                            <TableCell className="py-1.5 text-sm text-right">{l.quantite}</TableCell>
                            <TableCell className="py-1.5 text-sm text-right">{formatCurrency(Number(l.prix))}</TableCell>
                            <TableCell className="py-1.5 text-sm text-right font-medium">{formatCurrency(Number(l.montant))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Frais + total général */}
                    <div className="rounded-lg border bg-background p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frais & récapitulatif</p>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Frais expédition */}
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Frais d'expédition (FCFA)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-full text-sm border rounded px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            value={localFrais[cf.id]?.fraisExpedition ?? String(Number(cf.fraisExpedition ?? 0))}
                            onChange={(e) => setLocalFrais((prev) => ({
                              ...prev,
                              [cf.id]: { fraisExpedition: e.target.value, autresCharges: prev[cf.id]?.autresCharges ?? String(Number(cf.autresCharges ?? 0)) },
                            }))}
                          />
                        </div>
                        {/* Autres charges */}
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Autres charges (FCFA)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-full text-sm border rounded px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            value={localFrais[cf.id]?.autresCharges ?? String(Number(cf.autresCharges ?? 0))}
                            onChange={(e) => setLocalFrais((prev) => ({
                              ...prev,
                              [cf.id]: { fraisExpedition: prev[cf.id]?.fraisExpedition ?? String(Number(cf.fraisExpedition ?? 0)), autresCharges: e.target.value },
                            }))}
                          />
                        </div>
                      </div>

                      {/* Récap montants */}
                      <div className="border-t pt-3 space-y-1 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Sous-total articles</span>
                          <span>{formatCurrency(montantLignes)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Frais d'expédition</span>
                          <span>{formatCurrency(Number(localFrais[cf.id]?.fraisExpedition ?? cf.fraisExpedition ?? 0))}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Autres charges</span>
                          <span>{formatCurrency(Number(localFrais[cf.id]?.autresCharges ?? cf.autresCharges ?? 0))}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-1">
                          <span>Total TTC</span>
                          <span>
                            {formatCurrency(
                              montantLignes
                              + Number(localFrais[cf.id]?.fraisExpedition ?? cf.fraisExpedition ?? 0)
                              + Number(localFrais[cf.id]?.autresCharges   ?? cf.autresCharges   ?? 0)
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading === `${cf.id}-frais`}
                          onClick={() => handleSaveFrais(cf)}
                        >
                          {loading === `${cf.id}-frais` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Enregistrer les frais
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={!!cf.factureId || loading === `${cf.id}-facture`}
                          onClick={() => handleGenererFacture(cf)}
                        >
                          {loading === `${cf.id}-facture`
                            ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            : <FileText className="h-3 w-3 mr-1" />}
                          {cf.factureId ? "Facture déjà générée" : "Générer Facture"}
                        </Button>
                      </div>
                    </div>

                    {cf.note && (
                      <p className="text-xs text-muted-foreground italic">Note : {cf.note}</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
