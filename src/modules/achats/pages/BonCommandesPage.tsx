import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList, RefreshCcw, ChevronDown, ChevronRight,
  Zap, CheckCircle2, Clock, Truck, AlertCircle, Loader2, ChevronsUpDown, Check,
  Send, Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { BonCommandesService, BonCommande } from "../services/bon-commandes.service";
import { apiClient } from "@/modules/commercial/services/apiClient";

// ─── Combobox fournisseur avec recherche ──────────────────────────────────────

function FournisseurCombobox({
  value,
  onChange,
  fournisseurs,
}: {
  value: number | undefined;
  onChange: (id: number) => void;
  fournisseurs: { id: number; nomComplet: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = fournisseurs.find((f) => f.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-8 w-52 justify-between text-xs font-normal truncate"
        >
          <span className="truncate">{selected ? selected.nomComplet : "Choisir fournisseur…"}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher…" className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              Aucun fournisseur trouvé
            </CommandEmpty>
            <CommandGroup>
              {fournisseurs.map((f) => (
                <CommandItem
                  key={f.id}
                  value={f.nomComplet}
                  onSelect={() => { onChange(f.id); setOpen(false); }}
                  className="text-xs"
                >
                  <Check className={`mr-2 h-3 w-3 ${value === f.id ? "opacity-100" : "opacity-0"}`} />
                  {f.nomComplet}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  brouillon:  { label: "Brouillon",  color: "bg-gray-100 text-gray-600"   },
  en_cours:   { label: "En cours",   color: "bg-blue-100 text-blue-700"   },
  transmis:   { label: "Transmis",   color: "bg-indigo-100 text-indigo-700" },
  termine:    { label: "Terminé",    color: "bg-green-100 text-green-700" },
};

function statutBadge(s: string) {
  const cfg = STATUT_CONFIG[s] ?? STATUT_CONFIG.brouillon;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BonCommandesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const rolesLower = (user?.roles ?? []).map((r) => r.toLowerCase().trim());
  const isCommercial = rolesLower.some((r) => ["commercial", "vendeur", "vendeuse", "sales"].includes(r));
  const isLogistique = rolesLower.some((r) => ["logistique", "logistic"].includes(r));
  // Admin voit tout comme logistique (peut assigner fournisseurs)
  const isAdmin = rolesLower.some((r) => ["admin", "super_admin"].includes(r));

  const [openId, setOpenId]         = useState<number | null>(null);
  const [localFourn, setLocalFourn] = useState<Record<number, number>>({});
  const [saving, setSaving]         = useState(false);
  const [transmitting, setTransmitting] = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const [genResult, setGenResult]   = useState<Record<number, any>>({});

  // ── Données ────────────────────────────────────────────────────────────
  const { data: bdcRes, isLoading, refetch } = useQuery({
    queryKey: ["bon-commandes"],
    queryFn: () => BonCommandesService.getAll({ per_page: 100 }),
    staleTime: 0,
  });
  const bdcs: BonCommande[] = bdcRes?.data ?? [];

  const { data: fournisseursRaw = [] } = useQuery({
    queryKey: ["fournisseurs-list"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/fournisseurs", { per_page: 200 });
      return r.data ?? r ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const fournisseurs: { id: number; nomComplet: string }[] = fournisseursRaw;

  const { data: clientsRaw = [] } = useQuery({
    queryKey: ["clients-map"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/clients", { per_page: 500 });
      return r.data ?? r ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const clientMap: Record<number, string> = Object.fromEntries(
    clientsRaw.map((c: any) => [
      c.id,
      c.nomComplet ||
      c.nom_complet ||
      `${c.nom || ""} ${c.prenom || ""}`.trim() ||
      c.raison_sociale ||
      c.name ||
      `Client #${c.id}`,
    ])
  );

  const { data: articlesRaw = [] } = useQuery({
    queryKey: ["articles-map"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/articles", { per_page: 500 });
      return r.data ?? r ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const articleMap: Record<number, { libelle: string; prix: number }> = Object.fromEntries(
    articlesRaw.map((a: any) => [a.id, { libelle: a.libelle, prix: Number(a.prix) }])
  );

  const fournMap: Record<number, string> = Object.fromEntries(
    fournisseurs.map((f) => [f.id, f.nomComplet])
  );

  // Join commandes → client nom + adresse livraison pour les lignes BDC
  const { data: commandesRaw = [] } = useQuery({
    queryKey: ["commandes-clients-map"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/commande-clients", { per_page: 500 });
      return (Array.isArray(r) ? r : r?.data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const commandeMap = useMemo(() => {
    const map: Record<number, { clientNom: string; adresse: string }> = {};
    for (const c of commandesRaw) {
      const cl = c.client;
      const clientNom = cl
        ? (cl.nom_complet ||
           `${cl.nom ?? ""} ${cl.prenom ?? ""}`.trim() ||
           cl.raison_sociale || cl.name || "")
        : "";
      const adresse =
        c.adresse_livraison ||
        c.adresseLivraison ||
        (cl ? [cl.adresse, cl.quartier, cl.ville].filter(Boolean).join(", ") : "") ||
        "";
      map[c.id] = { clientNom, adresse };
    }
    return map;
  }, [commandesRaw]);

  // Liste filtrée : logistique ne voit que les BDC transmis (pas les brouillons)
  const bdcsVisible = useMemo(() => {
    if (isLogistique && !isAdmin) {
      return bdcs.filter((b) => b.statut !== "brouillon");
    }
    return bdcs;
  }, [bdcs, isLogistique, isAdmin]);

  // ── Ouvrir/fermer un BDC ───────────────────────────────────────────────
  const toggleBdc = (bdc: BonCommande) => {
    if (openId === bdc.id) {
      setOpenId(null);
      return;
    }
    setOpenId(bdc.id);
    // pré-remplir les sélecteurs avec les fournisseurs déjà assignés
    const init: Record<number, number> = {};
    for (const l of bdc.lignes) {
      if (l.fournisseurId) init[l.id] = l.fournisseurId;
    }
    setLocalFourn(init);
    setGenResult((prev) => ({ ...prev }));
  };

  // ── Sauvegarder les assignations fournisseur ───────────────────────────
  const handleSaveFournisseurs = async (bdc: BonCommande) => {
    setSaving(true);
    try {
      const promises = bdc.lignes
        .filter((l) => localFourn[l.id] !== undefined && localFourn[l.id] !== l.fournisseurId)
        .map((l) => BonCommandesService.assignerFournisseur(bdc.id, l.id, localFourn[l.id]));
      await Promise.all(promises);
      toast({ title: "Fournisseurs enregistrés" });
      refetch();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Transmettre un BDC à la logistique ────────────────────────────────
  const handleTransmettre = async (bdc: BonCommande) => {
    setTransmitting(bdc.id);
    try {
      await BonCommandesService.update(bdc.id, { statut: "transmis" } as any);
      toast({ title: "BDC transmis à la logistique" });
      qc.invalidateQueries({ queryKey: ["bon-commandes"] });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setTransmitting(null);
    }
  };

  // ── Supprimer un brouillon ─────────────────────────────────────────────
  const handleDelete = async (bdc: BonCommande) => {
    if (!confirm(`Supprimer le brouillon ${bdc.numero || `BDC-${bdc.id}`} ?`)) return;
    setDeleting(bdc.id);
    try {
      await BonCommandesService.delete(bdc.id);
      toast({ title: "Brouillon supprimé" });
      if (openId === bdc.id) setOpenId(null);
      qc.invalidateQueries({ queryKey: ["bon-commandes"] });
      qc.invalidateQueries({ queryKey: ["commandes-reception"] });
    } catch (e: any) {
      toast({ title: "Erreur suppression", description: e?.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  // ── Générer les commandes fournisseurs ─────────────────────────────────
  const handleGenerer = async (bdc: BonCommande) => {
    // S'assurer que toutes les lignes ont un fournisseur
    const nonAssignees = bdc.lignes.filter((l) => !(localFourn[l.id] ?? l.fournisseurId));
    if (nonAssignees.length > 0) {
      toast({
        title: "Fournisseur manquant",
        description: `${nonAssignees.length} ligne(s) sans fournisseur. Assignez-en un pour chaque ligne.`,
        variant: "destructive",
      });
      return;
    }

    // Sauvegarder d'abord les assignations non encore enregistrées
    await handleSaveFournisseurs(bdc);

    setGenerating(bdc.id);
    try {
      const result = await BonCommandesService.generer(bdc.id);
      setGenResult((prev) => ({ ...prev, [bdc.id]: result }));
      toast({ title: `${result.commandes.length} commande(s) fournisseur générée(s)` });
      refetch();
      qc.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
    } catch (e: any) {
      toast({ title: "Erreur génération", description: e?.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  // ── Stats rapides ──────────────────────────────────────────────────────
  const stats = {
    total:      bdcsVisible.length,
    brouillons: bdcsVisible.filter((b) => b.statut === "brouillon").length,
    transmis:   bdcsVisible.filter((b) => b.statut === "transmis").length,
    enCours:    bdcsVisible.filter((b) => b.statut === "en_cours").length,
    termine:    bdcsVisible.filter((b) => b.statut === "termine").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Bons de Commande
          </h1>
          <p className="text-muted-foreground mt-1">
            Regroupement des commandes par agence — assignation fournisseurs et génération des achats
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total BDC",   value: stats.total,      icon: ClipboardList, color: "text-gray-600" },
          { label: "Brouillons",  value: stats.brouillons, icon: Clock,         color: "text-amber-600", hide: isLogistique && !isAdmin },
          { label: "Transmis",    value: stats.transmis,   icon: Send,          color: "text-blue-600" },
          { label: "Terminés",    value: stats.termine,    icon: CheckCircle2,  color: "text-green-600" },
        ].filter((s) => !s.hide).map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des BDC */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : bdcsVisible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isLogistique && !isAdmin
              ? "Aucun bon de commande transmis. En attente de validation par le responsable commercial."
              : "Aucun bon de commande. Créez-en un depuis les commandes clients."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bdcsVisible.map((bdc) => {
            const isOpen = openId === bdc.id;
            const totalLignes = bdc.lignes.length;
            const assignees   = bdc.lignes.filter((l) => l.fournisseurId).length;
            const montantTotal = bdc.lignes.reduce((s, l) => s + Number(l.prix) * l.quantite, 0);
            const result = genResult[bdc.id];

            return (
              <Card key={bdc.id} className={isOpen ? "ring-2 ring-blue-500" : ""}>
                {/* ── En-tête BDC cliquable ── */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 rounded-t-lg"
                  onClick={() => toggleBdc(bdc)}
                >
                  <div className="flex items-center gap-4">
                    {isOpen
                      ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className="font-semibold text-base">{bdc.numero || `BDC-${bdc.id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {bdc.date} · {totalLignes} ligne(s) · {formatCurrency(montantTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {assignees}/{totalLignes} fournisseurs assignés
                    </span>
                    {assignees === totalLignes && totalLignes > 0
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {statutBadge(bdc.statut)}

                    {/* Actions brouillon — commercial uniquement */}
                    {(isCommercial || isAdmin) && bdc.statut === "brouillon" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={transmitting === bdc.id}
                          onClick={(e) => { e.stopPropagation(); handleTransmettre(bdc); }}
                        >
                          {transmitting === bdc.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Send className="h-3 w-3" />}
                          Transmettre
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          disabled={deleting === bdc.id}
                          onClick={(e) => { e.stopPropagation(); handleDelete(bdc); }}
                        >
                          {deleting === bdc.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Détail BDC ── */}
                {isOpen && (
                  <div className="border-t">
                    <CardContent className="p-4 space-y-4">
                      {/* Tableau des lignes */}
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Client</TableHead>
                              <TableHead>Produit / Référence</TableHead>
                              <TableHead className="text-right">Qté</TableHead>
                              <TableHead className="text-right">Prix</TableHead>
                              <TableHead>Adresse livraison</TableHead>
                              <TableHead className="w-52">Fournisseur</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bdc.lignes.map((ligne) => {
                              // Join avec commande pour avoir client + adresse
                              const cmdData = ligne.commandeClientId
                                ? commandeMap[ligne.commandeClientId]
                                : null;

                              // Client : clientId → clientMap, sinon commandeMap, sinon complement
                              const clientNom = ligne.clientId
                                ? clientMap[ligne.clientId] || cmdData?.clientNom || `Client #${ligne.clientId}`
                                : cmdData?.clientNom ||
                                  (ligne.complement?.includes(" — ")
                                    ? ligne.complement.split(" — ").slice(1).join(" — ")
                                    : null) ||
                                  "—";

                              // Référence commande (avant le " — " dans complement)
                              const refCommande = ligne.complement?.split(" — ")[0] || ligne.complement;

                              // Produit/Référence : article ou référence commande
                              const articleLib = ligne.articleId
                                ? articleMap[ligne.articleId]?.libelle || `Art. #${ligne.articleId}`
                                : refCommande || "—";

                              // Adresse : ligne BDC, puis commande joinée
                              const adresse =
                                (ligne as any).adresse_livraison ||
                                ligne.adresseLivraison ||
                                cmdData?.adresse ||
                                "—";

                              const currentFourn = localFourn[ligne.id] ?? ligne.fournisseurId ?? undefined;

                              return (
                                <TableRow key={ligne.id}>
                                  <TableCell className="font-medium">{clientNom}</TableCell>
                                  <TableCell>{articleLib}</TableCell>
                                  <TableCell className="text-right">{ligne.quantite}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(Number(ligne.prix))}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                                    {adresse}
                                  </TableCell>
                                  <TableCell>
                                    <FournisseurCombobox
                                      value={currentFourn}
                                      onChange={(id) => setLocalFourn((prev) => ({ ...prev, [ligne.id]: id }))}
                                      fournisseurs={fournisseurs}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Résultat génération */}
                      {result && (
                        <div className="rounded-md bg-green-50 border border-green-200 p-3 space-y-1">
                          <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {result.message}
                          </p>
                          {result.commandes.map((cf: any) => (
                            <p key={cf.id} className="text-xs text-green-700 pl-6">
                              • CF #{cf.id} — {fournMap[cf.fournisseurId] || `Fournisseur #${cf.fournisseurId}`} — {formatCurrency(cf.montant)}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <TooltipProvider delayDuration={300}>
                      <div className="flex justify-end gap-3 pt-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              onClick={() => handleSaveFournisseurs(bdc)}
                            >
                              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Sauvegarder assignations
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            Enregistre l'attribution des fournisseurs pour chaque ligne du bon de commande
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              disabled={generating === bdc.id || bdc.statut === "en_cours" || bdc.statut === "termine" || bdc.statut === "brouillon"}
                              onClick={() => handleGenerer(bdc)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {generating === bdc.id
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Zap className="h-4 w-4 mr-2" />}
                              {bdc.statut === "brouillon"
                                ? "En attente de transmission"
                                : bdc.statut === "en_cours" || bdc.statut === "termine"
                                ? "Déjà généré"
                                : "Générer Commandes Fournisseurs"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            {bdc.statut === "brouillon"
                              ? "Le responsable commercial doit d'abord transmettre ce BDC"
                              : bdc.statut === "en_cours" || bdc.statut === "termine"
                              ? "Les commandes fournisseurs ont déjà été générées"
                              : "Crée une commande par fournisseur à partir des lignes de ce bon de commande"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      </TooltipProvider>
                    </CardContent>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
