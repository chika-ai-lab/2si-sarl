import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
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
import { useListePaginee } from "@/hooks/useListePaginee";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CFLigne {
  id: number;
  designation: string | null;
  articleId: number | null;
  /** Frais portés par la ligne — l'en-tête n'en est que la somme. */
  fraisExpedition: number;
  autresCharges: number;
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
  /**
   * Saisie en cours, indexée par identifiant de LIGNE (et non de commande).
   *
   * Les champs sont partiels et stockés en chaîne : un champ absent signifie
   * « non touché », ce qui laisse la valeur du serveur faire foi. Stocker des
   * nombres obligerait à choisir une valeur pour un champ vidé en cours de
   * frappe, et le curseur sauterait à chaque caractère.
   */
  type SaisieLigne = { quantite: string; prix: string; fraisExpedition: string; autresCharges: string };
  const [localLignes, setLocalLignes] = useState<Record<number, Partial<SaisieLigne>>>({});

  const majSaisie = (ligneId: number, champ: keyof SaisieLigne, valeur: string) =>
    setLocalLignes((p) => ({ ...p, [ligneId]: { ...p[ligneId], [champ]: valeur } }));

  /**
   * Valeurs effectives d'une ligne : la saisie en cours l'emporte sur le
   * serveur. Une seule fonction sert la ligne, le récapitulatif et
   * l'enregistrement — sans quoi le total affiché finirait par diverger de ce
   * qui part réellement.
   */
  const valeursLigne = (l: CFLigne) => {
    const s = localLignes[l.id];
    const quantite = Number(s?.quantite ?? l.quantite) || 0;
    const prix     = Number(s?.prix ?? l.prix) || 0;
    const frais    = Number(s?.fraisExpedition ?? l.fraisExpedition ?? 0) || 0;
    const autres   = Number(s?.autresCharges ?? l.autresCharges ?? 0) || 0;
    // Le montant suit toujours ses composants ; le serveur le recalcule de son
    // côté, cet affichage n'en est que le reflet immédiat.
    return { quantite, prix, montant: prix * quantite, frais, autres };
  };

  const {
    items: all,
    total: totalCf,
    resteACharger,
    chargerSuite,
    chargementSuite,
    isLoading,
    refetch,
    error,
  } = useListePaginee<CF>(["commandes-fournisseurs"], "/commande-fournisseurs", {
    taille: 50,
    staleTime: 0,
    refetchOnMount: "always",
  });

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

  // ── Enregistrer les lignes modifiées ─────────────────────────────────
  // Un seul appel pour toute la commande : le serveur écrit les lignes,
  // recalcule chaque montant, puis recale l'en-tête sur leur somme, dans la
  // même transaction.
  const handleSaveLignes = async (cf: CF) => {
    const modifiees = (cf.lignes ?? []).filter((l) => localLignes[l.id]);
    if (!modifiees.length) return;

    /* Un champ vidé en cours de frappe vaut 0 : parti tel quel, il reviendrait
       en erreur serveur après un aller-retour. On nomme la ligne fautive tout
       de suite plutôt que d'afficher « Quantité invalide » sans dire laquelle. */
    const fautive = modifiees.find((l) => {
      const v = valeursLigne(l);
      return !Number.isInteger(v.quantite) || v.quantite < 1 || v.prix < 0;
    });
    if (fautive) {
      toast({
        variant: "destructive",
        title: "Ligne incomplète",
        description:
          `${fautive.designation ?? `Ligne #${fautive.id}`} : la quantité doit être un entier d'au moins 1, ` +
          "et le prix ne peut pas être négatif.",
      });
      return;
    }

    setLoading(`${cf.id}-frais`);
    try {
      await apiClient.put(`/commande-fournisseurs/${cf.id}/lignes`, {
        lignes: modifiees.map((l) => {
          const v = valeursLigne(l);
          return {
            id: l.id,
            quantite: v.quantite,
            prix: v.prix,
            frais_expedition: v.frais,
            autres_charges: v.autres,
            // `montant` n'est volontairement pas transmis : le serveur le
            // recalcule, et deux sources pour une même valeur finissent
            // toujours par diverger.
          };
        }),
      });
      setLocalLignes((p) => {
        const suite = { ...p };
        for (const l of modifiees) delete suite[l.id];
        return suite;
      });
      toast({ title: `${modifiees.length} ligne(s) enregistrée(s)` });
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── Générer facture depuis CF ─────────────────────────────────────────
  const handleGenererFacture = async (cf: CF) => {
    // Les modifications saisies et non encore enregistrées doivent partir avant
    // la facture, sinon celle-ci serait établie sur un montant périmé.
    if ((cf.lignes ?? []).some((l) => localLignes[l.id])) await handleSaveLignes(cf);

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
        {/* Le document porte son propre en-tête visuel ; le titre et la
            description restent nécessaires aux lecteurs d'écran. */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            Bon de commande fournisseur {printCf ? `CF-${String(printCf.id).padStart(4, "0")}` : ""}
          </DialogTitle>
          <DialogDescription>
            Aperçu imprimable du bon de commande destiné au fournisseur.
          </DialogDescription>
        </DialogHeader>
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
            {/* Les montants portent sur ce qui est chargé : le dire évite de
                laisser croire à un total consolidé. */}
            {resteACharger && (
              <span className="block text-xs">
                sur les {all.length} commandes chargées — {totalCf} au total
              </span>
            )}
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
            // Sous-total calculé sur les valeurs effectives : sinon le
            // récapitulatif resterait figé pendant qu'on modifie les lignes.
            const montantLignes = cf.lignes?.reduce((s, l) => s + valeursLigne(l).montant, 0) ?? 0;

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
                    {/* Tableau articles — les frais se saisissent ici, ligne par ligne :
                        chaque ligne part chez un client différent, souvent dans une
                        autre ville, et doit lui être refacturée séparément. */}
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-0">
                          <TableHead className="h-7 text-xs">Désignation</TableHead>
                          <TableHead className="h-7 text-xs text-right w-14">Qté</TableHead>
                          <TableHead className="h-7 text-xs text-right w-28">Prix unit.</TableHead>
                          <TableHead className="h-7 text-xs text-right w-28">Montant</TableHead>
                          <TableHead className="h-7 text-xs text-right w-32">Frais expédition</TableHead>
                          <TableHead className="h-7 text-xs text-right w-32">Autres charges</TableHead>
                          <TableHead className="h-7 text-xs text-right w-32">Total ligne</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cf.lignes.map((l) => {
                          const saisie = localLignes[l.id];
                          const v = valeursLigne(l);
                          // Une commande déjà facturée n'est plus modifiable :
                          // le serveur le refuse aussi, l'écran ne fait que le
                          // dire plus tôt.
                          const majPossible = !cf.factureId;
                          const nom = l.designation ?? `ligne ${l.id}`;
                          const champ =
                            "text-sm text-right border rounded px-2 py-1 bg-background tabular-nums " +
                            "focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50";
                          return (
                            <TableRow key={l.id} className="border-0 hover:bg-transparent">
                              <TableCell className="py-1.5 text-sm">
                                {l.designation || `Article #${l.articleId}`}
                              </TableCell>
                              <TableCell className="py-1 text-right">
                                <input
                                  type="number" min="1" step="1"
                                  aria-label={`Quantité — ${nom}`}
                                  disabled={!majPossible}
                                  className={`w-14 ${champ}`}
                                  value={saisie?.quantite ?? String(l.quantite)}
                                  onChange={(e) => majSaisie(l.id, "quantite", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="py-1 text-right">
                                <input
                                  type="number" min="0" step="1"
                                  aria-label={`Prix unitaire — ${nom}`}
                                  disabled={!majPossible}
                                  className={`w-28 ${champ}`}
                                  value={saisie?.prix ?? String(Number(l.prix))}
                                  onChange={(e) => majSaisie(l.id, "prix", e.target.value)}
                                />
                              </TableCell>
                              {/* Montant : produit du prix par la quantité. Il
                                  reste en lecture seule — le rendre saisissable
                                  permettrait un total sans rapport avec ses
                                  composants. */}
                              <TableCell className="py-1.5 text-sm text-right tabular-nums text-muted-foreground">
                                {formatCurrency(v.montant)}
                              </TableCell>
                              <TableCell className="py-1 text-right">
                                <input
                                  type="number" min="0" step="1"
                                  aria-label={`Frais d'expédition — ${nom}`}
                                  disabled={!majPossible}
                                  className={`w-28 ${champ}`}
                                  value={saisie?.fraisExpedition ?? String(Number(l.fraisExpedition ?? 0))}
                                  onChange={(e) => majSaisie(l.id, "fraisExpedition", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="py-1 text-right">
                                <input
                                  type="number" min="0" step="1"
                                  aria-label={`Autres charges — ${nom}`}
                                  disabled={!majPossible}
                                  className={`w-28 ${champ}`}
                                  value={saisie?.autresCharges ?? String(Number(l.autresCharges ?? 0))}
                                  onChange={(e) => majSaisie(l.id, "autresCharges", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="py-1.5 text-sm text-right font-medium tabular-nums">
                                {formatCurrency(v.montant + v.frais + v.autres)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </div>

                    {/* Récapitulatif — sommes des lignes, jamais saisi directement */}
                    <div className="rounded-lg border bg-background p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Récapitulatif</p>

                      {(() => {
                        const totalFrais = cf.lignes.reduce((s, l) => s + valeursLigne(l).frais, 0);
                        const totalAutres = cf.lignes.reduce((s, l) => s + valeursLigne(l).autres, 0);
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Sous-total articles</span>
                              <span className="tabular-nums">{formatCurrency(montantLignes)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Frais d'expédition <span className="text-xs">(somme des lignes)</span></span>
                              <span className="tabular-nums">{formatCurrency(totalFrais)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Autres charges <span className="text-xs">(somme des lignes)</span></span>
                              <span className="tabular-nums">{formatCurrency(totalAutres)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t pt-1">
                              <span>Total TTC</span>
                              <span className="tabular-nums">
                                {formatCurrency(montantLignes + totalFrais + totalAutres)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            !!cf.factureId
                            || loading === `${cf.id}-frais`
                            || !(cf.lignes ?? []).some((l) => localLignes[l.id])
                          }
                          onClick={() => handleSaveLignes(cf)}
                        >
                          {loading === `${cf.id}-frais` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Enregistrer les modifications
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

          {resteACharger && (
            <div className="flex flex-col items-center gap-2 pt-6">
              <Button
                variant="outline"
                disabled={chargementSuite}
                onClick={() => chargerSuite()}
              >
                {chargementSuite ? "Chargement…" : "Charger les commandes suivantes"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {all.length} sur {totalCf}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
