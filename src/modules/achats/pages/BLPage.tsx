import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Truck, Search, RefreshCcw, CheckCircle2, Clock, XCircle,
  MapPin, Loader2, Printer, ChevronDown, ChevronRight, Package,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/modules/commercial/services/apiClient";
import BLFicheExpeditionPDF from "../components/BLFicheExpeditionPDF";
import BLGroupePDF from "../components/BLGroupePDF";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BL {
  id: number;
  num: string;
  commandeClientId: number | null;
  commandeFournisseurId: number | null;
  bonCommandeId: number | null;
  clientId: number | null;
  userId: number | null;
  date: string;
  etat: string;
  note: string | null;
}

interface BDC {
  id: number;
  numero: string;
  date: string;
  statut: string;
}

// ─── Statuts ─────────────────────────────────────────────────────────────────

const STATUT: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock        },
  en_cours:   { label: "En cours",   color: "bg-blue-100 text-blue-700",    icon: Truck        },
  "livré":    { label: "Livré",      color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  "annulé":   { label: "Annulé",     color: "bg-red-100 text-red-700",      icon: XCircle      },
};

function StatutBadge({ etat }: { etat: string }) {
  const cfg = STATUT[etat] ?? STATUT.en_attente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BLPage() {
  const qc = useQueryClient();
  const [search,     setSearch]     = useState("");
  const [filterEtat, setFilterEtat] = useState("tous");
  const [openBdcIds, setOpenBdcIds] = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState<string | null>(null);
  const [printBlId,    setPrintBlId]    = useState<number | null>(null);
  const [printGroupe,  setPrintGroupe]  = useState<{ bdcId: number; bdcLabel: string } | null>(null);

  const toggleBdc = (key: string) => {
    setOpenBdcIds((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Clients map
  const { data: clientsRaw = [] } = useQuery({
    queryKey: ["clients-map"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/clients", { per_page: 500 });
      return r.data ?? r ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const clientMap: Record<number, string> = Object.fromEntries(
    clientsRaw.map((c: any) => [c.id, c.nomComplet || `${c.nom || ""} ${c.prenom || ""}`.trim()])
  );

  // BDCs map
  const { data: bdcsRaw = [] } = useQuery({
    queryKey: ["bon-commandes-map"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/bon-commandes", { per_page: 500 });
      return (r.data ?? r ?? []) as BDC[];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
  const bdcMap: Record<number, BDC> = Object.fromEntries(bdcsRaw.map((b: BDC) => [b.id, b]));

  // BLs
  const { data: bls = [], isLoading, refetch } = useQuery<BL[]>({
    queryKey: ["bordereau-livraisons"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/bordereau-livraisons", { per_page: 500 });
      return r.data ?? r ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  const changerEtat = async (bl: BL, etat: string, label: string) => {
    setLoading(`${bl.id}-${etat}`);
    try {
      await apiClient.put(`/bordereau-livraisons/${bl.id}/${etat}`, {});
      toast({ title: label });
      qc.invalidateQueries({ queryKey: ["bordereau-livraisons"] });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  // ── KPIs ───────────────────────────────────────────────────────────────────

  const enAttente = bls.filter((b) => b.etat === "en_attente").length;
  const enCours   = bls.filter((b) => b.etat === "en_cours").length;
  const livres    = bls.filter((b) => b.etat === "livré").length;

  // ── Filtrage ───────────────────────────────────────────────────────────────

  const blsFiltres = bls.filter((b) => {
    if (filterEtat !== "tous" && b.etat !== filterEtat) return false;
    if (search) {
      const nom = b.clientId ? clientMap[b.clientId] || "" : "";
      const bdc = b.bonCommandeId ? bdcMap[b.bonCommandeId] : null;
      const hay = [b.num, nom, b.note, bdc?.numero].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // ── Groupement par BDC ─────────────────────────────────────────────────────

  type BdcGroup = { key: string; bdc: BDC | null; bdcId: number | null; bls: BL[] };

  const groupsMap = new Map<string, BdcGroup>();
  for (const bl of blsFiltres) {
    const key = bl.bonCommandeId != null ? `bdc-${bl.bonCommandeId}` : "sans-bdc";
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        bdcId: bl.bonCommandeId,
        bdc: bl.bonCommandeId != null ? (bdcMap[bl.bonCommandeId] ?? null) : null,
        bls: [],
      });
    }
    groupsMap.get(key)!.bls.push(bl);
  }
  const groups = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.bdcId == null) return 1;
    if (b.bdcId == null) return -1;
    return b.bdcId - a.bdcId;
  });

  const TABS = [
    { key: "tous",       label: "Tous",       count: bls.length },
    { key: "en_attente", label: "En attente", count: enAttente  },
    { key: "en_cours",   label: "En cours",   count: enCours    },
    { key: "livré",      label: "Livrés",     count: livres     },
  ];

  return (
    <>
    {/* Dialog Fiche individuelle */}
    <Dialog open={!!printBlId} onOpenChange={(o) => !o && setPrintBlId(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {printBlId && <BLFicheExpeditionPDF blId={printBlId} onClose={() => setPrintBlId(null)} />}
      </DialogContent>
    </Dialog>

    {/* Dialog Impression groupée BDC */}
    <Dialog open={!!printGroupe} onOpenChange={(o) => !o && setPrintGroupe(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {printGroupe && (
          <BLGroupePDF
            bdcId={printGroupe.bdcId}
            bdcLabel={printGroupe.bdcLabel}
            onClose={() => setPrintGroupe(null)}
          />
        )}
      </DialogContent>
    </Dialog>

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="h-8 w-8 text-orange-500" /> Livraisons
          </h1>
          <p className="text-muted-foreground mt-1">
            {enAttente} en attente · {enCours} en cours · {livres} livrés
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "en_attente", label: "En attente", value: enAttente, icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50" },
          { key: "en_cours",   label: "En cours",   value: enCours,   icon: Truck,        color: "text-blue-600",   bg: "bg-blue-50"   },
          { key: "livré",      label: "Livrés",     value: livres,    icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50"  },
        ].map(({ key, label, value, icon: Icon, color, bg }) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${filterEtat === key ? "ring-2 ring-offset-1 ring-primary" : ""}`}
            onClick={() => setFilterEtat(filterEtat === key ? "tous" : key)}
          >
            <CardContent className={`p-4 flex items-center gap-3 ${bg} rounded-lg`}>
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterEtat(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterEtat === key
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}{count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="BDC, client, référence…"
            className="pl-9 w-52"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste groupée par BDC */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            Aucun bordereau de livraison
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isOpen = openBdcIds.has(group.key);
            const totalBls  = group.bls.length;
            const livresBls = group.bls.filter((b) => b.etat === "livré").length;
            const allLivre  = livresBls === totalBls;
            const bdcLabel  = group.bdcId == null
              ? "Sans bon de commande"
              : group.bdc?.numero || `BDC-${String(group.bdcId).padStart(4, "0")}`;

            return (
              <Card key={group.key} className={isOpen ? "ring-2 ring-orange-400" : ""}>
                {/* ── En-tête BDC ── */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 rounded-lg"
                  onClick={() => toggleBdc(group.key)}
                >
                  <div className="text-muted-foreground">
                    {isOpen
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />}
                  </div>

                  {/* BDC label */}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-semibold text-sm">{bdcLabel}</span>
                    {group.bdc?.date && (
                      <span className="text-xs text-muted-foreground ml-3">{group.bdc.date}</span>
                    )}
                  </div>

                  {/* Clients count */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {totalBls} client{totalBls > 1 ? "s" : ""}
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${totalBls > 0 ? (livresBls / totalBls) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {livresBls}/{totalBls} livré{livresBls > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Badge global */}
                  {allLivre ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Tout livré
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      <Truck className="h-3 w-3" /> En cours
                    </span>
                  )}

                  {/* Imprimer tout le groupe — uniquement si BDC connu */}
                  {group.bdcId != null && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => { e.stopPropagation(); setPrintGroupe({ bdcId: group.bdcId!, bdcLabel: bdcLabel }); }}
                          >
                            <Printer className="h-3 w-3 mr-1" /> Tout imprimer
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Imprimer les bordereaux de tous les clients de ce BDC en un seul PDF
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* ── Lignes BL (accordéon) ── */}
                {isOpen && (
                  <div className="border-t bg-muted/20 px-4 py-3">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-0">
                          <TableHead className="h-7 text-xs">N° BL</TableHead>
                          <TableHead className="h-7 text-xs">Client</TableHead>
                          <TableHead className="h-7 text-xs">Date</TableHead>
                          <TableHead className="h-7 text-xs">Adresse / Note</TableHead>
                          <TableHead className="h-7 text-xs">Statut</TableHead>
                          <TableHead className="h-7 text-xs text-right w-52">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.bls.map((bl) => {
                          const clientNom = bl.clientId ? clientMap[bl.clientId] || `Client #${bl.clientId}` : "—";
                          const isLiv = loading?.startsWith(`${bl.id}-`);

                          return (
                            <TableRow key={bl.id} className="border-0 hover:bg-muted/30">
                              <TableCell className="py-2 font-mono font-semibold text-sm">
                                {bl.num || `BL-${String(bl.id).padStart(4, "0")}`}
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="font-medium text-sm">{clientNom}</span>
                              </TableCell>
                              <TableCell className="py-2 text-sm text-muted-foreground whitespace-nowrap">
                                {bl.date || "—"}
                              </TableCell>
                              <TableCell className="py-2 max-w-xs">
                                {bl.note ? (
                                  <span className="flex items-start gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{bl.note}</span>
                                  </span>
                                ) : "—"}
                              </TableCell>
                              <TableCell className="py-2">
                                <StatutBadge etat={bl.etat} />
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <TooltipProvider delayDuration={300}>
                                <div className="flex justify-end gap-1">
                                  {bl.etat === "en_attente" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                          disabled={!!isLiv}
                                          onClick={() => changerEtat(bl, "livrer", "Livraison en cours")}
                                        >
                                          {loading === `${bl.id}-livrer`
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <><Truck className="h-3 w-3 mr-1" />En cours</>}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs text-center">
                                        Mettre la livraison en route — le chauffeur est parti chez le client
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {bl.etat === "en_cours" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                          disabled={!!isLiv}
                                          onClick={() => changerEtat(bl, "livrer", "Livraison confirmée")}
                                        >
                                          {loading === `${bl.id}-livrer`
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <><CheckCircle2 className="h-3 w-3 mr-1" />Livré</>}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs text-center">
                                        Confirmer que la marchandise a bien été remise au client
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {(bl.etat === "en_attente" || bl.etat === "en_cours") && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                          disabled={!!isLiv}
                                          onClick={() => changerEtat(bl, "annuler", "BL annulé")}
                                        >
                                          {loading === `${bl.id}-annuler`
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : "Annuler"}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs text-center">
                                        Annuler ce bordereau de livraison (problème client, erreur de commande...)
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {bl.etat === "livré" && (
                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Livré
                                    </span>
                                  )}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs text-muted-foreground"
                                        onClick={() => setPrintBlId(bl.id)}
                                      >
                                        <Printer className="h-3 w-3 mr-1" /> Fiche
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Imprimer la fiche d'expédition à remettre au chauffeur
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                </TooltipProvider>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
