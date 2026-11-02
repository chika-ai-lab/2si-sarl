import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone, RefreshCcw, Plus, Loader2, Send, Tag, Info, Wallet, AlertTriangle, CheckCircle2, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "../services/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

type TypeCampagne = "promotion" | "information" | "relance";

interface Cible { banques?: string[]; categories?: string[]; montantMin?: number }

interface Campagne {
  id: number;
  nom: string;
  type: TypeCampagne;
  statut: "en_cours" | "terminee";
  nbDestinataires: number;
  nbEnvoyes: number;
  nbRemis: number;
  nbLus: number;
  nbEchecs: number;
  userNom?: string | null;
  createdAt: string;
  message: string;
  sujet?: string | null;
}

interface Destinataire {
  id: number;
  nom: string;
  telephone: string;
  montantDu?: string | number | null;
  statut: string;
  erreur?: string | null;
}

interface Quota { sentToday: number; dailyLimit: number; monthlyAvailable: number; pending: number }

interface Options {
  banques: { valeur: string; n: number }[];
  categories: { valeur: string; n: number }[];
  relance: { clients: number; total: number };
  quota: Quota | null;
}

interface Apercu {
  joignables: number;
  sansNumero: number;
  exemples: { nom: string; telephone: string; message: string }[];
  variablesInconnues: string[];
  disponible: number | null;
  depasseQuota: boolean;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const TYPES: Record<TypeCampagne, { label: string; description: string; icon: typeof Tag; modele: string }> = {
  promotion: {
    label: "Promotion",
    description: "Offres, nouveautés, opérations commerciales.",
    icon: Tag,
    modele:
      "Bonjour {prenom},\n\nDécouvrez nos offres du moment chez 2SI : équipements payables en plusieurs fois.\n\nCatalogue : https://www.sen-services.com",
  },
  information: {
    label: "Information",
    description: "Horaires, changement d'adresse, annonce de service.",
    icon: Info,
    modele: "Bonjour {prenom},\n\n",
  },
  relance: {
    label: "Relance de paiement",
    description: "Clients ayant une facture non soldée.",
    icon: Wallet,
    modele:
      "Bonjour {prenom},\n\nSauf erreur de notre part, il reste {montant_du} à régler sur votre commande 2SI ({factures}).\n\nMerci de régulariser ou de nous contacter au 33 864 48 48. Si le règlement est déjà fait, ne tenez pas compte de ce message.",
  },
};

const VARIABLES: Record<TypeCampagne, string[]> = {
  promotion: ["prenom", "nom"],
  information: ["prenom", "nom"],
  relance: ["prenom", "nom", "montant_du", "factures"],
};

const STATUT_DEST: Record<string, { label: string; className: string }> = {
  a_envoyer: { label: "En file",  className: "bg-muted text-muted-foreground border-border" },
  queued:    { label: "Envoyé",   className: "bg-blue-50 text-blue-800 border-blue-200" },
  sent:      { label: "Envoyé",   className: "bg-blue-50 text-blue-800 border-blue-200" },
  delivered: { label: "Remis",    className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  read:      { label: "Lu",       className: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  failed:    { label: "Échec",    className: "bg-red-50 text-red-800 border-red-200" },
  refused:   { label: "Refusé",   className: "bg-amber-50 text-amber-800 border-amber-200" },
  erreur:    { label: "Erreur",   className: "bg-red-50 text-red-800 border-red-200" },
};

const fcfa = (n: number) => `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CampagnesPage() {
  const qc = useQueryClient();
  const [nouvelle, setNouvelle] = useState(false);
  const [ouverte, setOuverte] = useState<number | null>(null);

  const { data: campagnes = [], isLoading, refetch } = useQuery({
    queryKey: ["campagnes"],
    queryFn: () => apiClient.get<Campagne[]>("/campagnes"),
    // Pendant un envoi, la liste suit l'avancement.
    refetchInterval: (q) => ((q.state.data as Campagne[] | undefined)?.some((c) => c.statut === "en_cours") ? 4000 : false),
  });

  const { data: options } = useQuery({
    queryKey: ["campagnes-options"],
    queryFn: () => apiClient.get<Options>("/campagnes/options"),
    staleTime: 60_000,
  });

  const quota = options?.quota;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
          <p className="text-sm text-muted-foreground">
            Messages WhatsApp à vos clients : promotions, informations et relances de paiement.
          </p>
          {quota && (
            <p className="text-xs text-muted-foreground mt-1">
              Quota WhatsApp : {quota.sentToday}/{quota.dailyLimit} aujourd'hui · {quota.monthlyAvailable} restants ce mois
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ["campagnes-options"] }); }}>
            <RefreshCcw className="h-4 w-4 mr-1.5" />Actualiser
          </Button>
          <Button onClick={() => setNouvelle(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Nouvelle campagne
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : campagnes.length === 0 ? (
        <div className="rounded-xl border bg-card py-14 text-center space-y-3">
          <Megaphone className="h-9 w-9 mx-auto text-muted-foreground/50" />
          <div>
            <p className="font-medium">Aucune campagne pour l'instant</p>
            <p className="text-sm text-muted-foreground">
              Envoyez une offre, une information ou une relance de paiement à vos clients par WhatsApp.
            </p>
          </div>
          <Button onClick={() => setNouvelle(true)}><Plus className="h-4 w-4 mr-1.5" />Nouvelle campagne</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {campagnes.map((c) => <LigneCampagne key={c.id} c={c} onOuvrir={() => setOuverte(c.id)} />)}
        </div>
      )}

      {nouvelle && (
        <NouvelleCampagne
          options={options}
          onFermer={() => setNouvelle(false)}
          onCreee={(id) => {
            setNouvelle(false);
            qc.invalidateQueries({ queryKey: ["campagnes"] });
            qc.invalidateQueries({ queryKey: ["campagnes-options"] });
            setOuverte(id);
          }}
        />
      )}

      {ouverte !== null && <DetailCampagne id={ouverte} onFermer={() => setOuverte(null)} />}
    </div>
  );
}

// ─── Ligne de la liste ───────────────────────────────────────────────────────

function LigneCampagne({ c, onOuvrir }: { c: Campagne; onOuvrir: () => void }) {
  const T = TYPES[c.type];
  const traites = c.nbEnvoyes + c.nbEchecs;
  const progression = c.nbDestinataires ? Math.round((traites / c.nbDestinataires) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onOuvrir}
      className="w-full text-left rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <T.icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm truncate">{c.nom}</span>
            <Badge variant="outline" className="text-[11px]">{T.label}</Badge>
            {c.statut === "en_cours" ? (
              <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-800 border-blue-200">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />Envoi en cours
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-800 border-emerald-200">Terminée</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(c.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
            {c.userNom ? ` · ${c.userNom}` : ""}
          </p>
        </div>
        <dl className="grid grid-cols-5 gap-4 text-center shrink-0">
          {[
            ["Clients", c.nbDestinataires],
            ["Envoyés", c.nbEnvoyes],
            ["Remis", c.nbRemis],
            ["Lus", c.nbLus],
            ["Échecs", c.nbEchecs],
          ].map(([l, v]) => (
            <div key={l as string}>
              <dt className="text-[11px] text-muted-foreground">{l}</dt>
              <dd className={cn("text-sm font-semibold tabular-nums", l === "Échecs" && Number(v) > 0 && "text-red-700")}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      {c.statut === "en_cours" && (
        <div className="h-1 rounded-full bg-muted mt-3 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progression}%` }} />
        </div>
      )}
    </button>
  );
}

// ─── Nouvelle campagne ───────────────────────────────────────────────────────

function NouvelleCampagne({ options, onFermer, onCreee }: {
  options?: Options;
  onFermer: () => void;
  onCreee: (id: number) => void;
}) {
  const [type, setType] = useState<TypeCampagne>("promotion");
  const [nom, setNom] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState(TYPES.promotion.modele);
  const [imageUrl, setImageUrl] = useState("");
  const [banques, setBanques] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [montantMin, setMontantMin] = useState("");
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [calcul, setCalcul] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const cible: Cible = useMemo(() => ({
    ...(banques.length ? { banques } : {}),
    ...(categories.length ? { categories } : {}),
    ...(type === "relance" && Number(montantMin) > 0 ? { montantMin: Number(montantMin) } : {}),
  }), [banques, categories, montantMin, type]);

  // Aperçu recalculé après une courte pause de saisie.
  useEffect(() => {
    setCalcul(true);
    const t = setTimeout(async () => {
      try {
        setApercu(await apiClient.post<Apercu>("/campagnes/apercu", { type, message, cible }));
      } catch {
        setApercu(null);
      } finally {
        setCalcul(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [type, message, cible]);

  const changerType = (t: TypeCampagne) => {
    // Le modèle n'est remplacé que s'il n'a pas été retouché.
    if (Object.values(TYPES).some((x) => x.modele === message) || !message.trim()) setMessage(TYPES[t].modele);
    if (t === "relance") setImageUrl("");
    setType(t);
  };

  const inserer = (v: string) => setMessage((m) => `${m}{${v}}`);
  const basculer = (liste: string[], set: (l: string[]) => void, v: string) =>
    set(liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);

  const bloquant =
    !nom.trim() ? "Donnez un nom à la campagne."
    : !message.trim() ? "Le message est vide."
    : !apercu ? null
    : apercu.variablesInconnues.length ? `Variable inconnue : ${apercu.variablesInconnues.map((v) => `{${v}}`).join(", ")}`
    : apercu.joignables === 0 ? "Aucun client joignable avec cette cible."
    : apercu.depasseQuota ? `Quota insuffisant : ${apercu.disponible} messages disponibles aujourd'hui.`
    : null;

  const envoyer = async () => {
    setConfirmer(false);
    setEnvoi(true);
    try {
      const c = await apiClient.post<Campagne>("/campagnes", {
        type, nom, message, cible,
        ...(sujet.trim() ? { sujet } : {}),
        ...(imageUrl.trim() ? { imageUrl } : {}),
      });
      toast({ title: "Campagne lancée", description: `${c.nbDestinataires} message(s) en cours d'envoi.` });
      onCreee(c.id);
    } catch (err) {
      toast({ title: "Envoi impossible", description: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && !envoi && onFermer()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne WhatsApp</DialogTitle>
            <DialogDescription>Rien ne part avant votre confirmation.</DialogDescription>
          </DialogHeader>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* ── Saisie ── */}
            <div className="space-y-5">
              <section className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {(Object.keys(TYPES) as TypeCampagne[]).map((t) => {
                    const T = TYPES[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => changerType(t)}
                        aria-pressed={type === t}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors",
                          type === t ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/40",
                        )}
                      >
                        <T.icon className="h-4 w-4 mb-1.5 text-muted-foreground" />
                        <p className="text-sm font-medium">{T.label}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{T.description}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-1.5">
                <Label htmlFor="cp-nom" className="text-xs text-muted-foreground">Nom de la campagne</Label>
                <Input id="cp-nom" value={nom} onChange={(e) => setNom(e.target.value)}
                  placeholder={type === "relance" ? "Relance novembre" : "Promo fin d'année"} maxLength={150} />
              </section>

              <section className="space-y-2">
                <Label className="text-xs text-muted-foreground">Cible</Label>
                {type === "relance" && options && (
                  <p className="text-xs text-muted-foreground">
                    {options.relance.clients} client(s) avec une facture non soldée, pour {fcfa(options.relance.total)} au total.
                  </p>
                )}
                {!!options?.banques.length && (
                  <Puces titre="Banque / agence" valeurs={options.banques} choisies={banques}
                    onBasculer={(v) => basculer(banques, setBanques, v)} />
                )}
                {!!options?.categories.length && (
                  <Puces titre="Catégorie" valeurs={options.categories} choisies={categories}
                    onBasculer={(v) => basculer(categories, setCategories, v)} />
                )}
                {type === "relance" && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cp-min" className="text-xs whitespace-nowrap">Reste dû minimum</Label>
                    <Input id="cp-min" inputMode="numeric" value={montantMin} className="h-8 w-40"
                      onChange={(e) => setMontantMin(e.target.value.replace(/\D/g, ""))} placeholder="0" />
                    <span className="text-xs text-muted-foreground">FCFA</span>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">Sans filtre, tous les clients actifs sont visés.</p>
              </section>

              <section className="space-y-1.5">
                <div className="flex items-end justify-between gap-2 flex-wrap">
                  <Label htmlFor="cp-msg" className="text-xs text-muted-foreground">Message</Label>
                  <div className="flex gap-1 flex-wrap">
                    {VARIABLES[type].map((v) => (
                      <button key={v} type="button" onClick={() => inserer(v)}
                        className="text-[11px] font-mono rounded border px-1.5 py-0.5 hover:bg-muted">
                        {`{${v}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <Input value={sujet} onChange={(e) => setSujet(e.target.value)} maxLength={200}
                  placeholder="Objet (facultatif, affiché en gras)" className="h-9" />
                <Textarea id="cp-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={8} maxLength={3500} />
                <p className="text-[11px] text-muted-foreground text-right tabular-nums">{message.length}/3500</p>
                {type !== "relance" && (
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image (facultatif) : adresse https://… d'une photo en ligne" className="h-9" />
                )}
              </section>
            </div>

            {/* ── Aperçu ── */}
            <aside className="space-y-3 lg:sticky lg:top-0 self-start">
              <div className="rounded-lg border p-3 space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />Destinataires
                  {calcul && <Loader2 className="h-3 w-3 animate-spin" />}
                </p>
                <p className="text-2xl font-semibold tabular-nums">{apercu?.joignables ?? "—"}</p>
                {!!apercu?.sansNumero && (
                  <p className="text-xs text-muted-foreground">{apercu.sansNumero} client(s) sans numéro valide, exclus.</p>
                )}
                {apercu?.disponible != null && (
                  <p className={cn("text-xs", apercu.depasseQuota ? "text-red-700" : "text-muted-foreground")}>
                    {apercu.disponible} message(s) disponibles aujourd'hui.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Aperçu</p>
                {apercu?.exemples.length ? apercu.exemples.map((e) => (
                  <div key={e.telephone} className="rounded-lg bg-[#e7f6e7] dark:bg-emerald-950/40 p-3 text-sm space-y-1">
                    <p className="text-[11px] text-muted-foreground">{e.nom}</p>
                    {sujet.trim() && <p className="font-semibold">{sujet}</p>}
                    <p className="whitespace-pre-wrap break-words leading-snug">{e.message}</p>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">Aucun destinataire à prévisualiser.</p>
                )}
              </div>
            </aside>
          </div>

          <DialogFooter className="items-center gap-2 sm:gap-2">
            {bloquant && (
              <p className="text-xs text-amber-800 flex items-center gap-1.5 mr-auto">
                <AlertTriangle className="h-3.5 w-3.5" />{bloquant}
              </p>
            )}
            <Button variant="outline" onClick={onFermer} disabled={envoi}>Annuler</Button>
            <Button onClick={() => setConfirmer(true)} disabled={!!bloquant || !apercu || calcul || envoi}>
              {envoi ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Envoyer à {apercu?.joignables ?? 0} client(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmer} onOpenChange={setConfirmer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer la campagne « {nom} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {apercu?.joignables} client(s) vont recevoir ce message sur WhatsApp. Un envoi ne peut pas être annulé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revenir</AlertDialogCancel>
            <AlertDialogAction onClick={envoyer}>Envoyer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Puces({ titre, valeurs, choisies, onBasculer }: {
  titre: string;
  valeurs: { valeur: string; n: number }[];
  choisies: string[];
  onBasculer: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">{titre}</p>
      <div className="flex flex-wrap gap-1.5">
        {valeurs.map(({ valeur, n }) => {
          const actif = choisies.includes(valeur);
          return (
            <button key={valeur} type="button" onClick={() => onBasculer(valeur)} aria-pressed={actif}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                actif ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
              )}>
              {valeur} <span className="opacity-70 tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Détail ──────────────────────────────────────────────────────────────────

function DetailCampagne({ id, onFermer }: { id: number; onFermer: () => void }) {
  const qc = useQueryClient();
  const [maj, setMaj] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campagne", id],
    queryFn: () => apiClient.get<Campagne & { destinataires: Destinataire[] }>(`/campagnes/${id}`),
    refetchInterval: (q) => ((q.state.data as Campagne | undefined)?.statut === "en_cours" ? 3000 : false),
  });

  const rafraichir = async () => {
    setMaj(true);
    try {
      await apiClient.post(`/campagnes/${id}/rafraichir`);
      await refetch();
      qc.invalidateQueries({ queryKey: ["campagnes"] });
    } finally {
      setMaj(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.nom ?? "Campagne"}</DialogTitle>
          {data && (
            <DialogDescription>
              {TYPES[data.type].label} · {new Date(data.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              {data.userNom ? ` · ${data.userNom}` : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading || !data ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm">
                <span className="font-medium tabular-nums">{data.nbRemis}</span> remis ·{" "}
                <span className="font-medium tabular-nums">{data.nbLus}</span> lus ·{" "}
                <span className={cn("font-medium tabular-nums", data.nbEchecs > 0 && "text-red-700")}>{data.nbEchecs}</span> échec(s)
                {" "}sur {data.nbDestinataires}
              </p>
              <Button size="sm" variant="outline" onClick={rafraichir} disabled={maj}>
                {maj ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                Mettre à jour les statuts
              </Button>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    {data.type === "relance" && <TableHead className="text-right">Reste dû</TableHead>}
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.destinataires.map((d) => {
                    const s = STATUT_DEST[d.statut] ?? STATUT_DEST.a_envoyer;
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm">{d.nom}</TableCell>
                        <TableCell className="text-sm tabular-nums text-muted-foreground">{d.telephone}</TableCell>
                        {data.type === "relance" && (
                          <TableCell className="text-sm text-right tabular-nums">
                            {d.montantDu != null ? fcfa(Number(d.montantDu)) : "—"}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[11px]", s.className)} title={d.erreur ?? undefined}>
                            {s.label}
                          </Badge>
                          {d.erreur && <p className="text-[11px] text-muted-foreground mt-0.5">{d.erreur}</p>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Modèle envoyé</p>
              {data.sujet && <p className="font-semibold">{data.sujet}</p>}
              <p className="whitespace-pre-wrap">{data.message}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onFermer}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
