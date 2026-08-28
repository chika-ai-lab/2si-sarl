import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck, PackageCheck, Search, RefreshCcw, Printer, MoreHorizontal,
  AlertTriangle, XCircle, MapPin, Phone, User, Loader2, Inbox, History, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/modules/commercial/services/apiClient";
import {
  BordereauxService, BL_STATUT, FILES,
  type Bordereau, type FileId, type ExpedierPayload, type LivrerPayload,
} from "../services/bordereaux.service";
import { ExpedierDialog, LivrerDialog, MotifDialog } from "../components/LivraisonDialogs";
import BLFicheExpeditionPDF from "../components/BLFicheExpeditionPDF";
import { HistoriqueTimeline } from "@/components/business/HistoriqueTimeline";
import { VirtualList } from "@/components/business/VirtualList";
import { nomClient as formatNomClient } from "@/lib/client-nom";

/**
 * Livraisons — écran unique du parcours.
 *
 * Il remplace les deux écrans concurrents d'avant (« Livraisons » qui mutait
 * directement l'état des commandes sans rien enregistrer, et « Bordereaux »
 * dont le premier bouton confirmait la livraison sous un libellé trompeur).
 *
 * Règle d'interface : une seule action principale par ligne, toujours au même
 * endroit, dont le libellé nomme le résultat. Tout le reste passe derrière « ⋯ ».
 */

const BORDEREAUX_KEY = ["bordereaux"] as const;

/**
 * L'API sérialise les entités TypeORM en camelCase (`nomComplet`), pas en
 * snake_case comme les colonnes. Lire `nom_complet` renvoyait toujours
 * undefined et la carte retombait sur le nom de famille seul.
 */
interface ClientLite {
  id: number;
  nomComplet?: string;
  nom?: string;
  prenom?: string;
  raisonSociale?: string;
  telephone?: string;
  adresse?: string;
}

export function LivraisonsPage() {
  const qc = useQueryClient();

  const [file, setFile]     = useState<FileId>("a_expedier");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [expedier, setExpedier] = useState<Bordereau | null>(null);
  const [livrer, setLivrer]     = useState<Bordereau | null>(null);
  const [motif, setMotif]       = useState<{ bl: Bordereau; variante: "echec" | "annule" } | null>(null);
  const [imprimeId, setImprimeId] = useState<number | null>(null);
  const [historiqueId, setHistoriqueId] = useState<number | null>(null);
  const [ouvertId, setOuvertId] = useState<number | null>(null);

  const { data: bordereaux = [], isLoading, refetch } = useQuery({
    queryKey: BORDEREAUX_KEY,
    queryFn: async () => (await BordereauxService.getAll({ per_page: 200 })).data,
    staleTime: 1000 * 60,
  });

  // Les bordereaux ne portent qu'un client_id : on résout les noms une fois.
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-lite"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/clients", { per_page: 500 });
      return (Array.isArray(r) ? r : (r?.data ?? [])) as ClientLite[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients],
  );

  const nomClient = (bl: Bordereau) =>
    formatNomClient(bl.clientId ? clientMap.get(bl.clientId) : undefined);

  const compteurs = useMemo(() => {
    const out = {} as Record<FileId, number>;
    for (const f of FILES) out[f.id] = bordereaux.filter((b) => f.etats.includes(b.etat)).length;
    return out;
  }, [bordereaux]);

  const visibles = useMemo(() => {
    const etats = FILES.find((f) => f.id === file)!.etats;
    const q = search.trim().toLowerCase();
    return bordereaux
      .filter((b) => etats.includes(b.etat))
      .filter((b) => !q
        || (b.num ?? "").toLowerCase().includes(q)
        || nomClient(b).toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  }, [bordereaux, file, search, clientMap]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const run = async (bl: Bordereau, fn: () => Promise<unknown>, succes: string) => {
    setBusyId(bl.id);
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: BORDEREAUX_KEY });
      qc.invalidateQueries({ queryKey: ["bon-commandes"] });
      toast({ title: succes });
      setExpedier(null); setLivrer(null); setMotif(null);
    } catch (e: any) {
      // Le serveur renvoie un message explicite quand la transition est refusée.
      toast({ title: "Action impossible", description: e?.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Livraisons</h1>
          <p className="text-sm text-muted-foreground">
            Tout le parcours de livraison, du départ du dépôt à la remise au client.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 mr-1.5" />Actualiser
        </Button>
      </div>

      <Tabs value={file} onValueChange={(v) => setFile(v as FileId)}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          {FILES.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="py-2 gap-1.5">
              {f.label}
              <span className="text-xs opacity-70 tabular-nums">({compteurs[f.id] ?? 0})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher un bordereau ou un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="h-9 w-9 opacity-40" />
          <p className="text-sm">
            {search ? "Aucun bordereau ne correspond à cette recherche." : "Rien dans cette file."}
          </p>
        </div>
      ) : (
        // Au-delà de 60 bordereaux, seules les lignes visibles sont rendues.
        <VirtualList
          items={visibles}
          cle={(bl) => bl.id}
          hauteurEstimee={132}
          className="max-h-[calc(100vh-22rem)] min-h-[24rem]"
          renderItem={(bl) => (
            <LigneBordereau
              bl={bl}
              client={nomClient(bl)}
              telephone={bl.clientId ? clientMap.get(bl.clientId)?.telephone : undefined}
              busy={busyId === bl.id}
              ouvert={ouvertId === bl.id}
              onToggle={() => setOuvertId((id) => (id === bl.id ? null : bl.id))}
              onExpedier={() => setExpedier(bl)}
              onLivrer={() => setLivrer(bl)}
              onEchec={() => setMotif({ bl, variante: "echec" })}
              onAnnuler={() => setMotif({ bl, variante: "annule" })}
              onImprimer={() => setImprimeId(bl.id)}
              onHistorique={() => setHistoriqueId(bl.id)}
            />
          )}
        />
      )}

      {/* ── Dialogues ── */}
      <ExpedierDialog
        open={!!expedier}
        onClose={() => setExpedier(null)}
        reference={expedier?.num ?? ""}
        client={expedier ? nomClient(expedier) : ""}
        busy={busyId === expedier?.id}
        onConfirm={(p: ExpedierPayload) =>
          expedier && run(expedier, () => BordereauxService.expedier(expedier.id, p), "Bordereau expédié")}
      />

      <LivrerDialog
        open={!!livrer}
        onClose={() => setLivrer(null)}
        reference={livrer?.num ?? ""}
        client={livrer ? nomClient(livrer) : ""}
        busy={busyId === livrer?.id}
        onConfirm={(p: LivrerPayload) =>
          livrer && run(livrer, () => BordereauxService.livrer(livrer.id, p), "Livraison confirmée")}
      />

      <MotifDialog
        open={!!motif}
        onClose={() => setMotif(null)}
        reference={motif?.bl.num ?? ""}
        client={motif ? nomClient(motif.bl) : ""}
        busy={busyId === motif?.bl.id}
        variante={motif?.variante ?? "echec"}
        onConfirm={(m) => {
          if (!motif) return;
          const { bl, variante } = motif;
          return variante === "echec"
            ? run(bl, () => BordereauxService.echec(bl.id, m), "Échec enregistré")
            : run(bl, () => BordereauxService.annuler(bl.id, m), "Bordereau annulé");
        }}
      />

      {/* Chronologie du bordereau — chaque transition, son auteur, son motif. */}
      <Dialog open={historiqueId !== null} onOpenChange={(o) => !o && setHistoriqueId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Historique du bordereau</DialogTitle>
            <DialogDescription>
              Chronologie des changements de statut, avec leur auteur et leur motif.
            </DialogDescription>
          </DialogHeader>
          {historiqueId !== null && (
            <HistoriqueTimeline
              entite="bordereau_livraison"
              entiteId={historiqueId}
              titre="Historique du bordereau"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bon de livraison assemblé par le serveur — produits réels compris. */}
      <Dialog open={imprimeId !== null} onOpenChange={(o) => !o && setImprimeId(null)}>
        <DialogContent className="max-w-5xl p-0 gap-0 w-[calc(100%-2rem)]">
          {/* Le document porte son propre en-tête visuel ; le titre et la
              description restent nécessaires aux lecteurs d'écran. */}
          <DialogHeader className="sr-only">
            <DialogTitle>Bon de livraison</DialogTitle>
            <DialogDescription>
              Aperçu imprimable du bon de livraison, avec le destinataire, le transporteur
              et les produits à remettre.
            </DialogDescription>
          </DialogHeader>
          {imprimeId !== null && (
            <BLFicheExpeditionPDF blId={imprimeId} onClose={() => setImprimeId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Ligne ────────────────────────────────────────────────────────────────────

/**
 * Lignes du bordereau, dépliées à la demande.
 *
 * Même source que le document imprimé : ce qu'on lit à l'écran est exactement ce
 * que le chauffeur emporte. La requête n'est lancée qu'à l'ouverture.
 */
function LignesBordereau({ blId }: { blId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bordereau-lignes", blId],
    queryFn: () => BordereauxService.getFiche(blId),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="px-4 pb-4 space-y-1.5">
      {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-7" />)}
    </div>;
  }
  if (error) {
    return <p className="px-4 pb-4 text-sm text-destructive">
      Impossible de charger le contenu de ce bordereau.
    </p>;
  }

  const produits = data?.produits ?? [];
  if (produits.length === 0) {
    return <p className="px-4 pb-4 text-sm text-muted-foreground">
      Aucun produit rattaché à ce bordereau.
    </p>;
  }

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[380px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-1.5 text-left font-semibold">Désignation</th>
              <th className="py-1.5 text-left font-semibold w-28">Référence</th>
              <th className="py-1.5 text-right font-semibold w-14">Qté</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {produits.map((p, i) => (
              <tr key={`${p.designation}-${i}`}>
                <td className="py-1.5 pr-3">{p.designation}</td>
                <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">
                  {p.reference ?? "—"}
                </td>
                <td className="py-1.5 text-right tabular-nums font-medium">{p.quantite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.client?.adresse && (
        <p className="text-xs text-muted-foreground mt-2 inline-flex items-start gap-1">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
          {data.client.adresse}
        </p>
      )}
    </div>
  );
}

function LigneBordereau({
  bl, client, telephone, busy, ouvert, onToggle,
  onExpedier, onLivrer, onEchec, onAnnuler, onImprimer, onHistorique,
}: {
  bl: Bordereau;
  client: string;
  telephone?: string;
  busy: boolean;
  ouvert: boolean;
  onToggle: () => void;
  onExpedier: () => void;
  onLivrer: () => void;
  onEchec: () => void;
  onAnnuler: () => void;
  onImprimer: () => void;
  onHistorique: () => void;
}) {
  const statut = BL_STATUT[bl.etat];

  // L'action principale découle du statut. Une seule, jamais deux.
  const principale =
    bl.etat === "en_attente" || bl.etat === "echec"
      ? { label: "Expédier", icon: Truck, onClick: onExpedier }
      : bl.etat === "expedie"
      ? { label: "Confirmer la livraison", icon: PackageCheck, onClick: onLivrer }
      : null;

  const Icon = principale?.icon;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Déplier révèle le contenu du bordereau, comme sur un bon de commande. */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={ouvert}
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", ouvert && "rotate-90")} />
            <span className="font-mono text-sm font-semibold">{bl.num ?? `BL #${bl.id}`}</span>
          </button>
          <Badge variant="outline" className={cn("text-[11px]", statut.className)}>
            {statut.label}
          </Badge>
        </div>

        <p className="font-medium text-sm truncate">{client}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {telephone && (
            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{telephone}</span>
          )}
          {bl.note && (
            <span className="inline-flex items-center gap-1 truncate max-w-[26ch]">
              <MapPin className="h-3 w-3 shrink-0" />{bl.note}
            </span>
          )}
          {bl.livreurNom && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />{bl.livreurNom}
              {bl.vehiculeMatricule ? ` · ${bl.vehiculeMatricule}` : ""}
            </span>
          )}
          {bl.recuPar && (
            <span className="inline-flex items-center gap-1">
              <PackageCheck className="h-3 w-3" />Reçu par {bl.recuPar}
            </span>
          )}
        </div>

        {bl.etat === "echec" && bl.motif && (
          <p className="text-xs text-red-700 dark:text-red-400 inline-flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{bl.motif}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {principale && (
          <Button size="sm" disabled={busy} onClick={principale.onClick}>
            {busy
              ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              : Icon && <Icon className="h-4 w-4 mr-1.5" />}
            {principale.label}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Autres actions" disabled={busy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onImprimer}>
              <Printer className="h-4 w-4 mr-2" />Imprimer le bon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onHistorique}>
              <History className="h-4 w-4 mr-2" />Voir l'historique
            </DropdownMenuItem>
            {bl.etat === "expedie" && (
              <DropdownMenuItem onClick={onEchec}>
                <AlertTriangle className="h-4 w-4 mr-2" />Signaler un échec
              </DropdownMenuItem>
            )}
            {(bl.etat === "en_attente" || bl.etat === "echec") && (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onAnnuler}>
                <XCircle className="h-4 w-4 mr-2" />Annuler le bordereau
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {ouvert && <LignesBordereau blId={bl.id} />}
    </div>
  );
}

export default LivraisonsPage;
