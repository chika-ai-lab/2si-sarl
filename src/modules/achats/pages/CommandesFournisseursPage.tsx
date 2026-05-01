import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  XCircle, Package, ChevronDown, ChevronRight, Loader2, Printer,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
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
  date: string;
  montant: number;
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
  const [search, setSearch]         = useState("");
  const [filterEtat, setFilterEtat] = useState("tous");
  const [openId, setOpenId]         = useState<number | null>(null);
  const [loading, setLoading]       = useState<string | null>(null);
  const [printCf, setPrintCf]       = useState<CF | null>(null);

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
      toast({ title: label });
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const montantTotal     = all.reduce((s, c) => s + Number(c.montant), 0);
  const montantRecu      = all.filter((c) => c.etat === "reçu").reduce((s, c) => s + Number(c.montant), 0);

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
                  <div className="border-t bg-muted/20 px-4 py-3">
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
                        <TableRow className="border-t">
                          <TableCell colSpan={3} className="py-2 text-sm font-semibold text-right">Total</TableCell>
                          <TableCell className="py-2 text-sm font-bold text-right">{formatCurrency(montantLignes)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {cf.note && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Note : {cf.note}</p>
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
