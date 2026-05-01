import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  RefreshCw, Search, Store, UserCheck, MapPin, AlertCircle,
  CheckCircle2, ClipboardList, ChevronsUpDown, Check, Loader2,
  Building2, Package, ArrowRight, Truck, ShoppingCart, FileText,
  Eye, Pencil, MoreHorizontal,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "../services/apiClient";
import { mapCmdStatut, CMD_STATUT } from "../lib/commandes.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agence { id: number; agence: string; region: { id: number; region: string } }

interface CommandeRow {
  id: number;
  reference: string;
  source: "terrain" | "marketplace";
  commercialNom: string | null;
  clientId: number | null;
  clientNom: string;
  clientTel: string;
  clientVille: string | null;
  clientVilleFallback: boolean;
  clientAdresse: string | null;
  agenceId: number | null;
  agenceNom: string | null;
  regionNom: string | null;
  montant: number;
  etat: string;
  date: string;
  nbArticles: number;
}

interface BDCResultItem {
  agenceNom: string;
  nbCommandes: number;
  montant: number;
}

// ─── Agence inline selector ───────────────────────────────────────────────────

function AgenceSelector({
  value, agences, onChange, loading,
}: {
  value: number | null;
  agences: Agence[];
  onChange: (id: number) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sel = agences.find((a) => a.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors
            ${value
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 border-dashed"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {loading
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : value
            ? <><Building2 className="h-3 w-3" />{sel?.agence ?? "Agence"}</>
            : <><AlertCircle className="h-3 w-3" />Non assignée</>}
          <ChevronsUpDown className="h-2.5 w-2.5 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Agence…" className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              Aucune agence
            </CommandEmpty>
            <CommandGroup>
              {agences.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.agence}
                  onSelect={() => { onChange(a.id); setOpen(false); }}
                  className="text-xs"
                >
                  <Check className={`mr-2 h-3 w-3 ${value === a.id ? "opacity-100" : "opacity-0"}`} />
                  <span className="flex-1">{a.agence}</span>
                  <span className="text-muted-foreground">{a.region?.region}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Statut badge ─────────────────────────────────────────────────────────────

function StatutBadge({ etat }: { etat: string }) {
  const statut = mapCmdStatut(etat);
  const cfg = CMD_STATUT[statut] ?? CMD_STATUT.brouillon;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
      <Icon className="h-2.5 w-2.5" />{cfg.label}
    </span>
  );
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source, commercialNom }: {
  source: "terrain" | "marketplace";
  commercialNom: string | null;
}) {
  return source === "terrain" ? (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 w-fit">
        <UserCheck className="h-2.5 w-2.5" />
        Terrain
      </span>
      {commercialNom && (
        <span className="text-xs text-muted-foreground pl-0.5">{commercialNom}</span>
      )}
    </div>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 w-fit">
      <Store className="h-2.5 w-2.5" />
      Marketplace
    </span>
  );
}

// ─── Pipeline flux ────────────────────────────────────────────────────────────

function FluxPipeline({
  nbCommandes, nbBDC, nbCF, nbLivraisons,
}: {
  nbCommandes: number; nbBDC: number; nbCF: number; nbLivraisons: number;
}) {
  const steps = [
    { label: "Commandes reçues", count: nbCommandes, icon: ShoppingCart, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", active: true },
    { label: "Bons de commande", count: nbBDC,       icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", active: nbBDC > 0 },
    { label: "Cmd. fournisseurs", count: nbCF,       icon: FileText,      color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200",  active: nbCF > 0 },
    { label: "Livraisons",        count: nbLivraisons,icon: Truck,        color: "text-green-600", bg: "bg-green-50", border: "border-green-200", active: nbLivraisons > 0 },
  ];

  return (
    <div className="flex items-center gap-0 rounded-lg border bg-muted/20 px-4 py-3 overflow-x-auto">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${s.active ? `${s.bg} ${s.border}` : "border-transparent"}`}>
              <Icon className={`h-4 w-4 ${s.active ? s.color : "text-muted-foreground/40"}`} />
              <div>
                <p className={`text-lg font-bold leading-none ${s.active ? s.color : "text-muted-foreground/40"}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{s.label}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 mx-1 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Dialog résultat BDC ──────────────────────────────────────────────────────

function BDCResultDialog({
  open, onClose, results, onVoirBDC,
}: {
  open: boolean;
  onClose: () => void;
  results: BDCResultItem[];
  onVoirBDC: () => void;
}) {
  const total = results.reduce((s, r) => s + r.montant, 0);
  const nbTotal = results.reduce((s, r) => s + r.nbCommandes, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            {results.length} Bon{results.length > 1 ? "s" : ""} de Commande créé{results.length > 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Récapitulatif */}
          <div className="rounded-lg border divide-y">
            {results.map((r, i) => (
              <div key={i} className="px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.agenceNom}</p>
                  <p className="text-xs text-muted-foreground">{r.nbCommandes} commande{r.nbCommandes > 1 ? "s" : ""}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(r.montant)}</span>
              </div>
            ))}
            <div className="px-3 py-2 bg-muted/40 flex justify-between text-sm font-semibold">
              <span>{nbTotal} commande{nbTotal > 1 ? "s" : ""} au total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Étapes suivantes */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-3 space-y-2">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Étapes suivantes</p>
            <div className="space-y-1.5">
              {[
                { step: "1", text: "Les BDCs sont transmis à la Logistique", done: true },
                { step: "2", text: "La Logistique assigne les fournisseurs", done: false },
                { step: "3", text: "Les commandes fournisseurs sont générées", done: false },
                { step: "4", text: "Réception et livraison client", done: false },
              ].map(({ step, text, done }) => (
                <div key={step} className="flex items-start gap-2">
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-green-600 text-white" : "bg-blue-200 text-blue-700"}`}>
                    {done ? "✓" : step}
                  </span>
                  <p className={`text-xs ${done ? "text-green-700 font-medium" : "text-blue-700"}`}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Continuer</Button>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={onVoirBDC}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Voir en Logistique
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const TABS = [
  { key: "tous",          label: "Toutes" },
  { key: "non_assignees", label: "Non assignées" },
  { key: "validees",      label: "Validées" },
] as const;
type TabKey = typeof TABS[number]["key"];

const ETAT_LABELS: Record<string, string> = {
  brouillon:  "Brouillon",
  validee:    "Validée",
  en_cours:   "En cours",
  livree:     "Livrée",
  annulee:    "Annulée",
};

export default function CommandesReceptionPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [tab, setTab]               = useState<TabKey>("tous");
  const [search, setSearch]         = useState("");
  const [filterSource, setFilterSource] = useState<"tous" | "terrain" | "marketplace">("tous");
  const [filterAgence, setFilterAgence] = useState<number | "tous">("tous");
  const [filterEtat, setFilterEtat] = useState<string>("tous");
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [assigning, setAssigning]   = useState<Set<number>>(new Set());
  const [bdcResult, setBdcResult]   = useState<BDCResultItem[] | null>(null);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: raw = [], isLoading, refetch } = useQuery({
    queryKey: ["commandes-reception"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/commande-clients", { per_page: 500 });
      return (r.data ?? r ?? []) as any[];
    },
    staleTime: 1000 * 30,
  });

  const { data: agences = [] } = useQuery<Agence[]>({
    queryKey: ["agences-list"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/agences");
      return (Array.isArray(r) ? r : r?.data ?? []) as Agence[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: bdcRes } = useQuery({
    queryKey: ["bon-commandes"],
    // Même shape que BonCommandesService.getAll → { data: [], meta: {} }
    queryFn: async () => {
      const r = await apiClient.get<any>("/bon-commandes", { per_page: 500 });
      const data = (Array.isArray(r) ? r : (r?.data ?? [])) as any[];
      return { data, meta: r?.meta ?? {} };
    },
    staleTime: 1000 * 30,
  });
  const bdcList = bdcRes?.data ?? [];

  // IDs des commandes-clients déjà présentes dans un BDC (persistant, toutes sessions)
  const alreadyInBdc = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    for (const bdc of bdcList) {
      for (const l of (bdc.lignes ?? bdc.lines ?? [])) {
        const cid = l.commandeClientId ?? l.commande_client_id;
        if (cid) ids.add(Number(cid));
      }
    }
    return ids;
  }, [bdcList]);

  const { data: cfList = [] } = useQuery({
    queryKey: ["commandes-fournisseurs-count"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/commande-fournisseurs");
      return (r.data ?? r ?? []) as any[];
    },
    staleTime: 1000 * 60,
  });

  // ── Transformer les données ───────────────────────────────────────────────
  const commandes: CommandeRow[] = useMemo(() => {
    if (raw.length > 0) {
      // eslint-disable-next-line no-console
      console.debug("[CommandesReception] raw[0]:", JSON.stringify(raw[0], null, 2));
    }
    return raw.map((c: any) => {
      // Commercial name: try all possible field names (Laravel uses `name`, French uses nom/prenom)
      const u = c.user;
      const commercialNom = u
        ? (u.name ||
           `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() ||
           u.nom_complet ||
           u.email ||
           null)
        : null;

      // Client data
      const cl = c.client;
      const clientNom = cl
        ? (cl.nom_complet ||
           `${cl.nom ?? ""} ${cl.prenom ?? ""}`.trim() ||
           cl.raison_sociale ||
           cl.name ||
           cl.telephone ||
           "—")
        : "—";

      // Région/ville du client — essayer tous les champs possibles
      const clientVilleReel =
        cl?.ville ||
        cl?.city ||
        cl?.region ||
        cl?.localite ||
        cl?.quartier ||
        cl?.adresse_ville ||
        c.ville_livraison ||
        c.region_livraison ||
        c.localite ||
        (c.adresse_livraison
          ? (c.adresse_livraison as string).split(",").pop()?.trim() || null
          : null) ||
        null;
      // Fallback : région de l'agence assignée (indicatif, signalé visuellement)
      const agenceRegion = c.agence?.region?.region ?? null;
      const clientVille = clientVilleReel ?? agenceRegion;
      const clientVilleFallback = !clientVilleReel && !!agenceRegion;

      // Adresse livraison
      const clientAdresse =
        c.adresse_livraison ||
        c.adresseLivraison ||
        (cl
          ? [cl.adresse, cl.quartier, cl.ville].filter(Boolean).join(", ") || null
          : null);

      return {
        id:                  c.id,
        reference:           c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
        source:              (c.userId || c.user_id) ? "terrain" : "marketplace",
        commercialNom,
        clientId:     c.client_id ?? c.clientId ?? cl?.id ?? null,
        clientNom,
        clientTel:    cl?.telephone ?? "",
        clientVille,
        clientVilleFallback,
        clientAdresse,
        agenceId:     c.agenceId ?? c.agence_id ?? null,
        agenceNom:    c.agence?.agence ?? null,
        regionNom:    c.agence?.region?.region ?? null,
        montant:      Number(c.montant) || 0,
        etat:         c.etat ?? "brouillon",
        date:         c.date ?? c.created_at?.split("T")[0] ?? "",
        nbArticles:   (c.articles ?? []).length,
      };
    });
  }, [raw]);

  // ── Stats pipeline ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:        commandes.length,
    nonAssignees: commandes.filter((c) => !c.agenceId).length,
    validees:     commandes.filter((c) => mapCmdStatut(c.etat) === "validee").length,
    montantTotal: commandes.reduce((s, c) => s + c.montant, 0),
  }), [commandes]);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return commandes.filter((c) => {
      if (tab === "non_assignees" && c.agenceId) return false;
      if (tab === "validees" && mapCmdStatut(c.etat) !== "validee") return false;
      if (filterSource !== "tous" && c.source !== filterSource) return false;
      if (filterAgence !== "tous" && c.agenceId !== filterAgence) return false;
      if (filterEtat !== "tous" && mapCmdStatut(c.etat) !== filterEtat) return false;
      if (q && !c.reference.toLowerCase().includes(q) && !c.clientNom.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [commandes, tab, filterSource, filterAgence, filterEtat, search]);

  // ── Sélection — les commandes déjà en BDC ne peuvent pas être sélectionnées ──
  const selectable    = filtered.filter((c) => !alreadyInBdc.has(c.id));
  const allSelected   = selectable.length > 0 && selectable.every((c) => selected.has(c.id));
  const someSelected  = filtered.some((c) => selected.has(c.id));
  const selectedList  = filtered.filter((c) => selected.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); selectable.forEach((c) => s.delete(c.id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); selectable.forEach((c) => s.add(c.id)); return s; });
    }
  };

  const toggleOne = useCallback((id: number) => {
    if (alreadyInBdc.has(id)) return; // bloqué
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, [alreadyInBdc]);

  // ── Assigner agence (une commande) ────────────────────────────────────────
  const assignAgence = useCallback(async (cmdId: number, agenceId: number) => {
    setAssigning((prev) => new Set(prev).add(cmdId));
    try {
      await apiClient.put(`/commande-clients/${cmdId}`, { agence_id: agenceId });
      qc.invalidateQueries({ queryKey: ["commandes-reception"] });
    } catch {
      toast({ title: "Erreur d'assignation", variant: "destructive" });
    } finally {
      setAssigning((prev) => { const s = new Set(prev); s.delete(cmdId); return s; });
    }
  }, [qc]);

  // ── Créer BDC depuis sélection ────────────────────────────────────────────
  const creerBDC = async () => {
    // Bloquer les commandes déjà dans un BDC
    const dejaAssignees = selectedList.filter((c) => alreadyInBdc.has(c.id));
    if (dejaAssignees.length > 0) {
      toast({
        title: "Commandes déjà dans un BDC",
        description: `${dejaAssignees.map((c) => c.reference).join(", ")} — retirez-les de la sélection.`,
        variant: "destructive",
      });
      return;
    }

    const parAgence = new Map<number, CommandeRow[]>();
    for (const c of selectedList) {
      if (!c.agenceId) {
        toast({
          title: "Commandes non assignées",
          description: "Toutes les commandes sélectionnées doivent avoir une agence.",
          variant: "destructive",
        });
        return;
      }
      const list = parAgence.get(c.agenceId) ?? [];
      list.push(c);
      parAgence.set(c.agenceId, list);
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const results: BDCResultItem[] = [];

      for (const [agenceId, cmds] of parAgence) {
        const agenceNom = agences.find((a) => a.id === agenceId)?.agence ?? `Agence #${agenceId}`;
        await apiClient.post("/bon-commandes", {
          agence_id: agenceId,
          date: today,
          statut: "brouillon",
          note: `BDC auto — ${agenceNom} — ${cmds.length} commande(s)`,
          lignes: cmds.map((c) => ({
            client_id:          c.clientId ?? null,
            article_id:         null,
            commande_client_id: c.id,
            quantite:           1,
            prix:               c.montant,
            // complement = référence + nom client pour affichage dans le BDC
            complement:         c.clientNom && c.clientNom !== "—"
                                  ? `${c.reference} — ${c.clientNom}`
                                  : c.reference,
            adresse_livraison:  c.clientAdresse ?? null,
          })),
        });
        results.push({
          agenceNom,
          nbCommandes: cmds.length,
          montant: cmds.reduce((s, c) => s + c.montant, 0),
        });
      }

      setSelected(new Set());
      setBdcResult(results);
      // Invalider les BDC pour que alreadyInBdc se mette à jour
      qc.invalidateQueries({ queryKey: ["bon-commandes"] });
      qc.invalidateQueries({ queryKey: ["commandes-reception"] });
    } catch (e: any) {
      toast({ title: "Erreur création BDC", description: e?.message, variant: "destructive" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Commandes à traiter
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Réception, assignation agence et création des bons de commande
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Pipeline flux de traitement */}
      <FluxPipeline
        nbCommandes={commandes.length}
        nbBDC={bdcList.length}
        nbCF={cfList.length}
        nbLivraisons={0}
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total commandes",  value: stats.total,        color: "text-gray-700",  bg: "bg-gray-50",   border: "border-gray-200" },
          { label: "Non assignées",    value: stats.nonAssignees, color: "text-amber-700", bg: "bg-amber-50",  border: "border-amber-200", alert: stats.nonAssignees > 0 },
          { label: "Validées",         value: stats.validees,     color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-200" },
          { label: "Montant total",    value: formatCurrency(stats.montantTotal), color: "text-green-700", bg: "bg-green-50", border: "border-green-200", isText: true },
        ].map(({ label, value, color, bg, border, alert, isText }) => (
          <div key={label} className={`rounded-lg border ${border} ${bg} px-3 py-2.5 flex flex-col gap-0.5`}>
            <span className={`text-xl font-bold ${color} ${alert ? "animate-pulse" : ""}`}>
              {isText ? value : value}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs + filtres */}
      <div className="space-y-2">
        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {TABS.map(({ key, label }) => {
            const count = key === "non_assignees"
              ? stats.nonAssignees
              : key === "validees"
              ? stats.validees
              : stats.total;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Référence, client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Source filter */}
          <div className="flex gap-1">
            {(["tous", "terrain", "marketplace"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSource(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterSource === s
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === "tous" ? "Toutes sources" : s === "terrain" ? "Terrain" : "Marketplace"}
              </button>
            ))}
          </div>

          {/* Agence filter */}
          <select
            value={filterAgence}
            onChange={(e) => setFilterAgence(e.target.value === "tous" ? "tous" : Number(e.target.value))}
            className="h-8 text-xs border rounded px-2 bg-background"
          >
            <option value="tous">Toutes agences</option>
            {agences.map((a) => (
              <option key={a.id} value={a.id}>{a.agence} ({a.region?.region})</option>
            ))}
          </select>

          {/* Statut filter */}
          <select
            value={filterEtat}
            onChange={(e) => setFilterEtat(e.target.value)}
            className="h-8 text-xs border rounded px-2 bg-background"
          >
            <option value="tous">Tous statuts</option>
            {Object.entries(ETAT_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barre d'action groupée */}
      {someSelected && (
        <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">
            {selectedList.length} sélectionnée(s)
          </span>
          <div className="h-4 w-px bg-border" />

          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={creerBDC}
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            Créer BDC ({selectedList.length})
          </Button>

          <button
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelected(new Set())}
          >
            Désélectionner
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-1.5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* En-tête */}
              <thead className="bg-muted/60 border-b">
                <tr>
                  <th className="w-10 px-3 py-2.5">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Tout sélectionner"
                      className="h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Référence</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Canal</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Région</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agence assignée</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Montant</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => {
                  const isSelected   = selected.has(c.id);
                  const isAssigning  = assigning.has(c.id);
                  const nonAssignee  = !c.agenceId;
                  const isInBdc      = alreadyInBdc.has(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors
                        ${isInBdc
                          ? "bg-green-50/60 opacity-70"
                          : isSelected
                          ? "bg-primary/5 cursor-pointer"
                          : nonAssignee
                          ? "bg-amber-50/40 hover:bg-amber-50/60 cursor-pointer"
                          : "hover:bg-muted/30 cursor-pointer"}`}
                      onClick={() => !isInBdc && toggleOne(c.id)}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          disabled={isInBdc}
                          onCheckedChange={() => toggleOne(c.id)}
                          className="h-3.5 w-3.5"
                        />
                      </td>

                      {/* Référence */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold">{c.reference}</span>
                          {isInBdc && (
                            <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                              ✓ En BDC
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Commercial */}
                      <td className="px-3 py-2">
                        <SourceBadge
                          source={c.source}
                          commercialNom={c.commercialNom}
                        />
                      </td>

                      {/* Client */}
                      <td className="px-3 py-2">
                        <p className="font-medium text-sm leading-tight">{c.clientNom}</p>
                        {c.clientTel && (
                          <p className="text-xs text-muted-foreground">{c.clientTel}</p>
                        )}
                      </td>

                      {/* Région du client */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        {c.clientVille ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${
                            c.clientVilleFallback
                              ? "text-gray-500 bg-gray-50 border-gray-200 italic"
                              : "text-blue-700 bg-blue-50 border-blue-200"
                          }`}>
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {c.clientVille}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>

                      {/* Agence assignée */}
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <AgenceSelector
                          value={c.agenceId}
                          agences={agences}
                          onChange={(agenceId) => assignAgence(c.id, agenceId)}
                          loading={isAssigning}
                        />
                      </td>

                      {/* Montant */}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <span className="font-semibold text-sm">{formatCurrency(c.montant)}</span>
                      </td>

                      {/* Statut */}
                      <td className="px-3 py-2">
                        <StatutBadge etat={c.etat} />
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {c.date}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Voir la commande"
                            onClick={() => navigate(`/admin/commercial/commandes/${c.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"
                            title="Modifier la commande"
                            onClick={() => navigate(`/admin/commercial/commandes/${c.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pied de table */}
          <div className="bg-muted/30 border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} commande(s) affichée(s) sur {commandes.length}</span>
            {someSelected && (
              <span className="font-medium text-primary">
                {selectedList.length} sélectionnée(s) — {formatCurrency(selectedList.reduce((s, c) => s + c.montant, 0))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dialog résultat BDC */}
      {bdcResult && (
        <BDCResultDialog
          open={true}
          results={bdcResult}
          onClose={() => setBdcResult(null)}
          onVoirBDC={() => {
            setBdcResult(null);
            navigate("/admin/achats/bon-commandes");
          }}
        />
      )}
    </div>
  );
}
